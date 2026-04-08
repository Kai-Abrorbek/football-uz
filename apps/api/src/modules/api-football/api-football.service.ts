import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { SyncLog, SyncLogDocument } from '../../schemas/sync-log.schema';

@Injectable()
export class ApiFootballService {
  private readonly logger = new Logger(ApiFootballService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private httpService: HttpService,
    private config: ConfigService,
    @InjectModel(SyncLog.name) private syncLogModel: Model<SyncLogDocument>,
  ) {
    this.baseUrl = this.config.get<string>('API_FOOTBALL_BASE_URL') || '';
    this.apiKey = this.config.get<string>('API_FOOTBALL_KEY') || '';
  }

  public async request(endpoint: string, params: any = {}): Promise<any> {
    const startedAt = new Date();
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}${endpoint}`, {
          headers: {
            'x-apisports-key': this.apiKey,
          },
          params,
        }),
      );

      this.logger.log(`API Request: ${endpoint} - Success`);

      await this.logSync(
        endpoint,
        params,
        'success',
        response.data.response?.length || 0,
        startedAt,
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`API Request Failed: ${endpoint}`, error.message);

      await this.logSync(
        endpoint,
        params,
        'fail',
        0,
        startedAt,
        error.response?.status?.toString(),
        error.message,
      );

      throw error;
    }
  }

  private async logSync(
    job: string,
    params: any,
    status: 'success' | 'fail',
    savedCount: number,
    startedAt: Date,
    errorCode?: string,
    errorMessage?: string,
  ) {
    await this.syncLogModel.create({
      job,
      leagueId: params.league,
      teamId: params.team,
      season: params.season,
      date: params.date,
      requestCount: 1,
      savedCount,
      status,
      errorCode,
      errorMessage,
      startedAt,
      finishedAt: new Date(),
    });
  }

  // === Fixtures (Matches) ===
  async getFixturesByDate(date: string) {
    return this.request('/fixtures', { date, timezone: 'Asia/Tashkent' });
  }

  async getFixturesByLeague(leagueId: number, season: number) {
    return this.request('/fixtures', { league: leagueId, season });
  }

  async getFixtureLive() {
    return this.request('/fixtures', { live: 'all' });
  }

  async getFixtureById(fixtureId: number) {
    return this.request('/fixtures', { id: fixtureId });
  }

  async getFixtureLineups(fixtureId: number) {
    return this.request('/fixtures/lineups', { fixture: fixtureId });
  }

  async getFixtureStatistics(fixtureId: number) {
    return this.request('/fixtures/statistics', { fixture: fixtureId });
  }

  async getFixtureEvents(fixtureId: number) {
    return this.request('/fixtures/events', { fixture: fixtureId });
  }

  // === Standings ===
  async getStandings(leagueId: number, season: number) {
    return this.request('/standings', { league: leagueId, season });
  }

  // === Teams ===
  async getTeamById(teamId: number) {
    return this.request('/teams', { id: teamId });
  }

  async getFixturePlayers(fixtureId: number) {
    return this.request(`/fixtures/players?fixture=${fixtureId}`);
  }

  async getTeamsByLeague(leagueId: number, season: number) {
    return this.request('/teams', { league: leagueId, season });
  }

  async getTeamStatistics(teamId: number, leagueId: number, season: number) {
    return this.request('/teams/statistics', {
      team: teamId,
      league: leagueId,
      season,
    });
  }

  // === Players ===
  async getPlayersByLeague(leagueId: number, season: number, page: number = 1) {
    return this.request('/players', { league: leagueId, season, page });
  }

  async getPlayerById(playerId: number, season: number) {
    return this.request('/players', { id: playerId, season });
  }

  async getPlayersByTeam(teamId: number, season: number) {
    return this.request('/players', { team: teamId, season });
  }

  async getTopScorers(leagueId: number, season: number) {
    return this.request('/players/topscorers', { league: leagueId, season });
  }

  async getTopAssists(leagueId: number, season: number) {
    return this.request('/players/topassists', { league: leagueId, season });
  }

  async getTopYellowCards(leagueId: number, season: number) {
    return this.request('/players/topyellowcards', {
      league: leagueId,
      season,
    });
  }

  async getTopRedCards(leagueId: number, season: number) {
    return this.request('/players/topredcards', { league: leagueId, season });
  }

  // === Leagues ===
  async getLeaguesRounds(leagueId: number, season: number) {
    return this.request('/fixtures/rounds', {
      league: leagueId,
      season: season,
    });
  }

  async getLeagues(season?: number) {
    return this.request('/leagues', season ? { season } : {});
  }

  async getLeagueById(leagueId: number) {
    return this.request('/leagues', { id: leagueId });
  }

  async getLeagueSeasons() {
    return this.request('/leagues/seasons');
  }
}
