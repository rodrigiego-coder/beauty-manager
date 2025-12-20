export type ProductUnit = 'UN' | 'ML' | 'KG' | 'L' | 'G';

export interface Product {
  id: number;
  salonId: string;
  name: string;
  description: string | null;
  costPrice: string;
  salePrice: string;
  currentStock: number;
  minStock: number;
  unit: ProductUnit;
  active: boolean;
  isRetail: boolean;
  isBackbar: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  costPrice: number;
  salePrice: number;
  currentStock?: number;
  minStock?: number;
  unit?: ProductUnit;
  isRetail?: boolean;
  isBackbar?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  costPrice?: number;
  salePrice?: number;
  currentStock?: number;
  minStock?: number;
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

export function isLowStock(product: Product): boolean {
  return product.currentStock <= product.minStock;
}
