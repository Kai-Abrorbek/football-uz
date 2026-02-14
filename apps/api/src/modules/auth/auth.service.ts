import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { SocialLoginDto } from './dto/social-login.dto';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private config: ConfigService,
  ) {}

  async socialLogin(dto: SocialLoginDto): Promise<AuthResponseDto> {
    let profile: {
      email: string;
      name: string;
      picture?: string;
      providerId: string;
    };

    if (dto.provider === 'google') {
      profile = await this.verifyGoogleToken(dto.token);
    } else if (dto.provider === 'telegram') {
      profile = await this.verifyTelegramAuth(dto.data, dto.token);
    } else {
      throw new UnauthorizedException('지원하지 않는 로그인 방식입니다');
    }

    // 이메일로 기존 유저 찾기
    let user = await this.userModel.findOne({ email: profile.email });

    if (!user) {
      // 신규 유저 생성
      const username = this.generateUsername(profile.email, profile.name);

      user = await this.userModel.create({
        username,
        email: profile.email,
        password: crypto.randomBytes(32).toString('hex'), // 랜덤 비밀번호
        language: 'uz',
        role: 'user',
        isActive: true,
        isEmailVerified: true, // 소셜 로그인은 이메일 검증 완료로 간주
        avatar: profile.picture,
        [`${dto.provider}Id`]: profile.providerId,
      });
    } else {
      // 기존 유저면 providerId 업데이트
      if (!user[`${dto.provider}Id`]) {
        user[`${dto.provider}Id`] = profile.providerId;
        await user.save();
      }
    }

    // JWT 발급
    const payload = {
      sub: user._id,
      username: user.username,
      email: user.email,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        language: user.language,
      },
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userModel.findOne({
      $or: [{ email: dto.email }, { username: dto.username }],
    });

    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일 또는 아이디입니다');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간

    const user = await this.userModel.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      language: dto.language || 'uz',
      role: 'user',
      isActive: true,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // 이메일 발송
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.language,
    );

    const payload = {
      sub: user._id,
      username: user.username,
      email: user.email,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        language: user.language,
      },
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new UnauthorizedException('유효하지 않거나 만료된 토큰입니다');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { message: '이메일 인증이 완료되었습니다' };
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('존재하지 않는 이메일입니다');
    }

    if (user.isEmailVerified) {
      throw new ConflictException('이미 인증된 이메일입니다');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.language,
    );

    return { message: '인증 이메일이 재발송되었습니다' };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userModel.findOne({
      $or: [{ email: dto.emailOrUsername }, { username: dto.emailOrUsername }],
    });

    if (!user) {
      throw new UnauthorizedException('잘못된 인증 정보입니다');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('잘못된 인증 정보입니다');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('비활성화된 계정입니다');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const payload = {
      sub: user._id,
      username: user.username,
      email: user.email,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        language: user.language,
      },
    };
  }

  async validateUser(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    return user;
  }

  private async verifyGoogleToken(idToken: string) {
    try {
      const client = new OAuth2Client(this.config.get('GOOGLE_CLIENT_ID'));
      const ticket = await client.verifyIdToken({
        idToken,
        audience: this.config.get('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new UnauthorizedException('이메일 정보를 가져올 수 없습니다');
      }

      return {
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture,
        providerId: payload.sub,
      };
    } catch (error) {
      throw new UnauthorizedException('Google 토큰 검증 실패');
    }
  }

  private async verifyTelegramAuth(data: any, hash: string) {
    const botToken = this.config.get('TELEGRAM_BOT_TOKEN');

    if (!botToken) {
      throw new UnauthorizedException(
        'Telegram Bot Token이 설정되지 않았습니다',
      );
    }

    // Telegram 데이터 검증
    const checkData = { ...data };
    delete checkData.hash;

    const dataCheckString = Object.keys(checkData)
      .sort()
      .map((k) => `${k}=${checkData[k]}`)
      .join('\n');

    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      throw new UnauthorizedException(
        '유효하지 않은 Telegram 인증 데이터입니다',
      );
    }

    // auth_date 검증 (5분 이내)
    const authDate = parseInt(data.auth_date);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 300) {
      throw new UnauthorizedException('만료된 Telegram 인증 데이터입니다');
    }

    // 이메일 생성 (텔레그램은 이메일 제공 안 함)
    const email = data.username
      ? `${data.username}@telegram.footballuz`
      : `tg_${data.id}@telegram.footballuz`;

    return {
      email,
      name: `${data.first_name} ${data.last_name || ''}`.trim(),
      picture: data.photo_url,
      providerId: data.id.toString(),
    };
  }

  private generateUsername(email: string, name: string): string {
    const base =
      name?.replace(/\s+/g, '_').toLowerCase() || email.split('@')[0];
    const random = Math.random().toString(36).substring(2, 6);
    return `${base}_${random}`;
  }
}
