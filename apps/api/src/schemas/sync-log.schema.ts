import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SyncLogDocument = SyncLog & Document;

@Schema({ timestamps: true })
export class SyncLog {
  @Prop({ required: true })
  job: string; // ex) "fixtures_today", "standings_league", "team_roster"

  @Prop()
  leagueId?: number;

  @Prop()
  teamId?: number;

  @Prop()
  season?: number;

  @Prop()
  date?: string; // YYYY-MM-DD

  @Prop({ default: 0 })
  requestCount: number;

  @Prop({ default: 0 })
  savedCount: number;

  @Prop({ default: 'success' })
  status: 'success' | 'fail';

  @Prop()
  errorCode?: string; // ex) "429", "401"

  @Prop()
  errorMessage?: string;

  @Prop()
  startedAt?: Date;

  @Prop()
  finishedAt?: Date;
}

export const SyncLogSchema = SchemaFactory.createForClass(SyncLog);

SyncLogSchema.index({ job: 1, createdAt: -1 });
SyncLogSchema.index({ leagueId: 1, season: 1, createdAt: -1 });
