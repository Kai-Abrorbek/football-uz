import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { Team, TeamSchema } from '../../schemas/team.schema';
import { LeaguesModule } from '../leagues/leagues.module';
import { Match, MatchSchema } from '../../schemas';

@Module({
  imports: [
    LeaguesModule,
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: Match.name, schema: MatchSchema },
    ]),
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
