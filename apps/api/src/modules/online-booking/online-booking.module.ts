import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AutomationModule } from '../automation/automation.module';

// Services
import { OnlineBookingSettingsService } from './online-booking-settings.service';
import { OtpService } from './otp.service';
import { AppointmentHoldsService } from './appointment-holds.service';
import { DepositsService } from './deposits.service';
import { ClientBookingRulesService } from './client-booking-rules.service';

// Controllers
import { PublicBookingController } from './public-booking.controller';
import { AdminBookingController } from './admin-booking.controller';

@Module({
  imports: [DatabaseModule, AutomationModule],
  controllers: [PublicBookingController, AdminBookingController],
  providers: [
    OnlineBookingSettingsService,
    OtpService,
    AppointmentHoldsService,
    DepositsService,
    ClientBookingRulesService,
  ],
  exports: [
    OnlineBookingSettingsService,
    OtpService,
    AppointmentHoldsService,
    DepositsService,
    ClientBookingRulesService,
  ],
})
export class OnlineBookingModule {}
