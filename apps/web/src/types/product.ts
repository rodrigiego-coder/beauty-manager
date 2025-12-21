export type ProductUnit = 'UN' | 'ML' | 'KG' | 'L' | 'G';

export interface Product {
  id: number;
  salonId: string;
  name: string;
  description: string | null;
  costPrice: string;
  salePrice: string;
  // Dual stock system
  stockRetail: number;
  stockInternal: number;
  minStockRetail: number;
  minStockInternal: number;
  // Legacy fields (deprecated, kept for compatibility)
  currentStock?: number;
  minStock?: number;
  unit: ProductUnit;
  active: boolean;
  isRetail: boolean;
  isBackbar: boolean;
  category?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  costPrice: number;
  salePrice: number;
  stockRetail?: number;
  stockInternal?: number;
  minStockRetail?: number;
  minStockInternal?: number;
  unit?: ProductUnit;
  isRetail?: boolean;
  isBackbar?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  costPrice?: number;
  salePrice?: number;
  stockRetail?: number;
  stockInternal?: number;
  minStockRetail?: number;
  minStockInternal?: number;
  unit?: ProductUnit;
  active?: boolean;
  isRetail?: boolean;
  isBackbar?: boolean;
}

export interface AdjustStockData {
  quantity: number;
  type: 'IN' | 'OUT';
  reason: string;
}

export interface ProductStats {
  totalProducts: number;
  lowStockCount: number;
  totalStockValue: number;
  retailStockValue: number;
  internalStockValue: number;
}

export const PRODUCT_UNITS: { value: ProductUnit; label: string; abbreviation: string }[] = [
  { value: 'UN', label: 'Unidade', abbreviation: 'UN' },
  { value: 'ML', label: 'Mililitros', abbreviation: 'ML' },
  { value: 'L', label: 'Litros', abbreviation: 'L' },
  { value: 'G', label: 'Gramas', abbreviation: 'G' },
  { value: 'KG', label: 'Quilogramas', abbreviation: 'KG' },
];

export function getUnitLabel(unit: ProductUnit): string {
  const found = PRODUCT_UNITS.find((u) => u.value === unit);
  return found ? found.label : unit;
}

export function getUnitAbbreviation(unit: ProductUnit): string {
  const found = PRODUCT_UNITS.find((u) => u.value === unit);
  return found ? found.abbreviation : unit;
}

export function formatStockWithUnit(stock: number, unit: ProductUnit): string {
  return `${stock} ${getUnitAbbreviation(unit)}`;
}

export function calculateMargin(costPrice: number, salePrice: number): number {
  if (costPrice <= 0) return 0;
  return ((salePrice - costPrice) / costPrice) * 100;
}

export type StockLocation = 'retail' | 'internal';

export function isLowStock(product: Product, location?: StockLocation): boolean {
  if (location === 'retail') {
    return product.isRetail && product.stockRetail <= product.minStockRetail;
  }
  if (location === 'internal') {
    return product.isBackbar && product.stockInternal <= product.minStockInternal;
  }
  // Check both locations
  const retailLow = product.isRetail && product.stockRetail <= product.minStockRetail;
  const internalLow = product.isBackbar && product.stockInternal <= product.minStockInternal;
  return retailLow || internalLow;
}

export function isLowStockRetail(product: Product): boolean {
  return product.isRetail && product.stockRetail <= product.minStockRetail;
}

export function isLowStockInternal(product: Product): boolean {
  return product.isBackbar && product.stockInternal <= product.minStockInternal;
}
