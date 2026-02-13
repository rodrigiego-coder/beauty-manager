import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { eq, and, desc, ilike, or, inArray } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  Database, clients, commands, commandPayments, Client, NewClient,
  clientNotesAi, productRecommendationsLog, triageResponses,
  clientNoShows, clientHairProfiles, clientLoyaltyAccounts,
  clientBookingRules, appointmentDeposits,
  clientPackages, clientPackageBalances, clientPackageUsages,
  clientProductSubscriptions,
  marketingEvents, abTestAssignments, upsellOffers,
  cartLinks, productReservations,
  scheduledMessages, messageLogs, alexisSessions, aiConversations,
  conversations, appointments, accountsReceivable,
  loyaltyTransactions, loyaltyRedemptions,
  appointmentHolds,
} from '../../database';

export interface FindAllOptions {
  salonId: string;
  search?: string;
  includeInactive?: boolean;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  newThisMonth: number;
  recurringClients: number;
  churnRiskCount: number;
}

export interface ClientHistory {
  commands: {
    id: string;
    code: string | null;
    cardNumber: string;
    status: string;
    totalNet: string | null;
    openedAt: Date;
    closedAt: Date | null;
    paymentSummary: string;
  }[];
  totalSpent: number;
  averageTicket: number;
  totalVisits: number;
}

@Injectable()
export class ClientsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todos os clientes de um salão com filtros
   */
  async findAll(options: FindAllOptions): Promise<Client[]> {
    const { salonId, search, includeInactive } = options;

    const conditions = [eq(clients.salonId, salonId)];

    // Filtro de ativos/inativos
    if (!includeInactive) {
      conditions.push(eq(clients.active, true));
    }

    // Busca por nome, telefone ou email
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(clients.name, searchTerm),
          ilike(clients.phone, searchTerm),
          ilike(clients.email, searchTerm),
        ) as any
      );
    }

    return this.db
      .select()
      .from(clients)
      .where(and(...conditions))
      .orderBy(desc(clients.createdAt));
  }

  /**
   * Busca cliente por ID
   */
  async findById(id: string): Promise<Client | null> {
    const result = await this.db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Busca cliente pelo telefone
   */
  async findByPhone(phone: string, salonId?: string): Promise<Client | null> {
    const conditions = [eq(clients.phone, phone)];

    if (salonId) {
      conditions.push(eq(clients.salonId, salonId));
    }

    const result = await this.db
      .select()
      .from(clients)
      .where(and(...conditions))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Busca clientes por termo (nome, email ou telefone)
   */
  async search(salonId: string, term: string, includeInactive = false): Promise<Client[]> {
    const searchTerm = `%${term}%`;

    const conditions = [
      eq(clients.salonId, salonId),
      or(
        ilike(clients.name, searchTerm),
        ilike(clients.email, searchTerm),
        ilike(clients.phone, searchTerm),
      ) as any,
    ];

    if (!includeInactive) {
      conditions.push(eq(clients.active, true));
    }

    return this.db
      .select()
      .from(clients)
      .where(and(...conditions))
      .orderBy(clients.name);
  }

  /**
   * Cria um novo cliente
   */
  async create(data: NewClient): Promise<Client> {
    const result = await this.db
      .insert(clients)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Cria ou retorna cliente existente pelo telefone
   */
  async findOrCreate(phone: string, salonId: string, name?: string): Promise<Client> {
    let client = await this.findByPhone(phone, salonId);

    if (!client) {
      const newClient: NewClient = {
        phone,
        salonId,
        name,
        aiActive: true,
      };

      client = await this.create(newClient);
    }

    return client;
  }

  /**
   * Atualiza dados do cliente
   */
  async update(id: string, data: Partial<NewClient>): Promise<Client | null> {
    const result = await this.db
      .update(clients)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Soft delete - desativa cliente
   */
  async delete(id: string): Promise<Client | null> {
    return this.update(id, { active: false });
  }

  /**
   * Reativa cliente
   */
  async reactivate(id: string): Promise<Client | null> {
    return this.update(id, { active: true });
  }

  /**
   * Atualiza o status da IA para um cliente
   */
  async setAiActive(id: string, active: boolean): Promise<Client | null> {
    return this.update(id, { aiActive: active });
  }

  /**
   * Verifica se a IA está ativa para um cliente
   */
  async isAiActive(phone: string, salonId?: string): Promise<boolean> {
    const client = await this.findByPhone(phone, salonId);
    return client?.aiActive ?? true;
  }

  /**
   * Atualiza a data da última visita e incrementa total de visitas
   */
  async updateLastVisit(id: string): Promise<Client | null> {
    const today = new Date().toISOString().split('T')[0];
    const client = await this.findById(id);
    if (!client) return null;

    return this.update(id, {
      lastVisitDate: today,
      totalVisits: client.totalVisits + 1,
    });
  }

  /**
   * Retorna estatísticas dos clientes
   */
  async getStats(salonId: string): Promise<ClientStats> {
    const allClients = await this.db
      .select()
      .from(clients)
      .where(eq(clients.salonId, salonId));

    const activeClients = allClients.filter(c => c.active);
    const churnRiskCount = activeClients.filter(c => c.churnRisk).length;
    const recurringClients = activeClients.filter(c => c.totalVisits > 1).length;

    // Clientes novos este mês
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newThisMonth = activeClients.filter(c => {
      const createdAt = new Date(c.createdAt);
      return createdAt >= startOfMonth;
    }).length;

    return {
      totalClients: allClients.length,
      activeClients: activeClients.length,
      newThisMonth,
      recurringClients,
      churnRiskCount,
    };
  }

  /**
   * Retorna histórico de comandas do cliente
   */
  async getHistory(clientId: string): Promise<ClientHistory> {
    // Buscar comandas do cliente
    const clientCommands = await this.db
      .select({
        id: commands.id,
        code: commands.code,
        cardNumber: commands.cardNumber,
        status: commands.status,
        totalNet: commands.totalNet,
        openedAt: commands.openedAt,
        closedAt: commands.cashierClosedAt,
      })
      .from(commands)
      .where(eq(commands.clientId, clientId))
      .orderBy(desc(commands.openedAt))
      .limit(20);

    // Buscar métodos de pagamento por comanda
    const commandIds = clientCommands.map(c => c.id);
    let paymentsByCommand: Record<string, string[]> = {};
    if (commandIds.length > 0) {
      const payments = await this.db
        .select({
          commandId: commandPayments.commandId,
          method: commandPayments.method,
        })
        .from(commandPayments)
        .where(inArray(commandPayments.commandId, commandIds));

      const methodLabels: Record<string, string> = {
        CASH: 'Dinheiro', CARD_CREDIT: 'Crédito', CARD_DEBIT: 'Débito',
        PIX: 'PIX', VOUCHER: 'Voucher', TRANSFER: 'Transferência', OTHER: 'Outro',
      };
      for (const p of payments) {
        const key = p.commandId;
        if (!paymentsByCommand[key]) paymentsByCommand[key] = [];
        const label = methodLabels[p.method || ''] || p.method || 'Outro';
        if (!paymentsByCommand[key].includes(label)) {
          paymentsByCommand[key].push(label);
        }
      }
    }

    // Calcular totais
    const closedCommands = clientCommands.filter(c => c.status === 'CLOSED');
    const totalSpent = closedCommands.reduce((acc, c) => {
      return acc + parseFloat(c.totalNet || '0');
    }, 0);

    const averageTicket = closedCommands.length > 0
      ? totalSpent / closedCommands.length
      : 0;

    return {
      commands: clientCommands.map(c => ({
        ...c,
        paymentSummary: paymentsByCommand[c.id]?.join(', ') || '',
      })),
      totalSpent,
      averageTicket,
      totalVisits: closedCommands.length,
    };
  }

  /**
   * Hard delete em massa — remove permanentemente clientes e dados relacionados.
   * Preserva agendamentos e comandas (seta clientId = null).
   */
  async hardDeleteMany(salonId: string, clientIds: string[]): Promise<{ deleted: number }> {
    if (!clientIds.length) return { deleted: 0 };
    if (clientIds.length > 50) {
      throw new BadRequestException('Limite de 50 clientes por vez');
    }

    // Valida que todos os IDs pertencem ao salonId
    const found = await this.db
      .select({ id: clients.id })
      .from(clients)
      .where(and(eq(clients.salonId, salonId), inArray(clients.id, clientIds)));

    if (found.length !== clientIds.length) {
      throw new BadRequestException('Um ou mais clientes nao pertencem a este salao');
    }

    // Executa tudo em uma transação
    const result = await this.db.transaction(async (tx) => {
      // 1. Tabelas-folha sem sub-dependencias
      await tx.delete(clientNotesAi).where(inArray(clientNotesAi.clientId, clientIds));
      await tx.delete(productRecommendationsLog).where(inArray(productRecommendationsLog.clientId, clientIds));
      await tx.delete(triageResponses).where(inArray(triageResponses.clientId, clientIds));

      // 2. Perfil e historico do cliente
      await tx.delete(clientNoShows).where(inArray(clientNoShows.clientId, clientIds));
      await tx.delete(clientHairProfiles).where(inArray(clientHairProfiles.clientId, clientIds));

      // 3. Fidelidade — sub-tabelas primeiro
      const loyaltyAccounts = await tx
        .select({ id: clientLoyaltyAccounts.id })
        .from(clientLoyaltyAccounts)
        .where(inArray(clientLoyaltyAccounts.clientId, clientIds));
      const loyaltyAccountIds = loyaltyAccounts.map(a => a.id);
      if (loyaltyAccountIds.length > 0) {
        await tx.delete(loyaltyRedemptions).where(inArray(loyaltyRedemptions.accountId, loyaltyAccountIds));
        await tx.delete(loyaltyTransactions).where(inArray(loyaltyTransactions.accountId, loyaltyAccountIds));
      }
      // Limpa referredById para não quebrar FK circular
      await tx
        .update(clientLoyaltyAccounts)
        .set({ referredById: null })
        .where(inArray(clientLoyaltyAccounts.referredById, clientIds));
      await tx.delete(clientLoyaltyAccounts).where(inArray(clientLoyaltyAccounts.clientId, clientIds));

      // 4. Booking rules e deposits
      await tx.delete(clientBookingRules).where(inArray(clientBookingRules.clientId, clientIds));
      await tx.delete(appointmentDeposits).where(inArray(appointmentDeposits.clientId, clientIds));

      // 5. Pacotes — sub-tabelas primeiro
      const pkgs = await tx
        .select({ id: clientPackages.id })
        .from(clientPackages)
        .where(inArray(clientPackages.clientId, clientIds));
      const pkgIds = pkgs.map(p => p.id);
      if (pkgIds.length > 0) {
        await tx.delete(clientPackageUsages).where(inArray(clientPackageUsages.clientPackageId, pkgIds));
        await tx.delete(clientPackageBalances).where(inArray(clientPackageBalances.clientPackageId, pkgIds));
      }
      await tx.delete(clientPackages).where(inArray(clientPackages.clientId, clientIds));

      // 6. Assinaturas de produto
      await tx.delete(clientProductSubscriptions).where(inArray(clientProductSubscriptions.clientId, clientIds));

      // 7. Marketing e upsell
      await tx.delete(marketingEvents).where(inArray(marketingEvents.clientId, clientIds));
      await tx.delete(abTestAssignments).where(inArray(abTestAssignments.clientId, clientIds));
      await tx.delete(upsellOffers).where(inArray(upsellOffers.clientId, clientIds));

      // 8. Carrinho e reservas
      await tx.delete(cartLinks).where(inArray(cartLinks.clientId, clientIds));
      await tx.delete(productReservations).where(inArray(productReservations.clientId, clientIds));

      // 9. Mensagens
      await tx.delete(scheduledMessages).where(inArray(scheduledMessages.clientId, clientIds));
      await tx.delete(messageLogs).where(inArray(messageLogs.clientId, clientIds));

      // 10. IA / conversas
      await tx.delete(alexisSessions).where(inArray(alexisSessions.clientId, clientIds));
      await tx.delete(aiConversations).where(inArray(aiConversations.clientId, clientIds));
      await tx.delete(conversations).where(inArray(conversations.clientId, clientIds));

      // 11. Holds de agendamento
      await tx
        .update(appointmentHolds)
        .set({ clientId: null })
        .where(inArray(appointmentHolds.clientId, clientIds));

      // 12. Preserva agendamentos e comandas (seta clientId = null)
      await tx
        .update(appointments)
        .set({ clientId: null })
        .where(inArray(appointments.clientId, clientIds));

      await tx
        .update(commands)
        .set({ clientId: null })
        .where(inArray(commands.clientId, clientIds));

      await tx
        .update(accountsReceivable)
        .set({ clientId: null })
        .where(inArray(accountsReceivable.clientId, clientIds));

      // 13. Finalmente, deleta os clientes
      const deleted = await tx
        .delete(clients)
        .where(and(eq(clients.salonId, salonId), inArray(clients.id, clientIds)))
        .returning({ id: clients.id });

      return deleted.length;
    });

    return { deleted: result };
  }
}
