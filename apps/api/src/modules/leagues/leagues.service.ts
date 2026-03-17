import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { League, LeagueDocument } from '../../schemas/league.schema';
import { FEATURED_LEAGUES } from '../../constants/leagues.constant';
import { Team, TeamDocument } from '../../schemas';

@Injectable()
export class LeaguesService {
  constructor(
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
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

  async getFollowingLeagues(leagueIds: number[]) {
    return this.leagueModel.find({ apiFootballId: { $in: leagueIds } }).lean();
  }

  async getSuggestedLeagues(
    excludeIds: number[] = [],
    followingTeamIds: number[] = [],
  ) {
    let suggestedLeagueIds: number[] = [];

    if (followingTeamIds.length > 0) {
      const teams = await this.leagueModel.db
        .model('Team')
        .find({ apiFootballId: { $in: followingTeamIds } })
        .select('leagues')
        .lean();

      suggestedLeagueIds = [
        ...new Set(
          (teams as any[]).flatMap((t) => t.leagues.map((l: any) => l.id)),
        ),
      ].filter((id) => !excludeIds.includes(id));
    }

    // 팀 기반 추천 + 나머지 리그 합쳐서 50개 채우기
    return this.leagueModel
      .find({
        isActive: true,
        apiFootballId: { $nin: excludeIds },
      })
      .sort({
        // 팔로잉 팀 기반 리그 먼저
        apiFootballId: suggestedLeagueIds.length > 0 ? 1 : 1,
        priority: 1,
      })
      .limit(50)
      .lean()
      .then((leagues) => {
        // 팀 기반 리그 먼저 정렬
        return [
          ...leagues.filter((l) =>
            suggestedLeagueIds.includes(l.apiFootballId),
          ),
          ...leagues.filter(
            (l) => !suggestedLeagueIds.includes(l.apiFootballId),
          ),
        ];
      });
  }

  async search(query: string) {
    return this.leagueModel
      .find({
        name: { $regex: query, $options: 'i' },
        isActive: true,
      })
      .limit(20)
      .lean();
  }
}
