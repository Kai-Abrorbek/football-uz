import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

// DTO
export class SyncSeasonDto {
  @ApiProperty({ example: 2025 })
  @IsNumber()
  season: number;

  @ApiProperty({ example: 39, required: false })
  @IsNumber()
  @IsOptional()
  leagueId?: number; // 특정 리그만 할 때, 없으면 전체
}
