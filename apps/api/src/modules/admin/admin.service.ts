import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from '../../schemas/match.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { Team, TeamDocument } from '../../schemas';
import { Highlight, HighlightDocument } from '../../schemas/highlight.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(Highlight.name)
    private highlightModel: Model<HighlightDocument>,
  ) {}

  // ─── 대시보드 ───────────────────────────────────────────────
  async getDashboard() {
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
  async getMatches(date?: string, page = 1, limit = 30) {
    const filter: any = {};

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
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
}
