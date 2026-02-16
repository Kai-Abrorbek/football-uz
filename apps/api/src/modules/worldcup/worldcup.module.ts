import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorldCupController } from './worldcup.controller';
import { WorldCupService } from './worldcup.service';
import {
  WorldCup2026,
  WorldCup2026Schema,
} from '../../schemas/world-cup-2026.schema';
import { Match, MatchSchema } from '../../schemas/match.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorldCup2026.name, schema: WorldCup2026Schema },
      { name: Match.name, schema: MatchSchema },
    ]),
  ],
  controllers: [WorldCupController],
  providers: [WorldCupService],
  exports: [WorldCupService],
})
export class WorldCupModule {}
