export declare class CreatePlanDto {
    code: string;
    name: string;
    description?: string;
    priceMonthly: number;
    priceYearly?: number;
    maxUsers: number;
    maxClients: number;
    maxSalons?: number;
    features?: string[];
    hasFiscal?: boolean;
    hasAutomation?: boolean;
    hasReports?: boolean;
    hasAI?: boolean;
    trialDays?: number;
    sortOrder?: number;
}
export declare class UpdatePlanDto {
    name?: string;
    description?: string;
    priceMonthly?: number;
    priceYearly?: number;
    maxUsers?: number;
    maxClients?: number;
    maxSalons?: number;
    features?: string[];
    hasFiscal?: boolean;
    hasAutomation?: boolean;
    hasReports?: boolean;
    hasAI?: boolean;
    trialDays?: number;
    isActive?: boolean;
    sortOrder?: number;
}
//# sourceMappingURL=dto.d.ts.map