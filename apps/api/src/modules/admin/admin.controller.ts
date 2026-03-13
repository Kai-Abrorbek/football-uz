import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── 대시보드 ───────────────────────────────────────────────
  @Get('dashboard')
  @ApiOperation({ summary: '대시보드 통계' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  // ─── 경기 ────────────────────────────────────────────────────
  @Get('matches')
  @ApiOperation({ summary: '경기 목록' })
  getMatches(
    @Query('date') date?: string,
    @Query('week') week?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 30,
  ) {
    return this.adminService.getMatches(
      date,
      week === 'true',
      Number(page),
      Number(limit),
    );
  }

  @Get('matches/streaming')
  @ApiOperation({ summary: '스트리밍 중인 경기 목록' })
  getStreamingMatches() {
    return this.adminService.getStreamingMatches();
  }

  @Post('matches/:id/streaming')
  @ApiOperation({ summary: '스트리밍 설정' })
  setStreaming(
    @Param('id') id: string,
    @Body() body: { isStreaming: boolean; streamKey?: string },
  ) {
    return this.adminService.setStreaming(id, body.isStreaming, body.streamKey);
  }

  // ─── 유저 ────────────────────────────────────────────────────
  @Get('users')
  @ApiOperation({ summary: '유저 목록' })
  getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(Number(page), Number(limit), search);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: '유저 권한 변경' })
  updateUserRole(
    @Param('id') id: string,
    @Body() body: { role: 'user' | 'admin' },
  ) {
    return this.adminService.updateUserRole(id, body.role);
  }

  @Patch('users/:id/ban')
  @ApiOperation({ summary: '유저 정지/해제' })
  toggleUserBan(@Param('id') id: string, @Body() body: { isBanned: boolean }) {
    return this.adminService.toggleUserBan(id, body.isBanned);
  }

  // ─── 팀 ─────────────────────────────────────────────────────
  @Get('teams')
  @ApiOperation({ summary: '팀 목록' })
  getTeams(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('search') search?: string,
  ) {
    return this.adminService.getTeams(Number(page), Number(limit), search);
  }

  @Patch('teams/:id/color')
  @ApiOperation({ summary: '팀 컬러 수정' })
  updateTeamColor(@Param('id') id: string, @Body() body: { color: string }) {
    return this.adminService.updateTeamColor(id, body.color);
  }

  // ─── 하이라이트 ──────────────────────────────────────────────
  @Get('highlights')
  @ApiOperation({ summary: '하이라이트 목록' })
  getHighlights(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getHighlights(Number(page), Number(limit));
  }

  @Delete('highlights/:id')
  @ApiOperation({ summary: '하이라이트 삭제' })
  deleteHighlight(@Param('id') id: string) {
    return this.adminService.deleteHighlight(id);
  }

  // ─── 알람 푸시 ──────────────────────────────────────────────
  @Post('notifications/send')
  sendNotification(
    @Body() body: { title: string; body: string; target: string },
  ) {
    return this.adminService.sendNotification(
      body.title,
      body.body,
      body.target,
    );
  }

  @Get('notifications/history')
  getNotificationHistory(@Query('page') page = 1) {
    return this.adminService.getNotificationHistory(Number(page));
  }
}
