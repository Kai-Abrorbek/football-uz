import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@footballuz.uz' })
  @IsEmail({}, { message: '올바른 이메일을 입력해주세요.' })
  email: string;

  @ApiProperty({ example: 'admin1234' })
  @IsString()
  @MinLength(6, { message: '비밀번호는 6자 이상이어야 합니다.' })
  password: string;
}
