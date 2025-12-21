import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import { db } from '../../database/connection';
import * as schema from '../../database/schema';
import {
  CreateRecommendationRuleDto,
  UpdateRecommendationRuleDto,
  LogRecommendationDto,
  ProductRecommendation,
  RuleResponse,
  RecommendationStats,
  RuleConditionsDto,
  RecommendedProductDto,
} from './dto';

/**
 * RecommendationsService
 * Gerencia regras e recomendações de produtos
 */
@Injectable()
export class RecommendationsService {
  // ==================== RULES MANAGEMENT ====================

  /**
   * Lista todas as regras (do salão + globais)
   */
  async listRules(salonId: string): Promise<RuleResponse[]> {
    const rules = await db.query.productRecommendationRules.findMany({
      where: and(
        sql`(${schema.productRecommendationRules.salonId} = ${salonId} OR ${schema.productRecommendationRules.salonId} IS NULL)`,
        eq(schema.productRecommendationRules.isActive, true),
      ),
      orderBy: [desc(schema.productRecommendationRules.priority)],
    });

    return rules.map(this.mapRuleToResponse);
  }

  /**
   * Obtém uma regra por ID
   */
  async getRuleById(salonId: string, ruleId: string): Promise<RuleResponse> {
    const rule = await db.query.productRecommendationRules.findFirst({
      where: and(
        eq(schema.productRecommendationRules.id, ruleId),
        sql`(${schema.productRecommendationRules.salonId} = ${salonId} OR ${schema.productRecommendationRules.salonId} IS NULL)`,
      ),
    });

    if (!rule) {
      throw new NotFoundException('Regra não encontrada');
    }

    return this.mapRuleToResponse(rule);
  }

  /**
   * Cria uma nova regra de recomendação
   */
  async createRule(
    salonId: string,
    dto: CreateRecommendationRuleDto,
    createdById: string,
  ): Promise<RuleResponse> {
    const [created] = await db
      .insert(schema.productRecommendationRules)
      .values({
        salonId,
        name: dto.name,
        description: dto.description,
        conditions: dto.conditions as RuleConditionsDto,
        recommendedProducts: (dto.recommendedProducts || []) as RecommendedProductDto[],
        isActive: dto.isActive ?? true,
        priority: dto.priority ?? 0,
        createdById,
      })
      .returning();

    return this.mapRuleToResponse(created);
  }

  /**
   * Atualiza uma regra existente
   */
  async updateRule(
    salonId: string,
    ruleId: string,
    dto: UpdateRecommendationRuleDto,
  ): Promise<RuleResponse> {
    const existing = await db.query.productRecommendationRules.findFirst({
      where: and(
        eq(schema.productRecommendationRules.id, ruleId),
        eq(schema.productRecommendationRules.salonId, salonId),
      ),
    });

    if (!existing) {
      throw new NotFoundException('Regra não encontrada ou não pertence a este salão');
    }

    await db
      .update(schema.productRecommendationRules)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(schema.productRecommendationRules.id, ruleId));

    const updated = await db.query.productRecommendationRules.findFirst({
      where: eq(schema.productRecommendationRules.id, ruleId),
    });

    return this.mapRuleToResponse(updated!);
  }

  /**
   * Remove uma regra
   */
  async deleteRule(salonId: string, ruleId: string): Promise<void> {
    const existing = await db.query.productRecommendationRules.findFirst({
      where: and(
        eq(schema.productRecommendationRules.id, ruleId),
        eq(schema.productRecommendationRules.salonId, salonId),
      ),
    });

    if (!existing) {
      throw new NotFoundException('Regra não encontrada ou não pertence a este salão');
    }

    await db
      .delete(schema.productRecommendationRules)
      .where(eq(schema.productRecommendationRules.id, ruleId));
  }

  // ==================== RECOMMENDATION ENGINE ====================

  /**
   * Obtém recomendações para um cliente baseado no perfil capilar
   */
  async getRecommendationsForClient(
    salonId: string,
    clientId: string,
  ): Promise<ProductRecommendation[]> {
    // Busca o perfil capilar do cliente
    const profile = await db.query.clientHairProfiles.findFirst({
      where: and(
        eq(schema.clientHairProfiles.clientId, clientId),
        eq(schema.clientHairProfiles.salonId, salonId),
      ),
    });

    if (!profile) {
      return [];
    }

    // Busca todas as regras ativas
    const rules = await db.query.productRecommendationRules.findMany({
      where: and(
        sql`(${schema.productRecommendationRules.salonId} = ${salonId} OR ${schema.productRecommendationRules.salonId} IS NULL)`,
        eq(schema.productRecommendationRules.isActive, true),
      ),
      orderBy: [desc(schema.productRecommendationRules.priority)],
    });

    // Busca produtos do salão
    const products = await db.query.products.findMany({
      where: and(
        eq(schema.products.salonId, salonId),
        eq(schema.products.active, true),
      ),
    });

    const productMap = new Map(products.map(p => [p.id, p]));
    const recommendations: ProductRecommendation[] = [];
    const addedProductIds = new Set<number>();

    // Avalia cada regra
    for (const rule of rules) {
      const conditions = rule.conditions as RuleConditionsDto;
      const matchedCriteria: string[] = [];
      let matches = true;
      const isAndLogic = conditions.logic !== 'OR';

      // Verifica tipo de cabelo
      if (conditions.hairTypes?.length) {
        const match = profile.hairType && conditions.hairTypes.includes(profile.hairType);
        if (match) matchedCriteria.push(`Tipo: ${profile.hairType}`);
        if (isAndLogic && !match) matches = false;
        if (!isAndLogic && match) matches = true;
      }

      // Verifica espessura
      if (conditions.hairThickness?.length) {
        const match = profile.hairThickness && conditions.hairThickness.includes(profile.hairThickness);
        if (match) matchedCriteria.push(`Espessura: ${profile.hairThickness}`);
        if (isAndLogic && !match) matches = false;
        if (!isAndLogic && match) matches = true;
      }

      // Verifica comprimento
      if (conditions.hairLength?.length) {
        const match = profile.hairLength && conditions.hairLength.includes(profile.hairLength);
        if (match) matchedCriteria.push(`Comprimento: ${profile.hairLength}`);
        if (isAndLogic && !match) matches = false;
        if (!isAndLogic && match) matches = true;
      }

      // Verifica porosidade
      if (conditions.hairPorosity?.length) {
        const match = profile.hairPorosity && conditions.hairPorosity.includes(profile.hairPorosity);
        if (match) matchedCriteria.push(`Porosidade: ${profile.hairPorosity}`);
        if (isAndLogic && !match) matches = false;
        if (!isAndLogic && match) matches = true;
      }

      // Verifica tipo de couro cabeludo
      if (conditions.scalpTypes?.length) {
        const match = profile.scalpType && conditions.scalpTypes.includes(profile.scalpType);
        if (match) matchedCriteria.push(`Couro: ${profile.scalpType}`);
        if (isAndLogic && !match) matches = false;
        if (!isAndLogic && match) matches = true;
      }

      // Verifica histórico químico
      if (conditions.chemicalHistory?.length && Array.isArray(profile.chemicalHistory)) {
        const chemHistory = profile.chemicalHistory as string[];
        const match = conditions.chemicalHistory.some(c => chemHistory.includes(c));
        if (match) matchedCriteria.push('Histórico químico');
        if (isAndLogic && !match) matches = false;
        if (!isAndLogic && match) matches = true;
      }

      // Verifica necessidades
      if (conditions.mainConcerns?.length && Array.isArray(profile.mainConcerns)) {
        const concerns = profile.mainConcerns as string[];
        const matchedConcerns = conditions.mainConcerns.filter(c => concerns.includes(c));
        if (matchedConcerns.length > 0) {
          matchedCriteria.push(...matchedConcerns.map(c => `Necessidade: ${c}`));
        }
        if (isAndLogic && matchedConcerns.length === 0) matches = false;
        if (!isAndLogic && matchedConcerns.length > 0) matches = true;
      }

      if (matches && matchedCriteria.length > 0) {
        const ruleProducts = rule.recommendedProducts as RecommendedProductDto[] || [];

        for (const recProduct of ruleProducts) {
          if (addedProductIds.has(recProduct.productId)) continue;

          const product = productMap.get(recProduct.productId);
          if (!product || (product.stockRetail + product.stockInternal) <= 0) continue;

          recommendations.push({
            productId: product.id,
            productName: product.name,
            productDescription: product.description,
            salePrice: product.salePrice,
            currentStock: product.stockRetail + product.stockInternal,
            reason: recProduct.reason,
            priority: recProduct.priority,
            matchedCriteria,
            ruleId: rule.id,
            ruleName: rule.name,
          });

          addedProductIds.add(product.id);
        }
      }
    }

    // Também busca produtos diretamente relacionados ao perfil
    const profileBasedProducts = products.filter(product => {
      if (addedProductIds.has(product.id)) return false;
      if ((product.stockRetail + product.stockInternal) <= 0) return false;

      const hairTypes = (product.hairTypes as string[]) || [];
      const concerns = (product.concerns as string[]) || [];

      const matchesHairType = profile.hairType && hairTypes.includes(profile.hairType);
      const matchesConcern = Array.isArray(profile.mainConcerns) &&
        (profile.mainConcerns as string[]).some(c => concerns.includes(c));

      return matchesHairType || matchesConcern;
    });

    for (const product of profileBasedProducts) {
      const matchedCriteria: string[] = [];
      const hairTypes = (product.hairTypes as string[]) || [];
      const concerns = (product.concerns as string[]) || [];

      if (profile.hairType && hairTypes.includes(profile.hairType)) {
        matchedCriteria.push(`Indicado para cabelo ${profile.hairType}`);
      }

      if (Array.isArray(profile.mainConcerns)) {
        const matchedConcerns = (profile.mainConcerns as string[]).filter(c => concerns.includes(c));
        matchedCriteria.push(...matchedConcerns.map(c => `Resolve: ${c}`));
      }

      recommendations.push({
        productId: product.id,
        productName: product.name,
        productDescription: product.description,
        salePrice: product.salePrice,
        currentStock: product.stockRetail + product.stockInternal,
        reason: 'Produto indicado para seu perfil capilar',
        priority: 0,
        matchedCriteria,
      });

      addedProductIds.add(product.id);
    }

    // Ordena por prioridade
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  // ==================== LOGGING ====================

  /**
   * Registra uma recomendação mostrada ao cliente
   */
  async logRecommendation(
    salonId: string,
    dto: LogRecommendationDto,
  ): Promise<void> {
    await db.insert(schema.productRecommendationsLog).values({
      salonId,
      clientId: dto.clientId,
      commandId: dto.commandId,
      appointmentId: dto.appointmentId,
      ruleId: dto.ruleId,
      productId: dto.productId,
      reason: dto.reason,
    });
  }

  /**
   * Marca uma recomendação como aceita
   */
  async acceptRecommendation(
    salonId: string,
    logId: string,
  ): Promise<void> {
    const log = await db.query.productRecommendationsLog.findFirst({
      where: and(
        eq(schema.productRecommendationsLog.id, logId),
        eq(schema.productRecommendationsLog.salonId, salonId),
      ),
    });

    if (!log) {
      throw new NotFoundException('Log de recomendação não encontrado');
    }

    await db
      .update(schema.productRecommendationsLog)
      .set({
        wasAccepted: true,
        acceptedAt: new Date(),
      })
      .where(eq(schema.productRecommendationsLog.id, logId));
  }

  /**
   * Marca uma recomendação como rejeitada
   */
  async rejectRecommendation(
    salonId: string,
    logId: string,
  ): Promise<void> {
    const log = await db.query.productRecommendationsLog.findFirst({
      where: and(
        eq(schema.productRecommendationsLog.id, logId),
        eq(schema.productRecommendationsLog.salonId, salonId),
      ),
    });

    if (!log) {
      throw new NotFoundException('Log de recomendação não encontrado');
    }

    await db
      .update(schema.productRecommendationsLog)
      .set({
        wasAccepted: false,
        rejectedAt: new Date(),
      })
      .where(eq(schema.productRecommendationsLog.id, logId));
  }

  // ==================== STATISTICS ====================

  /**
   * Obtém estatísticas das recomendações
   */
  async getStats(salonId: string, days: number = 30): Promise<RecommendationStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await db.query.productRecommendationsLog.findMany({
      where: and(
        eq(schema.productRecommendationsLog.salonId, salonId),
        gte(schema.productRecommendationsLog.createdAt, startDate),
      ),
    });

    const totalRecommendations = logs.length;
    const acceptedCount = logs.filter(l => l.wasAccepted === true).length;
    const rejectedCount = logs.filter(l => l.wasAccepted === false).length;
    const pendingCount = logs.filter(l => l.wasAccepted === null).length;

    // Estatísticas por produto
    const productStats = new Map<number, { name: string; recommended: number; accepted: number }>();

    // Busca nomes dos produtos
    const productIds = [...new Set(logs.map(l => l.productId))];
    const products = productIds.length > 0
      ? await db.query.products.findMany({
          where: sql`${schema.products.id} IN (${sql.join(productIds.map(id => sql`${id}`), sql`, `)})`,
        })
      : [];

    const productNameMap = new Map(products.map(p => [p.id, p.name]));

    logs.forEach(log => {
      const existing = productStats.get(log.productId) || {
        name: productNameMap.get(log.productId) || 'Desconhecido',
        recommended: 0,
        accepted: 0,
      };
      existing.recommended++;
      if (log.wasAccepted) existing.accepted++;
      productStats.set(log.productId, existing);
    });

    // Estatísticas por regra
    const ruleStats = new Map<string, { name: string; triggered: number; accepted: number }>();

    const ruleIds = [...new Set(logs.filter(l => l.ruleId).map(l => l.ruleId!))];
    const rules = ruleIds.length > 0
      ? await db.query.productRecommendationRules.findMany({
          where: sql`${schema.productRecommendationRules.id} IN (${sql.join(ruleIds.map(id => sql`${id}`), sql`, `)})`,
        })
      : [];

    const ruleNameMap = new Map(rules.map(r => [r.id, r.name]));

    logs.forEach(log => {
      if (!log.ruleId) return;
      const existing = ruleStats.get(log.ruleId) || {
        name: ruleNameMap.get(log.ruleId) || 'Desconhecido',
        triggered: 0,
        accepted: 0,
      };
      existing.triggered++;
      if (log.wasAccepted) existing.accepted++;
      ruleStats.set(log.ruleId, existing);
    });

    return {
      totalRecommendations,
      acceptedCount,
      rejectedCount,
      pendingCount,
      acceptanceRate: totalRecommendations > 0
        ? Math.round((acceptedCount / (acceptedCount + rejectedCount || 1)) * 100)
        : 0,
      topProducts: [...productStats.entries()]
        .map(([productId, stats]) => ({
          productId,
          productName: stats.name,
          timesRecommended: stats.recommended,
          timesAccepted: stats.accepted,
          acceptanceRate: stats.recommended > 0
            ? Math.round((stats.accepted / stats.recommended) * 100)
            : 0,
        }))
        .sort((a, b) => b.timesRecommended - a.timesRecommended)
        .slice(0, 10),
      topRules: [...ruleStats.entries()]
        .map(([ruleId, stats]) => ({
          ruleId,
          ruleName: stats.name,
          timesTriggered: stats.triggered,
          acceptanceRate: stats.triggered > 0
            ? Math.round((stats.accepted / stats.triggered) * 100)
            : 0,
        }))
        .sort((a, b) => b.timesTriggered - a.timesTriggered)
        .slice(0, 10),
    };
  }

  // ==================== PRIVATE METHODS ====================

  private mapRuleToResponse(rule: schema.ProductRecommendationRule): RuleResponse {
    return {
      id: rule.id,
      salonId: rule.salonId,
      name: rule.name,
      description: rule.description,
      conditions: rule.conditions as RuleConditionsDto,
      recommendedProducts: (rule.recommendedProducts as RecommendedProductDto[]) || [],
      isActive: rule.isActive,
      priority: rule.priority,
      createdById: rule.createdById,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }
}
