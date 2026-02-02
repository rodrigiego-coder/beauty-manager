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
exports.ProductInfoService = void 0;
exports.normalizeText = normalizeText;
exports.extractTokens = extractTokens;
exports.getBigrams = getBigrams;
exports.diceCoefficient = diceCoefficient;
exports.isProductInfoQuestion = isProductInfoQuestion;
exports.calculateMatchScore = calculateMatchScore;
exports.formatExpertResponse = formatExpertResponse;
exports.formatNotFoundResponse = formatNotFoundResponse;
const common_1 = require("@nestjs/common");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
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
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
        .replace(/[^\w\s]/g, ' ') // remove pontuação
        .replace(/\s+/g, ' ') // colapsa espaços
        .trim();
}
/**
 * Extrai tokens relevantes (sem stopwords, >= 3 chars)
 */
function extractTokens(textNorm) {
    return textNorm
        .split(' ')
        .filter(t => t.length >= 3 && !STOPWORDS.has(t));
}
/**
 * Gera bigramas de caracteres para comparação fuzzy
 */
function getBigrams(text) {
    const bigrams = new Set();
    for (let i = 0; i < text.length - 1; i++) {
        bigrams.add(text.slice(i, i + 2));
    }
    return bigrams;
}
/**
 * Calcula Dice coefficient entre dois conjuntos de bigramas
 */
function diceCoefficient(set1, set2) {
    if (set1.size === 0 || set2.size === 0)
        return 0;
    let intersection = 0;
    for (const b of set1) {
        if (set2.has(b))
            intersection++;
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
function isProductInfoQuestion(message) {
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
function calculateMatchScore(messageNorm, productNameNorm) {
    // Score por token overlap
    const msgTokens = extractTokens(messageNorm);
    const prodTokens = extractTokens(productNameNorm);
    if (prodTokens.length === 0)
        return 0;
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
function formatExpertResponse(product) {
    const meta = product.alexisMeta;
    const parts = [];
    // Header com nome e marca
    const header = product.brand
        ? `*${product.name}* (${product.brand})`
        : `*${product.name}*`;
    // Summary/Description
    const summary = meta?.summary || product.description;
    if (summary) {
        parts.push(`${header}: ${summary}`);
    }
    else {
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
    }
    else if (product.ingredients) {
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
function formatNotFoundResponse() {
    return `Nao consegui identificar o produto que voce mencionou. Pode me dizer o nome completo ou descrever melhor? Assim consigo te dar informacoes detalhadas sobre ativos, beneficios e modo de uso.`;
}
// =====================================================
// SERVICE CLASS
// =====================================================
let ProductInfoService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ProductInfoService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ProductInfoService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = new common_1.Logger(ProductInfoService.name);
        /**
         * Tenta responder pergunta sobre informação de produto
         * Retorna null se não for pergunta de produto ou não encontrar
         */
        async tryAnswerProductInfo(salonId, message) {
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
            let bestMatch = null;
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
        async getActiveProducts(salonId) {
            const result = await connection_1.db
                .select({
                id: schema_1.products.id,
                name: schema_1.products.name,
                brand: schema_1.products.brand,
                category: schema_1.products.category,
                description: schema_1.products.description,
                benefits: schema_1.products.benefits,
                howToUse: schema_1.products.howToUse,
                contraindications: schema_1.products.contraindications,
                ingredients: schema_1.products.ingredients,
                salePrice: schema_1.products.salePrice,
                alexisMeta: schema_1.products.alexisMeta,
            })
                .from(schema_1.products)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.products.active, true), (0, drizzle_orm_1.eq)(schema_1.products.alexisEnabled, true)));
            return result;
        }
    };
    return ProductInfoService = _classThis;
})();
exports.ProductInfoService = ProductInfoService;
//# sourceMappingURL=product-info.service.js.map