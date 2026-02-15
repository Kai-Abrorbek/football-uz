import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StandingsController } from './standings.controller';
import { StandingsService } from './standings.service';
import { Standing, StandingSchema } from '../../schemas/standing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Standing.name, schema: StandingSchema },
    ]),
  ],
  controllers: [StandingsController],
  providers: [StandingsService],
  exports: [StandingsService],
})
export class StandingsModule {}
