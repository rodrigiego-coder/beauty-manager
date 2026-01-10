import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  Inject,
} from '@nestjs/common';
import { eq, and, or, isNull, gt } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import {
  CreateClientBookingRuleDto,
  UpdateClientBookingRuleDto,
  BookingRuleType,
} from './dto';

export interface BookingEligibility {
  canBook: boolean;
  reason?: string;
  requiresDeposit?: boolean;
  restrictedServices?: number[];
  isVipOnly?: boolean;
}

@Injectable()
export class ClientBookingRulesService {
  private readonly logger = new Logger(ClientBookingRulesService.name);

  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Cria uma regra de booking para um cliente
   */
  async createRule(
    salonId: string,
    dto: CreateClientBookingRuleDto,
    createdById: string,
  ): Promise<schema.ClientBookingRule> {
    if (!dto.clientPhone && !dto.clientId) {
      throw new BadRequestException('Deve informar clientPhone ou clientId');
    }

    const [rule] = await this.db
      .insert(schema.clientBookingRules)
      .values({
        salonId,
        clientPhone: dto.clientPhone,
        clientId: dto.clientId,
        ruleType: dto.ruleType,
        reason: dto.reason,
        restrictedServiceIds: dto.restrictedServiceIds,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        createdById,
        isActive: true,
      })
      .returning();

    this.logger.log(
      `Regra ${dto.ruleType} criada para cliente ${dto.clientPhone || dto.clientId}`,
    );

    return rule;
  }

  /**
   * Atualiza uma regra de booking
   */
  async updateRule(
    salonId: string,
    ruleId: string,
    dto: UpdateClientBookingRuleDto,
  ): Promise<schema.ClientBookingRule> {
    const existingRule = await this.getRule(salonId, ruleId);

    if (!existingRule) {
      throw new NotFoundException('Regra não encontrada');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.ruleType !== undefined) updateData.ruleType = dto.ruleType;
    if (dto.reason !== undefined) updateData.reason = dto.reason;
    if (dto.restrictedServiceIds !== undefined) updateData.restrictedServiceIds = dto.restrictedServiceIds;
    if (dto.expiresAt !== undefined) updateData.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const [updated] = await this.db
      .update(schema.clientBookingRules)
      .set(updateData)
      .where(eq(schema.clientBookingRules.id, ruleId))
      .returning();

    return updated;
  }

  /**
   * Remove uma regra
   */
  async deleteRule(salonId: string, ruleId: string): Promise<void> {
    await this.db
      .delete(schema.clientBookingRules)
      .where(
        and(
          eq(schema.clientBookingRules.id, ruleId),
          eq(schema.clientBookingRules.salonId, salonId),
        ),
      );
  }

  /**
   * Desativa uma regra
   */
  async deactivateRule(salonId: string, ruleId: string): Promise<void> {
    await this.db
      .update(schema.clientBookingRules)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.clientBookingRules.id, ruleId),
          eq(schema.clientBookingRules.salonId, salonId),
        ),
      );
  }

  /**
   * Obtém uma regra pelo ID
   */
  async getRule(salonId: string, ruleId: string): Promise<schema.ClientBookingRule | null> {
    const [rule] = await this.db
      .select()
      .from(schema.clientBookingRules)
      .where(
        and(
          eq(schema.clientBookingRules.id, ruleId),
          eq(schema.clientBookingRules.salonId, salonId),
        ),
      )
      .limit(1);

    return rule || null;
  }

  /**
   * Lista regras de um salão
   */
  async listRules(
    salonId: string,
    includeInactive: boolean = false,
  ): Promise<schema.ClientBookingRule[]> {
    const conditions = [eq(schema.clientBookingRules.salonId, salonId)];

    if (!includeInactive) {
      conditions.push(eq(schema.clientBookingRules.isActive, true));
    }

    return this.db
      .select()
      .from(schema.clientBookingRules)
      .where(and(...conditions))
      .orderBy(schema.clientBookingRules.createdAt);
  }

  /**
   * Obtém regras ativas para um cliente (por telefone ou ID)
   */
  async getActiveRulesForClient(
    salonId: string,
    clientPhone?: string,
    clientId?: string,
  ): Promise<schema.ClientBookingRule[]> {
    if (!clientPhone && !clientId) {
      return [];
    }

    const phoneCondition = clientPhone
      ? eq(schema.clientBookingRules.clientPhone, clientPhone)
      : undefined;
    const idCondition = clientId
      ? eq(schema.clientBookingRules.clientId, clientId)
      : undefined;

    const clientCondition = phoneCondition && idCondition
      ? or(phoneCondition, idCondition)
      : phoneCondition || idCondition;

    if (!clientCondition) {
      return [];
    }

    return this.db
      .select()
      .from(schema.clientBookingRules)
      .where(
        and(
          eq(schema.clientBookingRules.salonId, salonId),
          eq(schema.clientBookingRules.isActive, true),
          clientCondition,
          or(
            isNull(schema.clientBookingRules.expiresAt),
            gt(schema.clientBookingRules.expiresAt, new Date()),
          ),
        ),
      );
  }

  /**
   * Verifica elegibilidade de um cliente para agendar
   */
  async checkBookingEligibility(
    salonId: string,
    clientPhone: string,
    serviceId?: number,
  ): Promise<BookingEligibility> {
    // Busca cliente existente
    const [client] = await this.db
      .select()
      .from(schema.clients)
      .where(
        and(
          eq(schema.clients.salonId, salonId),
          eq(schema.clients.phone, clientPhone),
        ),
      )
      .limit(1);

    // Busca regras ativas
    const rules = await this.getActiveRulesForClient(
      salonId,
      clientPhone,
      client?.id,
    );

    if (rules.length === 0) {
      return { canBook: true };
    }

    // Processa regras (prioridade: BLOCKED > VIP_ONLY > RESTRICTED_SERVICES > DEPOSIT_REQUIRED)
    const result: BookingEligibility = { canBook: true };

    for (const rule of rules) {
      switch (rule.ruleType) {
        case 'BLOCKED':
          return {
            canBook: false,
            reason: rule.reason || 'Cliente bloqueado para agendamento online',
          };

        case 'VIP_ONLY':
          result.isVipOnly = true;
          result.reason = rule.reason || 'Este horário é exclusivo para clientes VIP';
          break;

        case 'RESTRICTED_SERVICES':
          if (rule.restrictedServiceIds && serviceId) {
            const restricted = rule.restrictedServiceIds as number[];
            if (restricted.includes(serviceId)) {
              return {
                canBook: false,
                reason: rule.reason || 'Este serviço não está disponível para agendamento online',
                restrictedServices: restricted,
              };
            }
          }
          result.restrictedServices = rule.restrictedServiceIds as number[];
          break;

        case 'DEPOSIT_REQUIRED':
          result.requiresDeposit = true;
          break;
      }
    }

    return result;
  }

  /**
   * Bloqueia um cliente para agendamento online
   */
  async blockClient(
    salonId: string,
    identifier: { phone?: string; clientId?: string },
    reason: string,
    createdById: string,
    expiresAt?: string,
  ): Promise<schema.ClientBookingRule> {
    return this.createRule(
      salonId,
      {
        clientPhone: identifier.phone,
        clientId: identifier.clientId,
        ruleType: BookingRuleType.BLOCKED,
        reason,
        expiresAt,
      },
      createdById,
    );
  }

  /**
   * Desbloqueia um cliente
   */
  async unblockClient(
    salonId: string,
    identifier: { phone?: string; clientId?: string },
  ): Promise<void> {
    const rules = await this.getActiveRulesForClient(
      salonId,
      identifier.phone,
      identifier.clientId,
    );

    const blockRules = rules.filter((r) => r.ruleType === 'BLOCKED');

    for (const rule of blockRules) {
      await this.deactivateRule(salonId, rule.id);
    }

    this.logger.log(
      `Cliente ${identifier.phone || identifier.clientId} desbloqueado`,
    );
  }

  /**
   * Lista clientes bloqueados
   */
  async listBlockedClients(salonId: string): Promise<schema.ClientBookingRule[]> {
    return this.db
      .select()
      .from(schema.clientBookingRules)
      .where(
        and(
          eq(schema.clientBookingRules.salonId, salonId),
          eq(schema.clientBookingRules.ruleType, 'BLOCKED'),
          eq(schema.clientBookingRules.isActive, true),
          or(
            isNull(schema.clientBookingRules.expiresAt),
            gt(schema.clientBookingRules.expiresAt, new Date()),
          ),
        ),
      );
  }

  /**
   * Verifica no-shows e bloqueia automaticamente se exceder limite
   */
  async checkAndBlockForNoShows(
    salonId: string,
    clientPhone: string,
    maxNoShows: number = 3,
    blockDays: number = 30,
    createdById: string,
  ): Promise<boolean> {
    // Busca cliente
    const [client] = await this.db
      .select()
      .from(schema.clients)
      .where(
        and(
          eq(schema.clients.salonId, salonId),
          eq(schema.clients.phone, clientPhone),
        ),
      )
      .limit(1);

    if (!client) {
      return false;
    }

    // Conta no-shows nos últimos 90 dias
    const noShowCount = await this.db
      .select()
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.salonId, salonId),
          eq(schema.appointments.clientId, client.id),
          eq(schema.appointments.status, 'NO_SHOW'),
          gt(
            schema.appointments.createdAt,
            new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          ),
        ),
      );

    if (noShowCount.length >= maxNoShows) {
      // Verifica se já está bloqueado
      const existingBlock = await this.getActiveRulesForClient(salonId, clientPhone, client.id);
      const hasBlock = existingBlock.some((r) => r.ruleType === 'BLOCKED');

      if (!hasBlock) {
        const expiresAt = new Date(Date.now() + blockDays * 24 * 60 * 60 * 1000);

        await this.blockClient(
          salonId,
          { phone: clientPhone, clientId: client.id },
          `Bloqueado automaticamente: ${noShowCount.length} faltas nos últimos 90 dias`,
          createdById,
          expiresAt.toISOString(),
        );

        this.logger.warn(
          `Cliente ${clientPhone} bloqueado automaticamente por ${noShowCount.length} no-shows`,
        );

        return true;
      }
    }

    return false;
  }
}
