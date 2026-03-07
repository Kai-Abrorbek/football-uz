import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MatchVoteDocument = MatchVote & Document;

@Schema({ timestamps: true })
export class MatchVote {
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true })
  matchId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['home', 'draw', 'away'] })
  vote: string;
}

export const MatchVoteSchema = SchemaFactory.createForClass(MatchVote);

// 유저당 경기당 1표만
MatchVoteSchema.index({ matchId: 1, userId: 1 }, { unique: true });
