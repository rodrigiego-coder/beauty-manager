import { CreatePlanDto, UpdatePlanDto, AddPlanItemDto, SubscribeDto, UpdateSubscriptionDto, PauseSubscriptionDto, CancelSubscriptionDto, UpdateDeliveryStatusDto, PlanResponse, SubscriptionResponse, DeliveryResponse, SubscriptionStats } from './dto';
export declare class ProductSubscriptionsService {
    getPlans(salonId: string): Promise<PlanResponse[]>;
    getPlanById(planId: string, salonId: string): Promise<PlanResponse>;
    getPlanItems(planId: string): Promise<{
        id: string;
        planId: string;
        productId: number;
        quantity: string;
        product: {
            id: number;
            name: string;
            salePrice: string;
        } | null;
    }[]>;
    createPlan(salonId: string, dto: CreatePlanDto): Promise<PlanResponse>;
    updatePlan(planId: string, salonId: string, dto: UpdatePlanDto): Promise<PlanResponse>;
    deletePlan(planId: string, salonId: string): Promise<void>;
    addPlanItem(planId: string, salonId: string, dto: AddPlanItemDto): Promise<PlanResponse>;
    removePlanItem(planId: string, itemId: string, salonId: string): Promise<PlanResponse>;
    private recalculatePlanPrices;
    getAvailablePlans(salonId: string): Promise<PlanResponse[]>;
    getSubscriptions(salonId: string, clientId?: string): Promise<SubscriptionResponse[]>;
    getSubscriptionById(subscriptionId: string, salonId: string): Promise<SubscriptionResponse>;
    subscribe(salonId: string, clientId: string, planId: string, dto: SubscribeDto): Promise<SubscriptionResponse>;
    updateSubscription(subscriptionId: string, salonId: string, dto: UpdateSubscriptionDto): Promise<SubscriptionResponse>;
    pauseSubscription(subscriptionId: string, salonId: string, dto: PauseSubscriptionDto): Promise<SubscriptionResponse>;
    resumeSubscription(subscriptionId: string, salonId: string): Promise<SubscriptionResponse>;
    cancelSubscription(subscriptionId: string, salonId: string, dto: CancelSubscriptionDto): Promise<SubscriptionResponse>;
    getDeliveries(salonId: string, filters?: {
        date?: string;
        status?: string;
    }): Promise<DeliveryResponse[]>;
    getPendingDeliveries(salonId: string): Promise<DeliveryResponse[]>;
    getSubscriptionDeliveries(subscriptionId: string, salonId: string): Promise<DeliveryResponse[]>;
    getDeliveryItems(deliveryId: string): Promise<{
        id: string;
        deliveryId: string;
        productId: number;
        quantity: string;
        unitPrice: string;
        totalPrice: string;
        product: {
            id: number;
            name: string;
        } | null;
    }[]>;
    updateDeliveryStatus(deliveryId: string, salonId: string, dto: UpdateDeliveryStatusDto, userId?: string): Promise<DeliveryResponse>;
    generateCommand(deliveryId: string, salonId: string, userId: string): Promise<{
        commandId: string;
    }>;
    private createDelivery;
    private calculateNextDeliveryDate;
    getStats(salonId: string): Promise<SubscriptionStats>;
    processDailyDeliveries(): Promise<void>;
}
//# sourceMappingURL=product-subscriptions.service.d.ts.map