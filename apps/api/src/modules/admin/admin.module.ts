import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Match, MatchSchema } from '../../schemas/match.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Team, TeamSchema } from '../../schemas';
import { Highlight, HighlightSchema } from '../../schemas/highlight.schema';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  NotificationHistory,
  NotificationHistorySchema,
} from '../../schemas/notification-history.schema';
import { BracketSlotService } from './bracket-slot.service';
import { BracketSlotController } from './bracket-slot.controller';
import {
  BracketSlot,
  BracketSlotSchema,
} from '../../schemas/bracket-slot.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Match.name, schema: MatchSchema },
      { name: User.name, schema: UserSchema },
      { name: Team.name, schema: TeamSchema },
      { name: Highlight.name, schema: HighlightSchema },
      { name: NotificationHistory.name, schema: NotificationHistorySchema },
      { name: BracketSlot.name, schema: BracketSlotSchema },
    ]),
    AuthModule,
    NotificationsModule,
  ],
  controllers: [AdminController, BracketSlotController],
  providers: [AdminService, BracketSlotService],
})
export class AdminModule {}
