import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Highlight } from '../../schemas/highlight.schema';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Match, MatchDocument } from '../../schemas';

@Injectable()
export class HighlightsService {
  constructor(
    @InjectModel(Highlight.name) private highlightModel: Model<Highlight>,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getHighlight(
    matchId: string,
    homeTeam: string,
    awayTeam: string,
    date: string,
  ) {
    // 1. 캐시 확인
    const cacheKey = `matchId:${matchId}&homeTeam:${homeTeam}&awayTeam:${awayTeam}&date:${date}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // 2. MongoDB 확인 (Redis 미스 시)
    const dbCached = await this.highlightModel.findOne({ matchId }).lean();
    if (dbCached) {
      await this.cacheManager.set(cacheKey, dbCached, 60 * 60 * 24 * 7);
      return dbCached;
    }

    // 3. YouTube API 검색
    const query = `${homeTeam} vs ${awayTeam} highlights ${new Date(date).getFullYear()}`;
    const apiKey = this.configService.get('YOUTUBE_API_KEY');

    try {
      const { data } = await firstValueFrom(
        this.httpService.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: 3, // 1 → 3으로 늘려서
            order: 'relevance',
            videoDuration: 'medium',
            videoEmbeddable: 'true', // ← 이거 추가
            key: apiKey,
          },
        }),
      );

      const item = data.items?.[0];
      if (!item) return null;

      // videoId로 duration 가져오기
      const { data: videoData } = await firstValueFrom(
        this.httpService.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'contentDetails',
            id: item.id.videoId,
            key: apiKey,
          },
        }),
      );

      const rawDuration = videoData.items?.[0]?.contentDetails?.duration ?? '';
      const duration = this.parseDuration(rawDuration);

      // 3. DB에 캐시 저장
      const highlight = await this.highlightModel.create({
        matchId,
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.medium?.url,
        duration,
        publishedAt: item.snippet.publishedAt,
      });

      return highlight;
    } catch (error: any) {
      console.error('YouTube API error:', error.message);
      return null;
    }
  }

  // PT2M53S → 2:53
  private parseDuration(iso: string): string {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '';
    const h = parseInt(match[1] ?? '0');
    const m = parseInt(match[2] ?? '0');
    const s = parseInt(match[3] ?? '0');
    const mm = h > 0 ? `${h}:${String(m).padStart(2, '0')}` : `${m}`;
    const ss = String(s).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  async getHighlights(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.highlightModel
        .find({ videoId: { $exists: true } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.highlightModel.countDocuments({ videoId: { $exists: true } }),
    ]);

    // match 정보 합치기
    const enriched = await Promise.all(
      items.map(async (item) => {
        if (!item.matchId) return { ...item, match: null };
        const match = await this.matchModel
          .findById(item.matchId)
          .select('homeTeam awayTeam goals status')
          .lean();
        return { ...item, match };
      }),
    );

    return {
      items: enriched,
      total,
      page,
      hasMore: skip + items.length < total,
    };
  }
}
