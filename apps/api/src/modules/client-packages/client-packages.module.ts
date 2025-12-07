import { Module } from '@nestjs/common';
import { ClientPackagesService } from './client-packages.service';
import { ClientPackagesController } from './client-packages.controller';

@Module({
  controllers: [ClientPackagesController],
  providers: [ClientPackagesService],
  exports: [ClientPackagesService],
})
export class ClientPackagesModule {}
