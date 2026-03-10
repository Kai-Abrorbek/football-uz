import { Controller, Get, Param, Query } from '@nestjs/common';
import { HighlightsService } from './highlights.service';

@Controller('highlights')
export class HighlightsController {
  constructor(private highlightsService: HighlightsService) {}

  @Get(':matchId')
  async getHighlight(
    @Param('matchId') matchId: string,
    @Query('homeTeam') homeTeam: string,
    @Query('awayTeam') awayTeam: string,
    @Query('date') date: string,
  ) {
    return this.highlightsService.getHighlight(
      matchId,
      homeTeam,
      awayTeam,
      date,
    );
  }
}
