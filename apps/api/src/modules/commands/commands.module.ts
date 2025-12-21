import { Module, forwardRef } from '@nestjs/common';
import { CommandsController } from './commands.controller';
import { CommandsService } from './commands.service';
import { CashRegistersModule } from '../cash-registers';
import { ClientsModule } from '../clients';
import { CommissionsModule } from '../commissions';
import { LoyaltyModule } from '../loyalty';
import { ProductsModule } from '../products';
import { RecipesModule } from '../recipes';
import { ServiceConsumptionsModule } from '../service-consumptions';

@Module({
  imports: [
    forwardRef(() => CashRegistersModule),
    forwardRef(() => ClientsModule),
    forwardRef(() => CommissionsModule),
    forwardRef(() => LoyaltyModule),
    forwardRef(() => ProductsModule),
    forwardRef(() => RecipesModule),
    forwardRef(() => ServiceConsumptionsModule),
  ],
  controllers: [CommandsController],
  providers: [CommandsService],
  exports: [CommandsService],
})
export class CommandsModule {}