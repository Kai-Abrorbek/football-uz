import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from '../../schemas/match.schema';
import { LeagueMatchQueryDto, MatchQueryDto } from './dto/match-query.dto';
import { Player, PlayerDocument } from '../../schemas';
import { TeamMatchQueryDto } from './dto/team-match-query.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class MatchesService {
  private logger = new Logger(MatchesService.name);
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(query: MatchQueryDto) {
    const filter: any = {};

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

    if (query.season) {
      filter['league.season'] = query.season;
    }

    if (query.status && query.status !== 'all') {
      filter['status.short'] = query.status;
    }

    // ✅ round 필터 추가
    if (query.round) {
      filter['league.round'] = query.round;
    }

    // ✅ date 있을 때만 캐싱
    if (query.date && !query.teamId && !query.status) {
      const cacheKey = `matches:date:${query.date}:league:${query.leagueId || 'all'}`;
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.log(`✅ 캐시 히트: ${cacheKey}`);
        return cached;
      }
      const matches = await this.matchModel
        .find(filter)
        .sort({ date: 1 })
        .exec();
      await this.cacheManager.set(cacheKey, matches, 60 * 60 * 1000);
      return matches;
    }

    // ✅ 페이지네이션
    const limit = query.limit ?? 20;
    const page = query.page ?? 1;
    const skip = (page - 1) * limit;

    return this.matchModel
      .find(filter)
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async getLeagueMatches(query: LeagueMatchQueryDto) {
    const matches = await this.matchModel.find({
      'league.id': query.leagueId,
      'league.season': query.season,
    });

    const playedMatches = matches.filter(
      (m) => m.status?.short === 'FT' || m.status?.short === '2H',
    );

    const roundNumbers = playedMatches
      .map((m) => {
        const s = m.round ?? '';
        const match = s.match(/(\d+)\s*$/);
        return match ? Number(match[1]) : NaN;
      })
      .filter(Number.isFinite);

    let currentRound = roundNumbers.length ? Math.max(...roundNumbers) : 1;

    // round=0이면 현재 라운드 자동 계산, 아니면 그대로 사용
    if (query.round !== 0) {
      currentRound = query.round!;
    }

    const filter: any = {};
    if (query.leagueId) filter['league.id'] = query.leagueId;
    if (query.season) filter['league.season'] = query.season;

    let rounds: number[];

    // ✅ direction으로 범위 분리
    if (query.direction === 'prev') {
      // 이전 라운드들: currentRound-3 ~ currentRound
      rounds = [
        // currentRound - 3,
        // currentRound - 2,
        currentRound - 1,
        currentRound,
      ].filter((r) => r > 0 && Number.isFinite(r));
    } else if (query.direction === 'next') {
      // 다음 라운드들: currentRound ~ currentRound+3
      rounds = [
        currentRound,
        currentRound + 1,
        // currentRound + 2,
        // currentRound + 3,
      ].filter((r) => r > 0 && Number.isFinite(r));
    } else {
      // 초기(direction 없음): 현재 기준 앞뒤로
      rounds = [
        currentRound - 2,
        currentRound - 1,
        currentRound,
        currentRound + 1,
        currentRound + 2,
      ].filter((r) => r > 0 && Number.isFinite(r));
    }

    const roundStrings = rounds.map((r) => {
      if (query.leagueId === 2 || query.leagueId === 3) {
        return `Round of ${r}`;
      } else {
        return `Regular Season - ${r}`;
      }
    });

    filter['round'] = { $in: roundStrings };

    const result = await this.matchModel
      .find(filter)
      .sort({ date: 1 }) // ✅ 오름차순으로 통일
      .lean()
      .exec();

    return {
      currentRound,
      roundsData: rounds,
      matches: result,
    };
  }

  async findLive() {
    const cacheKey = 'matches:live';

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.log(`✅ 캐시 히트: ${cacheKey}`);
      return cached;
    }

    const matches = await this.matchModel
      .find({ 'status.short': { $in: ['1H', 'HT', '2H', 'ET', 'BT', 'P'] } })
      .sort({ date: 1 })
      .exec();

    await this.cacheManager.set(cacheKey, matches, 60 * 1000);
    return matches;
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

  // matches.service.ts
  async findByTeamMatches(query: TeamMatchQueryDto) {
    const { teamId, limit = 15, cursor, direction } = query;

    const baseFilter = {
      $or: [{ 'homeTeam.id': teamId }, { 'awayTeam.id': teamId }],
    };

    let cursorFilter = {};
    if (cursor) {
      const cursorDate = new Date(cursor);
      if (direction === 'next') {
        // 아래 스크롤 → 커서보다 미래 경기
        cursorFilter = { date: { $gt: cursorDate } };
      } else if (direction === 'prev') {
        // 위 스크롤 → 커서보다 과거 경기
        cursorFilter = { date: { $lt: cursorDate } };
      }
    }

    const filter = { ...baseFilter, ...cursorFilter };

    // ✅ 항상 오름차순 (과거 → 미래)
    const result = await this.matchModel
      .find(filter)
      .sort({ date: 1 })
      .limit(limit)
      .lean()
      .exec();

    return {
      matches: result,
      nextCursor:
        result.length === limit
          ? result[result.length - 1].date // 가장 미래 날짜
          : null,
      prevCursor:
        result.length > 0
          ? result[0].date // 가장 과거 날짜
          : null,
      hasMore: result.length === limit,
    };
  }

  async findByTeam(query: { teamId: number; limit: number }) {
    const { teamId, limit } = query;
    return this.matchModel
      .find({
        $or: [{ 'homeTeam.id': teamId }, { 'awayTeam.id': teamId }],
      })
      .sort({ date: -1 })
      .limit(limit)
      .exec();
  }

  // 탭용 - 오늘 기준 가장 가까운 경기 15개
  async findByTeamRecent(teamId: number) {
    const today = new Date();
    const baseFilter = {
      $or: [{ 'homeTeam.id': teamId }, { 'awayTeam.id': teamId }],
    };

    // 오늘 이후 경기 (미래)
    const futureMatches = await this.matchModel
      .find({ ...baseFilter, date: { $gte: today } })
      .sort({ date: 1 }) // 가까운 것부터
      .limit(10)
      .lean()
      .exec();

    // 오늘 이전 경기 (과거)
    const pastMatches = await this.matchModel
      .find({ ...baseFilter, date: { $lt: today } })
      .sort({ date: -1 }) // 가까운 것부터
      .limit(7)
      .lean()
      .exec();

    // 과거(오름차순) + 미래 합치기
    return [...pastMatches.reverse(), ...futureMatches];
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

  async clearLiveCache() {
    await this.cacheManager.del('matches:live');
  }

  async clearDateCache(date: string) {
    await this.cacheManager.del(`matches:date:${date}:league:all`);
  }
}
