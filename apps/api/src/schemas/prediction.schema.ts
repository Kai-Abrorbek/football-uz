import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PredictionDocument = Prediction & Document;

@Schema({ _id: false })
export class PredictionTeamInfo {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;
}

@Schema({ _id: false })
export class MultiLangText {
  @Prop()
  uz?: string;

  @Prop()
  ru?: string;

  @Prop()
  en?: string;
}

@Schema({ _id: false })
export class PredictedScore {
  @Prop({ default: null })
  home: number | null;

  @Prop({ default: null })
  away: number | null;
}

@Schema({ _id: false })
export class PredictionDetail {
  /**
   * Keep flexible:
   * - API-Football predictions can return "home"/"away"/"draw"
   * - Your own model might output "draw" or null (unknown)
   */
  @Prop({ enum: ['home', 'away', 'draw'], default: 'draw' })
  winner: 'home' | 'away' | 'draw';

  @Prop({ min: 0, max: 100, default: 0 })
  homeWinProb: number;

  @Prop({ min: 0, max: 100, default: 0 })
  drawProb: number;

  @Prop({ min: 0, max: 100, default: 0 })
  awayWinProb: number;

  @Prop({ type: PredictedScore, default: undefined })
  predictedScore?: PredictedScore;

  /** Short actionable advice string (can be from API or your own LLM) */
  @Prop()
  advice?: string;

  /** Rich analysis (optional, multi-language) */
  @Prop({ type: MultiLangText, default: undefined })
  analysis?: MultiLangText;

  /**
   * Optional: keep raw vendor payload to debug + avoid data loss
   * (API-Football /predictions response or your own model output)
   */
  @Prop({ type: Object, default: undefined })
  raw?: any;
}

@Schema({ _id: false })
export class DataUsed {
  @Prop({ default: 0 })
  h2h: number;

  @Prop()
  homeForm?: string;

  @Prop()
  awayForm?: string;

  @Prop({ default: null })
  homeLeaguePos: number | null;

  @Prop({ default: null })
  awayLeaguePos: number | null;

  /** Optional: capture the "asOf" season/date used for this prediction */
  @Prop()
  asOf?: string; // e.g., "2024-08-10" or "season:2024"
}

@Schema({ _id: false })
export class ActualResult {
  @Prop({ default: null })
  home: number | null;

  @Prop({ default: null })
  away: number | null;

  @Prop({ default: null })
  isCorrect: boolean | null;
}

@Schema({ timestamps: true })
export class Prediction {
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true, unique: true })
  matchId: Types.ObjectId;

  /** API-Football fixture id for convenience */
  @Prop({ required: true, index: true })
  apiFootballId: number;

  @Prop({ type: PredictionTeamInfo, required: true })
  homeTeam: PredictionTeamInfo;

  @Prop({ type: PredictionTeamInfo, required: true })
  awayTeam: PredictionTeamInfo;

  @Prop({ type: PredictionDetail, required: true })
  prediction: PredictionDetail;

  @Prop({ type: DataUsed, default: undefined })
  dataUsed?: DataUsed;

  @Prop({ type: ActualResult, default: null })
  actualResult: ActualResult | null;

  /** Store model name you used (don't hardcode to a specific one) */
  @Prop({ default: 'gpt-4o-mini' })
  gptModel: string;

  @Prop({ min: 0, max: 100, default: 0 })
  confidence: number;

  /** Helpful if you run multiple prediction versions */
  @Prop({ default: 1 })
  version: number;
}

export const PredictionSchema = SchemaFactory.createForClass(Prediction);

/** =========================
 *  Indexes
 *  ========================= */
PredictionSchema.index({ matchId: 1 }, { unique: true });
PredictionSchema.index({ apiFootballId: 1 });
PredictionSchema.index({ createdAt: -1 });
PredictionSchema.index({ 'actualResult.isCorrect': 1 });
PredictionSchema.index({ version: 1, createdAt: -1 });
