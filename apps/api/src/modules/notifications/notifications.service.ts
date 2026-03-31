import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
  private logger = new Logger(NotificationsService.name);
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

    // FCM 전송 (data 안에 로고 URL 포함 가능)
    await this.fcmService.sendToMultipleDevices(
      user.fcmTokens,
      dto.title,
      dto.body,
      dto.data,
    );

    await this.notificationModel.create({
      userId: user._id,
      type: dto.data?.type || 'general',
      title: { uz: dto.title, ru: dto.title, en: dto.title },
      body: { uz: dto.body, ru: dto.body, en: dto.body },
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

    const notifications = users.map((user) => ({
      userId: user._id,
      type: dto.data?.type || 'general',
      title: { uz: dto.title, ru: dto.title, en: dto.title },
      body: { uz: dto.body, ru: dto.body, en: dto.body },
      data: dto.data,
      isRead: false,
      sentAt: new Date(),
    }));

    await this.notificationModel.insertMany(notifications);

    return { message: `${users.length}명에게 알림이 전송되었습니다` };
  }

  async sendToAll(dto: SendNotificationDto) {
    await this.fcmService.sendToTopic(
      'all_users',
      dto.title,
      dto.body,
      dto.data,
    );

    await this.notificationModel.create({
      userId: null,
      type: dto.data?.type || 'general',
      title: { uz: dto.title, ru: dto.title, en: dto.title },
      body: { uz: dto.body, ru: dto.body, en: dto.body },
      data: dto.data,
      isRead: false,
      sentAt: new Date(),
    });

    return { message: '전체 알림이 전송되었습니다' };
  }

  // 경기 시작 알림 (로고 파라미터 추가)
  async sendMatchStartNotification(
    matchId: string,
    homeTeam: string,
    awayTeam: string,
    logoUrl?: string,
  ) {
    const users = await this.userModel.find({
      $or: [
        { 'notificationSettings.matchStart': true },
        // { matchAlerts: { $elemMatch: { matchId, matchStart: true } } },
      ],
    });

    const validUsers = (
      await Promise.all(
        users.map(async (u) => {
          const sent = await this.notificationModel.findOne({
            userId: u._id,
            'data.referenceId': matchId,
            type: 'matchStart',
          });
          return sent ? null : u;
        }),
      )
    ).filter(Boolean);

    if (validUsers.length === 0) return;

    const tokens = validUsers.flatMap((u) => u!.fcmTokens);
    const titleText = `${homeTeam} vs ${awayTeam}`;
    const bodyText = '경기가 곧 시작됩니다!';

    await this.fcmService.sendToMultipleDevices(tokens, titleText, bodyText, {
      type: 'matchStart',
      screen: 'Match',
      referenceId: matchId,
      logoUrl: logoUrl || '',
    });

    const notifications = validUsers.map((u) => ({
      userId: u!._id,
      type: 'matchStart',
      title: { uz: titleText, ru: titleText, en: titleText, kr: titleText },
      body: {
        uz: "O'yin boshlanadi!",
        ru: 'Матч начинается!',
        en: 'Match starts!',
        kr: bodyText,
      },
      data: { screen: 'Match', referenceId: matchId },
      isRead: false,
      sentAt: new Date(),
    }));

    await this.notificationModel.insertMany(notifications);
  }

  // 골 알림 (득점팀 로고 추가)
  async sendGoalNotification(
    matchId: string,
    homeTeam: string,
    awayTeam: string,
    scorerName: string,
    homeScore: number,
    awayScore: number,
    scoringTeamLogo: string,
  ) {
    const users = await this.userModel.find({
      'notificationSettings.goal': true,
    });
    if (users.length === 0) return;

    const titleText = `⚽ ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`;
    const bodyText = `${scorerName} 골!`;

    await this.fcmService.sendToMultipleDevices(
      users.flatMap((u) => u.fcmTokens),
      titleText,
      bodyText,
      {
        type: 'goal',
        screen: 'Match',
        referenceId: matchId,
        logoUrl: scoringTeamLogo,
      },
    );

    const notifications = users.map((u) => ({
      userId: u._id,
      type: 'goal',
      title: { uz: titleText, ru: titleText, en: titleText, kr: titleText },
      body: {
        uz: `${scorerName} gol urdi!`,
        ru: `${scorerName} забил!`,
        en: `${scorerName} scored!`,
        kr: bodyText,
      },
      data: { screen: 'Match', referenceId: matchId },
      isRead: false,
      sentAt: new Date(),
    }));
    await this.notificationModel.insertMany(notifications);
  }

  async sendMatchEndNotification(
    matchId: string,
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
      'Match Finish!',
      {
        type: 'matchEnd',
        screen: 'Match',
        referenceId: matchId.toString(),
        logoUrl: 'https://cdn-icons-png.flaticon.com/512/1165/1165183.png',
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
      data: { screen: 'Match', referenceId: matchId.toString() },
      isRead: false,
      sentAt: new Date(),
    }));

    await this.notificationModel.insertMany(notifications);
  }

  async getUserNotifications(userId: string, limit: number = 20) {
    return this.notificationModel
      .find({
        $or: [{ userId }, { userId: null }],
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
    // ⚽️ 1. Expo 토큰인지 확인해서 차단하기
    if (!token || token.startsWith('ExponentPushToken')) {
      this.logger.warn(`Expo token detected and skipped: ${token}`);
      // 에러를 던지지 않고 그냥 정상 응답을 줘서 프론트 에러를 막음
      return { message: 'Expo token is not supported for FCM' };
    }
    console.log(userId);
    console.log(token);
    // ⚽️ 2. 진짜 FCM 토큰일 때만 DB에 저장 (중복 방지 포함)
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: token },
    });

    return { message: 'FCM 토큰 저장 완료' };
  }
}
