export declare class VariantConfigDto {
    message?: string;
    discount?: number;
    timing?: string;
    offer?: any;
}
export declare class CreateABTestDto {
    name: string;
    type: string;
    variantA?: VariantConfigDto;
    variantB?: VariantConfigDto;
}
export declare class UpdateABTestDto {
    name?: string;
    variantA?: VariantConfigDto;
    variantB?: VariantConfigDto;
}
export declare class RecordConversionDto {
    testId: string;
    clientId?: string;
    clientPhone?: string;
}
export interface VariantConfig {
    message?: string;
    discount?: number;
    timing?: string;
    offer?: any;
}
export interface ABTestResponse {
    id: string;
    salonId: string;
    name: string;
    type: string;
    status: string;
    variantA: VariantConfig;
    variantB: VariantConfig;
    variantAViews: number;
    variantAConversions: number;
    variantBViews: number;
    variantBConversions: number;
    variantAConversionRate: number;
    variantBConversionRate: number;
    winningVariant: string | null;
    startedAt: Date | null;
    endedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface ABTestAssignmentResponse {
    id: string;
    testId: string;
    clientId: string | null;
    clientPhone: string | null;
    variant: string;
    converted: boolean;
    convertedAt: Date | null;
    createdAt: Date;
}
export interface ABTestStatsResponse {
    totalTests: number;
    runningTests: number;
    completedTests: number;
    pausedTests: number;
    draftTests: number;
    totalViews: number;
    totalConversions: number;
    overallConversionRate: number;
}
//# sourceMappingURL=dto.d.ts.map