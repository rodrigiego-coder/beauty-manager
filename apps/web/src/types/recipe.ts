/**
 * Tipos para o sistema de receitas de serviços
 */

// Códigos de variação
export type VariantCode = 'DEFAULT' | 'SHORT' | 'MEDIUM' | 'LONG' | 'EXTRA_LONG' | 'CUSTOM';

// Unidades de medida
export type RecipeUnit = 'UN' | 'ML' | 'G' | 'KG' | 'L';

/**
 * Linha da receita (produto consumido)
 */
export interface RecipeLine {
  id: string;
  productId: number;
  productName: string;
  productUnit: string;
  productCost: number;
  productGroupId?: string;
  quantityStandard: number;
  quantityBuffer: number;
  unit: RecipeUnit;
  isRequired: boolean;
  notes?: string;
  sortOrder: number;
  lineCost: number; // custo total da linha
}

/**
 * Variação da receita (Curto/Médio/Longo)
 */
export interface RecipeVariant {
  id: string;
  code: VariantCode;
  name: string;
  multiplier: number;
  isDefault: boolean;
  sortOrder: number;
  estimatedCost: number; // custo com multiplicador aplicado
}

/**
 * Receita completa de um serviço
 */
export interface ServiceRecipe {
  id: string;
  serviceId: number;
  serviceName: string;
  version: number;
  status: 'ACTIVE' | 'ARCHIVED';
  effectiveFrom: string;
  notes?: string;
  estimatedCost: number;
  targetMarginPercent: number;
  lines: RecipeLine[];
  variants: RecipeVariant[];
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para salvar linha da receita
 */
export interface SaveRecipeLineDto {
  productId: number;
  productGroupId?: string;
  quantityStandard: number;
  quantityBuffer?: number;
  unit: string;
  isRequired?: boolean;
  notes?: string;
  sortOrder?: number;
}

/**
 * DTO para salvar variação
 */
export interface SaveRecipeVariantDto {
  code: VariantCode;
  name: string;
  multiplier: number;
  isDefault?: boolean;
  sortOrder?: number;
}

/**
 * DTO para salvar receita completa
 */
export interface SaveRecipeDto {
  notes?: string;
  targetMarginPercent?: number;
  lines: SaveRecipeLineDto[];
  variants?: SaveRecipeVariantDto[];
}

/**
 * Produto disponível para receita (apenas backbar)
 */
export interface BackbarProduct {
  id: number;
  name: string;
  unit: string;
  costPrice: number;
  stockInternal: number;
  isBackbar: boolean;
}

/**
 * Helper: criar linha vazia
 */
export const createEmptyRecipeLine = (
  productId: number,
  product?: BackbarProduct
): SaveRecipeLineDto => ({
  productId,
  quantityStandard: 1,
  quantityBuffer: 0,
  unit: product?.unit || 'UN',
  isRequired: true,
});

/**
 * Helper: criar variações padrão
 */
export const createDefaultVariants = (): SaveRecipeVariantDto[] => [
  { code: 'SHORT', name: 'Cabelo Curto', multiplier: 0.6, isDefault: false, sortOrder: 0 },
  { code: 'MEDIUM', name: 'Cabelo Médio', multiplier: 1.0, isDefault: true, sortOrder: 1 },
  { code: 'LONG', name: 'Cabelo Longo', multiplier: 1.5, isDefault: false, sortOrder: 2 },
];

/**
 * Helper: calcular custo total da receita
 */
export const calculateRecipeCost = (
  lines: RecipeLine[],
  multiplier: number = 1
): number => {
  const baseCost = lines.reduce((sum, line) => sum + line.lineCost, 0);
  return Math.round(baseCost * multiplier * 100) / 100;
};

/**
 * Helper: calcular margem de receita
 */
export const calculateRecipeMargin = (
  price: number,
  cost: number
): { value: number; percent: number } => {
  const value = price - cost;
  const percent = price > 0 ? (value / price) * 100 : 0;
  return {
    value: Math.round(value * 100) / 100,
    percent: Math.round(percent * 10) / 10,
  };
};

/**
 * Labels para códigos de variação
 */
export const VARIANT_LABELS: Record<VariantCode, string> = {
  DEFAULT: 'Padrão',
  SHORT: 'Cabelo Curto',
  MEDIUM: 'Cabelo Médio',
  LONG: 'Cabelo Longo',
  EXTRA_LONG: 'Cabelo Extra Longo',
  CUSTOM: 'Personalizado',
};

/**
 * Labels para unidades
 */
export const UNIT_LABELS: Record<RecipeUnit, string> = {
  UN: 'Unidade',
  ML: 'Mililitros',
  G: 'Gramas',
  KG: 'Quilogramas',
  L: 'Litros',
};
