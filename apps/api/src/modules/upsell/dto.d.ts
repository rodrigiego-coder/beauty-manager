export declare class CreateUpsellRuleDto {
    name: string;
    triggerType: string;
    triggerServiceIds?: number[];
    triggerProductIds?: number[];
    triggerHairTypes?: string[];
    recommendedProducts?: {
        productId: number;
        discount: number;
        reason: string;
    }[];
    recommendedServices?: {
        serviceId: number;
        discount: number;
        reason: string;
    }[];
    displayMessage?: string;
    discountPercent?: number;
    validFrom?: string;
    validUntil?: string;
    maxUsesTotal?: number;
    maxUsesPerClient?: number;
    priority?: number;
}
export declare class UpdateUpsellRuleDto {
    name?: string;
    triggerType?: string;
    triggerServiceIds?: number[];
    triggerProductIds?: number[];
    triggerHairTypes?: string[];
    recommendedProducts?: {
        productId: number;
        discount: number;
        reason: string;
    }[];
    recommendedServices?: {
        serviceId: number;
        discount: number;
        reason: string;
    }[];
    displayMessage?: string;
    discountPercent?: number;
    validFrom?: string;
    validUntil?: string;
    maxUsesTotal?: number;
    maxUsesPerClient?: number;
    priority?: number;
    isActive?: boolean;
}
export declare class AcceptOfferDto {
    commandId?: string;
}
export interface UpsellRuleResponse {
    id: string;
    salonId: string;
    name: string;
    triggerType: string;
    triggerServiceIds: number[];
    triggerProductIds: number[];
    triggerHairTypes: string[];
    recommendedProducts: {
        productId: number;
        discount: number;
        reason: string;
    }[];
    recommendedServices: {
        serviceId: number;
        discount: number;
        reason: string;
    }[];
    displayMessage: string | null;
    discountPercent: string | null;
    validFrom: string | null;
    validUntil: string | null;
    maxUsesTotal: number | null;
    maxUsesPerClient: number | null;
    currentUses: number | null;
    isActive: boolean | null;
    priority: number | null;
    conversionRate?: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface UpsellOfferResponse {
    id: string;
    salonId: string;
    ruleId: string;
    clientId: string | null;
    appointmentId: string | null;
    commandId: string | null;
    status: string;
    offeredProducts: {
        productId: number;
        name: string;
        originalPrice: number;
        discountedPrice: number;
    }[];
    offeredServices: {
        serviceId: number;
        name: string;
        originalPrice: number;
        discountedPrice: number;
    }[];
    totalOriginalPrice: string;
    totalDiscountedPrice: string;
    savings: number;
    acceptedAt: Date | null;
    declinedAt: Date | null;
    expiresAt: Date | null;
    rule?: UpsellRuleResponse;
    createdAt: Date;
}
export interface UpsellStatsResponse {
    totalRules: number;
    activeRules: number;
    totalOffers: number;
    acceptedOffers: number;
    declinedOffers: number;
    conversionRate: number;
    totalRevenue: number;
    averageDiscount: number;
}
//# sourceMappingURL=dto.d.ts.map