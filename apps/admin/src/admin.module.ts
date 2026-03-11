import { Module } from '@nestjs/common';
import { MobileController } from './admin.controller';
import { MobileService } from './admin.service';

@Module({
  imports: [],
  controllers: [MobileController],
  providers: [MobileService],
})
export class MobileModule {}
