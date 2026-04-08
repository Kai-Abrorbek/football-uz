import { ApiProperty } from '@nestjs/swagger';
import { NotificationSettings } from '../../../schemas';

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: {
    id: string;
    username: string;
    email: string;
    language: string;
    isEmailVerified?: boolean;
    notificationSettings?: NotificationSettings;
  };
}
