import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FollowDocument = Follow & Document;

export type FollowType = 'league' | 'team' | 'player';

@Schema({ timestamps: true })
export class Follow {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['league', 'team', 'player'] })
  type: FollowType;

  /** API-Football id (leagueId/teamId/playerId) */
  @Prop({ required: true })
  targetId: number;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);

FollowSchema.index({ userId: 1, type: 1, targetId: 1 }, { unique: true });
FollowSchema.index({ type: 1, targetId: 1 });
