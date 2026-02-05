import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, lte, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  Database,
  accountsReceivable,
  AccountReceivable,
  NewAccountReceivable,
  clients,
  commands
} from '../../database';

export interface AccountReceivableWithClient extends AccountReceivable {
  client?: {
    id: string;
    name: string | null;
    phone: string | null;
  } | null;
  command?: {
    id: string;
    code: string | null;
    cardNumber: string;
  } | null;
}

export interface AccountsSummary {
  totalOpen: number;
  totalOverdue: number;
  totalSettledThisMonth: number;
  countOpen: number;
  countOverdue: number;
}

export interface SettleAccountDto {
  paymentMethod?: string;
  notes?: string;
}

@Injectable()
export class AccountsReceivableService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todas as contas a receber do salão com dados do cliente
   */
  async findAll(
    salonId: string,
    filters?: { status?: string; clientId?: string },
  ): Promise<AccountReceivableWithClient[]> {
    let query = this.db
      .select({
        account: accountsReceivable,
        client: {
          id: clients.id,
          name: clients.name,
          phone: clients.phone,
        },
        command: {
          id: commands.id,
          code: commands.code,
          cardNumber: commands.cardNumber,
        },
      })
      .from(accountsReceivable)
      .leftJoin(clients, eq(accountsReceivable.clientId, clients.id))
      .leftJoin(commands, eq(accountsReceivable.commandId, commands.id))
      .where(eq(accountsReceivable.salonId, salonId))
      .orderBy(desc(accountsReceivable.createdAt))
      .$dynamic();

    const results = await query;

    // Aplicar filtros manualmente (Drizzle dynamic where é complicado)
    let filtered = results;

    if (filters?.status) {
      filtered = filtered.filter(r => r.account.status === filters.status);
    }

    if (filters?.clientId) {
      filtered = filtered.filter(r => r.account.clientId === filters.clientId);
    }

    return filtered.map(r => ({
      ...r.account,
      client: r.client,
      command: r.command,
    }));
  }

  /**
   * Busca conta por ID
   */
  async findById(id: string, salonId: string): Promise<AccountReceivableWithClient | null> {
    const result = await this.db
      .select({
        account: accountsReceivable,
        client: {
          id: clients.id,
          name: clients.name,
          phone: clients.phone,
        },
        command: {
          id: commands.id,
          code: commands.code,
          cardNumber: commands.cardNumber,
        },
      })
      .from(accountsReceivable)
      .leftJoin(clients, eq(accountsReceivable.clientId, clients.id))
      .leftJoin(commands, eq(accountsReceivable.commandId, commands.id))
      .where(and(
        eq(accountsReceivable.id, id),
        eq(accountsReceivable.salonId, salonId),
      ))
      .limit(1);

    if (!result[0]) return null;

    return {
      ...result[0].account,
      client: result[0].client,
      command: result[0].command,
    };
  }

  /**
   * Cria uma nova conta a receber
   */
  async create(data: NewAccountReceivable): Promise<AccountReceivable> {
    const [result] = await this.db
      .insert(accountsReceivable)
      .values({
        ...data,
        remainingAmount: data.remainingAmount || data.totalAmount,
      })
      .returning();

    return result;
  }

  /**
   * Atualiza uma conta a receber (notas, vencimento)
   */
  async update(
    id: string,
    salonId: string,
    data: { notes?: string; dueDate?: Date },
  ): Promise<AccountReceivable | null> {
    const existing = await this.findById(id, salonId);
    if (!existing) return null;

    if (existing.status === 'SETTLED' || existing.status === 'CANCELED') {
      throw new BadRequestException('Nao e possivel alterar conta quitada ou cancelada');
    }

    const [result] = await this.db
      .update(accountsReceivable)
      .set({
        notes: data.notes !== undefined ? data.notes : existing.notes,
        dueDate: data.dueDate !== undefined ? data.dueDate : existing.dueDate,
        updatedAt: new Date(),
      })
      .where(eq(accountsReceivable.id, id))
      .returning();

    return result;
  }

  /**
   * Quita uma conta a receber
   */
  async settle(
    id: string,
    salonId: string,
    userId: string,
    data?: SettleAccountDto,
  ): Promise<AccountReceivable> {
    const existing = await this.findById(id, salonId);
    if (!existing) {
      throw new NotFoundException('Conta nao encontrada');
    }

    if (existing.status === 'SETTLED') {
      throw new BadRequestException('Conta ja foi quitada');
    }

    if (existing.status === 'CANCELED') {
      throw new BadRequestException('Conta foi cancelada');
    }

    // Atualiza conta como quitada
    const [result] = await this.db
      .update(accountsReceivable)
      .set({
        status: 'SETTLED',
        paidAmount: existing.totalAmount,
        remainingAmount: '0',
        settledAt: new Date(),
        settledById: userId,
        notes: data?.notes ? `${existing.notes || ''}\n[Quitação] ${data.notes}`.trim() : existing.notes,
        updatedAt: new Date(),
      })
      .where(eq(accountsReceivable.id, id))
      .returning();

    // Se tinha comanda vinculada, fecha ela também
    if (existing.commandId) {
      await this.db
        .update(commands)
        .set({
          status: 'CLOSED',
          cashierClosedAt: new Date(),
          cashierClosedById: userId,
          updatedAt: new Date(),
        })
        .where(eq(commands.id, existing.commandId));
    }

    return result;
  }

  /**
   * Cancela uma conta a receber
   */
  async cancel(
    id: string,
    salonId: string,
    _userId: string,
    reason?: string,
  ): Promise<AccountReceivable> {
    const existing = await this.findById(id, salonId);
    if (!existing) {
      throw new NotFoundException('Conta nao encontrada');
    }

    if (existing.status === 'SETTLED') {
      throw new BadRequestException('Nao e possivel cancelar conta ja quitada');
    }

    if (existing.status === 'CANCELED') {
      throw new BadRequestException('Conta ja foi cancelada');
    }

    const [result] = await this.db
      .update(accountsReceivable)
      .set({
        status: 'CANCELED',
        notes: reason ? `${existing.notes || ''}\n[Cancelado] ${reason}`.trim() : existing.notes,
        updatedAt: new Date(),
      })
      .where(eq(accountsReceivable.id, id))
      .returning();

    return result;
  }

  /**
   * Retorna resumo das contas a receber
   */
  async getSummary(salonId: string): Promise<AccountsSummary> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Busca todas as contas do salão
    const allAccounts = await this.db
      .select()
      .from(accountsReceivable)
      .where(eq(accountsReceivable.salonId, salonId));

    // Calcula totais
    const openAccounts = allAccounts.filter(a => a.status === 'OPEN');
    const overdueAccounts = allAccounts.filter(a => a.status === 'OVERDUE');
    const settledThisMonth = allAccounts.filter(
      a => a.status === 'SETTLED' &&
           a.settledAt &&
           new Date(a.settledAt) >= firstDayOfMonth
    );

    return {
      totalOpen: openAccounts.reduce((sum, a) => sum + parseFloat(a.remainingAmount), 0),
      totalOverdue: overdueAccounts.reduce((sum, a) => sum + parseFloat(a.remainingAmount), 0),
      totalSettledThisMonth: settledThisMonth.reduce((sum, a) => sum + parseFloat(a.totalAmount), 0),
      countOpen: openAccounts.length,
      countOverdue: overdueAccounts.length,
    };
  }

  /**
   * Retorna total de contas pendentes (OPEN + OVERDUE) para dashboard financeiro
   */
  async getTotalPending(salonId: string): Promise<{ total: number; count: number }> {
    const allAccounts = await this.db
      .select()
      .from(accountsReceivable)
      .where(eq(accountsReceivable.salonId, salonId));

    const pendingAccounts = allAccounts.filter(
      a => a.status === 'OPEN' || a.status === 'OVERDUE'
    );

    return {
      total: pendingAccounts.reduce((sum, a) => sum + parseFloat(a.remainingAmount), 0),
      count: pendingAccounts.length,
    };
  }

  /**
   * Marca contas vencidas como OVERDUE (job diário)
   */
  async markOverdueAccounts(): Promise<number> {
    const now = new Date();

    const result = await this.db
      .update(accountsReceivable)
      .set({
        status: 'OVERDUE',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(accountsReceivable.status, 'OPEN'),
          lte(accountsReceivable.dueDate, now),
        ),
      )
      .returning();

    return result.length;
  }

  /**
   * Lista contas de um cliente (para Alexia consultar)
   */
  async findByClientPhone(salonId: string, phone: string): Promise<AccountReceivableWithClient[]> {
    const phoneClean = phone.replace(/\D/g, '');

    // Busca cliente pelo telefone
    const clientResults = await this.db
      .select()
      .from(clients)
      .where(eq(clients.salonId, salonId));

    const matchingClient = clientResults.find(c => {
      const clientPhone = c.phone?.replace(/\D/g, '') || '';
      return clientPhone.includes(phoneClean) || phoneClean.includes(clientPhone);
    });

    if (!matchingClient) {
      return [];
    }

    return this.findAll(salonId, { clientId: matchingClient.id });
  }
}
