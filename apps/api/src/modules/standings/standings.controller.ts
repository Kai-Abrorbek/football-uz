import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StandingsService } from './standings.service';

@ApiTags('Standings')
@Controller('standings')
export class StandingsController {
  constructor(private standingsService: StandingsService) {}

  @Get()
  @ApiOperation({ summary: '전체 순위표 조회' })
  @ApiQuery({ name: 'season', required: false, type: Number })
  async findAll(@Query('season') season?: number) {
    return this.standingsService.findAll(season ? +season : 2024);
  }

  @Get('league/:leagueId')
  @ApiOperation({ summary: '리그 현재 시즌 순위표 조회' })
  async findCurrentByLeague(@Param('leagueId') leagueId: number) {
    return this.standingsService.findCurrentByLeague(+leagueId);
  }

  @Get('league/:leagueId/season/:season')
  @ApiOperation({ summary: '리그별 시즌 순위표 조회' })
  async findByLeague(
    @Param('leagueId') leagueId: number,
    @Param('season') season: number,
  ) {
    return this.standingsService.findByLeague(+leagueId, +season);
  }
}
