import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FixtureAbsence } from '../../schemas/fixture-absence.schema';
import { Model } from 'mongoose';
import { ApiFootballService } from '../api-football/api-football.service';
import { Match } from '../../schemas';

@Injectable()
export class FixtureabsenceService {
  private readonly logger = new Logger(FixtureabsenceService.name);

  constructor(
    @InjectModel(FixtureAbsence.name)
    private fixtureAbsenceModel: Model<FixtureAbsence>,
    @InjectModel(Match.name) private matchModel: Model<Match>,
    private readonly apiFootballService: ApiFootballService,
  ) {}

  public async saveFixtureAbsences(fixtureId: number) {
    this.logger.log('경기 부상 및 출장정이 조회 시작...');
    // 1) injuries
    const injuriesRes = await this.apiFootballService.request('/injuries', {
      fixture: String(fixtureId),
    });
    const items: any[] = injuriesRes?.response ?? [];

    // 2) fixtures (홈/원정 확정)
    const match = await this.matchModel
      .findOne({ apiFootballId: fixtureId })
      .select({
        league: 1,
        season: 1,
        date: 1,
        homeTeam: 1,
        awayTeam: 1,
      })
      .lean()
      .exec();

    if (!match) throw new Error(`Match not found in DB: ${fixtureId}`);

    const homeTeam = match.homeTeam;
    const awayTeam = match.awayTeam;

    if (!homeTeam?.id || !awayTeam?.id) {
      throw new Error(`Team info missing in DB for fixtureId=${fixtureId}`);
    }

    // 중복 playerId 제거(가끔 API가 중복 내려줌)
    const uniqByPlayerId = (arr: any[]) => {
      const map = new Map<number, any>();
      for (const it of arr) {
        const pid = it?.player?.id;
        if (pid) map.set(pid, it);
      }
      return [...map.values()];
    };

    // 3) 팀별로 injuries 묶기
    const homeItems = uniqByPlayerId(
      items.filter((it) => it.team?.id === homeTeam.id),
    );
    const awayItems = uniqByPlayerId(
      items.filter((it) => it.team?.id === awayTeam.id),
    );

    const mapPlayer = (it: any) => {
      const apiType = it.player?.type; // "Missing Fixture"
      const reason = it.player?.reason; // "Knee Injury" / "Inactive" ...

      return {
        playerId: it.player?.id,
        name: it.player?.name ?? '',
        photo: it.player?.photo,
        reason: reason ?? apiType ?? undefined,
        apiType: apiType ?? undefined,
        apiDetail: reason ?? undefined,
        updatedAt: new Date(),
      };
    };

    const homePlayers = homeItems.map(mapPlayer).filter((p) => p.playerId);
    const awayPlayers = awayItems.map(mapPlayer).filter((p) => p.playerId);

    // 4) 업데이트 문서 (빈 응답이면 players는 기존 유지)
    const update: any = {
      fixtureId,
      leagueId: match?.league?.id,
      season: match?.league?.season,
      date: new Date(match?.date),

      home: {
        teamId: homeTeam.id,
        name: homeTeam.name,
        logo: homeTeam.logo,
      },

      away: {
        teamId: awayTeam.id,
        name: awayTeam.name,
        logo: awayTeam.logo,
      },

      source: 'api-football',
      fetchedAt: new Date(),
    };

    if (homePlayers.length) update.home.players = homePlayers;
    if (awayPlayers.length) update.away.players = awayPlayers;

    // 5) upsert 저장
    this.logger.log('경기 부상 및 출장정이 조회 완료...');
    return await this.fixtureAbsenceModel.findOneAndUpdate(
      { fixtureId },
      { $set: update },
      { upsert: true, returnDocument: 'after' },
    );
  }

  async getFixtureAbsence(matchId: number) {
    return await this.fixtureAbsenceModel.findOne({ fixtureId: matchId });
  }
}
