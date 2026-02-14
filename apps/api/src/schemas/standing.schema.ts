import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StandingDocument = Standing & Document;

@Schema({ _id: false })
export class StandingLeagueInfo {
  @Prop({ required: true })
  id: number;

  @Prop()
  name?: string;

  @Prop()
  country?: string;

  @Prop()
  logo?: string;

  @Prop({ required: true })
  season: number;
}

@Schema({ _id: false })
export class StandingTeamInfo {
  @Prop({ required: true })
  id: number;

  @Prop()
  name?: string;

  @Prop()
  logo?: string;
}

@Schema({ _id: false })
export class StandingEntry {
  @Prop({ default: 0 })
  rank: number;

  @Prop({ type: StandingTeamInfo, required: true })
  team: StandingTeamInfo;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: 0 })
  played: number;

  @Prop({ default: 0 })
  win: number;

  @Prop({ default: 0 })
  draw: number;

  @Prop({ default: 0 })
  lose: number;

  @Prop({ default: 0 })
  goalsFor: number;

  @Prop({ default: 0 })
  goalsAgainst: number;

  @Prop({ default: 0 })
  goalsDiff: number;

  /** Recent 5 form like "WWDLW" (may be missing) */
  @Prop({ default: '' })
  form: string;

  /** Group name (cups / groups). League table might omit it */
  @Prop({ default: '' })
  group: string;
}

@Schema({ timestamps: true })
export class Standing {
  @Prop({ type: StandingLeagueInfo, required: true })
  league: StandingLeagueInfo;

  /**
   * API-Football standings is an array of groups:
   * response[0].league.standings => [ [rows...], [rows...] ... ]
   */
  @Prop({ type: [[StandingEntry]], default: [] })
  standings: StandingEntry[][];

  @Prop()
  lastSyncAt?: Date;
}

export const StandingSchema = SchemaFactory.createForClass(Standing);

/** Indexes */
StandingSchema.index({ 'league.id': 1, 'league.season': 1 }, { unique: true });
StandingSchema.index({ 'league.season': 1, updatedAt: -1 });
