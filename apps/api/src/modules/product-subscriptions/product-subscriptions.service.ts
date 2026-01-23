import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../database/connection';
import * as schema from '../../database/schema';
import {
  CreatePlanDto,
  UpdatePlanDto,
  AddPlanItemDto,
  SubscribeDto,
  UpdateSubscriptionDto,
  PauseSubscriptionDto,
  CancelSubscriptionDto,
  UpdateDeliveryStatusDto,
  PlanResponse,
  SubscriptionResponse,
  DeliveryResponse,
  SubscriptionStats,
} from './dto';

@Injectable()
export class ProductSubscriptionsService {
  // ==================== PLAN METHODS ====================

  async getPlans(salonId: string): Promise<PlanResponse[]> {
    const plans = await db
      .select()
      .from(schema.productSubscriptionPlans)
      .where(eq(schema.productSubscriptionPlans.salonId, salonId))
      .orderBy(desc(schema.productSubscriptionPlans.createdAt));

    // Get items for each plan
    const plansWithItems = await Promise.all(
      plans.map(async (plan) => {
        const items = await this.getPlanItems(plan.id);
        return {
          ...plan,
          frequency: plan.billingPeriod || 'MONTHLY',
          items,
        };
      })
    );

    return plansWithItems;
  }

  async getPlanById(planId: string, salonId: string): Promise<PlanResponse> {
    const [plan] = await db
      .select()
      .from(schema.productSubscriptionPlans)
      .where(
        and(
          eq(schema.productSubscriptionPlans.id, planId),
          eq(schema.productSubscriptionPlans.salonId, salonId)
        )
      );

    if (!plan) {
      throw new NotFoundException('Plano nao encontrado');
    }

    const items = await this.getPlanItems(planId);
    return {
      ...plan,
      frequency: plan.billingPeriod || 'MONTHLY',
      items,
    };
  }

  async getPlanItems(planId: string) {
    const items = await db
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
      .leftJoin(schema.products, eq(schema.productSubscriptionItems.productId, schema.products.id))
      .where(eq(schema.productSubscriptionItems.planId, planId));

    return items;
  }

  async createPlan(salonId: string, dto: CreatePlanDto): Promise<PlanResponse> {
    // Calculate prices based on items
    let originalPrice = 0;

    for (const item of dto.items) {
      const [product] = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, item.productId));

      if (!product) {
        throw new BadRequestException(`Produto ${item.productId} nao encontrado`);
      }

      originalPrice += parseFloat(product.salePrice) * (item.quantity || 1);
    }

    const discountPercent = dto.discountPercent || 0;
    const finalPrice = originalPrice * (1 - discountPercent / 100);

    // Create plan
    const [plan] = await db
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
      await db.insert(schema.productSubscriptionItems).values({
        planId: plan.id,
        productId: item.productId,
        quantity: (item.quantity || 1).toString(),
      });
    }

    return this.getPlanById(plan.id, salonId);
  }

  async updatePlan(planId: string, salonId: string, dto: UpdatePlanDto): Promise<PlanResponse> {
    const existing = await this.getPlanById(planId, salonId);

    // Recalculate prices if discount changed
    let finalPrice = parseFloat(existing.finalPrice);
    if (dto.discountPercent !== undefined) {
      const originalPrice = parseFloat(existing.originalPrice);
      finalPrice = originalPrice * (1 - dto.discountPercent / 100);
    }

    await db
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
      .where(eq(schema.productSubscriptionPlans.id, planId));

    return this.getPlanById(planId, salonId);
  }

  async deletePlan(planId: string, salonId: string): Promise<void> {
    const plan = await this.getPlanById(planId, salonId);

    if ((plan.currentSubscribers || 0) > 0) {
      // Just deactivate if has subscribers
      await db
        .update(schema.productSubscriptionPlans)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(schema.productSubscriptionPlans.id, planId));
    } else {
      // Delete items first
      await db
        .delete(schema.productSubscriptionItems)
        .where(eq(schema.productSubscriptionItems.planId, planId));

      // Delete plan
      await db
        .delete(schema.productSubscriptionPlans)
        .where(eq(schema.productSubscriptionPlans.id, planId));
    }
  }

  async addPlanItem(planId: string, salonId: string, dto: AddPlanItemDto): Promise<PlanResponse> {
    await this.getPlanById(planId, salonId);

    const [product] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, dto.productId));

    if (!product) {
      throw new BadRequestException('Produto nao encontrado');
    }

    await db.insert(schema.productSubscriptionItems).values({
      planId,
      productId: dto.productId,
      quantity: (dto.quantity || 1).toString(),
    });

    // Recalculate prices
    await this.recalculatePlanPrices(planId);

    return this.getPlanById(planId, salonId);
  }

  async removePlanItem(planId: string, itemId: string, salonId: string): Promise<PlanResponse> {
    await this.getPlanById(planId, salonId);

    await db
      .delete(schema.productSubscriptionItems)
      .where(eq(schema.productSubscriptionItems.id, itemId));

    // Recalculate prices
    await this.recalculatePlanPrices(planId);

    return this.getPlanById(planId, salonId);
  }

  private async recalculatePlanPrices(planId: string): Promise<void> {
    const items = await this.getPlanItems(planId);

    let originalPrice = 0;
    for (const item of items) {
      if (item.product) {
        originalPrice += parseFloat(item.product.salePrice) * parseFloat(item.quantity);
      }
    }

    const [plan] = await db
      .select()
      .from(schema.productSubscriptionPlans)
      .where(eq(schema.productSubscriptionPlans.id, planId));

    const discountPercent = parseFloat(plan.discountPercent || '0');
    const finalPrice = originalPrice * (1 - discountPercent / 100);

    await db
      .update(schema.productSubscriptionPlans)
      .set({
        originalPrice: originalPrice.toFixed(2),
        finalPrice: finalPrice.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(schema.productSubscriptionPlans.id, planId));
  }

  // ==================== SUBSCRIPTION METHODS ====================

  async getAvailablePlans(salonId: string): Promise<PlanResponse[]> {
    const plans = await db
      .select()
      .from(schema.productSubscriptionPlans)
      .where(
        and(
          eq(schema.productSubscriptionPlans.salonId, salonId),
          eq(schema.productSubscriptionPlans.isActive, true)
        )
      )
      .orderBy(schema.productSubscriptionPlans.name);

    const plansWithItems = await Promise.all(
      plans.map(async (plan) => {
        const items = await this.getPlanItems(plan.id);
        return {
          ...plan,
          frequency: plan.billingPeriod || 'MONTHLY',
          items,
        };
      })
    );

    // Filter out plans that are full
    return plansWithItems.filter(
      (plan) =>
        !plan.maxSubscribers || (plan.currentSubscribers || 0) < plan.maxSubscribers
    );
  }

  async getSubscriptions(salonId: string, clientId?: string): Promise<SubscriptionResponse[]> {
    const conditions = [eq(schema.clientProductSubscriptions.salonId, salonId)];

    if (clientId) {
      conditions.push(eq(schema.clientProductSubscriptions.clientId, clientId));
    }

    const subscriptions = await db
      .select()
      .from(schema.clientProductSubscriptions)
      .where(and(...conditions))
      .orderBy(desc(schema.clientProductSubscriptions.createdAt));

    // Enrich with plan and client data
    const enriched = await Promise.all(
      subscriptions.map(async (sub) => {
        const plan = await this.getPlanById(sub.planId, salonId).catch(() => null);
        const [client] = await db
          .select({ id: schema.clients.id, name: schema.clients.name, phone: schema.clients.phone })
          .from(schema.clients)
          .where(eq(schema.clients.id, sub.clientId));

        return {
          ...sub,
          plan: plan || undefined,
          client: client || undefined,
        };
      })
    );

    return enriched;
  }

  async getSubscriptionById(subscriptionId: string, salonId: string): Promise<SubscriptionResponse> {
    const [subscription] = await db
      .select()
      .from(schema.clientProductSubscriptions)
      .where(
        and(
          eq(schema.clientProductSubscriptions.id, subscriptionId),
          eq(schema.clientProductSubscriptions.salonId, salonId)
        )
      );

    if (!subscription) {
      throw new NotFoundException('Assinatura nao encontrada');
    }

    const plan = await this.getPlanById(subscription.planId, salonId).catch(() => null);
    const [client] = await db
      .select({ id: schema.clients.id, name: schema.clients.name, phone: schema.clients.phone })
      .from(schema.clients)
      .where(eq(schema.clients.id, subscription.clientId));

    return {
      ...subscription,
      plan: plan || undefined,
      client: client || undefined,
    };
  }

  async subscribe(
    salonId: string,
    clientId: string,
    planId: string,
    dto: SubscribeDto
  ): Promise<SubscriptionResponse> {
    // Validate plan
    const plan = await this.getPlanById(planId, salonId);

    if (!plan.isActive) {
      throw new BadRequestException('Plano nao esta ativo');
    }

    if (plan.maxSubscribers && (plan.currentSubscribers || 0) >= plan.maxSubscribers) {
      throw new BadRequestException('Plano atingiu o limite de assinantes');
    }

    // Check if client already has active subscription for this plan
    const [existing] = await db
      .select()
      .from(schema.clientProductSubscriptions)
      .where(
        and(
          eq(schema.clientProductSubscriptions.clientId, clientId),
          eq(schema.clientProductSubscriptions.planId, planId),
          eq(schema.clientProductSubscriptions.status, 'ACTIVE')
        )
      );

    if (existing) {
      throw new BadRequestException('Cliente ja possui assinatura ativa deste plano');
    }

    // Validate delivery address if delivery type
    if (dto.deliveryType === 'DELIVERY' && !dto.deliveryAddress) {
      throw new BadRequestException('Endereco de entrega e obrigatorio');
    }

    // Create subscription
    const startDate = new Date(dto.startDate);
    const nextDeliveryDate = new Date(dto.startDate);

    const [subscription] = await db
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
    await db
      .update(schema.productSubscriptionPlans)
      .set({
        currentSubscribers: sql`${schema.productSubscriptionPlans.currentSubscribers} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(schema.productSubscriptionPlans.id, planId));

    // Create first delivery
    await this.createDelivery(subscription.id, salonId, nextDeliveryDate.toISOString().split('T')[0]);

    return this.getSubscriptionById(subscription.id, salonId);
  }

  async updateSubscription(
    subscriptionId: string,
    salonId: string,
    dto: UpdateSubscriptionDto
  ): Promise<SubscriptionResponse> {
    const subscription = await this.getSubscriptionById(subscriptionId, salonId);

    if (subscription.status !== 'ACTIVE') {
      throw new BadRequestException('Assinatura nao esta ativa');
    }

    await db
      .update(schema.clientProductSubscriptions)
      .set({
        deliveryType: dto.deliveryType ?? subscription.deliveryType,
        deliveryAddress: dto.deliveryAddress ?? subscription.deliveryAddress,
        paymentMethod: dto.paymentMethod ?? subscription.paymentMethod,
        notes: dto.notes ?? subscription.notes,
        updatedAt: new Date(),
      })
      .where(eq(schema.clientProductSubscriptions.id, subscriptionId));

    return this.getSubscriptionById(subscriptionId, salonId);
  }

  async pauseSubscription(
    subscriptionId: string,
    salonId: string,
    dto: PauseSubscriptionDto
  ): Promise<SubscriptionResponse> {
    const subscription = await this.getSubscriptionById(subscriptionId, salonId);

    if (subscription.status !== 'ACTIVE') {
      throw new BadRequestException('Assinatura nao esta ativa');
    }

    await db
      .update(schema.clientProductSubscriptions)
      .set({
        status: 'PAUSED',
        pausedAt: new Date(),
        pauseReason: dto.reason,
        updatedAt: new Date(),
      })
      .where(eq(schema.clientProductSubscriptions.id, subscriptionId));

    // Cancel pending deliveries
    await db
      .update(schema.subscriptionDeliveries)
      .set({ status: 'CANCELLED', updatedAt: new Date() })
      .where(
        and(
          eq(schema.subscriptionDeliveries.subscriptionId, subscriptionId),
          eq(schema.subscriptionDeliveries.status, 'PENDING')
        )
      );

    return this.getSubscriptionById(subscriptionId, salonId);
  }

  async resumeSubscription(subscriptionId: string, salonId: string): Promise<SubscriptionResponse> {
    const subscription = await this.getSubscriptionById(subscriptionId, salonId);

    if (subscription.status !== 'PAUSED') {
      throw new BadRequestException('Assinatura nao esta pausada');
    }

    // Calculate next delivery date
    const nextDeliveryDate = this.calculateNextDeliveryDate(subscription.plan!.billingPeriod);

    await db
      .update(schema.clientProductSubscriptions)
      .set({
        status: 'ACTIVE',
        pausedAt: null,
        pauseReason: null,
        nextDeliveryDate: nextDeliveryDate.toISOString().split('T')[0],
        updatedAt: new Date(),
      })
      .where(eq(schema.clientProductSubscriptions.id, subscriptionId));

    // Create next delivery
    await this.createDelivery(subscriptionId, salonId, nextDeliveryDate.toISOString().split('T')[0]);

    return this.getSubscriptionById(subscriptionId, salonId);
  }

  async cancelSubscription(
    subscriptionId: string,
    salonId: string,
    dto: CancelSubscriptionDto
  ): Promise<SubscriptionResponse> {
    const subscription = await this.getSubscriptionById(subscriptionId, salonId);

    if (subscription.status === 'CANCELLED') {
      throw new BadRequestException('Assinatura ja esta cancelada');
    }

    await db
      .update(schema.clientProductSubscriptions)
      .set({
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: dto.reason,
        updatedAt: new Date(),
      })
      .where(eq(schema.clientProductSubscriptions.id, subscriptionId));

    // Decrement subscriber count
    await db
      .update(schema.productSubscriptionPlans)
      .set({
        currentSubscribers: sql`GREATEST(${schema.productSubscriptionPlans.currentSubscribers} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(schema.productSubscriptionPlans.id, subscription.planId));

    // Cancel pending deliveries
    await db
      .update(schema.subscriptionDeliveries)
      .set({ status: 'CANCELLED', updatedAt: new Date() })
      .where(
        and(
          eq(schema.subscriptionDeliveries.subscriptionId, subscriptionId),
          eq(schema.subscriptionDeliveries.status, 'PENDING')
        )
      );

    return this.getSubscriptionById(subscriptionId, salonId);
  }

  // ==================== DELIVERY METHODS ====================

  async getDeliveries(salonId: string, filters?: { date?: string; status?: string }): Promise<DeliveryResponse[]> {
    const conditions = [eq(schema.subscriptionDeliveries.salonId, salonId)];

    if (filters?.date) {
      conditions.push(eq(schema.subscriptionDeliveries.scheduledDate, filters.date));
    }

    if (filters?.status) {
      conditions.push(eq(schema.subscriptionDeliveries.status, filters.status));
    }

    const deliveries = await db
      .select()
      .from(schema.subscriptionDeliveries)
      .where(and(...conditions))
      .orderBy(schema.subscriptionDeliveries.scheduledDate);

    // Enrich with subscription and items
    const enriched = await Promise.all(
      deliveries.map(async (delivery) => {
        const subscription = await this.getSubscriptionById(delivery.subscriptionId, salonId).catch(() => null);
        const items = await this.getDeliveryItems(delivery.id);
        return { ...delivery, subscription: subscription || undefined, items };
      })
    );

    return enriched;
  }

  async getPendingDeliveries(salonId: string): Promise<DeliveryResponse[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getDeliveries(salonId, { date: today, status: 'PENDING' });
  }

  async getSubscriptionDeliveries(subscriptionId: string, salonId: string): Promise<DeliveryResponse[]> {
    const deliveries = await db
      .select()
      .from(schema.subscriptionDeliveries)
      .where(
        and(
          eq(schema.subscriptionDeliveries.subscriptionId, subscriptionId),
          eq(schema.subscriptionDeliveries.salonId, salonId)
        )
      )
      .orderBy(desc(schema.subscriptionDeliveries.scheduledDate));

    const enriched = await Promise.all(
      deliveries.map(async (delivery) => {
        const items = await this.getDeliveryItems(delivery.id);
        return { ...delivery, items };
      })
    );

    return enriched;
  }

  async getDeliveryItems(deliveryId: string) {
    const items = await db
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
      .leftJoin(schema.products, eq(schema.subscriptionDeliveryItems.productId, schema.products.id))
      .where(eq(schema.subscriptionDeliveryItems.deliveryId, deliveryId));

    return items;
  }

  async updateDeliveryStatus(
    deliveryId: string,
    salonId: string,
    dto: UpdateDeliveryStatusDto,
    userId?: string
  ): Promise<DeliveryResponse> {
    const [delivery] = await db
      .select()
      .from(schema.subscriptionDeliveries)
      .where(
        and(
          eq(schema.subscriptionDeliveries.id, deliveryId),
          eq(schema.subscriptionDeliveries.salonId, salonId)
        )
      );

    if (!delivery) {
      throw new NotFoundException('Entrega nao encontrada');
    }

    const updates: any = {
      status: dto.status,
      notes: dto.notes ?? delivery.notes,
      updatedAt: new Date(),
    };

    if (dto.status === 'PREPARING' && userId) {
      updates.preparedById = userId;
    }

    if (dto.status === 'DELIVERED') {
      updates.deliveredDate = new Date().toISOString().split('T')[0];
      if (userId) updates.deliveredById = userId;

      // Update subscription
      const subscription = await this.getSubscriptionById(delivery.subscriptionId, salonId);
      const nextDeliveryDate = this.calculateNextDeliveryDate(subscription.plan!.billingPeriod);

      await db
        .update(schema.clientProductSubscriptions)
        .set({
          lastDeliveryDate: new Date().toISOString().split('T')[0],
          nextDeliveryDate: nextDeliveryDate.toISOString().split('T')[0],
          totalDeliveries: sql`${schema.clientProductSubscriptions.totalDeliveries} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(schema.clientProductSubscriptions.id, delivery.subscriptionId));

      // Schedule next delivery
      await this.createDelivery(
        delivery.subscriptionId,
        salonId,
        nextDeliveryDate.toISOString().split('T')[0]
      );
    }

    await db
      .update(schema.subscriptionDeliveries)
      .set(updates)
      .where(eq(schema.subscriptionDeliveries.id, deliveryId));

    const items = await this.getDeliveryItems(deliveryId);
    const [updated] = await db
      .select()
      .from(schema.subscriptionDeliveries)
      .where(eq(schema.subscriptionDeliveries.id, deliveryId));

    return { ...updated, items };
  }

  async generateCommand(deliveryId: string, salonId: string, userId: string): Promise<{ commandId: string }> {
    const [delivery] = await db
      .select()
      .from(schema.subscriptionDeliveries)
      .where(
        and(
          eq(schema.subscriptionDeliveries.id, deliveryId),
          eq(schema.subscriptionDeliveries.salonId, salonId)
        )
      );

    if (!delivery) {
      throw new NotFoundException('Entrega nao encontrada');
    }

    if (delivery.commandId) {
      return { commandId: delivery.commandId };
    }

    const subscription = await this.getSubscriptionById(delivery.subscriptionId, salonId);
    const items = await this.getDeliveryItems(deliveryId);

    // Create command
    const code = `SUB-${Date.now().toString(36).toUpperCase()}`;
    const [command] = await db
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
      await db.insert(schema.commandItems).values({
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
    await db
      .update(schema.subscriptionDeliveries)
      .set({ commandId: command.id, updatedAt: new Date() })
      .where(eq(schema.subscriptionDeliveries.id, deliveryId));

    return { commandId: command.id };
  }

  // ==================== HELPER METHODS ====================

  private async createDelivery(subscriptionId: string, salonId: string, scheduledDate: string): Promise<void> {
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
    const [delivery] = await db
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

        await db.insert(schema.subscriptionDeliveryItems).values({
          deliveryId: delivery.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          totalPrice: itemTotal.toFixed(2),
        });
      }
    }
  }

  private calculateNextDeliveryDate(billingPeriod: string): Date {
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

  async getStats(salonId: string): Promise<SubscriptionStats> {
    const today = new Date().toISOString().split('T')[0];

    // Total plans
    const [plansResult] = await db
      .select({ total: sql<number>`count(*)`, active: sql<number>`count(*) filter (where is_active = true)` })
      .from(schema.productSubscriptionPlans)
      .where(eq(schema.productSubscriptionPlans.salonId, salonId));

    // Total subscriptions
    const [subsResult] = await db
      .select({ total: sql<number>`count(*)`, active: sql<number>`count(*) filter (where status = 'ACTIVE')` })
      .from(schema.clientProductSubscriptions)
      .where(eq(schema.clientProductSubscriptions.salonId, salonId));

    // Pending deliveries today
    const [deliveriesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.subscriptionDeliveries)
      .where(
        and(
          eq(schema.subscriptionDeliveries.salonId, salonId),
          eq(schema.subscriptionDeliveries.scheduledDate, today),
          eq(schema.subscriptionDeliveries.status, 'PENDING')
        )
      );

    // Monthly recurring revenue
    const activeSubscriptions = await db
      .select({
        finalPrice: schema.productSubscriptionPlans.finalPrice,
        billingPeriod: schema.productSubscriptionPlans.billingPeriod,
      })
      .from(schema.clientProductSubscriptions)
      .innerJoin(
        schema.productSubscriptionPlans,
        eq(schema.clientProductSubscriptions.planId, schema.productSubscriptionPlans.id)
      )
      .where(
        and(
          eq(schema.clientProductSubscriptions.salonId, salonId),
          eq(schema.clientProductSubscriptions.status, 'ACTIVE')
        )
      );

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

  async processDailyDeliveries(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Find subscriptions with delivery due today
    const subscriptions = await db
      .select()
      .from(schema.clientProductSubscriptions)
      .where(
        and(
          eq(schema.clientProductSubscriptions.status, 'ACTIVE'),
          eq(schema.clientProductSubscriptions.nextDeliveryDate, today)
        )
      );

    for (const sub of subscriptions) {
      // Check if delivery already exists
      const [existing] = await db
        .select()
        .from(schema.subscriptionDeliveries)
        .where(
          and(
            eq(schema.subscriptionDeliveries.subscriptionId, sub.id),
            eq(schema.subscriptionDeliveries.scheduledDate, today)
          )
        );

      if (!existing) {
        await this.createDelivery(sub.id, sub.salonId, today);
      }
    }
  }
}
