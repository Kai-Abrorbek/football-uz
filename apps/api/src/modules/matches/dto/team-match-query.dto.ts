import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

// team-match-query.dto.ts
export class TeamMatchQueryDto {
  @IsNumber()
  teamId: number;

  @IsOptional()
  @IsNumber()
  limit?: number = 15;

  @IsOptional()
  @IsString()
  cursor?: string; // 날짜 ISO string

  @IsOptional()
  @IsIn(['prev', 'next'])
  direction?: 'prev' | 'next';
}
