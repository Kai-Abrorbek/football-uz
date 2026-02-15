import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from '../../schemas/match.schema';
import { MatchQueryDto } from './dto/match-query.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
  ) {}

  async findAll(query: MatchQueryDto) {
    const filter: any = {};
    const limit = query.limit || 20;

    if (query.date) {
      const startDate = new Date(query.date);
      const endDate = new Date(query.date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    if (query.leagueId) {
      filter['league.id'] = query.leagueId;
    }

    if (query.teamId) {
      filter.$or = [
        { 'homeTeam.id': query.teamId },
        { 'awayTeam.id': query.teamId },
      ];
    }

    if (query.status && query.status !== 'all') {
      filter['status.short'] = query.status;
    }

    return this.matchModel.find(filter).sort({ date: -1 }).limit(limit).exec();
  }

  async findLive() {
    return this.matchModel
      .find({
        'status.short': { $in: ['1H', 'HT', '2H', 'ET', 'BT', 'P'] },
      })
      .sort({ date: 1 })
      .exec();
  }

  async findUpcoming(days: number = 7) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return this.matchModel
      .find({
        date: { $gte: now, $lte: future },
        'status.short': 'NS',
      })
      .sort({ date: 1 })
      .limit(50)
      .exec();
  }

  async findById(id: string) {
    const match = await this.matchModel.findById(id);
    if (!match) {
      throw new NotFoundException('경기를 찾을 수 없습니다');
    }
    return match;
  }

  async findByApiFootballId(apiFootballId: number) {
    const match = await this.matchModel.findOne({ apiFootballId });
    if (!match) {
      throw new NotFoundException('경기를 찾을 수 없습니다');
    }
    return match;
  }

  async findByLeagueAndSeason(leagueId: number, season: number) {
    return this.matchModel
      .find({
        'league.id': leagueId,
        'league.season': season,
      })
      .sort({ date: -1 })
      .exec();
  }

  async findByTeam(teamId: number, limit: number = 10) {
    return this.matchModel
      .find({
        $or: [{ 'homeTeam.id': teamId }, { 'awayTeam.id': teamId }],
      })
      .sort({ date: -1 })
      .limit(limit)
      .exec();
  }

  async findH2H(team1Id: number, team2Id: number, limit: number = 5) {
    return this.matchModel
      .find({
        $or: [
          { 'homeTeam.id': team1Id, 'awayTeam.id': team2Id },
          { 'homeTeam.id': team2Id, 'awayTeam.id': team1Id },
        ],
        'status.short': 'FT', // 수정
      })
      .sort({ date: -1 })
      .limit(limit)
      .exec();
  }
}
