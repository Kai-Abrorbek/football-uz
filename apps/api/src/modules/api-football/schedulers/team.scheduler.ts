import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiFootballService } from '../api-football.service';
import { Team, TeamDocument } from '../../../schemas/team.schema';
import { FEATURED_LEAGUES } from 'apps/api/src/constants/leagues.constant';

@Injectable()
export class TeamScheduler {
  private readonly logger = new Logger(TeamScheduler.name);
  private readonly FEATURED_LEAGUES = FEATURED_LEAGUES;

  constructor(
    private apiFootballService: ApiFootballService,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  // 팀 정보 - 4시간마다
  @Cron('0 */4 * * *')
  async syncTeams() {
    this.logger.log('Syncing teams...');
    const season = 2024;

    try {
      for (const leagueId of this.FEATURED_LEAGUES) {
        const data = await this.apiFootballService.getTeamsByLeague(
          leagueId,
          season,
        );
        const teams = data.response;

        for (const item of teams) {
          const team = item.team;
          const venue = item.venue;

          const result = await this.teamModel.findOneAndUpdate(
            { apiFootballId: team.id },
            {
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
            { upsert: true, returnDocument: 'after' },
          );
        }
        this.logger.log(`Synced ${teams.length} teams from league ${leagueId}`);
      }
    } catch (error) {
      this.logger.error('Failed to sync teams', error);
    }
  }
}
