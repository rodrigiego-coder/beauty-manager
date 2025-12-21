import { Module } from '@nestjs/common';
import { TriageController } from './triage.controller';
import { TriageService } from './triage.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TriageController],
  providers: [TriageService],
  exports: [TriageService],
})
export class TriageModule {}
