import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, ilike, or } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { Database, clients, commands, Client, NewClient } from '../../database';

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

    // Calcular totais
    const closedCommands = clientCommands.filter(c => c.status === 'CLOSED');
    const totalSpent = closedCommands.reduce((acc, c) => {
      return acc + parseFloat(c.totalNet || '0');
    }, 0);

    const averageTicket = closedCommands.length > 0
      ? totalSpent / closedCommands.length
      : 0;

    return {
      commands: clientCommands,
      totalSpent,
      averageTicket,
      totalVisits: closedCommands.length,
    };
  }
}
