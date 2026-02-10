import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { AccountsReceivableService } from './accounts-receivable.service';
import { NewAccountReceivable } from '../../database';

@Controller('accounts-receivable')
export class AccountsReceivableController {
  constructor(private readonly accountsReceivableService: AccountsReceivableService) {}

  /**
   * GET /accounts-receivable
   * Lista todas as contas a receber
   */
  @Get()
  async findAll() {
    return this.accountsReceivableService.findAll();
  }

  /**
   * GET /accounts-receivable/with-client
   * Lista contas a receber com dados do cliente
   */
  @Get('with-client')
  async findAllWithClient() {
    return this.accountsReceivableService.findAllWithClient();
  }

  /**
   * GET /accounts-receivable/pending
   * Lista contas pendentes
   */
  @Get('pending')
  async findPending() {
    return this.accountsReceivableService.findPending();
  }

  /**
   * GET /accounts-receivable/overdue
   * Lista contas vencidas
   */
  @Get('overdue')
  async findOverdue() {
    return this.accountsReceivableService.findOverdue();
  }

  /**
   * GET /accounts-receivable/total-pending
   * Retorna o total a receber
   */
  @Get('total-pending')
  async getTotalPending() {
    const total = await this.accountsReceivableService.getTotalPending();
    return { totalPending: total };
  }

  /**
   * GET /accounts-receivable/status/:status
   * Lista contas por status
   */
  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    return this.accountsReceivableService.findByStatus(status);
  }

  /**
   * GET /accounts-receivable/client/:clientId
   * Lista contas por cliente
   */
  @Get('client/:clientId')
  async findByClient(@Param('clientId') clientId: string) {
    return this.accountsReceivableService.findByClient(clientId);
  }

  /**
   * GET /accounts-receivable/:id
   * Busca conta por ID
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    const account = await this.accountsReceivableService.findById(id);

    if (!account) {
      throw new NotFoundException('Conta nao encontrada');
    }

    return account;
  }

  /**
   * POST /accounts-receivable
   * Cria uma nova conta a receber (fiado)
   */
  @Post()
  async create(@Body() data: NewAccountReceivable) {
    return this.accountsReceivableService.create(data);
  }

  /**
   * PATCH /accounts-receivable/:id
   * Atualiza uma conta a receber
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<NewAccountReceivable>,
  ) {
    const account = await this.accountsReceivableService.update(id, data);

    if (!account) {
      throw new NotFoundException('Conta nao encontrada');
    }

    return account;
  }

  /**
   * PATCH /accounts-receivable/:id/pay
   * Marca uma conta como recebida
   */
  @Patch(':id/pay')
  async markAsPaid(@Param('id') id: string) {
    const account = await this.accountsReceivableService.markAsPaid(id);

    if (!account) {
      throw new NotFoundException('Conta nao encontrada');
    }

    return account;
  }

  /**
   * DELETE /accounts-receivable/:id
   * Remove uma conta a receber
   */
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deleted = await this.accountsReceivableService.delete(id);

    if (!deleted) {
      throw new NotFoundException('Conta nao encontrada');
    }

    return { message: 'Conta removida com sucesso' };
  }
}
