import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsQueryDto } from './dto/news-query.dto';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  @Post()
  @ApiOperation({ summary: '뉴스 생성 (관리자용)' })
  async create(@Body() dto: CreateNewsDto) {
    return this.newsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '뉴스 목록 조회' })
  async findAll(@Query() query: NewsQueryDto) {
    return this.newsService.findAll(query);
  }

  @Get('trending')
  @ApiOperation({ summary: '인기 뉴스 조회' })
  async findTrending(@Query('limit') limit?: number) {
    return this.newsService.findTrending(limit ? +limit : 10);
  }

  @Get('category/:category')
  @ApiOperation({ summary: '카테고리별 뉴스 조회' })
  async findByCategory(
    @Param('category') category: string,
    @Query('limit') limit?: number,
  ) {
    return this.newsService.findByCategory(category, limit ? +limit : 10);
  }

  @Get(':id')
  @ApiOperation({ summary: '뉴스 상세 조회' })
  async findById(@Param('id') id: string) {
    return this.newsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '뉴스 수정 (관리자용)' })
  async update(@Param('id') id: string, @Body() dto: UpdateNewsDto) {
    return this.newsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '뉴스 삭제 (관리자용)' })
  async delete(@Param('id') id: string) {
    return this.newsService.delete(id);
  }
}
