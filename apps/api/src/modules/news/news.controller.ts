import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NewsService } from './news.service';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: '뉴스 목록 조회' })
  async findAll(
    @Query('category') category?: string,
    @Query('limit') limit?: number,
  ) {
    return this.newsService.findAll({
      category,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('league/:leagueId')
  @ApiOperation({ summary: '리그별 뉴스 조회' })
  async findByLeague(
    @Param('leagueId') leagueId: string,
    @Query('limit') limit?: number,
  ) {
    return this.newsService.findByLeague(
      Number(leagueId),
      limit ? Number(limit) : 10,
    );
  }

  @Post('sync/general')
  @ApiOperation({ summary: '일반 뉴스 수동 동기화' })
  async syncGeneralNews() {
    this.newsService.fetchGeneralNews();
    return { message: '일반 뉴스 동기화 시작' };
  }

  @Post('sync/leagues')
  @ApiOperation({ summary: '모든 리그 뉴스 수동 동기화' })
  async syncLeaguesNews() {
    this.newsService.fetchAllLeaguesNews();
    return { message: '리그 뉴스 동기화 시작' };
  }

  @Get(':id')
  @ApiOperation({ summary: '뉴스 상세 조회' })
  async findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }
}
