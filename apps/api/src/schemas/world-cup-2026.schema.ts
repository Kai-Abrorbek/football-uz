import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorldCup2026Document = WorldCup2026 & Document;

@Schema({ _id: false })
export class WCTeamInfo {
  @Prop()
  id: number;

  @Prop()
  name: string;

  @Prop()
  logo: string;

  @Prop()
  flag: string;
}

@Schema({ _id: false })
export class WCGroup {
  @Prop()
  name: string;

  @Prop({ type: [WCTeamInfo] })
  teams: WCTeamInfo[];
}

@Schema({ _id: false })
export class WCBracket {
  @Prop({
    enum: ['Round of 32', 'Round of 16', 'Quarter', 'Semi', 'Final'],
  })
  round: string;

  @Prop({ type: [Types.ObjectId], ref: 'Match' })
  matches: Types.ObjectId[];
}

@Schema({ _id: false })
export class WCVenue {
  @Prop()
  name: string;

  @Prop()
  city: string;

  @Prop()
  country: string; // USA | Canada | Mexico

  @Prop()
  capacity: number;

  @Prop()
  image: string;

  @Prop(raw({ lat: { type: Number }, lng: { type: Number } }))
  coordinates: Record<string, number>;
}

@Schema({ _id: false })
export class UzbekistanStatus {
  @Prop({ default: false })
  qualified: boolean;

  @Prop()
  group: string;

  @Prop({ type: Types.ObjectId, ref: 'Match', default: null })
  nextMatch: Types.ObjectId;
}

@Schema({ timestamps: true })
export class WorldCup2026 {
  @Prop({
    required: true,
    enum: ['group', 'knockout', 'venue', 'info'],
  })
  type: string;

  @Prop({ type: WCGroup, default: null })
  group: WCGroup;

  @Prop({ type: WCBracket, default: null })
  bracket: WCBracket;

  @Prop({ type: WCVenue, default: null })
  venue: WCVenue;

  @Prop({ type: UzbekistanStatus, default: null })
  uzbekistanStatus: UzbekistanStatus;
}

export const WorldCup2026Schema = SchemaFactory.createForClass(WorldCup2026);

// 인덱스
WorldCup2026Schema.index({ type: 1 });
