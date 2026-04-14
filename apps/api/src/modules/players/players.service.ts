import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from '../../schemas/player.schema';
import { PlayerQueryDto } from './dto/player-query.dto';
import { Match, MatchDocument, Team, TeamDocument } from '../../schemas';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from '@nestjs/cache-manager';
import { FEATURED_LEAGUES } from '../../constants/leagues.constant';

@Injectable()
export class PlayersService {
  syncTopPlayers() {
    throw new Error('Method not implemented.');
  }
  private logger = new Logger(PlayersService.name);

  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(query: PlayerQueryDto) {
    const filter: any = {};
    const limit = query.limit || 20;

    if (query.teamId) {
      filter['currentTeam.id'] = query.teamId;
    }

    if (query.nationality) {
      filter.nationality = query.nationality;
    }

    if (query.position) {
      filter.position = query.position;
    }

    if (query.isUzbekPlayer !== undefined) {
      filter.isUzbekPlayer = query.isUzbekPlayer;
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    return this.playerModel.find(filter).limit(limit).exec();
  }

  async findPlayerDetail(id: number) {
    const cacheKey = `player:detail:${id}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const player = await this.playerModel.findOne({ apiFootballId: id }).lean();

    if (!player) throw new NotFoundException('선수를 찾을 수 없습니다');

    const matches = await this.matchModel
      .find({
        $or: [
          { 'homeTeam.id': player.currentTeam?.id },
          { 'awayTeam.id': player.currentTeam?.id },
        ],
        'status.short': 'FT',
        'events.player.id': player.apiFootballId,
      })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    const recentMatches = matches.map((match) => ({
      _id: match._id,
      apiFootballId: match.apiFootballId,
      date: match.date,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      goals: match.goals,
      status: match.status,
      league: match.league,
      playerEvents:
        match.events?.filter(
          (e) => e.player?.id === id || e.assist?.id === id,
        ) ?? [],
    }));

    const result = { player, recentMatches };

    await this.cacheManager.set(cacheKey, result, 60 * 60); // 1시간

    return result;
  }

  async findByLeaguePlayers(leagueId: string): Promise<Player[]> {
    const player: Player[] = await this.playerModel.find({
      'statistics.league.id': leagueId,
    });

    if (!player || player.length === 0) {
      throw new NotFoundException('리그 선수들를 찾을 수 없습니다');
    }
    return player;
  }

  async findByTeam(teamId: number) {
    return this.playerModel.find({ 'currentTeam.id': teamId }).exec();
  }

  async findUzbekPlayers() {
    return this.playerModel.find({ isUzbekPlayer: true }).exec();
  }

  async search(query: string) {
    return this.playerModel
      .find({ $text: { $search: query } })
      .limit(20)
      .exec();
  }

  async getTopScorers(leagueId: number) {
    const teams = await this.teamModel.find({
      'leagues.id': leagueId,
    });

    const teamIds = teams.map((t) => t.apiFootballId);

    const players = await this.playerModel
      .find({
        'currentTeam.id': { $in: teamIds },
        statistics: {
          $elemMatch: {
            'league.id': leagueId,
            'goals.total': { $gt: 0 },
          },
        },
      })
      .lean();

    // 해당 리그 통계 기준으로 정렬
    return players
      .map((player) => {
        const stat = player.statistics.find(
          (s: any) => s.league?.id === leagueId,
        );
        return {
          ...player,
          statistics: stat ? [stat] : [],
        };
      })
      .sort(
        (a, b) =>
          (b.statistics[0]?.goals?.total ?? 0) -
          (a.statistics[0]?.goals?.total ?? 0),
      );
  }

  async getTopAssists(leagueId: number) {
    const teams = await this.teamModel
      .find({
        leagues: {
          $elemMatch: { id: leagueId },
        },
      })
      .lean();

    if (!teams || teams.length === 0) {
      return [];
    }

    const teamIds = teams.map((t) => t.apiFootballId);
    const players = await this.playerModel
      .find({
        'currentTeam.id': { $in: teamIds },
        statistics: {
          $elemMatch: {
            'league.id': leagueId,
            'goals.assists': { $gt: 0 },
          },
        },
      })
      .lean();

    return players
      .map((player) => {
        const stat = player.statistics.find(
          (s: any) => s.league?.id === leagueId,
        );
        return {
          ...player,
          statistics: stat ? [stat] : [],
        };
      })
      .sort(
        (a, b) =>
          (b.statistics[0]?.goals?.assists ?? 0) -
          (a.statistics[0]?.goals?.assists ?? 0),
      );
  }

  async getYellowCards(leagueId: number) {
    const teams = await this.teamModel
      .find({ leagues: { $elemMatch: { id: leagueId } } })
      .lean();

    if (!teams || teams.length === 0) return [];

    const teamIds = teams.map((t) => t.apiFootballId);

    const players = await this.playerModel
      .find({
        'currentTeam.id': { $in: teamIds },
        statistics: {
          $elemMatch: {
            'league.id': leagueId,
            'cards.yellow': { $gt: 0 },
          },
        },
      })
      .lean();

    return players
      .map((player) => {
        const stat = player.statistics.find(
          (s: any) => s.league?.id === leagueId,
        );
        return {
          ...player,
          statistics: stat ? [stat] : [],
        };
      })
      .sort(
        (a, b) =>
          (b.statistics[0]?.cards?.yellow ?? 0) -
          (a.statistics[0]?.cards?.yellow ?? 0),
      );
  }

  async getRedCards(leagueId: number) {
    const teams = await this.teamModel
      .find({ leagues: { $elemMatch: { id: leagueId } } })
      .lean();

    if (!teams || teams.length === 0) return [];

    const teamIds = teams.map((t) => t.apiFootballId);

    const players = await this.playerModel
      .find({
        'currentTeam.id': { $in: teamIds },
        statistics: {
          $elemMatch: {
            'league.id': leagueId,
            'cards.red': { $gt: 0 },
          },
        },
      })
      .lean();

    return players
      .map((player) => {
        const stat = player.statistics.find(
          (s: any) => s.league?.id === leagueId,
        );
        return {
          ...player,
          statistics: stat ? [stat] : [],
        };
      })
      .sort(
        (a, b) =>
          (b.statistics[0]?.cards?.red ?? 0) -
          (a.statistics[0]?.cards?.red ?? 0),
      );
  }

  async getPlayersByIds(ids: number[]) {
    return this.playerModel
      .find({ apiFootballId: { $in: ids } })
      .select('apiFootballId nationality age photo statistics')
      .lean();
  }

  async getFollowingPlayers(playerIds: number[]) {
    return this.playerModel.find({ apiFootballId: { $in: playerIds } }).lean();
  }

  private shuffle = <T>(arr: T[]): T[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  async getSuggestedPlayers(
    excludeIds: number[] = [],
    followingTeamIds: number[] = [],
    followingLeagueIds: number[] = [],
  ) {
    let teamIds: number[] = [...followingTeamIds];

    if (followingLeagueIds.length > 0) {
      const leagueTeams = await this.teamModel
        .find({ 'leagues.id': { $in: followingLeagueIds } })
        .select('apiFootballId')
        .lean();
      teamIds = [
        ...new Set([...teamIds, ...leagueTeams.map((t) => t.apiFootballId)]),
      ];
    }

    if (teamIds.length === 0) {
      const featuredTeams = await this.teamModel
        .find({ 'leagues.id': { $in: FEATURED_LEAGUES } })
        .select('apiFootballId')
        .lean();
      teamIds = featuredTeams.map((t) => t.apiFootballId);
    }

    // 팀당 5명씩 가져오기
    const results: any[] = [];
    const shuffledTeams = teamIds.sort(() => Math.random() - 0.5);

    for (const teamId of shuffledTeams) {
      if (results.length >= 50) break;

      const players = await this.playerModel
        .find({
          apiFootballId: { $nin: excludeIds },
          'currentTeam.id': teamId,
          photo: { $exists: true, $ne: null },
        })
        .limit(5)
        .lean();

      results.push(...players);
    }

    return this.shuffle(results).slice(0, 50);
  }
}
