import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { GptService } from './gpt.service';
import { Prediction, PredictionSchema } from '../../schemas/prediction.schema';
import { Match, MatchSchema } from '../../schemas/match.schema';
import { Standing, StandingSchema } from '../../schemas/standing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prediction.name, schema: PredictionSchema },
      { name: Match.name, schema: MatchSchema },
      { name: Standing.name, schema: StandingSchema },
    ]),
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService, GptService],
  exports: [PredictionsService, GptService],
})
export class PredictionsModule {}
