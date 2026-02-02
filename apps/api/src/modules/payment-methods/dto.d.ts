export declare const PAYMENT_METHOD_TYPES: readonly ["CASH", "PIX", "CARD_CREDIT", "CARD_DEBIT", "TRANSFER", "VOUCHER", "OTHER"];
export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];
export declare const FEE_TYPES: readonly ["DISCOUNT", "FEE"];
export type FeeType = (typeof FEE_TYPES)[number];
export declare const FEE_MODES: readonly ["PERCENT", "FIXED"];
export type FeeMode = (typeof FEE_MODES)[number];
export declare class CreatePaymentMethodDto {
    name: string;
    type: PaymentMethodType;
    feeType?: FeeType;
    feeMode?: FeeMode;
    feeValue?: number;
    sortOrder?: number;
}
export declare class UpdatePaymentMethodDto {
    name?: string;
    type?: PaymentMethodType;
    feeType?: FeeType | null;
    feeMode?: FeeMode | null;
    feeValue?: number;
    sortOrder?: number;
    active?: boolean;
}
//# sourceMappingURL=dto.d.ts.map