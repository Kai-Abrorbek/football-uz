import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { LeagueMatchQueryDto, MatchQueryDto } from './dto/match-query.dto';

@ApiTags('Matches')
@Controller('matches')
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get()
  @ApiOperation({ summary: '경기 목록 조회 (필터링)' })
  async findAll(@Query() query: MatchQueryDto) {
    return this.matchesService.findAll(query);
  }

  @Get('/league-matches')
  @ApiOperation({ summary: '경기 목록 조회 (필터링)' })
  async getLeagueMatches(@Query() query: LeagueMatchQueryDto) {
    return this.matchesService.getLeagueMatches(query);
  }

  @Get('live')
  @ApiOperation({ summary: '라이브 경기 조회' })
  async findLive() {
    return this.matchesService.findLive();
  }

  @Get('upcoming')
  @ApiOperation({ summary: '예정된 경기 조회' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async findUpcoming(@Query('days') days?: number) {
    return this.matchesService.findUpcoming(days ? +days : 7);
  }

  @Get('league/:leagueId/season/:season')
  @ApiOperation({ summary: '리그별 시즌 경기 조회' })
  async findByLeagueSeason(
    @Param('leagueId') leagueId: number,
    @Param('season') season: number,
  ) {
    return this.matchesService.findByLeagueAndSeason(+leagueId, +season);
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: '팀 경기 조회' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByTeam(
    @Param('teamId') teamId: number,
    @Query('limit') limit?: number,
  ) {
    return this.matchesService.findByTeam(+teamId, limit ? +limit : 10);
  }

  @Get('h2h/:team1Id/:team2Id')
  @ApiOperation({ summary: '맞대결 기록 조회' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findH2H(
    @Param('team1Id') team1Id: number,
    @Param('team2Id') team2Id: number,
    @Query('limit') limit?: number,
  ) {
    return this.matchesService.findH2H(+team1Id, +team2Id, limit ? +limit : 5);
  }

  @Get(':id')
  @ApiOperation({ summary: '경기 상세 조회 (MongoDB ID)' })
  async findById(@Param('id') id: string) {
    return this.matchesService.findById(id);
  }

  @Get('api/:apiFootballId')
  @ApiOperation({ summary: '경기 상세 조회 (API-Football ID)' })
  async findByApiId(@Param('apiFootballId') apiFootballId: number) {
    return this.matchesService.findByApiFootballId(+apiFootballId);
  }
}
