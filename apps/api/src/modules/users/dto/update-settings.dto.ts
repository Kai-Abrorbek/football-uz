import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  matchStart?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  goals?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  matchEnd?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  news?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  predictions?: boolean;
}
