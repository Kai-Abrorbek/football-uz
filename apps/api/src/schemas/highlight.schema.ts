import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HighlightDocument = Highlight & Document;

@Schema({ timestamps: true })
export class Highlight extends Document {
  @Prop({ required: true, unique: true })
  matchId: string;

  @Prop()
  videoId: string;

  @Prop()
  title: string;

  @Prop()
  thumbnail: string;

  @Prop()
  duration: string;

  @Prop()
  publishedAt: string;
}

export const HighlightSchema = SchemaFactory.createForClass(Highlight);
