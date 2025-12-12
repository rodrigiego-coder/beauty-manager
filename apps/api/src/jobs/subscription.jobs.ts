import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { eq, lt, and, gte, sql } from 'drizzle-orm';
import { db } from '../database/connection';
import {
  salonSubscriptions,
  subscriptionInvoices,
  subscriptionEvents,
  plans,
} from '../database/schema';

@Injectable()
export class SubscriptionJobs {
  private readonly logger = new Logger(SubscriptionJobs.name);

  /**
   * Check trial expirations - runs daily at 6 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async checkTrialExpiration(): Promise<void> {
    this.logger.log('Checking trial expirations...');

    const now = new Date();

    // Find trials that have expired
    const expiredTrials = await db
      .select()
      .from(salonSubscriptions)
      .where(
        and(
          eq(salonSubscriptions.status, 'TRIALING'),
          lt(salonSubscriptions.trialEndsAt, now)
        )
      );

    for (const subscription of expiredTrials) {
      this.logger.log(`Trial expired for subscription ${subscription.id}`);

      // Update status to SUSPENDED (they need to pay)
      await db
        .update(salonSubscriptions)
        .set({
          status: 'SUSPENDED',
          updatedAt: now,
        })
        .where(eq(salonSubscriptions.id, subscription.id));

      // Log event
      await db.insert(subscriptionEvents).values({
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
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async checkOverdueInvoices(): Promise<void> {
    this.logger.log('Checking overdue invoices...');

    const now = new Date();

    // Find pending invoices that are past due date
    const overdueInvoices = await db
      .select()
      .from(subscriptionInvoices)
      .where(
        and(
          eq(subscriptionInvoices.status, 'PENDING'),
          lt(subscriptionInvoices.dueDate, now)
        )
      );

    for (const invoice of overdueInvoices) {
      this.logger.log(`Marking invoice ${invoice.invoiceNumber} as overdue`);

      await db
        .update(subscriptionInvoices)
        .set({
          status: 'OVERDUE',
          updatedAt: now,
        })
        .where(eq(subscriptionInvoices.id, invoice.id));

      // Update subscription to PAST_DUE if not already
      await db
        .update(salonSubscriptions)
        .set({
          status: 'PAST_DUE',
          updatedAt: now,
        })
        .where(
          and(
            eq(salonSubscriptions.id, invoice.subscriptionId),
            eq(salonSubscriptions.status, 'ACTIVE')
          )
        );
    }

    this.logger.log(`Marked ${overdueInvoices.length} invoices as overdue`);
  }

  /**
   * Suspend overdue subscriptions - runs daily at 8 AM
   * Suspends subscriptions that are PAST_DUE for more than 7 days
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async suspendOverdueSubscriptions(): Promise<void> {
    this.logger.log('Checking for subscriptions to suspend...');

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Find subscriptions that have been PAST_DUE for more than 7 days
    const subscriptionsToSuspend = await db
      .select()
      .from(salonSubscriptions)
      .where(
        and(
          eq(salonSubscriptions.status, 'PAST_DUE'),
          lt(salonSubscriptions.currentPeriodEnd, sevenDaysAgo)
        )
      );

    for (const subscription of subscriptionsToSuspend) {
      this.logger.log(`Suspending subscription ${subscription.id}`);

      await db
        .update(salonSubscriptions)
        .set({
          status: 'SUSPENDED',
          updatedAt: now,
        })
        .where(eq(salonSubscriptions.id, subscription.id));

      // Log event
      await db.insert(subscriptionEvents).values({
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
  @Cron('0 1 1 * *')
  async generateMonthlyInvoices(): Promise<void> {
    this.logger.log('Generating monthly invoices...');

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Find active subscriptions that need an invoice
    const subscriptions = await db
      .select({
        subscription: salonSubscriptions,
        plan: plans,
      })
      .from(salonSubscriptions)
      .innerJoin(plans, eq(salonSubscriptions.planId, plans.id))
      .where(
        and(
          eq(salonSubscriptions.status, 'ACTIVE'),
          eq(salonSubscriptions.billingPeriod, 'MONTHLY')
        )
      );

    let invoiceCount = 0;

    for (const { subscription, plan } of subscriptions) {
      // Check if invoice already exists for this period
      const existingInvoice = await db
        .select()
        .from(subscriptionInvoices)
        .where(
          and(
            eq(subscriptionInvoices.subscriptionId, subscription.id),
            gte(subscriptionInvoices.referencePeriodStart, periodStart)
          )
        )
        .limit(1);

      if (existingInvoice.length > 0) {
        continue; // Already has invoice for this month
      }

      // Generate invoice number
      const year = now.getFullYear();
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptionInvoices);
      const count = Number(countResult[0].count) + 1;
      const invoiceNumber = `INV-${year}-${String(count).padStart(6, '0')}`;

      // Due date is 5 days from now
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 5);

      // Create invoice
      const invoice = await db
        .insert(subscriptionInvoices)
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
      await db.insert(subscriptionEvents).values({
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
  @Cron('0 10 * * 0')
  async checkYearlyRenewals(): Promise<void> {
    this.logger.log('Checking yearly subscription renewals...');

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Find yearly subscriptions ending in the next 30 days
    const expiringSubscriptions = await db
      .select({
        subscription: salonSubscriptions,
        plan: plans,
      })
      .from(salonSubscriptions)
      .innerJoin(plans, eq(salonSubscriptions.planId, plans.id))
      .where(
        and(
          eq(salonSubscriptions.status, 'ACTIVE'),
          eq(salonSubscriptions.billingPeriod, 'YEARLY'),
          lt(salonSubscriptions.currentPeriodEnd, thirtyDaysFromNow),
          gte(salonSubscriptions.currentPeriodEnd, now)
        )
      );

    for (const { subscription, plan } of expiringSubscriptions) {
      // Check if renewal invoice already exists
      const existingInvoice = await db
        .select()
        .from(subscriptionInvoices)
        .where(
          and(
            eq(subscriptionInvoices.subscriptionId, subscription.id),
            gte(subscriptionInvoices.referencePeriodStart, subscription.currentPeriodEnd)
          )
        )
        .limit(1);

      if (existingInvoice.length > 0) {
        continue;
      }

      // Generate invoice for renewal
      const year = now.getFullYear();
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptionInvoices);
      const count = Number(countResult[0].count) + 1;
      const invoiceNumber = `INV-${year}-${String(count).padStart(6, '0')}`;

      const periodStart = new Date(subscription.currentPeriodEnd);
      const periodEnd = new Date(periodStart);
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);

      // Due date is 15 days before period end
      const dueDate = new Date(subscription.currentPeriodEnd);
      dueDate.setDate(dueDate.getDate() - 15);

      await db
        .insert(subscriptionInvoices)
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
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processScheduledCancellations(): Promise<void> {
    this.logger.log('Processing scheduled cancellations...');

    const now = new Date();

    // Find subscriptions scheduled to cancel
    const toCancel = await db
      .select()
      .from(salonSubscriptions)
      .where(
        and(
          eq(salonSubscriptions.cancelAtPeriodEnd, true),
          lt(salonSubscriptions.currentPeriodEnd, now)
        )
      );

    for (const subscription of toCancel) {
      await db
        .update(salonSubscriptions)
        .set({
          status: 'CANCELED',
          cancelAtPeriodEnd: false,
          canceledAt: now,
          updatedAt: now,
        })
        .where(eq(salonSubscriptions.id, subscription.id));

      await db.insert(subscriptionEvents).values({
        subscriptionId: subscription.id,
        type: 'STATUS_CHANGED',
        previousValue: subscription.status,
        newValue: 'CANCELED',
        metadata: { reason: 'scheduled_cancellation' },
      });
    }

    this.logger.log(`Processed ${toCancel.length} scheduled cancellations`);
  }
}
