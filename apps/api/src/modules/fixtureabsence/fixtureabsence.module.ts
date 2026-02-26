import { forwardRef, Module } from '@nestjs/common';
import { FixtureabsenceService } from './fixtureabsence.service';
import { FixtureabsenceController } from './fixtureabsence.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FixtureAbsence,
  FixtureAbsenceSchema,
} from '../../schemas/fixture-absence.schema';
import { ApiFootballModule } from '../api-football/api-football.module';

@Module({
  imports: [
    forwardRef(() => ApiFootballModule),
    MongooseModule.forFeature([
      { name: FixtureAbsence.name, schema: FixtureAbsenceSchema },
    ]),
  ],
  providers: [FixtureabsenceService],
  controllers: [FixtureabsenceController],
  exports: [FixtureabsenceService],
})
export class FixtureabsenceModule {}
