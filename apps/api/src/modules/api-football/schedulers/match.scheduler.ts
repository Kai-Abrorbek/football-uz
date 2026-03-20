import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiFootballService } from '../api-football.service';
import { Match, MatchDocument } from '../../../schemas/match.schema';
import { FEATURED_LEAGUES, SEASON } from '../../../constants/leagues.constant';
import { PredictionsService } from '../../predictions/predictions.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { DetailsScheduler } from './details.scheduler';

@Injectable()
export class MatchScheduler {
  private readonly logger = new Logger(MatchScheduler.name);
  private previousLiveIds: Set<number> = new Set();
  private statsLastSyncMap = new Map<number, Date>();

  constructor(
    private apiFootballService: ApiFootballService,
    private predictionService: PredictionsService,
    private detailScheduler: DetailsScheduler,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    const season = SEASON;

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
  async syncRecentFixtures() {
    this.logger.log('Syncing recent fixtures...');
    const dates = this.getLast7Days();
    try {
      for (const date of dates) {
        const data = await this.apiFootballService.getFixturesByDate(date);
        const fixtures = data.response;

        for (const fixture of fixtures) {
          if (FEATURED_LEAGUES.includes(fixture.league.id)) {
            await this.saveFixture(fixture);
          }
        }

        await this.cacheManager.del(`matches:date:${date}:league:all`);
        await this.sleep(500); // API 보호
      }

      this.logger.log('Recent fixtures sync completed');
    } catch (error) {
      this.logger.error('Failed to sync recent fixtures', error.message);
    }
  }
  @Cron('*/30 * * * * *')
  async syncLiveScores() {
    try {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      // 현재 라이브 상태이거나 최근 2시간 내 시작한 경기 체크
      const liveCount = await this.matchModel.countDocuments({
        $or: [
          { 'status.short': { $in: ['1H', 'HT', '2H', 'ET', 'BT', 'P'] } },
          {
            'status.short': 'NS',
            date: { $gte: twoHoursAgo, $lte: now },
          },
        ],
      });

      if (liveCount === 0) {
        this.logger.log(
          'No live or recently started matches - skipping API call',
        );
        return;
      }

      this.logger.log(`${liveCount} potential live matches found - syncing...`);

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

      if (justFinished.length > 0) {
        await this.cacheManager.del('matches:live');
        this.logger.log(`🗑️ 종료된 경기 캐시 삭제`);
      }

      this.previousLiveIds = currentLiveIds;

      if (liveFixtures.length === 0) {
        this.logger.log('No live matches from API');
        await this.cacheManager.del('matches:live');
        return;
      }

      for (const fixture of liveFixtures) {
        if (FEATURED_LEAGUES.includes(fixture.league.id)) {
          await this.saveFixture(fixture);
        }
      }

      await this.cacheManager.del('matches:live');
      this.logger.log(`Synced ${liveFixtures.length} live matches`);
    } catch (error) {
      this.logger.error('Failed to sync live scores', error);
    }
  }

  public async syncMatch(apiFootballId: number) {
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

  public async saveFixture(fixture: any) {
    const fixtureId = fixture.fixture.id;
    const status = fixture.fixture.status.short;

    // 통계 가져올지 결정
    const isFinished = ['FT', 'AET', 'PEN'].includes(status);
    const lastStatsSync = this.statsLastSyncMap.get(fixtureId);
    const twentyMinAgo = new Date(Date.now() - 20 * 60 * 1000);
    const shouldSyncStats =
      isFinished || !lastStatsSync || lastStatsSync < twentyMinAgo;

    const result = shouldSyncStats
      ? await this.syncMatchDetails(fixtureId)
      : undefined;

    const statistics = result ? result.statistics : undefined;
    const statsData = result ? result.statsData : undefined;

    if (shouldSyncStats) {
      this.statsLastSyncMap.set(fixtureId, new Date());
    }

    const fixtureData: any = {
      $set: {
        apiFootballId: fixtureId,
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
        lastSyncAt: new Date(),
        updatedAt: new Date(),
      },
    };

    // 통계 있을 때만 업데이트
    if (statistics !== undefined) {
      fixtureData.$set.statistics = statistics;
    }

    if (statistics !== undefined) {
      fixtureData.$set.statistics = statistics;
      fixtureData.$set.statisticsRaw = statsData?.response;
    }

    // events 있을 때만 업데이트
    if (fixture.events?.length > 0) {
      fixtureData.$set.events =
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
        })) || [];
    }

    await this.matchModel.findOneAndUpdate(
      { apiFootballId: fixtureId },
      fixtureData,
      { upsert: true, returnDocument: 'after' },
    );

    // NS 또는 1H 상태일 때 예측 생성
    if (status === 'NS' || status === '1H') {
      this.predictionService.createPrediction(fixtureId).catch((err) => {
        this.logger.warn(`예측 생성 실패 (${fixtureId}): ${err.message}`);
      });
    }
  }

  private async syncMatchDetails(fixtureId: number) {
    try {
      const statsData =
        await this.apiFootballService.getFixtureStatistics(fixtureId);
      const statistics = this.detailScheduler.parseStatistics(
        statsData.response,
      );

      return { statistics, statsData };
    } catch (error: any) {
      this.logger.error(
        `Failed to sync details for fixture ${fixtureId}`,
        error,
      );
      return false;
    }
  }

  private getLast7Days(): string[] {
    const dates: string[] = [];
    for (let i = 0; i < 1; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async syncLeagueFixtures(leagueId: number, season: number) {
    const data = await this.apiFootballService.getFixturesByLeague(
      leagueId,
      season,
    );
    const fixtures = data.response;

    for (const fixture of fixtures) {
      await this.saveFixture(fixture);
      await this.sleep(200);
    }

    this.logger.log(
      `Synced ${fixtures.length} fixtures for league ${leagueId} season ${season}`,
    );
  }
}
