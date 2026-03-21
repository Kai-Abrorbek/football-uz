import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MatchQueryDto {
  @ApiProperty({ required: false, description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  leagueId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  season?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  teamId?: number;

  @ApiProperty({ required: false, enum: ['NS', '1H', 'HT', '2H', 'FT', 'all'] })
  @IsOptional()
  @IsEnum(['NS', '1H', 'HT', '2H', 'FT', 'all'])
  status?: string;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  round?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsString()
  startUTC?: string;

  @IsOptional()
  @IsString()
  endUTC?: string;

  @IsOptional()
  @IsBoolean()
  allDates?: boolean;
}

export class LeagueMatchQueryDto {
  @ApiProperty({ required: false, description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  leagueId: number;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  season: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  teamId?: number;

  @ApiProperty({ required: false, enum: ['NS', '1H', 'HT', '2H', 'FT', 'all'] })
  @IsOptional()
  @IsEnum(['NS', '1H', 'HT', '2H', 'FT', 'all'])
  status?: string;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  round?: number;

  @IsOptional()
  @IsIn(['prev', 'next'])
  direction?: 'prev' | 'next';
}
