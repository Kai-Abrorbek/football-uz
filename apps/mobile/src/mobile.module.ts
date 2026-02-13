import { Module } from '@nestjs/common';
import { MobileController } from './mobile.controller';
import { MobileService } from './mobile.service';

@Module({
  imports: [],
  controllers: [MobileController],
  providers: [MobileService],
})
export class MobileModule {}
