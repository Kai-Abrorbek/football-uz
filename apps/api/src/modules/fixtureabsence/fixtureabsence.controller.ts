import { Controller, Get, Logger, Query } from '@nestjs/common';
import { FixtureabsenceService } from './fixtureabsence.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('fixtureabsence')
export class FixtureabsenceController {
  constructor(private readonly fixtureAbsenceService: FixtureabsenceService) {}

  @Get('match-absence') // 콜론 제거
  async getFixtureAbsence(@Query('matchId') matchId: string) {
    return this.fixtureAbsenceService.getFixtureAbsence(Number(matchId));
  }

  @Get()
  @ApiOperation({ summary: '경기 부상 및 출장정이 조회' })
  async findAll(@Query('matchId') matchId: string) {
    return this.fixtureAbsenceService.saveFixtureAbsences(Number(matchId));
  }
}
