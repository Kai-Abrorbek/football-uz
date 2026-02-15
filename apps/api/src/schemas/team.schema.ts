import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamDocument = Team & Document;

@Schema({ _id: false })
export class TeamVenue {
  @Prop()
  name: string;

  @Prop()
  city: string;

  @Prop()
  capacity: number;

  @Prop()
  image: string;
}

@Schema({ _id: false })
export class Coach {
  @Prop()
  name: string;

  @Prop()
  photo: string;

  @Prop()
  nationality: string;
}

@Schema({ _id: false })
export class LeagueEntry {
  @Prop()
  id: number;

  @Prop()
  name: string;

  @Prop()
  season: number;
}

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true })
  apiFootballId: number;

  @Prop({ required: true })
  name: string;

  @Prop()
  code: string;

  @Prop()
  country: string;

  @Prop()
  founded: number;

  @Prop()
  logo: string;

  @Prop({ type: TeamVenue })
  venue: TeamVenue;

  @Prop({ type: Coach })
  coach: Coach;

  @Prop({ type: [LeagueEntry], default: [] })
  leagues: LeagueEntry[];

  @Prop()
  form: string;

  @Prop()
  lastSyncAt: Date;
}

export const TeamSchema = SchemaFactory.createForClass(Team);

// 인덱스
TeamSchema.index({ apiFootballId: 1 }, { unique: true });
TeamSchema.index({ country: 1 });
TeamSchema.index({ name: 'text' });
