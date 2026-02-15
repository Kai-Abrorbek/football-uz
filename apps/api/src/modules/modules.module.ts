import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { UsersModule } from './users/users.module';
import { ApiFootballModule } from './api-football/api-football.module';
import { LeaguesModule } from './leagues/leagues.module';
import { MatchesModule } from './matches/matches.module';
import { TeamsModule } from './teams/teams.module';
import { PlayersModule } from './players/players.module';

@Module({
  imports: [
    AuthModule,
    AuthModule,
    EmailModule,
    UsersModule,
    ApiFootballModule,
    LeaguesModule,
    MatchesModule,
    TeamsModule,
    PlayersModule,
  ],
})
export class ModulesModule {}
