import { Module } from '@nestjs/common';
import { ConsumedProductsService } from './consumed-products.service';
import { ConsumedProductsController } from './consumed-products.controller';

@Module({
  controllers: [ConsumedProductsController],
  providers: [ConsumedProductsService],
  exports: [ConsumedProductsService],
})
export class ConsumedProductsModule {}
