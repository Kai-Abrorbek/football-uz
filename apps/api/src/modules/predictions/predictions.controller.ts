import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';

@ApiTags('Predictions')
@Controller('predictions')
export class PredictionsController {
  constructor(private predictionsService: PredictionsService) {}

  @Post()
  @ApiOperation({ summary: 'AI 경기 예측 생성' })
  async createPrediction(@Body() dto: CreatePredictionDto) {
    return this.predictionsService.createPrediction(dto.matchId);
  }

  @Get()
  @ApiOperation({ summary: '전체 예측 조회' })
  async findAll(@Query('limit') limit?: number) {
    return this.predictionsService.findAll(limit ? +limit : 20);
  }

  @Get('match/:matchId')
  @ApiOperation({ summary: '경기별 예측 조회' })
  async findByMatch(@Param('matchId') matchId: number) {
    return this.predictionsService.findByMatch(+matchId);
  }
}
