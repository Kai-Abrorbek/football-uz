import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorldCupService } from './worldcup.service';
import { UpdateWorldCupDto } from './dto/update-worldcup.dto';

@ApiTags('WorldCup 2026')
@Controller('worldcup')
export class WorldCupController {
  constructor(private worldCupService: WorldCupService) {}

  @Get()
  @ApiOperation({ summary: '월드컵 전체 정보' })
  async getOverview() {
    return this.worldCupService.getOverview();
  }

  @Get('groups')
  @ApiOperation({ summary: '조 편성 조회' })
  async getGroups() {
    return this.worldCupService.getGroups();
  }

  @Get('groups/:groupName')
  @ApiOperation({ summary: '특정 조 조회' })
  async getGroup(@Param('groupName') groupName: string) {
    return this.worldCupService.getGroup(groupName);
  }

  @Get('bracket')
  @ApiOperation({ summary: '대진표 조회' })
  async getBracket() {
    return this.worldCupService.getBracket();
  }

  @Get('venues')
  @ApiOperation({ summary: '경기장 목록' })
  async getVenues() {
    return this.worldCupService.getVenues();
  }

  @Get('uzbekistan')
  @ApiOperation({ summary: '우즈베키스탄 현황' })
  async getUzbekistanStatus() {
    return this.worldCupService.getUzbekistanStatus();
  }

  @Get('matches')
  @ApiOperation({ summary: '월드컵 전체 경기' })
  async getWorldCupMatches() {
    return this.worldCupService.getWorldCupMatches();
  }

  @Get('matches/uzbekistan')
  @ApiOperation({ summary: '우즈베키스탄 경기' })
  async getUzbekistanMatches() {
    return this.worldCupService.getUzbekistanMatches();
  }

  @Post()
  @ApiOperation({ summary: '월드컵 데이터 생성 (관리자용)' })
  async create(@Body() dto: UpdateWorldCupDto) {
    return this.worldCupService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '월드컵 데이터 수정 (관리자용)' })
  async update(@Param('id') id: string, @Body() dto: UpdateWorldCupDto) {
    return this.worldCupService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '월드컵 데이터 삭제 (관리자용)' })
  async delete(@Param('id') id: string) {
    return this.worldCupService.delete(id);
  }
}
