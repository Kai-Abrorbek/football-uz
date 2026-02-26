import { forwardRef, Module } from '@nestjs/common';
import { FixtureabsenceService } from './fixtureabsence.service';
import { FixtureabsenceController } from './fixtureabsence.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FixtureAbsence,
  FixtureAbsenceSchema,
} from '../../schemas/fixture-absence.schema';
import { ApiFootballModule } from '../api-football/api-football.module';
import { Match, MatchSchema } from '../../schemas';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [
    MatchesModule,
    forwardRef(() => ApiFootballModule),
    MongooseModule.forFeature([
      { name: FixtureAbsence.name, schema: FixtureAbsenceSchema },
      { name: Match.name, schema: MatchSchema },
    ]),
  ],
  providers: [FixtureabsenceService],
  controllers: [FixtureabsenceController],
  exports: [FixtureabsenceService],
})
export class FixtureabsenceModule {}
