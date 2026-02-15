import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePredictionDto {
  @ApiProperty()
  @IsNumber()
  matchId: number; // API-Football ID
}
