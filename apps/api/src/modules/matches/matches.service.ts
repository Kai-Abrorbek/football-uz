import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from '../../schemas/match.schema';
import { LeagueMatchQueryDto, MatchQueryDto } from './dto/match-query.dto';
import { League, LeagueDocument, Player, PlayerDocument } from '../../schemas';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
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

  async getLeagueMatches(query: LeagueMatchQueryDto) {
    const filter: any = {};
    const limit = query.limit || 20;

    const matches = await this.matchModel.find({
      'league.id': query.leagueId,
      'league.season': query.season,
    });

    const playedMatches = matches.filter(
      (m) => m.status?.short === 'FT' || m.status?.short === '2H',
    );

    const currentRound = Math.max(
      ...playedMatches.map((m) => Number(m.round?.split('-').pop()?.trim())),
    );

    if (currentRound) {
      filter['round'] = `Regular Season - ${currentRound}`;
    }

    if (query.leagueId) {
      filter['league.id'] = query.leagueId;
    }

    if (query.season) {
      filter['league.season'] = query.season;
    }

    const result = await this.matchModel
      .find(filter)
      .sort({ date: -1 })
      .lean()
      .exec();

    result['round'] = currentRound;

    return {
      currentRound,
      matches: result,
    };
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

    // console.log(match);
    const matchObj = match.toObject();

    // lineups에 선수 사진 추가
    if (matchObj.lineups?.home?.startXI || matchObj.lineups?.away?.startXI) {
      const enrichPlayers = async (players: any[]) => {
        if (!players) return [];
        return Promise.all(
          players.map(async (p) => {
            if (!p.playerId) return p;
            const player = await this.playerModel
              .findOne({ apiFootballId: p.playerId })
              .select('photo name')
              .lean();

            return {
              ...p,
              photo: player?.photo || null,
            };
          }),
        );
      };

      if (matchObj.lineups.home) {
        matchObj.lineups.home.startXI = await enrichPlayers(
          matchObj.lineups.home.startXI,
        );
        matchObj.lineups.home.substitutes = await enrichPlayers(
          matchObj.lineups.home.substitutes,
        );
      }
      if (matchObj.lineups.away) {
        matchObj.lineups.away.startXI = await enrichPlayers(
          matchObj.lineups.away.startXI,
        );
        matchObj.lineups.away.substitutes = await enrichPlayers(
          matchObj.lineups.away.substitutes,
        );
      }
    }

    return matchObj;
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
