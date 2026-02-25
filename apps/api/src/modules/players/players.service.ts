import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from '../../schemas/player.schema';
import { PlayerQueryDto } from './dto/player-query.dto';
import { Team, TeamDocument } from '../../schemas';
import { PlayerScheduler } from './schedulers/player.scheduler';

@Injectable()
export class PlayersService {
  syncTopPlayers() {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
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

  async findById(id: number) {
    const player = await this.playerModel.findOne({ apiFootballId: id });
    if (!player) {
      throw new NotFoundException('선수를 찾을 수 없습니다');
    }
    return player;
  }

  async findByLeaguePlayers(leagueId: number): Promise<Player[]> {
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
    // leagues 배열에서 해당 리그 ID를 가진 팀들 찾기
    const teams = await this.teamModel.find({
      'leagues.id': leagueId,
    });

    const teamIds = teams.map((t) => t.apiFootballId);
    return this.playerModel
      .find({
        'currentTeam.id': { $in: teamIds },
        'statistics.goals.total': { $exists: true, $gt: 0 },
      })
      .sort({ 'statistics.goals.total': -1 })
      .lean();
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
    return this.playerModel
      .find({
        'currentTeam.id': { $in: teamIds },
        'statistics.goals.assists': { $exists: true, $gt: 0 },
      })
      .sort({ 'statistics.goals.assists': -1 })
      .lean();
  }

  async getYellowCards(leagueId: number) {
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
    return this.playerModel
      .find({
        'currentTeam.id': { $in: teamIds },
        'statistics.cards.yellow': { $exists: true, $gt: 0 },
      })
      .sort({ 'statistics.cards.yellow': -1 })
      .lean();
  }

  async getRedCards(leagueId: number) {
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
    return this.playerModel
      .find({
        'currentTeam.id': { $in: teamIds },
        'statistics.cards.red': { $exists: true, $gt: 0 },
      })
      .sort({ 'statistics.cards.red': -1 })
      .lean();
  }
}
