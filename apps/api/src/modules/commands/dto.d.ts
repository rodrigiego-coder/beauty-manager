export declare enum CommandStatus {
    OPEN = "OPEN",
    IN_SERVICE = "IN_SERVICE",
    WAITING_PAYMENT = "WAITING_PAYMENT",
    CLOSED = "CLOSED",
    CANCELED = "CANCELED"
}
export declare enum CommandItemType {
    SERVICE = "SERVICE",
    PRODUCT = "PRODUCT"
}
export declare enum PaymentMethod {
    CASH = "CASH",
    CARD_CREDIT = "CARD_CREDIT",
    CARD_DEBIT = "CARD_DEBIT",
    PIX = "PIX",
    VOUCHER = "VOUCHER",
    TRANSFER = "TRANSFER",
    OTHER = "OTHER"
}
export declare class OpenCommandDto {
    cardNumber?: string;
    clientId?: string;
    notes?: string;
}
export declare class AddItemDto {
    type: CommandItemType;
    description: string;
    quantity?: number;
    unitPrice: number;
    discount?: number;
    performerId?: string;
    referenceId?: string;
    variantId?: string;
}
export declare class UpdateItemDto {
    quantity?: number;
    unitPrice?: number;
    discount?: number;
    performerId?: string;
}
export declare class RemoveItemDto {
    reason?: string;
}
export declare class ApplyDiscountDto {
    discountAmount: number;
    reason?: string;
}
export declare class AddPaymentDto {
    method?: PaymentMethod;
    paymentMethodId?: string;
    paymentDestinationId?: string;
    amount: number;
    notes?: string;
}
export declare class ReopenCommandDto {
    reason: string;
}
export declare class AddNoteDto {
    note: string;
}
export declare class LinkClientDto {
    clientId: string;
}
//# sourceMappingURL=dto.d.ts.map