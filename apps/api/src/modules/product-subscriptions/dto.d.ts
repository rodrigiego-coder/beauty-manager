export declare class CreatePlanItemDto {
    productId: number;
    quantity?: number;
}
export declare class CreatePlanDto {
    name: string;
    description?: string;
    billingPeriod: string;
    discountPercent?: number;
    imageUrl?: string;
    benefits?: string[];
    maxSubscribers?: number;
    items: CreatePlanItemDto[];
}
export declare class UpdatePlanDto {
    name?: string;
    description?: string;
    billingPeriod?: string;
    discountPercent?: number;
    imageUrl?: string;
    benefits?: string[];
    maxSubscribers?: number;
    isActive?: boolean;
}
export declare class AddPlanItemDto {
    productId: number;
    quantity?: number;
}
export declare class SubscribeDto {
    deliveryType: string;
    deliveryAddress?: string;
    paymentMethod: string;
    startDate: string;
    notes?: string;
}
export declare class UpdateSubscriptionDto {
    deliveryType?: string;
    deliveryAddress?: string;
    paymentMethod?: string;
    notes?: string;
}
export declare class PauseSubscriptionDto {
    reason?: string;
}
export declare class CancelSubscriptionDto {
    reason?: string;
}
export declare class UpdateDeliveryStatusDto {
    status: string;
    notes?: string;
}
export interface PlanResponse {
    id: string;
    salonId: string;
    name: string;
    description: string | null;
    billingPeriod: string;
    /** Alias for billingPeriod (frontend compatibility) */
    frequency: string;
    originalPrice: string;
    discountPercent: string | null;
    finalPrice: string;
    isActive: boolean | null;
    maxSubscribers: number | null;
    currentSubscribers: number | null;
    imageUrl: string | null;
    benefits: string[] | null;
    items?: PlanItemResponse[];
    createdAt: Date;
    updatedAt: Date;
}
export interface PlanItemResponse {
    id: string;
    planId: string;
    productId: number;
    quantity: string;
    product?: {
        id: number;
        name: string;
        salePrice: string;
    } | null;
}
export interface SubscriptionResponse {
    id: string;
    salonId: string;
    clientId: string;
    planId: string;
    status: string;
    deliveryType: string | null;
    deliveryAddress: string | null;
    startDate: string;
    nextDeliveryDate: string;
    lastDeliveryDate: string | null;
    totalDeliveries: number | null;
    paymentMethod: string | null;
    notes: string | null;
    pausedAt: Date | null;
    pauseReason: string | null;
    cancelledAt: Date | null;
    cancelReason: string | null;
    plan?: PlanResponse;
    client?: {
        id: string;
        name: string | null;
        phone: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface DeliveryResponse {
    id: string;
    subscriptionId: string;
    salonId: string;
    scheduledDate: string;
    deliveredDate: string | null;
    status: string;
    deliveryType: string;
    commandId: string | null;
    totalAmount: string;
    notes: string | null;
    subscription?: SubscriptionResponse;
    items?: DeliveryItemResponse[];
    createdAt: Date;
    updatedAt: Date;
}
export interface DeliveryItemResponse {
    id: string;
    deliveryId: string;
    productId: number;
    quantity: string;
    unitPrice: string;
    totalPrice: string;
    product?: {
        id: number;
        name: string;
    } | null;
}
export interface SubscriptionStats {
    totalPlans: number;
    activePlans: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    pendingDeliveriesToday: number;
    monthlyRecurringRevenue: number;
}
//# sourceMappingURL=dto.d.ts.map