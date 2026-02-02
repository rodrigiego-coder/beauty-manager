"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema = __importStar(require("../../database/schema"));
let ProductSubscriptionsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ProductSubscriptionsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ProductSubscriptionsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        // ==================== PLAN METHODS ====================
        async getPlans(salonId) {
            const plans = await connection_1.db
                .select()
                .from(schema.productSubscriptionPlans)
                .where((0, drizzle_orm_1.eq)(schema.productSubscriptionPlans.salonId, salonId))
                .orderBy((0, drizzle_orm_1.desc)(schema.productSubscriptionPlans.createdAt));
            // Get items for each plan
            const plansWithItems = await Promise.all(plans.map(async (plan) => {
                const items = await this.getPlanItems(plan.id);
                return {
                    ...plan,
                    frequency: plan.billingPeriod || 'MONTHLY',
                    items,
                };
            }));
            return plansWithItems;
        }
        async getPlanById(planId, salonId) {
            const [plan] = await connection_1.db
                .select()
                .from(schema.productSubscriptionPlans)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.productSubscriptionPlans.id, planId), (0, drizzle_orm_1.eq)(schema.productSubscriptionPlans.salonId, salonId)));
            if (!plan) {
                throw new common_1.NotFoundException('Plano nao encontrado');
            }
            const items = await this.getPlanItems(planId);
            return {
                ...plan,
                frequency: plan.billingPeriod || 'MONTHLY',
                items,
            };
        }
        async getPlanItems(planId) {
            const items = await connection_1.db
                .select({
                id: schema.productSubscriptionItems.id,
                planId: schema.productSubscriptionItems.planId,
                productId: schema.productSubscriptionItems.productId,
                quantity: schema.productSubscriptionItems.quantity,
                product: {
                    id: schema.products.id,
                    name: schema.products.name,
                    salePrice: schema.products.salePrice,
                },
            })
                .from(schema.productSubscriptionItems)
                .leftJoin(schema.products, (0, drizzle_orm_1.eq)(schema.productSubscriptionItems.productId, schema.products.id))
                .where((0, drizzle_orm_1.eq)(schema.productSubscriptionItems.planId, planId));
            return items;
        }
        async createPlan(salonId, dto) {
            // Calculate prices based on items
            let originalPrice = 0;
            for (const item of dto.items) {
                const [product] = await connection_1.db
                    .select()
                    .from(schema.products)
                    .where((0, drizzle_orm_1.eq)(schema.products.id, item.productId));
                if (!product) {
                    throw new common_1.BadRequestException(`Produto ${item.productId} nao encontrado`);
                }
                originalPrice += parseFloat(product.salePrice) * (item.quantity || 1);
            }
            const discountPercent = dto.discountPercent || 0;
            const finalPrice = originalPrice * (1 - discountPercent / 100);
            // Create plan
            const [plan] = await connection_1.db
                .insert(schema.productSubscriptionPlans)
                .values({
                salonId,
                name: dto.name,
                description: dto.description,
                billingPeriod: dto.billingPeriod,
                originalPrice: originalPrice.toFixed(2),
                discountPercent: discountPercent.toString(),
                finalPrice: finalPrice.toFixed(2),
                imageUrl: dto.imageUrl,
                benefits: dto.benefits || [],
                maxSubscribers: dto.maxSubscribers,
            })
                .returning();
            // Add items
            for (const item of dto.items) {
                await connection_1.db.insert(schema.productSubscriptionItems).values({
                    planId: plan.id,
                    productId: item.productId,
                    quantity: (item.quantity || 1).toString(),
                });
            }
            return this.getPlanById(plan.id, salonId);
        }
        async updatePlan(planId, salonId, dto) {
            const existing = await this.getPlanById(planId, salonId);
            // Recalculate prices if discount changed
            let finalPrice = parseFloat(existing.finalPrice);
            if (dto.discountPercent !== undefined) {
                const originalPrice = parseFloat(existing.originalPrice);
                finalPrice = originalPrice * (1 - dto.discountPercent / 100);
            }
            await connection_1.db
                .update(schema.productSubscriptionPlans)
                .set({
                name: dto.name ?? existing.name,
                description: dto.description ?? existing.description,
                billingPeriod: dto.billingPeriod ?? existing.billingPeriod,
                discountPercent: dto.discountPercent?.toString() ?? existing.discountPercent,
                finalPrice: finalPrice.toFixed(2),
                imageUrl: dto.imageUrl ?? existing.imageUrl,
                benefits: dto.benefits ?? existing.benefits,
                maxSubscribers: dto.maxSubscribers ?? existing.maxSubscribers,
                isActive: dto.isActive ?? existing.isActive,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.productSubscriptionPlans.id, planId));
            return this.getPlanById(planId, salonId);
        }
        async deletePlan(planId, salonId) {
            const plan = await this.getPlanById(planId, salonId);
            if ((plan.currentSubscribers || 0) > 0) {
                // Just deactivate if has subscribers
                await connection_1.db
                    .update(schema.productSubscriptionPlans)
                    .set({ isActive: false, updatedAt: new Date() })
                    .where((0, drizzle_orm_1.eq)(schema.productSubscriptionPlans.id, planId));
            }
            else {
                // Delete items first
                await connection_1.db
                    .delete(schema.productSubscriptionItems)
                    .where((0, drizzle_orm_1.eq)(schema.productSubscriptionItems.planId, planId));
                // Delete plan
                await connection_1.db
                    .delete(schema.productSubscriptionPlans)
                    .where((0, drizzle_orm_1.eq)(schema.productSubscriptionPlans.id, planId));
            }
        }
        async addPlanItem(planId, salonId, dto) {
            await this.getPlanById(planId, salonId);
            const [product] = await connection_1.db
                .select()
                .from(schema.products)
                .where((0, drizzle_orm_1.eq)(schema.products.id, dto.productId));
            if (!product) {
                throw new common_1.BadRequestException('Produto nao encontrado');
            }
            await connection_1.db.insert(schema.productSubscriptionItems).values({
                planId,
                productId: dto.productId,
                quantity: (dto.quantity || 1).toString(),
            });
            // Recalculate prices
            await this.recalculatePlanPrices(planId);
            return this.getPlanById(planId, salonId);
        }
        async removePlanItem(planId, itemId, salonId) {
            await this.getPlanById(planId, salonId);
            await connection_1.db
                .delete(schema.productSubscriptionItems)
                .where((0, drizzle_orm_1.eq)(schema.productSubscriptionItems.id, itemId));
            // Recalculate prices
            await this.recalculatePlanPrices(planId);
            return this.getPlanById(planId, salonId);
        }
        async recalculatePlanPrices(planId) {
            const items = await this.getPlanItems(planId);
            let originalPrice = 0;
            for (const item of items) {
                if (item.product) {
                    originalPrice += parseFloat(item.product.salePrice) * parseFloat(item.quantity);
                }
            }
            const [plan] = await connection_1.db
                .select()
                .from(schema.productSubscriptionPlans)
                .where((0, drizzle_orm_1.eq)(schema.productSubscriptionPlans.id, planId));
            const discountPercent = parseFloat(plan.discountPercent || '0');
            const finalPrice = originalPrice * (1 - discountPercent / 100);
            await connection_1.db
                .update(schema.productSubscriptionPlans)
                .set({
                originalPrice: originalPrice.toFixed(2),
                finalPrice: finalPrice.toFixed(2),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.productSubscriptionPlans.id, planId));
        }
        // ==================== SUBSCRIPTION METHODS ====================
        async getAvailablePlans(salonId) {
            const plans = await connection_1.db
                .select()
                .from(schema.productSubscriptionPlans)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.productSubscriptionPlans.salonId, salonId), (0, drizzle_orm_1.eq)(schema.productSubscriptionPlans.isActive, true)))
                .orderBy(schema.productSubscriptionPlans.name);
            const plansWithItems = await Promise.all(plans.map(async (plan) => {
                const items = await this.getPlanItems(plan.id);
                return {
                    ...plan,
                    frequency: plan.billingPeriod || 'MONTHLY',
                    items,
                };
            }));
            // Filter out plans that are full
            return plansWithItems.filter((plan) => !plan.maxSubscribers || (plan.currentSubscribers || 0) < plan.maxSubscribers);
        }
        async getSubscriptions(salonId, clientId) {
            const conditions = [(0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.salonId, salonId)];
            if (clientId) {
                conditions.push((0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.clientId, clientId));
            }
            const subscriptions = await connection_1.db
                .select()
                .from(schema.clientProductSubscriptions)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy((0, drizzle_orm_1.desc)(schema.clientProductSubscriptions.createdAt));
            // Enrich with plan and client data
            const enriched = await Promise.all(subscriptions.map(async (sub) => {
                const plan = await this.getPlanById(sub.planId, salonId).catch(() => null);
                const [client] = await connection_1.db
                    .select({ id: schema.clients.id, name: schema.clients.name, phone: schema.clients.phone })
                    .from(schema.clients)
                    .where((0, drizzle_orm_1.eq)(schema.clients.id, sub.clientId));
                return {
                    ...sub,
                    plan: plan || undefined,
                    client: client || undefined,
                };
            }));
            return enriched;
        }
        async getSubscriptionById(subscriptionId, salonId) {
            const [subscription] = await connection_1.db
                .select()
                .from(schema.clientProductSubscriptions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.id, subscriptionId), (0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.salonId, salonId)));
            if (!subscription) {
                throw new common_1.NotFoundException('Assinatura nao encontrada');
            }
            const plan = await this.getPlanById(subscription.planId, salonId).catch(() => null);
            const [client] = await connection_1.db
                .select({ id: schema.clients.id, name: schema.clients.name, phone: schema.clients.phone })
                .from(schema.clients)
                .where((0, drizzle_orm_1.eq)(schema.clients.id, subscription.clientId));
            return {
                ...subscription,
                plan: plan || undefined,
                client: client || undefined,
            };
        }
        async subscribe(salonId, clientId, planId, dto) {
            // Validate plan
            const plan = await this.getPlanById(planId, salonId);
            if (!plan.isActive) {
                throw new common_1.BadRequestException('Plano nao esta ativo');
            }
            if (plan.maxSubscribers && (plan.currentSubscribers || 0) >= plan.maxSubscribers) {
                throw new common_1.BadRequestException('Plano atingiu o limite de assinantes');
            }
            // Check if client already has active subscription for this plan
            const [existing] = await connection_1.db
                .select()
                .from(schema.clientProductSubscriptions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.clientId, clientId), (0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.planId, planId), (0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.status, 'ACTIVE')));
            if (existing) {
                throw new common_1.BadRequestException('Cliente ja possui assinatura ativa deste plano');
            }
            // Validate delivery address if delivery type
            if (dto.deliveryType === 'DELIVERY' && !dto.deliveryAddress) {
                throw new common_1.BadRequestException('Endereco de entrega e obrigatorio');
            }
            // Create subscription
            const startDate = new Date(dto.startDate);
            const nextDeliveryDate = new Date(dto.startDate);
            const [subscription] = await connection_1.db
                .insert(schema.clientProductSubscriptions)
                .values({
                salonId,
                clientId,
                planId,
                status: 'ACTIVE',
                deliveryType: dto.deliveryType,
                deliveryAddress: dto.deliveryAddress,
                paymentMethod: dto.paymentMethod,
                startDate: startDate.toISOString().split('T')[0],
                nextDeliveryDate: nextDeliveryDate.toISOString().split('T')[0],
                notes: dto.notes,
            })
                .returning();
            // Increment subscriber count
            await connection_1.db
                .update(schema.productSubscriptionPlans)
                .set({
                currentSubscribers: (0, drizzle_orm_1.sql) `${schema.productSubscriptionPlans.currentSubscribers} + 1`,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.productSubscriptionPlans.id, planId));
            // Create first delivery
            await this.createDelivery(subscription.id, salonId, nextDeliveryDate.toISOString().split('T')[0]);
            return this.getSubscriptionById(subscription.id, salonId);
        }
        async updateSubscription(subscriptionId, salonId, dto) {
            const subscription = await this.getSubscriptionById(subscriptionId, salonId);
            if (subscription.status !== 'ACTIVE') {
                throw new common_1.BadRequestException('Assinatura nao esta ativa');
            }
            await connection_1.db
                .update(schema.clientProductSubscriptions)
                .set({
                deliveryType: dto.deliveryType ?? subscription.deliveryType,
                deliveryAddress: dto.deliveryAddress ?? subscription.deliveryAddress,
                paymentMethod: dto.paymentMethod ?? subscription.paymentMethod,
                notes: dto.notes ?? subscription.notes,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.id, subscriptionId));
            return this.getSubscriptionById(subscriptionId, salonId);
        }
        async pauseSubscription(subscriptionId, salonId, dto) {
            const subscription = await this.getSubscriptionById(subscriptionId, salonId);
            if (subscription.status !== 'ACTIVE') {
                throw new common_1.BadRequestException('Assinatura nao esta ativa');
            }
            await connection_1.db
                .update(schema.clientProductSubscriptions)
                .set({
                status: 'PAUSED',
                pausedAt: new Date(),
                pauseReason: dto.reason,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.id, subscriptionId));
            // Cancel pending deliveries
            await connection_1.db
                .update(schema.subscriptionDeliveries)
                .set({ status: 'CANCELLED', updatedAt: new Date() })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.subscriptionId, subscriptionId), (0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.status, 'PENDING')));
            return this.getSubscriptionById(subscriptionId, salonId);
        }
        async resumeSubscription(subscriptionId, salonId) {
            const subscription = await this.getSubscriptionById(subscriptionId, salonId);
            if (subscription.status !== 'PAUSED') {
                throw new common_1.BadRequestException('Assinatura nao esta pausada');
            }
            // Calculate next delivery date
            const nextDeliveryDate = this.calculateNextDeliveryDate(subscription.plan.billingPeriod);
            await connection_1.db
                .update(schema.clientProductSubscriptions)
                .set({
                status: 'ACTIVE',
                pausedAt: null,
                pauseReason: null,
                nextDeliveryDate: nextDeliveryDate.toISOString().split('T')[0],
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.id, subscriptionId));
            // Create next delivery
            await this.createDelivery(subscriptionId, salonId, nextDeliveryDate.toISOString().split('T')[0]);
            return this.getSubscriptionById(subscriptionId, salonId);
        }
        async cancelSubscription(subscriptionId, salonId, dto) {
            const subscription = await this.getSubscriptionById(subscriptionId, salonId);
            if (subscription.status === 'CANCELLED') {
                throw new common_1.BadRequestException('Assinatura ja esta cancelada');
            }
            await connection_1.db
                .update(schema.clientProductSubscriptions)
                .set({
                status: 'CANCELLED',
                cancelledAt: new Date(),
                cancelReason: dto.reason,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.id, subscriptionId));
            // Decrement subscriber count
            await connection_1.db
                .update(schema.productSubscriptionPlans)
                .set({
                currentSubscribers: (0, drizzle_orm_1.sql) `GREATEST(${schema.productSubscriptionPlans.currentSubscribers} - 1, 0)`,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.productSubscriptionPlans.id, subscription.planId));
            // Cancel pending deliveries
            await connection_1.db
                .update(schema.subscriptionDeliveries)
                .set({ status: 'CANCELLED', updatedAt: new Date() })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.subscriptionId, subscriptionId), (0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.status, 'PENDING')));
            return this.getSubscriptionById(subscriptionId, salonId);
        }
        // ==================== DELIVERY METHODS ====================
        async getDeliveries(salonId, filters) {
            const conditions = [(0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.salonId, salonId)];
            if (filters?.date) {
                conditions.push((0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.scheduledDate, filters.date));
            }
            if (filters?.status) {
                conditions.push((0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.status, filters.status));
            }
            const deliveries = await connection_1.db
                .select()
                .from(schema.subscriptionDeliveries)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy(schema.subscriptionDeliveries.scheduledDate);
            // Enrich with subscription and items
            const enriched = await Promise.all(deliveries.map(async (delivery) => {
                const subscription = await this.getSubscriptionById(delivery.subscriptionId, salonId).catch(() => null);
                const items = await this.getDeliveryItems(delivery.id);
                return { ...delivery, subscription: subscription || undefined, items };
            }));
            return enriched;
        }
        async getPendingDeliveries(salonId) {
            const today = new Date().toISOString().split('T')[0];
            return this.getDeliveries(salonId, { date: today, status: 'PENDING' });
        }
        async getSubscriptionDeliveries(subscriptionId, salonId) {
            const deliveries = await connection_1.db
                .select()
                .from(schema.subscriptionDeliveries)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.subscriptionId, subscriptionId), (0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.salonId, salonId)))
                .orderBy((0, drizzle_orm_1.desc)(schema.subscriptionDeliveries.scheduledDate));
            const enriched = await Promise.all(deliveries.map(async (delivery) => {
                const items = await this.getDeliveryItems(delivery.id);
                return { ...delivery, items };
            }));
            return enriched;
        }
        async getDeliveryItems(deliveryId) {
            const items = await connection_1.db
                .select({
                id: schema.subscriptionDeliveryItems.id,
                deliveryId: schema.subscriptionDeliveryItems.deliveryId,
                productId: schema.subscriptionDeliveryItems.productId,
                quantity: schema.subscriptionDeliveryItems.quantity,
                unitPrice: schema.subscriptionDeliveryItems.unitPrice,
                totalPrice: schema.subscriptionDeliveryItems.totalPrice,
                product: {
                    id: schema.products.id,
                    name: schema.products.name,
                },
            })
                .from(schema.subscriptionDeliveryItems)
                .leftJoin(schema.products, (0, drizzle_orm_1.eq)(schema.subscriptionDeliveryItems.productId, schema.products.id))
                .where((0, drizzle_orm_1.eq)(schema.subscriptionDeliveryItems.deliveryId, deliveryId));
            return items;
        }
        async updateDeliveryStatus(deliveryId, salonId, dto, userId) {
            const [delivery] = await connection_1.db
                .select()
                .from(schema.subscriptionDeliveries)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.id, deliveryId), (0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.salonId, salonId)));
            if (!delivery) {
                throw new common_1.NotFoundException('Entrega nao encontrada');
            }
            const updates = {
                status: dto.status,
                notes: dto.notes ?? delivery.notes,
                updatedAt: new Date(),
            };
            if (dto.status === 'PREPARING' && userId) {
                updates.preparedById = userId;
            }
            if (dto.status === 'DELIVERED') {
                updates.deliveredDate = new Date().toISOString().split('T')[0];
                if (userId)
                    updates.deliveredById = userId;
                // Update subscription
                const subscription = await this.getSubscriptionById(delivery.subscriptionId, salonId);
                const nextDeliveryDate = this.calculateNextDeliveryDate(subscription.plan.billingPeriod);
                await connection_1.db
                    .update(schema.clientProductSubscriptions)
                    .set({
                    lastDeliveryDate: new Date().toISOString().split('T')[0],
                    nextDeliveryDate: nextDeliveryDate.toISOString().split('T')[0],
                    totalDeliveries: (0, drizzle_orm_1.sql) `${schema.clientProductSubscriptions.totalDeliveries} + 1`,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.id, delivery.subscriptionId));
                // Schedule next delivery
                await this.createDelivery(delivery.subscriptionId, salonId, nextDeliveryDate.toISOString().split('T')[0]);
            }
            await connection_1.db
                .update(schema.subscriptionDeliveries)
                .set(updates)
                .where((0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.id, deliveryId));
            const items = await this.getDeliveryItems(deliveryId);
            const [updated] = await connection_1.db
                .select()
                .from(schema.subscriptionDeliveries)
                .where((0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.id, deliveryId));
            return { ...updated, items };
        }
        async generateCommand(deliveryId, salonId, userId) {
            const [delivery] = await connection_1.db
                .select()
                .from(schema.subscriptionDeliveries)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.id, deliveryId), (0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.salonId, salonId)));
            if (!delivery) {
                throw new common_1.NotFoundException('Entrega nao encontrada');
            }
            if (delivery.commandId) {
                return { commandId: delivery.commandId };
            }
            const subscription = await this.getSubscriptionById(delivery.subscriptionId, salonId);
            const items = await this.getDeliveryItems(deliveryId);
            // Create command
            const code = `SUB-${Date.now().toString(36).toUpperCase()}`;
            const [command] = await connection_1.db
                .insert(schema.commands)
                .values({
                salonId,
                cardNumber: code,
                code,
                status: 'WAITING_PAYMENT',
                clientId: subscription.clientId,
                openedAt: new Date(),
                openedById: userId,
                totalGross: delivery.totalAmount,
                totalDiscounts: '0',
                totalNet: delivery.totalAmount,
            })
                .returning();
            // Add items to command
            for (const item of items) {
                await connection_1.db.insert(schema.commandItems).values({
                    commandId: command.id,
                    type: 'PRODUCT',
                    description: item.product?.name || 'Produto',
                    referenceId: item.productId.toString(),
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: '0',
                    totalPrice: item.totalPrice,
                    addedById: userId,
                    addedAt: new Date(),
                });
            }
            // Link command to delivery
            await connection_1.db
                .update(schema.subscriptionDeliveries)
                .set({ commandId: command.id, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.id, deliveryId));
            return { commandId: command.id };
        }
        // ==================== HELPER METHODS ====================
        async createDelivery(subscriptionId, salonId, scheduledDate) {
            const subscription = await this.getSubscriptionById(subscriptionId, salonId);
            const planItems = subscription.plan?.items || [];
            // Calculate total
            let totalAmount = 0;
            for (const item of planItems) {
                if (item.product) {
                    totalAmount += parseFloat(item.product.salePrice) * parseFloat(item.quantity);
                }
            }
            // Apply discount
            const discountPercent = parseFloat(subscription.plan?.discountPercent || '0');
            totalAmount = totalAmount * (1 - discountPercent / 100);
            // Create delivery
            const [delivery] = await connection_1.db
                .insert(schema.subscriptionDeliveries)
                .values({
                subscriptionId,
                salonId,
                scheduledDate,
                status: 'PENDING',
                deliveryType: subscription.deliveryType || 'PICKUP',
                totalAmount: totalAmount.toFixed(2),
            })
                .returning();
            // Create delivery items
            for (const item of planItems) {
                if (item.product) {
                    const unitPrice = parseFloat(item.product.salePrice);
                    const quantity = parseFloat(item.quantity);
                    const itemTotal = unitPrice * quantity * (1 - discountPercent / 100);
                    await connection_1.db.insert(schema.subscriptionDeliveryItems).values({
                        deliveryId: delivery.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: unitPrice.toFixed(2),
                        totalPrice: itemTotal.toFixed(2),
                    });
                }
            }
        }
        calculateNextDeliveryDate(billingPeriod) {
            const date = new Date();
            switch (billingPeriod) {
                case 'MONTHLY':
                    date.setMonth(date.getMonth() + 1);
                    break;
                case 'BIMONTHLY':
                    date.setMonth(date.getMonth() + 2);
                    break;
                case 'QUARTERLY':
                    date.setMonth(date.getMonth() + 3);
                    break;
            }
            return date;
        }
        // ==================== STATS METHODS ====================
        async getStats(salonId) {
            const today = new Date().toISOString().split('T')[0];
            // Total plans
            const [plansResult] = await connection_1.db
                .select({ total: (0, drizzle_orm_1.sql) `count(*)`, active: (0, drizzle_orm_1.sql) `count(*) filter (where is_active = true)` })
                .from(schema.productSubscriptionPlans)
                .where((0, drizzle_orm_1.eq)(schema.productSubscriptionPlans.salonId, salonId));
            // Total subscriptions
            const [subsResult] = await connection_1.db
                .select({ total: (0, drizzle_orm_1.sql) `count(*)`, active: (0, drizzle_orm_1.sql) `count(*) filter (where status = 'ACTIVE')` })
                .from(schema.clientProductSubscriptions)
                .where((0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.salonId, salonId));
            // Pending deliveries today
            const [deliveriesResult] = await connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema.subscriptionDeliveries)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.salonId, salonId), (0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.scheduledDate, today), (0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.status, 'PENDING')));
            // Monthly recurring revenue
            const activeSubscriptions = await connection_1.db
                .select({
                finalPrice: schema.productSubscriptionPlans.finalPrice,
                billingPeriod: schema.productSubscriptionPlans.billingPeriod,
            })
                .from(schema.clientProductSubscriptions)
                .innerJoin(schema.productSubscriptionPlans, (0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.planId, schema.productSubscriptionPlans.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.salonId, salonId), (0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.status, 'ACTIVE')));
            let mrr = 0;
            for (const sub of activeSubscriptions) {
                const price = parseFloat(sub.finalPrice);
                switch (sub.billingPeriod) {
                    case 'MONTHLY':
                        mrr += price;
                        break;
                    case 'BIMONTHLY':
                        mrr += price / 2;
                        break;
                    case 'QUARTERLY':
                        mrr += price / 3;
                        break;
                }
            }
            return {
                totalPlans: Number(plansResult?.total || 0),
                activePlans: Number(plansResult?.active || 0),
                totalSubscriptions: Number(subsResult?.total || 0),
                activeSubscriptions: Number(subsResult?.active || 0),
                pendingDeliveriesToday: Number(deliveriesResult?.count || 0),
                monthlyRecurringRevenue: Math.round(mrr * 100) / 100,
            };
        }
        // ==================== JOB METHODS ====================
        async processDailyDeliveries() {
            const today = new Date().toISOString().split('T')[0];
            // Find subscriptions with delivery due today
            const subscriptions = await connection_1.db
                .select()
                .from(schema.clientProductSubscriptions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.status, 'ACTIVE'), (0, drizzle_orm_1.eq)(schema.clientProductSubscriptions.nextDeliveryDate, today)));
            for (const sub of subscriptions) {
                // Check if delivery already exists
                const [existing] = await connection_1.db
                    .select()
                    .from(schema.subscriptionDeliveries)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.subscriptionId, sub.id), (0, drizzle_orm_1.eq)(schema.subscriptionDeliveries.scheduledDate, today)));
                if (!existing) {
                    await this.createDelivery(sub.id, sub.salonId, today);
                }
            }
        }
    };
    return ProductSubscriptionsService = _classThis;
})();
exports.ProductSubscriptionsService = ProductSubscriptionsService;
//# sourceMappingURL=product-subscriptions.service.js.map