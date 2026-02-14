import { IsString, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SocialLoginDto {
  @ApiProperty({ enum: ['google', 'telegram'] })
  @IsEnum(['google', 'telegram'])
  provider: 'google' | 'telegram';

  @ApiProperty({ description: 'Google: idToken, Telegram: auth hash' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Telegram만 필요 (전체 auth data)' })
  @IsObject()
  data?: any;
}
