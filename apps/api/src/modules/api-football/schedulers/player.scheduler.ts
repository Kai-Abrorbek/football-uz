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
import { FEATURED_LEAGUES } from 'apps/api/src/constants/leagues.constant';

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

  // 득점왕/도움왕 - 12시간마다
  // @Cron('0 */12 * * *')
  async syncTopScorers() {
    this.logger.log('Syncing top scorers...');
    const season = 2023;

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

        // 선수 정보도 저장
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
    const stats = data.statistics[0];

    await this.playerModel.findOneAndUpdate(
      { apiFootballId: player.id },
      {
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
        position: stats.games?.position,
        currentTeam: {
          id: stats.team?.id,
          name: stats.team?.name,
          logo: stats.team?.logo,
        },
        lastSyncAt: new Date(),
      },
      { upsert: true, returnDocument: 'after' },
    );
  }
}
