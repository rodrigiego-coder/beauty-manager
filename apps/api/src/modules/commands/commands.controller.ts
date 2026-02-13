import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { CommandsService } from './commands.service';
import { ScheduledMessagesService } from '../notifications/scheduled-messages.service';
import {
  OpenCommandDto,
  AddItemDto,
  UpdateItemDto,
  AddPaymentDto,
  ApplyDiscountDto,
  AddNoteDto,
  LinkClientDto,
  RemoveItemDto,
  ReopenCommandDto,
} from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('commands')
export class CommandsController {
  constructor(
    private readonly commandsService: CommandsService,
    private readonly scheduledMessagesService: ScheduledMessagesService,
  ) {}

  /**
   * GET /commands
   * Lista comandas do salão
   */
  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
  ) {
    return this.commandsService.findAll(user.salonId, status);
  }

  /**
   * GET /commands/open
   * Lista comandas ativas (OPEN ou IN_SERVICE)
   */
  @Get('open')
  async findOpen(@CurrentUser() user: JwtPayload) {
    return this.commandsService.findOpen(user.salonId);
  }

  /**
   * GET /commands/waiting-payment
   * Lista comandas aguardando pagamento
   */
  @Get('waiting-payment')
  async findWaitingPayment(@CurrentUser() user: JwtPayload) {
    return this.commandsService.findWaitingPayment(user.salonId);
  }

  /**
   * GET /commands/pending-balance
   * Lista comandas encerradas com saldo pendente (Contas a Receber)
   */
  @Get('pending-balance')
  async findPendingBalance(@CurrentUser() user: JwtPayload) {
    return this.commandsService.findClosedWithPendingBalance(user.salonId);
  }

  /**
   * GET /commands/clients
   * Lista clientes do salão para seleção em comandas
   */
  @Get('clients')
  async findClients(@CurrentUser() user: JwtPayload) {
    return this.commandsService.getClients(user.salonId);
  }

  /**
   * GET /commands/card/:cardNumber
   * Busca comanda por número do cartão
   */
  @Get('card/:cardNumber')
  async findByCardNumber(
    @CurrentUser() user: JwtPayload,
    @Param('cardNumber') cardNumber: string,
  ) {
    const command = await this.commandsService.findByCardNumber(user.salonId, cardNumber);
    if (!command) {
      return { found: false, message: 'Nenhuma comanda aberta com este cartao' };
    }
    return { found: true, command };
  }

/**
   * GET /commands/quick-access/:code
   * Acesso rápido: busca ou cria comanda automaticamente
   */
  @Get('quick-access/:code')
  async quickAccess(
    @CurrentUser() user: JwtPayload,
    @Param('code') code: string,
  ) {
    console.log('DEBUG quickAccess - user:', JSON.stringify(user));
    return this.commandsService.quickAccess(user.salonId, code, {
      id: user.id,
      salonId: user.salonId,
      role: user.role,
    });
  }

  /**
   * GET /commands/:id
   * Busca comanda por ID com detalhes
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.commandsService.getDetails(id);
  }

  /**
   * GET /commands/:id/items
   * Lista itens da comanda
   */
  @Get(':id/items')
  async getItems(@Param('id') id: string) {
    return this.commandsService.getItems(id);
  }

  /**
   * GET /commands/:id/payments
   * Lista pagamentos da comanda
   */
  @Get(':id/payments')
  async getPayments(@Param('id') id: string) {
    return this.commandsService.getPayments(id);
  }

  /**
   * GET /commands/:id/events
   * Lista eventos/timeline da comanda
   */
  @Get(':id/events')
  async getEvents(@Param('id') id: string) {
    return this.commandsService.getEvents(id);
  }

  /**
   * POST /commands
   * Abre nova comanda
   */
  @Post()
  async open(
    @CurrentUser() user: JwtPayload,
    @Body() data: OpenCommandDto,
  ) {
    return this.commandsService.open(user.salonId, data, {
      id: user.id,
      salonId: user.salonId,
      role: user.role,
    });
  }

  /**
   * POST /commands/:id/items
   * Adiciona item à comanda
   */
  @Post(':id/items')
  async addItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() data: AddItemDto,
  ) {
    return this.commandsService.addItem(id, data, {
      id: user.id,
      salonId: user.salonId,
      role: user.role,
    });
  }

  /**
   * PATCH /commands/:id/items/:itemId
   * Atualiza item da comanda
   */
  @Patch(':id/items/:itemId')
  async updateItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() data: UpdateItemDto,
  ) {
    return this.commandsService.updateItem(id, itemId, data, {
      id: user.id,
      salonId: user.salonId,
      role: user.role,
    });
  }

  /**
   * DELETE /commands/:id/items/:itemId
   * Remove item da comanda
   */
  @Delete(':id/items/:itemId')
  async removeItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() data: RemoveItemDto,
  ) {
    return this.commandsService.removeItem(id, itemId, data.reason, {
      id: user.id,
      salonId: user.salonId,
      role: user.role,
    });
  }

  /**
   * POST /commands/:id/discount
   * Aplica desconto na comanda (apenas OWNER/MANAGER)
   */
  @Post(':id/discount')
  @Roles('OWNER', 'MANAGER')
  async applyDiscount(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() data: ApplyDiscountDto,
  ) {
    return this.commandsService.applyDiscount(id, data, {
      id: user.id,
      salonId: user.salonId,
      role: user.role,
    });
  }

  /**
   * POST /commands/:id/close-service
   * Encerra serviços da comanda
   */
  @Post(':id/close-service')
  async closeService(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.commandsService.closeService(id, {
      id: user.id,
      salonId: user.salonId,
      role: user.role,
    });
  }

  /**
   * POST /commands/:id/close-pending
   * Fecha comanda com pagamento pendente (gera conta a receber)
   */
  @Post(':id/close-pending')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async closePendingPayment(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() data: { dueDate?: string; notes?: string },
  ) {
    return this.commandsService.closePendingPayment(id, {
      id: user.id,
      salonId: user.salonId,
      role: user.role,
    }, {
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      notes: data.notes,
    });
  }

  /**
   * POST /commands/:id/payments
   * Adiciona pagamento
   */
  @Post(':id/payments')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async addPayment(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() data: AddPaymentDto,
  ) {
    return this.commandsService.addPayment(id, data, {
      id: user.id,
      salonId: user.salonId,
      role: user.role,
    });
  }

  /**
   * POST /commands/:id/close-cashier
   * Fecha comanda no caixa
   */
  @Post(':id/close-cashier')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async closeCashier(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.commandsService.closeCashier(id, {
      id: user.id,
      salonId: user.salonId,
      role: user.role,
    });
  }

  /**
   * POST /commands/:id/reminder
   * Agenda lembrete pós-venda (Alexia)
   */
  @Post(':id/reminder')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async scheduleReminder(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() data: { message: string; scheduledFor: string; clientPhone: string; clientName?: string },
  ) {
    const command = await this.commandsService.findById(id);
    if (!command || command.salonId !== user.salonId) {
      throw new Error('Comanda não encontrada');
    }

    const dedupeKey = `command:${id}:reminder:${Date.now()}`;

    await this.scheduledMessagesService.scheduleCustomNotification({
      salonId: user.salonId,
      recipientPhone: data.clientPhone,
      recipientName: data.clientName || null,
      notificationType: 'CUSTOM',
      customMessage: data.message,
      scheduledFor: new Date(data.scheduledFor),
      dedupeKey,
    });

    return { success: true, message: 'Lembrete agendado com sucesso' };
  }

  /**
   * POST /commands/:id/cancel
   * Cancela comanda (apenas OWNER/MANAGER)
   */
  @Post(':id/cancel')
  @Roles('OWNER', 'MANAGER')
  async cancel(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() data: { reason?: string },
  ) {
    return this.commandsService.cancel(id, data.reason, {
      id: user.id,
      salonId: user.salonId,
      role: user.role,
    });
  }

  /**
   * POST /commands/:id/reopen
   * Reabre comanda fechada (apenas OWNER/MANAGER)
   */
  @Post(':id/reopen')
  @Roles('OWNER', 'MANAGER')
  async reopen(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() data: ReopenCommandDto,
  ) {
    return this.commandsService.reopenCommand(id, data, {
      id: user.id,
      salonId: user.salonId,
      role: user.role,
    });
  }

  /**
   * POST /commands/:id/link-client
   * Vincula cliente à comanda
   */
  @Post(':id/link-client')
  async linkClient(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() data: LinkClientDto,
  ) {
    return this.commandsService.linkClient(id, data, {
      id: user.id,
      salonId: user.salonId,
      role: user.role,
    });
  }

  /**
   * DELETE /commands/:id/client
   * Remove vínculo do cliente com a comanda
   */
  @Delete(':id/client')
  async unlinkClient(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.commandsService.unlinkClient(id, {
      id: user.id,
      salonId: user.salonId,
      role: user.role,
    });
  }

  /**
   * POST /commands/:id/notes
   * Adiciona nota à comanda
   */
  @Post(':id/notes')
  async addNote(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() data: AddNoteDto,
  ) {
    return this.commandsService.addNote(id, data, {
      id: user.id,
      salonId: user.salonId,
      role: user.role,
    });
  }
}