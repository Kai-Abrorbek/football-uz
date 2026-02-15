import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PlayersService } from './players.service';
import { PlayerQueryDto } from './dto/player-query.dto';

@ApiTags('Players')
@Controller('players')
export class PlayersController {
  constructor(private playersService: PlayersService) {}

  @Get()
  @ApiOperation({ summary: '선수 목록 조회' })
  async findAll(@Query() query: PlayerQueryDto) {
    return this.playersService.findAll(query);
  }

  @Get('search')
  @ApiOperation({ summary: '선수 검색' })
  @ApiQuery({ name: 'q', required: true })
  async search(@Query('q') query: string) {
    return this.playersService.search(query);
  }

  @Get('uzbek')
  @ApiOperation({ summary: '우즈벡 선수 조회' })
  async findUzbekPlayers() {
    return this.playersService.findUzbekPlayers();
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: '팀별 선수 조회' })
  async findByTeam(@Param('teamId') teamId: number) {
    return this.playersService.findByTeam(+teamId);
  }

  @Get(':id')
  @ApiOperation({ summary: '선수 상세 조회' })
  async findById(@Param('id') id: number) {
    return this.playersService.findById(+id);
  }
}
