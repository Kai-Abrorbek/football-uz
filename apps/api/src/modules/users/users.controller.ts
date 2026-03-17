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
import { UpdateNotificationSettingsDto } from '../notifications/dto/update-notification-settings.dto';
import { TeamsService } from '../teams/teams.service';
import { PlayersService } from '../players/players.service';
import { LeaguesService } from '../leagues/leagues.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private teamsService: TeamsService,
    private playersService: PlayersService,
    private leaguesService: LeaguesService,
  ) {}

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
    console.log(dto);
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

  // @Post('settings/notifications')
  // @ApiOperation({ summary: '알림 설정 변경' })
  // async updateNotificationSettings(@Req() req, @Body() dto: UpdateSettingsDto) {
  //   return this.usersService.updateNotificationSettings(req.user._id, dto);
  // }

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

  @Get('notification-settings')
  @ApiOperation({ summary: '알림 설정 조회' })
  async getNotificationSettings(@Req() req) {
    const user = await this.usersService.findById(req.user._id);
    return (
      user.notificationSettings || {
        matchStart: false,
        goals: false,
        matchEnd: false,
        news: false,
        predictions: false,
      }
    );
  }

  @Post('notification-settings')
  @ApiOperation({ summary: '알림 설정 수정' })
  async updateNotificationSettings(
    @Req() req,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.usersService.updateNotificationSettings(req.user._id, dto);
  }

  @Post('fcm-token')
  @ApiOperation({ summary: 'FCM 토큰 등록' })
  async registerFcmToken(@Req() req, @Body() body: { token: string }) {
    return this.usersService.registerFcmToken(req.user._id, body.token);
  }

  @Post('follow/:type/:id')
  @ApiOperation({ summary: '팔로우/언팔로우 토글' })
  async toggleFollow(
    @Req() req,
    @Param('type') type: 'teams' | 'players' | 'leagues',
    @Param('id') id: number,
  ) {
    return this.usersService.toggleFollow(req.user._id, type, id);
  }

  @Get('following')
  @ApiOperation({ summary: '팔로잉 목록 조회' })
  async getFollowing(@Req() req) {
    return this.usersService.getFollowing(req.user._id);
  }

  @Get('following/teams')
  @ApiOperation({ summary: '팔로잉 팀 목록 + 다음 경기' })
  async getFollowingTeams(@Req() req) {
    const teamIds = await this.usersService.getFollowingTeams(req.user._id);
    return this.teamsService.getFollowingTeamsWithNextMatch(teamIds);
  }

  @Get('following/players')
  @ApiOperation({ summary: '팔로잉 선수 목록' })
  async getFollowingPlayers(@Req() req) {
    const playerIds = await this.usersService.getFollowingPlayers(req.user._id);
    return this.playersService.getFollowingPlayers(playerIds);
  }

  @Get('following/leagues')
  @ApiOperation({ summary: '팔로잉 리그 목록' })
  async getFollowingLeagues(@Req() req) {
    const leagueIds = await this.usersService.getFollowingLeagues(req.user._id);
    return this.leaguesService.getFollowingLeagues(leagueIds);
  }

  @Get('suggested/teams')
  async getSuggestedTeams(@Req() req) {
    const following = await this.usersService.getFollowing(req.user._id);
    return this.teamsService.getSuggestedTeams(
      following.teams,
      following.teams,
    );
  }

  @Get('suggested/players')
  async getSuggestedPlayers(@Req() req) {
    const following = await this.usersService.getFollowing(req.user._id);
    return this.playersService.getSuggestedPlayers(
      following.players,
      following.teams,
      following.leagues,
    );
  }

  @Get('suggested/leagues')
  async getSuggestedLeagues(@Req() req) {
    const following = await this.usersService.getFollowing(req.user._id);
    return this.leaguesService.getSuggestedLeagues(
      following.leagues,
      following.teams,
    );
  }
}
