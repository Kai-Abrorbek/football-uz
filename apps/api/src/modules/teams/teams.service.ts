import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team, TeamDocument } from '../../schemas/team.schema';
import { TeamQueryDto } from './dto/team-query.dto';

@Injectable()
export class TeamsService {
  constructor(@InjectModel(Team.name) private teamModel: Model<TeamDocument>) {}

  async findAll(query: TeamQueryDto) {
    const filter: any = {};
    const limit = query.limit || 20;

    if (query.country) {
      filter.country = query.country;
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    return this.teamModel.find(filter).limit(limit).exec();
  }

  async findById(id: number) {
    const team = await this.teamModel.findOne({ apiFootballId: id });
    if (!team) {
      throw new NotFoundException('팀을 찾을 수 없습니다');
    }
    return team;
  }

  async findByLeague(leagueId: number) {
    // Match 컬렉션에서 해당 리그 경기에 참여한 팀 ID 추출
    const teamIds = await this.getTeamIdsByLeague(leagueId);
    return this.teamModel.find({ apiFootballId: { $in: teamIds } }).exec();
  }

  async search(query: string) {
    return this.teamModel
      .find({ $text: { $search: query } })
      .limit(20)
      .exec();
  }

  private async getTeamIdsByLeague(leagueId: number): Promise<number[]> {
    // Match에서 해당 리그 팀들 추출
    const { default: mongoose } = await import('mongoose');
    const Match = mongoose.model('Match');

    const matches = await Match.find({ 'league.id': leagueId })
      .select('homeTeam.id awayTeam.id')
      .exec();

    const teamIds = new Set<number>();
    matches.forEach((match: any) => {
      teamIds.add(match.homeTeam.id);
      teamIds.add(match.awayTeam.id);
    });

    return Array.from(teamIds);
  }
}
