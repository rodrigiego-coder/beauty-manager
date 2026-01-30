import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
import { ProfileController } from './profile.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '../../database/database.module';
import { WhatsAppModule } from '../../whatsapp/whatsapp.module';
import { SalonsModule } from '../salons/salons.module';

@Module({
  imports: [DatabaseModule, ConfigModule, WhatsAppModule, SalonsModule],
  controllers: [UsersController, ProfileController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}