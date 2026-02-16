import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News, NewsDocument } from '../../schemas/news.schema';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsQueryDto } from './dto/news-query.dto';

@Injectable()
export class NewsService {
  constructor(@InjectModel(News.name) private newsModel: Model<NewsDocument>) {}

  async create(dto: CreateNewsDto) {
    const news = await this.newsModel.create({
      ...dto,
      publishedAt: dto.isPublished ? new Date() : null,
      viewCount: 0,
    });
    return news;
  }

  async findAll(query: NewsQueryDto) {
    const filter: any = { isPublished: true };
    const limit = query.limit || 20;

    if (query.category) {
      filter.category = query.category;
    }

    if (query.tag) {
      filter.tags = query.tag;
    }

    if (query.teamId) {
      filter.relatedTeams = query.teamId;
    }

    if (query.playerId) {
      filter.relatedPlayers = query.playerId;
    }

    return this.newsModel
      .find(filter)
      .sort({ publishedAt: -1 })
      .limit(limit)
      .exec();
  }

  async findById(id: string) {
    const news = await this.newsModel.findById(id);
    if (!news) {
      throw new NotFoundException('뉴스를 찾을 수 없습니다');
    }

    // 조회수 증가
    news.viewCount += 1;
    await news.save();

    return news;
  }

  async findByCategory(category: string, limit: number = 10) {
    return this.newsModel
      .find({ category, isPublished: true })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .exec();
  }

  async findTrending(limit: number = 10) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return this.newsModel
      .find({
        isPublished: true,
        publishedAt: { $gte: sevenDaysAgo },
      })
      .sort({ viewCount: -1 })
      .limit(limit)
      .exec();
  }

  async update(id: string, dto: UpdateNewsDto) {
    const news = await this.newsModel.findByIdAndUpdate(
      id,
      {
        ...dto,
        publishedAt:
          dto.isPublished && !dto.isPublished ? new Date() : undefined,
      },
      { returnDocument: 'after' },
    );

    if (!news) {
      throw new NotFoundException('뉴스를 찾을 수 없습니다');
    }

    return news;
  }

  async delete(id: string) {
    const result = await this.newsModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('뉴스를 찾을 수 없습니다');
    }
    return { message: '뉴스가 삭제되었습니다' };
  }
}
