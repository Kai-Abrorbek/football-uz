import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiFootballService } from '../../api-football/api-football.service';
import { League, LeagueDocument } from '../../../schemas/league.schema';
import { FEATURED_LEAGUES } from '../../../constants/leagues.constant';

@Injectable()
export class LeagueScheduler {
  private readonly logger = new Logger(LeagueScheduler.name);

  constructor(
    private apiFootballService: ApiFootballService,
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
  ) {}

  // 리그 정보 - 하루 1회
  @Cron('0 0 * * *')
  async syncLeagues() {
    this.logger.log('Syncing leagues...');
    try {
      const data = await this.apiFootballService.getLeagues(2024);
      const leagues = data.response;
      for (const item of leagues) {
        const league = item.league;
        const seasons = item.seasons || [];

        await this.leagueModel.findOneAndUpdate(
          { apiFootballId: league.id },
          {
            apiFootballId: league.id,
            name: league.name,
            type: league.type,
            logo: league.logo,
            country: item.country?.name,
            countryCode: item.country?.code,
            countryFlag: item.country?.flag,
            isFeatured: FEATURED_LEAGUES.includes(league.id),
            priority:
              FEATURED_LEAGUES.indexOf(league.id) >= 0
                ? FEATURED_LEAGUES.indexOf(league.id)
                : 999,
            seasons: seasons.map((s) => ({
              year: s.year,
              start: s.start,
              end: s.end,
              current: s.current,
              coverage: s.coverage,
            })),
            lastSyncAt: new Date(),
          },
          { upsert: true, returnDocument: 'after' },
        );
      }

      this.logger.log(`Synced ${leagues.length} leagues`);
    } catch (error) {
      this.logger.error('Failed to sync leagues', error);
    }
  }
}
