import { Module } from '@nestjs/common';
import { ABTestsController } from './ab-tests.controller';
import { ABTestsService } from './ab-tests.service';

@Module({
  controllers: [ABTestsController],
  providers: [ABTestsService],
  exports: [ABTestsService],
})
export class ABTestsModule {}
