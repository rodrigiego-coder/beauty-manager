import { Module } from '@nestjs/common';
import { AccountsPayableService } from './accounts-payable.service';
import { AccountsPayableController } from './accounts-payable.controller';

@Module({
  controllers: [AccountsPayableController],
  providers: [AccountsPayableService],
  exports: [AccountsPayableService],
})
export class AccountsPayableModule {}
