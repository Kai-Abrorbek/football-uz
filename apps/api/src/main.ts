import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // CORS 설정 (나중에 React Native에서 접근 가능하도록)
  app.enableCors({
    origin: true, // 개발 중에는 모든 origin 허용, 배포 시 수정 필요
    credentials: true,
  });

  // Validation Pipe (DTO 검증)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 속성 자동 제거
      forbidNonWhitelisted: true, // DTO에 없는 속성 있으면 에러
      transform: true, // 자동 타입 변환
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger 문서 설정
  const config = new DocumentBuilder()
    .setTitle('FootballUZ API')
    .setDescription('Football Uzbekistan API Documentation')
    .setVersion('1.0')
    .addBearerAuth() // JWT 인증
    .addTag('Auth', '인증 관련')
    .addTag('Users', '사용자 관련')
    .addTag('Matches', '경기 정보')
    .addTag('Teams', '팀 정보')
    .addTag('Players', '선수 정보')
    .addTag('Standings', '순위표')
    .addTag('Predictions', 'AI 예측')
    .addTag('News', '뉴스')
    .addTag('Chat', 'AI 챗봇')
    .addTag('Notifications', '알림')
    .addTag('WorldCup', '월드컵 2026')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
