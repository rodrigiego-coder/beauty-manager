export declare class CartLinkItemDto {
    type: string;
    itemId: number;
    quantity?: number;
    discount?: number;
}
export declare class CreateCartLinkDto {
    clientId?: string;
    clientPhone?: string;
    clientName?: string;
    source: string;
    message?: string;
    expiresAt?: string;
    items: CartLinkItemDto[];
}
export declare class UpdateCartLinkDto {
    message?: string;
    expiresAt?: string;
    items?: CartLinkItemDto[];
    isActive?: boolean;
}
export declare class ConvertCartLinkDto {
    clientId?: string;
    clientName?: string;
    clientPhone?: string;
    deliveryType: string;
    deliveryAddress?: string;
    paymentMethod: string;
    notes?: string;
}
export interface CartLinkItemResponse {
    type: string;
    itemId: number;
    name: string;
    originalPrice: number;
    discount: number;
    finalPrice: number;
    quantity: number;
}
export interface CartLinkResponse {
    id: string;
    salonId: string;
    code: string;
    clientId: string | null;
    clientPhone: string | null;
    clientName: string | null;
    source: string;
    status: string;
    items: CartLinkItemResponse[];
    message: string | null;
    totalOriginalPrice: string;
    totalDiscount: string;
    totalFinalPrice: string;
    viewCount: number;
    lastViewedAt: Date | null;
    convertedAt: Date | null;
    commandId: string | null;
    expiresAt: Date | null;
    publicUrl: string;
    createdAt: Date;
    updatedAt: Date;
    salon?: {
        id: string;
        name: string;
        phone: string | null;
        address: string | null;
    };
}
export interface CartLinkViewResponse {
    id: string;
    linkId: string;
    viewedAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    referrer: string | null;
}
export interface CartLinkStatsResponse {
    totalLinks: number;
    activeLinks: number;
    convertedLinks: number;
    expiredLinks: number;
    conversionRate: number;
    totalViews: number;
    totalRevenue: number;
    bySource: {
        source: string;
        count: number;
        converted: number;
        revenue: number;
    }[];
}
//# sourceMappingURL=dto.d.ts.map