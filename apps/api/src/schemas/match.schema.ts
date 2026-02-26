import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MatchDocument = Match & Document;

/** =========================
 *  Embedded Schemas
 *  ========================= */

@Schema({ _id: false })
export class LeagueInfo {
  @Prop({ required: true })
  id: number;

  @Prop()
  name?: string;

  // API-FOOTBALL: sometimes league.country or country.name depending on endpoint
  @Prop()
  country?: string;

  @Prop()
  logo?: string;

  // store the season you queried with (e.g., 2024)
  @Prop()
  season?: number;

  @Prop()
  round?: string;

  @Prop({ type: Boolean, default: false })
  standings?: boolean;
}

@Schema({ _id: false })
export class TeamCoach {
  @Prop({ required: true })
  id: number;

  @Prop()
  name?: string;

  @Prop()
  photo?: string;
}

@Schema({ _id: false })
export class TeamInfo {
  @Prop({ required: true })
  id: number;

  @Prop()
  name?: string;

  @Prop()
  logo?: string;

  @Prop({ type: Boolean, default: null })
  winner?: boolean | null;

  @Prop({ type: TeamCoach, default: null })
  coach?: TeamCoach;
}

@Schema({ _id: false })
export class Goals {
  // API-FOOTBALL: goals.home / goals.away (final or live goals)
  @Prop({ default: null, type: Number })
  home: number | null;

  @Prop({ default: null, type: Number })
  away: number | null;
}

@Schema({ _id: false })
export class ScoreDetail {
  @Prop({ default: null, type: Number })
  home: number | null;

  @Prop({ default: null, type: Number })
  away: number | null;
}

@Schema({ _id: false })
export class ScoreBreakdown {
  // API-FOOTBALL: score.halftime/fulltime/extratime/penalty
  @Prop({ type: ScoreDetail, default: undefined })
  halftime?: ScoreDetail;

  @Prop({ type: ScoreDetail, default: undefined })
  fulltime?: ScoreDetail;

  @Prop({ type: ScoreDetail, default: undefined })
  extratime?: ScoreDetail;

  @Prop({ type: ScoreDetail, default: undefined })
  penalty?: ScoreDetail;
}

@Schema({ _id: false })
export class Venue {
  @Prop()
  name?: string;

  @Prop()
  city?: string;
}

@Schema({ _id: false })
export class PlayerInfo {
  // API-FOOTBALL: player.id / player.name
  @Prop()
  playerId?: number;

  @Prop()
  playerName?: string;

  @Prop()
  number?: number;

  // API-FOOTBALL: pos like "G", "D", "M", "F"
  @Prop()
  pos?: string;
}

@Schema({ _id: false })
export class TeamLineup {
  // helpful for mapping (lineups endpoint returns array items with team.id)
  @Prop()
  teamId?: number;

  @Prop()
  formation?: string;

  @Prop({ type: [PlayerInfo], default: [] })
  startXI: PlayerInfo[];

  @Prop({ type: [PlayerInfo], default: [] })
  substitutes: PlayerInfo[];
}

@Schema({ _id: false })
export class Lineups {
  // we store as home/away for easy UI rendering
  @Prop({ type: TeamLineup, default: undefined })
  home?: TeamLineup;

  @Prop({ type: TeamLineup, default: undefined })
  away?: TeamLineup;
}

@Schema({ _id: false })
export class MatchStatistic {
  @Prop({ enum: ['home', 'away'], required: true })
  side: 'home' | 'away';

  @Prop({ default: null, type: String })
  possession: string | null;

  @Prop({ default: null, type: Number })
  shots: number | null;

  @Prop({ default: null, type: Number })
  shotsOnTarget: number | null;

  @Prop({ default: null, type: Number })
  corners: number | null;

  @Prop({ default: null, type: Number })
  fouls: number | null;

  @Prop({ default: null, type: Number })
  yellowCards: number | null;

  @Prop({ default: null, type: Number })
  redCards: number | null;

  @Prop({ default: null, type: Number })
  offsides: number | null;

  @Prop({ default: null, type: Number })
  passes: number | null;

  @Prop({ default: null, type: String })
  passAccuracy: string | null;
}

@Schema({ _id: false })
export class MatchEvent {
  // API-FOOTBALL: time.elapsed, time.extra
  @Prop(raw({ elapsed: { type: Number }, extra: { type: Number } }))
  time: { elapsed?: number; extra?: number };

  @Prop({ type: TeamInfo })
  team?: TeamInfo;

  // API-FOOTBALL: player.id/name, assist.id/name can be null
  @Prop(raw({ id: { type: Number }, name: { type: String } }))
  player?: { id?: number; name?: string };

  @Prop(raw({ id: { type: Number }, name: { type: String } }))
  assist?: { id?: number; name?: string };

  // API-FOOTBALL: "Goal" | "Card" | "subst" | ... (keep flexible)
  @Prop()
  type?: string;

  @Prop()
  detail?: string;

  @Prop()
  comments?: string;
}

@Schema({ _id: false })
export class MatchStatus {
  @Prop({ type: String, default: undefined })
  long?: string;

  @Prop({
    enum: [
      'TBD',
      'NS',
      '1H',
      'HT',
      '2H',
      'ET',
      'BT',
      'P',
      'SUSP',
      'INT',
      'FT',
      'AET',
      'PEN',
      'PST',
      'CANC',
      'ABD',
      'AWD',
      'WO',
    ],
    default: 'NS',
  })
  short?: string;

  @Prop({ type: Number, default: undefined })
  elapsed?: number;

  @Prop({ type: Number, default: null })
  extra?: number | null;
}

/** =========================
 *  Root Schema
 *  ========================= */

@Schema({ timestamps: true })
export class Match {
  /** API Fixture ID */
  @Prop({ required: true })
  apiFootballId: number;

  @Prop({ type: String, default: undefined })
  referee?: string;

  @Prop({ type: LeagueInfo })
  league?: LeagueInfo;

  @Prop({ type: TeamInfo, required: true })
  homeTeam: TeamInfo;

  @Prop({ type: TeamInfo, required: true })
  awayTeam: TeamInfo;

  /** Final/live goals (simple) */
  @Prop({ type: Goals, default: undefined })
  goals?: Goals;

  /** Halftime/fulltime/... breakdown */
  @Prop({ type: ScoreBreakdown, default: undefined })
  score?: ScoreBreakdown;

  /** Match status short code from API-FOOTBALL */
  @Prop({ type: MatchStatus, default: undefined })
  status: MatchStatus;

  /** kickoff date-time (API: fixture.date) */
  @Prop({ required: true })
  date: Date;

  @Prop({ type: Venue, default: undefined })
  venue?: Venue;

  /** Round info (API: league.round) */
  @Prop()
  round?: string;

  /** Optional: world cup flag you manage yourself */
  @Prop({ default: false })
  isWorldCup2026: boolean;

  /** Lineups snapshot (filled later via /fixtures/lineups) */
  @Prop({ type: Lineups, default: undefined })
  lineups?: Lineups;

  /** Normalized stats for UI */
  @Prop({ type: [MatchStatistic], default: [] })
  statistics: MatchStatistic[];

  /** Keep original stats from API to avoid losing fields */
  @Prop({ type: Object, default: undefined })
  statisticsRaw?: any;

  /** Events snapshot (filled later via /fixtures/events) */
  @Prop({ type: [MatchEvent], default: [] })
  events: MatchEvent[];

  /** last time you synced this match from API */
  @Prop()
  lastSyncAt?: Date;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

/** =========================
 *  Indexes
 *  ========================= */
MatchSchema.index({ apiFootballId: 1 }, { unique: true });
MatchSchema.index({ date: -1 });
MatchSchema.index({ 'league.id': 1, date: -1 });
MatchSchema.index({ status: 1 });
MatchSchema.index({ 'homeTeam.id': 1, date: -1 });
MatchSchema.index({ 'awayTeam.id': 1, date: -1 });
MatchSchema.index({ isWorldCup2026: 1, date: -1 });
