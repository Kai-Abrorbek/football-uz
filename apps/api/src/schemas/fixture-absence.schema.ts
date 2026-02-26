import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FixtureAbsenceDocument = FixtureAbsence & Document;

export type AbsenceStatus = 'injured' | 'suspended' | 'missing' | 'doubtful';

@Schema({ _id: false })
export class AbsencePlayer {
  @Prop({ required: true })
  playerId!: number;

  @Prop({ required: true })
  name!: string;

  @Prop()
  photo?: string;

  @Prop({
    required: true,
    enum: ['injured', 'suspended', 'missing', 'doubtful'],
  })
  status!: AbsenceStatus;

  @Prop()
  reason?: string; // ex) "Hamstring Injury", "Suspended - Red Card"

  @Prop()
  since?: Date; // optional

  @Prop()
  until?: Date; // optional

  @Prop()
  apiType?: string; // raw type from API-Football (optional)

  @Prop()
  apiDetail?: string; // raw detail (optional)

  @Prop()
  updatedAt?: Date; // when this player entry was last updated
}

@Schema({ _id: false })
export class FixtureAbsenceTeam {
  @Prop({ required: true })
  teamId!: number;

  @Prop({ required: true })
  name!: string;

  @Prop()
  logo?: string;

  @Prop({ type: [AbsencePlayer], default: [] })
  players!: AbsencePlayer[];
}

@Schema({
  collection: 'fixture_absences',
  timestamps: true, // createdAt / updatedAt
})
export class FixtureAbsence {
  @Prop({ required: true, unique: true, index: true })
  fixtureId!: number;

  @Prop({ required: true, index: true })
  leagueId!: number;

  @Prop({ required: true, index: true })
  season!: number; // ex) 2025

  @Prop({ required: true, index: true })
  date!: Date;

  @Prop({ required: true, type: FixtureAbsenceTeam })
  home!: FixtureAbsenceTeam;

  @Prop({ required: true, type: FixtureAbsenceTeam })
  away!: FixtureAbsenceTeam;

  @Prop({ default: 'api-football' })
  source!: string;

  @Prop()
  fetchedAt?: Date; // when we fetched from API
}

export const FixtureAbsenceSchema =
  SchemaFactory.createForClass(FixtureAbsence);

// ---- helpful indexes (optional) ----
FixtureAbsenceSchema.index({ leagueId: 1, season: 1, date: -1 });
FixtureAbsenceSchema.index({ 'home.teamId': 1, date: -1 });
FixtureAbsenceSchema.index({ 'away.teamId': 1, date: -1 });
FixtureAbsenceSchema.index({ 'home.players.playerId': 1 });
FixtureAbsenceSchema.index({ 'away.players.playerId': 1 });
