import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiFootballService } from '../api-football.service';
import { Match, MatchDocument } from '../../../schemas/match.schema';
import { FixtureabsenceService } from '../../fixtureabsence/fixtureabsence.service';
import { Player, PlayerDocument } from 'apps/api/src/schemas';

@Injectable()
export class DetailsScheduler {
  private readonly logger = new Logger(DetailsScheduler.name);

  constructor(
    private apiFootballService: ApiFootballService,
    private fixtureAbsenceService: FixtureabsenceService,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
  ) {}

  @Cron('* * * * *')
  async syncUpcomingMatchDetails() {
    this.logger.log('Checking for matches starting in 1 hour...');

    try {
      const now = new Date();
      const in59Min = new Date(now.getTime() + 45 * 60 * 1000);
      const in61Min = new Date(now.getTime() + 47 * 60 * 1000);

      const in29Min = new Date(now.getTime() + 29 * 60 * 1000);
      const in31Min = new Date(now.getTime() + 31 * 60 * 1000);

      const in14Min = new Date(now.getTime() + 14 * 60 * 1000);
      const in16Min = new Date(now.getTime() + 16 * 60 * 1000);

      // 1시간 전 (기존) - 첫 시도
      const oneHourMatches = await this.matchModel
        .find({
          'status.short': 'NS',
          date: { $gte: in59Min, $lte: in61Min },
          lineups: { $exists: false },
          // lineupFetchAttempts: { $exists: false },
        })
        .exec();

      // 30분 전 - 2번째 시도
      const thirtyMinMatches = await this.matchModel
        .find({
          'status.short': 'NS',
          date: { $gte: in29Min, $lte: in31Min },
          lineups: { $exists: false },
          // lineupFetchAttempts: 1,
        })
        .exec();

      // 15분 전 - 마지막 시도
      const fifteenMinMatches = await this.matchModel
        .find({
          'status.short': 'NS',
          date: { $gte: in14Min, $lte: in16Min },
          lineups: { $exists: false },
          // lineupFetchAttempts: 2,
        })
        .exec();

      const allMatches = [
        ...oneHourMatches,
        ...thirtyMinMatches,
        ...fifteenMinMatches,
      ];

      for (const match of allMatches) {
        const success = await this.syncMatchDetails(match.apiFootballId);

        if (!success) {
          // 라인업 없으면 시도 횟수만 증가
          await this.matchModel.updateOne(
            { _id: match._id },
            { $inc: { lineupFetchAttempts: 1 } },
          );
        }

        await this.sleep(2000);
      }

      if (allMatches.length > 0) {
        this.logger.log(`Synced details for ${allMatches.length} matches`);
      }
    } catch (error) {
      this.logger.error('Failed to sync upcoming match details', error);
    }
  }

  // 종료 직후 - 1분마다 체크
  // @Cron('*/1 * * * *')
  async syncFinishedMatchDetails() {
    this.logger.log('Checking recently finished matches...');

    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

      const matches = await this.matchModel
        .find({
          'status.short': 'FT',
          updatedAt: { $gte: fiveMinAgo },
          detailsSyncedAfterFT: { $ne: true },
        })
        .exec();

      for (const match of matches) {
        const success = await this.syncMatchDetails(match.apiFootballId);

        if (success) {
          await this.syncMatchPlayerRatings(match);
          await this.matchModel.findByIdAndUpdate(match._id, {
            $set: { detailsSyncedAfterFT: true },
          });
        }
        await this.sleep(2000);
      }

      if (matches.length > 0) {
        this.logger.log(
          `Synced details for ${matches.length} finished matches`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to sync finished match details', error);
    }
  }

  async syncMatchDetails(fixtureId: number) {
    try {
      // fixtureAbsence
      await this.fixtureAbsenceService.saveFixtureAbsences(fixtureId);

      // Lineups
      const lineupsData =
        await this.apiFootballService.getFixtureLineups(fixtureId);
      const lineups = this.parseLineups(lineupsData.response);

      // Statistics
      const statsData =
        await this.apiFootballService.getFixtureStatistics(fixtureId);
      const statistics = this.parseStatistics(statsData.response);

      // Events
      const eventsData =
        await this.apiFootballService.getFixtureEvents(fixtureId);
      const events = this.parseEvents(eventsData.response);

      // DB 업데이트
      await this.matchModel.findOneAndUpdate(
        { apiFootballId: fixtureId },
        {
          $set: {
            lineups,
            statistics,
            statisticsRaw: statsData.response,
            events,
            'homeTeam.coach': lineupsData?.response[0]?.coach ?? undefined,
            'awayTeam.coach': lineupsData?.response[1]?.coach ?? undefined,
          },
        },
      );

      this.logger.log(`Updated details for fixture ${fixtureId}`);
      return !!lineups;
    } catch (error) {
      this.logger.error(
        `Failed to sync details for fixture ${fixtureId}`,
        error,
      );
      return false;
    }
  }

  private parseLineups(data: any) {
    if (!data || data.length === 0) return undefined;

    const home = data[0];
    const away = data[1];

    return {
      home: home
        ? {
            teamId: home.team?.id,
            formation: home.formation,
            startXI:
              home.startXI?.map((p: any) => ({
                playerId: p.player.id,
                playerName: p.player.name,
                number: p.player.number,
                pos: p.player.pos,
              })) || [],
            substitutes:
              home.substitutes?.map((p: any) => ({
                playerId: p.player.id,
                playerName: p.player.name,
                number: p.player.number,
                pos: p.player.pos,
              })) || [],
          }
        : undefined,
      away: away
        ? {
            teamId: away.team?.id,
            formation: away.formation,
            startXI:
              away.startXI?.map((p: any) => ({
                playerId: p.player.id,
                playerName: p.player.name,
                number: p.player.number,
                pos: p.player.pos,
              })) || [],
            substitutes:
              away.substitutes?.map((p: any) => ({
                playerId: p.player.id,
                playerName: p.player.name,
                number: p.player.number,
                pos: p.player.pos,
              })) || [],
          }
        : undefined,
    };
  }

  public parseStatistics(data: any) {
    if (!data || data.length === 0) return [];

    const stats: any[] = [];

    for (const teamStats of data) {
      const side = teamStats.team.id === data[0].team.id ? 'home' : 'away';
      const statsObj: any = { side };

      for (const stat of teamStats.statistics) {
        const key = this.normalizeStatKey(stat.type);
        statsObj[key] = stat.value;
      }

      stats.push(statsObj);
    }

    return stats;
  }

  private normalizeStatKey(type: string): string {
    const map: any = {
      'Ball Possession': 'possession',
      'Total Shots': 'shots',
      'Shots on Goal': 'shotsOnTarget',
      'Corner Kicks': 'corners',
      Fouls: 'fouls',
      'Yellow Cards': 'yellowCards',
      'Red Cards': 'redCards',
      Offsides: 'offsides',
      'Total passes': 'passes',
      'Passes %': 'passAccuracy',
    };
    return map[type] || type.toLowerCase().replace(/\s+/g, '');
  }

  private parseEvents(data: any) {
    if (!data || data.length === 0) return [];

    return data.map((event: any) => ({
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
    }));
  }

  private async syncMatchPlayerRatings(match: MatchDocument) {
    try {
      const data = await this.apiFootballService.getFixturePlayers(
        match.apiFootballId,
      );
      const teams = data.response;

      for (const team of teams) {
        const side = team.team.id === match.homeTeam.id ? 'home' : 'away';
        for (const player of team.players) {
          const rating = player.statistics[0]?.games?.rating;
          if (!rating) continue;

          // startXI 에서 찾기
          await this.matchModel.findByIdAndUpdate(
            match._id,
            {
              $set: {
                [`lineups.${side}.startXI.$[elem].rating`]: parseFloat(rating),
              },
            },
            {
              arrayFilters: [{ 'elem.playerId': player.player.id }],
            },
          );

          // substitutes 에서도 찾기
          await this.matchModel.findByIdAndUpdate(
            match._id,
            {
              $set: {
                [`lineups.${side}.substitutes.$[elem].rating`]:
                  parseFloat(rating),
              },
            },
            {
              arrayFilters: [{ 'elem.playerId': player.player.id }],
            },
          );
        }
      }

      this.logger.log(`선수 평점 저장 완료 (match: ${match.apiFootballId})`);
    } catch (e) {
      this.logger.error(
        `선수 평점 저장 실패 (match: ${match.apiFootballId})`,
        e,
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async syncDetailsBatch(
    season: number,
    leagueId?: number,
  ): Promise<{ processed: number; remaining: number }> {
    const filter: any = {
      'status.short': 'FT',
      'statistics.0': { $exists: false }, // detailsSynced 대신
    };

    if (leagueId) filter['league.id'] = leagueId;
    if (season) filter['league.season'] = season;

    const BATCH_SIZE = 2500;
    const matches = await this.matchModel.find(filter).limit(BATCH_SIZE).exec();
    const remaining =
      (await this.matchModel.countDocuments(filter)) - matches.length;
    let processed = 0;

    for (const match of matches) {
      const success = await this.syncMatchDetails(match.apiFootballId);
      if (success) processed++;
      await this.sleep(500);
    }

    this.logger.log(
      `디테일 배치 완료: ${processed}개 처리, ${remaining}개 남음`,
    );
    return { processed, remaining };
  }
}
