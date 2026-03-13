import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationHistoryDocument = NotificationHistory & Document;

@Schema({ timestamps: true })
export class NotificationHistory extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  body: string;

  @Prop({ default: 'all' })
  target: string;

  @Prop({ default: 0 })
  successCount: number;

  @Prop({ default: 0 })
  failureCount: number;
}

export const NotificationHistorySchema =
  SchemaFactory.createForClass(NotificationHistory);
