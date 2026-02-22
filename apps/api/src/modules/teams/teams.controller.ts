import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { TeamQueryDto } from './dto/team-query.dto';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  @ApiOperation({ summary: '팀 목록 조회' })
  async findAll(@Query() query: TeamQueryDto) {
    return this.teamsService.findAll(query);
  }

  @Get('search')
  @ApiOperation({ summary: '팀 검색' })
  @ApiQuery({ name: 'q', required: true })
  async search(@Query('q') query: string) {
    return this.teamsService.search(query);
  }

  @Get('league/:leagueId')
  @ApiOperation({ summary: '리그별 팀 조회' })
  async findByLeague(@Param('leagueId') leagueId: number) {
    return this.teamsService.findByLeague(+leagueId);
  }

  @Get(':id')
  @ApiOperation({ summary: '팀 상세 조회' })
  async findById(@Param('id') id: number) {
    return this.teamsService.findById(+id);
  }

  @Get('leagues/:id')
  @ApiOperation({ summary: '팀 모든 리그 상세 조회' })
  async getTeamLeagues(@Param('id') id: number) {
    return this.teamsService.getTeamLeagues(+id);
  }
}
