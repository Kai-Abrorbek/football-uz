import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateFavoritesDto } from './dto/update-favorites.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: '내 프로필 조회' })
  async getMyProfile(@Req() req) {
    return this.usersService.getProfile(req.user._id);
  }

  @Get('profile')
  @ApiOperation({ summary: '내 프로필 조회' })
  async getProfile(@Req() req) {
    return this.usersService.findById(req.user._id);
  }

  @Post('profile')
  @ApiOperation({ summary: '프로필 수정' })
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user._id, dto);
  }

  @Post('favorites')
  @ApiOperation({ summary: '즐겨찾기 일괄 수정' })
  async updateFavorites(@Req() req, @Body() dto: UpdateFavoritesDto) {
    return this.usersService.updateFavorites(req.user._id, dto);
  }

  @Post('favorites/:type/:id')
  @ApiOperation({ summary: '즐겨찾기 추가' })
  async addFavorite(
    @Req() req,
    @Param('type') type: string,
    @Param('id') id: number,
  ) {
    return this.usersService.addFavorite(req.user._id, type, id);
  }

  @Delete('favorites/:type/:id')
  @ApiOperation({ summary: '즐겨찾기 삭제' })
  async removeFavorite(
    @Req() req,
    @Param('type') type: string,
    @Param('id') id: number,
  ) {
    return this.usersService.removeFavorite(req.user._id, type, id);
  }

  @Post('settings/notifications')
  @ApiOperation({ summary: '알림 설정 변경' })
  async updateNotificationSettings(@Req() req, @Body() dto: UpdateSettingsDto) {
    return this.usersService.updateNotificationSettings(req.user._id, dto);
  }

  @Post('fcm-token')
  @ApiOperation({ summary: 'FCM 토큰 등록' })
  async addFcmToken(@Req() req, @Body('token') token: string) {
    await this.usersService.addFcmToken(req.user._id, token);
    return { message: '토큰이 등록되었습니다' };
  }

  @Post('fcm-token')
  @ApiOperation({ summary: 'FCM 토큰 삭제' })
  async removeFcmToken(@Req() req, @Body('token') token: string) {
    await this.usersService.removeFcmToken(req.user._id, token);
    return { message: '토큰이 삭제되었습니다' };
  }
}
