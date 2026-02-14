import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class NotificationSettings {
  @Prop({ default: false })
  matchStart: boolean;

  @Prop({ default: false })
  goals: boolean;

  @Prop({ default: false })
  matchEnd: boolean;

  @Prop({ default: false })
  news: boolean;

  @Prop({ default: false })
  predictions: boolean;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  username: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  emailVerificationExpires?: Date;

  @Prop()
  googleId?: string;

  @Prop()
  telegramId?: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: null })
  avatar: string;

  @Prop({ enum: ['uz', 'ru', 'en'], default: 'uz' })
  language: string;

  @Prop({ default: true })
  darkMode: boolean;

  @Prop({ type: [Number], default: [] })
  favoriteTeams: number[];

  @Prop({ type: [Number], default: [] })
  favoritePlayers: number[];

  @Prop({ type: [Number], default: [] })
  favoriteLeagues: number[];

  @Prop({ type: [String], default: [] })
  fcmTokens: string[];

  @Prop({
    type: NotificationSettings,
  })
  notificationSettings: NotificationSettings;

  @Prop({ enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  lastLoginAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// 인덱스
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ favoriteTeams: 1 });
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });
UserSchema.index({ telegramId: 1 }, { unique: true, sparse: true });
