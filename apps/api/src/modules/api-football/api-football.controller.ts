// api-football.controller.ts (새로 생성)
import { Body, Controller, Logger, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MatchScheduler } from './schedulers/match.scheduler';
import { StandingScheduler } from './schedulers/standing.scheduler';
import { TeamScheduler } from './schedulers/team.scheduler';
import { PlayerScheduler } from './schedulers/player.scheduler';
import { DetailsScheduler } from './schedulers/details.scheduler';
import { ApiFootballService } from './api-football.service';
import { SyncSeasonDto } from './dto/syncSeasonDto';
import { FEATURED_LEAGUES } from '../../constants/leagues.constant';
import { PlayerStatsScheduler } from '../players/schedulers/player.scheduler';

@ApiTags('API-Football Sync')
@Controller('sync')
export class ApiFootballController {
  private logger = new Logger(ApiFootballController.name);

  constructor(
    private matchScheduler: MatchScheduler,
    private standingScheduler: StandingScheduler,
    private teamScheduler: TeamScheduler,
    private playerScheduler: PlayerScheduler,
    private playersScheduler: PlayerStatsScheduler,
    private detailsScheduler: DetailsScheduler,
    private apiFootballService: ApiFootballService,
  ) {}

  @Post('live')
  @ApiOperation({ summary: '라이브 스코어 수동 동기화' })
  async syncLive() {
    await this.matchScheduler.syncLiveScores();
    return { message: '라이브 스코어 동기화 완료' };
  }

  @Post('recent')
  @ApiOperation({ summary: '최근 경기 업데이트 수동 동기화' })
  async recentMatches(@Param('day') day: number, @Param('') label: string) {
    await this.matchScheduler.syncRecentFixtures(day, label);
    return { message: '최근 경기 업데이트 수동 동기화 완' };
  }

  @Post('standings')
  @ApiOperation({ summary: '순위표 수동 동기화' })
  async syncStandings() {
    await this.standingScheduler.syncStandings();
    return { message: '순위표 동기화 완료' };
  }

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
    const season = 2026;
    const leagueId = 1;

    this.logger.log('월드컵 동기화 시작...');

    const fixtures = await this.apiFootballService.getFixturesByLeague(1, 2026);
    for (const fixture of fixtures.response) {
      await this.matchScheduler.saveFixture(fixture);
    }
    await this.standingScheduler.syncLeagueSeason(1, 2026);
    await this.playersScheduler.syncTopScorers(leagueId, season);
    await this.playersScheduler.syncTopAssists(leagueId, season);
    return { message: '월드컵 동기화 완료' };
  }

  // 1. 경기 목록 동기화
  @Post('fixtures')
  @ApiOperation({ summary: '시즌별 경기 목록 동기화' })
  async syncFixturesByAdmin(@Body() dto: SyncSeasonDto) {
    const leagues = dto.leagueId ? [dto.leagueId] : FEATURED_LEAGUES;

    for (const leagueId of leagues) {
      await this.matchScheduler.syncLeagueFixtures(leagueId, dto.season);
    }

    return { message: `경기 목록 동기화 완료 (season: ${dto.season})` };
  }

  // 3. 팀 동기화
  @Post('teams')
  @ApiOperation({ summary: '시즌별 팀 동기화' })
  async syncTeamsByAdmin(@Body() dto: SyncSeasonDto) {
    await this.teamScheduler.syncTeamsBySeason(dto.season, dto.leagueId);
    return { message: `팀 동기화 완료 (season: ${dto.season})` };
  }

  // 4. 선수 동기화 (득점왕/도움왕)
  @Post('players')
  @ApiOperation({ summary: '시즌별 선수 동기화' })
  async syncPlayersByAdmin(@Body() dto: SyncSeasonDto) {
    await this.playerScheduler.syncTopScorersBySeason(dto.season, dto.leagueId);
    return { message: `선수 동기화 완료 (season: ${dto.season})` };
  }

  // 5. 경기 디테일 배치 동기화 (이벤트+통계+라인업)
  @Post('details')
  @ApiOperation({
    summary: '완료된 경기 디테일 배치 동기화 (하루 7500 제한 주의)',
  })
  async syncDetails(@Body() dto: SyncSeasonDto) {
    const result = await this.detailsScheduler.syncDetailsBatch(
      dto.season,
      dto.leagueId,
    );
    return {
      message: `디테일 동기화 완료`,
      processed: result.processed,
      remaining: result.remaining,
    };
  }

  // 6. 전체 한번에 (순서대로)
  @Post('all')
  @ApiOperation({ summary: '전체 동기화 (경기목록 → 순위표 → 팀 → 선수)' })
  async syncAll(@Body() dto: SyncSeasonDto) {
    const leagues = dto.leagueId ? [dto.leagueId] : FEATURED_LEAGUES;

    // 경기 목록
    for (const leagueId of leagues) {
      await this.matchScheduler.syncLeagueFixtures(leagueId, dto.season);
    }

    // 순위표
    for (const leagueId of leagues) {
      await this.standingScheduler.syncLeagueSeason(leagueId, dto.season);
    }

    // 팀
    await this.teamScheduler.syncTeamsBySeason(dto.season, dto.leagueId);

    // 선수
    await this.playerScheduler.syncTopScorersBySeason(dto.season, dto.leagueId);

    return { message: `전체 동기화 완료 (season: ${dto.season})` };
  }

  @Post('players/all')
  @ApiOperation({
    summary: '시즌별 전체 선수 동기화 (페이지네이션, API 많이 소모)',
  })
  async syncAllPlayers(@Body() dto: SyncSeasonDto) {
    await this.playerScheduler.syncAllPlayersBySeason(dto.season, dto.leagueId);
    return { message: `전체 선수 동기화 완료 (season: ${dto.season})` };
  }
}
