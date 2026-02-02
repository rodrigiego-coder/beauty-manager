export declare const PAYMENT_DESTINATION_TYPES: readonly ["BANK", "CARD_MACHINE", "CASH_DRAWER", "OTHER"];
export type PaymentDestinationType = (typeof PAYMENT_DESTINATION_TYPES)[number];
export declare const FEE_TYPES: readonly ["DISCOUNT", "FEE"];
export type FeeType = (typeof FEE_TYPES)[number];
export declare const FEE_MODES: readonly ["PERCENT", "FIXED"];
export type FeeMode = (typeof FEE_MODES)[number];
export declare class CreatePaymentDestinationDto {
    name: string;
    type: PaymentDestinationType;
    bankName?: string;
    lastDigits?: string;
    description?: string;
    feeType?: FeeType;
    feeMode?: FeeMode;
    feeValue?: number;
    sortOrder?: number;
}
export declare class UpdatePaymentDestinationDto {
    name?: string;
    type?: PaymentDestinationType;
    bankName?: string | null;
    lastDigits?: string | null;
    description?: string | null;
    feeType?: FeeType | null;
    feeMode?: FeeMode | null;
    feeValue?: number;
    sortOrder?: number;
    active?: boolean;
}
//# sourceMappingURL=dto.d.ts.map