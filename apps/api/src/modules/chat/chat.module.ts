import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import {
  ChatMessage,
  ChatMessageSchema,
} from '../../schemas/chat-message.schema';
import { Match, MatchSchema } from '../../schemas/match.schema';
import { Team, TeamSchema } from '../../schemas/team.schema';
import { Player, PlayerSchema } from '../../schemas/player.schema';
import { Standing, StandingSchema } from '../../schemas/standing.schema';
import { PredictionsModule } from '../predictions/predictions.module';
import { LiveChatGateway } from './live-chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: Match.name, schema: MatchSchema },
      { name: Team.name, schema: TeamSchema },
      { name: Player.name, schema: PlayerSchema },
      { name: Standing.name, schema: StandingSchema },
    ]),
    PredictionsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, LiveChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
