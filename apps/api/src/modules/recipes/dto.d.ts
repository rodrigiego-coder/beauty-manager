export declare class RecipeLineDto {
    productId: number;
    productGroupId?: string;
    quantityStandard: number;
    quantityBuffer?: number;
    unit: string;
    isRequired?: boolean;
    notes?: string;
    sortOrder?: number;
}
export declare class RecipeVariantDto {
    code: string;
    name: string;
    multiplier: number;
    isDefault?: boolean;
    sortOrder?: number;
}
export declare class SaveRecipeDto {
    notes?: string;
    targetMarginPercent?: number;
    lines: RecipeLineDto[];
    variants?: RecipeVariantDto[];
}
export interface RecipeLineResponse {
    id: string;
    productId: number;
    productName: string;
    productUnit: string;
    productCost: number;
    productGroupId?: string;
    quantityStandard: number;
    quantityBuffer: number;
    unit: string;
    isRequired: boolean;
    notes?: string;
    sortOrder: number;
    lineCost: number;
}
export interface RecipeVariantResponse {
    id: string;
    code: string;
    name: string;
    multiplier: number;
    isDefault: boolean;
    sortOrder: number;
    estimatedCost: number;
}
export interface RecipeResponse {
    id: string;
    serviceId: number;
    serviceName: string;
    version: number;
    status: string;
    effectiveFrom: string;
    notes?: string;
    estimatedCost: number;
    targetMarginPercent: number;
    lines: RecipeLineResponse[];
    variants: RecipeVariantResponse[];
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=dto.d.ts.map