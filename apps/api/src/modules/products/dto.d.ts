export declare class CreateProductDto {
    name: string;
    description?: string;
    costPrice: number;
    salePrice: number;
    stockRetail?: number;
    minStockRetail?: number;
    stockInternal?: number;
    minStockInternal?: number;
    unit?: 'UN' | 'ML' | 'KG' | 'L' | 'G';
    isRetail?: boolean;
    isBackbar?: boolean;
}
export declare class UpdateProductDto {
    name?: string;
    description?: string;
    costPrice?: number;
    salePrice?: number;
    stockRetail?: number;
    minStockRetail?: number;
    stockInternal?: number;
    minStockInternal?: number;
    unit?: 'UN' | 'ML' | 'KG' | 'L' | 'G';
    active?: boolean;
    isRetail?: boolean;
    isBackbar?: boolean;
}
export declare class AdjustStockDto {
    quantity: number;
    type: 'IN' | 'OUT';
    reason: string;
}
export declare class StockEntryDto {
    quantity: number;
    description?: string;
}
export declare class TransferStockDto {
    quantity: number;
    fromLocation: 'RETAIL' | 'INTERNAL';
    toLocation: 'RETAIL' | 'INTERNAL';
    reason?: string;
}
//# sourceMappingURL=dto.d.ts.map