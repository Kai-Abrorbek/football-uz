import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from '../../schemas/notification.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { FcmService } from './fcm.service';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private fcmService: FcmService,
  ) {}

  async sendToUser(userId: string, dto: SendNotificationDto) {
    const user = await this.userModel.findById(userId);
    if (!user || user.fcmTokens.length === 0) {
      throw new NotFoundException('유저 FCM 토큰이 없습니다');
    }

    // FCM 전송
    await this.fcmService.sendToMultipleDevices(
      user.fcmTokens,
      dto.title,
      dto.body,
      dto.data,
    );

    // DB 저장
    await this.notificationModel.create({
      userId: user._id,
      type: dto.data?.type || 'general',
      title: {
        uz: dto.title,
        ru: dto.title,
        en: dto.title,
      },
      body: {
        uz: dto.body,
        ru: dto.body,
        en: dto.body,
      },
      data: dto.data,
      isRead: false,
      sentAt: new Date(),
    });

    return { message: '알림이 전송되었습니다' };
  }

  async sendToMultipleUsers(userIds: string[], dto: SendNotificationDto) {
    const users = await this.userModel.find({ _id: { $in: userIds } });
    const allTokens = users.flatMap((u) => u.fcmTokens);

    if (allTokens.length === 0) {
      throw new NotFoundException('FCM 토큰이 없습니다');
    }

    await this.fcmService.sendToMultipleDevices(
      allTokens,
      dto.title,
      dto.body,
      dto.data,
    );

    // 각 유저별 알림 저장
    const notifications = users.map((user) => ({
      userId: user._id,
      type: dto.data?.type || 'general',
      title: {
        uz: dto.title,
        ru: dto.title,
        en: dto.title,
      },
      body: {
        uz: dto.body,
        ru: dto.body,
        en: dto.body,
      },
      data: dto.data,
      isRead: false,
      sentAt: new Date(),
    }));

    await this.notificationModel.insertMany(notifications);

    return { message: `${users.length}명에게 알림이 전송되었습니다` };
  }

  async sendToAll(dto: SendNotificationDto) {
    // 토픽 사용 (모든 유저)
    await this.fcmService.sendToTopic(
      'all_users',
      dto.title,
      dto.body,
      dto.data,
    );

    // 전체 유저에게 알림 저장
    await this.notificationModel.create({
      userId: null, // 전체 알림
      type: dto.data?.type || 'general',
      title: {
        uz: dto.title,
        ru: dto.title,
        en: dto.title,
      },
      body: {
        uz: dto.body,
        ru: dto.body,
        en: dto.body,
      },
      data: dto.data,
      isRead: false,
      sentAt: new Date(),
    });

    return { message: '전체 알림이 전송되었습니다' };
  }

  async sendMatchStartNotification(
    matchId: string,
    homeTeam: string,
    awayTeam: string,
  ) {
    // 해당 팀을 즐겨찾기한 유저 찾기
    const users = await this.userModel.find({
      $or: [
        // 전체 알람 ON + 경기별 알람 없음
        {
          'notificationSettings.matchStart': true,
          'matchAlerts.matchId': { $exists: false },
        },
        // 경기별 알람 ON
        {
          matchAlerts: {
            $elemMatch: {
              matchId: matchId,
              matchStart: true,
            },
          },
        },
      ],
    });

    if (users.length === 0) return;

    const tokens = users.flatMap((u) => u.fcmTokens);

    await this.fcmService.sendToMultipleDevices(
      tokens,
      `${homeTeam} vs ${awayTeam}`,
      '경기가 곧 시작됩니다!',
      {
        type: 'matchStart',
        screen: 'Match',
        referenceId: matchId.toString(),
      },
    );

    const notifications = users.map((user) => ({
      userId: user._id,
      type: 'matchStart',
      title: {
        uz: `${homeTeam} vs ${awayTeam}`,
        ru: `${homeTeam} vs ${awayTeam}`,
        en: `${homeTeam} vs ${awayTeam}`,
      },
      body: {
        uz: "O'yin tez orada boshlanadi!",
        ru: 'Матч скоро начнется!',
        en: 'Match starting soon!',
      },
      data: {
        screen: 'Match',
        referenceId: matchId.toString(),
      },
      isRead: false,
      sentAt: new Date(),
    }));

    await this.notificationModel.insertMany(notifications);
  }

  async getUserNotifications(userId: string, limit: number = 20) {
    return this.notificationModel
      .find({
        $or: [{ userId }, { userId: null }], // 개인 + 전체 알림
      })
      .sort({ sentAt: -1 })
      .limit(limit)
      .exec();
  }

  async markAsRead(notificationId: string) {
    await this.notificationModel.findByIdAndUpdate(notificationId, {
      isRead: true,
    });
    return { message: '읽음 처리되었습니다' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true },
    );
    return { message: '모든 알림이 읽음 처리되었습니다' };
  }

  async sendGoalNotification(
    matchId: number,
    homeTeam: string,
    awayTeam: string,
    scorerName: string,
    homeScore: number,
    awayScore: number,
  ) {
    const users = await this.userModel.find({
      'notificationSettings.goal': true,
    });

    if (users.length === 0) return;

    const tokens = users.flatMap((u) => u.fcmTokens);

    await this.fcmService.sendToMultipleDevices(
      tokens,
      `⚽ ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`,
      `${scorerName} 골!`,
      {
        type: 'goal',
        screen: 'Match',
        referenceId: matchId.toString(),
      },
    );

    const notifications = users.map((user) => ({
      userId: user._id,
      type: 'goal',
      title: {
        uz: `⚽ ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`,
        ru: `⚽ ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`,
        en: `⚽ ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`,
        kr: `⚽ ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`,
      },
      body: {
        uz: `${scorerName} gol urdi!`,
        ru: `${scorerName} забил гол!`,
        en: `${scorerName} scored!`,
        kr: `${scorerName} 골!`,
      },
      data: {
        screen: 'Match',
        referenceId: matchId.toString(),
      },
      isRead: false,
      sentAt: new Date(),
    }));

    await this.notificationModel.insertMany(notifications);
  }

  async sendMatchEndNotification(
    matchId: number,
    homeTeam: string,
    awayTeam: string,
    homeScore: number,
    awayScore: number,
  ) {
    const users = await this.userModel.find({
      'notificationSettings.matchEnd': true,
    });

    if (users.length === 0) return;

    const tokens = users.flatMap((u) => u.fcmTokens);

    await this.fcmService.sendToMultipleDevices(
      tokens,
      `🏁 ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`,
      '경기 종료!',
      {
        type: 'matchEnd',
        screen: 'Match',
        referenceId: matchId.toString(),
      },
    );

    const notifications = users.map((user) => ({
      userId: user._id,
      type: 'matchEnd',
      title: {
        uz: `🏁 ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`,
        ru: `🏁 ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`,
        en: `🏁 ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`,
        kr: `🏁 ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`,
      },
      body: {
        uz: `O'yin tugadi!`,
        ru: `Матч завершён!`,
        en: `Match finished!`,
        kr: `경기 종료!`,
      },
      data: {
        screen: 'Match',
        referenceId: matchId.toString(),
      },
      isRead: false,
      sentAt: new Date(),
    }));

    await this.notificationModel.insertMany(notifications);
  }

  async getMatchAlert(userId: string, matchId: string) {
    const user = await this.userModel.findById(userId);
    const alert = user?.matchAlerts?.find((a) => a.matchId === matchId);
    return alert ?? null;
  }

  async setMatchAlert(
    userId: string,
    matchId: string,
    settings: { matchStart: boolean; goals: boolean; matchEnd: boolean },
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');

    const existing = user.matchAlerts?.findIndex((a) => a.matchId === matchId);

    if (existing !== -1) {
      user.matchAlerts[existing] = { matchId, ...settings };
    } else {
      user.matchAlerts.push({ matchId, ...settings });
    }

    user.markModified('matchAlerts');
    await user.save();
    return user.matchAlerts.find((a) => a.matchId === matchId);
  }

  async deleteMatchAlert(userId: string, matchId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { matchAlerts: { matchId } },
    });
    return { message: '알람이 삭제되었습니다' };
  }

  async saveFcmToken(userId: string, token: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: token }, // 중복 방지
    });
    return { message: 'FCM 토큰 저장 완료' };
  }
}
