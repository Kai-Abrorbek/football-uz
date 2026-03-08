import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { ModulesModule } from './modules/modules.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramUpdate } from './modules/auth/strategies/telegram.update';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // 환경변수 설정
    ConfigModule.forRoot({
      isGlobal: true, // 모든 모듈에서 사용 가능
      envFilePath: '.env',
    }),

    TelegrafModule.forRoot({
      token:
        process.env.TELEGRAM_BOT_TOKEN ||
        '8267568246:AAFCmvn9VZjtYYaNrg8Rlc5EJn90mxYY8SY',
    }),

    DatabaseModule,
    RedisModule,
    ModulesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, TelegramUpdate],
})
export class AppModule {}
