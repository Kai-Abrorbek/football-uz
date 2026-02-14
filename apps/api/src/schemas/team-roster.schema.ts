import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamRosterDocument = TeamRoster & Document;

@Schema({ _id: false })
export class RosterPlayer {
  @Prop({ required: true })
  playerId: number;

  @Prop({ required: true })
  name: string;

  @Prop()
  photo?: string;

  @Prop()
  position?: string;

  @Prop()
  number?: number;
}

@Schema({ timestamps: true })
export class TeamRoster {
  @Prop({ required: true })
  teamId: number;

  @Prop({ required: true })
  season: number;

  @Prop({ type: [RosterPlayer], default: [] })
  players: RosterPlayer[];

  @Prop()
  lastSyncAt?: Date;
}

export const TeamRosterSchema = SchemaFactory.createForClass(TeamRoster);

TeamRosterSchema.index({ teamId: 1, season: 1 }, { unique: true });
TeamRosterSchema.index({ lastSyncAt: -1 });
