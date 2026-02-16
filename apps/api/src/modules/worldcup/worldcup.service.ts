import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WorldCup2026,
  WorldCup2026Document,
} from '../../schemas/world-cup-2026.schema';
import { Match, MatchDocument } from '../../schemas/match.schema';
import { UpdateWorldCupDto } from './dto/update-worldcup.dto';

@Injectable()
export class WorldCupService {
  constructor(
    @InjectModel(WorldCup2026.name)
    private worldCupModel: Model<WorldCup2026Document>,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
  ) {}

  async getOverview() {
    const groups = await this.worldCupModel.find({ type: 'group' });
    const bracket = await this.worldCupModel.findOne({ type: 'knockout' });
    const venues = await this.worldCupModel.find({ type: 'venue' });
    const uzbekistanStatus = await this.worldCupModel.findOne({ type: 'info' });

    return {
      groups,
      bracket,
      venues,
      uzbekistanStatus,
    };
  }

  async getGroups() {
    return this.worldCupModel.find({ type: 'group' }).exec();
  }

  async getGroup(groupName: string) {
    const group = await this.worldCupModel.findOne({
      type: 'group',
      'group.name': groupName,
    });

    if (!group) {
      throw new NotFoundException('그룹을 찾을 수 없습니다');
    }

    return group;
  }

  async getBracket() {
    return this.worldCupModel.findOne({ type: 'knockout' }).exec();
  }

  async getVenues() {
    return this.worldCupModel.find({ type: 'venue' }).exec();
  }

  async getUzbekistanStatus() {
    return this.worldCupModel.findOne({ type: 'info' }).exec();
  }

  async getWorldCupMatches() {
    return this.matchModel
      .find({ isWorldCup2026: true })
      .sort({ date: 1 })
      .exec();
  }

  async getUzbekistanMatches() {
    // 우즈벡 팀 ID (가정: 1530)
    const UZB_TEAM_ID = 1530;

    return this.matchModel
      .find({
        isWorldCup2026: true,
        $or: [{ 'homeTeam.id': UZB_TEAM_ID }, { 'awayTeam.id': UZB_TEAM_ID }],
      })
      .sort({ date: 1 })
      .exec();
  }

  async create(dto: UpdateWorldCupDto) {
    return this.worldCupModel.create(dto);
  }

  async update(id: string, dto: UpdateWorldCupDto) {
    const worldcup = await this.worldCupModel.findByIdAndUpdate(id, dto, {
      returnDocument: 'after',
    });

    if (!worldcup) {
      throw new NotFoundException('데이터를 찾을 수 없습니다');
    }

    return worldcup;
  }

  async delete(id: string) {
    const result = await this.worldCupModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('데이터를 찾을 수 없습니다');
    }
    return { message: '삭제되었습니다' };
  }
}
