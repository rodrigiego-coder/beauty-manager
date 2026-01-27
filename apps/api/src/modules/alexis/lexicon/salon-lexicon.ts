/**
 * =====================================================
 * SALON LEXICON — Dialeto de salão para a Alexis (P0.2.1)
 * Mapeia termos populares/coloquiais para entidades canônicas.
 * Sem dependência de DB — puro e testável.
 * =====================================================
 */

export type EntityType =
  | 'SERVICE'
  | 'CONDITION'
  | 'PRODUCT_CATEGORY'
  | 'TECHNIQUE';

export type RiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

export type RepairTemplateKey =
  | 'REPAIR_SERVICE_CANONICAL'
  | 'REPAIR_CONDITION_TO_PROTOCOL'
  | 'REPAIR_AMBIGUOUS_ASK_CONFIRM';

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

export const SALON_LEXICON: LexiconEntry[] = [
  // ========== ALISAMENTO ==========
  {
    id: 'ALIS_PROGRESSIVA',
    entityType: 'SERVICE',
    canonical: 'Alisamento',
    triggers: ['progressiva', 'escova progressiva', 'fazer progressiva'],
    ambiguous: false,
    confidenceMinToAssume: 0.8,
    riskLevel: 'MEDIUM',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'ALISAMENTO',
    requiresPatchTest: true,
    nextQuestionKey: 'ASK_HAIR_LENGTH_CHEMISTRY',
  },
  {
    id: 'ALIS_SELAGEM',
    entityType: 'SERVICE',
    canonical: 'Alisamento',
    triggers: ['selagem', 'selagem capilar', 'selagem termica'],
    ambiguous: false,
    confidenceMinToAssume: 0.8,
    riskLevel: 'MEDIUM',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'ALISAMENTO',
    requiresPatchTest: true,
    nextQuestionKey: 'ASK_HAIR_LENGTH_CHEMISTRY',
  },
  {
    id: 'ALIS_DEFINITIVA',
    entityType: 'SERVICE',
    canonical: 'Alisamento',
    triggers: ['definitiva', 'alisamento definitivo', 'liso definitivo'],
    ambiguous: false,
    confidenceMinToAssume: 0.8,
    riskLevel: 'HIGH',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'ALISAMENTO',
    requiresPatchTest: true,
    nextQuestionKey: 'ASK_HAIR_LENGTH_CHEMISTRY',
  },
  {
    id: 'ALIS_LISO_ESPELHADO',
    entityType: 'SERVICE',
    canonical: 'Alisamento',
    triggers: ['liso espelhado', 'cabelo espelhado', 'espelhado'],
    ambiguous: false,
    confidenceMinToAssume: 0.7,
    riskLevel: 'MEDIUM',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'ALISAMENTO',
    requiresPatchTest: true,
    nextQuestionKey: 'ASK_HAIR_LENGTH_CHEMISTRY',
  },
  {
    id: 'ALIS_NANOPLASTIA',
    entityType: 'SERVICE',
    canonical: 'Alisamento',
    triggers: ['nanoplastia', 'nano plastia'],
    ambiguous: false,
    confidenceMinToAssume: 0.8,
    riskLevel: 'MEDIUM',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'ALISAMENTO',
    requiresPatchTest: true,
  },

  // ========== BOTOX (AMBÍGUO) ==========
  {
    id: 'BOTOX_AMBIGUOUS',
    entityType: 'TECHNIQUE',
    canonical: 'Botox Capilar',
    triggers: ['botox', 'botox capilar', 'fazer botox'],
    ambiguous: true,
    confidenceMinToAssume: 0.5,
    riskLevel: 'LOW',
    repairTemplateKey: 'REPAIR_AMBIGUOUS_ASK_CONFIRM',
    nextQuestionKey: 'ASK_BOTOX_INTENT',
  },

  // ========== NUTRIÇÃO ==========
  {
    id: 'NUTRICAO_BANHO_OLEO',
    entityType: 'SERVICE',
    canonical: 'Nutrição Capilar',
    triggers: ['banho de oleo', 'umectacao', 'umectar', 'oleo no cabelo', 'hidratacao profunda'],
    ambiguous: false,
    confidenceMinToAssume: 0.8,
    riskLevel: 'NONE',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'NUTRICAO',
  },

  // ========== MATIZAÇÃO ==========
  {
    id: 'MATIZACAO',
    entityType: 'SERVICE',
    canonical: 'Matização',
    triggers: [
      'tirar o amarelo', 'desamarelar', 'matizar', 'matizacao',
      'cabelo amarelado', 'tirar amarelado', 'tom perola', 'tom bege',
    ],
    ambiguous: false,
    confidenceMinToAssume: 0.8,
    riskLevel: 'LOW',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'MATIZACAO',
    nextQuestionKey: 'ASK_MATIZ_TONE',
  },

  // ========== MECHAS ==========
  {
    id: 'MECHAS_LUZES',
    entityType: 'SERVICE',
    canonical: 'Mechas',
    triggers: ['luzes', 'reflexo', 'fazer luzes', 'mechas', 'babylights', 'balayage'],
    ambiguous: false,
    confidenceMinToAssume: 0.8,
    riskLevel: 'LOW',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'MECHAS',
    nextQuestionKey: 'ASK_MECHAS_STYLE',
  },

  // ========== COLORAÇÃO RAIZ ==========
  {
    id: 'COLORACAO_RAIZ',
    entityType: 'SERVICE',
    canonical: 'Coloração de Raiz',
    triggers: [
      'retocar raiz', 'cobrir branco', 'cobrir brancos', 'raiz branca',
      'retoque raiz', 'pintar raiz', 'tinta raiz', 'cobrir fios brancos',
    ],
    ambiguous: false,
    confidenceMinToAssume: 0.8,
    riskLevel: 'LOW',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'COLORACAO',
  },

  // ========== COLORAÇÃO GERAL ==========
  {
    id: 'COLORACAO_GERAL',
    entityType: 'SERVICE',
    canonical: 'Coloração',
    triggers: ['colorir', 'mudar de cor', 'trocar de cor', 'pintar o cabelo', 'tintura'],
    ambiguous: false,
    confidenceMinToAssume: 0.7,
    riskLevel: 'LOW',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'COLORACAO',
    nextQuestionKey: 'ASK_COLOR_INTENT',
  },

  // ========== ELASTICIDADE / RECONSTRUÇÃO ==========
  {
    id: 'ELASTICIDADE',
    entityType: 'CONDITION',
    canonical: 'Reconstrução Capilar',
    triggers: [
      'chiclete', 'emborrachado', 'cabelo chiclete', 'cabelo emborrachado',
      'cabelo elastico', 'elasticidade', 'cabelo borracha',
    ],
    ambiguous: false,
    confidenceMinToAssume: 0.8,
    riskLevel: 'HIGH',
    repairTemplateKey: 'REPAIR_CONDITION_TO_PROTOCOL',
    suggestedServiceKey: 'RECONSTRUCAO',
    nextQuestionKey: 'ASK_CHEMISTRY_HISTORY',
  },

  // ========== CAUTERIZAÇÃO ==========
  {
    id: 'CAUTERIZACAO',
    entityType: 'SERVICE',
    canonical: 'Cauterização',
    triggers: ['cauterizacao', 'cauterizar', 'selar as pontas'],
    ambiguous: false,
    confidenceMinToAssume: 0.8,
    riskLevel: 'NONE',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'CAUTERIZACAO',
  },

  // ========== CORTE ==========
  {
    id: 'CORTE_REPICADO',
    entityType: 'SERVICE',
    canonical: 'Corte',
    triggers: ['repicado', 'repicar', 'desfiado', 'desfilar'],
    ambiguous: false,
    confidenceMinToAssume: 0.7,
    riskLevel: 'NONE',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'CORTE',
  },

  // ========== ESCOVA ==========
  {
    id: 'ESCOVA',
    entityType: 'SERVICE',
    canonical: 'Escova',
    triggers: ['escova', 'escova modelada', 'modelar', 'escova lisa'],
    ambiguous: false,
    confidenceMinToAssume: 0.8,
    riskLevel: 'NONE',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'ESCOVA',
  },

  // ========== HIDRATAÇÃO ==========
  {
    id: 'HIDRATACAO',
    entityType: 'SERVICE',
    canonical: 'Hidratação',
    triggers: ['hidratar', 'cabelo ressecado', 'cabelo seco', 'mascara capilar'],
    ambiguous: false,
    confidenceMinToAssume: 0.7,
    riskLevel: 'NONE',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'HIDRATACAO',
  },

  // ========== PENTEADO ==========
  {
    id: 'PENTEADO',
    entityType: 'SERVICE',
    canonical: 'Penteado',
    triggers: ['penteado', 'prender cabelo', 'cabelo preso', 'coque', 'tranca'],
    ambiguous: false,
    confidenceMinToAssume: 0.8,
    riskLevel: 'NONE',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'PENTEADO',
  },

  // ========== MANICURE / PEDICURE ==========
  {
    id: 'MANICURE',
    entityType: 'SERVICE',
    canonical: 'Manicure',
    triggers: ['manicure', 'fazer unha', 'unhas', 'esmaltacao', 'cuticular'],
    ambiguous: false,
    confidenceMinToAssume: 0.8,
    riskLevel: 'NONE',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'MANICURE',
  },

  // ========== SOBRANCELHA ==========
  {
    id: 'SOBRANCELHA',
    entityType: 'SERVICE',
    canonical: 'Design de Sobrancelha',
    triggers: ['sobrancelha', 'design de sobrancelha', 'fazer sobrancelha', 'henna sobrancelha'],
    ambiguous: false,
    confidenceMinToAssume: 0.8,
    riskLevel: 'NONE',
    repairTemplateKey: 'REPAIR_SERVICE_CANONICAL',
    suggestedServiceKey: 'SOBRANCELHA',
  },

  // ========== TRATAMENTO ANTI-QUEDA ==========
  {
    id: 'ANTIQUEDA',
    entityType: 'CONDITION',
    canonical: 'Tratamento Anti-queda',
    triggers: ['cabelo caindo', 'queda de cabelo', 'caindo muito', 'anti queda', 'calvicie'],
    ambiguous: false,
    confidenceMinToAssume: 0.7,
    riskLevel: 'MEDIUM',
    repairTemplateKey: 'REPAIR_CONDITION_TO_PROTOCOL',
    suggestedServiceKey: 'TRATAMENTO',
    nextQuestionKey: 'ASK_HAIR_LOSS_DURATION',
  },
];
