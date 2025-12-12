import { Module } from '@nestjs/common';
import { HairProfileController } from './hair-profile.controller';
import { HairProfileService } from './hair-profile.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [HairProfileController],
  providers: [HairProfileService],
  exports: [HairProfileService],
})
export class HairProfileModule {}
