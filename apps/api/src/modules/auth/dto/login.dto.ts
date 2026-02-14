import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  emailOrUsername: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}
