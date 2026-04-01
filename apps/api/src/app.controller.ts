import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private readonly mongoConnection: Connection,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async checkHealth() {
    // 1. MongoDB 상태 체크 (1 === connected)
    const isDbConnected = this.mongoConnection.readyState === 1;

    // 2. Redis 상태 체크 (ping-pong 테스트)
    let isRedisConnected = false;
    try {
      await this.cacheManager.set('health_ping', 'pong', 5000); // 5초짜리 임시 데이터 쓰기
      const val = await this.cacheManager.get('health_ping'); // 다시 읽기
      if (val === 'pong') {
        isRedisConnected = true;
      }
    } catch (error) {
      isRedisConnected = false;
    }

    return {
      status: isDbConnected && isRedisConnected ? 'ok' : 'error',
      db: isDbConnected ? 'ok' : 'error',
      redis: isRedisConnected ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
    };
  }
}
