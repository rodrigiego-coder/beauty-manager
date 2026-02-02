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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
let AdminService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdminService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        subscriptionsService;
        auditService;
        constructor(subscriptionsService, auditService) {
            this.subscriptionsService = subscriptionsService;
            this.auditService = auditService;
        }
        /**
         * Get admin dashboard metrics
         */
        async getDashboardMetrics() {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            // Total salons
            const totalSalonsResult = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.salons);
            const totalSalons = totalSalonsResult[0].count;
            // Active salons
            const activeSalonsResult = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.salons)
                .where((0, drizzle_orm_1.eq)(schema_1.salons.active, true));
            const activeSalons = activeSalonsResult[0].count;
            // Active subscriptions
            const activeSubsResult = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.salonSubscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.status, 'ACTIVE'));
            const activeSubscriptions = activeSubsResult[0].count;
            // Trialing salons
            const trialingResult = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.salonSubscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.status, 'TRIALING'));
            const trialingSalons = trialingResult[0].count;
            // Suspended salons
            const suspendedResult = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.salonSubscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.status, 'SUSPENDED'));
            const suspendedSalons = suspendedResult[0].count;
            // MRR calculation (sum of monthly revenue from active subscriptions)
            const mrrResult = await connection_1.db
                .select({
                total: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${schema_1.salonSubscriptions.billingPeriod} = 'MONTHLY' THEN ${schema_1.plans.priceMonthly}::numeric ELSE ${schema_1.plans.priceYearly}::numeric / 12 END), 0)`,
            })
                .from(schema_1.salonSubscriptions)
                .innerJoin(schema_1.plans, (0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.planId, schema_1.plans.id))
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.status, 'ACTIVE'));
            const mrr = Number(mrrResult[0]?.total || 0);
            // Pending invoices count
            const pendingInvoicesResult = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.subscriptionInvoices)
                .where((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.status, 'PENDING'));
            const pendingInvoices = pendingInvoicesResult[0].count;
            // Overdue invoices count
            const overdueInvoicesResult = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.subscriptionInvoices)
                .where((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.status, 'OVERDUE'));
            const overdueInvoices = overdueInvoicesResult[0].count;
            // Revenue this month (paid invoices)
            const revenueResult = await connection_1.db
                .select({
                total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.subscriptionInvoices.totalAmount}::numeric), 0)`,
            })
                .from(schema_1.subscriptionInvoices)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.status, 'PAID'), (0, drizzle_orm_1.gte)(schema_1.subscriptionInvoices.paidAt, startOfMonth), (0, drizzle_orm_1.lte)(schema_1.subscriptionInvoices.paidAt, endOfMonth)));
            const revenueThisMonth = Number(revenueResult[0]?.total || 0);
            return {
                totalSalons,
                activeSalons,
                activeSubscriptions,
                trialingSalons,
                suspendedSalons,
                mrr,
                arr: mrr * 12,
                churnRate: totalSalons > 0 ? (suspendedSalons / totalSalons) * 100 : 0,
                pendingInvoices,
                overdueInvoices,
                revenueThisMonth,
            };
        }
        /**
         * List all salons with subscription info
         */
        async listSalons(filters) {
            const conditions = [];
            if (filters?.status === 'active') {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.salons.active, true));
            }
            else if (filters?.status === 'inactive') {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.salons.active, false));
            }
            const result = await connection_1.db
                .select({
                salon: schema_1.salons,
                subscription: schema_1.salonSubscriptions,
                plan: schema_1.plans,
            })
                .from(schema_1.salons)
                .leftJoin(schema_1.salonSubscriptions, (0, drizzle_orm_1.eq)(schema_1.salons.id, schema_1.salonSubscriptions.salonId))
                .leftJoin(schema_1.plans, (0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.planId, schema_1.plans.id))
                .where(conditions.length ? (0, drizzle_orm_1.and)(...conditions) : undefined)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.salons.createdAt));
            // Filter by search if provided
            if (filters?.search) {
                const search = filters.search.toLowerCase();
                return result.filter((r) => r.salon.name.toLowerCase().includes(search) ||
                    r.salon.email?.toLowerCase().includes(search));
            }
            return result;
        }
        /**
         * Get salon details with full subscription info
         */
        async getSalonDetails(salonId) {
            const result = await connection_1.db
                .select({
                salon: schema_1.salons,
                subscription: schema_1.salonSubscriptions,
                plan: schema_1.plans,
            })
                .from(schema_1.salons)
                .leftJoin(schema_1.salonSubscriptions, (0, drizzle_orm_1.eq)(schema_1.salons.id, schema_1.salonSubscriptions.salonId))
                .leftJoin(schema_1.plans, (0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.planId, schema_1.plans.id))
                .where((0, drizzle_orm_1.eq)(schema_1.salons.id, salonId))
                .limit(1);
            if (result.length === 0) {
                throw new common_1.NotFoundException('Salão não encontrado');
            }
            // Get users count
            const usersResult = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.salonId, salonId));
            // Get invoices
            const invoices = await connection_1.db
                .select()
                .from(schema_1.subscriptionInvoices)
                .where((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.salonId, salonId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.subscriptionInvoices.createdAt))
                .limit(10);
            // Get events
            let events = [];
            if (result[0].subscription) {
                events = await connection_1.db
                    .select()
                    .from(schema_1.subscriptionEvents)
                    .where((0, drizzle_orm_1.eq)(schema_1.subscriptionEvents.subscriptionId, result[0].subscription.id))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.subscriptionEvents.createdAt))
                    .limit(20);
            }
            return {
                ...result[0],
                usersCount: usersResult[0].count,
                invoices,
                events,
            };
        }
        /**
         * Suspend a salon's subscription
         */
        async suspendSalon(salonId, reason, adminUserId, ipAddress) {
            const subscription = await connection_1.db
                .select()
                .from(schema_1.salonSubscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.salonId, salonId))
                .limit(1);
            if (subscription.length === 0) {
                throw new common_1.NotFoundException('Assinatura não encontrada');
            }
            const previousStatus = subscription[0].status;
            await connection_1.db
                .update(schema_1.salonSubscriptions)
                .set({
                status: 'SUSPENDED',
                notes: reason || 'Suspenso pelo administrador',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.id, subscription[0].id));
            // Log event
            await connection_1.db.insert(schema_1.subscriptionEvents).values({
                subscriptionId: subscription[0].id,
                type: 'SUSPENDED',
                previousValue: previousStatus,
                newValue: 'SUSPENDED',
                metadata: { reason },
            });
            // Registra no audit log
            if (adminUserId) {
                await this.auditService.log({
                    userId: adminUserId,
                    salonId,
                    action: 'UPDATE',
                    entity: 'salon_subscriptions',
                    entityId: subscription[0].id,
                    oldValues: { status: previousStatus },
                    newValues: { status: 'SUSPENDED', reason },
                    ipAddress,
                });
            }
        }
        /**
         * Activate a salon's subscription
         */
        async activateSalon(salonId, adminUserId, ipAddress) {
            const subscription = await connection_1.db
                .select()
                .from(schema_1.salonSubscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.salonId, salonId))
                .limit(1);
            if (subscription.length === 0) {
                throw new common_1.NotFoundException('Assinatura não encontrada');
            }
            const previousStatus = subscription[0].status;
            const now = new Date();
            const periodEnd = new Date(now);
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            await connection_1.db
                .update(schema_1.salonSubscriptions)
                .set({
                status: 'ACTIVE',
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                updatedAt: now,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.id, subscription[0].id));
            // Log event
            await connection_1.db.insert(schema_1.subscriptionEvents).values({
                subscriptionId: subscription[0].id,
                type: 'REACTIVATED',
                previousValue: previousStatus,
                newValue: 'ACTIVE',
            });
            // Registra no audit log
            if (adminUserId) {
                await this.auditService.log({
                    userId: adminUserId,
                    salonId,
                    action: 'UPDATE',
                    entity: 'salon_subscriptions',
                    entityId: subscription[0].id,
                    oldValues: { status: previousStatus },
                    newValues: { status: 'ACTIVE' },
                    ipAddress,
                });
            }
        }
        /**
         * Update subscription manually
         */
        async updateSubscription(salonId, data) {
            const subscription = await connection_1.db
                .select()
                .from(schema_1.salonSubscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.salonId, salonId))
                .limit(1);
            if (subscription.length === 0) {
                throw new common_1.NotFoundException('Assinatura não encontrada');
            }
            const updateData = { updatedAt: new Date() };
            if (data.planId)
                updateData.planId = data.planId;
            if (data.status)
                updateData.status = data.status;
            if (data.billingPeriod)
                updateData.billingPeriod = data.billingPeriod;
            if (data.notes !== undefined)
                updateData.notes = data.notes;
            await connection_1.db
                .update(schema_1.salonSubscriptions)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.id, subscription[0].id));
        }
        /**
         * List all subscriptions
         */
        async listSubscriptions(filters) {
            return this.subscriptionsService.findAll(filters);
        }
        /**
         * List all invoices
         */
        async listInvoices(filters) {
            return this.subscriptionsService.findAllInvoices(filters);
        }
        /**
         * Mark invoice as paid manually
         */
        async markInvoiceAsPaid(invoiceId) {
            await this.subscriptionsService.markInvoiceAsPaid(invoiceId, {
                method: 'MANUAL',
            });
        }
        /**
         * Get all subscription events
         */
        async listEvents(filters) {
            const conditions = [];
            if (filters?.type) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.subscriptionEvents.type, filters.type));
            }
            if (filters?.subscriptionId) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.subscriptionEvents.subscriptionId, filters.subscriptionId));
            }
            const result = await connection_1.db
                .select({
                event: schema_1.subscriptionEvents,
                subscription: schema_1.salonSubscriptions,
                salon: schema_1.salons,
            })
                .from(schema_1.subscriptionEvents)
                .innerJoin(schema_1.salonSubscriptions, (0, drizzle_orm_1.eq)(schema_1.subscriptionEvents.subscriptionId, schema_1.salonSubscriptions.id))
                .innerJoin(schema_1.salons, (0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.salonId, schema_1.salons.id))
                .where(conditions.length ? (0, drizzle_orm_1.and)(...conditions) : undefined)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.subscriptionEvents.createdAt))
                .limit(100);
            return result;
        }
    };
    return AdminService = _classThis;
})();
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map