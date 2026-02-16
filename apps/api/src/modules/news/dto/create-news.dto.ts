import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MultiLangText {
  @ApiProperty()
  @IsString()
  uz: string;

  @ApiProperty()
  @IsString()
  ru: string;

  @ApiProperty()
  @IsString()
  en: string;
}

export class CreateNewsDto {
  @ApiProperty({ type: MultiLangText })
  title: MultiLangText;

  @ApiProperty({ type: MultiLangText })
  content: MultiLangText;

  @ApiProperty({ type: MultiLangText })
  summary: MultiLangText;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  sourceUrl?: string;

  @ApiProperty({
    enum: ['transfer', 'match', 'injury', 'worldcup', 'uzbekistan', 'general'],
  })
  @IsEnum(['transfer', 'match', 'injury', 'worldcup', 'uzbekistan', 'general'])
  category: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ required: false, type: [Number] })
  @IsArray()
  @IsOptional()
  relatedTeams?: number[];

  @ApiProperty({ required: false, type: [Number] })
  @IsArray()
  @IsOptional()
  relatedPlayers?: number[];

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
