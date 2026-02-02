/**
 * Enums para perfil capilar
 */
export declare enum HairType {
    STRAIGHT = "STRAIGHT",
    WAVY = "WAVY",
    CURLY = "CURLY",
    COILY = "COILY"
}
export declare enum HairThickness {
    FINE = "FINE",
    MEDIUM = "MEDIUM",
    THICK = "THICK"
}
export declare enum HairLength {
    SHORT = "SHORT",
    MEDIUM = "MEDIUM",
    LONG = "LONG",
    EXTRA_LONG = "EXTRA_LONG"
}
export declare enum HairPorosity {
    LOW = "LOW",
    NORMAL = "NORMAL",
    HIGH = "HIGH"
}
export declare enum ScalpType {
    NORMAL = "NORMAL",
    OILY = "OILY",
    DRY = "DRY",
    SENSITIVE = "SENSITIVE"
}
/**
 * Opções de histórico químico
 */
export declare const ChemicalHistoryOptions: readonly ["COLORACAO", "DESCOLORACAO", "ALISAMENTO", "RELAXAMENTO", "PERMANENTE", "PROGRESSIVA", "BOTOX", "KERATINA", "NENHUM"];
export type ChemicalHistory = typeof ChemicalHistoryOptions[number];
/**
 * Opções de problemas/necessidades capilares
 */
export declare const HairConcernsOptions: readonly ["QUEDA", "OLEOSIDADE", "RESSECAMENTO", "FRIZZ", "PONTAS_DUPLAS", "CASPA", "COCEIRA", "QUEBRA", "SEM_BRILHO", "VOLUME_EXCESSIVO", "POCO_VOLUME", "CRESCIMENTO_LENTO", "SENSIBILIDADE", "DANIFICADO", "CALVICE", "AFINAMENTO"];
export type HairConcern = typeof HairConcernsOptions[number];
/**
 * DTO para criação/atualização de perfil capilar
 */
export declare class CreateHairProfileDto {
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
export declare class UpdateHairProfileDto {
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
export declare const HairTypeLabels: Record<HairType, string>;
export declare const HairThicknessLabels: Record<HairThickness, string>;
export declare const HairLengthLabels: Record<HairLength, string>;
export declare const HairPorosityLabels: Record<HairPorosity, string>;
export declare const ScalpTypeLabels: Record<ScalpType, string>;
export declare const ChemicalHistoryLabels: Record<ChemicalHistory, string>;
export declare const HairConcernsLabels: Record<HairConcern, string>;
//# sourceMappingURL=dto.d.ts.map