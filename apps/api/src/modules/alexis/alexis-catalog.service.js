"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlexisCatalogService = void 0;
exports.normalizeText = normalizeText;
exports.matchScore = matchScore;
exports.calculateTotalStock = calculateTotalStock;
exports.formatPrice = formatPrice;
exports.formatAvailabilityCopy = formatAvailabilityCopy;
exports.formatMultipleMatchesCopy = formatMultipleMatchesCopy;
exports.formatBlockedCopy = formatBlockedCopy;
const common_1 = require("@nestjs/common");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
// =====================================================
// PURE FUNCTIONS (testáveis isoladamente)
// =====================================================
/**
 * Normaliza texto para busca: lowercase, remove acentos, trim
 */
function normalizeText(text) {
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
function matchScore(searchNorm, productNameNorm) {
    // Match exato
    if (searchNorm === productNameNorm)
        return 1.0;
    // Produto começa com o termo
    if (productNameNorm.startsWith(searchNorm))
        return 0.9;
    // Termo está contido no nome do produto
    if (productNameNorm.includes(searchNorm))
        return 0.7;
    // Palavras do termo estão no nome
    const searchWords = searchNorm.split(/\s+/).filter(w => w.length > 2);
    const productWords = productNameNorm.split(/\s+/);
    const matchedWords = searchWords.filter(sw => productWords.some(pw => pw.includes(sw) || sw.includes(pw)));
    if (matchedWords.length > 0) {
        return 0.5 * (matchedWords.length / searchWords.length);
    }
    return 0;
}
/**
 * Calcula estoque total (retail + internal)
 * ALFA.3: usa stock_retail + stock_internal do schema real
 */
function calculateTotalStock(product) {
    const retail = product.stockRetail ?? 0;
    const internal = product.stockInternal ?? 0;
    return retail + internal;
}
/**
 * Formata preço para exibição
 * ALFA.3: sale_price é numeric. Se null/0, retorna "sob consulta"
 */
function formatPrice(salePrice) {
    if (!salePrice)
        return 'sob consulta com a recepcao';
    const price = parseFloat(salePrice);
    if (isNaN(price) || price <= 0)
        return 'sob consulta com a recepcao';
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
}
/**
 * Formata copy de disponibilidade baseado no estoque
 * ALFA.3: usa totalStock (retail + internal) e trata price=0/null
 */
function formatAvailabilityCopy(product, canReserve) {
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
function formatMultipleMatchesCopy(matches) {
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
function formatBlockedCopy(productName, alternatives) {
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
let AlexisCatalogService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AlexisCatalogService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AlexisCatalogService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = new common_1.Logger(AlexisCatalogService.name);
        /**
         * Resolve produto por nome ou alias
         * ALFA.3: usa substring matching para aliases (maior alias contido na msg)
         */
        async resolveProduct(salonId, searchTerm) {
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
            const allowedCandidates = [];
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
        async findByAliasSubstring(salonId, messageNorm) {
            // Busca todos os aliases do salão
            const allAliases = await connection_1.db
                .select({
                aliasNorm: schema_1.productAliases.aliasNorm,
                id: schema_1.products.id,
                name: schema_1.products.name,
                catalogCode: schema_1.products.catalogCode,
                description: schema_1.products.description,
                salePrice: schema_1.products.salePrice,
                stockRetail: schema_1.products.stockRetail,
                stockInternal: schema_1.products.stockInternal,
                isSystemDefault: schema_1.products.isSystemDefault,
                alexisEnabled: schema_1.products.alexisEnabled,
                alexisMeta: schema_1.products.alexisMeta,
                brand: schema_1.products.brand,
                category: schema_1.products.category,
            })
                .from(schema_1.productAliases)
                .innerJoin(schema_1.products, (0, drizzle_orm_1.eq)(schema_1.productAliases.productId, schema_1.products.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.productAliases.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.products.active, true)));
            // Filtra aliases que estão contidos na mensagem
            const matches = allAliases.filter(a => messageNorm.includes(a.aliasNorm));
            if (matches.length === 0) {
                return null;
            }
            // Escolhe o alias mais longo (mais específico)
            const best = matches.reduce((prev, curr) => curr.aliasNorm.length > prev.aliasNorm.length ? curr : prev);
            // Remove aliasNorm do retorno (não faz parte de ProductMatch)
            const { aliasNorm: _alias, ...product } = best;
            return product;
        }
        /**
         * Busca produtos por nome (fuzzy match)
         * ALFA.3: inclui stockInternal
         */
        async findByName(salonId, searchNorm) {
            // Busca produtos do salão que contenham o termo
            const result = await connection_1.db
                .select({
                id: schema_1.products.id,
                name: schema_1.products.name,
                catalogCode: schema_1.products.catalogCode,
                description: schema_1.products.description,
                salePrice: schema_1.products.salePrice,
                stockRetail: schema_1.products.stockRetail,
                stockInternal: schema_1.products.stockInternal,
                isSystemDefault: schema_1.products.isSystemDefault,
                alexisEnabled: schema_1.products.alexisEnabled,
                alexisMeta: schema_1.products.alexisMeta,
                brand: schema_1.products.brand,
                category: schema_1.products.category,
            })
                .from(schema_1.products)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.products.active, true), (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.products.name, `%${searchNorm}%`), (0, drizzle_orm_1.ilike)(schema_1.products.brand, `%${searchNorm}%`))))
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
        async checkPolicy(_salonId, // Reserved for future per-salon policy overrides
        product) {
            // Se é system default, verifica política global
            if (product.isSystemDefault && product.catalogCode) {
                const globalPolicy = await connection_1.db
                    .select()
                    .from(schema_1.globalProductPolicies)
                    .where((0, drizzle_orm_1.eq)(schema_1.globalProductPolicies.catalogCode, product.catalogCode))
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
        async findAlternatives(salonId, category) {
            if (!category)
                return [];
            const result = await connection_1.db
                .select({
                id: schema_1.products.id,
                name: schema_1.products.name,
                catalogCode: schema_1.products.catalogCode,
                description: schema_1.products.description,
                salePrice: schema_1.products.salePrice,
                stockRetail: schema_1.products.stockRetail,
                stockInternal: schema_1.products.stockInternal,
                isSystemDefault: schema_1.products.isSystemDefault,
                alexisEnabled: schema_1.products.alexisEnabled,
                alexisMeta: schema_1.products.alexisMeta,
                brand: schema_1.products.brand,
                category: schema_1.products.category,
            })
                .from(schema_1.products)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.products.active, true), (0, drizzle_orm_1.eq)(schema_1.products.alexisEnabled, true), (0, drizzle_orm_1.eq)(schema_1.products.category, category), (0, drizzle_orm_1.sql) `(COALESCE(${schema_1.products.stockRetail}, 0) + COALESCE(${schema_1.products.stockInternal}, 0)) > 0`))
                .limit(5);
            // Filtra por política global também
            const allowed = [];
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
        async handleProductIntent(salonId, message, canReserve = false) {
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
        async getGenericProductResponse(salonId) {
            // Lista alguns produtos disponíveis com estoque
            const featuredProducts = await connection_1.db
                .select({
                name: schema_1.products.name,
                salePrice: schema_1.products.salePrice,
                category: schema_1.products.category,
            })
                .from(schema_1.products)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.products.active, true), (0, drizzle_orm_1.eq)(schema_1.products.alexisEnabled, true), (0, drizzle_orm_1.sql) `(COALESCE(${schema_1.products.stockRetail}, 0) + COALESCE(${schema_1.products.stockInternal}, 0)) > 0`))
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
    };
    return AlexisCatalogService = _classThis;
})();
exports.AlexisCatalogService = AlexisCatalogService;
//# sourceMappingURL=alexis-catalog.service.js.map