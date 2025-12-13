import { Module } from '@nestjs/common';
import { CartLinksController } from './cart-links.controller';
import { CartLinksService } from './cart-links.service';

@Module({
  controllers: [CartLinksController],
  providers: [CartLinksService],
  exports: [CartLinksService],
})
export class CartLinksModule {}
