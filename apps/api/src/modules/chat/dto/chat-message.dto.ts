import { IsString, IsArray, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ enum: ['uz', 'ru', 'en', 'kr'], default: 'uz' })
  @IsEnum(['uz', 'ru', 'en', 'kr'])
  @IsOptional()
  language?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sessionId?: string;
}
