import { IsArray, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFavoritesDto {
  @ApiProperty({ enum: ['teams', 'players', 'leagues'] })
  @IsEnum(['teams', 'players', 'leagues'])
  type: 'teams' | 'players' | 'leagues';

  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}
