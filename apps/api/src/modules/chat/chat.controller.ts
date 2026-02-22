import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: '챗봇 메시지 전송' })
  async sendMessage(@Req() req, @Body() dto: ChatMessageDto) {
    return this.chatService.sendMessage(
      req.user._id,
      dto.message,
      dto.language || 'uz',
      dto.sessionId,
    );
  }

  @Get('sessions')
  @ApiOperation({ summary: '내 채팅 세션 목록' })
  async getUserSessions(@Req() req) {
    return this.chatService.getUserSessions(req.user._id);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: '세션 상세 조회' })
  async getSession(@Param('sessionId') sessionId: string) {
    return this.chatService.getSession(sessionId);
  }

  @Delete('session/:sessionId')
  @ApiOperation({ summary: '세션 삭제' })
  async deleteSession(@Param('sessionId') sessionId: string) {
    return this.chatService.deleteSession(sessionId);
  }

  @Post('public')
  @ApiOperation({ summary: '챗봇 메시지 전송 (비회원)' })
  async sendMessagePublic(@Body() dto: ChatMessageDto) {
    return this.chatService.sendMessage(
      'anonymous',
      dto.message,
      dto.language || 'en',
      dto.sessionId,
    );
  }

  @Get('public/session/:sessionId')
  @ApiOperation({ summary: '세션 상세 조회 (비회원)' })
  async getSessionPublic(@Param('sessionId') sessionId: string) {
    return this.chatService.getSession(sessionId);
  }
}
