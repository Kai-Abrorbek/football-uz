import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Standing, StandingDocument } from '../../schemas/standing.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SEASON } from '../../constants/leagues.constant';

@Injectable()
export class StandingsService {
  private logger = new Logger(StandingsService.name);
  constructor(
    @InjectModel(Standing.name) private standingModel: Model<StandingDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findByLeague(leagueId: number, season: number) {
    const cacheKey = `standings:${leagueId}:${season}`;

    // 1. 캐시 확인
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.log(`✅ 캐시 히트: ${cacheKey}`);
      return cached;
    }

    // 2. DB 조회
    const standing = await this.standingModel.findOne({
      'league.id': leagueId,
      'league.season': season,
    });

    if (!standing) {
      throw new NotFoundException('순위표를 찾을 수 없습니다');
    }

    // 3. 캐시 저장 (24시간)
    await this.cacheManager.set(cacheKey, standing, 60 * 60 * 24 * 1000);
    this.logger.log(`💾 캐시 저장: ${cacheKey}`);

    return standing;
  }

  async findCurrentByLeague(leagueId: number) {
    return this.findByLeague(leagueId, 2022);
  }

  async findAll(season: number = SEASON) {
    const cacheKey = `standings:all:${season}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.log(`✅ 캐시 히트: ${cacheKey}`);
      return cached;
    }

    const standings = await this.standingModel
      .find({ 'league.season': season })
      .exec();

    await this.cacheManager.set(cacheKey, standings, 60 * 60 * 24 * 1000);

    return standings;
  }

  // 스케줄러에서 순위 업데이트 후 호출
  async clearCache(leagueId: number, season: number) {
    await this.cacheManager.del(`standings:${leagueId}:${season}`);
    await this.cacheManager.del(`standings:all:${season}`);
    this.logger.log(`🗑️ 캐시 삭제: standings:${leagueId}:${season}`);
  }
}
