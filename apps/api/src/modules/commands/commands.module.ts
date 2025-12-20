import { Module, forwardRef } from '@nestjs/common';
import { CommandsController } from './commands.controller';
import { CommandsService } from './commands.service';
import { CashRegistersModule } from '../cash-registers';
import { ClientsModule } from '../clients';
import { CommissionsModule } from '../commissions';
import { LoyaltyModule } from '../loyalty';
import { ProductsModule } from '../products';

@Module({
  imports: [
    forwardRef(() => CashRegistersModule),
    forwardRef(() => ClientsModule),
    forwardRef(() => CommissionsModule),
    forwardRef(() => LoyaltyModule),
    forwardRef(() => ProductsModule),
  ],
  controllers: [CommandsController],
  providers: [CommandsService],
  exports: [CommandsService],
})
export class CommandsModule {}