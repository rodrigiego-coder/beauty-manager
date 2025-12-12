import { Module } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyJobs } from './loyalty.jobs';

@Module({
  controllers: [LoyaltyController],
  providers: [LoyaltyService, LoyaltyJobs],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
