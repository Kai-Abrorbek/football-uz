import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NewsService } from '../news.service';

@Injectable()
export class NewsScheduler {
  private readonly logger = new Logger(NewsScheduler.name);

  constructor(private newsService: NewsService) {}

  // 매일 오전 6시 - 일반 뉴스
  // @Cron('0 6 * * *')
  async syncGeneralNews() {
    this.logger.log('일반 뉴스 동기화 시작');
    await this.newsService.fetchGeneralNews();
    this.logger.log('일반 뉴스 동기화 완료');
  }

  // 매일 오전 7시 - 리그 뉴스
  // @Cron('0 7 * * *')
  async syncLeaguesNews() {
    this.logger.log('리그 뉴스 동기화 시작');
    await this.newsService.fetchAllLeaguesNews();
    this.logger.log('리그 뉴스 동기화 완료');
  }
}
