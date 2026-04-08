import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FcmService } from './fcm.service';
import { title } from 'process';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    private readonly fcmService: FcmService,
  ) {}

  @Post('send')
  @ApiOperation({ summary: '알림 전송 (관리자용)' })
  async sendNotification(@Body() dto: SendNotificationDto) {
    if (dto.userId) {
      return this.notificationsService.sendToUser(dto.userId, dto);
    } else {
      return this.notificationsService.sendToAll(dto);
    }
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '내 알림 목록' })
  async getMyNotifications(@Req() req, @Query('limit') limit?: number) {
    return this.notificationsService.getUserNotifications(
      req.user._id,
      limit ? +limit : 20,
    );
  }

  @Patch(':id/read')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '알림 읽음 처리' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read-all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '모든 알림 읽음 처리' })
  async markAllAsRead(@Req() req) {
    return this.notificationsService.markAllAsRead(req.user._id);
  }

  @Post('fcm-token')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'FCM 토큰 저장' })
  async saveFcmToken(@Req() req, @Body() body: { token: string }) {
    return this.notificationsService.saveFcmToken(req.user._id, body.token);
  }

  @Get('match-alert/:matchId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '경기 알람 설정 조회' })
  async getMatchAlert(@Param('matchId') matchId: string, @Req() req) {
    return this.notificationsService.getMatchAlert(req.user._id, matchId);
  }

  @Post('match-alert/:matchId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '경기 알람 설정 저장' })
  async setMatchAlert(
    @Param('matchId') matchId: string,
    @Req() req,
    @Body() body: { matchStart: boolean; goals: boolean; matchEnd: boolean },
  ) {
    return this.notificationsService.setMatchAlert(req.user._id, matchId, body);
  }

  @Delete('match-alert/:matchId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '경기 알람 삭제' })
  async deleteMatchAlert(@Param('matchId') matchId: string, @Req() req) {
    return this.notificationsService.deleteMatchAlert(req.user._id, matchId);
  }

  @Post('send-multiple')
  async sendToMultiple(
    @Body()
    requestBody: {
      tokens: string[];
      title: string;
      body: string;
      data?: any;
    },
  ): Promise<any> {
    return await this.fcmService.sendToMultipleDevices(
      requestBody.tokens,
      requestBody.title,
      requestBody.body,
      requestBody.data,
    );
  }
}
