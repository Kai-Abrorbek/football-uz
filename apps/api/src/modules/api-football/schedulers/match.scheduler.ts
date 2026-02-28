import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiFootballService } from '../api-football.service';
import { Match, MatchDocument } from '../../../schemas/match.schema';
import { FEATURED_LEAGUES } from '../../../constants/leagues.constant';
import { DetailsScheduler } from './details.scheduler';

@Injectable()
export class MatchScheduler {
  private readonly logger = new Logger(MatchScheduler.name);
  private previousLiveIds: Set<number> = new Set();

  constructor(
    private apiFootballService: ApiFootballService,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
  ) {}

  // 서버 시작 시 1회 실행 - 리그별 전체 시즌 동기화
  async onModuleInit() {
    const count = await this.matchModel.countDocuments();

    if (count === 0) {
      this.logger.log('No match data found - starting initial sync...');
      await this.initialSync();
    } else {
      this.logger.log(`Initial sync skipped - ${count} matches already exist`);
    }

    const liveMatches = await this.matchModel
      .find({
        'status.short': { $in: ['1H', 'HT', '2H', 'ET', 'BT', 'P'] },
      })
      .exec();

    this.previousLiveIds = new Set(liveMatches.map((m) => m.apiFootballId));
    this.logger.log(`Initialized ${this.previousLiveIds.size} live matches`);
  }

  async initialSync() {
    this.logger.log('Starting initial league season sync...');
    const season = 2024;

    try {
      for (const leagueId of FEATURED_LEAGUES) {
        this.logger.log(`Syncing league ${leagueId} season ${season}...`);
        const data = await this.apiFootballService.getFixturesByLeague(
          leagueId,
          season,
        );
        const fixtures = data.response;

        for (const fixture of fixtures) {
          await this.saveFixture(fixture);
        }

        this.logger.log(
          `Synced ${fixtures.length} fixtures for league ${leagueId}`,
        );

        // API 쿼터 보호 - 리그당 1초 대기
        await this.sleep(1000);
      }

      this.logger.log('Initial sync completed');
    } catch (error) {
      this.logger.error('Initial sync failed', error);
    }
  }

  // 최근 경기 업데이트 - 6시간마다
  // @Cron('0 */6 * * *')
  // @Cron('*/1 * * * *')
  async syncRecentFixtures() {
    this.logger.log('Syncing recent fixtures...');
    const dates = this.getLast7Days();

    try {
      for (const date of dates) {
        const data = await this.apiFootballService.getFixturesByDate(date);
        const fixtures = data.response;

        for (const fixture of fixtures) {
          // FEATURED_LEAGUES에 있는 리그만 업데이트
          if (FEATURED_LEAGUES.includes(fixture.league.id)) {
            await this.saveFixture(fixture);
          }
        }

        await this.sleep(500); // API 보호
      }

      this.logger.log('Recent fixtures sync completed');
    } catch (error) {
      this.logger.error('Failed to sync recent fixtures', error);
    }
  }

  // 라이브 스코어 - 5분마다
  // @Cron('*/15 * * * *')
  async syncLiveScores() {
    this.logger.log('Syncing live scores...');

    try {
      const data = await this.apiFootballService.getFixtureLive();
      const liveFixtures = data.response;

      const currentLiveIds = new Set(
        (liveFixtures ?? [])
          .filter((live) => FEATURED_LEAGUES.includes(live.league.id))
          .map((live) => live.fixture.id) as number[],
      );

      const justFinished = [...this.previousLiveIds].filter(
        (id) => !currentLiveIds.has(id),
      );

      for (const id of justFinished) {
        await this.syncMatch(id);
        await this.sleep(1000);
      }

      this.previousLiveIds = currentLiveIds;

      if (liveFixtures.length === 0) {
        this.logger.log('No live matches');
        return;
      }

      for (const fixture of liveFixtures) {
        // FEATURED_LEAGUES만 업데이트
        if (FEATURED_LEAGUES.includes(fixture.league.id)) {
          await this.saveFixture(fixture);
        }
      }

      this.logger.log(`Synced ${liveFixtures.length} live matches`);
    } catch (error) {
      this.logger.error('Failed to sync live scores', error);
    }
  }

  private async syncMatch(apiFootballId: number) {
    try {
      const data = await this.apiFootballService.getFixtureById(apiFootballId);
      const liveFixture = data.response?.[0];

      if (!liveFixture) return;

      if (FEATURED_LEAGUES.includes(liveFixture.league.id)) {
        await this.saveFixture(liveFixture);
      }
    } catch (error) {
      this.logger.error('Failed to sync live scores', error);
    }
  }

  private async saveFixture(fixture: any) {
    const fixtureData = {
      apiFootballId: fixture.fixture.id,
      referee: fixture.fixture.referee,
      league: {
        id: fixture.league.id,
        name: fixture.league.name,
        country: fixture.league.country,
        logo: fixture.league.logo,
        season: fixture.league.season,
        round: fixture.league.round,
        standings: fixture.league.standings,
      },
      homeTeam: {
        id: fixture.teams.home.id,
        name: fixture.teams.home.name,
        logo: fixture.teams.home.logo,
        winner: fixture.teams.home.winner,
      },
      awayTeam: {
        id: fixture.teams.away.id,
        name: fixture.teams.away.name,
        logo: fixture.teams.away.logo,
        winner: fixture.teams.away.winner,
      },
      goals: {
        home: fixture.goals.home,
        away: fixture.goals.away,
      },
      score: {
        halftime:
          fixture.score.halftime.home !== null
            ? {
                home: fixture.score.halftime.home,
                away: fixture.score.halftime.away,
              }
            : undefined,
        fulltime:
          fixture.score.fulltime.home !== null
            ? {
                home: fixture.score.fulltime.home,
                away: fixture.score.fulltime.away,
              }
            : undefined,
        extratime:
          fixture.score.extratime.home !== null
            ? {
                home: fixture.score.extratime.home,
                away: fixture.score.extratime.away,
              }
            : undefined,
        penalty:
          fixture.score.penalty.home !== null
            ? {
                home: fixture.score.penalty.home,
                away: fixture.score.penalty.away,
              }
            : undefined,
      },
      status: {
        long: fixture.fixture.status.long,
        short: fixture.fixture.status.short,
        elapsed: fixture.fixture.status.elapsed,
        extra: fixture.fixture.status.extra,
      },
      date: new Date(fixture.fixture.date),
      venue: {
        name: fixture.fixture.venue?.name,
        city: fixture.fixture.venue?.city,
      },
      round: fixture.league.round,
      events:
        fixture.events?.map((event: any) => ({
          time: {
            elapsed: event.time.elapsed,
            extra: event.time.extra,
          },
          team: event.team
            ? {
                id: event.team.id,
                name: event.team.name,
                logo: event.team.logo,
              }
            : undefined,
          player: event.player
            ? {
                id: event.player.id,
                name: event.player.name,
              }
            : undefined,
          assist: event.assist
            ? {
                id: event.assist.id,
                name: event.assist.name,
              }
            : undefined,
          type: event.type,
          detail: event.detail,
          comments: event.comments,
        })) || [],
      lastSyncAt: new Date(),
    };

    await this.matchModel.findOneAndUpdate(
      { apiFootballId: fixture.fixture.id },
      fixtureData,
      { upsert: true, returnDocument: 'after' },
    );
  }

  private getLast7Days(): string[] {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
