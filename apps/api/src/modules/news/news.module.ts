import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { News, NewsSchema } from '../../schemas/news.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: News.name, schema: NewsSchema }]),
  ],
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
