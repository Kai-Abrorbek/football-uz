import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaguesController } from './leagues.controller';
import { LeaguesService } from './leagues.service';
import { League, LeagueSchema } from '../../schemas/league.schema';
import { ApiFootballModule } from '../api-football/api-football.module';
import { LeagueScheduler } from './schedulers/league.scheduler';
import { Team, TeamSchema } from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: League.name, schema: LeagueSchema },
      { name: Team.name, schema: TeamSchema },
    ]),
    ApiFootballModule,
  ],
  controllers: [LeaguesController],
  providers: [LeaguesService, LeagueScheduler],
  exports: [LeaguesService],
})
export class LeaguesModule {}
