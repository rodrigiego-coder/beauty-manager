import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { NewTransaction } from '../../database';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * GET /transactions
   * Lista todas as transações
   */
  @Get()
  async findAll() {
    return this.transactionsService.findAll();
  }

  /**
   * GET /transactions/summary
   * Retorna resumo financeiro
   */
  @Get('summary')
  async getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.transactionsService.getSummary(start, end);
  }

  /**
   * GET /transactions/period
   * Lista transações por período
   */
  @Get('period')
  async findByPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionsService.findByPeriod(
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * GET /transactions/type/:type
   * Lista transações por tipo
   */
  @Get('type/:type')
  async findByType(@Param('type') type: 'INCOME' | 'EXPENSE') {
    return this.transactionsService.findByType(type);
  }

  /**
   * GET /transactions/client/:clientId
   * Lista transações por cliente
   */
  @Get('client/:clientId')
  async findByClient(@Param('clientId') clientId: string) {
    return this.transactionsService.findByClient(clientId);
  }

  /**
   * GET /transactions/:id
   * Busca transação por ID
   */
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const transaction = await this.transactionsService.findById(id);

    if (!transaction) {
      throw new NotFoundException('Transacao nao encontrada');
    }

    return transaction;
  }

  /**
   * POST /transactions
   * Cria uma nova transação
   */
  @Post()
  async create(@Body() data: NewTransaction) {
    return this.transactionsService.create(data);
  }

  /**
   * PATCH /transactions/:id
   * Atualiza uma transação
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<NewTransaction>,
  ) {
    const transaction = await this.transactionsService.update(id, data);

    if (!transaction) {
      throw new NotFoundException('Transacao nao encontrada');
    }

    return transaction;
  }

  /**
   * DELETE /transactions/:id
   * Remove uma transação
   */
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.transactionsService.delete(id);

    if (!deleted) {
      throw new NotFoundException('Transacao nao encontrada');
    }

    return { message: 'Transacao removida com sucesso' };
  }
}
