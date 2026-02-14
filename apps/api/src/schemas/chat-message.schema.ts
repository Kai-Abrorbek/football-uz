import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ _id: false })
export class Message {
  @Prop({ enum: ['user', 'assistant'], required: true })
  role: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: () => new Date() })
  timestamp: Date;
}

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop({ type: [Message], default: [] })
  messages: Message[];

  @Prop({ enum: ['uz', 'ru', 'en'], default: 'uz' })
  language: string;

  @Prop({ default: 0 })
  tokensUsed: number;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// 인덱스
ChatMessageSchema.index({ userId: 1, createdAt: -1 });
ChatMessageSchema.index({ sessionId: 1 }, { unique: true });
// TTL: 30일 후 자동 삭제
ChatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
