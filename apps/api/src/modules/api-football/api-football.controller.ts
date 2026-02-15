// api-football.controller.ts (새로 생성)
import { Controller, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MatchScheduler } from './schedulers/match.scheduler';
import { StandingScheduler } from './schedulers/standing.scheduler';
import { TeamScheduler } from './schedulers/team.scheduler';
import { PlayerScheduler } from './schedulers/player.scheduler';

@ApiTags('API-Football Sync')
@Controller('sync')
export class ApiFootballController {
  constructor(
    private matchScheduler: MatchScheduler,
    private standingScheduler: StandingScheduler,
    private teamScheduler: TeamScheduler,
    private playerScheduler: PlayerScheduler,
  ) {}

  @Post('fixtures')
  @ApiOperation({ summary: '경기 정보 수동 동기화' })
  async syncFixtures() {
    await this.matchScheduler.initialSync();
    return { message: '경기 동기화 완료' };
  }

  @Post('live')
  @ApiOperation({ summary: '라이브 스코어 수동 동기화' })
  async syncLive() {
    await this.matchScheduler.syncLiveScores();
    return { message: '라이브 스코어 동기화 완료' };
  }

  @Post('standings')
  @ApiOperation({ summary: '순위표 수동 동기화' })
  async syncStandings() {
    await this.standingScheduler.syncStandings();
    return { message: '순위표 동기화 완료' };
  }

  @Post('teams')
  @ApiOperation({ summary: '팀 정보 수동 동기화' })
  async syncTeams() {
    await this.teamScheduler.syncTeams();
    return { message: '팀 동기화 완료' };
  }

  @Post('players')
  @ApiOperation({ summary: '선수 정보 수동 동기화' })
  async syncPlayers() {
    await this.playerScheduler.syncTopScorers();
    return { message: '선수 동기화 완료' };
  }
}
