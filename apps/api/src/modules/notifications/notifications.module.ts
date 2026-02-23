import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { FcmService } from './fcm.service';
import { NotificationScheduler } from './schedulers/notification.scheduler';
import {
  Notification,
  NotificationSchema,
} from '../../schemas/notification.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Match, MatchSchema } from '../../schemas/match.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
      { name: Match.name, schema: MatchSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, FcmService, NotificationScheduler],
  exports: [NotificationsService, FcmService],
})
export class NotificationsModule {}
