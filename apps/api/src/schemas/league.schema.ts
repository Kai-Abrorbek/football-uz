import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeagueDocument = League & Document;

@Schema({ _id: false })
export class LeagueSeason {
  @Prop({ required: true })
  year: number;

  @Prop()
  start?: string;

  @Prop()
  end?: string;

  @Prop({ default: false })
  current: boolean;

  @Prop(
    raw({
      standings: { type: Boolean, default: false },
      players: { type: Boolean, default: false },
      top_scorers: { type: Boolean, default: false },
      top_assists: { type: Boolean, default: false },
      top_cards: { type: Boolean, default: false },
      injuries: { type: Boolean, default: false },
      predictions: { type: Boolean, default: false },
    }),
  )
  coverage?: Record<string, any>;
}

@Schema({ timestamps: true })
export class League {
  @Prop({ required: true, unique: true })
  apiFootballId: number; // league.id

  @Prop({ required: true })
  name: string;

  @Prop()
  type?: string; // League / Cup

  @Prop()
  logo?: string;

  @Prop()
  country?: string;

  @Prop()
  countryCode?: string;

  @Prop()
  countryFlag?: string;

  /** 앱에서 노출할 대상인지 (유명 리그 10개 같은) */
  @Prop({ default: false })
  isFeatured: boolean;

  /** 노출 우선순위(작을수록 위) */
  @Prop({ default: 999 })
  priority: number;

  /** 시즌 드롭다운 데이터 */
  @Prop({ type: [LeagueSeason], default: [] })
  seasons: LeagueSeason[];

  /** 무료 플랜 테스트용/운영용으로 고정 시즌 지정 가능 */
  @Prop()
  pinnedSeason?: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastSyncAt?: Date;
}

export const LeagueSchema = SchemaFactory.createForClass(League);

LeagueSchema.index({ isFeatured: 1, priority: 1 });
LeagueSchema.index({ country: 1 });
