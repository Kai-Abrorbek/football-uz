import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsDocument = News & Document;

@Schema({ _id: false })
export class MultiLang {
  @Prop()
  uz: string;

  @Prop()
  ru: string;

  @Prop()
  en: string;
}

@Schema({ timestamps: true })
export class News {
  @Prop({ type: MultiLang, required: true })
  title: MultiLang;

  @Prop({ type: MultiLang, required: true })
  content: MultiLang;

  @Prop({ type: MultiLang })
  summary: MultiLang;

  @Prop()
  imageUrl: string;

  @Prop()
  source: string;

  @Prop()
  sourceUrl: string;

  @Prop({
    enum: ['transfer', 'match', 'injury', 'worldcup', 'uzbekistan', 'general'],
    default: 'general',
  })
  category: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [Number], default: [] })
  relatedTeams: number[];

  @Prop({ type: [Number], default: [] })
  relatedPlayers: number[];

  @Prop({ default: false })
  isPublished: boolean;

  @Prop()
  publishedAt: Date;

  @Prop({ default: 0 })
  viewCount: number;
}

export const NewsSchema = SchemaFactory.createForClass(News);

// 인덱스
NewsSchema.index({ publishedAt: -1 });
NewsSchema.index({ category: 1, publishedAt: -1 });
NewsSchema.index({ tags: 1 });
NewsSchema.index({ relatedTeams: 1 });
NewsSchema.index({ isPublished: 1 });
