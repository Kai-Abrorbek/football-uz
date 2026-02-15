import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlayerDocument = Player & Document;

/** =========================
 *  Embedded Schemas
 *  ========================= */

@Schema({ _id: false })
export class Birth {
  @Prop()
  date?: string; // API: player.birth.date

  @Prop()
  place?: string; // API: player.birth.place

  @Prop()
  country?: string; // API: player.birth.country
}

@Schema({ _id: false })
export class PlayerTeamInfo {
  @Prop()
  id?: number;

  @Prop()
  name?: string;

  @Prop()
  logo?: string;
}

@Schema({ _id: false })
export class PlayerLeagueInfo {
  @Prop()
  id?: number;

  @Prop()
  name?: string;

  @Prop()
  season?: number;
}

/**
 * API-FOOTBALL players endpoint returns:
 * {
 *   player: {...},
 *   statistics: [
 *     { team, league, games, goals, shots, passes, tackles, duels, dribbles, fouls, cards, penalty, ... }
 *   ]
 * }
 *
 * We keep both normalized fields + raw backup.
 */
@Schema({ _id: false })
export class PlayerStatistic {
  @Prop({ type: PlayerTeamInfo })
  team?: PlayerTeamInfo; // API: statistics[i].team

  @Prop({ type: PlayerLeagueInfo })
  league?: PlayerLeagueInfo; // API: statistics[i].league

  @Prop(
    raw({
      appearences: { type: Number, default: 0 }, // NOTE: API uses "appearences" (spelling) in many responses
      minutes: { type: Number, default: 0 },
      rating: { type: String, default: null },
      position: { type: String, default: null },
      number: { type: Number, default: null },
    }),
  )
  games: Record<string, any>;

  @Prop(
    raw({
      total: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
    }),
  )
  goals: Record<string, any>;

  @Prop(
    raw({
      total: { type: Number, default: null },
      on: { type: Number, default: null },
    }),
  )
  shots: Record<string, any>;

  @Prop(
    raw({
      total: { type: Number, default: null },
      key: { type: Number, default: null },
      accuracy: { type: String, default: null }, // API often returns accuracy as string (e.g., "85%") or null
    }),
  )
  passes: Record<string, any>;

  @Prop(
    raw({
      total: { type: Number, default: null },
      blocks: { type: Number, default: null },
      interceptions: { type: Number, default: null },
    }),
  )
  tackles: Record<string, any>;

  @Prop(
    raw({
      total: { type: Number, default: null },
      won: { type: Number, default: null },
    }),
  )
  duels: Record<string, any>;

  @Prop(
    raw({
      attempts: { type: Number, default: null },
      success: { type: Number, default: null },
      past: { type: Number, default: null },
    }),
  )
  dribbles: Record<string, any>;

  @Prop(
    raw({
      drawn: { type: Number, default: null },
      committed: { type: Number, default: null },
    }),
  )
  fouls: Record<string, any>;

  @Prop(
    raw({
      yellow: { type: Number, default: 0 },
      red: { type: Number, default: 0 },
    }),
  )
  cards: Record<string, any>;

  @Prop(
    raw({
      scored: { type: Number, default: 0 },
      missed: { type: Number, default: 0 },
    }),
  )
  penalty: Record<string, any>;

  /** Optional: keep full original stats object to prevent data loss */
  @Prop({ type: Object, default: undefined })
  raw?: any;
}

/** =========================
 *  Root Schema
 *  ========================= */

@Schema({ timestamps: true })
export class Player {
  @Prop({ required: true })
  apiFootballId: number; // API: player.id

  @Prop({ required: true })
  name: string; // API: player.name

  @Prop()
  firstname?: string;

  @Prop()
  lastname?: string;

  @Prop()
  nationality?: string;

  @Prop()
  photo?: string;

  @Prop()
  age?: number;

  @Prop({ type: Birth, default: undefined })
  birth?: Birth;

  @Prop()
  height?: string;

  @Prop()
  weight?: string;

  /**
   * API has both "position" and "pos" in different places.
   * To avoid rejecting unknown values, keep flexible.
   */
  @Prop()
  position?: string;

  /**
   * This should be derived from the latest/current statistic item you decide as "current".
   * (API doesn't always provide a single "currentTeam" field.)
   */
  @Prop({ type: PlayerTeamInfo, default: undefined })
  currentTeam?: PlayerTeamInfo;

  /**
   * Season stats from API: statistics[]
   * One player can have multiple (league/team) entries.
   */
  @Prop({ type: [PlayerStatistic], default: [] })
  statistics: PlayerStatistic[];

  /**
   * API-FOOTBALL generally does NOT provide market value / wage.
   * Keep them optional for future sources.
   */
  @Prop()
  marketValue?: string;

  @Prop()
  wage?: string;

  /**
   * API-FOOTBALL can provide injuries via /injuries (not always in players response).
   * Keep flexible.
   */
  @Prop(
    raw({
      type: { type: String, default: null },
      reason: { type: String, default: null },
      date: { type: String, default: null },
      expectedReturn: { type: String, default: null },
    }),
  )
  injury?: Record<string, any>;

  /**
   * API doesn't provide a reliable "condition" enum across all leagues.
   * Keep as string for flexibility; you can normalize in service layer.
   */
  @Prop({ default: 'fit' })
  condition: string;

  @Prop({ default: false })
  isUzbekPlayer: boolean;

  @Prop()
  lastSyncAt?: Date;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);

/** =========================
 *  Indexes
 *  ========================= */
PlayerSchema.index({ apiFootballId: 1 }, { unique: true });
PlayerSchema.index({ 'currentTeam.id': 1 });
PlayerSchema.index({ nationality: 1 });
PlayerSchema.index({ name: 'text' });
PlayerSchema.index({ isUzbekPlayer: 1 });
