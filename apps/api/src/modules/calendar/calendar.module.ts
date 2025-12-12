import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { GoogleCalendarService } from './google-calendar.service';
import { CalendarSyncService } from './calendar-sync.service';

@Module({
  controllers: [CalendarController],
  providers: [GoogleCalendarService, CalendarSyncService],
  exports: [GoogleCalendarService, CalendarSyncService],
})
export class CalendarModule {}
