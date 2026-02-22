import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import OpenAI from 'openai';
import { News } from '../../schemas';
import { LEAGUES_NEWS } from '../../constants/leagues.constant';

@Injectable()
export class NewsService {
  private openai: OpenAI;
  private newsApiKey: string;
  private readonly logger = new Logger(NewsService.name);

  constructor(
    @InjectModel('News') private newsModel: Model<News>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.newsApiKey = this.configService.get<string>('NEWS_API_KEY') ?? '';
  }

  async translateText(text: string, targetLang: 'uz' | 'ru'): Promise<string> {
    const langName = targetLang === 'uz' ? 'Uzbek' : 'Russian';

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${langName}. Only return the translated text, nothing else.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content?.trim() || text;
  }

  private async saveArticle(article: any, relatedLeague?: number) {
    const existing = await this.newsModel.findOne({
      sourceUrl: article.url,
    });

    if (existing) return;

    const titleUz = await this.translateText(article.title, 'uz');
    const titleRu = await this.translateText(article.title, 'ru');

    const contentText = article.description || article.content || '';
    const contentUz = await this.translateText(contentText, 'uz');
    const contentRu = await this.translateText(contentText, 'ru');

    await this.newsModel.create({
      title: {
        en: article.title,
        uz: titleUz,
        ru: titleRu,
      },
      content: {
        en: contentText,
        uz: contentUz,
        ru: contentRu,
      },
      imageUrl: article.urlToImage,
      source: article.source.name,
      sourceUrl: article.url,
      category: 'general',
      isPublished: true,
      publishedAt: new Date(article.publishedAt),
      relatedTeams: relatedLeague ? [relatedLeague] : [],
    });

    this.logger.log(`뉴스 저장: ${article.title.substring(0, 50)}...`);
  }

  async fetchGeneralNews() {
    try {
      console.log('일반 축구 뉴스 가져오기 시작...');

      const response = await firstValueFrom(
        this.httpService.get('https://newsapi.org/v2/everything', {
          params: {
            q: 'football OR soccer',
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 10,
            apiKey: this.newsApiKey,
          },
        }),
      );

      const articles = response.data.articles;

      for (const article of articles) {
        await this.saveArticle(article);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      this.logger.log(`일반 뉴스 ${articles.length}개 저장 완료`);
    } catch (error) {
      this.logger.error('일반 뉴스 가져오기 실패:', error.message);
    }
  }

  async fetchLeagueNews(leagueId: number) {
    try {
      const league = LEAGUES_NEWS.find(
        (l: { id: number }) => l.id === leagueId,
      );
      if (!league) {
        this.logger.error(`리그 ID ${leagueId} 설정 없음`);
        return;
      }

      console.log(`${league.name} 뉴스 가져오기 시작...`);

      const response = await firstValueFrom(
        this.httpService.get('https://newsapi.org/v2/everything', {
          params: {
            q: league.searchQuery,
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 5,
            apiKey: this.newsApiKey,
          },
        }),
      );

      const articles = response.data.articles;

      for (const article of articles) {
        await this.saveArticle(article, leagueId);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      this.logger.log(`${league.name} 뉴스 ${articles.length}개 저장 완료`);
    } catch (error) {
      this.logger.error(`리그 ${leagueId} 뉴스 가져오기 실패:`, error.message);
    }
  }

  async fetchAllLeaguesNews() {
    for (const league of LEAGUES_NEWS) {
      await this.fetchLeagueNews(league.id);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  async findAll(query?: { category?: string; limit?: number }) {
    const filter: any = { isPublished: true };

    if (query?.category) {
      filter.category = query.category;
    }

    return this.newsModel
      .find(filter)
      .sort({ publishedAt: -1 })
      .limit(query?.limit || 20)
      .lean();
  }

  async findByLeague(leagueId: number, limit = 10) {
    return this.newsModel
      .find({
        isPublished: true,
        relatedTeams: leagueId,
      })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
  }

  async findOne(id: string) {
    return this.newsModel.findById(id).lean();
  }
}
