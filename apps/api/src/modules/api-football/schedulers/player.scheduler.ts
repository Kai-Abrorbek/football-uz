import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiFootballService } from '../api-football.service';
import { Player, PlayerDocument } from '../../../schemas/player.schema';
import {
  LeagueRecord,
  LeagueRecordDocument,
} from '../../../schemas/league-record.schema';
import { FEATURED_LEAGUES, SEASON } from '../../../constants/leagues.constant';

@Injectable()
export class PlayerScheduler {
  private readonly logger = new Logger(PlayerScheduler.name);
  private readonly FEATURED_LEAGUES = FEATURED_LEAGUES;

  constructor(
    private apiFootballService: ApiFootballService,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    @InjectModel(LeagueRecord.name)
    private leagueRecordModel: Model<LeagueRecordDocument>,
  ) {}

  // @Cron('0 */12 * * *')
  async syncTopScorers() {
    this.logger.log('Syncing top scorers...');
    const season = SEASON;

    try {
      for (const leagueId of this.FEATURED_LEAGUES) {
        const data = await this.apiFootballService.getTopScorers(
          leagueId,
          season,
        );
        const players = data.response;

        const rows = players.map((item, index) => ({
          rank: index + 1,
          player: {
            playerId: item.player.id,
            name: item.player.name,
            photo: item.player.photo,
          },
          team: {
            teamId: item.statistics[0].team.id,
            name: item.statistics[0].team.name,
            logo: item.statistics[0].team.logo,
          },
          value: item.statistics[0].goals.total || 0,
          raw: item,
        }));

        await this.leagueRecordModel.findOneAndUpdate(
          { leagueId, season, type: 'goals' },
          {
            leagueId,
            season,
            type: 'goals',
            rows,
            limit: 20,
            lastSyncAt: new Date(),
          },
          { upsert: true, returnDocument: 'after' },
        );

        for (const item of players) {
          await this.savePlayer(item);
        }
      }

      this.logger.log('Synced top scorers');
    } catch (error) {
      this.logger.error('Failed to sync top scorers', error);
    }
  }

  private async savePlayer(data: any) {
    const player = data.player;
    const stat0 = data.statistics[0];

    const nextStat = this.buildStat(stat0);

    await this.playerModel.findOneAndUpdate(
      { apiFootballId: player.id },
      {
        $set: {
          apiFootballId: player.id,
          name: player.name,
          firstname: player.firstname,
          lastname: player.lastname,
          nationality: player.nationality,
          photo: player.photo,
          age: player.age,
          birth: {
            date: player.birth?.date,
            place: player.birth?.place,
            country: player.birth?.country,
          },
          height: player.height,
          weight: player.weight,
          position: stat0.games?.position,
          currentTeam: {
            id: stat0.team?.id,
            name: stat0.team?.name,
            logo: stat0.team?.logo,
          },
          lastSyncAt: new Date(),
        },
      },
      { upsert: true },
    );

    await this.upsertStatistic(
      player.id,
      stat0.league.id,
      stat0.league.season,
      nextStat,
    );
  }

  async syncTopScorersBySeason(season: number, leagueId?: number) {
    const leagues = leagueId ? [leagueId] : this.FEATURED_LEAGUES;

    for (const id of leagues) {
      const scorers = await this.apiFootballService.getTopScorers(id, season);
      await this.saveLeagueRecord(
        id,
        season,
        'goals',
        scorers.response,
        'goals.total',
      );

      const assists = await this.apiFootballService.getTopAssists(id, season);
      await this.saveLeagueRecord(
        id,
        season,
        'assists',
        assists.response,
        'goals.assists',
      );

      const yellows = await this.apiFootballService.getTopYellowCards(
        id,
        season,
      );
      await this.saveLeagueRecord(
        id,
        season,
        'yellowCards',
        yellows.response,
        'cards.yellow',
      );

      await this.sleep(1000);
    }
  }

  private async saveLeagueRecord(
    leagueId: number,
    season: number,
    type: string,
    players: any[],
    valuePath: string,
  ) {
    const rows = players.map((item, index) => ({
      rank: index + 1,
      player: {
        playerId: item.player.id,
        name: item.player.name,
        photo: item.player.photo,
      },
      team: {
        teamId: item.statistics[0].team.id,
        name: item.statistics[0].team.name,
        logo: item.statistics[0].team.logo,
      },
      value:
        valuePath
          .split('.')
          .reduce((obj, key) => obj?.[key], item.statistics[0]) || 0,
      raw: item,
    }));

    await this.leagueRecordModel.findOneAndUpdate(
      { leagueId, season, type },
      { leagueId, season, type, rows, limit: 20, lastSyncAt: new Date() },
      { upsert: true },
    );

    for (const item of players) {
      await this.savePlayer(item);
    }
  }

  async syncAllPlayersBySeason(season: number, leagueId?: number) {
    const leagues = leagueId ? [leagueId] : FEATURED_LEAGUES;

    for (const id of leagues) {
      this.logger.log(`리그 ${id} 전체 선수 동기화 시작...`);

      const firstPage = await this.apiFootballService.getPlayersByLeague(
        id,
        season,
        1,
      );
      const totalPages = firstPage.paging?.total ?? 1;

      await this.savePlayers(firstPage.response);

      for (let page = 2; page <= totalPages; page++) {
        const data = await this.apiFootballService.getPlayersByLeague(
          id,
          season,
          page,
        );
        await this.savePlayers(data.response);
        await this.sleep(500);
      }

      this.logger.log(`리그 ${id} 전체 선수 ${totalPages}페이지 동기화 완료`);
      await this.sleep(1000);
    }
  }

  private async savePlayers(players: any[]) {
    for (const item of players) {
      const player = item.player;
      const stat0 = item.statistics?.[0];
      if (!player || !stat0) continue;

      const nextStat = this.buildStat(stat0);

      await this.playerModel.findOneAndUpdate(
        { apiFootballId: player.id },
        {
          $set: {
            apiFootballId: player.id,
            name: player.name,
            firstname: player.firstname,
            lastname: player.lastname,
            nationality: player.nationality,
            photo: player.photo,
            age: player.age,
            birth: {
              date: player.birth?.date,
              place: player.birth?.place,
              country: player.birth?.country,
            },
            height: player.height,
            weight: player.weight,
            position: stat0.games?.position,
            currentTeam: {
              id: stat0.team?.id,
              name: stat0.team?.name,
              logo: stat0.team?.logo,
            },
            lastSyncAt: new Date(),
          },
        },
        { upsert: true },
      );

      await this.upsertStatistic(
        player.id,
        stat0.league.id,
        stat0.league.season,
        nextStat,
      );
    }
  }

  private buildStat(stat0: any) {
    return {
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
    };
  }

  private async upsertStatistic(
    apiFootballId: number,
    leagueId: number,
    season: number,
    nextStat: any,
  ) {
    // 해당 리그+시즌 통계 있으면 교체
    const updated = await this.playerModel.findOneAndUpdate(
      {
        apiFootballId,
        'statistics.league.id': leagueId,
        'statistics.league.season': season,
      },
      { $set: { 'statistics.$': nextStat } },
    );

    // 없으면 추가
    if (!updated) {
      await this.playerModel.findOneAndUpdate(
        { apiFootballId },
        { $push: { statistics: nextStat } },
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
