import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Player, Team } from 'apps/api/src/schemas';
import {
  FEATURED_LEAGUES,
  SEASON,
} from 'apps/api/src/constants/leagues.constant';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from '@nestjs/cache-manager';

@Injectable()
export class PlayerScheduler {
  private readonly logger = new Logger(PlayerScheduler.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    @InjectModel('Player') private playerModel: Model<Player>,
    @InjectModel('Team') private teamModel: Model<Team>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('API_FOOTBALL_KEY') || '';
    this.baseUrl =
      this.configService.get<string>('API_FOOTBALL_BASE_URL') || '';
  }

  // 매일 오전 4시에 득점왕/어시스트왕 업데이트
  @Cron('0 4 * * *')
  async syncTopPlayers() {
    this.logger.log('득점왕/어시스트왕 동기화 시작');

    const season = SEASON;

    for (const leagueId of FEATURED_LEAGUES) {
      await this.syncTopScorers(leagueId, season);
      await this.syncTopAssists(leagueId, season);
      await this.delay(1000); // API 호출 간격
    }

    this.logger.log('득점왕/어시스트왕 동기화 완료');
  }

  public async syncTopScorers(leagueId: number, season: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/players/topscorers`, {
          headers: {
            'x-apisports-key': this.apiKey,
          },
          params: {
            league: leagueId,
            season: season,
          },
        }),
      );

      const players = response.data.response;
      for (const item of players) {
        const playerData = item.player;
        const stat0 = item.statistics?.[0];

        // 팀 찾기
        const team = await this.teamModel.findOne({
          apiFootballId: stat0.team.id,
        });

        if (!team) continue;

        const nextStat = {
          team: {
            id: stat0?.team?.id,
            name: stat0?.team?.name,
            logo: stat0?.team?.logo,
          },
          league: {
            id: stat0?.league?.id,
            name: stat0?.league?.name,
            season: stat0?.league?.season,
          },

          games: {
            appearences:
              stat0?.games?.appearences ?? stat0?.games?.appearances ?? 0,
            minutes: stat0?.games?.minutes ?? 0,
            rating: stat0?.games?.rating ?? null,
            position: stat0?.games?.position ?? null,
            number: stat0?.games?.number ?? null,
          },

          goals: {
            total: stat0?.goals?.total ?? 0,
            assists: stat0?.goals?.assists ?? 0,
          },

          shots: {
            total: stat0?.shots?.total ?? null,
            on: stat0?.shots?.on ?? null,
          },

          passes: {
            total: stat0?.passes?.total ?? null,
            key: stat0?.passes?.key ?? null,
            accuracy: stat0?.passes?.accuracy ?? null,
          },

          tackles: {
            total: stat0?.tackles?.total ?? null,
            blocks: stat0?.tackles?.blocks ?? null,
            interceptions: stat0?.tackles?.interceptions ?? null,
          },

          duels: {
            total: stat0?.duels?.total ?? null,
            won: stat0?.duels?.won ?? null,
          },

          dribbles: {
            attempts: stat0?.dribbles?.attempts ?? null,
            success: stat0?.dribbles?.success ?? null,
            past: stat0?.dribbles?.past ?? null,
          },

          fouls: {
            drawn: stat0?.fouls?.drawn ?? null,
            committed: stat0?.fouls?.committed ?? null,
          },

          cards: {
            yellow: stat0?.cards?.yellow ?? 0,
            red: stat0?.cards?.red ?? 0,
          },

          penalty: {
            scored: stat0?.penalty?.scored ?? 0,
            missed: stat0?.penalty?.missed ?? 0,
          },

          raw: stat0, // ✅ 원본 보관(선택)
        };

        // 선수 업데이트 또는 생성
        await this.playerModel.findOneAndUpdate(
          { apiFootballId: playerData.id },

          {
            statistics: [nextStat],
            lastSyncAt: new Date(),
          },
          {
            upsert: true,
            returnDocument: 'after',
          },
        );

        await this.cacheManager.del(`player:detail:${playerData.id}`);
      }

      this.logger.log(`리그 ${leagueId} 득점왕 동기화 완료`);
    } catch (error) {
      this.logger.error(`리그 ${leagueId} 득점왕 동기화 실패:`, error.message);
    }
  }

  public async syncTopAssists(leagueId: number, season: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/players/topassists`, {
          headers: {
            'x-apisports-key': this.apiKey,
          },
          params: {
            league: leagueId,
            season: season,
          },
        }),
      );

      const players = response.data.response;

      for (const item of players) {
        const playerData = item.player;
        const stat0 = item.statistics?.[0];

        const team = await this.teamModel.findOne({
          apiFootballId: stat0.team.id,
        });

        if (!team) continue;

        const nextStat = {
          team: {
            id: stat0?.team?.id,
            name: stat0?.team?.name,
            logo: stat0?.team?.logo,
          },
          league: {
            id: stat0?.league?.id,
            name: stat0?.league?.name,
            season: stat0?.league?.season,
          },

          games: {
            appearences:
              stat0?.games?.appearences ?? stat0?.games?.appearances ?? 0,
            minutes: stat0?.games?.minutes ?? 0,
            rating: stat0?.games?.rating ?? null,
            position: stat0?.games?.position ?? null,
            number: stat0?.games?.number ?? null,
          },

          goals: {
            total: stat0?.goals?.total ?? 0,
            assists: stat0?.goals?.assists ?? 0,
          },

          shots: {
            total: stat0?.shots?.total ?? null,
            on: stat0?.shots?.on ?? null,
          },

          passes: {
            total: stat0?.passes?.total ?? null,
            key: stat0?.passes?.key ?? null,
            accuracy: stat0?.passes?.accuracy ?? null,
          },

          tackles: {
            total: stat0?.tackles?.total ?? null,
            blocks: stat0?.tackles?.blocks ?? null,
            interceptions: stat0?.tackles?.interceptions ?? null,
          },

          duels: {
            total: stat0?.duels?.total ?? null,
            won: stat0?.duels?.won ?? null,
          },

          dribbles: {
            attempts: stat0?.dribbles?.attempts ?? null,
            success: stat0?.dribbles?.success ?? null,
            past: stat0?.dribbles?.past ?? null,
          },

          fouls: {
            drawn: stat0?.fouls?.drawn ?? null,
            committed: stat0?.fouls?.committed ?? null,
          },

          cards: {
            yellow: stat0?.cards?.yellow ?? 0,
            red: stat0?.cards?.red ?? 0,
          },

          penalty: {
            scored: stat0?.penalty?.scored ?? 0,
            missed: stat0?.penalty?.missed ?? 0,
          },

          raw: stat0, // ✅ 원본 보관(선택)
        };

        await this.playerModel.findOneAndUpdate(
          { apiFootballId: playerData.id },
          {
            statistics: [nextStat],
            lastSyncAt: new Date(),
          },
          {
            upsert: true,
            returnDocument: 'after',
          },
        );

        await this.cacheManager.del(`player:detail:${playerData.id}`);
      }
      this.logger.log(`리그 ${leagueId} 어시스트왕 동기화 완료`);
    } catch (error) {
      this.logger.error(
        `리그 ${leagueId} 어시스트왕 동기화 실패:`,
        error.message,
      );
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async syncPlayers(
    leagueId: number,
    season: number,
    page: number,
  ): Promise<any> {
    this.logger.log('전부 선수 동기화 시작');
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/players`, {
          headers: {
            'x-apisports-key': this.apiKey,
          },
          params: {
            league: leagueId,
            season: season,
            page: 1,
          },
        }),
      );

      return response.data;
    } catch (err) {
      console.log(err);
    }

    this.logger.log('전부 선수 동기화 완료');
  }
}
