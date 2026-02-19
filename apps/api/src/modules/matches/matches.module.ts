import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { Match, MatchSchema } from '../../schemas/match.schema';
import { Player, PlayerSchema } from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Match.name, schema: MatchSchema },
      { name: Player.name, schema: PlayerSchema },
    ]),
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
