import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { eq, and, desc, ne, inArray, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  Database,
  commands,
  commandItems,
  commandPayments,
  commandEvents,
  commandConsumptionSnapshots,
  users,
  services,
  clients,
  paymentMethods,
  paymentDestinations,
  appointments,
  Command,
  CommandItem,
  CommandPayment,
  PaymentMethod,
  PaymentDestination,
} from '../../database';
import {
  OpenCommandDto,
  AddItemDto,
  UpdateItemDto,
  AddPaymentDto,
  ApplyDiscountDto,
  AddNoteDto,
  LinkClientDto,
  ReopenCommandDto,
} from './dto';
import { CashRegistersService } from '../cash-registers';
import { ClientPackagesService } from '../client-packages';
import { ClientsService } from '../clients';
import { CommissionsService } from '../commissions';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { ProductsService } from '../products';
import { RecipesService } from '../recipes';
import { ServiceConsumptionsService } from '../service-consumptions';

// Interface para resultado de pagamento (exportada para controller)
export interface AddPaymentResult {
  payment: CommandPayment;
  command: Command;
  autoClosed: boolean;
  message: string;
  loyaltyPointsEarned?: number;
  tierUpgraded?: boolean;
  newTierName?: string;
}

interface CurrentUser {
  id: string;
  salonId: string;
  role: string;
}

@Injectable()
export class CommandsService {
  private readonly logger = new Logger(CommandsService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
    private cashRegistersService: CashRegistersService,
    private clientPackagesService: ClientPackagesService,
    private clientsService: ClientsService,
    private commissionsService: CommissionsService,
    private loyaltyService: LoyaltyService,
    private productsService: ProductsService,
    private recipesService: RecipesService,
    private serviceConsumptionsService: ServiceConsumptionsService,
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
   * Lista comandas ativas (OPEN ou IN_SERVICE apenas)
   * Comandas em WAITING_PAYMENT ou CLOSED não aparecem aqui
   */
  async findOpen(salonId: string): Promise<Command[]> {
    return this.db
      .select()
      .from(commands)
      .where(
        and(
          eq(commands.salonId, salonId),
          inArray(commands.status, ['OPEN', 'IN_SERVICE'])
        )
      )
      .orderBy(desc(commands.openedAt));
  }

  /**
   * Lista comandas aguardando pagamento (WAITING_PAYMENT ou PENDING_PAYMENT)
   */
  async findWaitingPayment(salonId: string) {
    const result = await this.db
      .select({
        id: commands.id,
        salonId: commands.salonId,
        clientId: commands.clientId,
        cardNumber: commands.cardNumber,
        code: commands.code,
        status: commands.status,
        openedAt: commands.openedAt,
        serviceClosedAt: commands.serviceClosedAt,
        totalGross: commands.totalGross,
        totalDiscounts: commands.totalDiscounts,
        totalNet: commands.totalNet,
        clientName: clients.name,
        clientPhone: clients.phone,
      })
      .from(commands)
      .leftJoin(clients, eq(commands.clientId, clients.id))
      .where(
        and(
          eq(commands.salonId, salonId),
          inArray(commands.status, ['WAITING_PAYMENT', 'PENDING_PAYMENT'])
        )
      )
      .orderBy(desc(commands.serviceClosedAt));

    // Calculate paid amount for each command
    const commandsWithBalance = await Promise.all(
      result.map(async (cmd) => {
        const payments = await this.db
          .select({ amount: commandPayments.amount })
          .from(commandPayments)
          .where(eq(commandPayments.commandId, cmd.id));

        const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
        const totalNet = parseFloat(cmd.totalNet || '0');
        const remainingBalance = Math.max(0, totalNet - totalPaid);

        return {
          ...cmd,
          totalPaid: totalPaid.toFixed(2),
          remainingBalance: remainingBalance.toFixed(2),
        };
      })
    );

    return commandsWithBalance;
  }

  /**
   * Lista comandas encerradas com saldo pendente (Contas a Receber)
   * Inclui CLOSED e CASHIER_CLOSED
   */
  async findClosedWithPendingBalance(salonId: string) {
    const result = await this.db
      .select({
        id: commands.id,
        salonId: commands.salonId,
        clientId: commands.clientId,
        cardNumber: commands.cardNumber,
        code: commands.code,
        status: commands.status,
        openedAt: commands.openedAt,
        serviceClosedAt: commands.serviceClosedAt,
        cashierClosedAt: commands.cashierClosedAt,
        totalGross: commands.totalGross,
        totalDiscounts: commands.totalDiscounts,
        totalNet: commands.totalNet,
        clientName: clients.name,
        clientPhone: clients.phone,
      })
      .from(commands)
      .leftJoin(clients, eq(commands.clientId, clients.id))
      .where(
        and(
          eq(commands.salonId, salonId),
          inArray(commands.status, ['CLOSED', 'CASHIER_CLOSED'])
        )
      )
      .orderBy(desc(commands.cashierClosedAt));

    // Calculate paid amount for each command and filter those with remaining balance
    const commandsWithBalance = await Promise.all(
      result.map(async (cmd) => {
        const payments = await this.db
          .select({ amount: commandPayments.amount })
          .from(commandPayments)
          .where(eq(commandPayments.commandId, cmd.id));

        const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
        const totalNet = parseFloat(cmd.totalNet || '0');
        const remainingBalance = Math.max(0, totalNet - totalPaid);

        return {
          ...cmd,
          totalPaid: totalPaid.toFixed(2),
          remainingBalance: remainingBalance.toFixed(2),
        };
      })
    );

    // Only return commands with remaining balance > 0
    return commandsWithBalance.filter(cmd => parseFloat(cmd.remainingBalance) > 0);
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
    // Valida range 1-999
    this.validateCommandNumber(code);

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

    // Se cardNumber informado, valida range 1-999
    let cardNumber: string;
    if (data.cardNumber?.trim()) {
      cardNumber = data.cardNumber.trim();
      this.validateCommandNumber(cardNumber);
    } else {
      // Gera automaticamente (primeiro disponível)
      cardNumber = await this.generateNextNumber(salonId);
    }

    // Verifica se já existe comanda aberta com este cartão
    const existing = await this.findByCardNumber(salonId, cardNumber);
    if (existing) {
      throw new BadRequestException(`Ja existe uma comanda aberta com o cartao ${cardNumber}`);
    }

    // Gera código sequencial
    const code = await this.generateCode(salonId);

    // Cria a comanda
    const [command] = await this.db
      .insert(commands)
      .values({
        salonId,
        cardNumber,
        code,
        clientId: data.clientId || null,
        notes: data.notes || null,
        openedById: currentUser.id,
        status: 'OPEN',
        businessDate: sql`DATE(NOW() AT TIME ZONE 'America/Sao_Paulo')`,
      })
      .returning();

    // Registra evento
    await this.addEvent(command.id, currentUser.id, 'OPENED', {
      cardNumber,
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

    // L1 FIX: Cliente obrigatório para adicionar itens
    if (!command.clientId) {
      throw new BadRequestException('Vincule um cliente antes de adicionar itens');
    }

    const quantity = data.quantity || 1;
    const discount = data.discount || 0;
    const totalPrice = (quantity * data.unitPrice) - discount;

    // ========================================
    // P0: Calcular effectivePerformerId para SERVICE
    // ========================================
    let effectivePerformerId: string | null = data.performerId || null;

    if (data.type === 'SERVICE' && !data.performerId) {
      // a) STYLIST logado => autoatribui para si
      if (currentUser.role === 'STYLIST') {
        effectivePerformerId = currentUser.id;
        this.logger.log(`[addItem] SERVICE sem performerId - STYLIST logado, autoatribuído: ${currentUser.id}`);
      }
      // b) Comanda veio de agendamento => usa professionalId do appointment
      else if (command.appointmentId) {
        const [apt] = await this.db
          .select({ professionalId: appointments.professionalId })
          .from(appointments)
          .where(eq(appointments.id, command.appointmentId))
          .limit(1);

        if (apt?.professionalId) {
          effectivePerformerId = apt.professionalId;
          this.logger.log(`[addItem] SERVICE sem performerId - usando professionalId do agendamento: ${apt.professionalId}`);
        }
      }
      // c) Comanda aberta por STYLIST => usa openedById
      else if (command.openedById) {
        const [opener] = await this.db
          .select({ id: users.id, role: users.role })
          .from(users)
          .where(eq(users.id, command.openedById))
          .limit(1);

        if (opener?.role === 'STYLIST') {
          effectivePerformerId = opener.id;
          this.logger.log(`[addItem] SERVICE sem performerId - usando openedById (STYLIST): ${opener.id}`);
        }
      }

      // d) Se ainda não resolveu => erro para OWNER/MANAGER
      if (!effectivePerformerId) {
        throw new BadRequestException(
          'Serviço requer profissional executante (performerId). Selecione o profissional que realizará o atendimento.'
        );
      }
    }

    // Se for PRODUTO, baixar estoque antes de adicionar
    // HARDENING: validação multi-tenant + existência do produto
    let kitMovementGroupId: string | null = null;
    if (data.type === 'PRODUCT' && data.referenceId) {
      const productId = parseInt(data.referenceId, 10);
      if (isNaN(productId)) {
        throw new BadRequestException('referenceId invalido para PRODUCT');
      }

      // Verificação multi-tenant: produto deve pertencer ao mesmo salão
      const product = await this.productsService.findById(productId);
      if (!product) {
        throw new BadRequestException(`Produto ID ${productId} nao encontrado`);
      }
      if (product.salonId !== command.salonId) {
        throw new BadRequestException('Produto nao pertence a este salao');
      }

      // Validação: produto deve ser vendável (isRetail = true)
      if (!product.isRetail) {
        throw new BadRequestException(
          `Produto "${product.name}" não está habilitado para venda. ` +
          `Habilite a opção "Venda na loja" para vendê-lo.`
        );
      }

      // Baixar estoque RETAIL (loja)
      if (product.kind === 'KIT') {
        // KIT: baixa atômica de todos os componentes
        const kitResult = await this.productsService.deductKitStock({
          kitProductId: productId,
          salonId: command.salonId,
          userId: currentUser.id,
          kitQty: quantity,
          locationType: 'RETAIL',
          referenceType: 'command',
          referenceId: command.id,
          reason: `Venda KIT - Comanda ${command.cardNumber}`,
        });
        kitMovementGroupId = kitResult.movementGroupId;
      } else {
        // SIMPLE: baixa direta (fluxo original)
        await this.productsService.adjustStockWithLocation({
          productId,
          salonId: command.salonId,
          userId: currentUser.id,
          quantity: -quantity, // negativo = saída
          locationType: 'RETAIL', // estoque da LOJA (venda)
          movementType: 'SALE',
          reason: `Venda - Comanda ${command.cardNumber}`,
          referenceType: 'command',
          referenceId: command.id,
        });
      }
    }

    // ========================================
    // PACOTE: Verificar e consumir sessão do pacote para SERVIÇOS
    // O frontend pode indicar se deseja usar o pacote via data.paidByPackage
    // Se não especificado, usa pacote automaticamente quando disponível
    // ========================================
    let clientPackageId: number | null = null;
    let clientPackageUsageId: number | null = null;
    let paidByPackage = false;
    let finalTotalPrice = totalPrice;

    // Verifica se frontend indicou explicitamente para NÃO usar pacote
    const shouldUsePackage = data.paidByPackage !== false;

    if (shouldUsePackage && data.type === 'SERVICE' && data.referenceId && command.clientId) {
      const serviceId = parseInt(data.referenceId, 10);
      if (!isNaN(serviceId)) {
        // Verifica se cliente tem pacote válido para este serviço
        const packageCheck = await this.clientPackagesService.hasValidPackageForService(
          command.clientId,
          serviceId,
        );

        if (packageCheck.hasPackage && packageCheck.clientPackage && packageCheck.balance) {
          try {
            // Consome a sessão do pacote
            const consumeResult = await this.clientPackagesService.consumeSession({
              salonId: command.salonId,
              clientPackageId: packageCheck.clientPackage.id,
              serviceId,
              commandId,
              professionalId: effectivePerformerId || undefined,
              notes: `Auto-consumed via command ${command.cardNumber}`,
            });

            clientPackageId = packageCheck.clientPackage.id;
            clientPackageUsageId = consumeResult.usage.id;
            paidByPackage = true;
            finalTotalPrice = 0; // Serviço pago pelo pacote = R$ 0,00

            this.logger.log(
              `[addItem] Sessão consumida do pacote: clientPackageId=${clientPackageId}, ` +
              `serviceId=${serviceId}, remaining=${consumeResult.balance.remainingSessions}`
            );
          } catch (error: any) {
            // Se falhar consumir pacote, continua como item normal (pago)
            this.logger.warn(
              `[addItem] Falha ao consumir pacote (item será cobrado): ${error.message}`
            );
          }
        }
      }
    }

    // Adiciona o item
    const [item] = await this.db
      .insert(commandItems)
      .values({
        commandId,
        type: data.type,
        description: data.description,
        quantity: quantity.toString(),
        unitPrice: paidByPackage ? '0' : data.unitPrice.toString(),
        discount: discount.toString(),
        totalPrice: finalTotalPrice.toString(),
        performerId: effectivePerformerId,
        referenceId: data.referenceId || null,
        variantId: data.variantId || null, // Variante da receita (tamanho cabelo)
        addedById: currentUser.id,
        clientPackageId,
        clientPackageUsageId,
        paidByPackage,
        movementGroupId: kitMovementGroupId,
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
      unitPrice: paidByPackage ? 0 : data.unitPrice,
      totalPrice: finalTotalPrice,
      performerId: effectivePerformerId,
      performerAutoAssigned: data.type === 'SERVICE' && !data.performerId && !!effectivePerformerId,
      paidByPackage,
      clientPackageId,
      clientPackageUsageId,
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

    const oldQuantity = parseFloat(existingItem.quantity);
    const quantity = data.quantity ?? oldQuantity;
    const unitPrice = data.unitPrice ?? parseFloat(existingItem.unitPrice);
    const discount = data.discount ?? parseFloat(existingItem.discount || '0');
    const totalPrice = (quantity * unitPrice) - discount;

    // Se for PRODUTO e quantidade mudou, ajustar estoque RETAIL
    if (existingItem.type === 'PRODUCT' && existingItem.referenceId && quantity !== oldQuantity) {
      const productId = parseInt(existingItem.referenceId, 10);
      if (!isNaN(productId)) {
        const diff = quantity - oldQuantity;
        // diff positivo = aumentou quantidade (saída adicional)
        // diff negativo = diminuiu quantidade (devolução)
        await this.productsService.adjustStockWithLocation({
          productId,
          salonId: command.salonId,
          userId: currentUser.id,
          quantity: -diff, // negativo de diff: aumentou=saída, diminuiu=entrada
          locationType: 'RETAIL',
          movementType: diff > 0 ? 'SALE' : 'RETURN',
          reason: diff > 0
            ? `Ajuste qty (+${diff}) - Comanda ${command.cardNumber}`
            : `Devolução qty (${diff}) - Comanda ${command.cardNumber}`,
          referenceType: 'command',
          referenceId: command.id,
        });
      }
    }

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

    // Detecta troca de performer para auditoria
    const oldPerformerId = existingItem.performerId;
    const newPerformerId = data.performerId ?? existingItem.performerId;
    const performerChanged = data.performerId !== undefined && data.performerId !== oldPerformerId;

    // Registra evento com auditoria de troca de performer
    await this.addEvent(commandId, currentUser.id, 'ITEM_UPDATED', {
      itemId,
      from: {
        quantity: existingItem.quantity,
        unitPrice: existingItem.unitPrice,
        discount: existingItem.discount,
        ...(performerChanged && { performerId: oldPerformerId }),
      },
      to: {
        quantity,
        unitPrice,
        discount,
        ...(performerChanged && { performerId: newPerformerId }),
      },
      ...(performerChanged && { performerChanged: true }),
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

    // Se for PRODUTO, devolver estoque RETAIL
    if (existingItem.type === 'PRODUCT' && existingItem.referenceId) {
      const productId = parseInt(existingItem.referenceId, 10);
      if (!isNaN(productId)) {
        if (existingItem.movementGroupId) {
          // KIT: reverter todos os componentes atomicamente pelo movementGroupId
          await this.productsService.reverseKitStock({
            movementGroupId: existingItem.movementGroupId,
            userId: currentUser.id,
            reason: `Cancelamento item KIT - Comanda ${command.cardNumber}`,
            referenceType: 'command',
            referenceId: command.id,
          });
          // Limpar movementGroupId para idempotência (anti-duplo-estorno)
          await this.db.update(commandItems)
            .set({ movementGroupId: null, updatedAt: new Date() })
            .where(eq(commandItems.id, itemId));
        } else {
          // SIMPLE: devolução direta (fluxo original)
          const qty = parseFloat(existingItem.quantity);
          await this.productsService.adjustStockWithLocation({
            productId,
            salonId: command.salonId,
            userId: currentUser.id,
            quantity: qty, // positivo = entrada (devolução)
            locationType: 'RETAIL',
            movementType: 'RETURN',
            reason: `Cancelamento item - Comanda ${command.cardNumber}`,
            referenceType: 'command',
            referenceId: command.id,
          });
        }
      }
    }

    // ========================================
    // PACOTE: Reverter sessão se item foi pago por pacote
    // ========================================
    if (existingItem.paidByPackage && existingItem.clientPackageUsageId) {
      try {
        await this.clientPackagesService.revertSession(
          existingItem.clientPackageUsageId,
          `Reverted due to item cancellation - Command ${command.cardNumber}${reason ? `: ${reason}` : ''}`,
        );

        this.logger.log(
          `[removeItem] Sessão revertida: usageId=${existingItem.clientPackageUsageId}, ` +
          `itemId=${itemId}`
        );
      } catch (error: any) {
        // Log warning mas não bloqueia cancelamento
        this.logger.warn(
          `[removeItem] Falha ao reverter sessão do pacote (item cancelado mesmo assim): ${error.message}`
        );
      }
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
      paidByPackage: existingItem.paidByPackage,
      packageSessionReverted: existingItem.paidByPackage && !!existingItem.clientPackageUsageId,
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

    // Desconto manual acumula na coluna dedicada (manualDiscount)
    const oldManual = parseFloat(command.manualDiscount || '0');
    const newManual = oldManual + data.discountAmount;

    // Incrementa totalDiscounts e decrementa totalNet pelo valor do desconto
    const newTotalDiscounts = parseFloat(command.totalDiscounts || '0') + data.discountAmount;
    const newTotalNet = parseFloat(command.totalGross || '0') - newTotalDiscounts;

    const [updatedCommand] = await this.db
      .update(commands)
      .set({
        manualDiscount: newManual.toString(),
        totalDiscounts: newTotalDiscounts.toString(),
        totalNet: newTotalNet.toString(),
        updatedAt: new Date(),
      })
      .where(eq(commands.id, commandId))
      .returning();

    // Registra evento
    await this.addEvent(commandId, currentUser.id, 'DISCOUNT_APPLIED', {
      amount: data.discountAmount,
      reason: data.reason,
      oldManualDiscount: oldManual,
      newManualDiscount: newManual,
    });

    return updatedCommand;
  }

  /**
   * Encerra os serviços da comanda
   * Consome automaticamente os produtos do BOM (receita versionada) de cada serviço
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

    // ========================================
    // PACOTE 5: Consumo automático via receitas versionadas
    // ========================================
    const items = await this.getItems(commandId);
    const serviceItems = items.filter(
      item => item.type === 'SERVICE' && !item.canceledAt && item.referenceId
    );

    let recipeProcessedCount = 0;

    // Processar consumo de receita para cada item de SERVIÇO
    for (const item of serviceItems) {
      const serviceId = parseInt(item.referenceId!, 10);
      if (isNaN(serviceId)) continue;

      try {
        await this.processRecipeConsumption({
          serviceId,
          salonId: command.salonId,
          commandId: command.id,
          commandItemId: item.id,
          userId: currentUser.id,
          variantId: item.variantId || null,
        });
        recipeProcessedCount++;
      } catch (error: any) {
        // Logar warning mas NÃO bloquear fechamento do serviço
        this.logger.warn(
          `Erro no consumo de receita (não bloqueante): commandItemId=${item.id}, ` +
          `serviceId=${serviceId}, erro=${error.message}`
        );
      }
    }

    // Atualiza status da comanda
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

    // Registra evento SERVICE_CLOSED
    await this.addEvent(commandId, currentUser.id, 'SERVICE_CLOSED', {
      totalGross: command.totalGross,
      totalNet: command.totalNet,
    });

    // Registra evento RECIPE_CONSUMED se houve processamento
    if (recipeProcessedCount > 0) {
      await this.addEvent(commandId, currentUser.id, 'RECIPE_CONSUMED', {
        servicesCount: serviceItems.length,
        itemsProcessed: recipeProcessedCount,
      });
    }

    return updatedCommand;
  }

  /**
   * Calcula valores de taxa/desconto para um pagamento
   */
  private calculatePaymentFee(
    amount: number,
    paymentMethod?: PaymentMethod | null,
    destination?: PaymentDestination | null,
  ): { grossAmount: number; feeAmount: number; netAmount: number } {
    const grossAmount = amount;
    let feeAmount = 0;

    // Prioridade: destino > método
    const rule = destination?.feeValue && parseFloat(destination.feeValue) > 0
      ? destination
      : paymentMethod;

    if (rule?.feeType && rule?.feeMode && rule?.feeValue) {
      const feeValue = parseFloat(rule.feeValue);
      if (rule.feeMode === 'PERCENT') {
        feeAmount = (amount * feeValue) / 100;
      } else {
        feeAmount = feeValue;
      }
    }

    // netAmount é sempre grossAmount - feeAmount (taxa reduz o líquido)
    const netAmount = grossAmount - feeAmount;

    return { grossAmount, feeAmount, netAmount };
  }

  /**
   * Adiciona pagamento à comanda (com auto-close se quitado)
   */
  async addPayment(
    commandId: string,
    data: AddPaymentDto,
    currentUser: CurrentUser,
  ): Promise<AddPaymentResult> {
    const command = await this.findById(commandId);
    if (!command) {
      throw new NotFoundException('Comanda nao encontrada');
    }

    if (command.status === 'CLOSED') {
      throw new BadRequestException('Comanda ja encerrada');
    }

    if (command.status === 'CANCELED') {
      throw new BadRequestException('Comanda foi cancelada');
    }

    // Valida que tem method OU paymentMethodId
    if (!data.method && !data.paymentMethodId) {
      throw new BadRequestException('Informe method ou paymentMethodId');
    }

    // Busca forma de pagamento configurada (se fornecida)
    let paymentMethod: PaymentMethod | null = null;
    if (data.paymentMethodId) {
      const result = await this.db
        .select()
        .from(paymentMethods)
        .where(eq(paymentMethods.id, data.paymentMethodId))
        .limit(1);
      paymentMethod = result[0] || null;

      if (!paymentMethod) {
        throw new BadRequestException('Forma de pagamento nao encontrada');
      }

      if (paymentMethod.salonId !== command.salonId) {
        throw new BadRequestException('Forma de pagamento nao pertence a este salao');
      }
    }

    // Busca destino (se fornecido)
    let destination: PaymentDestination | null = null;
    if (data.paymentDestinationId) {
      const result = await this.db
        .select()
        .from(paymentDestinations)
        .where(eq(paymentDestinations.id, data.paymentDestinationId))
        .limit(1);
      destination = result[0] || null;

      if (!destination) {
        throw new BadRequestException('Destino de pagamento nao encontrado');
      }

      if (destination.salonId !== command.salonId) {
        throw new BadRequestException('Destino de pagamento nao pertence a este salao');
      }
    }

    // Calcula fee
    const { grossAmount, feeAmount, netAmount } = this.calculatePaymentFee(
      data.amount,
      paymentMethod,
      destination,
    );

    // Determina o method legado (para compatibilidade)
    const legacyMethod = data.method || (paymentMethod?.type as string) || 'OTHER';

    // Insere pagamento
    const [payment] = await this.db
      .insert(commandPayments)
      .values({
        commandId,
        method: legacyMethod,
        amount: data.amount.toString(),
        paymentMethodId: data.paymentMethodId || null,
        paymentDestinationId: data.paymentDestinationId || null,
        grossAmount: grossAmount.toString(),
        feeAmount: feeAmount.toString(),
        netAmount: netAmount.toString(),
        notes: data.notes || null,
        receivedById: currentUser.id,
      })
      .returning();

    // Registra evento
    await this.addEvent(commandId, currentUser.id, 'PAYMENT_ADDED', {
      paymentId: payment.id,
      method: legacyMethod,
      paymentMethodId: data.paymentMethodId,
      paymentDestinationId: data.paymentDestinationId,
      grossAmount,
      feeAmount,
      netAmount,
    });

    // Verifica se quitou para auto-close
    const totalPaid = await this.getTotalPaid(commandId);
    const totalNet = parseFloat(command.totalNet || '0');
    const tolerance = 0.01; // tolerância de 1 centavo

    if (totalPaid >= totalNet - tolerance) {
      // Auto-close
      const closedCommand = await this.autoCloseCashier(commandId, currentUser);

      return {
        payment,
        command: closedCommand.command,
        autoClosed: true,
        message: 'Comanda encerrada automaticamente',
        loyaltyPointsEarned: closedCommand.loyaltyPointsEarned,
        tierUpgraded: closedCommand.tierUpgraded,
        newTierName: closedCommand.newTierName,
      };
    }

    // Atualiza command para retornar
    const updatedCommand = await this.findById(commandId);

    return {
      payment,
      command: updatedCommand!,
      autoClosed: false,
      message: 'Pagamento registrado',
    };
  }

  /**
   * Calcula total pago (usando netAmount quando disponível)
   */
  private async getTotalPaid(commandId: string): Promise<number> {
    const payments = await this.getPayments(commandId);
    return payments.reduce((sum, p) => {
      // Usa netAmount se disponível, senão usa amount
      const value = p.netAmount ? parseFloat(p.netAmount) : parseFloat(p.amount);
      return sum + value;
    }, 0);
  }

  /**
   * Auto-close interno (chamado quando pagamento quita a comanda)
   *
   * IMPORTANTE: Operações não-críticas (caixa, comissões, fidelidade) são
   * envolvidas em try/catch para garantir que o pagamento retorne 200
   * mesmo se alguma operação secundária falhar.
   */
  private async autoCloseCashier(
    commandId: string,
    currentUser: CurrentUser,
  ): Promise<{
    command: Command;
    loyaltyPointsEarned: number;
    tierUpgraded: boolean;
    newTierName?: string;
  }> {
    const command = await this.findById(commandId);
    if (!command) {
      throw new NotFoundException('Comanda nao encontrada');
    }

    // ========================================
    // PACOTE 5.2.5: Processar receitas se serviço não foi encerrado
    // ========================================
    if (!command.serviceClosedAt) {
      const items = await this.getItems(commandId);
      const serviceItems = items.filter(
        item => item.type === 'SERVICE' && !item.canceledAt && item.referenceId
      );

      let recipeProcessedCount = 0;

      // Processar consumo de receita para cada item de SERVIÇO
      for (const item of serviceItems) {
        const serviceId = parseInt(item.referenceId!, 10);
        if (isNaN(serviceId)) continue;

        try {
          await this.processRecipeConsumption({
            serviceId,
            salonId: command.salonId,
            commandId: command.id,
            commandItemId: item.id,
            userId: currentUser.id,
            variantId: item.variantId || null,
          });
          recipeProcessedCount++;
        } catch (error: any) {
          // Logar warning mas NÃO bloquear fechamento
          this.logger.warn(
            `[autoCloseCashier] Erro no consumo de receita (não bloqueante): ` +
            `commandItemId=${item.id}, serviceId=${serviceId}, erro=${error.message}`
          );
        }
      }

      if (recipeProcessedCount > 0) {
        this.logger.log(
          `[autoCloseCashier] Processadas ${recipeProcessedCount} receitas para comanda ${command.cardNumber}`
        );
      }
    }

    // Atualiza status para CLOSED (operação crítica)
    const [closedCommand] = await this.db
      .update(commands)
      .set({
        status: 'CLOSED',
        serviceClosedAt: command.serviceClosedAt || new Date(), // marca serviço encerrado se não estava
        serviceClosedById: command.serviceClosedById || currentUser.id,
        cashierClosedAt: new Date(),
        cashierClosedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(commands.id, commandId))
      .returning();

    // === OPERAÇÕES NÃO-CRÍTICAS (não devem derrubar a resposta) ===

    // Atualiza totais do caixa por método de pagamento
    try {
      const payments = await this.getPayments(commandId);
      for (const payment of payments) {
        // Usa method para compatibilidade com caixa atual
        await this.cashRegistersService.addSale(
          command.salonId,
          payment.method || 'OTHER',
          parseFloat(payment.netAmount || payment.amount),
          currentUser.id,
        );
      }
    } catch (err) {
      console.error('[autoCloseCashier] Erro ao atualizar totais do caixa:', err);
    }

    // Se a comanda tem cliente vinculado, atualiza totalVisits e lastVisitDate
    if (command.clientId) {
      try {
        await this.clientsService.updateLastVisit(command.clientId);
      } catch (err) {
        console.error('[autoCloseCashier] Erro ao atualizar ultima visita do cliente:', err);
      }
    }

    // Cria comissoes para itens de servico com profissional
    try {
      await this.createCommissionsForCommand(command.salonId, commandId);
    } catch (err) {
      console.error('[autoCloseCashier] Erro ao criar comissoes:', err);
    }

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
        console.error('[autoCloseCashier] Erro ao processar pontos de fidelidade:', err);
      }
    }

    // Registra evento de auto-close
    try {
      const totalPaid = await this.getTotalPaid(commandId);
      const totalNet = parseFloat(command.totalNet || '0');

      await this.addEvent(commandId, currentUser.id, 'CASHIER_CLOSED_AUTO', {
        totalNet,
        totalPaid,
        change: totalPaid - totalNet,
        clientId: command.clientId,
        loyaltyPointsEarned,
        tierUpgraded,
        newTierName,
      });
    } catch (err) {
      console.error('[autoCloseCashier] Erro ao registrar evento:', err);
    }

    return {
      command: closedCommand,
      loyaltyPointsEarned,
      tierUpgraded,
      newTierName,
    };
  }

  /**
   * Reabre comanda fechada (apenas OWNER/MANAGER)
   */
  async reopenCommand(
    commandId: string,
    data: ReopenCommandDto,
    currentUser: CurrentUser,
  ): Promise<Command> {
    // Verifica permissão
    if (currentUser.role !== 'OWNER' && currentUser.role !== 'MANAGER') {
      throw new ForbiddenException('Apenas OWNER ou MANAGER podem reabrir comandas');
    }

    const command = await this.findById(commandId);
    if (!command) {
      throw new NotFoundException('Comanda nao encontrada');
    }

    if (command.salonId !== currentUser.salonId) {
      throw new ForbiddenException('Comanda nao pertence a este salao');
    }

    if (command.status !== 'CLOSED') {
      throw new BadRequestException('Apenas comandas fechadas podem ser reabertas');
    }

    // Valida motivo
    if (!data.reason || data.reason.trim().length < 10) {
      throw new BadRequestException('Motivo deve ter pelo menos 10 caracteres');
    }

    // Reabre comanda
    const [reopenedCommand] = await this.db
      .update(commands)
      .set({
        status: 'WAITING_PAYMENT',
        cashierClosedAt: null,
        cashierClosedById: null,
        updatedAt: new Date(),
      })
      .where(eq(commands.id, commandId))
      .returning();

    // Registra evento de reabertura
    await this.addEvent(commandId, currentUser.id, 'COMMAND_REOPENED', {
      previousStatus: 'CLOSED',
      reason: data.reason,
      reopenedAt: new Date().toISOString(),
    });

    return reopenedCommand;
  }

  /**
   * Fecha comanda no caixa (chamada manual)
   *
   * IMPORTANTE: Operações não-críticas (caixa, comissões, fidelidade) são
   * envolvidas em try/catch para garantir que o fechamento retorne 200
   * mesmo se alguma operação secundária falhar.
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

    // Atualiza status para CLOSED (operação crítica)
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

    // === OPERAÇÕES NÃO-CRÍTICAS (não devem derrubar a resposta) ===

    // Atualiza totais do caixa por método de pagamento
    try {
      for (const payment of payments) {
        await this.cashRegistersService.addSale(
          command.salonId,
          payment.method || 'OTHER',
          parseFloat(payment.netAmount || payment.amount),
          currentUser.id,
        );
      }
    } catch (err) {
      console.error('[closeCashier] Erro ao atualizar totais do caixa:', err);
    }

    // Se a comanda tem cliente vinculado, atualiza totalVisits e lastVisitDate
    if (command.clientId) {
      try {
        await this.clientsService.updateLastVisit(command.clientId);
      } catch (err) {
        console.error('[closeCashier] Erro ao atualizar ultima visita do cliente:', err);
      }
    }

    // Cria comissoes para itens de servico com profissional
    try {
      await this.createCommissionsForCommand(command.salonId, commandId);
    } catch (err) {
      console.error('[closeCashier] Erro ao criar comissoes:', err);
    }

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
        console.error('[closeCashier] Erro ao processar pontos de fidelidade:', err);
      }
    }

    // Registra evento
    try {
      await this.addEvent(commandId, currentUser.id, 'CASHIER_CLOSED', {
        totalNet,
        totalPaid,
        change: totalPaid - totalNet,
        clientId: command.clientId,
        loyaltyPointsEarned,
        tierUpgraded,
        newTierName,
      });
    } catch (err) {
      console.error('[closeCashier] Erro ao registrar evento:', err);
    }

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

    // L5 FIX: Devolver estoque de todos os PRODUCTs não cancelados
    const items = await this.getItems(commandId);
    const productItems = items.filter(
      item => item.type === 'PRODUCT' && !item.canceledAt && item.referenceId
    );

    for (const item of productItems) {
      try {
        const productId = parseInt(item.referenceId!, 10);
        if (!isNaN(productId)) {
          if (item.movementGroupId) {
            // KIT: reverter todos os componentes atomicamente
            await this.productsService.reverseKitStock({
              movementGroupId: item.movementGroupId,
              userId: currentUser.id,
              reason: `Cancelamento comanda ${command.cardNumber}`,
              referenceType: 'command',
              referenceId: command.id,
            });
            // Limpar movementGroupId para idempotência
            await this.db.update(commandItems)
              .set({ movementGroupId: null, updatedAt: new Date() })
              .where(eq(commandItems.id, item.id));
          } else {
            // SIMPLE: devolução direta (fluxo original)
            const qty = parseFloat(item.quantity);
            await this.productsService.adjustStockWithLocation({
              productId,
              salonId: command.salonId,
              userId: currentUser.id,
              quantity: qty, // positivo = entrada (devolução)
              locationType: 'RETAIL',
              movementType: 'RETURN',
              reason: `Cancelamento comanda ${command.cardNumber}`,
              referenceType: 'command',
              referenceId: command.id,
            });
          }
        }
      } catch (err) {
        console.error(`[cancel] Erro ao devolver estoque do item ${item.id}:`, err);
        // Continua mesmo se falhar (não bloqueia cancelamento)
      }
    }

    // ========================================
    // PACOTE 3: Reverter BOM se serviços foram encerrados
    // ========================================
    let bomRevertedCount = 0;
    if (command.serviceClosedAt) {
      const serviceItems = items.filter(
        item => item.type === 'SERVICE' && !item.canceledAt && item.referenceId
      );

      // Coletar IDs de serviços únicos
      const serviceIds: number[] = [];
      for (const item of serviceItems) {
        const serviceId = parseInt(item.referenceId!, 10);
        if (!isNaN(serviceId) && !serviceIds.includes(serviceId)) {
          serviceIds.push(serviceId);
        }
      }

      if (serviceIds.length > 0) {
        const allConsumptions = await this.serviceConsumptionsService.findByServiceIds(
          serviceIds,
          command.salonId,
        );

        // Agregar consumo por produto (mesma lógica do closeService)
        const consumptionMap = new Map<number, number>();

        for (const item of serviceItems) {
          const serviceId = parseInt(item.referenceId!, 10);
          if (isNaN(serviceId)) continue;

          const itemQty = parseFloat(item.quantity);
          const serviceConsumptions = allConsumptions.filter(c => c.serviceId === serviceId);

          for (const consumption of serviceConsumptions) {
            const productId = consumption.productId;
            const bomQty = parseFloat(consumption.quantity);
            const totalQty = itemQty * bomQty;

            const current = consumptionMap.get(productId) || 0;
            consumptionMap.set(productId, current + totalQty);
          }
        }

        // Reverter consumo de estoque INTERNAL (sem try/catch - falha bloqueia cancel)
        for (const [productId, totalQty] of consumptionMap.entries()) {
          await this.productsService.adjustStockWithLocation({
            productId,
            salonId: command.salonId,
            userId: currentUser.id,
            quantity: totalQty, // positivo = entrada (reversão)
            locationType: 'INTERNAL', // estoque do SALÃO (consumo interno)
            movementType: 'RETURN',
            reason: `Cancelamento comanda ${command.cardNumber} - Reversão BOM`,
            referenceType: 'command',
            referenceId: command.id,
          });
          bomRevertedCount++;
        }
      }
    }

    // ========================================
    // PACOTE: Reverter sessões de pacotes para itens pagos por pacote
    // ========================================
    let packageSessionsReverted = 0;
    const packageItems = items.filter(
      item => !item.canceledAt && item.paidByPackage && item.clientPackageUsageId
    );

    for (const item of packageItems) {
      try {
        await this.clientPackagesService.revertSession(
          item.clientPackageUsageId!,
          `Reverted due to command cancellation - Command ${command.cardNumber}${reason ? `: ${reason}` : ''}`,
        );
        packageSessionsReverted++;
      } catch (err) {
        this.logger.warn(
          `[cancel] Erro ao reverter sessão do pacote (item ${item.id}): ${(err as Error).message}`
        );
        // Continua mesmo se falhar
      }
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
      stockReturned: productItems.length,
      bomReverted: bomRevertedCount,
      packageSessionsReverted,
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
   * Gera próximo número sequencial da comanda (1-999)
   * Pula números que já estão em uso (comandas não fechadas/canceladas)
   */
  private async generateNextNumber(salonId: string): Promise<string> {
    // Busca números de comandas ABERTAS (não CLOSED, não CANCELED) para saber quais pular
    const openCommands = await this.db
      .select({ cardNumber: commands.cardNumber })
      .from(commands)
      .where(and(
        eq(commands.salonId, salonId),
        ne(commands.status, 'CLOSED'),
        ne(commands.status, 'CANCELED')
      ));

    const usedNumbers = new Set(
      openCommands
        .map(c => parseInt(c.cardNumber, 10))
        .filter(n => !isNaN(n) && n >= 1 && n <= 999)
    );

    // Encontra o próximo número disponível começando de 1
    let nextNumber = 1;
    while (usedNumbers.has(nextNumber) && nextNumber <= 999) {
      nextNumber++;
    }

    if (nextNumber > 999) {
      throw new BadRequestException('Limite de 999 comandas atingido. Entre em contato com o suporte.');
    }

    return String(nextNumber);
  }

  /**
   * Valida se número de comanda está no range 1-999
   */
  private validateCommandNumber(cardNumber: string): void {
    const num = parseInt(cardNumber, 10);
    if (isNaN(num) || num < 1 || num > 999) {
      throw new BadRequestException('Numero da comanda deve ser entre 1 e 999');
    }
  }

  /**
   * Recalcula totais da comanda
   * ========== PROTEGIDO - AUDITORIA FINANCEIRA ==========
   * totalGross    = soma(unitPrice × quantity) dos itens ativos (BRUTO)
   * itemDiscounts = soma(item.discount) dos itens ativos
   * manualDiscount = desconto manual aplicado via applyDiscount (coluna separada)
   * totalDiscounts = itemDiscounts + manualDiscount
   * totalNet       = totalGross - totalDiscounts (LÍQUIDO)
   * NAO ALTERAR sem auditoria completa.
   * ======================================================
   */
  private async recalculateTotals(commandId: string): Promise<void> {
    const items = await this.db
      .select()
      .from(commandItems)
      .where(and(eq(commandItems.commandId, commandId)));

    // Soma apenas itens não cancelados
    const activeItems = items.filter((i) => !i.canceledAt);

    // totalGross = soma de (unitPrice × quantity) SEM desconto
    const totalGross = activeItems.reduce(
      (sum, i) => sum + (parseFloat(i.unitPrice) * parseFloat(i.quantity)), 0
    );

    // Descontos individuais dos itens
    const itemDiscounts = activeItems.reduce(
      (sum, i) => sum + parseFloat(i.discount || '0'), 0
    );

    // Ler desconto manual preservado na coluna dedicada
    const command = await this.db
      .select({ manualDiscount: commands.manualDiscount })
      .from(commands)
      .where(eq(commands.id, commandId))
      .then(rows => rows[0]);

    const manual = parseFloat(command?.manualDiscount || '0');

    // totalDiscounts = descontos de itens + desconto manual
    const totalDiscounts = itemDiscounts + manual;
    const totalNet = totalGross - totalDiscounts;

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
   * Processa consumo automático de produtos da receita (BOM versionado)
   * Chamado ao fechar serviço na comanda - cria snapshots imutáveis para auditoria
   */
  private async processRecipeConsumption(args: {
    serviceId: number;
    salonId: string;
    commandId: string;
    commandItemId: string;
    userId: string;
    variantId?: string | null;
  }): Promise<void> {
    const { serviceId, salonId, commandId, commandItemId, userId, variantId } = args;

    // 1. IDEMPOTÊNCIA: Verificar se já processou este item
    const existingSnapshots = await this.db
      .select({ id: commandConsumptionSnapshots.id })
      .from(commandConsumptionSnapshots)
      .where(
        and(
          eq(commandConsumptionSnapshots.salonId, salonId),
          eq(commandConsumptionSnapshots.commandId, commandId),
          eq(commandConsumptionSnapshots.commandItemId, commandItemId)
        )
      )
      .limit(1);

    if (existingSnapshots.length > 0) {
      this.logger.log(`Consumo já processado para commandItemId: ${commandItemId}, pulando.`);
      return;
    }

    // 2. BUSCAR RECEITA ATIVA
    const recipe = await this.recipesService.getActiveRecipe(serviceId, salonId);

    if (!recipe || recipe.lines.length === 0) {
      // Serviço não tem receita, OK - nada a consumir
      return;
    }

    // 3. RESOLVER VARIAÇÃO (multiplicador)
    let multiplier = 1;
    let variantCode: string = 'DEFAULT';

    if (variantId) {
      const variant = recipe.variants.find(v => v.id === variantId);
      if (variant) {
        multiplier = variant.multiplier;
        variantCode = variant.code;
      }
    } else {
      // Usar variação default se existir
      const defaultVariant = recipe.variants.find(v => v.isDefault);
      if (defaultVariant) {
        multiplier = defaultVariant.multiplier;
        variantCode = defaultVariant.code;
      }
    }

    // 4. PROCESSAR CADA LINHA DA RECEITA
    for (const line of recipe.lines) {
      try {
        // Calcular quantidade aplicada
        const quantityBase = line.quantityStandard + line.quantityBuffer;

        // Regra de arredondamento:
        // - UN (unidades): Math.ceil (arredondar para cima)
        // - ML, G, KG, L (volumetria/peso): manter decimal com 3 casas
        const quantityApplied = line.unit === 'UN'
          ? Math.ceil(quantityBase * multiplier)
          : Math.round((quantityBase * multiplier) * 1000) / 1000;

        // 5. BAIXAR ESTOQUE INTERNO
        let stockMovementId: string | null = null;

        try {
          const result = await this.productsService.adjustStockWithLocation({
            productId: line.productId,
            salonId,
            userId,
            quantity: -quantityApplied, // Negativo = saída
            locationType: 'INTERNAL',
            movementType: 'SERVICE_CONSUMPTION',
            referenceType: 'command',
            referenceId: commandId,
            reason: `Consumo automático - ${recipe.serviceName} [${variantCode}] - Item: ${commandItemId}`,
          });
          stockMovementId = result.movement.id;
        } catch (stockError: any) {
          // Logar warning mas NÃO bloquear - continua criando snapshot
          this.logger.warn(
            `Erro ao baixar estoque: serviceId=${serviceId}, productId=${line.productId}, ` +
            `commandId=${commandId}, commandItemId=${commandItemId}, erro=${stockError.message}`
          );
          // stockMovementId permanece null
        }

        // 6. CRIAR SNAPSHOT (auditoria imutável)
        await this.db.insert(commandConsumptionSnapshots).values({
          salonId,
          commandId,
          commandItemId,
          serviceId,
          recipeId: recipe.id,
          recipeVersion: recipe.version,
          variantCode: variantCode as any,
          variantMultiplier: multiplier.toString(),
          productId: line.productId,
          productName: line.productName,
          quantityStandard: line.quantityStandard.toString(),
          quantityBuffer: line.quantityBuffer.toString(),
          quantityApplied: quantityApplied.toString(),
          unit: line.unit,
          costAtTime: line.productCost.toString(),
          totalCost: (quantityApplied * line.productCost).toString(),
          stockMovementId,
          postedAt: new Date(),
        });

      } catch (error: any) {
        // Erro crítico na linha, logar e continuar para próxima
        this.logger.error(
          `Erro ao processar linha da receita: serviceId=${serviceId}, ` +
          `productId=${line.productId}, commandItemId=${commandItemId}`,
          error.stack
        );
        // Continua para próxima linha
      }
    }
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
