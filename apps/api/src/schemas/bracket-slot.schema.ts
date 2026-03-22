// bracket-slot.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BracketSlotDocument = BracketSlot & Document;

@Schema({ _id: false })
export class SlotTeam {
  @Prop({ required: true })
  teamId: number;

  @Prop()
  teamName: string;

  @Prop()
  teamLogo: string;
}

@Schema({ _id: false })
export class Slot {
  @Prop({ required: true })
  slotIndex: number;

  @Prop({ type: [SlotTeam], default: [] })
  teams: SlotTeam[];
}

@Schema({ timestamps: true })
export class BracketSlot {
  @Prop({ required: true })
  leagueId: number;

  @Prop({ required: true })
  season: number;

  @Prop({ required: true })
  round: string;

  @Prop({ type: [Slot], default: [] })
  slots: Slot[];
}

export const BracketSlotSchema = SchemaFactory.createForClass(BracketSlot);
BracketSlotSchema.index({ leagueId: 1, season: 1, round: 1 }, { unique: true });
