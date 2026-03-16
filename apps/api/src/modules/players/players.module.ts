import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { Player, PlayerSchema } from '../../schemas/player.schema';
import { Match, MatchSchema, Team, TeamSchema } from '../../schemas';
import { HttpModule } from '@nestjs/axios';
import { PlayerStatsScheduler } from './schedulers/player.scheduler';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Player.name, schema: PlayerSchema },
      { name: Team.name, schema: TeamSchema },
      { name: Match.name, schema: MatchSchema },
    ]),
  ],
  controllers: [PlayersController],
  providers: [PlayersService, PlayerStatsScheduler],
  exports: [PlayersService, PlayerStatsScheduler],
})
export class PlayersModule {}
