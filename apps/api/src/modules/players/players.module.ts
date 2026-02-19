import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { Player, PlayerSchema } from '../../schemas/player.schema';
import { PlayerScheduler } from './schedulers/player.scheduler';
import { Team, TeamSchema } from '../../schemas';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
  ],
  controllers: [PlayersController],
  providers: [PlayersService, PlayerScheduler],
  exports: [PlayersService],
})
export class PlayersModule {}
