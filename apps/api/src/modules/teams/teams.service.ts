import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team, TeamDocument } from '../../schemas/team.schema';
import { TeamQueryDto } from './dto/team-query.dto';
import { LeaguesService } from '../leagues/leagues.service';
import { Vibrant } from 'node-vibrant/node';
import { Match, MatchDocument } from '../../schemas';
import { FEATURED_LEAGUES } from '../../constants/leagues.constant';

@Injectable()
export class TeamsService {
  private logger = new Logger(TeamsService.name);
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    private readonly leaguesService: LeaguesService,
  ) {}

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

  async getTeamLeagues(id: number) {
    const teamLeagues = await this.teamModel
      .findOne({ apiFootballId: id })
      .exec();

    if (!teamLeagues)
      throw new BadRequestException('팀 정도가 조희 되지 않았습니다.');

    const ids = teamLeagues.leagues.map((v) => v.id);

    const leaguesData = await this.leaguesService.findByTeamIds(ids);
    return leaguesData;
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

  async extractColors() {
    const teams = await this.teamModel.find();

    for (const team of teams) {
      if (!team.logo) continue;
      const color = await this.extractColorFromUrl(team.logo);
      if (color) {
        await this.teamModel.findByIdAndUpdate(team._id, { color });
      }
    }

    return { message: `${teams.length}개 팀 색상 추출 완료` };
  }

  private async extractColorFromUrl(url: string): Promise<string | null> {
    try {
      const palette = await Vibrant.from(url).getPalette();

      // Vibrant → DarkVibrant → Muted 순으로 시도
      const swatch =
        palette.Vibrant ??
        palette.DarkVibrant ??
        palette.Muted ??
        palette.DarkMuted;

      if (!swatch) return null;

      return swatch.hex;
    } catch (e) {
      this.logger.error('색상 추출 실패:', e);
      return null;
    }
  }

  async getFollowingTeamsWithNextMatch(teamIds: number[]) {
    const teams = await this.teamModel
      .find({ apiFootballId: { $in: teamIds } })
      .lean();

    const result = await Promise.all(
      teams.map(async (team) => {
        const nextMatch = await this.matchModel
          .findOne({
            $or: [
              { 'homeTeam.id': team.apiFootballId },
              { 'awayTeam.id': team.apiFootballId },
            ],
            'status.short': 'NS',
            date: { $gte: new Date() },
          })
          .sort({ date: 1 })
          .lean();

        return { ...team, nextMatch };
      }),
    );

    return result;
  }

  async getSuggestedTeams(
    excludeIds: number[] = [],
    followingTeamIds: number[] = [],
  ) {
    // 팔로잉 팀들의 리그 ID 가져오기
    let leagueIds: number[] = [];

    if (followingTeamIds.length > 0) {
      const followingTeams = await this.teamModel
        .find({ apiFootballId: { $in: followingTeamIds } })
        .select('leagues')
        .lean();

      leagueIds = [
        ...new Set(followingTeams.flatMap((t) => t.leagues.map((l) => l.id))),
      ];
    }

    // 같은 리그 팀 추천, 없으면 FEATURED_LEAGUES 기준
    const filter: any = {
      apiFootballId: { $nin: [...excludeIds, ...followingTeamIds] },
      'leagues.id': {
        $in: leagueIds.length > 0 ? leagueIds : FEATURED_LEAGUES,
      },
    };

    return this.teamModel.find(filter).limit(50).lean();
  }
}
