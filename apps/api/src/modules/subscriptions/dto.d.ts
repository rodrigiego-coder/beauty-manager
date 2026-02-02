export declare class StartTrialDto {
    planId: string;
    trialDays?: number;
}
export declare class ChangePlanDto {
    newPlanId: string;
    billingPeriod?: 'MONTHLY' | 'YEARLY';
}
export declare class CancelSubscriptionDto {
    cancelAtPeriodEnd?: boolean;
    reason?: string;
}
export declare class ReactivateSubscriptionDto {
    planId?: string;
}
export declare class CreateInvoiceDto {
    subscriptionId: string;
    amount: number;
    dueDate: Date;
}
export declare class PayInvoiceDto {
    method: 'PIX' | 'CARD' | 'BOLETO';
    cardToken?: string;
}
export declare class InvoiceFiltersDto {
    status?: string;
    startDate?: Date;
    endDate?: Date;
}
//# sourceMappingURL=dto.d.ts.map