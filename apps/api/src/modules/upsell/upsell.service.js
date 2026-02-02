"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpsellService = void 0;
const common_1 = require("@nestjs/common");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
let UpsellService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var UpsellService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            UpsellService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        // ==================== RULES ====================
        async getRules(salonId, options) {
            const page = options?.page || 1;
            const limit = options?.limit || 20;
            const offset = (page - 1) * limit;
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.upsellRules.salonId, salonId)];
            if (options?.triggerType)
                conditions.push((0, drizzle_orm_1.eq)(schema_1.upsellRules.triggerType, options.triggerType));
            if (options?.isActive !== undefined)
                conditions.push((0, drizzle_orm_1.eq)(schema_1.upsellRules.isActive, options.isActive));
            const [rules, totalResult] = await Promise.all([
                connection_1.db.select().from(schema_1.upsellRules).where((0, drizzle_orm_1.and)(...conditions)).orderBy((0, drizzle_orm_1.desc)(schema_1.upsellRules.createdAt)).limit(limit).offset(offset),
                connection_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.upsellRules).where((0, drizzle_orm_1.and)(...conditions)),
            ]);
            return {
                data: rules.map(this.formatRuleResponse),
                total: totalResult[0].count,
                page,
                limit,
            };
        }
        async getRuleById(salonId, id) {
            const [rule] = await connection_1.db.select().from(schema_1.upsellRules).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.upsellRules.id, id), (0, drizzle_orm_1.eq)(schema_1.upsellRules.salonId, salonId)));
            if (!rule)
                throw new common_1.NotFoundException('Regra não encontrada');
            return this.formatRuleResponse(rule);
        }
        async createRule(salonId, dto) {
            const [rule] = await connection_1.db.insert(schema_1.upsellRules).values({
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
        async updateRule(salonId, id, dto) {
            const [existing] = await connection_1.db.select().from(schema_1.upsellRules).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.upsellRules.id, id), (0, drizzle_orm_1.eq)(schema_1.upsellRules.salonId, salonId)));
            if (!existing)
                throw new common_1.NotFoundException('Regra não encontrada');
            const updateData = { updatedAt: new Date() };
            if (dto.name !== undefined)
                updateData.name = dto.name;
            if (dto.triggerType !== undefined)
                updateData.triggerType = dto.triggerType;
            if (dto.triggerServiceIds !== undefined)
                updateData.triggerServiceIds = dto.triggerServiceIds;
            if (dto.triggerProductIds !== undefined)
                updateData.triggerProductIds = dto.triggerProductIds;
            if (dto.triggerHairTypes !== undefined)
                updateData.triggerHairTypes = dto.triggerHairTypes;
            if (dto.recommendedProducts !== undefined)
                updateData.recommendedProducts = dto.recommendedProducts;
            if (dto.recommendedServices !== undefined)
                updateData.recommendedServices = dto.recommendedServices;
            if (dto.displayMessage !== undefined)
                updateData.displayMessage = dto.displayMessage;
            if (dto.discountPercent !== undefined)
                updateData.discountPercent = dto.discountPercent.toString();
            if (dto.validFrom !== undefined)
                updateData.validFrom = dto.validFrom;
            if (dto.validUntil !== undefined)
                updateData.validUntil = dto.validUntil;
            if (dto.maxUsesTotal !== undefined)
                updateData.maxUsesTotal = dto.maxUsesTotal;
            if (dto.maxUsesPerClient !== undefined)
                updateData.maxUsesPerClient = dto.maxUsesPerClient;
            if (dto.priority !== undefined)
                updateData.priority = dto.priority;
            if (dto.isActive !== undefined)
                updateData.isActive = dto.isActive;
            const [updated] = await connection_1.db.update(schema_1.upsellRules).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.upsellRules.id, id)).returning();
            return this.formatRuleResponse(updated);
        }
        async deleteRule(salonId, id) {
            const [existing] = await connection_1.db.select().from(schema_1.upsellRules).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.upsellRules.id, id), (0, drizzle_orm_1.eq)(schema_1.upsellRules.salonId, salonId)));
            if (!existing)
                throw new common_1.NotFoundException('Regra não encontrada');
            await connection_1.db.delete(schema_1.upsellOffers).where((0, drizzle_orm_1.eq)(schema_1.upsellOffers.ruleId, id));
            await connection_1.db.delete(schema_1.upsellRules).where((0, drizzle_orm_1.eq)(schema_1.upsellRules.id, id));
        }
        // ==================== OFFERS ====================
        async getOffersForAppointment(salonId, appointmentId) {
            const offers = await connection_1.db.select().from(schema_1.upsellOffers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.upsellOffers.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.upsellOffers.appointmentId, appointmentId)));
            return offers.map(this.formatOfferResponse);
        }
        async getOffersForService(salonId, serviceId) {
            const rules = await connection_1.db.select().from(schema_1.upsellRules).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.upsellRules.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.upsellRules.triggerType, 'SERVICE'), (0, drizzle_orm_1.eq)(schema_1.upsellRules.isActive, true)));
            return rules.filter(r => (r.triggerServiceIds || []).includes(serviceId)).map(this.formatRuleResponse);
        }
        async getPersonalizedOffers(salonId, clientId) {
            const offers = await connection_1.db.select().from(schema_1.upsellOffers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.upsellOffers.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.upsellOffers.clientId, clientId), (0, drizzle_orm_1.eq)(schema_1.upsellOffers.status, 'SHOWN')));
            return offers.map(this.formatOfferResponse);
        }
        async getOffers(salonId, options) {
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.upsellOffers.salonId, salonId)];
            if (options?.status)
                conditions.push((0, drizzle_orm_1.eq)(schema_1.upsellOffers.status, options.status));
            if (options?.clientId)
                conditions.push((0, drizzle_orm_1.eq)(schema_1.upsellOffers.clientId, options.clientId));
            if (options?.ruleId)
                conditions.push((0, drizzle_orm_1.eq)(schema_1.upsellOffers.ruleId, options.ruleId));
            const page = options?.page || 1;
            const limit = options?.limit || 20;
            const offset = (page - 1) * limit;
            const [offers, totalResult] = await Promise.all([
                connection_1.db.select().from(schema_1.upsellOffers).where((0, drizzle_orm_1.and)(...conditions)).orderBy((0, drizzle_orm_1.desc)(schema_1.upsellOffers.createdAt)).limit(limit).offset(offset),
                connection_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.upsellOffers).where((0, drizzle_orm_1.and)(...conditions)),
            ]);
            return { data: offers.map(this.formatOfferResponse), total: totalResult[0].count };
        }
        async acceptOffer(salonId, offerId, commandId) {
            const [existing] = await connection_1.db.select().from(schema_1.upsellOffers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.upsellOffers.id, offerId), (0, drizzle_orm_1.eq)(schema_1.upsellOffers.salonId, salonId)));
            if (!existing)
                throw new common_1.NotFoundException('Oferta não encontrada');
            if (existing.status !== 'SHOWN')
                throw new common_1.BadRequestException('Oferta já foi processada');
            const [updated] = await connection_1.db.update(schema_1.upsellOffers).set({ status: 'ACCEPTED', acceptedAt: new Date(), commandId }).where((0, drizzle_orm_1.eq)(schema_1.upsellOffers.id, offerId)).returning();
            return this.formatOfferResponse(updated);
        }
        async declineOffer(salonId, offerId) {
            const [existing] = await connection_1.db.select().from(schema_1.upsellOffers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.upsellOffers.id, offerId), (0, drizzle_orm_1.eq)(schema_1.upsellOffers.salonId, salonId)));
            if (!existing)
                throw new common_1.NotFoundException('Oferta não encontrada');
            const [updated] = await connection_1.db.update(schema_1.upsellOffers).set({ status: 'DECLINED', declinedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.upsellOffers.id, offerId)).returning();
            return this.formatOfferResponse(updated);
        }
        // ==================== STATS ====================
        async getStats(salonId, startDate, endDate) {
            const rules = await connection_1.db.select().from(schema_1.upsellRules).where((0, drizzle_orm_1.eq)(schema_1.upsellRules.salonId, salonId));
            const offerConditions = [(0, drizzle_orm_1.eq)(schema_1.upsellOffers.salonId, salonId)];
            if (startDate)
                offerConditions.push((0, drizzle_orm_1.gte)(schema_1.upsellOffers.createdAt, new Date(startDate)));
            if (endDate)
                offerConditions.push((0, drizzle_orm_1.lte)(schema_1.upsellOffers.createdAt, new Date(endDate)));
            const offers = await connection_1.db.select().from(schema_1.upsellOffers).where((0, drizzle_orm_1.and)(...offerConditions));
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
        formatRuleResponse(rule) {
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
        formatOfferResponse(offer) {
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
    };
    return UpsellService = _classThis;
})();
exports.UpsellService = UpsellService;
//# sourceMappingURL=upsell.service.js.map