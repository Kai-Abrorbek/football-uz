import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import {
  Body,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Controller,
  Query,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminLoginDto } from './dto/admin-login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('social')
  @ApiOperation({ summary: '소셜 로그인 (Google, Telegram)' })
  async socialLogin(@Body() dto: SocialLoginDto): Promise<AuthResponseDto> {
    return this.authService.socialLogin(dto);
  }

  @Post('register')
  @ApiOperation({ summary: '회원가입' })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    console.log(dto, 'CONTROLLER');
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: '이메일 인증' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: '인증 이메일 재발송' })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Get('telegram/status')
  async checkStatus(@Query('token') token: string) {
    return this.authService.checkLoginStatus(token);
  }

  // ====== ADMIN =====
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(
    @Body() dto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, user } = await this.authService.adminLogin(dto);

    // HttpOnly 쿠키로 저장
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      path: '/',
    });

    return { message: '로그인 성공', user };
  }

  // POST /auth/admin/logout
  @Post('admin/logout')
  @HttpCode(HttpStatus.OK)
  adminLogout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    return { message: '로그아웃 성공' };
  }

  // GET /auth/me
  @Get('me')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getMe(@Req() req: Request) {
    return this.authService.getMe((req.user as any)._id.toString());
  }
}
