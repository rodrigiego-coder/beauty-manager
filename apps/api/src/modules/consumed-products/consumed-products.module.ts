import { Module } from '@nestjs/common';
import { ConsumedProductsService } from './consumed-products.service';
import { ConsumedProductsController } from './consumed-products.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [ConsumedProductsController],
  providers: [ConsumedProductsService],
  exports: [ConsumedProductsService],
})
export class ConsumedProductsModule {}
