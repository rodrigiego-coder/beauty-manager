import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../database/connection';
import { products } from '../../database/schema';
import { eq, and } from 'drizzle-orm';

/**
 * =====================================================
 * PRODUCT INFO SERVICE (CHARLIE)
 * Detecção determinística de perguntas sobre produtos
 * e respostas com linguagem de especialista
 * =====================================================
 */

// =====================================================
// TYPES
// =====================================================

export interface ProductInfo {
  id: number;
  name: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  benefits: string[] | null;
  howToUse: string | null;
  contraindications: string | null;
  ingredients: string | null;
  salePrice: string;
  alexisMeta: {
    summary?: string;
    indications?: string[];
    actives?: string[];
    benefits?: string[];
    howToUse?: string;
    precautions?: string;
    upsellHooks?: string[];
  } | null;
}

// =====================================================
// PURE FUNCTIONS - NORMALIZAÇÃO
// =====================================================

// Stopwords comuns em português
const STOPWORDS = new Set([
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
  'do', 'da', 'dos', 'das', 'de', 'no', 'na', 'nos', 'nas',
  'para', 'pra', 'por', 'com', 'sem', 'em',
  'que', 'qual', 'quais', 'como', 'quando', 'onde',
  'me', 'te', 'se', 'nos', 'vos', 'lhe', 'lhes',
  'esse', 'essa', 'este', 'esta', 'isso', 'isto',
  'serve', 'servem', 'usar', 'uso', 'faz', 'fazer',
  'e', 'ou', 'mas', 'porque', 'pois',
]);

/**
 * Normaliza texto: lowercase, remove acentos, pontuação, colapsa espaços
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
    .replace(/[^\w\s]/g, ' ')         // remove pontuação
    .replace(/\s+/g, ' ')             // colapsa espaços
    .trim();
}

/**
 * Extrai tokens relevantes (sem stopwords, >= 3 chars)
 */
export function extractTokens(textNorm: string): string[] {
  return textNorm
    .split(' ')
    .filter(t => t.length >= 3 && !STOPWORDS.has(t));
}

/**
 * Gera bigramas de caracteres para comparação fuzzy
 */
export function getBigrams(text: string): Set<string> {
  const bigrams = new Set<string>();
  for (let i = 0; i < text.length - 1; i++) {
    bigrams.add(text.slice(i, i + 2));
  }
  return bigrams;
}

/**
 * Calcula Dice coefficient entre dois conjuntos de bigramas
 */
export function diceCoefficient(set1: Set<string>, set2: Set<string>): number {
  if (set1.size === 0 || set2.size === 0) return 0;
  let intersection = 0;
  for (const b of set1) {
    if (set2.has(b)) intersection++;
  }
  return (2 * intersection) / (set1.size + set2.size);
}

// =====================================================
// DETECÇÃO DETERMINÍSTICA
// =====================================================

// Padrões que indicam pergunta sobre informação de produto
const PRODUCT_INFO_PATTERNS = [
  'pra que serve',
  'para que serve',
  'pra q serve',
  'para q serve',
  'qual a funcao',
  'qual funcao',
  'beneficio',
  'beneficios',
  'indicacao',
  'indicacoes',
  'indicado para',
  'como usar',
  'como usa',
  'modo de uso',
  'como aplicar',
  'como aplica',
  'ativos',
  'ativo principal',
  'ingredientes',
  'ingrediente',
  'contraindicacao',
  'contraindicacoes',
  'pode usar em',
  'posso usar em',
  'serve para',
  'faz o que',
  'faz oque',
  'oque faz',
  'o que faz',
];

/**
 * Detecta se a mensagem é uma pergunta sobre informação de produto
 */
export function isProductInfoQuestion(message: string): boolean {
  const msgNorm = normalizeText(message);
  return PRODUCT_INFO_PATTERNS.some(pattern => msgNorm.includes(pattern));
}

// =====================================================
// MATCHING DE PRODUTO (FUZZY)
// =====================================================

const MATCH_THRESHOLD = 0.28;

/**
 * Calcula score de match entre mensagem e nome do produto
 */
export function calculateMatchScore(messageNorm: string, productNameNorm: string): number {
  // Score por token overlap
  const msgTokens = extractTokens(messageNorm);
  const prodTokens = extractTokens(productNameNorm);

  if (prodTokens.length === 0) return 0;

  let tokenOverlap = 0;
  for (const pt of prodTokens) {
    // Token exato ou substring substancial
    if (msgTokens.some(mt => mt.includes(pt) || pt.includes(mt))) {
      tokenOverlap++;
    }
  }
  const tokenScore = tokenOverlap / prodTokens.length;

  // Score por bigram dice (para typos)
  const msgBigrams = getBigrams(messageNorm.replace(/\s/g, ''));
  const prodBigrams = getBigrams(productNameNorm.replace(/\s/g, ''));
  const diceScore = diceCoefficient(msgBigrams, prodBigrams);

  // Combina scores (peso maior para tokens)
  return (tokenScore * 0.6) + (diceScore * 0.4);
}

// =====================================================
// FORMATAÇÃO DE RESPOSTA SÊNIOR
// =====================================================

/**
 * Formata resposta de especialista usando alexis_meta ou campos tradicionais
 */
export function formatExpertResponse(product: ProductInfo): string {
  const meta = product.alexisMeta;
  const parts: string[] = [];

  // Header com nome e marca
  const header = product.brand
    ? `*${product.name}* (${product.brand})`
    : `*${product.name}*`;

  // Summary/Description
  const summary = meta?.summary || product.description;
  if (summary) {
    parts.push(`${header}: ${summary}`);
  } else {
    parts.push(header);
  }

  // Indicações
  const indications = meta?.indications;
  if (indications && indications.length > 0) {
    parts.push(`*Indicado para:* ${indications.join(', ')}.`);
  }

  // Ativos com explicação
  const actives = meta?.actives;
  if (actives && actives.length > 0) {
    const activesText = actives.slice(0, 4).join(', ');
    parts.push(`*Ativos-chave:* ${activesText}.`);
  } else if (product.ingredients) {
    parts.push(`*Ingredientes principais:* ${product.ingredients.slice(0, 100)}...`);
  }

  // Benefícios
  const benefits = meta?.benefits || product.benefits;
  if (benefits && benefits.length > 0) {
    const benefitsText = Array.isArray(benefits) ? benefits.slice(0, 4).join(', ') : benefits;
    parts.push(`*Beneficios:* ${benefitsText}.`);
  }

  // Como usar
  const howToUse = meta?.howToUse || product.howToUse;
  if (howToUse) {
    parts.push(`*Como usar:* ${howToUse}`);
  }

  // Cuidados/Precauções
  const precautions = meta?.precautions || product.contraindications;
  if (precautions) {
    parts.push(`*Cuidados:* ${precautions}`);
  }

  // CTA curto
  parts.push(`Quer saber mais sobre frequencia de uso ou se e indicado pro seu tipo de cabelo?`);

  return parts.join('\n\n');
}

/**
 * Resposta quando não encontra o produto
 */
export function formatNotFoundResponse(): string {
  return `Nao consegui identificar o produto que voce mencionou. Pode me dizer o nome completo ou descrever melhor? Assim consigo te dar informacoes detalhadas sobre ativos, beneficios e modo de uso.`;
}

// =====================================================
// SERVICE CLASS
// =====================================================

@Injectable()
export class ProductInfoService {
  private readonly logger = new Logger(ProductInfoService.name);

  /**
   * Tenta responder pergunta sobre informação de produto
   * Retorna null se não for pergunta de produto ou não encontrar
   */
  async tryAnswerProductInfo(salonId: string, message: string): Promise<string | null> {
    // 1) Verifica se é pergunta sobre produto
    if (!isProductInfoQuestion(message)) {
      return null;
    }

    this.logger.debug(`Detectada pergunta de produto: "${message}"`);

    // 2) Busca produtos do salão
    const allProducts = await this.getActiveProducts(salonId);

    if (allProducts.length === 0) {
      this.logger.warn(`Nenhum produto ativo para salão ${salonId}`);
      return null;
    }

    // 3) Faz matching fuzzy
    const messageNorm = normalizeText(message);
    let bestMatch: ProductInfo | null = null;
    let bestScore = 0;

    for (const prod of allProducts) {
      const prodNameNorm = normalizeText(prod.name);
      const score = calculateMatchScore(messageNorm, prodNameNorm);

      this.logger.debug(`Match score para "${prod.name}": ${score.toFixed(3)}`);

      if (score > bestScore && score >= MATCH_THRESHOLD) {
        bestScore = score;
        bestMatch = prod;
      }
    }

    // 4) Formata resposta
    if (bestMatch) {
      this.logger.log(`Produto encontrado: "${bestMatch.name}" (score: ${bestScore.toFixed(3)})`);
      return formatExpertResponse(bestMatch);
    }

    // Não encontrou produto, retorna resposta de desambiguação
    this.logger.debug(`Nenhum produto encontrado acima do threshold (${MATCH_THRESHOLD})`);
    return formatNotFoundResponse();
  }

  /**
   * Busca produtos ativos e habilitados para Alexis
   */
  private async getActiveProducts(salonId: string): Promise<ProductInfo[]> {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        brand: products.brand,
        category: products.category,
        description: products.description,
        benefits: products.benefits,
        howToUse: products.howToUse,
        contraindications: products.contraindications,
        ingredients: products.ingredients,
        salePrice: products.salePrice,
        alexisMeta: products.alexisMeta,
      })
      .from(products)
      .where(
        and(
          eq(products.salonId, salonId),
          eq(products.active, true),
          eq(products.alexisEnabled, true),
        ),
      );

    return result;
  }
}
