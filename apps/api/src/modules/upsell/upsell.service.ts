import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../../database/connection';
import { upsellRules, upsellOffers } from '../../database/schema';
import { eq, and, desc, gte, lte, count } from 'drizzle-orm';
import { CreateUpsellRuleDto, UpdateUpsellRuleDto, UpsellRuleResponse, UpsellOfferResponse, UpsellStatsResponse } from './dto';

@Injectable()
export class UpsellService {
  // ==================== RULES ====================

  async getRules(
    salonId: string,
    options?: { page?: number; limit?: number; triggerType?: string; isActive?: boolean },
  ): Promise<{ data: UpsellRuleResponse[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(upsellRules.salonId, salonId)];
    if (options?.triggerType) conditions.push(eq(upsellRules.triggerType, options.triggerType));
    if (options?.isActive !== undefined) conditions.push(eq(upsellRules.isActive, options.isActive));

    const [rules, totalResult] = await Promise.all([
      db.select().from(upsellRules).where(and(...conditions)).orderBy(desc(upsellRules.createdAt)).limit(limit).offset(offset),
      db.select({ count: count() }).from(upsellRules).where(and(...conditions)),
    ]);

    return {
      data: rules.map(this.formatRuleResponse),
      total: totalResult[0].count,
      page,
      limit,
    };
  }

  async getRuleById(salonId: string, id: string): Promise<UpsellRuleResponse> {
    const [rule] = await db.select().from(upsellRules).where(and(eq(upsellRules.id, id), eq(upsellRules.salonId, salonId)));
    if (!rule) throw new NotFoundException('Regra não encontrada');
    return this.formatRuleResponse(rule);
  }

  async createRule(salonId: string, dto: CreateUpsellRuleDto): Promise<UpsellRuleResponse> {
    const [rule] = await db.insert(upsellRules).values({
      salonId,
      name: dto.name,
      triggerType: dto.triggerType,
      triggerServiceIds: dto.triggerServiceIds || [],
      triggerProductIds: dto.triggerProductIds || [],
      triggerHairTypes: dto.triggerHairTypes || [],
      recommendedProducts: dto.recommendedProducts || [],
      recommendedServices: dto.recommendedServices || [],
      displayMessage: dto.displayMessage,
      discountPercent: dto.discountPercent?.toString(),
      validFrom: dto.validFrom,
      validUntil: dto.validUntil,
      maxUsesTotal: dto.maxUsesTotal,
      maxUsesPerClient: dto.maxUsesPerClient,
      priority: dto.priority || 0,
    }).returning();
    return this.formatRuleResponse(rule);
  }

  async updateRule(salonId: string, id: string, dto: UpdateUpsellRuleDto): Promise<UpsellRuleResponse> {
    const [existing] = await db.select().from(upsellRules).where(and(eq(upsellRules.id, id), eq(upsellRules.salonId, salonId)));
    if (!existing) throw new NotFoundException('Regra não encontrada');

    const updateData: any = { updatedAt: new Date() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.triggerType !== undefined) updateData.triggerType = dto.triggerType;
    if (dto.triggerServiceIds !== undefined) updateData.triggerServiceIds = dto.triggerServiceIds;
    if (dto.triggerProductIds !== undefined) updateData.triggerProductIds = dto.triggerProductIds;
    if (dto.triggerHairTypes !== undefined) updateData.triggerHairTypes = dto.triggerHairTypes;
    if (dto.recommendedProducts !== undefined) updateData.recommendedProducts = dto.recommendedProducts;
    if (dto.recommendedServices !== undefined) updateData.recommendedServices = dto.recommendedServices;
    if (dto.displayMessage !== undefined) updateData.displayMessage = dto.displayMessage;
    if (dto.discountPercent !== undefined) updateData.discountPercent = dto.discountPercent.toString();
    if (dto.validFrom !== undefined) updateData.validFrom = dto.validFrom;
    if (dto.validUntil !== undefined) updateData.validUntil = dto.validUntil;
    if (dto.maxUsesTotal !== undefined) updateData.maxUsesTotal = dto.maxUsesTotal;
    if (dto.maxUsesPerClient !== undefined) updateData.maxUsesPerClient = dto.maxUsesPerClient;
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const [updated] = await db.update(upsellRules).set(updateData).where(eq(upsellRules.id, id)).returning();
    return this.formatRuleResponse(updated);
  }

  async deleteRule(salonId: string, id: string): Promise<void> {
    const [existing] = await db.select().from(upsellRules).where(and(eq(upsellRules.id, id), eq(upsellRules.salonId, salonId)));
    if (!existing) throw new NotFoundException('Regra não encontrada');
    await db.delete(upsellOffers).where(eq(upsellOffers.ruleId, id));
    await db.delete(upsellRules).where(eq(upsellRules.id, id));
  }

  // ==================== OFFERS ====================

  async getOffersForAppointment(salonId: string, appointmentId: string): Promise<UpsellOfferResponse[]> {
    const offers = await db.select().from(upsellOffers).where(and(eq(upsellOffers.salonId, salonId), eq(upsellOffers.appointmentId, appointmentId)));
    return offers.map(this.formatOfferResponse);
  }

  async getOffersForService(salonId: string, serviceId: number): Promise<UpsellRuleResponse[]> {
    const rules = await db.select().from(upsellRules).where(and(eq(upsellRules.salonId, salonId), eq(upsellRules.triggerType, 'SERVICE'), eq(upsellRules.isActive, true)));
    return rules.filter(r => (r.triggerServiceIds as number[] || []).includes(serviceId)).map(this.formatRuleResponse);
  }

  async getPersonalizedOffers(salonId: string, clientId: string): Promise<UpsellOfferResponse[]> {
    const offers = await db.select().from(upsellOffers).where(and(eq(upsellOffers.salonId, salonId), eq(upsellOffers.clientId, clientId), eq(upsellOffers.status, 'SHOWN')));
    return offers.map(this.formatOfferResponse);
  }

  async getOffers(salonId: string, options?: { page?: number; limit?: number; status?: string; clientId?: string; ruleId?: string }): Promise<{ data: UpsellOfferResponse[]; total: number }> {
    const conditions: any[] = [eq(upsellOffers.salonId, salonId)];
    if (options?.status) conditions.push(eq(upsellOffers.status, options.status));
    if (options?.clientId) conditions.push(eq(upsellOffers.clientId, options.clientId));
    if (options?.ruleId) conditions.push(eq(upsellOffers.ruleId, options.ruleId));

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const [offers, totalResult] = await Promise.all([
      db.select().from(upsellOffers).where(and(...conditions)).orderBy(desc(upsellOffers.createdAt)).limit(limit).offset(offset),
      db.select({ count: count() }).from(upsellOffers).where(and(...conditions)),
    ]);

    return { data: offers.map(this.formatOfferResponse), total: totalResult[0].count };
  }

  async acceptOffer(salonId: string, offerId: string, commandId?: string): Promise<UpsellOfferResponse> {
    const [existing] = await db.select().from(upsellOffers).where(and(eq(upsellOffers.id, offerId), eq(upsellOffers.salonId, salonId)));
    if (!existing) throw new NotFoundException('Oferta não encontrada');
    if (existing.status !== 'SHOWN') throw new BadRequestException('Oferta já foi processada');

    const [updated] = await db.update(upsellOffers).set({ status: 'ACCEPTED', acceptedAt: new Date(), commandId }).where(eq(upsellOffers.id, offerId)).returning();
    return this.formatOfferResponse(updated);
  }

  async declineOffer(salonId: string, offerId: string): Promise<UpsellOfferResponse> {
    const [existing] = await db.select().from(upsellOffers).where(and(eq(upsellOffers.id, offerId), eq(upsellOffers.salonId, salonId)));
    if (!existing) throw new NotFoundException('Oferta não encontrada');

    const [updated] = await db.update(upsellOffers).set({ status: 'DECLINED', declinedAt: new Date() }).where(eq(upsellOffers.id, offerId)).returning();
    return this.formatOfferResponse(updated);
  }

  // ==================== STATS ====================

  async getStats(salonId: string, startDate?: string, endDate?: string): Promise<UpsellStatsResponse> {
    const rules = await db.select().from(upsellRules).where(eq(upsellRules.salonId, salonId));

    const offerConditions: any[] = [eq(upsellOffers.salonId, salonId)];
    if (startDate) offerConditions.push(gte(upsellOffers.createdAt, new Date(startDate)));
    if (endDate) offerConditions.push(lte(upsellOffers.createdAt, new Date(endDate)));
    const offers = await db.select().from(upsellOffers).where(and(...offerConditions));

    const accepted = offers.filter(o => o.status === 'ACCEPTED');
    const declined = offers.filter(o => o.status === 'DECLINED');
    const totalRevenue = accepted.reduce((sum, o) => sum + parseFloat(o.totalDiscountedPrice || '0'), 0);
    const totalDiscount = accepted.reduce((sum, o) => sum + (parseFloat(o.totalOriginalPrice || '0') - parseFloat(o.totalDiscountedPrice || '0')), 0);

    return {
      totalRules: rules.length,
      activeRules: rules.filter(r => r.isActive).length,
      totalOffers: offers.length,
      acceptedOffers: accepted.length,
      declinedOffers: declined.length,
      conversionRate: offers.length > 0 ? (accepted.length / offers.length) * 100 : 0,
      totalRevenue,
      averageDiscount: accepted.length > 0 ? totalDiscount / accepted.length : 0,
    };
  }

  // ==================== HELPERS ====================

  private formatRuleResponse(rule: any): UpsellRuleResponse {
    return {
      id: rule.id,
      salonId: rule.salonId,
      name: rule.name,
      triggerType: rule.triggerType,
      triggerServiceIds: rule.triggerServiceIds || [],
      triggerProductIds: rule.triggerProductIds || [],
      triggerHairTypes: rule.triggerHairTypes || [],
      recommendedProducts: rule.recommendedProducts || [],
      recommendedServices: rule.recommendedServices || [],
      displayMessage: rule.displayMessage,
      discountPercent: rule.discountPercent,
      validFrom: rule.validFrom,
      validUntil: rule.validUntil,
      maxUsesTotal: rule.maxUsesTotal,
      maxUsesPerClient: rule.maxUsesPerClient,
      currentUses: rule.currentUses,
      isActive: rule.isActive,
      priority: rule.priority,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }

  private formatOfferResponse(offer: any): UpsellOfferResponse {
    return {
      id: offer.id,
      salonId: offer.salonId,
      ruleId: offer.ruleId,
      clientId: offer.clientId,
      appointmentId: offer.appointmentId,
      commandId: offer.commandId,
      status: offer.status,
      offeredProducts: offer.offeredProducts || [],
      offeredServices: offer.offeredServices || [],
      totalOriginalPrice: offer.totalOriginalPrice,
      totalDiscountedPrice: offer.totalDiscountedPrice,
      savings: parseFloat(offer.totalOriginalPrice || '0') - parseFloat(offer.totalDiscountedPrice || '0'),
      acceptedAt: offer.acceptedAt,
      declinedAt: offer.declinedAt,
      expiresAt: offer.expiresAt,
      createdAt: offer.createdAt,
    };
  }
}
