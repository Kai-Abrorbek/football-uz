import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ _id: false })
export class NotificationMultiLang {
  @Prop()
  uz: string;

  @Prop()
  ru: string;

  @Prop()
  en: string;
}

@Schema({ _id: false })
export class NotificationData {
  @Prop()
  screen: string; // "Match" | "News" | "Prediction"

  @Prop()
  referenceId: string;
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId: Types.ObjectId | null;

  @Prop({
    required: true,
    enum: ['matchStart', 'goal', 'matchEnd', 'news', 'prediction', 'general'],
  })
  type: string;

  @Prop({ type: NotificationMultiLang, required: true })
  title: NotificationMultiLang;

  @Prop({ type: NotificationMultiLang, required: true })
  body: NotificationMultiLang;

  @Prop({ type: NotificationData })
  data: NotificationData;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  sentAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// 인덱스
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ sentAt: -1 });
// TTL: 90일 후 자동 삭제
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
