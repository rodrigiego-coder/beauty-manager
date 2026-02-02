"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionJobs = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const is_jest_1 = require("../common/is-jest");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../database/connection");
const schema_1 = require("../database/schema");
let SubscriptionJobs = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _checkTrialExpiration_decorators;
    let _checkOverdueInvoices_decorators;
    let _suspendOverdueSubscriptions_decorators;
    let _generateMonthlyInvoices_decorators;
    let _checkYearlyRenewals_decorators;
    let _processScheduledCancellations_decorators;
    var SubscriptionJobs = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _checkTrialExpiration_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_6AM, { disabled: is_jest_1.IS_JEST })];
            _checkOverdueInvoices_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_7AM, { disabled: is_jest_1.IS_JEST })];
            _suspendOverdueSubscriptions_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_8AM, { disabled: is_jest_1.IS_JEST })];
            _generateMonthlyInvoices_decorators = [(0, schedule_1.Cron)('0 1 1 * *', { disabled: is_jest_1.IS_JEST })];
            _checkYearlyRenewals_decorators = [(0, schedule_1.Cron)('0 10 * * 0', { disabled: is_jest_1.IS_JEST })];
            _processScheduledCancellations_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT, { disabled: is_jest_1.IS_JEST })];
            __esDecorate(this, null, _checkTrialExpiration_decorators, { kind: "method", name: "checkTrialExpiration", static: false, private: false, access: { has: obj => "checkTrialExpiration" in obj, get: obj => obj.checkTrialExpiration }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkOverdueInvoices_decorators, { kind: "method", name: "checkOverdueInvoices", static: false, private: false, access: { has: obj => "checkOverdueInvoices" in obj, get: obj => obj.checkOverdueInvoices }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _suspendOverdueSubscriptions_decorators, { kind: "method", name: "suspendOverdueSubscriptions", static: false, private: false, access: { has: obj => "suspendOverdueSubscriptions" in obj, get: obj => obj.suspendOverdueSubscriptions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _generateMonthlyInvoices_decorators, { kind: "method", name: "generateMonthlyInvoices", static: false, private: false, access: { has: obj => "generateMonthlyInvoices" in obj, get: obj => obj.generateMonthlyInvoices }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkYearlyRenewals_decorators, { kind: "method", name: "checkYearlyRenewals", static: false, private: false, access: { has: obj => "checkYearlyRenewals" in obj, get: obj => obj.checkYearlyRenewals }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _processScheduledCancellations_decorators, { kind: "method", name: "processScheduledCancellations", static: false, private: false, access: { has: obj => "processScheduledCancellations" in obj, get: obj => obj.processScheduledCancellations }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SubscriptionJobs = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = (__runInitializers(this, _instanceExtraInitializers), new common_1.Logger(SubscriptionJobs.name));
        /**
         * Check trial expirations - runs daily at 6 AM
         */
        async checkTrialExpiration() {
            this.logger.log('Checking trial expirations...');
            const now = new Date();
            // Find trials that have expired
            const expiredTrials = await connection_1.db
                .select()
                .from(schema_1.salonSubscriptions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.status, 'TRIALING'), (0, drizzle_orm_1.lt)(schema_1.salonSubscriptions.trialEndsAt, now)));
            for (const subscription of expiredTrials) {
                this.logger.log(`Trial expired for subscription ${subscription.id}`);
                // Update status to SUSPENDED (they need to pay)
                await connection_1.db
                    .update(schema_1.salonSubscriptions)
                    .set({
                    status: 'SUSPENDED',
                    updatedAt: now,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.id, subscription.id));
                // Log event
                await connection_1.db.insert(schema_1.subscriptionEvents).values({
                    subscriptionId: subscription.id,
                    type: 'STATUS_CHANGED',
                    previousValue: 'TRIALING',
                    newValue: 'SUSPENDED',
                    metadata: { reason: 'trial_expired' },
                });
            }
            this.logger.log(`Processed ${expiredTrials.length} expired trials`);
        }
        /**
         * Check overdue invoices - runs daily at 7 AM
         */
        async checkOverdueInvoices() {
            this.logger.log('Checking overdue invoices...');
            const now = new Date();
            // Find pending invoices that are past due date
            const overdueInvoices = await connection_1.db
                .select()
                .from(schema_1.subscriptionInvoices)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.status, 'PENDING'), (0, drizzle_orm_1.lt)(schema_1.subscriptionInvoices.dueDate, now)));
            for (const invoice of overdueInvoices) {
                this.logger.log(`Marking invoice ${invoice.invoiceNumber} as overdue`);
                await connection_1.db
                    .update(schema_1.subscriptionInvoices)
                    .set({
                    status: 'OVERDUE',
                    updatedAt: now,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.id, invoice.id));
                // Update subscription to PAST_DUE if not already
                await connection_1.db
                    .update(schema_1.salonSubscriptions)
                    .set({
                    status: 'PAST_DUE',
                    updatedAt: now,
                })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.id, invoice.subscriptionId), (0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.status, 'ACTIVE')));
            }
            this.logger.log(`Marked ${overdueInvoices.length} invoices as overdue`);
        }
        /**
         * Suspend overdue subscriptions - runs daily at 8 AM
         * Suspends subscriptions that are PAST_DUE for more than 7 days
         */
        async suspendOverdueSubscriptions() {
            this.logger.log('Checking for subscriptions to suspend...');
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            // Find subscriptions that have been PAST_DUE for more than 7 days
            const subscriptionsToSuspend = await connection_1.db
                .select()
                .from(schema_1.salonSubscriptions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.status, 'PAST_DUE'), (0, drizzle_orm_1.lt)(schema_1.salonSubscriptions.currentPeriodEnd, sevenDaysAgo)));
            for (const subscription of subscriptionsToSuspend) {
                this.logger.log(`Suspending subscription ${subscription.id}`);
                await connection_1.db
                    .update(schema_1.salonSubscriptions)
                    .set({
                    status: 'SUSPENDED',
                    updatedAt: now,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.id, subscription.id));
                // Log event
                await connection_1.db.insert(schema_1.subscriptionEvents).values({
                    subscriptionId: subscription.id,
                    type: 'SUSPENDED',
                    previousValue: 'PAST_DUE',
                    newValue: 'SUSPENDED',
                    metadata: { reason: 'overdue_payment' },
                });
            }
            this.logger.log(`Suspended ${subscriptionsToSuspend.length} subscriptions`);
        }
        /**
         * Generate monthly invoices - runs on the 1st of each month at 1 AM
         */
        async generateMonthlyInvoices() {
            this.logger.log('Generating monthly invoices...');
            const now = new Date();
            const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            // Find active subscriptions that need an invoice
            const subscriptions = await connection_1.db
                .select({
                subscription: schema_1.salonSubscriptions,
                plan: schema_1.plans,
            })
                .from(schema_1.salonSubscriptions)
                .innerJoin(schema_1.plans, (0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.planId, schema_1.plans.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.status, 'ACTIVE'), (0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.billingPeriod, 'MONTHLY')));
            let invoiceCount = 0;
            for (const { subscription, plan } of subscriptions) {
                // Check if invoice already exists for this period
                const existingInvoice = await connection_1.db
                    .select()
                    .from(schema_1.subscriptionInvoices)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.subscriptionId, subscription.id), (0, drizzle_orm_1.gte)(schema_1.subscriptionInvoices.referencePeriodStart, periodStart)))
                    .limit(1);
                if (existingInvoice.length > 0) {
                    continue; // Already has invoice for this month
                }
                // Generate invoice number
                const year = now.getFullYear();
                const countResult = await connection_1.db
                    .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                    .from(schema_1.subscriptionInvoices);
                const count = Number(countResult[0].count) + 1;
                const invoiceNumber = `INV-${year}-${String(count).padStart(6, '0')}`;
                // Due date is 5 days from now
                const dueDate = new Date(now);
                dueDate.setDate(dueDate.getDate() + 5);
                // Create invoice
                const invoice = await connection_1.db
                    .insert(schema_1.subscriptionInvoices)
                    .values({
                    subscriptionId: subscription.id,
                    salonId: subscription.salonId,
                    invoiceNumber,
                    referencePeriodStart: periodStart,
                    referencePeriodEnd: periodEnd,
                    dueDate,
                    totalAmount: plan.priceMonthly,
                    status: 'PENDING',
                })
                    .returning();
                // Log event
                await connection_1.db.insert(schema_1.subscriptionEvents).values({
                    subscriptionId: subscription.id,
                    type: 'INVOICE_CREATED',
                    newValue: invoiceNumber,
                    metadata: {
                        invoiceId: invoice[0].id,
                        amount: plan.priceMonthly,
                    },
                });
                invoiceCount++;
            }
            this.logger.log(`Generated ${invoiceCount} monthly invoices`);
        }
        /**
         * Check for subscriptions ending soon (for yearly subscriptions) - runs weekly on Sunday at 10 AM
         */
        async checkYearlyRenewals() {
            this.logger.log('Checking yearly subscription renewals...');
            const now = new Date();
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            // Find yearly subscriptions ending in the next 30 days
            const expiringSubscriptions = await connection_1.db
                .select({
                subscription: schema_1.salonSubscriptions,
                plan: schema_1.plans,
            })
                .from(schema_1.salonSubscriptions)
                .innerJoin(schema_1.plans, (0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.planId, schema_1.plans.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.status, 'ACTIVE'), (0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.billingPeriod, 'YEARLY'), (0, drizzle_orm_1.lt)(schema_1.salonSubscriptions.currentPeriodEnd, thirtyDaysFromNow), (0, drizzle_orm_1.gte)(schema_1.salonSubscriptions.currentPeriodEnd, now)));
            for (const { subscription, plan } of expiringSubscriptions) {
                // Check if renewal invoice already exists
                const existingInvoice = await connection_1.db
                    .select()
                    .from(schema_1.subscriptionInvoices)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.subscriptionId, subscription.id), (0, drizzle_orm_1.gte)(schema_1.subscriptionInvoices.referencePeriodStart, subscription.currentPeriodEnd)))
                    .limit(1);
                if (existingInvoice.length > 0) {
                    continue;
                }
                // Generate invoice for renewal
                const year = now.getFullYear();
                const countResult = await connection_1.db
                    .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                    .from(schema_1.subscriptionInvoices);
                const count = Number(countResult[0].count) + 1;
                const invoiceNumber = `INV-${year}-${String(count).padStart(6, '0')}`;
                const periodStart = new Date(subscription.currentPeriodEnd);
                const periodEnd = new Date(periodStart);
                periodEnd.setFullYear(periodEnd.getFullYear() + 1);
                // Due date is 15 days before period end
                const dueDate = new Date(subscription.currentPeriodEnd);
                dueDate.setDate(dueDate.getDate() - 15);
                await connection_1.db
                    .insert(schema_1.subscriptionInvoices)
                    .values({
                    subscriptionId: subscription.id,
                    salonId: subscription.salonId,
                    invoiceNumber,
                    referencePeriodStart: periodStart,
                    referencePeriodEnd: periodEnd,
                    dueDate,
                    totalAmount: plan.priceYearly || String(parseFloat(plan.priceMonthly) * 12),
                    status: 'PENDING',
                });
                this.logger.log(`Created renewal invoice ${invoiceNumber} for subscription ${subscription.id}`);
            }
        }
        /**
         * Process canceled subscriptions at period end - runs daily at midnight
         */
        async processScheduledCancellations() {
            this.logger.log('Processing scheduled cancellations...');
            const now = new Date();
            // Find subscriptions scheduled to cancel
            const toCancel = await connection_1.db
                .select()
                .from(schema_1.salonSubscriptions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.cancelAtPeriodEnd, true), (0, drizzle_orm_1.lt)(schema_1.salonSubscriptions.currentPeriodEnd, now)));
            for (const subscription of toCancel) {
                await connection_1.db
                    .update(schema_1.salonSubscriptions)
                    .set({
                    status: 'CANCELED',
                    cancelAtPeriodEnd: false,
                    canceledAt: now,
                    updatedAt: now,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.id, subscription.id));
                await connection_1.db.insert(schema_1.subscriptionEvents).values({
                    subscriptionId: subscription.id,
                    type: 'STATUS_CHANGED',
                    previousValue: subscription.status,
                    newValue: 'CANCELED',
                    metadata: { reason: 'scheduled_cancellation' },
                });
            }
            this.logger.log(`Processed ${toCancel.length} scheduled cancellations`);
        }
    };
    return SubscriptionJobs = _classThis;
})();
exports.SubscriptionJobs = SubscriptionJobs;
//# sourceMappingURL=subscription.jobs.js.map