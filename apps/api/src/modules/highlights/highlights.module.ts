import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { HighlightsController } from './highlights.controller';
import { HighlightsService } from './highlights.service';
import { HighlightSchema, Highlight } from '../../schemas/highlight.schema';
import { MatchesModule } from '../matches/matches.module';
import { Match, MatchSchema } from '../../schemas';
import { MatchScheduler } from '../api-football/schedulers/match.scheduler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Highlight.name, schema: HighlightSchema },
      { name: Match.name, schema: MatchSchema },
    ]),
    HttpModule,
    MatchesModule,
  ],
  controllers: [HighlightsController],
  providers: [HighlightsService],
  exports: [HighlightsService],
})
export class HighlightsModule {}
