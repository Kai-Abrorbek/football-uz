import { Controller, Get, Logger, Query } from '@nestjs/common';
import { FixtureabsenceService } from './fixtureabsence.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('fixtureabsence')
export class FixtureabsenceController {
  constructor(private readonly fixtureAbsenceService: FixtureabsenceService) {}

  @Get()
  @ApiOperation({ summary: '경기 부상 및 출장정이 조회' })
  async findAll(@Query('matchId') matchId: string) {
    return this.fixtureAbsenceService.saveFixtureAbsences(Number(matchId));
  }
}
