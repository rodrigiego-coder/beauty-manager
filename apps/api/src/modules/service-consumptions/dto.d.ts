export declare class ConsumptionItemDto {
    productId: number;
    quantity: number;
    unit: 'UN' | 'ML' | 'G' | 'KG' | 'L';
    notes?: string;
}
export declare class UpdateServiceConsumptionsDto {
    items: ConsumptionItemDto[];
}
//# sourceMappingURL=dto.d.ts.map