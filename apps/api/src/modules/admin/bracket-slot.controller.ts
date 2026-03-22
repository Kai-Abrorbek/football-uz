// bracket-slot.controller.ts
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BracketSlotService } from './bracket-slot.service';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Bracket')
@Controller('bracket')
export class BracketSlotController {
  constructor(private bracketSlotService: BracketSlotService) {}

  @Get('slots')
  @ApiOperation({ summary: '브라켓 슬롯 조회' })
  async getSlots(
    @Query('leagueId') leagueId: number,
    @Query('season') season: number,
    @Query('round') round: string,
  ) {
    return this.bracketSlotService.getSlots(leagueId, season, round);
  }

  @Post('slots')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '브라켓 슬롯 저장 (어드민)' })
  async updateSlots(
    @Body()
    body: {
      leagueId: number;
      season: number;
      round: string;
      slots: {
        slotIndex: number;
        teams: { teamId: number; teamName: string; teamLogo: string }[];
      }[];
    },
  ) {
    return this.bracketSlotService.updateSlots(
      body.leagueId,
      body.season,
      body.round,
      body.slots,
    );
  }
}
