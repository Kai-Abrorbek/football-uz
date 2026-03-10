import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { HighlightsController } from './highlights.controller';
import { HighlightsService } from './highlights.service';
import { HighlightSchema, Highlight } from '../../schemas/highlight.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Highlight.name, schema: HighlightSchema },
    ]),
    HttpModule,
  ],
  controllers: [HighlightsController],
  providers: [HighlightsService],
  exports: [HighlightsService],
})
export class HighlightsModule {}
