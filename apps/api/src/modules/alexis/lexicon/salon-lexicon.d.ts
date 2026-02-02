/**
 * =====================================================
 * SALON LEXICON — Dialeto de salão para a Alexis (P0.2.1)
 * Mapeia termos populares/coloquiais para entidades canônicas.
 * Sem dependência de DB — puro e testável.
 * =====================================================
 */
export type EntityType = 'SERVICE' | 'CONDITION' | 'PRODUCT_CATEGORY' | 'TECHNIQUE';
export type RiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
export type RepairTemplateKey = 'REPAIR_SERVICE_CANONICAL' | 'REPAIR_CONDITION_TO_PROTOCOL' | 'REPAIR_AMBIGUOUS_ASK_CONFIRM';
export interface LexiconEntry {
    id: string;
    entityType: EntityType;
    canonical: string;
    triggers: string[];
    ambiguous: boolean;
    confidenceMinToAssume: number;
    riskLevel: RiskLevel;
    repairTemplateKey: RepairTemplateKey;
    suggestedServiceKey?: string;
    requiresPatchTest?: boolean;
    nextQuestionKey?: string;
}
export declare const SALON_LEXICON: LexiconEntry[];
//# sourceMappingURL=salon-lexicon.d.ts.map