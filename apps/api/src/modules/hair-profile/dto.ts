import { IsString, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';

/**
 * Enums para perfil capilar
 */
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

/**
 * Opções de histórico químico
 */
export const ChemicalHistoryOptions = [
  'COLORACAO', // Coloração
  'DESCOLORACAO', // Descoloração
  'ALISAMENTO', // Alisamento
  'RELAXAMENTO', // Relaxamento
  'PERMANENTE', // Permanente
  'PROGRESSIVA', // Progressiva
  'BOTOX', // Botox capilar
  'KERATINA', // Tratamento de keratina
  'NENHUM', // Nenhum
] as const;

export type ChemicalHistory = typeof ChemicalHistoryOptions[number];

/**
 * Opções de problemas/necessidades capilares
 */
export const HairConcernsOptions = [
  'QUEDA', // Queda capilar
  'OLEOSIDADE', // Oleosidade excessiva
  'RESSECAMENTO', // Ressecamento
  'FRIZZ', // Frizz
  'PONTAS_DUPLAS', // Pontas duplas
  'CASPA', // Caspa
  'COCEIRA', // Coceira no couro cabeludo
  'QUEBRA', // Quebra
  'SEM_BRILHO', // Sem brilho
  'VOLUME_EXCESSIVO', // Volume excessivo
  'POCO_VOLUME', // Pouco volume
  'CRESCIMENTO_LENTO', // Crescimento lento
  'SENSIBILIDADE', // Sensibilidade
  'DANIFICADO', // Danificado por química
  'CALVICE', // Calvície
  'AFINAMENTO', // Afinamento dos fios
] as const;

export type HairConcern = typeof HairConcernsOptions[number];

/**
 * DTO para criação/atualização de perfil capilar
 */
export class CreateHairProfileDto {
  @IsUUID()
  clientId!: string;

  @IsOptional()
  @IsEnum(HairType)
  hairType?: HairType;

  @IsOptional()
  @IsEnum(HairThickness)
  hairThickness?: HairThickness;

  @IsOptional()
  @IsEnum(HairLength)
  hairLength?: HairLength;

  @IsOptional()
  @IsEnum(HairPorosity)
  hairPorosity?: HairPorosity;

  @IsOptional()
  @IsEnum(ScalpType)
  scalpType?: ScalpType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chemicalHistory?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mainConcerns?: string[];

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  currentProducts?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateHairProfileDto {
  @IsOptional()
  @IsEnum(HairType)
  hairType?: HairType;

  @IsOptional()
  @IsEnum(HairThickness)
  hairThickness?: HairThickness;

  @IsOptional()
  @IsEnum(HairLength)
  hairLength?: HairLength;

  @IsOptional()
  @IsEnum(HairPorosity)
  hairPorosity?: HairPorosity;

  @IsOptional()
  @IsEnum(ScalpType)
  scalpType?: ScalpType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chemicalHistory?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mainConcerns?: string[];

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  currentProducts?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * Interface para resposta do perfil capilar
 */
export interface HairProfileResponse {
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
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Labels traduzidos para exibição
 */
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

export const ChemicalHistoryLabels: Record<ChemicalHistory, string> = {
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

export const HairConcernsLabels: Record<HairConcern, string> = {
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
