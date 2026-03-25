import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('API KEY:', process.env.OPENAI_API_KEY);
  app.use(cookieParser());

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // CORS 설정
  app.enableCors({
    origin: [
      'http://72.62.75.97:3005',
      'http://localhost:3005',
      'http://localhost:3000',
      'http://localhost:8081',
    ],
    credentials: true,
  });

  // Swagger Basic Auth 미들웨어
  app.use('/api/docs', (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Docs"');
      res.status(401).send('Unauthorized');
      return;
    }

    const base64 = authHeader.split(' ')[1];
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');

    const adminUser = process.env.SWAGGER_USER;
    const adminPass = process.env.SWAGGER_PASSWORD;

    if (!adminUser || !adminPass) {
      res.status(403).send('Swagger disabled');
      return;
    }

    if (username === adminUser && password === adminPass) {
      next();
    } else {
      res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Docs"');
      res.status(401).send('Unauthorized');
    }
  });

  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
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
    .addBearerAuth()
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
