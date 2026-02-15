import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from '../../schemas/player.schema';
import { PlayerQueryDto } from './dto/player-query.dto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
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
}
