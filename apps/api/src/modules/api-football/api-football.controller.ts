// api-football.controller.ts (새로 생성)
import { Controller, Logger, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MatchScheduler } from './schedulers/match.scheduler';
import { StandingScheduler } from './schedulers/standing.scheduler';
import { TeamScheduler } from './schedulers/team.scheduler';
import { PlayerScheduler as PlayersScheduler } from '../players/schedulers/player.scheduler';
import { PlayerScheduler } from './schedulers/player.scheduler';
import { DetailsScheduler } from './schedulers/details.scheduler';
import { ApiFootballService } from './api-football.service';

@ApiTags('API-Football Sync')
@Controller('sync')
export class ApiFootballController {
  private logger = new Logger(ApiFootballController.name);

  constructor(
    private matchScheduler: MatchScheduler,
    private standingScheduler: StandingScheduler,
    private teamScheduler: TeamScheduler,
    private playerScheduler: PlayerScheduler,
    private playersScheduler: PlayersScheduler,
    private detailsScheduler: DetailsScheduler,
    private apiFootballService: ApiFootballService,
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

  @Post('recent')
  @ApiOperation({ summary: '최근 경기 업데이트 수동 동기화' })
  async recentMatches() {
    await this.matchScheduler.syncRecentFixtures();
    return { message: '최근 경기 업데이트 수동 동기화 완' };
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

  // api-football.controller.ts
  @Post('standings/:leagueId/:season')
  @ApiOperation({ summary: '특정 시즌 순위표 수동 동기화' })
  async syncStandingsBySeason(
    @Param('leagueId') leagueId: number,
    @Param('season') season: number,
  ) {
    await this.standingScheduler.syncLeagueSeason(+leagueId, +season);
    return { message: '순위표 동기화 완료' };
  }

  @Post('match-details/:fixtureId')
  @ApiOperation({ summary: '경기 상세 정보 수동 동기화' })
  async syncMatchDetails(@Param('fixtureId') fixtureId: string) {
    await this.detailsScheduler.syncMatchDetails(+fixtureId);
    return { message: '경기 상세 정보 동기화 완료' };
  }

  // WORLD CUB
  @Post('sync-worldcup')
  @ApiOperation({ summary: '월드컵 동기화' })
  async syncWorldCup() {
    const season = 2022;
    const leagueId = 1;

    this.logger.log('월드컵 동기화 시작...');

    const fixtures = await this.apiFootballService.getFixturesByLeague(1, 2022);
    for (const fixture of fixtures.response) {
      await this.matchScheduler.saveFixture(fixture);
    }
    await this.standingScheduler.syncLeagueSeason(1, 2022);
    await this.playersScheduler.syncTopScorers(leagueId, season);
    await this.playersScheduler.syncTopAssists(leagueId, season);
    return { message: '월드컵 동기화 완료' };
  }
}
