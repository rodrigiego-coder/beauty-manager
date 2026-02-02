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
exports.SalonSubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
let SalonSubscriptionsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SalonSubscriptionsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SalonSubscriptionsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        /**
         * Get current subscription for a salon
         */
        async getCurrentSubscription(salonId) {
            try {
                // Primeiro busca a assinatura
                const subscriptionResult = await connection_1.db
                    .select()
                    .from(schema_1.salonSubscriptions)
                    .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.salonId, salonId))
                    .limit(1);
                // Busca contagens de uso em paralelo
                const [usersCountResult, clientsCountResult] = await Promise.all([
                    connection_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                        .from(schema_1.users)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.users.active, true))),
                    connection_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                        .from(schema_1.clients)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.clients.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.clients.active, true))),
                ]);
                const usage = {
                    usersCount: usersCountResult[0]?.count ?? 0,
                    clientsCount: clientsCountResult[0]?.count ?? 0,
                };
                if (subscriptionResult.length === 0) {
                    return { subscription: null, plan: null, limits: { users: 1, clients: 50 }, usage };
                }
                const subscription = subscriptionResult[0];
                // Depois busca o plano separadamente (evita problemas de INNER JOIN)
                let plan = null;
                if (subscription.planId) {
                    const planResult = await connection_1.db
                        .select()
                        .from(schema_1.plans)
                        .where((0, drizzle_orm_1.eq)(schema_1.plans.id, subscription.planId))
                        .limit(1);
                    plan = planResult[0] || null;
                }
                // Se não encontrar o plano, usa valores padrão
                const defaultLimits = { users: 1, clients: 50 };
                return {
                    subscription,
                    plan,
                    limits: plan
                        ? {
                            users: subscription.maxUsersOverride || plan.maxUsers,
                            clients: plan.maxClients,
                        }
                        : defaultLimits,
                    usage,
                };
            }
            catch (error) {
                // Em caso de erro no banco, retorna como se não tivesse assinatura
                console.error(`Erro ao buscar assinatura do salão ${salonId}:`, error);
                return { subscription: null, plan: null, limits: { users: 1, clients: 50 }, usage: { usersCount: 0, clientsCount: 0 } };
            }
        }
        /**
         * Start trial for a new salon
         */
        async startTrial(salonId, dto, userId) {
            // Check if subscription already exists
            const existing = await connection_1.db
                .select()
                .from(schema_1.salonSubscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.salonId, salonId))
                .limit(1);
            if (existing.length > 0) {
                throw new common_1.ConflictException('Salão já possui uma assinatura');
            }
            // Get plan
            const plan = await connection_1.db
                .select()
                .from(schema_1.plans)
                .where((0, drizzle_orm_1.eq)(schema_1.plans.id, dto.planId))
                .limit(1);
            if (plan.length === 0) {
                throw new common_1.NotFoundException('Plano não encontrado');
            }
            const trialDays = dto.trialDays || plan[0].trialDays || 14;
            const now = new Date();
            const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
            // Create subscription
            const result = await connection_1.db
                .insert(schema_1.salonSubscriptions)
                .values({
                salonId,
                planId: dto.planId,
                status: 'TRIALING',
                billingPeriod: 'MONTHLY',
                startsAt: now,
                trialEndsAt: trialEnd,
                currentPeriodStart: now,
                currentPeriodEnd: trialEnd,
            })
                .returning();
            // Log event
            await this.logEvent(result[0].id, 'CREATED', null, 'TRIALING', userId, {
                planId: dto.planId,
                trialDays,
            });
            return result[0];
        }
        /**
         * Change subscription plan
         */
        async changePlan(salonId, dto, userId) {
            const { subscription, plan: currentPlan } = await this.getCurrentSubscription(salonId);
            if (!subscription) {
                throw new common_1.NotFoundException('Assinatura não encontrada');
            }
            // Get new plan
            const newPlan = await connection_1.db
                .select()
                .from(schema_1.plans)
                .where((0, drizzle_orm_1.eq)(schema_1.plans.id, dto.newPlanId))
                .limit(1);
            if (newPlan.length === 0) {
                throw new common_1.NotFoundException('Plano não encontrado');
            }
            const now = new Date();
            const billingPeriod = dto.billingPeriod || subscription.billingPeriod;
            const periodLength = billingPeriod === 'YEARLY' ? 365 : 30;
            const newPeriodEnd = new Date(now.getTime() + periodLength * 24 * 60 * 60 * 1000);
            const oldPlanId = subscription.planId;
            // Update subscription
            const result = await connection_1.db
                .update(schema_1.salonSubscriptions)
                .set({
                planId: dto.newPlanId,
                billingPeriod,
                status: subscription.status === 'TRIALING' ? 'TRIALING' : 'ACTIVE',
                currentPeriodStart: now,
                currentPeriodEnd: newPeriodEnd,
                updatedAt: now,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.id, subscription.id))
                .returning();
            // Log event
            await this.logEvent(subscription.id, 'PLAN_CHANGED', oldPlanId, dto.newPlanId, userId, {
                billingPeriod,
                oldPlanCode: currentPlan?.code,
                newPlanCode: newPlan[0].code,
            });
            return result[0];
        }
        /**
         * Cancel subscription
         */
        async cancel(salonId, dto, userId) {
            const { subscription } = await this.getCurrentSubscription(salonId);
            if (!subscription) {
                throw new common_1.NotFoundException('Assinatura não encontrada');
            }
            if (subscription.status === 'CANCELED') {
                throw new common_1.BadRequestException('Assinatura já está cancelada');
            }
            const now = new Date();
            const cancelAtEnd = dto.cancelAtPeriodEnd !== false;
            const result = await connection_1.db
                .update(schema_1.salonSubscriptions)
                .set({
                cancelAtPeriodEnd: cancelAtEnd,
                canceledAt: cancelAtEnd ? null : now,
                status: cancelAtEnd ? subscription.status : 'CANCELED',
                notes: dto.reason ? `Motivo: ${dto.reason}` : subscription.notes,
                updatedAt: now,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.id, subscription.id))
                .returning();
            // Log event
            await this.logEvent(subscription.id, 'CANCELED', subscription.status, 'CANCELED', userId, {
                cancelAtPeriodEnd: cancelAtEnd,
                reason: dto.reason,
            });
            return result[0];
        }
        /**
         * Reactivate a canceled subscription
         */
        async reactivate(salonId, _dto, userId) {
            const { subscription } = await this.getCurrentSubscription(salonId);
            if (!subscription) {
                throw new common_1.NotFoundException('Assinatura não encontrada');
            }
            if (subscription.status !== 'CANCELED' && !subscription.cancelAtPeriodEnd) {
                throw new common_1.BadRequestException('Assinatura não está cancelada');
            }
            const now = new Date();
            const periodLength = subscription.billingPeriod === 'YEARLY' ? 365 : 30;
            const newPeriodEnd = new Date(now.getTime() + periodLength * 24 * 60 * 60 * 1000);
            const result = await connection_1.db
                .update(schema_1.salonSubscriptions)
                .set({
                status: 'ACTIVE',
                cancelAtPeriodEnd: false,
                canceledAt: null,
                currentPeriodStart: now,
                currentPeriodEnd: newPeriodEnd,
                updatedAt: now,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.id, subscription.id))
                .returning();
            // Log event
            await this.logEvent(subscription.id, 'REACTIVATED', 'CANCELED', 'ACTIVE', userId);
            return result[0];
        }
        /**
         * Get invoices for a salon
         */
        async getInvoices(salonId, filters) {
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.salonId, salonId)];
            if (filters?.status) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.status, filters.status));
            }
            if (filters?.startDate) {
                conditions.push((0, drizzle_orm_1.gte)(schema_1.subscriptionInvoices.dueDate, filters.startDate));
            }
            if (filters?.endDate) {
                conditions.push((0, drizzle_orm_1.lte)(schema_1.subscriptionInvoices.dueDate, filters.endDate));
            }
            const result = await connection_1.db
                .select()
                .from(schema_1.subscriptionInvoices)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.subscriptionInvoices.createdAt));
            return result;
        }
        /**
         * Get invoice by ID
         */
        async getInvoiceById(invoiceId, salonId) {
            const result = await connection_1.db
                .select()
                .from(schema_1.subscriptionInvoices)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.id, invoiceId), (0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.salonId, salonId)))
                .limit(1);
            if (result.length === 0) {
                throw new common_1.NotFoundException('Fatura não encontrada');
            }
            return result[0];
        }
        /**
         * Create invoice for subscription
         */
        async createInvoice(subscriptionId, salonId, amount, periodStart, periodEnd) {
            // Generate invoice number
            const year = new Date().getFullYear();
            const countResult = await connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.subscriptionInvoices);
            const count = Number(countResult[0].count) + 1;
            const invoiceNumber = `INV-${year}-${String(count).padStart(6, '0')}`;
            // Due date is 5 days from now
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 5);
            const result = await connection_1.db
                .insert(schema_1.subscriptionInvoices)
                .values({
                subscriptionId,
                salonId,
                invoiceNumber,
                referencePeriodStart: periodStart,
                referencePeriodEnd: periodEnd,
                dueDate,
                totalAmount: String(amount),
                status: 'PENDING',
            })
                .returning();
            // Log event
            await this.logEvent(subscriptionId, 'INVOICE_CREATED', null, invoiceNumber, null, {
                amount,
                dueDate,
            });
            return result[0];
        }
        /**
         * Initiate payment for invoice
         */
        async initiatePayment(invoiceId, salonId, dto) {
            const invoice = await this.getInvoiceById(invoiceId, salonId);
            if (invoice.status === 'PAID') {
                throw new common_1.BadRequestException('Fatura já está paga');
            }
            if (invoice.status === 'CANCELED') {
                throw new common_1.BadRequestException('Fatura cancelada');
            }
            // For now, simulate payment initiation
            // In production, this would call MercadoPago API
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 min expiration
            if (dto.method === 'PIX') {
                // Generate mock PIX data (replace with real MP integration)
                const pixCode = `00020126580014br.gov.bcb.pix0136${invoice.id}520400005303986540${invoice.totalAmount}5802BR`;
                const pixQrCodeBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='; // Placeholder
                const updated = await connection_1.db
                    .update(schema_1.subscriptionInvoices)
                    .set({
                    paymentMethod: 'PIX',
                    pixQrCode: pixCode,
                    pixQrCodeBase64,
                    pixExpiresAt: expiresAt,
                    updatedAt: now,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.id, invoiceId))
                    .returning();
                return {
                    invoice: updated[0],
                    pixData: {
                        qrCode: pixCode,
                        qrCodeBase64: pixQrCodeBase64,
                        expiresAt,
                    },
                };
            }
            // For card payments, would redirect to checkout
            return {
                invoice,
                checkoutUrl: `/checkout/${invoiceId}`,
            };
        }
        /**
         * Mark invoice as paid (called from webhook or manually)
         */
        async markInvoiceAsPaid(invoiceId, paymentData) {
            const result = await connection_1.db
                .select()
                .from(schema_1.subscriptionInvoices)
                .where((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.id, invoiceId))
                .limit(1);
            if (result.length === 0) {
                throw new common_1.NotFoundException('Fatura não encontrada');
            }
            const invoice = result[0];
            const now = new Date();
            // Update invoice
            const updated = await connection_1.db
                .update(schema_1.subscriptionInvoices)
                .set({
                status: 'PAID',
                paidAt: now,
                mercadoPagoPaymentId: paymentData?.mercadoPagoPaymentId,
                updatedAt: now,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.id, invoiceId))
                .returning();
            // Create payment record
            await connection_1.db.insert(schema_1.invoicePayments).values({
                invoiceId,
                amount: paymentData?.amount ? String(paymentData.amount) : invoice.totalAmount,
                method: paymentData?.method || invoice.paymentMethod || 'MANUAL',
                status: 'CONFIRMED',
                paidAt: now,
                mercadoPagoPaymentId: paymentData?.mercadoPagoPaymentId,
            });
            // Activate subscription if in trial or past_due
            const subscription = await connection_1.db
                .select()
                .from(schema_1.salonSubscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.id, invoice.subscriptionId))
                .limit(1);
            if (subscription.length > 0) {
                const sub = subscription[0];
                if (sub.status === 'TRIALING' || sub.status === 'PAST_DUE') {
                    const periodEnd = new Date(now);
                    if (sub.billingPeriod === 'YEARLY') {
                        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
                    }
                    else {
                        periodEnd.setMonth(periodEnd.getMonth() + 1);
                    }
                    await connection_1.db
                        .update(schema_1.salonSubscriptions)
                        .set({
                        status: 'ACTIVE',
                        currentPeriodStart: now,
                        currentPeriodEnd: periodEnd,
                        updatedAt: now,
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.id, sub.id));
                    // Log event
                    await this.logEvent(sub.id, 'INVOICE_PAID', 'PENDING', 'PAID', null, {
                        invoiceId,
                        amount: invoice.totalAmount,
                    });
                }
            }
            return updated[0];
        }
        /**
         * Check subscription validity
         */
        async isSubscriptionValid(salonId) {
            const { subscription } = await this.getCurrentSubscription(salonId);
            if (!subscription) {
                return {
                    valid: false,
                    status: 'NO_SUBSCRIPTION',
                    daysRemaining: 0,
                    message: 'Nenhuma assinatura encontrada',
                    canAccess: false,
                };
            }
            const now = new Date();
            const periodEnd = new Date(subscription.currentPeriodEnd);
            const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            switch (subscription.status) {
                case 'ACTIVE':
                    if (subscription.cancelAtPeriodEnd) {
                        return {
                            valid: true,
                            status: 'ACTIVE_CANCELING',
                            daysRemaining: Math.max(0, daysRemaining),
                            message: `Assinatura será cancelada em ${periodEnd.toLocaleDateString('pt-BR')}`,
                            canAccess: true,
                        };
                    }
                    return {
                        valid: true,
                        status: 'ACTIVE',
                        daysRemaining: Math.max(0, daysRemaining),
                        message: 'Assinatura ativa',
                        canAccess: true,
                    };
                case 'TRIALING':
                    const trialEnd = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : periodEnd;
                    const trialDaysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    if (trialDaysRemaining > 0) {
                        return {
                            valid: true,
                            status: 'TRIALING',
                            daysRemaining: trialDaysRemaining,
                            message: `Período de teste: ${trialDaysRemaining} dias restantes`,
                            canAccess: true,
                        };
                    }
                    return {
                        valid: false,
                        status: 'TRIAL_EXPIRED',
                        daysRemaining: 0,
                        message: 'Período de teste expirado',
                        canAccess: false,
                    };
                case 'PAST_DUE':
                    // 7 day grace period
                    const graceEnd = new Date(periodEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
                    const graceDaysRemaining = Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    if (graceDaysRemaining > 0) {
                        return {
                            valid: true,
                            status: 'PAST_DUE',
                            daysRemaining: graceDaysRemaining,
                            message: `Pagamento pendente. ${graceDaysRemaining} dias para regularizar`,
                            canAccess: true,
                        };
                    }
                    return {
                        valid: false,
                        status: 'PAST_DUE_EXPIRED',
                        daysRemaining: 0,
                        message: 'Conta suspensa por falta de pagamento',
                        canAccess: false,
                    };
                case 'SUSPENDED':
                    return {
                        valid: false,
                        status: 'SUSPENDED',
                        daysRemaining: 0,
                        message: 'Assinatura suspensa',
                        canAccess: false,
                    };
                case 'CANCELED':
                    if (daysRemaining > 0) {
                        return {
                            valid: true,
                            status: 'CANCELED',
                            daysRemaining,
                            message: `Assinatura cancelada. Acesso até ${periodEnd.toLocaleDateString('pt-BR')}`,
                            canAccess: true,
                        };
                    }
                    return {
                        valid: false,
                        status: 'CANCELED',
                        daysRemaining: 0,
                        message: 'Assinatura cancelada e expirada',
                        canAccess: false,
                    };
                default:
                    return {
                        valid: false,
                        status: 'UNKNOWN',
                        daysRemaining: 0,
                        message: 'Status desconhecido',
                        canAccess: false,
                    };
            }
        }
        /**
         * Log subscription event
         */
        async logEvent(subscriptionId, type, previousValue, newValue, performedById, metadata) {
            await connection_1.db.insert(schema_1.subscriptionEvents).values({
                subscriptionId,
                type,
                previousValue: previousValue ? String(previousValue) : null,
                newValue: newValue ? String(newValue) : null,
                performedById: performedById || null,
                metadata: metadata || {},
            });
        }
        /**
         * Get subscription events
         */
        async getEvents(subscriptionId) {
            return connection_1.db
                .select()
                .from(schema_1.subscriptionEvents)
                .where((0, drizzle_orm_1.eq)(schema_1.subscriptionEvents.subscriptionId, subscriptionId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.subscriptionEvents.createdAt));
        }
        /**
         * Update subscription status (for jobs)
         */
        async updateStatus(subscriptionId, newStatus) {
            const result = await connection_1.db
                .select()
                .from(schema_1.salonSubscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.id, subscriptionId))
                .limit(1);
            if (result.length === 0)
                return;
            const subscription = result[0];
            const oldStatus = subscription.status;
            await connection_1.db
                .update(schema_1.salonSubscriptions)
                .set({
                status: newStatus,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.id, subscriptionId));
            await this.logEvent(subscriptionId, 'STATUS_CHANGED', oldStatus, newStatus);
        }
        /**
         * Get all subscriptions (for admin)
         */
        async findAll(filters) {
            const conditions = [];
            if (filters?.status) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.status, filters.status));
            }
            if (filters?.planId) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.planId, filters.planId));
            }
            const result = await connection_1.db
                .select({
                subscription: schema_1.salonSubscriptions,
                plan: schema_1.plans,
                salon: schema_1.salons,
            })
                .from(schema_1.salonSubscriptions)
                .innerJoin(schema_1.plans, (0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.planId, schema_1.plans.id))
                .innerJoin(schema_1.salons, (0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.salonId, schema_1.salons.id))
                .where(conditions.length ? (0, drizzle_orm_1.and)(...conditions) : undefined)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.salonSubscriptions.createdAt));
            return result;
        }
        /**
         * Get all invoices (for admin)
         */
        async findAllInvoices(filters) {
            const conditions = [];
            if (filters?.status) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.status, filters.status));
            }
            if (filters?.salonId) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.salonId, filters.salonId));
            }
            const result = await connection_1.db
                .select({
                invoice: schema_1.subscriptionInvoices,
                salon: schema_1.salons,
            })
                .from(schema_1.subscriptionInvoices)
                .innerJoin(schema_1.salons, (0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.salonId, schema_1.salons.id))
                .where(conditions.length ? (0, drizzle_orm_1.and)(...conditions) : undefined)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.subscriptionInvoices.createdAt));
            return result;
        }
    };
    return SalonSubscriptionsService = _classThis;
})();
exports.SalonSubscriptionsService = SalonSubscriptionsService;
//# sourceMappingURL=salon-subscriptions.service.js.map