import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { League, LeagueDocument } from '../../schemas/league.schema';

@Injectable()
export class LeaguesService {
  constructor(
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
  ) {}

  async findAll() {
    return this.leagueModel.find({ isActive: true }).sort({ priority: 1 });
  }

  async findFeatured() {
    return this.leagueModel
      .find({ isFeatured: true, isActive: true })
      .sort({ priority: 1 });
  }

  async findById(id: number) {
    return this.leagueModel.findOne({ apiFootballId: id, isActive: true });
  }

  async findByTeamIds(ids: number[]) {
    return this.leagueModel.find({ apiFootballId: { $in: ids } });
  }
}
