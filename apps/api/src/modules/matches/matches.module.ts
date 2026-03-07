import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { Match, MatchSchema } from '../../schemas/match.schema';
import { Player, PlayerSchema, Team, TeamSchema } from '../../schemas';
import { MatchVote, MatchVoteSchema } from '../../schemas/match-vote.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Match.name, schema: MatchSchema },
      { name: Player.name, schema: PlayerSchema },
      { name: MatchVote.name, schema: MatchVoteSchema },
      { name: Team.name, schema: TeamSchema },
    ]),
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
