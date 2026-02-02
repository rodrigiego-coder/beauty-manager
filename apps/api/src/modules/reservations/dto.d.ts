export declare class CreateReservationDto {
    clientId: string;
    items: ReservationItemDto[];
    deliveryType: string;
    deliveryAddress?: string;
    scheduledDate?: string;
    notes?: string;
}
export declare class ReservationItemDto {
    productId: number;
    quantity?: number;
}
export declare class UpdateReservationDto {
    deliveryType?: string;
    deliveryAddress?: string;
    scheduledDate?: string;
    notes?: string;
}
export declare class UpdateReservationStatusDto {
    status: string;
    notes?: string;
}
export interface ReservationItemResponse {
    id: string;
    reservationId: string;
    productId: number;
    quantity: string;
    unitPrice: string;
    totalPrice: string;
    product?: {
        id: number;
        name: string;
        sku: string | null;
    } | null;
}
export interface ReservationResponse {
    id: string;
    salonId: string;
    clientId: string;
    status: string;
    deliveryType: string;
    deliveryAddress: string | null;
    scheduledDate: string | null;
    totalAmount: string;
    commandId: string | null;
    notes: string | null;
    confirmedAt: Date | null;
    readyAt: Date | null;
    deliveredAt: Date | null;
    cancelledAt: Date | null;
    cancelReason: string | null;
    items?: ReservationItemResponse[];
    client?: {
        id: string;
        name: string | null;
        phone: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface ReservationStatsResponse {
    totalReservations: number;
    pendingReservations: number;
    confirmedReservations: number;
    readyReservations: number;
    deliveredReservations: number;
    cancelledReservations: number;
    totalRevenue: number;
    averageValue: number;
    byDeliveryType: {
        type: string;
        count: number;
        revenue: number;
    }[];
}
//# sourceMappingURL=dto.d.ts.map