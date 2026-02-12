import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class TeamService {
  constructor(
    @Inject('DATABASE_CONNECTION') private db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Lista todos os membros da equipe do salao com estatisticas
   */
  async findAll(salonId: string, includeInactive = false) {
    const conditions = [eq(schema.users.salonId, salonId)];

    if (!includeInactive) {
      conditions.push(eq(schema.users.active, true));
    }

    const members = await this.db
      .select()
      .from(schema.users)
      .where(and(...conditions));

    // Get stats for each member
    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        const stats = await this.getStats(member.id);
        return {
          ...member,
          stats,
        };
      })
    );

    return membersWithStats;
  }

  /**
   * Busca um membro por ID
   */
  async findById(id: string, salonId: string) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.id, id), eq(schema.users.salonId, salonId)))
      .limit(1);

    if (!result[0]) {
      throw new NotFoundException('Membro nao encontrado');
    }

    const stats = await this.getStats(id);
    return { ...result[0], stats };
  }

  /**
   * Convida novo membro (cria usuario e vincula ao salao)
   */
  async invite(salonId: string, data: CreateTeamMemberDto) {
    // Check if email already exists
    const existing = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, data.email))
      .limit(1);

    if (existing[0]) {
      throw new ConflictException('Email ja cadastrado');
    }

    // Use provided password or generate temporary one
    const passwordToUse = data.password || Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(passwordToUse, 10);

    const commissionRate = data.defaultCommission
      ? (data.defaultCommission / 100).toFixed(2)
      : '0.50';

    const result = await this.db
      .insert(schema.users)
      .values({
        salonId,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        role: data.role,
        commissionRate,
        passwordHash,
        active: true,
      })
      .returning();

    return {
      ...result[0],
      // Only return password if it was auto-generated (not provided)
      ...(data.password ? {} : { tempPassword: passwordToUse }),
    };
  }

  /**
   * Atualiza dados de um membro
   */
  async update(id: string, salonId: string, data: UpdateTeamMemberDto) {
    // Verify member exists and belongs to salon
    await this.findById(id, salonId);

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.specialties !== undefined) updateData.specialties = data.specialties;
    if (data.defaultCommission !== undefined) {
      updateData.commissionRate = (data.defaultCommission / 100).toFixed(2);
    }

    const result = await this.db
      .update(schema.users)
      .set(updateData)
      .where(and(eq(schema.users.id, id), eq(schema.users.salonId, salonId)))
      .returning();

    return result[0];
  }

  /**
   * Desativa um membro
   */
  async deactivate(id: string, salonId: string) {
    // Verify member exists
    await this.findById(id, salonId);

    const result = await this.db
      .update(schema.users)
      .set({ active: false, updatedAt: new Date() })
      .where(and(eq(schema.users.id, id), eq(schema.users.salonId, salonId)))
      .returning();

    return result[0];
  }

  /**
   * Reativa um membro
   */
  async reactivate(id: string, salonId: string) {
    const result = await this.db
      .update(schema.users)
      .set({ active: true, updatedAt: new Date() })
      .where(and(eq(schema.users.id, id), eq(schema.users.salonId, salonId)))
      .returning();

    if (!result[0]) {
      throw new NotFoundException('Membro nao encontrado');
    }

    return result[0];
  }

  /**
   * Estatisticas do profissional (atendimentos e faturamento do mes)
   */
  async getStats(userId: string) {
    // Get start and end of current month (formato ISO para PostgreSQL)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    // Count appointments this month
    const appointmentsResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.professionalId, userId),
          sql`${schema.appointments.createdAt} >= ${startOfMonth}`,
          sql`${schema.appointments.createdAt} <= ${endOfMonth}`
        )
      );

    // Calculate revenue from command items where this user was the performer
    const revenueResult = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${schema.commandItems.totalPrice}), 0)::text`,
      })
      .from(schema.commandItems)
      .innerJoin(schema.commands, eq(schema.commandItems.commandId, schema.commands.id))
      .where(
        and(
          eq(schema.commandItems.performerId, userId),
          sql`${schema.commands.createdAt} >= ${startOfMonth}`,
          sql`${schema.commands.createdAt} <= ${endOfMonth}`
        )
      );

    // Get pending commissions
    const pendingCommissionsResult = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${schema.commissions.commissionValue}), 0)::text`,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.commissions)
      .where(
        and(
          eq(schema.commissions.professionalId, userId),
          eq(schema.commissions.status, 'PENDING')
        )
      );

    return {
      appointmentsThisMonth: appointmentsResult[0]?.count || 0,
      revenueThisMonth: parseFloat(revenueResult[0]?.total || '0'),
      pendingCommissions: parseFloat(pendingCommissionsResult[0]?.total || '0'),
      pendingCommissionsCount: pendingCommissionsResult[0]?.count || 0,
    };
  }

  /**
   * Lista serviços atribuídos ao profissional (com dados do serviço)
   */
  async getAssignedServices(professionalId: string, salonId: string) {
    // Valida que o profissional pertence ao salão
    await this.findById(professionalId, salonId);

    const rows = await this.db
      .select({
        serviceId: schema.professionalServices.serviceId,
        enabled: schema.professionalServices.enabled,
        priority: schema.professionalServices.priority,
        serviceName: schema.services.name,
        serviceCategory: schema.services.category,
        servicePrice: schema.services.basePrice,
      })
      .from(schema.professionalServices)
      .innerJoin(schema.services, eq(schema.professionalServices.serviceId, schema.services.id))
      .where(
        and(
          eq(schema.professionalServices.professionalId, professionalId),
          eq(schema.professionalServices.enabled, true),
        ),
      );

    return rows;
  }

  /**
   * Define serviços do profissional (replace all).
   * Deleta os existentes e insere os novos.
   */
  async setAssignedServices(professionalId: string, salonId: string, serviceIds: number[]) {
    // Valida profissional pertence ao salão
    await this.findById(professionalId, salonId);

    // Valida serviços pertencem ao salão (filtra inativos silenciosamente)
    if (serviceIds.length > 0) {
      const validServices = await this.db
        .select({ id: schema.services.id })
        .from(schema.services)
        .where(
          and(
            eq(schema.services.salonId, salonId),
            eq(schema.services.active, true),
            inArray(schema.services.id, serviceIds),
          ),
        );
      const validIds = new Set(validServices.map((s) => s.id));
      // Silently filter out inactive/invalid services instead of throwing
      serviceIds = serviceIds.filter((id) => validIds.has(id));
    }

    // Delete all existing
    await this.db
      .delete(schema.professionalServices)
      .where(eq(schema.professionalServices.professionalId, professionalId));

    // Insert new
    if (serviceIds.length > 0) {
      await this.db.insert(schema.professionalServices).values(
        serviceIds.map((serviceId) => ({
          professionalId,
          serviceId,
          enabled: true,
        })),
      );
    }

    return { success: true, count: serviceIds.length };
  }

  /**
   * Resumo geral da equipe
   */
  async getSummary(salonId: string) {
    // Total members by role
    const membersResult = await this.db
      .select({
        role: schema.users.role,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.users)
      .where(and(eq(schema.users.salonId, salonId), eq(schema.users.active, true)))
      .groupBy(schema.users.role);

    // Total pending commissions for all members
    const pendingCommissions = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${schema.commissions.commissionValue}), 0)::text`,
      })
      .from(schema.commissions)
      .innerJoin(schema.users, eq(schema.commissions.professionalId, schema.users.id))
      .where(
        and(
          eq(schema.users.salonId, salonId),
          eq(schema.commissions.status, 'PENDING')
        )
      );

    const roleCount = membersResult.reduce((acc, item) => {
      acc[item.role] = item.count;
      return acc;
    }, {} as Record<string, number>);

    const totalActive = membersResult.reduce((acc, item) => acc + item.count, 0);
    const totalStylists = roleCount['STYLIST'] || 0;

    return {
      totalActive,
      totalStylists,
      totalManagers: roleCount['MANAGER'] || 0,
      totalReceptionists: roleCount['RECEPTIONIST'] || 0,
      pendingCommissionsTotal: parseFloat(pendingCommissions[0]?.total || '0'),
    };
  }
}
