import { IsArray, IsNumber, IsString } from 'class-validator';

// DTO
export class UpdateBracketOrderDto {
  @IsArray()
  @IsString({ each: true })
  matchIds: string[]; // 순서대로 정렬된 경기 ID 배열

  @IsString()
  round: string;

  @IsNumber()
  leagueId: number;

  @IsNumber()
  season: number;
}
