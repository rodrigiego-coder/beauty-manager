import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../database/connection';
import { products, productAliases, globalProductPolicies } from '../../database/schema';
import { eq, and, or, ilike, sql } from 'drizzle-orm';

/**
 * =====================================================
 * ALEXIS CATALOG SERVICE (ALFA.2)
 * Motor de catálogo para recomendação de produtos
 * - Resolve produtos por nome/alias
 * - Verifica políticas (global + salão)
 * - Formata disponibilidade + copy
 * =====================================================
 */

// =====================================================
// TYPES
// =====================================================

export interface ProductMatch {
  id: number;
  name: string;
  catalogCode: string | null;
  description: string | null;
  salePrice: string;
  stockRetail: number;
  isSystemDefault: boolean;
  alexisEnabled: boolean;
  alexisMeta: {
    summary?: string;
    indications?: string[];
    actives?: string[];
    benefits?: string[];
    howToUse?: string;
    precautions?: string;
    upsellHooks?: string[];
  } | null;
  brand: string | null;
  category: string | null;
}

export interface ResolveResult {
  found: boolean;
  product: ProductMatch | null;
  alternatives: ProductMatch[];
  blocked: boolean;
  blockReason?: string;
}

export interface AvailabilityCopy {
  message: string;
  inStock: boolean;
  canReserve: boolean;
  suggestHandover: boolean;
}

// =====================================================
// PURE FUNCTIONS (testáveis isoladamente)
// =====================================================

/**
 * Normaliza texto para busca: lowercase, remove acentos, trim
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Verifica se o termo de busca corresponde ao nome do produto
 * Retorna score de confiança (0-1)
 */
export function matchScore(searchNorm: string, productNameNorm: string): number {
  // Match exato
  if (searchNorm === productNameNorm) return 1.0;

  // Produto começa com o termo
  if (productNameNorm.startsWith(searchNorm)) return 0.9;

  // Termo está contido no nome do produto
  if (productNameNorm.includes(searchNorm)) return 0.7;

  // Palavras do termo estão no nome
  const searchWords = searchNorm.split(/\s+/).filter(w => w.length > 2);
  const productWords = productNameNorm.split(/\s+/);
  const matchedWords = searchWords.filter(sw =>
    productWords.some(pw => pw.includes(sw) || sw.includes(pw))
  );
  if (matchedWords.length > 0) {
    return 0.5 * (matchedWords.length / searchWords.length);
  }

  return 0;
}

/**
 * Formata copy de disponibilidade baseado no estoque
 */
export function formatAvailabilityCopy(
  product: ProductMatch,
  canReserve: boolean,
): AvailabilityCopy {
  const inStock = product.stockRetail > 0;
  const summary = product.alexisMeta?.summary || product.description || '';

  if (inStock) {
    return {
      message: `*${product.name}* ${summary ? `- ${summary}` : ''}

Temos disponivel no salao! O valor e R$ ${product.salePrice}.

Quer que eu chame a recepcao pra separar pra voce?`,
      inStock: true,
      canReserve,
      suggestHandover: canReserve,
    };
  }

  // Sem estoque
  return {
    message: `*${product.name}* ${summary ? `- ${summary}` : ''}

No momento estamos sem estoque desse produto.

${canReserve
  ? 'Quer que eu avise a recepcao pra te avisar quando chegar?'
  : 'Quer falar com a recepcao pra mais informacoes?'}`,
    inStock: false,
    canReserve,
    suggestHandover: true,
  };
}

/**
 * Formata resposta quando há múltiplas correspondências
 */
export function formatMultipleMatchesCopy(matches: ProductMatch[]): string {
  const list = matches
    .slice(0, 5)
    .map((p, i) => `${i + 1}. *${p.name}* - R$ ${p.salePrice}`)
    .join('\n');

  return `Encontrei alguns produtos que podem ser o que voce procura:

${list}

Qual deles voce quer saber mais?`;
}

/**
 * Formata resposta quando produto está bloqueado
 */
export function formatBlockedCopy(productName: string, alternatives: ProductMatch[]): string {
  if (alternatives.length === 0) {
    return `Desculpe, *${productName}* nao esta disponivel para indicacao no momento.

Quer que eu chame a recepcao pra te ajudar?`;
  }

  const altList = alternatives
    .slice(0, 3)
    .map(p => `- *${p.name}*: ${p.alexisMeta?.summary || p.description || ''}`)
    .join('\n');

  return `Desculpe, *${productName}* nao esta disponivel para indicacao no momento.

Posso sugerir algumas alternativas:
${altList}

Quer saber mais sobre algum desses?`;
}

// =====================================================
// SERVICE CLASS
// =====================================================

@Injectable()
export class AlexisCatalogService {
  private readonly logger = new Logger(AlexisCatalogService.name);

  /**
   * Resolve produto por nome ou alias
   * Retorna o produto encontrado ou lista de candidatos
   */
  async resolveProduct(salonId: string, searchTerm: string): Promise<ResolveResult> {
    const searchNorm = normalizeText(searchTerm);

    if (searchNorm.length < 2) {
      return { found: false, product: null, alternatives: [], blocked: false };
    }

    // 1) Busca por alias exato (normalizado)
    const aliasMatch = await this.findByAlias(salonId, searchNorm);
    if (aliasMatch) {
      const policyCheck = await this.checkPolicy(salonId, aliasMatch);
      if (!policyCheck.allowed) {
        const alternatives = await this.findAlternatives(salonId, aliasMatch.category);
        return {
          found: true,
          product: aliasMatch,
          alternatives,
          blocked: true,
          blockReason: policyCheck.reason,
        };
      }
      return { found: true, product: aliasMatch, alternatives: [], blocked: false };
    }

    // 2) Busca por nome (fuzzy)
    const candidates = await this.findByName(salonId, searchNorm);

    if (candidates.length === 0) {
      return { found: false, product: null, alternatives: [], blocked: false };
    }

    if (candidates.length === 1) {
      const product = candidates[0];
      const policyCheck = await this.checkPolicy(salonId, product);
      if (!policyCheck.allowed) {
        const alternatives = await this.findAlternatives(salonId, product.category);
        return {
          found: true,
          product,
          alternatives,
          blocked: true,
          blockReason: policyCheck.reason,
        };
      }
      return { found: true, product, alternatives: [], blocked: false };
    }

    // Múltiplas correspondências - filtrar bloqueados
    const allowedCandidates: ProductMatch[] = [];
    for (const c of candidates) {
      const check = await this.checkPolicy(salonId, c);
      if (check.allowed) {
        allowedCandidates.push(c);
      }
    }

    return {
      found: false,
      product: null,
      alternatives: allowedCandidates,
      blocked: false,
    };
  }

  /**
   * Busca produto por alias normalizado
   */
  private async findByAlias(salonId: string, aliasNorm: string): Promise<ProductMatch | null> {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        catalogCode: products.catalogCode,
        description: products.description,
        salePrice: products.salePrice,
        stockRetail: products.stockRetail,
        isSystemDefault: products.isSystemDefault,
        alexisEnabled: products.alexisEnabled,
        alexisMeta: products.alexisMeta,
        brand: products.brand,
        category: products.category,
      })
      .from(productAliases)
      .innerJoin(products, eq(productAliases.productId, products.id))
      .where(
        and(
          eq(productAliases.salonId, salonId),
          eq(productAliases.aliasNorm, aliasNorm),
          eq(products.active, true),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * Busca produtos por nome (fuzzy match)
   */
  private async findByName(salonId: string, searchNorm: string): Promise<ProductMatch[]> {
    // Busca produtos do salão que contenham o termo
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        catalogCode: products.catalogCode,
        description: products.description,
        salePrice: products.salePrice,
        stockRetail: products.stockRetail,
        isSystemDefault: products.isSystemDefault,
        alexisEnabled: products.alexisEnabled,
        alexisMeta: products.alexisMeta,
        brand: products.brand,
        category: products.category,
      })
      .from(products)
      .where(
        and(
          eq(products.salonId, salonId),
          eq(products.active, true),
          or(
            ilike(products.name, `%${searchNorm}%`),
            ilike(products.brand, `%${searchNorm}%`),
          ),
        ),
      )
      .limit(10);

    // Ordena por score de match
    return result
      .map(p => ({
        ...p,
        _score: matchScore(searchNorm, normalizeText(p.name)),
      }))
      .sort((a, b) => b._score - a._score)
      .filter(p => p._score > 0.3)
      .map(({ _score, ...p }) => p);
  }

  /**
   * Verifica política de recomendação do produto
   * - System default: verifica global_product_policies
   * - Produto do salão: verifica alexisEnabled
   */
  async checkPolicy(
    _salonId: string, // Reserved for future per-salon policy overrides
    product: ProductMatch,
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Se é system default, verifica política global
    if (product.isSystemDefault && product.catalogCode) {
      const globalPolicy = await db
        .select()
        .from(globalProductPolicies)
        .where(eq(globalProductPolicies.catalogCode, product.catalogCode))
        .limit(1);

      // Se não existe política, assume permitido
      if (globalPolicy.length === 0) {
        return { allowed: true };
      }

      // Se existe e está desabilitado
      if (!globalPolicy[0].isEnabled) {
        return {
          allowed: false,
          reason: globalPolicy[0].reason || 'Produto temporariamente indisponível para recomendação',
        };
      }

      return { allowed: true };
    }

    // Produto do salão: verifica alexisEnabled
    if (!product.alexisEnabled) {
      return {
        allowed: false,
        reason: 'Produto desabilitado para recomendação automática pelo salão',
      };
    }

    return { allowed: true };
  }

  /**
   * Busca produtos alternativos na mesma categoria
   */
  private async findAlternatives(
    salonId: string,
    category: string | null,
  ): Promise<ProductMatch[]> {
    if (!category) return [];

    const result = await db
      .select({
        id: products.id,
        name: products.name,
        catalogCode: products.catalogCode,
        description: products.description,
        salePrice: products.salePrice,
        stockRetail: products.stockRetail,
        isSystemDefault: products.isSystemDefault,
        alexisEnabled: products.alexisEnabled,
        alexisMeta: products.alexisMeta,
        brand: products.brand,
        category: products.category,
      })
      .from(products)
      .where(
        and(
          eq(products.salonId, salonId),
          eq(products.active, true),
          eq(products.alexisEnabled, true),
          eq(products.category, category),
          sql`${products.stockRetail} > 0`,
        ),
      )
      .limit(5);

    // Filtra por política global também
    const allowed: ProductMatch[] = [];
    for (const p of result) {
      const check = await this.checkPolicy(salonId, p);
      if (check.allowed) {
        allowed.push(p);
      }
    }

    return allowed;
  }

  /**
   * Handler principal para intent PRODUCT_INFO
   * Retorna a copy formatada para o cliente
   */
  async handleProductIntent(
    salonId: string,
    message: string,
    canReserve: boolean = false,
  ): Promise<string> {
    // Extrai possíveis termos de produto da mensagem
    const searchTerm = this.extractProductTerm(message);

    if (!searchTerm) {
      return this.getGenericProductResponse(salonId);
    }

    this.logger.debug(`Buscando produto: "${searchTerm}" para salão ${salonId}`);

    const result = await this.resolveProduct(salonId, searchTerm);

    // Nenhum produto encontrado
    if (!result.found && result.alternatives.length === 0) {
      return `Nao encontrei um produto com esse nome no nosso catalogo.

Quer que eu liste os produtos disponiveis ou chame a recepcao pra te ajudar?`;
    }

    // Múltiplas correspondências
    if (!result.found && result.alternatives.length > 0) {
      return formatMultipleMatchesCopy(result.alternatives);
    }

    // Produto encontrado mas bloqueado
    if (result.blocked && result.product) {
      return formatBlockedCopy(result.product.name, result.alternatives);
    }

    // Produto encontrado e permitido
    if (result.product) {
      const availability = formatAvailabilityCopy(result.product, canReserve);
      return availability.message;
    }

    // Fallback
    return `Desculpe, nao consegui verificar esse produto no momento.

Quer que eu chame a recepcao pra te ajudar?`;
  }

  /**
   * Extrai o termo de busca de produto da mensagem
   */
  private extractProductTerm(message: string): string | null {
    const lower = message.toLowerCase();

    // Padrões comuns: "tem X?", "vocês tem X", "quero X", "preço do X"
    const patterns = [
      /tem\s+(.+?)\s*\??$/i,
      /voces?\s+tem\s+(.+?)\s*\??$/i,
      /quero\s+(?:o|a|um|uma)?\s*(.+?)$/i,
      /preco\s+(?:do|da|de)?\s*(.+?)$/i,
      /valor\s+(?:do|da|de)?\s*(.+?)$/i,
      /quanto\s+(?:custa|e|fica)\s+(?:o|a)?\s*(.+?)$/i,
      /estoque\s+(?:do|da|de)?\s*(.+?)$/i,
      /disponivel\s+(?:o|a)?\s*(.+?)$/i,
    ];

    for (const pattern of patterns) {
      const match = lower.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Se nenhum padrão, tenta extrair substantivos após keywords de produto
    const productKeywords = ['produto', 'shampoo', 'condicionador', 'mascara', 'creme', 'oleo', 'hidratante'];
    for (const keyword of productKeywords) {
      if (lower.includes(keyword)) {
        // Retorna a mensagem completa para busca fuzzy
        return message.replace(/[?!.,]/g, '').trim();
      }
    }

    return null;
  }

  /**
   * Resposta genérica quando não há produto específico mencionado
   */
  private async getGenericProductResponse(salonId: string): Promise<string> {
    // Lista alguns produtos disponíveis
    const featuredProducts = await db
      .select({
        name: products.name,
        salePrice: products.salePrice,
        category: products.category,
      })
      .from(products)
      .where(
        and(
          eq(products.salonId, salonId),
          eq(products.active, true),
          eq(products.alexisEnabled, true),
          sql`${products.stockRetail} > 0`,
        ),
      )
      .limit(6);

    if (featuredProducts.length === 0) {
      return `No momento nao tenho informacoes sobre produtos disponiveis.

Quer que eu chame a recepcao pra te ajudar?`;
    }

    const list = featuredProducts
      .map(p => `- *${p.name}* - R$ ${p.salePrice}`)
      .join('\n');

    return `Temos varios produtos disponiveis! Alguns deles:

${list}

Qual deles voce gostaria de saber mais?`;
  }
}
