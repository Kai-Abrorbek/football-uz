import { IsString, IsObject, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  data?: any;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  tokens?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  userId?: string;
}
