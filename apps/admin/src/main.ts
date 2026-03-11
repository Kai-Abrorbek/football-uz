import { NestFactory } from '@nestjs/core';
import { MobileModule } from './admin.module';

async function bootstrap() {
  const app = await NestFactory.create(MobileModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
