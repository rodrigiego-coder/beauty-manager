export declare class CreatePreferenceDto {
    invoiceId: string;
    successUrl?: string;
    failureUrl?: string;
    pendingUrl?: string;
}
export declare class CreatePixDto {
    invoiceId: string;
    expirationMinutes?: number;
}
export declare class WebhookDto {
    type: string;
    action: string;
    data: {
        id: string;
    };
}
export declare class CardPaymentDto {
    invoiceId: string;
    token: string;
    paymentMethodId: string;
    installments: number;
    email?: string;
}
//# sourceMappingURL=dto.d.ts.map