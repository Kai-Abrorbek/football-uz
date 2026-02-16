import { IsEnum, IsObject, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWorldCupDto {
  @ApiProperty({ enum: ['group', 'knockout', 'venue', 'info'] })
  @IsEnum(['group', 'knockout', 'venue', 'info'])
  type: 'group' | 'knockout' | 'venue' | 'info';

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  group?: any;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  bracket?: any;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  venue?: any;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  uzbekistanStatus?: any;
}
