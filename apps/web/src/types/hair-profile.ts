/**
 * Tipos para Perfil Capilar e Recomendações
 */

// Enums
export enum HairType {
  STRAIGHT = 'STRAIGHT',
  WAVY = 'WAVY',
  CURLY = 'CURLY',
  COILY = 'COILY',
}

export enum HairThickness {
  FINE = 'FINE',
  MEDIUM = 'MEDIUM',
  THICK = 'THICK',
}

export enum HairLength {
  SHORT = 'SHORT',
  MEDIUM = 'MEDIUM',
  LONG = 'LONG',
  EXTRA_LONG = 'EXTRA_LONG',
}

export enum HairPorosity {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
}

export enum ScalpType {
  NORMAL = 'NORMAL',
  OILY = 'OILY',
  DRY = 'DRY',
  SENSITIVE = 'SENSITIVE',
}

// Labels traduzidos
export const HairTypeLabels: Record<HairType, string> = {
  [HairType.STRAIGHT]: 'Liso',
  [HairType.WAVY]: 'Ondulado',
  [HairType.CURLY]: 'Cacheado',
  [HairType.COILY]: 'Crespo',
};

export const HairThicknessLabels: Record<HairThickness, string> = {
  [HairThickness.FINE]: 'Fino',
  [HairThickness.MEDIUM]: 'Médio',
  [HairThickness.THICK]: 'Grosso',
};

export const HairLengthLabels: Record<HairLength, string> = {
  [HairLength.SHORT]: 'Curto',
  [HairLength.MEDIUM]: 'Médio',
  [HairLength.LONG]: 'Longo',
  [HairLength.EXTRA_LONG]: 'Extra Longo',
};

export const HairPorosityLabels: Record<HairPorosity, string> = {
  [HairPorosity.LOW]: 'Baixa',
  [HairPorosity.NORMAL]: 'Normal',
  [HairPorosity.HIGH]: 'Alta',
};

export const ScalpTypeLabels: Record<ScalpType, string> = {
  [ScalpType.NORMAL]: 'Normal',
  [ScalpType.OILY]: 'Oleoso',
  [ScalpType.DRY]: 'Seco',
  [ScalpType.SENSITIVE]: 'Sensível',
};

export const ChemicalHistoryLabels: Record<string, string> = {
  COLORACAO: 'Coloração',
  DESCOLORACAO: 'Descoloração',
  ALISAMENTO: 'Alisamento',
  RELAXAMENTO: 'Relaxamento',
  PERMANENTE: 'Permanente',
  PROGRESSIVA: 'Progressiva',
  BOTOX: 'Botox Capilar',
  KERATINA: 'Tratamento de Keratina',
  NENHUM: 'Nenhum',
};

export const HairConcernsLabels: Record<string, string> = {
  QUEDA: 'Queda Capilar',
  OLEOSIDADE: 'Oleosidade Excessiva',
  RESSECAMENTO: 'Ressecamento',
  FRIZZ: 'Frizz',
  PONTAS_DUPLAS: 'Pontas Duplas',
  CASPA: 'Caspa',
  COCEIRA: 'Coceira no Couro Cabeludo',
  QUEBRA: 'Quebra',
  SEM_BRILHO: 'Sem Brilho',
  VOLUME_EXCESSIVO: 'Volume Excessivo',
  POCO_VOLUME: 'Pouco Volume',
  CRESCIMENTO_LENTO: 'Crescimento Lento',
  SENSIBILIDADE: 'Sensibilidade',
  DANIFICADO: 'Danificado por Química',
  CALVICE: 'Calvície',
  AFINAMENTO: 'Afinamento dos Fios',
};

// Interfaces
export interface HairProfile {
  id: string;
  clientId: string;
  hairType: HairType | null;
  hairThickness: HairThickness | null;
  hairLength: HairLength | null;
  hairPorosity: HairPorosity | null;
  scalpType: ScalpType | null;
  chemicalHistory: string[];
  mainConcerns: string[];
  allergies: string | null;
  currentProducts: string | null;
  notes: string | null;
  lastAssessmentDate: string | null;
  lastAssessedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HairProfileFormData {
  clientId: string;
  hairType?: HairType;
  hairThickness?: HairThickness;
  hairLength?: HairLength;
  hairPorosity?: HairPorosity;
  scalpType?: ScalpType;
  chemicalHistory?: string[];
  mainConcerns?: string[];
  allergies?: string;
  currentProducts?: string;
  notes?: string;
}

export interface HairProfileOptions {
  hairTypes: { value: string; label: string }[];
  hairThickness: { value: string; label: string }[];
  hairLength: { value: string; label: string }[];
  hairPorosity: { value: string; label: string }[];
  scalpTypes: { value: string; label: string }[];
  chemicalHistory: { value: string; label: string }[];
  concerns: { value: string; label: string }[];
}

// Recomendações
export interface ProductRecommendation {
  productId: number;
  productName: string;
  productDescription: string | null;
  salePrice: string;
  currentStock: number;
  reason: string;
  priority: number;
  matchedCriteria: string[];
  ruleId?: string;
  ruleName?: string;
}

export interface RecommendationRule {
  id: string;
  salonId: string | null;
  name: string;
  description: string | null;
  conditions: RuleConditions;
  recommendedProducts: RecommendedProduct[];
  isActive: boolean;
  priority: number;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RuleConditions {
  hairTypes?: string[];
  hairThickness?: string[];
  hairLength?: string[];
  hairPorosity?: string[];
  scalpTypes?: string[];
  chemicalHistory?: string[];
  mainConcerns?: string[];
  logic?: 'AND' | 'OR';
}

export interface RecommendedProduct {
  productId: number;
  priority: number;
  reason: string;
}

export interface RecommendationStats {
  totalRecommendations: number;
  acceptedCount: number;
  rejectedCount: number;
  pendingCount: number;
  acceptanceRate: number;
  topProducts: {
    productId: number;
    productName: string;
    timesRecommended: number;
    timesAccepted: number;
    acceptanceRate: number;
  }[];
  topRules: {
    ruleId: string;
    ruleName: string;
    timesTriggered: number;
    acceptanceRate: number;
  }[];
}

export interface HairProfileStats {
  totalClients: number;
  profilesCreated: number;
  coveragePercentage: number;
  hairTypeDistribution: Record<string, number>;
  topConcerns: { concern: string; count: number }[];
}
