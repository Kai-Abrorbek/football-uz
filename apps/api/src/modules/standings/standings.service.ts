import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Standing, StandingDocument } from '../../schemas/standing.schema';

@Injectable()
export class StandingsService {
  constructor(
    @InjectModel(Standing.name) private standingModel: Model<StandingDocument>,
  ) {}

  async findByLeague(leagueId: number, season: number) {
    const standing = await this.standingModel.findOne({
      'league.id': leagueId,
      'league.season': season,
    });

    if (!standing) {
      throw new NotFoundException('순위표를 찾을 수 없습니다');
    }

    return standing;
  }

  async findCurrentByLeague(leagueId: number) {
    // 최신 시즌 순위표 (2024)
    return this.findByLeague(leagueId, 2024);
  }

  async findAll(season: number = 2024) {
    return this.standingModel.find({ 'league.season': season }).exec();
  }
}
