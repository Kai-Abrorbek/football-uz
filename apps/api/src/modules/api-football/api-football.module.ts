import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiFootballService } from './api-football.service';
import { Match, MatchSchema } from '../../schemas/match.schema';
import { Team, TeamSchema } from '../../schemas/team.schema';
import { Player, PlayerSchema } from '../../schemas/player.schema';
import { Standing, StandingSchema } from '../../schemas/standing.schema';
import { League, LeagueSchema } from '../../schemas/league.schema';
import { SyncLog, SyncLogSchema } from '../../schemas/sync-log.schema';
import { MatchScheduler } from './schedulers/match.scheduler';
import { StandingScheduler } from './schedulers/standing.scheduler';
import { PlayerScheduler } from './schedulers/player.scheduler';
import { TeamScheduler } from './schedulers/team.scheduler';
import { LeagueRecord, LeagueRecordSchema } from '../../schemas';
import { ApiFootballController } from './api-football.controller';
import { DetailsScheduler } from './schedulers/details.scheduler';
import { FixtureabsenceModule } from '../fixtureabsence/fixtureabsence.module';
import { PredictionsModule } from '../predictions/predictions.module';
import { PlayersModule } from '../players/players.module';

@Module({
  imports: [
    forwardRef(() => FixtureabsenceModule),
    HttpModule,
    PredictionsModule,
    PlayersModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Match.name, schema: MatchSchema },
      { name: Team.name, schema: TeamSchema },
      { name: Player.name, schema: PlayerSchema },
      { name: Standing.name, schema: StandingSchema },
      { name: League.name, schema: LeagueSchema },
      { name: SyncLog.name, schema: SyncLogSchema },
      { name: LeagueRecord.name, schema: LeagueRecordSchema },
    ]),
  ],
  providers: [
    ApiFootballService,
    MatchScheduler,
    StandingScheduler,
    TeamScheduler,
    PlayerScheduler,
    DetailsScheduler,
  ],
  exports: [ApiFootballService, MatchScheduler],
  controllers: [ApiFootballController],
})
export class ApiFootballModule {}
