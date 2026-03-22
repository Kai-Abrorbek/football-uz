// bracket-slot.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BracketSlot,
  BracketSlotDocument,
} from '../../schemas/bracket-slot.schema';

@Injectable()
export class BracketSlotService {
  constructor(
    @InjectModel(BracketSlot.name)
    private bracketSlotModel: Model<BracketSlotDocument>,
  ) {}

  async getSlots(leagueId: number, season: number, round: string) {
    const result = await this.bracketSlotModel
      .findOne({ leagueId, season, round })
      .lean();
    return result;
  }

  async updateSlots(
    leagueId: number,
    season: number,
    round: string,
    slots: {
      slotIndex: number;
      teams: { teamId: number; teamName: string; teamLogo: string }[];
    }[],
  ) {
    return this.bracketSlotModel.findOneAndUpdate(
      { leagueId, season, round },
      { leagueId, season, round, slots },
      { upsert: true, returnDocument: 'after' },
    );
  }
}
