import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PlayersService } from './players.service';
import { PlayerQueryDto } from './dto/player-query.dto';
import { PlayerScheduler } from './schedulers/player.scheduler';
import { Player } from '../../schemas';

@ApiTags('Players')
@Controller('players')
export class PlayersController {
  constructor(
    private playersService: PlayersService,
    private readonly playerScheduler: PlayerScheduler,
  ) {}

  @Get()
  @ApiOperation({ summary: '선수 목록 조회' })
  async findAll(@Query() query: PlayerQueryDto) {
    return this.playersService.findAll(query);
  }

  @Get('search')
  @ApiOperation({ summary: '선수 검색' })
  @ApiQuery({ name: 'q', required: true })
  async search(@Query('q') query: string) {
    return this.playersService.search(query);
  }

  @Get('uzbek')
  @ApiOperation({ summary: '우즈벡 선수 조회' })
  async findUzbekPlayers() {
    return this.playersService.findUzbekPlayers();
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: '팀별 선수 조회' })
  async findByTeam(@Param('teamId') teamId: number) {
    return this.playersService.findByTeam(+teamId);
  }

  @Get('league/:leagueId')
  @ApiOperation({ summary: '선수 상세 조회' })
  async findByLeaguePlayers(
    @Param('leagueId') leagueId: string,
  ): Promise<Player[]> {
    return this.playersService.findByLeaguePlayers(leagueId);
  }

  @Get('top-scorers/:leagueId')
  @ApiOperation({ summary: '득점왕 조희' })
  async getTopScorers(@Param('leagueId') leagueId: string) {
    return this.playersService.getTopScorers(Number(leagueId));
  }

  @Get('top-assists/:leagueId')
  @ApiOperation({ summary: '어시스트왕 조희' })
  async getTopAssists(@Param('leagueId') leagueId: string) {
    return this.playersService.getTopAssists(Number(leagueId));
  }

  @Get('top-yellowcards/:leagueId')
  @ApiOperation({ summary: '경고장왕 조희' })
  async getYellowCards(@Param('leagueId') leagueId: string) {
    return this.playersService.getYellowCards(Number(leagueId));
  }

  @Get('top-redcards/:leagueId')
  @ApiOperation({ summary: '퇴장왕 조희' })
  async getRedCards(@Param('leagueId') leagueId: string) {
    return this.playersService.getRedCards(Number(leagueId));
  }

  @Post('sync-top-players')
  @ApiOperation({ summary: '득점왕/어시스트왕 동기화 시작' })
  async syncTopPlayers() {
    // 실제 스케줄러 함수 호출
    this.playerScheduler.syncTopPlayers(); // 비동기로 실행
    return { message: '득점왕/어시스트왕 동기화 시작됨' };
  }

  @Post('leauge-players/:leagueId/:season/:page')
  @ApiOperation({ summary: '리그 선수들 동기화 시작' })
  async syncPlayers(
    @Param('leagueId') leagueId: string,
    @Param('season') season: string,
    @Param('page') page: string,
  ) {
    return await this.playerScheduler.syncPlayers(
      Number(leagueId),
      Number(season),
      Number(page),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '선수 상세 조회' })
  async findById(@Param('id') id: number) {
    return this.playersService.findPlayerDetail(+id);
  }

  @Post('by-ids')
  @ApiOperation({ summary: '선수 ID 배열로 조회' })
  async getPlayersByIds(@Body() body: { ids: number[] }) {
    return this.playersService.getPlayersByIds(body.ids);
  }
}
