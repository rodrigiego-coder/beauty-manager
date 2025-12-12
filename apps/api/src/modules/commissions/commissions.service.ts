import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, sql, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '../../database/database.module';
import {
  commissions,
  commands,
  users,
  NewCommission,
} from '../../database/schema';

export interface CommissionWithDetails {
  id: string;
  salonId: string;
  commandId: string;
  commandItemId: string;
  professionalId: string;
  itemDescription: string;
  itemValue: string;
  commissionPercentage: string;
  commissionValue: string;
  status: string;
  paidAt: Date | null;
  paidById: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Joins
  professionalName?: string;
  commandCode?: string;
  commandCardNumber?: string;
  paidByName?: string;
}

export interface ProfessionalSummary {
  professionalId: string;
  professionalName: string;
  totalPending: number;
  totalPaid: number;
  pendingCount: number;
  paidCount: number;
}

export interface CommissionsSummary {
  totalPending: number;
  totalPaidThisMonth: number;
  professionalsWithPending: number;
}

@Injectable()
export class CommissionsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista comissoes com filtros
   */
  async findAll(
    salonId: string,
    filters?: {
      professionalId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<CommissionWithDetails[]> {
    // Buscar comissoes
    let query = this.db
      .select()
      .from(commissions)
      .where(eq(commissions.salonId, salonId))
      .orderBy(desc(commissions.createdAt));

    const allCommissions = await query;

    // Aplicar filtros em memoria (para simplificar)
    let filtered = allCommissions;

    if (filters?.professionalId) {
      filtered = filtered.filter(c => c.professionalId === filters.professionalId);
    }

    if (filters?.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters?.startDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(c => new Date(c.createdAt) >= start);
    }

    if (filters?.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(c => new Date(c.createdAt) <= end);
    }

    // Buscar dados relacionados
    const professionalIds = [...new Set(filtered.map(c => c.professionalId))];
    const commandIds = [...new Set(filtered.map(c => c.commandId))];
    const paidByIds = [...new Set(filtered.filter(c => c.paidById).map(c => c.paidById!))];

    // Buscar profissionais
    const professionals = professionalIds.length > 0
      ? await this.db.select().from(users).where(
          sql`${users.id} IN (${sql.join(professionalIds.map(id => sql`${id}`), sql`, `)})`
        )
      : [];

    // Buscar comandas
    const commandsList = commandIds.length > 0
      ? await this.db.select().from(commands).where(
          sql`${commands.id} IN (${sql.join(commandIds.map(id => sql`${id}`), sql`, `)})`
        )
      : [];

    // Buscar quem pagou
    const paidByUsers = paidByIds.length > 0
      ? await this.db.select().from(users).where(
          sql`${users.id} IN (${sql.join(paidByIds.map(id => sql`${id}`), sql`, `)})`
        )
      : [];

    // Mapear dados
    const professionalMap = new Map(professionals.map(p => [p.id, p.name]));
    const commandMap = new Map(commandsList.map(c => [c.id, { code: c.code, cardNumber: c.cardNumber }]));
    const paidByMap = new Map(paidByUsers.map(u => [u.id, u.name]));

    return filtered.map(c => ({
      ...c,
      professionalName: professionalMap.get(c.professionalId) || 'Desconhecido',
      commandCode: commandMap.get(c.commandId)?.code || '',
      commandCardNumber: commandMap.get(c.commandId)?.cardNumber || '',
      paidByName: c.paidById ? paidByMap.get(c.paidById) || '' : undefined,
    }));
  }

  /**
   * Busca uma comissao por ID
   */
  async findById(salonId: string, id: string): Promise<CommissionWithDetails> {
    const result = await this.db
      .select()
      .from(commissions)
      .where(and(eq(commissions.salonId, salonId), eq(commissions.id, id)))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Comissao nao encontrada');
    }

    const commission = result[0];

    // Buscar dados relacionados
    const [professional] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, commission.professionalId))
      .limit(1);

    const [command] = await this.db
      .select()
      .from(commands)
      .where(eq(commands.id, commission.commandId))
      .limit(1);

    let paidByName: string | undefined;
    if (commission.paidById) {
      const [paidBy] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, commission.paidById))
        .limit(1);
      paidByName = paidBy?.name;
    }

    return {
      ...commission,
      professionalName: professional?.name || 'Desconhecido',
      commandCode: command?.code || '',
      commandCardNumber: command?.cardNumber || '',
      paidByName,
    };
  }

  /**
   * Retorna resumo geral das comissoes
   */
  async getSummary(salonId: string): Promise<CommissionsSummary> {
    const allCommissions = await this.db
      .select()
      .from(commissions)
      .where(eq(commissions.salonId, salonId));

    // Total pendente
    const totalPending = allCommissions
      .filter(c => c.status === 'PENDING')
      .reduce((sum, c) => sum + parseFloat(c.commissionValue), 0);

    // Total pago este mes
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalPaidThisMonth = allCommissions
      .filter(c => c.status === 'PAID' && c.paidAt && new Date(c.paidAt) >= firstDayOfMonth)
      .reduce((sum, c) => sum + parseFloat(c.commissionValue), 0);

    // Profissionais com pendencia
    const professionalsWithPending = new Set(
      allCommissions.filter(c => c.status === 'PENDING').map(c => c.professionalId)
    ).size;

    return {
      totalPending,
      totalPaidThisMonth,
      professionalsWithPending,
    };
  }

  /**
   * Retorna resumo por profissional
   */
  async getSummaryByProfessional(salonId: string): Promise<ProfessionalSummary[]> {
    const allCommissions = await this.db
      .select()
      .from(commissions)
      .where(eq(commissions.salonId, salonId));

    // Agrupar por profissional
    const byProfessional = new Map<string, {
      pending: number;
      paid: number;
      pendingCount: number;
      paidCount: number;
    }>();

    allCommissions.forEach(c => {
      const current = byProfessional.get(c.professionalId) || {
        pending: 0,
        paid: 0,
        pendingCount: 0,
        paidCount: 0,
      };

      if (c.status === 'PENDING') {
        current.pending += parseFloat(c.commissionValue);
        current.pendingCount++;
      } else if (c.status === 'PAID') {
        current.paid += parseFloat(c.commissionValue);
        current.paidCount++;
      }

      byProfessional.set(c.professionalId, current);
    });

    // Buscar nomes dos profissionais
    const professionalIds = [...byProfessional.keys()];
    const professionals = professionalIds.length > 0
      ? await this.db.select().from(users).where(
          sql`${users.id} IN (${sql.join(professionalIds.map(id => sql`${id}`), sql`, `)})`
        )
      : [];

    const professionalMap = new Map(professionals.map(p => [p.id, p.name]));

    return professionalIds.map(id => {
      const data = byProfessional.get(id)!;
      return {
        professionalId: id,
        professionalName: professionalMap.get(id) || 'Desconhecido',
        totalPending: data.pending,
        totalPaid: data.paid,
        pendingCount: data.pendingCount,
        paidCount: data.paidCount,
      };
    }).sort((a, b) => b.totalPending - a.totalPending);
  }

  /**
   * Paga comissoes selecionadas
   */
  async payCommissions(
    salonId: string,
    commissionIds: string[],
    paidById: string,
  ): Promise<{ paid: number; total: number }> {
    if (commissionIds.length === 0) {
      throw new BadRequestException('Nenhuma comissao selecionada');
    }

    // Verificar se todas as comissoes existem e estao pendentes
    const toUpdate = await this.db
      .select()
      .from(commissions)
      .where(
        and(
          eq(commissions.salonId, salonId),
          sql`${commissions.id} IN (${sql.join(commissionIds.map(id => sql`${id}`), sql`, `)})`,
        )
      );

    const pending = toUpdate.filter(c => c.status === 'PENDING');

    if (pending.length === 0) {
      throw new BadRequestException('Nenhuma comissao pendente encontrada');
    }

    // Atualizar status para PAID
    const now = new Date();
    for (const commission of pending) {
      await this.db
        .update(commissions)
        .set({
          status: 'PAID',
          paidAt: now,
          paidById,
          updatedAt: now,
        })
        .where(eq(commissions.id, commission.id));
    }

    const total = pending.reduce((sum, c) => sum + parseFloat(c.commissionValue), 0);

    return {
      paid: pending.length,
      total,
    };
  }

  /**
   * Paga todas as comissoes pendentes de um profissional
   */
  async payProfessionalCommissions(
    salonId: string,
    professionalId: string,
    paidById: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ paid: number; total: number }> {
    // Buscar comissoes pendentes do profissional
    let allCommissions = await this.db
      .select()
      .from(commissions)
      .where(
        and(
          eq(commissions.salonId, salonId),
          eq(commissions.professionalId, professionalId),
          eq(commissions.status, 'PENDING'),
        )
      );

    // Filtrar por data se fornecido
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      allCommissions = allCommissions.filter(c => new Date(c.createdAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      allCommissions = allCommissions.filter(c => new Date(c.createdAt) <= end);
    }

    if (allCommissions.length === 0) {
      throw new BadRequestException('Nenhuma comissao pendente encontrada para este profissional');
    }

    // Atualizar todas para PAID
    const now = new Date();
    for (const commission of allCommissions) {
      await this.db
        .update(commissions)
        .set({
          status: 'PAID',
          paidAt: now,
          paidById,
          updatedAt: now,
        })
        .where(eq(commissions.id, commission.id));
    }

    const total = allCommissions.reduce((sum, c) => sum + parseFloat(c.commissionValue), 0);

    return {
      paid: allCommissions.length,
      total,
    };
  }

  /**
   * Cria comissao para um item de comanda
   * Chamado pelo CommandsService ao fechar o caixa
   */
  async createFromCommandItem(
    salonId: string,
    commandId: string,
    commandItemId: string,
    professionalId: string,
    itemDescription: string,
    itemValue: number,
    commissionPercentage: number,
  ): Promise<void> {
    const commissionValue = (itemValue * commissionPercentage) / 100;

    const newCommission: NewCommission = {
      salonId,
      commandId,
      commandItemId,
      professionalId,
      itemDescription,
      itemValue: itemValue.toFixed(2),
      commissionPercentage: commissionPercentage.toFixed(2),
      commissionValue: commissionValue.toFixed(2),
      status: 'PENDING',
    };

    await this.db.insert(commissions).values(newCommission);
  }

  /**
   * Cancela comissoes de uma comanda (usado quando comanda e cancelada)
   */
  async cancelByCommand(commandId: string): Promise<void> {
    await this.db
      .update(commissions)
      .set({
        status: 'CANCELLED',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(commissions.commandId, commandId),
          eq(commissions.status, 'PENDING'),
        )
      );
  }
}
