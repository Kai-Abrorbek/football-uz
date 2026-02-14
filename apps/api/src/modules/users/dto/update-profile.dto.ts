import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(20)
  username?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ enum: ['uz', 'ru', 'en'], required: false })
  @IsEnum(['uz', 'ru', 'en'])
  @IsOptional()
  language?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  darkMode?: boolean;
}
