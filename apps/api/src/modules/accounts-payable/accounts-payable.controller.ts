import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { AccountsPayableService } from './accounts-payable.service';
import { NewAccountPayable } from '../../database';

@Controller('accounts-payable')
export class AccountsPayableController {
  constructor(private readonly accountsPayableService: AccountsPayableService) {}

  /**
   * GET /accounts-payable
   * Lista todas as contas a pagar
   */
  @Get()
  async findAll() {
    return this.accountsPayableService.findAll();
  }

  /**
   * GET /accounts-payable/pending
   * Lista contas pendentes
   */
  @Get('pending')
  async findPending() {
    return this.accountsPayableService.findPending();
  }

  /**
   * GET /accounts-payable/overdue
   * Lista contas vencidas
   */
  @Get('overdue')
  async findOverdue() {
    return this.accountsPayableService.findOverdue();
  }

  /**
   * GET /accounts-payable/total-pending
   * Retorna o total pendente
   */
  @Get('total-pending')
  async getTotalPending() {
    const pending = await this.accountsPayableService.findPending();
    const total = pending.reduce((sum, a) => sum + parseFloat(a.amount), 0);
    return { total, count: pending.length };
  }

  /**
   * GET /accounts-payable/status/:status
   * Lista contas por status
   */
  @Get('status/:status')
  async findByStatus(@Param('status') status: 'PENDING' | 'PAID' | 'OVERDUE') {
    return this.accountsPayableService.findByStatus(status);
  }

  /**
   * GET /accounts-payable/:id
   * Busca conta por ID
   */
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const account = await this.accountsPayableService.findById(id);

    if (!account) {
      throw new NotFoundException('Conta nao encontrada');
    }

    return account;
  }

  /**
   * POST /accounts-payable
   * Cria uma nova conta a pagar
   */
  @Post()
  async create(@Body() data: NewAccountPayable) {
    return this.accountsPayableService.create(data);
  }

  /**
   * PATCH /accounts-payable/:id
   * Atualiza uma conta a pagar
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<NewAccountPayable>,
  ) {
    const account = await this.accountsPayableService.update(id, data);

    if (!account) {
      throw new NotFoundException('Conta nao encontrada');
    }

    return account;
  }

  /**
   * PATCH /accounts-payable/:id/pay
   * Marca uma conta como paga
   */
  @Patch(':id/pay')
  async markAsPaid(@Param('id', ParseIntPipe) id: number) {
    const account = await this.accountsPayableService.markAsPaid(id);

    if (!account) {
      throw new NotFoundException('Conta nao encontrada');
    }

    return account;
  }

  /**
   * DELETE /accounts-payable/:id
   * Remove uma conta a pagar
   */
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.accountsPayableService.delete(id);

    if (!deleted) {
      throw new NotFoundException('Conta nao encontrada');
    }

    return { message: 'Conta removida com sucesso' };
  }
}
