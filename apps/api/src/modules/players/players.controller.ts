import { Controller, Get, Param, Post, Query } from '@nestjs/common';
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

  @Get(':id')
  @ApiOperation({ summary: '선수 상세 조회' })
  async findById(@Param('id') id: number) {
    return this.playersService.findById(+id);
  }

  @Get('league/:leagueId')
  @ApiOperation({ summary: '선수 상세 조회' })
  async findByLeaguePlayers(
    @Param('leagueId') leagueId: number,
  ): Promise<Player[]> {
    return this.playersService.findByLeaguePlayers(+leagueId);
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

  @Post('sync-top-players')
  @ApiOperation({ summary: '득점왕/어시스트왕 동기화 시작' })
  async syncTopPlayers() {
    // 실제 스케줄러 함수 호출
    this.playerScheduler.syncTopPlayers(); // 비동기로 실행
    return { message: '득점왕/어시스트왕 동기화 시작됨' };
  }
}
