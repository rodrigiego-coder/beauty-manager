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
  stockInternal: number; // ALFA.3: added for total stock calculation
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
 * Calcula estoque total (retail + internal)
 * ALFA.3: usa stock_retail + stock_internal do schema real
 */
export function calculateTotalStock(product: ProductMatch): number {
  const retail = product.stockRetail ?? 0;
  const internal = product.stockInternal ?? 0;
  return retail + internal;
}

/**
 * Formata preço para exibição
 * ALFA.3: sale_price é numeric. Se null/0, retorna "sob consulta"
 */
export function formatPrice(salePrice: string | null): string {
  if (!salePrice) return 'sob consulta com a recepcao';
  const price = parseFloat(salePrice);
  if (isNaN(price) || price <= 0) return 'sob consulta com a recepcao';
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

/**
 * Formata copy de disponibilidade baseado no estoque
 * ALFA.3: usa totalStock (retail + internal) e trata price=0/null
 */
export function formatAvailabilityCopy(
  product: ProductMatch,
  canReserve: boolean,
): AvailabilityCopy {
  const totalStock = calculateTotalStock(product);
  const inStock = totalStock > 0;
  const summary = product.alexisMeta?.summary || product.description || '';
  const priceText = formatPrice(product.salePrice);

  if (inStock) {
    return {
      message: `*${product.name}* ${summary ? `- ${summary}` : ''}

Temos disponivel no salao! O valor e ${priceText}.

Quer que eu chame a recepcao pra separar pra voce?`,
      inStock: true,
      canReserve,
      suggestHandover: canReserve,
    };
  }

  // Sem estoque - ainda mostra info do produto (ALFA.3)
  return {
    message: `*${product.name}* ${summary ? `- ${summary}` : ''}

O valor e ${priceText}.

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
   * ALFA.3: usa substring matching para aliases (maior alias contido na msg)
   */
  async resolveProduct(salonId: string, searchTerm: string): Promise<ResolveResult> {
    const searchNorm = normalizeText(searchTerm);

    if (searchNorm.length < 2) {
      return { found: false, product: null, alternatives: [], blocked: false };
    }

    // 1) Busca por alias substring (maior alias contido na mensagem)
    const aliasMatch = await this.findByAliasSubstring(salonId, searchNorm);
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
   * Busca produto por alias usando substring matching
   * ALFA.3: Encontra o alias mais longo contido na mensagem normalizada
   */
  private async findByAliasSubstring(salonId: string, messageNorm: string): Promise<ProductMatch | null> {
    // Busca todos os aliases do salão
    const allAliases = await db
      .select({
        aliasNorm: productAliases.aliasNorm,
        id: products.id,
        name: products.name,
        catalogCode: products.catalogCode,
        description: products.description,
        salePrice: products.salePrice,
        stockRetail: products.stockRetail,
        stockInternal: products.stockInternal,
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
          eq(products.active, true),
        ),
      );

    // Filtra aliases que estão contidos na mensagem
    const matches = allAliases.filter(a => messageNorm.includes(a.aliasNorm));

    if (matches.length === 0) {
      return null;
    }

    // Escolhe o alias mais longo (mais específico)
    const best = matches.reduce((prev, curr) =>
      curr.aliasNorm.length > prev.aliasNorm.length ? curr : prev
    );

    // Remove aliasNorm do retorno (não faz parte de ProductMatch)
    const { aliasNorm: _alias, ...product } = best;
    return product;
  }

  /**
   * Busca produtos por nome (fuzzy match)
   * ALFA.3: inclui stockInternal
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
        stockInternal: products.stockInternal,
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
   * ALFA.3: inclui stockInternal, usa total stock > 0
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
        stockInternal: products.stockInternal,
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
          sql`(COALESCE(${products.stockRetail}, 0) + COALESCE(${products.stockInternal}, 0)) > 0`,
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
   * Handler principal para intent PRODUCT_INFO / PRICE_INFO
   * ALFA.3: usa mensagem completa para substring matching
   */
  async handleProductIntent(
    salonId: string,
    message: string,
    canReserve: boolean = false,
  ): Promise<string> {
    // ALFA.3: Usa a mensagem completa para substring matching
    // Isso permite encontrar "encanthus" em "me fala do encanthus"
    const messageNorm = normalizeText(message);

    this.logger.debug(`Buscando produto na mensagem: "${messageNorm}" para salão ${salonId}`);

    // Tenta resolver usando a mensagem completa (substring match nos aliases)
    const result = await this.resolveProduct(salonId, message);

    // Nenhum produto encontrado - oferece lista de produtos disponíveis
    if (!result.found && result.alternatives.length === 0) {
      return this.getGenericProductResponse(salonId);
    }

    // Múltiplas correspondências
    if (!result.found && result.alternatives.length > 0) {
      return formatMultipleMatchesCopy(result.alternatives);
    }

    // Produto encontrado mas bloqueado
    if (result.blocked && result.product) {
      return formatBlockedCopy(result.product.name, result.alternatives);
    }

    // Produto encontrado e permitido (mesmo sem estoque - ALFA.3)
    if (result.product) {
      const availability = formatAvailabilityCopy(result.product, canReserve);
      return availability.message;
    }

    // Fallback
    return `Desculpe, nao consegui verificar esse produto no momento.

Quer que eu chame a recepcao pra te ajudar?`;
  }

  /**
   * Resposta genérica quando não há produto específico mencionado
   * ALFA.3: usa total stock (retail + internal)
   */
  private async getGenericProductResponse(salonId: string): Promise<string> {
    // Lista alguns produtos disponíveis com estoque
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
          sql`(COALESCE(${products.stockRetail}, 0) + COALESCE(${products.stockInternal}, 0)) > 0`,
        ),
      )
      .limit(6);

    if (featuredProducts.length === 0) {
      return `No momento nao tenho informacoes sobre produtos disponiveis.

Quer que eu chame a recepcao pra te ajudar?`;
    }

    const list = featuredProducts
      .map(p => `- *${p.name}* - ${formatPrice(p.salePrice)}`)
      .join('\n');

    return `Temos varios produtos disponiveis! Alguns deles:

${list}

Qual deles voce gostaria de saber mais?`;
  }
}
