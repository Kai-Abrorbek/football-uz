import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiFootballService } from '../api-football.service';
import { Standing, StandingDocument } from '../../../schemas/standing.schema';
import {
  FEATURED_LEAGUES,
  SEASON,
} from 'apps/api/src/constants/leagues.constant';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Match, MatchDocument } from 'apps/api/src/schemas';

@Injectable()
export class StandingScheduler {
  private readonly logger = new Logger(StandingScheduler.name);
  private readonly FEATURED_LEAGUES = FEATURED_LEAGUES;

  constructor(
    private apiFootballService: ApiFootballService,
    @InjectModel(Standing.name) private standingModel: Model<StandingDocument>,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Cron('0 */3 * * *')
  async syncStandings() {
    this.logger.log('Syncing standings...');
    const season = SEASON;

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

        // ✅ DB 업데이트 후 캐시 삭제
        await this.cacheManager.del(`standings:${leagueId}:${season}`);
        await this.cacheManager.del(`standings:all:${season}`);
        this.logger.log(`🗑️ 캐시 삭제: standings:${leagueId}:${season}`);
      }

      this.logger.log(
        `Synced standings for ${this.FEATURED_LEAGUES.length} leagues`,
      );
    } catch (error) {
      this.logger.error('Failed to sync standings', error);
    }
  }

  // 1분마다 체크 - 경기 종료 후 5분 된 경기 있으면 해당 리그 순위표 업데이트
  @Cron('*/1 * * * *')
  async syncStandingsAfterMatch() {
    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const sixMinAgo = new Date(Date.now() - 6 * 60 * 1000);

      // 종료된 지 5~6분 된 경기 찾기
      const recentlyFinished = await this.matchModel
        .find({
          'status.short': 'FT',
          updatedAt: { $gte: sixMinAgo, $lte: fiveMinAgo },
        })
        .distinct('league.id');

      if (recentlyFinished.length === 0) return;

      this.logger.log(
        `Update the leaderboard for ${recentlyFinished.length} league matches that have ended`,
      );

      for (const leagueId of recentlyFinished) {
        await this.syncLeagueSeason(leagueId, SEASON);
        await this.sleep(500);
      }
    } catch (error) {
      this.logger.error('Failed to sync standings after match', error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

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

      // ✅ 캐시 삭제
      await this.cacheManager.del(`standings:${leagueId}:${season}`);
      await this.cacheManager.del(`standings:all:${season}`);

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
