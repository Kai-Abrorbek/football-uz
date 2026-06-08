import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiFootballService } from '../api-football.service';
import { Team, TeamDocument } from '../../../schemas/team.schema';
import {
  FEATURED_LEAGUES_Object,
  SEASON,
} from '../../../constants/leagues.constant';

@Injectable()
export class TeamScheduler {
  private readonly logger = new Logger(TeamScheduler.name);
  FEATURED_LEAGUES_Object: any;

  constructor(
    private apiFootballService: ApiFootballService,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  // 팀 정보 - 4시간마다
  // @Cron('0 */4 * * *')
  async syncTeams() {
    this.logger.log('Syncing teams...');
    const season = SEASON;

    try {
      for (const league of FEATURED_LEAGUES_Object) {
        const { id: leagueId, name: leagueName } = league;
        const data = await this.apiFootballService.getTeamsByLeague(
          leagueId,
          season,
        );
        const teams = data.response;
        for (const item of teams) {
          const team = item.team;
          const venue = item.venue;

          await this.teamModel.findOneAndUpdate(
            { apiFootballId: team.id },
            {
              $set: {
                apiFootballId: team.id,
                name: team.name,
                code: team.code,
                country: team.country,
                founded: team.founded,
                logo: team.logo,
                venue: {
                  name: venue?.name,
                  city: venue?.city,
                  capacity: venue?.capacity,
                  image: venue?.image,
                },
                lastSyncAt: new Date(),
              },
              $addToSet: {
                leagues: {
                  id: leagueId,
                  name: item?.league?.name ?? '', // 또는 네가 따로 상수에서 이름 매핑
                  season: season,
                },
              },
            },
            { upsert: true, returnDocument: 'after' },
          );
        }

        this.logger.log(`Synced ${teams.length} teams from league ${leagueId}`);
      }
    } catch (error) {
      this.logger.error('Failed to sync teams', error);
    }
  }

  async syncTeamsBySeason(season: number, leagueId?: number) {
    const leagues = leagueId
      ? FEATURED_LEAGUES_Object.filter((l) => l.id === leagueId)
      : FEATURED_LEAGUES_Object;

    for (const league of leagues) {
      const data = await this.apiFootballService.getTeamsByLeague(
        league.id,
        season,
      );
      const teams = data.response;

      for (const item of teams) {
        const team = item.team;
        const venue = item.venue;

        await this.teamModel.findOneAndUpdate(
          { apiFootballId: team.id },
          {
            $set: {
              apiFootballId: team.id,
              name: team.name,
              code: team.code,
              country: team.country,
              founded: team.founded,
              logo: team.logo,
              venue: {
                name: venue?.name,
                city: venue?.city,
                capacity: venue?.capacity,
                image: venue?.image,
              },
              lastSyncAt: new Date(),
            },
            $addToSet: {
              leagues: { id: league.id, name: league.name, season },
            },
          },
          { upsert: true },
        );
      }

      this.logger.log(`Synced ${teams.length} teams from league ${league.id}`);
      await this.sleep(500);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
