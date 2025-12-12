import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';
import { db } from '../../database/connection';
import { plans, Plan, NewPlan } from '../../database/schema';
import { CreatePlanDto, UpdatePlanDto } from './dto';

@Injectable()
export class PlansService {
  /**
   * List all active plans (public)
   */
  async findAll(includeInactive = false): Promise<Plan[]> {
    const conditions = includeInactive ? [] : [eq(plans.isActive, true)];

    const result = await db
      .select()
      .from(plans)
      .where(conditions.length ? conditions[0] : undefined)
      .orderBy(asc(plans.sortOrder));

    return result;
  }

  /**
   * Get plan by ID
   */
  async findById(id: string): Promise<Plan> {
    const result = await db
      .select()
      .from(plans)
      .where(eq(plans.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Plano não encontrado');
    }

    return result[0];
  }

  /**
   * Get plan by code
   */
  async findByCode(code: string): Promise<Plan | null> {
    const result = await db
      .select()
      .from(plans)
      .where(eq(plans.code, code.toUpperCase()))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Create a new plan (SUPER_ADMIN only)
   */
  async create(dto: CreatePlanDto): Promise<Plan> {
    // Check if code already exists
    const existing = await this.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Plano com código ${dto.code} já existe`);
    }

    const newPlan: NewPlan = {
      code: dto.code.toUpperCase(),
      name: dto.name,
      description: dto.description,
      priceMonthly: String(dto.priceMonthly),
      priceYearly: dto.priceYearly ? String(dto.priceYearly) : null,
      maxUsers: dto.maxUsers,
      maxClients: dto.maxClients,
      maxSalons: dto.maxSalons || 1,
      features: dto.features || [],
      hasFiscal: dto.hasFiscal || false,
      hasAutomation: dto.hasAutomation || false,
      hasReports: dto.hasReports || false,
      hasAI: dto.hasAI || false,
      trialDays: dto.trialDays || 14,
      sortOrder: dto.sortOrder || 0,
      isActive: true,
    };

    const result = await db
      .insert(plans)
      .values(newPlan)
      .returning();

    return result[0];
  }

  /**
   * Update a plan (SUPER_ADMIN only)
   */
  async update(id: string, dto: UpdatePlanDto): Promise<Plan> {
    // Verify plan exists
    await this.findById(id);

    const updateData: Partial<NewPlan> = {
      updatedAt: new Date(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.priceMonthly !== undefined) updateData.priceMonthly = String(dto.priceMonthly);
    if (dto.priceYearly !== undefined) updateData.priceYearly = String(dto.priceYearly);
    if (dto.maxUsers !== undefined) updateData.maxUsers = dto.maxUsers;
    if (dto.maxClients !== undefined) updateData.maxClients = dto.maxClients;
    if (dto.maxSalons !== undefined) updateData.maxSalons = dto.maxSalons;
    if (dto.features !== undefined) updateData.features = dto.features;
    if (dto.hasFiscal !== undefined) updateData.hasFiscal = dto.hasFiscal;
    if (dto.hasAutomation !== undefined) updateData.hasAutomation = dto.hasAutomation;
    if (dto.hasReports !== undefined) updateData.hasReports = dto.hasReports;
    if (dto.hasAI !== undefined) updateData.hasAI = dto.hasAI;
    if (dto.trialDays !== undefined) updateData.trialDays = dto.trialDays;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;

    const result = await db
      .update(plans)
      .set(updateData)
      .where(eq(plans.id, id))
      .returning();

    return result[0];
  }

  /**
   * Deactivate a plan (SUPER_ADMIN only)
   */
  async deactivate(id: string): Promise<Plan> {
    await this.findById(id);

    const result = await db
      .update(plans)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(plans.id, id))
      .returning();

    return result[0];
  }

  /**
   * Get free plan (for new salon signups)
   */
  async getFreePlan(): Promise<Plan | null> {
    const result = await db
      .select()
      .from(plans)
      .where(eq(plans.code, 'FREE'))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Seed default plans if they don't exist
   */
  async seedPlans(): Promise<void> {
    const existingPlans = await this.findAll(true);

    if (existingPlans.length > 0) {
      return; // Plans already exist
    }

    const defaultPlans: CreatePlanDto[] = [
      {
        code: 'FREE',
        name: 'Plano Gratuito',
        description: 'Ideal para começar. Limitado a 1 usuário e 50 clientes.',
        priceMonthly: 0,
        priceYearly: 0,
        maxUsers: 1,
        maxClients: 50,
        maxSalons: 1,
        features: ['Agendamentos básicos', 'Comandas', 'Relatórios simples'],
        hasFiscal: false,
        hasAutomation: false,
        hasReports: false,
        hasAI: false,
        trialDays: 0,
        sortOrder: 0,
      },
      {
        code: 'BASIC',
        name: 'Plano Básico',
        description: 'Para salões pequenos. Até 3 usuários e 200 clientes.',
        priceMonthly: 99,
        priceYearly: 999,
        maxUsers: 3,
        maxClients: 200,
        maxSalons: 1,
        features: ['Agendamentos', 'Comandas', 'Estoque básico', 'Relatórios básicos'],
        hasFiscal: false,
        hasAutomation: false,
        hasReports: true,
        hasAI: false,
        trialDays: 14,
        sortOrder: 1,
      },
      {
        code: 'PRO',
        name: 'Plano Profissional',
        description: 'Para salões em crescimento. Até 10 usuários e 1000 clientes.',
        priceMonthly: 199,
        priceYearly: 1999,
        maxUsers: 10,
        maxClients: 1000,
        maxSalons: 1,
        features: [
          'Agendamentos avançados',
          'Comandas',
          'Estoque completo',
          'Relatórios avançados',
          'Módulo fiscal (NF-e)',
          'Comissões',
          'Multi-usuário',
        ],
        hasFiscal: true,
        hasAutomation: false,
        hasReports: true,
        hasAI: false,
        trialDays: 14,
        sortOrder: 2,
      },
      {
        code: 'PREMIUM',
        name: 'Plano Premium',
        description: 'Para grandes salões. Usuários e clientes ilimitados.',
        priceMonthly: 399,
        priceYearly: 3999,
        maxUsers: 999,
        maxClients: 99999,
        maxSalons: 5,
        features: [
          'Tudo do PRO',
          'Automação WhatsApp',
          'IA para atendimento',
          'Multi-unidades',
          'API de integração',
          'Suporte prioritário',
        ],
        hasFiscal: true,
        hasAutomation: true,
        hasReports: true,
        hasAI: true,
        trialDays: 14,
        sortOrder: 3,
      },
    ];

    for (const plan of defaultPlans) {
      await this.create(plan);
    }
  }
}
