import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from '../../schemas/match.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { NotificationDocument, Team, TeamDocument } from '../../schemas';
import { Highlight, HighlightDocument } from '../../schemas/highlight.schema';
import { FcmService } from '../notifications/fcm.service';
import {
  NotificationHistory,
  NotificationHistoryDocument,
} from '../../schemas/notification-history.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(NotificationHistory.name)
    private notificationHistoryModel: Model<NotificationHistoryDocument>,
    @InjectModel(Highlight.name)
    private highlightModel: Model<HighlightDocument>,
    private fcmService: FcmService,
  ) {}

  // ─── 대시보드 ───────────────────────────────────────────────
  async getDashboard() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setUTCHours(23, 59, 59, 999);

    const [
      liveMatches,
      streamingMatches,
      totalHighlights,
      totalUsers,
      todayMatches,
    ] = await Promise.all([
      this.matchModel.countDocuments({
        'status.short': { $in: ['1H', 'HT', '2H', 'ET', 'BT', 'P'] },
      }),
      this.matchModel.countDocuments({ isStreaming: true }),
      this.highlightModel.countDocuments(),
      this.userModel.countDocuments(),
      this.matchModel.countDocuments({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
    ]);

    const recentUsers = await this.userModel
      .find()
      .select('username email createdAt isEmailVerified')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const liveMatchList = await this.matchModel
      .find({ 'status.short': { $in: ['1H', 'HT', '2H', 'ET', 'BT', 'P'] } })
      .select('homeTeam awayTeam goals status league isStreaming')
      .sort({ date: 1 })
      .lean();

    return {
      stats: {
        liveMatches,
        streamingMatches,
        totalHighlights,
        totalUsers,
        todayMatches,
      },
      liveMatchList,
      recentUsers,
    };
  }

  // ─── 경기 ────────────────────────────────────────────────────
  async getMatches(date?: string, week?: boolean, page = 1, limit = 30) {
    const filter: any = {};

    if (week) {
      const today = new Date();
      const mon = new Date(today);
      mon.setDate(today.getDate() - today.getDay() + 1);
      mon.setHours(0, 0, 0, 0);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      sun.setHours(23, 59, 59, 999);
      filter.date = { $gte: mon, $lte: sun };
    } else if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const [matches, total] = await Promise.all([
      this.matchModel
        .find(filter)
        .sort({ date: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.matchModel.countDocuments(filter),
    ]);

    return { matches, total, page, limit, hasMore: page * limit < total };
  }
  async setStreaming(id: string, isStreaming: boolean, streamKey?: string) {
    const streamUrl =
      isStreaming && streamKey
        ? `http://localhost:8080/hls/${streamKey}.m3u8`
        : undefined;

    const match = await this.matchModel.findByIdAndUpdate(
      id,
      { isStreaming, streamKey, streamUrl },
      { new: true },
    );

    if (!match) throw new NotFoundException('경기를 찾을 수 없습니다');
    return match;
  }

  async getStreamingMatches() {
    return this.matchModel.find({ isStreaming: true }).sort({ date: 1 }).lean();
  }

  // ─── 유저 ────────────────────────────────────────────────────
  async getUsers(page = 1, limit = 20, search?: string) {
    const filter: any = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password -fcmTokens')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    return { users, total, page, limit, hasMore: page * limit < total };
  }

  async updateUserRole(userId: string, role: 'user' | 'admin') {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { role }, { new: true })
      .select('-password');

    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');
    return user;
  }

  async toggleUserBan(userId: string, isBanned: boolean) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { isBanned }, { new: true })
      .select('-password');

    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');
    return user;
  }

  // ─── 팀 ─────────────────────────────────────────────────────
  async getTeams(page = 1, limit = 50, search?: string) {
    const filter: any = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const [teams, total] = await Promise.all([
      this.teamModel
        .find(filter)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.teamModel.countDocuments(filter),
    ]);

    return { teams, total, page, limit, hasMore: page * limit < total };
  }

  async updateTeamColor(teamId: string, color: string) {
    const team = await this.teamModel.findByIdAndUpdate(
      teamId,
      { color },
      { new: true },
    );

    if (!team) throw new NotFoundException('팀을 찾을 수 없습니다');
    return team;
  }

  // ─── 하이라이트 ──────────────────────────────────────────────
  async getHighlights(page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.highlightModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('matchId', 'homeTeam awayTeam goals')
        .lean(),
      this.highlightModel.countDocuments(),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async deleteHighlight(id: string) {
    const highlight = await this.highlightModel.findByIdAndDelete(id);
    if (!highlight)
      throw new NotFoundException('하이라이트를 찾을 수 없습니다');
    return { message: '삭제되었습니다' };
  }

  // ─── 알람 푸시 ──────────────────────────────────────────────
  async sendNotification(title: string, body: string, target: string) {
    let tokens: string[] = [];

    if (target === 'all') {
      const users = await this.userModel
        .find({ fcmTokens: { $exists: true, $ne: [] } })
        .select('fcmTokens')
        .lean();
      tokens = users.flatMap((u: any) => u.fcmTokens ?? []);
    } else if (target === 'verified') {
      const users = await this.userModel
        .find({ isEmailVerified: true, fcmTokens: { $exists: true, $ne: [] } })
        .select('fcmTokens')
        .lean();
      tokens = users.flatMap((u: any) => u.fcmTokens ?? []);
    }

    const result = await this.fcmService.sendToMultipleDevices(
      tokens,
      title,
      body,
    );

    // 발송 이력 저장
    await this.notificationHistoryModel.create({
      title,
      body,
      target,
      successCount: result.successCount,
      failureCount: result.failureCount,
    });

    return result;
  }

  async getNotificationHistory(page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.notificationHistoryModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.notificationHistoryModel.countDocuments(),
    ]);
    return { items, total, page, hasMore: page * limit < total };
  }
}
