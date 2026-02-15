import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeaguesService } from './leagues.service';
import { LeagueScheduler } from './schedulers/league.scheduler';

@ApiTags('Leagues')
@Controller('leagues')
export class LeaguesController {
  constructor(
    private leaguesService: LeaguesService,
    private leagueScheduler: LeagueScheduler,
  ) {}

  @Get()
  @ApiOperation({ summary: '모든 리그 조회' })
  async findAll() {
    return this.leaguesService.findAll();
  }

  @Get('featured')
  @ApiOperation({ summary: '추천 리그 조회' })
  async findFeatured() {
    return this.leaguesService.findFeatured();
  }

  @Get(':id')
  @ApiOperation({ summary: '리그 상세 조회' })
  async findById(@Param('id') id: number) {
    return this.leaguesService.findById(id);
  }

  @Post('leagues')
  @ApiOperation({ summary: '모든 리그 정보 수동 동기화' })
  async syncFixtures() {
    await this.leagueScheduler.syncLeagues();
    return { message: '리그 정보 동기화 완료' };
  }
}
