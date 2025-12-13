import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { eq, and, desc, ne, inArray } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  Database,
  commands,
  commandItems,
  commandPayments,
  commandEvents,
  users,
  services,
  clients,
  Command,
  CommandItem,
  CommandPayment,
} from '../../database';
import {
  OpenCommandDto,
  AddItemDto,
  UpdateItemDto,
  AddPaymentDto,
  ApplyDiscountDto,
  AddNoteDto,
  LinkClientDto,
} from './dto';
import { CashRegistersService } from '../cash-registers';
import { ClientsService } from '../clients';
import { CommissionsService } from '../commissions';
import { LoyaltyService } from '../loyalty/loyalty.service';

interface CurrentUser {
  id: string;
  salonId: string;
  role: string;
}

@Injectable()
export class CommandsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
    private cashRegistersService: CashRegistersService,
    private clientsService: ClientsService,
    private commissionsService: CommissionsService,
    private loyaltyService: LoyaltyService,
  ) {}

  /**
   * Lista comandas do salão com filtros
   */
  async findAll(salonId: string, status?: string) {
    // Query base com LEFT JOIN para incluir dados do cliente
    const baseQuery = this.db
      .select({
        id: commands.id,
        salonId: commands.salonId,
        clientId: commands.clientId,
        appointmentId: commands.appointmentId,
        cardNumber: commands.cardNumber,
        code: commands.code,
        status: commands.status,
        openedAt: commands.openedAt,
        openedById: commands.openedById,
        serviceClosedAt: commands.serviceClosedAt,
        serviceClosedById: commands.serviceClosedById,
        cashierClosedAt: commands.cashierClosedAt,
        cashierClosedById: commands.cashierClosedById,
        totalGross: commands.totalGross,
        totalDiscounts: commands.totalDiscounts,
        totalNet: commands.totalNet,
        notes: commands.notes,
        createdAt: commands.createdAt,
        updatedAt: commands.updatedAt,
        // Dados do cliente
        clientName: clients.name,
        clientPhone: clients.phone,
      })
      .from(commands)
      .leftJoin(clients, eq(commands.clientId, clients.id));

    if (status) {
      // Suporta múltiplos status separados por vírgula (ex: "OPEN,IN_SERVICE,WAITING_PAYMENT")
      const statusList = status.split(',').map(s => s.trim());

      if (statusList.length === 1) {
        return baseQuery
          .where(and(eq(commands.salonId, salonId), eq(commands.status, statusList[0])))
          .orderBy(desc(commands.openedAt));
      }

      // Múltiplos status usando IN
      return baseQuery
        .where(and(
          eq(commands.salonId, salonId),
          inArray(commands.status, statusList)
        ))
        .orderBy(desc(commands.openedAt));
    }

    return baseQuery
      .where(eq(commands.salonId, salonId))
      .orderBy(desc(commands.openedAt));
  }

  /**
   * Lista comandas abertas (não fechadas/canceladas)
   */
  async findOpen(salonId: string): Promise<Command[]> {
    return this.db
      .select()
      .from(commands)
      .where(
        and(
          eq(commands.salonId, salonId),
          ne(commands.status, 'CLOSED'),
          ne(commands.status, 'CANCELED')
        )
      )
      .orderBy(desc(commands.openedAt));
  }

  /**
   * Lista clientes do salão para seleção em comandas
   */
  async getClients(salonId: string) {
    return this.clientsService.findAll({ salonId, includeInactive: false });
  }

  /**
   * Busca comanda por ID
   */
  async findById(id: string): Promise<Command | null> {
    const result = await this.db
      .select()
      .from(commands)
      .where(eq(commands.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Busca comanda por número do cartão
   */
  async findByCardNumber(salonId: string, cardNumber: string): Promise<Command | null> {



    const result = await this.db
      .select()
      .from(commands)
      .where(
        and(
          eq(commands.salonId, salonId),
          eq(commands.cardNumber, cardNumber),
          ne(commands.status, 'CLOSED'),
          ne(commands.status, 'CANCELED')
        )
      )
      .limit(1);

    return result[0] || null;
  }

/**
   * Acesso rápido: busca ou cria comanda automaticamente
   */
  async quickAccess(salonId: string, code: string, currentUser: CurrentUser) {
    const openCommand = await this.findByCardNumber(salonId, code);

    if (openCommand) {
      return {
        status: 'FOUND',
        action: 'OPEN_EXISTING',
        commandId: openCommand.id,
        currentStatus: openCommand.status,
        command: openCommand,
      };
    }

    // Verifica se existe caixa aberto antes de criar nova comanda
    const cashRegister = await this.cashRegistersService.getCurrent(salonId);
    if (!cashRegister) {
      throw new BadRequestException('Abra o caixa antes de criar comandas');
    }

    const closedCommand = await this.db
      .select()
      .from(commands)
      .where(and(eq(commands.salonId, salonId), eq(commands.cardNumber, code)))
      .orderBy(desc(commands.createdAt))
      .limit(1);

    if (closedCommand.length > 0 && (closedCommand[0].status === 'CLOSED' || closedCommand[0].status === 'CANCELED')) {
      const newCommand = await this.open(salonId, { cardNumber: code }, currentUser, true);
      return {
        status: 'CREATED',
        action: 'CREATED_NEW',
        commandId: newCommand.id,
        currentStatus: newCommand.status,
        command: newCommand,
        message: `Comanda anterior estava ${closedCommand[0].status === 'CLOSED' ? 'fechada' : 'cancelada'}. Nova comanda criada.`,
      };
    }

    const newCommand = await this.open(salonId, { cardNumber: code }, currentUser, true);
    return {
      status: 'CREATED',
      action: 'CREATED_NEW',
      commandId: newCommand.id,
      currentStatus: newCommand.status,
      command: newCommand,
    };
  }

  /**
   * Abre uma nova comanda
   */
  async open(salonId: string, data: OpenCommandDto, currentUser: CurrentUser, skipCashCheck = false): Promise<Command> {
    // Verifica se existe caixa aberto (a menos que já foi verificado)
    if (!skipCashCheck) {
      const cashRegister = await this.cashRegistersService.getCurrent(salonId);
      if (!cashRegister) {
        throw new BadRequestException('Abra o caixa antes de criar comandas');
      }
    }

    // Verifica se já existe comanda aberta com este cartão
    const existing = await this.findByCardNumber(salonId, data.cardNumber);
    if (existing) {
      throw new BadRequestException(`Ja existe uma comanda aberta com o cartao ${data.cardNumber}`);
    }

    // Gera código sequencial
    const code = await this.generateCode(salonId);

    // Cria a comanda
    const [command] = await this.db
      .insert(commands)
      .values({
        salonId,
        cardNumber: data.cardNumber,
        code,
        clientId: data.clientId || null,
        notes: data.notes || null,
        openedById: currentUser.id,
        status: 'OPEN',
      })
      .returning();

    // Registra evento
    await this.addEvent(command.id, currentUser.id, 'OPENED', {
      cardNumber: data.cardNumber,
      clientId: data.clientId,
    });

    return command;
  }

  /**
   * Adiciona item à comanda
   */
  async addItem(commandId: string, data: AddItemDto, currentUser: CurrentUser): Promise<CommandItem> {
    const command = await this.findById(commandId);
    if (!command) {
      throw new NotFoundException('Comanda nao encontrada');
    }

    if (command.status === 'CLOSED' || command.status === 'CANCELED') {
      throw new BadRequestException('Comanda ja encerrada ou cancelada');
    }

    const quantity = data.quantity || 1;
    const discount = data.discount || 0;
    const totalPrice = (quantity * data.unitPrice) - discount;

    // Adiciona o item
    const [item] = await this.db
      .insert(commandItems)
      .values({
        commandId,
        type: data.type,
        description: data.description,
        quantity: quantity.toString(),
        unitPrice: data.unitPrice.toString(),
        discount: discount.toString(),
        totalPrice: totalPrice.toString(),
        performerId: data.performerId || null,
        referenceId: data.referenceId || null,
        addedById: currentUser.id,
      })
      .returning();

    // Atualiza totais da comanda
    await this.recalculateTotals(commandId);

    // Atualiza status para IN_SERVICE se estava OPEN
    if (command.status === 'OPEN') {
      await this.db
        .update(commands)
        .set({ status: 'IN_SERVICE', updatedAt: new Date() })
        .where(eq(commands.id, commandId));
    }

    // Registra evento
    await this.addEvent(commandId, currentUser.id, 'ITEM_ADDED', {
      itemId: item.id,
      type: data.type,
      description: data.description,
      quantity,
      unitPrice: data.unitPrice,
      totalPrice,
      performerId: data.performerId,
    });

    return item;
  }

  /**
   * Atualiza item da comanda
   */
  async updateItem(
    commandId: string,
    itemId: string,
    data: UpdateItemDto,
    currentUser: CurrentUser,
  ): Promise<CommandItem> {
    const command = await this.findById(commandId);
    if (!command) {
      throw new NotFoundException('Comanda nao encontrada');
    }

    if (command.status === 'CLOSED' || command.status === 'CANCELED') {
      throw new BadRequestException('Comanda ja encerrada ou cancelada');
    }

    const [existingItem] = await this.db
      .select()
      .from(commandItems)
      .where(and(eq(commandItems.id, itemId), eq(commandItems.commandId, commandId)))
      .limit(1);

    if (!existingItem) {
      throw new NotFoundException('Item nao encontrado');
    }

    if (existingItem.canceledAt) {
      throw new BadRequestException('Item ja foi cancelado');
    }

    const quantity = data.quantity ?? parseFloat(existingItem.quantity);
    const unitPrice = data.unitPrice ?? parseFloat(existingItem.unitPrice);
    const discount = data.discount ?? parseFloat(existingItem.discount || '0');
    const totalPrice = (quantity * unitPrice) - discount;

    const [updatedItem] = await this.db
      .update(commandItems)
      .set({
        quantity: quantity.toString(),
        unitPrice: unitPrice.toString(),
        discount: discount.toString(),
        totalPrice: totalPrice.toString(),
        performerId: data.performerId ?? existingItem.performerId,
        updatedAt: new Date(),
      })
      .where(eq(commandItems.id, itemId))
      .returning();

    // Recalcula totais
    await this.recalculateTotals(commandId);

    // Registra evento
    await this.addEvent(commandId, currentUser.id, 'ITEM_UPDATED', {
      itemId,
      from: {
        quantity: existingItem.quantity,
        unitPrice: existingItem.unitPrice,
        discount: existingItem.discount,
      },
      to: {
        quantity,
        unitPrice,
        discount,
      },
    });

    return updatedItem;
  }

  /**
   * Remove (cancela) item da comanda
   */
  async removeItem(
    commandId: string,
    itemId: string,
    reason: string | undefined,
    currentUser: CurrentUser,
  ): Promise<CommandItem> {
    const command = await this.findById(commandId);
    if (!command) {
      throw new NotFoundException('Comanda nao encontrada');
    }

    if (command.status === 'CLOSED' || command.status === 'CANCELED') {
      throw new BadRequestException('Comanda ja encerrada ou cancelada');
    }

    const [existingItem] = await this.db
      .select()
      .from(commandItems)
      .where(and(eq(commandItems.id, itemId), eq(commandItems.commandId, commandId)))
      .limit(1);

    if (!existingItem) {
      throw new NotFoundException('Item nao encontrado');
    }

    if (existingItem.canceledAt) {
      throw new BadRequestException('Item ja foi cancelado');
    }

    const [canceledItem] = await this.db
      .update(commandItems)
      .set({
        canceledAt: new Date(),
        canceledById: currentUser.id,
        cancelReason: reason || null,
        updatedAt: new Date(),
      })
      .where(eq(commandItems.id, itemId))
      .returning();

    // Recalcula totais
    await this.recalculateTotals(commandId);

    // Registra evento
    await this.addEvent(commandId, currentUser.id, 'ITEM_REMOVED', {
      itemId,
      description: existingItem.description,
      totalPrice: existingItem.totalPrice,
      reason,
    });

    return canceledItem;
  }

  /**
   * Aplica desconto geral na comanda
   */
  async applyDiscount(
    commandId: string,
    data: ApplyDiscountDto,
    currentUser: CurrentUser,
  ): Promise<Command> {
    const command = await this.findById(commandId);
    if (!command) {
      throw new NotFoundException('Comanda nao encontrada');
    }

    if (command.status === 'CLOSED' || command.status === 'CANCELED') {
      throw new BadRequestException('Comanda ja encerrada ou cancelada');
    }

    const oldDiscount = parseFloat(command.totalDiscounts || '0');
    const newDiscount = oldDiscount + data.discountAmount;
    const totalNet = parseFloat(command.totalGross || '0') - newDiscount;

    const [updatedCommand] = await this.db
      .update(commands)
      .set({
        totalDiscounts: newDiscount.toString(),
        totalNet: totalNet.toString(),
        updatedAt: new Date(),
      })
      .where(eq(commands.id, commandId))
      .returning();

    // Registra evento
    await this.addEvent(commandId, currentUser.id, 'DISCOUNT_APPLIED', {
      amount: data.discountAmount,
      reason: data.reason,
      oldDiscount,
      newDiscount,
    });

    return updatedCommand;
  }

  /**
   * Encerra os serviços da comanda
   */
  async closeService(commandId: string, currentUser: CurrentUser): Promise<Command> {
    const command = await this.findById(commandId);
    if (!command) {
      throw new NotFoundException('Comanda nao encontrada');
    }

    if (command.status === 'CLOSED' || command.status === 'CANCELED') {
      throw new BadRequestException('Comanda ja encerrada ou cancelada');
    }

    if (command.status === 'WAITING_PAYMENT') {
      throw new BadRequestException('Servicos ja foram encerrados');
    }

    const [updatedCommand] = await this.db
      .update(commands)
      .set({
        status: 'WAITING_PAYMENT',
        serviceClosedAt: new Date(),
        serviceClosedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(commands.id, commandId))
      .returning();

    // Registra evento
    await this.addEvent(commandId, currentUser.id, 'SERVICE_CLOSED', {
      totalGross: command.totalGross,
      totalNet: command.totalNet,
    });

    return updatedCommand;
  }

  /**
   * Adiciona pagamento à comanda
   */
  async addPayment(
    commandId: string,
    data: AddPaymentDto,
    currentUser: CurrentUser,
  ): Promise<CommandPayment> {
    const command = await this.findById(commandId);
    if (!command) {
      throw new NotFoundException('Comanda nao encontrada');
    }

    if (command.status === 'CLOSED' || command.status === 'CANCELED') {
      throw new BadRequestException('Comanda ja encerrada ou cancelada');
    }

    const [payment] = await this.db
      .insert(commandPayments)
      .values({
        commandId,
        method: data.method,
        amount: data.amount.toString(),
        notes: data.notes || null,
        receivedById: currentUser.id,
      })
      .returning();

    // Registra evento
    await this.addEvent(commandId, currentUser.id, 'PAYMENT_ADDED', {
      paymentId: payment.id,
      method: data.method,
      amount: data.amount,
    });

    return payment;
  }

  /**
   * Fecha comanda no caixa
   */
  async closeCashier(commandId: string, currentUser: CurrentUser): Promise<Command> {
    const command = await this.findById(commandId);
    if (!command) {
      throw new NotFoundException('Comanda nao encontrada');
    }

    if (command.status === 'CLOSED') {
      throw new BadRequestException('Comanda ja foi fechada');
    }

    if (command.status === 'CANCELED') {
      throw new BadRequestException('Comanda foi cancelada');
    }

    // Verifica se os pagamentos cobrem o total
    const payments = await this.getPayments(commandId);
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalNet = parseFloat(command.totalNet || '0');

    if (totalPaid < totalNet) {
      throw new BadRequestException(
        `Pagamento insuficiente. Total: R$ ${totalNet.toFixed(2)}, Pago: R$ ${totalPaid.toFixed(2)}`,
      );
    }

    const [closedCommand] = await this.db
      .update(commands)
      .set({
        status: 'CLOSED',
        cashierClosedAt: new Date(),
        cashierClosedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(commands.id, commandId))
      .returning();

    // Atualiza totais do caixa por método de pagamento
    for (const payment of payments) {
      await this.cashRegistersService.addSale(
        command.salonId,
        payment.method,
        parseFloat(payment.amount),
      );
    }

    // Se a comanda tem cliente vinculado, atualiza totalVisits e lastVisitDate
    if (command.clientId) {
      await this.clientsService.updateLastVisit(command.clientId);
    }

    // Cria comissoes para itens de servico com profissional
    await this.createCommissionsForCommand(command.salonId, commandId);

    // Processa pontos de fidelidade se cliente vinculado
    let loyaltyPointsEarned = 0;
    let tierUpgraded = false;
    let newTierName: string | undefined;

    if (command.clientId) {
      try {
        const loyaltyResult = await this.loyaltyService.processCommandPoints(
          command.salonId,
          commandId,
          command.clientId,
          currentUser.id
        );
        loyaltyPointsEarned = loyaltyResult.pointsEarned;
        tierUpgraded = loyaltyResult.tierUpgraded;
        newTierName = loyaltyResult.newTierName;
      } catch (err) {
        // Se houver erro no processamento de fidelidade, não impede o fechamento
        console.error('Erro ao processar pontos de fidelidade:', err);
      }
    }

    // Registra evento
    await this.addEvent(commandId, currentUser.id, 'CASHIER_CLOSED', {
      totalNet,
      totalPaid,
      change: totalPaid - totalNet,
      clientId: command.clientId,
      loyaltyPointsEarned,
      tierUpgraded,
      newTierName,
    });

    return closedCommand;
  }

  /**
   * Cria comissoes para itens de servico da comanda
   */
  private async createCommissionsForCommand(salonId: string, commandId: string): Promise<void> {
    // Busca todos os itens da comanda
    const items = await this.getItems(commandId);

    // Filtra apenas itens de servico nao cancelados e com profissional
    const serviceItems = items.filter(
      item => item.type === 'SERVICE' && !item.canceledAt && item.performerId
    );

    for (const item of serviceItems) {
      // Se o item tem referenceId (ID do servico), busca o commissionPercentage do servico
      let commissionPercentage = 0;

      if (item.referenceId) {
        const [service] = await this.db
          .select()
          .from(services)
          .where(eq(services.id, parseInt(item.referenceId)))
          .limit(1);

        if (service && parseFloat(service.commissionPercentage) > 0) {
          commissionPercentage = parseFloat(service.commissionPercentage);
        }
      }

      // Se nao tem servico vinculado ou servico nao tem comissao, usa a comissao do profissional
      if (commissionPercentage === 0 && item.performerId) {
        const [professional] = await this.db
          .select()
          .from(users)
          .where(eq(users.id, item.performerId))
          .limit(1);

        if (professional && professional.commissionRate) {
          commissionPercentage = parseFloat(professional.commissionRate) * 100;
        }
      }

      // Cria comissao se houver percentual
      if (commissionPercentage > 0) {
        await this.commissionsService.createFromCommandItem(
          salonId,
          commandId,
          item.id,
          item.performerId!,
          item.description,
          parseFloat(item.totalPrice),
          commissionPercentage,
        );
      }
    }
  }

  /**
   * Cancela comanda
   */
  async cancel(commandId: string, reason: string | undefined, currentUser: CurrentUser): Promise<Command> {
    const command = await this.findById(commandId);
    if (!command) {
      throw new NotFoundException('Comanda nao encontrada');
    }

    if (command.status === 'CLOSED') {
      throw new BadRequestException('Comanda ja foi fechada');
    }

    if (command.status === 'CANCELED') {
      throw new BadRequestException('Comanda ja foi cancelada');
    }

    const [canceledCommand] = await this.db
      .update(commands)
      .set({
        status: 'CANCELED',
        notes: reason ? `${command.notes || ''}\n[CANCELAMENTO] ${reason}` : command.notes,
        updatedAt: new Date(),
      })
      .where(eq(commands.id, commandId))
      .returning();

    // Registra evento
    await this.addEvent(commandId, currentUser.id, 'STATUS_CHANGED', {
      from: command.status,
      to: 'CANCELED',
      reason,
    });

    return canceledCommand;
  }

  /**
   * Vincula cliente à comanda
   */
  async linkClient(commandId: string, data: LinkClientDto, currentUser: CurrentUser): Promise<Command> {
    const command = await this.findById(commandId);
    if (!command) {
      throw new NotFoundException('Comanda nao encontrada');
    }

    if (command.status === 'CLOSED' || command.status === 'CANCELED') {
      throw new BadRequestException('Comanda ja encerrada ou cancelada');
    }

    // Busca dados do cliente para registrar nome no evento
    const client = await this.clientsService.findById(data.clientId);
    if (!client) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    const [updatedCommand] = await this.db
      .update(commands)
      .set({
        clientId: data.clientId,
        updatedAt: new Date(),
      })
      .where(eq(commands.id, commandId))
      .returning();

    // Registra evento CLIENT_LINKED
    await this.addEvent(commandId, currentUser.id, 'CLIENT_LINKED', {
      clientId: data.clientId,
      clientName: client.name || 'Cliente',
      clientPhone: client.phone,
    });

    return updatedCommand;
  }

  /**
   * Remove vínculo do cliente com a comanda
   */
  async unlinkClient(commandId: string, currentUser: CurrentUser): Promise<Command> {
    const command = await this.findById(commandId);
    if (!command) {
      throw new NotFoundException('Comanda nao encontrada');
    }

    if (command.status === 'CLOSED' || command.status === 'CANCELED') {
      throw new BadRequestException('Comanda ja encerrada ou cancelada');
    }

    if (!command.clientId) {
      throw new BadRequestException('Comanda nao possui cliente vinculado');
    }

    // Busca dados do cliente para registrar nome no evento
    const client = await this.clientsService.findById(command.clientId);
    const clientName = client?.name || 'Cliente';

    const [updatedCommand] = await this.db
      .update(commands)
      .set({
        clientId: null,
        updatedAt: new Date(),
      })
      .where(eq(commands.id, commandId))
      .returning();

    // Registra evento CLIENT_UNLINKED
    await this.addEvent(commandId, currentUser.id, 'CLIENT_UNLINKED', {
      clientId: command.clientId,
      clientName,
    });

    return updatedCommand;
  }

  /**
   * Adiciona nota à comanda
   */
  async addNote(commandId: string, data: AddNoteDto, currentUser: CurrentUser): Promise<Command> {
    const command = await this.findById(commandId);
    if (!command) {
      throw new NotFoundException('Comanda nao encontrada');
    }

    const newNotes = command.notes
      ? `${command.notes}\n${data.note}`
      : data.note;

    const [updatedCommand] = await this.db
      .update(commands)
      .set({
        notes: newNotes,
        updatedAt: new Date(),
      })
      .where(eq(commands.id, commandId))
      .returning();

    // Registra evento
    await this.addEvent(commandId, currentUser.id, 'NOTE_ADDED', {
      note: data.note,
    });

    return updatedCommand;
  }

  /**
   * Busca itens da comanda
   */
  async getItems(commandId: string): Promise<CommandItem[]> {
    return this.db
      .select()
      .from(commandItems)
      .where(eq(commandItems.commandId, commandId))
      .orderBy(commandItems.addedAt);
  }

  /**
   * Busca pagamentos da comanda
   */
  async getPayments(commandId: string): Promise<CommandPayment[]> {
    return this.db
      .select()
      .from(commandPayments)
      .where(eq(commandPayments.commandId, commandId))
      .orderBy(commandPayments.paidAt);
  }

  /**
   * Busca eventos/timeline da comanda com nome do usuário
   */
  async getEvents(commandId: string) {
    const events = await this.db
      .select({
        id: commandEvents.id,
        commandId: commandEvents.commandId,
        actorId: commandEvents.actorId,
        actorName: users.name,
        eventType: commandEvents.eventType,
        metadata: commandEvents.metadata,
        createdAt: commandEvents.createdAt,
      })
      .from(commandEvents)
      .leftJoin(users, eq(commandEvents.actorId, users.id))
      .where(eq(commandEvents.commandId, commandId))
      .orderBy(desc(commandEvents.createdAt));

    return events;
  }

  /**
   * Busca detalhes completos da comanda
   */
  async getDetails(commandId: string) {
    const command = await this.findById(commandId);
    if (!command) {
      throw new NotFoundException('Comanda nao encontrada');
    }

    const [items, payments, events] = await Promise.all([
      this.getItems(commandId),
      this.getPayments(commandId),
      this.getEvents(commandId),
    ]);

    return {
      ...command,
      items,
      payments,
      events,
    };
  }

  /**
   * Gera código sequencial da comanda
   */
  private async generateCode(salonId: string): Promise<string> {
    const today = new Date();
    const prefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    const todayCommands = await this.db
      .select()
      .from(commands)
      .where(eq(commands.salonId, salonId));

    const todayCount = todayCommands.filter((c) => c.code?.startsWith(prefix)).length;

    return `${prefix}-${String(todayCount + 1).padStart(4, '0')}`;
  }

  /**
   * Recalcula totais da comanda
   */
  private async recalculateTotals(commandId: string): Promise<void> {
    const items = await this.db
      .select()
      .from(commandItems)
      .where(and(eq(commandItems.commandId, commandId)));

    // Soma apenas itens não cancelados
    const activeItems = items.filter((i) => !i.canceledAt);
    const totalGross = activeItems.reduce((sum, i) => sum + parseFloat(i.totalPrice), 0);
    const totalDiscounts = activeItems.reduce((sum, i) => sum + parseFloat(i.discount || '0'), 0);
    const totalNet = totalGross;

    await this.db
      .update(commands)
      .set({
        totalGross: totalGross.toString(),
        totalDiscounts: totalDiscounts.toString(),
        totalNet: totalNet.toString(),
        updatedAt: new Date(),
      })
      .where(eq(commands.id, commandId));
  }

  /**
   * Adiciona evento de auditoria
   */
  private async addEvent(
    commandId: string,
    actorId: string,
    eventType: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    await this.db.insert(commandEvents).values({
      commandId,
      actorId,
      eventType,
      metadata,
    });
  }
}
