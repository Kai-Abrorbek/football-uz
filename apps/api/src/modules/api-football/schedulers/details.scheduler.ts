import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiFootballService } from '../api-football.service';
import { Match, MatchDocument } from '../../../schemas/match.schema';
import { FixtureabsenceService } from '../../fixtureabsence/fixtureabsence.service';

@Injectable()
export class DetailsScheduler {
  private readonly logger = new Logger(DetailsScheduler.name);

  constructor(
    private apiFootballService: ApiFootballService,
    private fixtureAbsenceService: FixtureabsenceService,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
  ) {}

  // 경기 시작 1시간 전 - 매분 체크해서 딱 1시간 전에만 실행
  @Cron('* * * * *')
  async syncUpcomingMatchDetails() {
    this.logger.log('Checking for matches starting in 1 hour...');

    try {
      const now = new Date();
      const in59Min = new Date(now.getTime() + 59 * 60 * 1000);
      const in61Min = new Date(now.getTime() + 61 * 60 * 1000);

      // 정확히 약 1시간 후 시작하는 경기
      const upcomingMatches = await this.matchModel
        .find({
          'status.short': 'NS',
          date: {
            $gte: in59Min,
            $lte: in61Min,
          },
          lineups: { $exists: false }, // 아직 안 가져온 것만
        })
        .exec();

      for (const match of upcomingMatches) {
        await this.syncMatchDetails(match.apiFootballId);
        await this.sleep(2000);
      }

      if (upcomingMatches.length > 0) {
        this.logger.log(
          `Synced details for ${upcomingMatches.length} matches starting in 1 hour`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to sync upcoming match details', error);
    }
  }

  // 종료 직후 - 5분마다 체크
  // @Cron('*/15 * * * *')
  async syncFinishedMatchDetails() {
    this.logger.log('Checking recently finished matches...');

    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

      const matches = await this.matchModel
        .find({
          'status.short': 'FT',
          updatedAt: { $gte: fiveMinAgo },
          $or: [
            { lineups: { $exists: false } },
            { 'statistics.0': { $exists: false } },
          ],
        })
        .exec();

      for (const match of matches) {
        await this.syncMatchDetails(match.apiFootballId);
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
          lineups,
          statistics,
          statisticsRaw: statsData.response,
          events,
        },
      );

      this.logger.log(`Updated details for fixture ${fixtureId}`);
    } catch (error) {
      this.logger.error(
        `Failed to sync details for fixture ${fixtureId}`,
        error,
      );
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

  private parseStatistics(data: any) {
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

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
