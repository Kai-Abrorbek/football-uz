import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiFootballService } from '../api-football.service';
import { Standing, StandingDocument } from '../../../schemas/standing.schema';
import { League, LeagueDocument } from '../../../schemas/league.schema';
import { FEATURED_LEAGUES } from 'apps/api/src/constants/leagues.constant';

@Injectable()
export class StandingScheduler {
  private readonly logger = new Logger(StandingScheduler.name);
  private readonly FEATURED_LEAGUES = FEATURED_LEAGUES; // EPL, La Liga, Ligue 1, Bundesliga, Serie A

  constructor(
    private apiFootballService: ApiFootballService,
    @InjectModel(Standing.name) private standingModel: Model<StandingDocument>,
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
  ) {}

  // 순위표 - 3시간마다
  @Cron('0 */3 * * *')
  async syncStandings() {
    this.logger.log('Syncing standings...');
    const season = 2024;

    try {
      for (const leagueId of this.FEATURED_LEAGUES) {
        const data = await this.apiFootballService.getStandings(
          leagueId,
          season,
        );
        const standingsData = data.response[0];

        if (!standingsData) continue;

        const standings = standingsData.league.standings.map((group) =>
          group.map((entry) => ({
            rank: entry.rank,
            team: {
              id: entry.team.id,
              name: entry.team.name,
              logo: entry.team.logo,
            },
            points: entry.points,
            played: entry.all.played,
            win: entry.all.win,
            draw: entry.all.draw,
            lose: entry.all.lose,
            goalsFor: entry.all.goals.for,
            goalsAgainst: entry.all.goals.against,
            goalsDiff: entry.goalsDiff,
            form: entry.form || '',
            group: entry.group || '',
          })),
        );

        await this.standingModel.findOneAndUpdate(
          { 'league.id': leagueId, 'league.season': season },
          {
            league: {
              id: standingsData.league.id,
              name: standingsData.league.name,
              country: standingsData.league.country,
              logo: standingsData.league.logo,
              season,
            },
            standings,
            lastSyncAt: new Date(),
          },
          { upsert: true, returnDocument: 'after' },
        );
      }

      this.logger.log(
        `Synced standings for ${this.FEATURED_LEAGUES.length} leagues`,
      );
    } catch (error) {
      this.logger.error('Failed to sync standings', error);
    }
  }

  // standing.scheduler.ts
  async syncLeagueSeason(leagueId: number, season: number) {
    this.logger.log(`Syncing league ${leagueId} season ${season}...`);

    try {
      const data = await this.apiFootballService.getStandings(leagueId, season);
      const standingsData = data.response[0];

      if (!standingsData) {
        this.logger.warn(
          `No standings data for league ${leagueId} season ${season}`,
        );
        return;
      }

      const standings = standingsData.league.standings.map((group) =>
        group.map((entry) => ({
          rank: entry.rank,
          team: {
            id: entry.team.id,
            name: entry.team.name,
            logo: entry.team.logo,
          },
          points: entry.points,
          played: entry.all.played,
          win: entry.all.win,
          draw: entry.all.draw,
          lose: entry.all.lose,
          goalsFor: entry.all.goals.for,
          goalsAgainst: entry.all.goals.against,
          goalsDiff: entry.goalsDiff,
          form: entry.form || '',
          group: entry.group || '',
        })),
      );

      await this.standingModel.findOneAndUpdate(
        { 'league.id': leagueId, 'league.season': season },
        {
          league: {
            id: standingsData.league.id,
            name: standingsData.league.name,
            country: standingsData.league.country,
            logo: standingsData.league.logo,
            season,
          },
          standings,
          lastSyncAt: new Date(),
        },
        { upsert: true, returnDocument: 'after' },
      );

      this.logger.log(
        `Synced standings for league ${leagueId} season ${season}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to sync standings for league ${leagueId}`,
        error,
      );
      throw error;
    }
  }
}
