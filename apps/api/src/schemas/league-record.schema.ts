import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeagueRecordDocument = LeagueRecord & Document;

export type LeagueRecordType = 'goals' | 'assists' | 'yellow' | 'red';

@Schema({ _id: false })
export class RecordPlayer {
  @Prop({ required: true })
  playerId: number;

  @Prop({ required: true })
  name: string;

  @Prop()
  photo?: string;
}

@Schema({ _id: false })
export class RecordTeam {
  @Prop({ required: true })
  teamId: number;

  @Prop({ required: true })
  name: string;

  @Prop()
  logo?: string;
}

@Schema({ _id: false })
export class LeagueRecordRow {
  @Prop({ default: 0 })
  rank: number;

  @Prop({ type: RecordPlayer, required: true })
  player: RecordPlayer;

  @Prop({ type: RecordTeam, required: true })
  team: RecordTeam;

  /** 골/어시/카드 개수 */
  @Prop({ required: true, default: 0 })
  value: number;

  /** 원본 통계(동점자 처리 등 대비) */
  @Prop({ type: Object, default: undefined })
  raw?: any;
}

@Schema({ timestamps: true })
export class LeagueRecord {
  @Prop({ required: true })
  leagueId: number;

  @Prop({ required: true })
  season: number;

  @Prop({ required: true, enum: ['goals', 'assists', 'yellow', 'red'] })
  type: LeagueRecordType;

  @Prop({ type: [LeagueRecordRow], default: [] })
  rows: LeagueRecordRow[];

  @Prop({ default: 20 })
  limit: number;

  @Prop()
  lastSyncAt?: Date;
}

export const LeagueRecordSchema = SchemaFactory.createForClass(LeagueRecord);

LeagueRecordSchema.index({ leagueId: 1, season: 1, type: 1 }, { unique: true });
LeagueRecordSchema.index({ lastSyncAt: -1 });
