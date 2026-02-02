"use strict";
/**
 * =====================================================
 * PRODUCT INFO SERVICE - TESTES UNITÁRIOS (CHARLIE)
 * Detecção determinística de perguntas sobre produtos
 * =====================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
const product_info_service_1 = require("./product-info.service");
describe('ProductInfoService - Pure Functions', () => {
    // =====================================================
    // normalizeText
    // =====================================================
    describe('normalizeText', () => {
        it('should lowercase text', () => {
            expect((0, product_info_service_1.normalizeText)('ULTRA RECONSTRUÇÃO')).toBe('ultra reconstrucao');
        });
        it('should remove accents', () => {
            expect((0, product_info_service_1.normalizeText)('Reconstrução Intensa')).toBe('reconstrucao intensa');
            expect((0, product_info_service_1.normalizeText)('máscara nutritiva')).toBe('mascara nutritiva');
        });
        it('should remove punctuation', () => {
            expect((0, product_info_service_1.normalizeText)('pra que serve?')).toBe('pra que serve');
            expect((0, product_info_service_1.normalizeText)('olá, qual o preço?!')).toBe('ola qual o preco');
        });
        it('should collapse multiple spaces', () => {
            expect((0, product_info_service_1.normalizeText)('ultra   reconstrução')).toBe('ultra reconstrucao');
        });
        it('should trim whitespace', () => {
            expect((0, product_info_service_1.normalizeText)('  encanthus  ')).toBe('encanthus');
        });
    });
    // =====================================================
    // extractTokens
    // =====================================================
    describe('extractTokens', () => {
        it('should filter stopwords', () => {
            const tokens = (0, product_info_service_1.extractTokens)('pra que serve o encanthus');
            expect(tokens).not.toContain('pra');
            expect(tokens).not.toContain('que');
            expect(tokens).toContain('encanthus');
        });
        it('should filter tokens shorter than 3 chars', () => {
            const tokens = (0, product_info_service_1.extractTokens)('o ek vitali e bom');
            expect(tokens).not.toContain('ek'); // 2 chars - filtered
            expect(tokens).toContain('bom'); // 3 chars - included
            expect(tokens).toContain('vitali');
        });
        it('should extract relevant tokens', () => {
            const tokens = (0, product_info_service_1.extractTokens)('ultra reconstrucao intense');
            expect(tokens).toContain('ultra');
            expect(tokens).toContain('reconstrucao');
            expect(tokens).toContain('intense');
        });
    });
    // =====================================================
    // getBigrams
    // =====================================================
    describe('getBigrams', () => {
        it('should generate character bigrams', () => {
            const bigrams = (0, product_info_service_1.getBigrams)('abc');
            expect(bigrams.has('ab')).toBe(true);
            expect(bigrams.has('bc')).toBe(true);
            expect(bigrams.size).toBe(2);
        });
        it('should return empty set for single char', () => {
            expect((0, product_info_service_1.getBigrams)('a').size).toBe(0);
        });
        it('should handle repeated characters', () => {
            const bigrams = (0, product_info_service_1.getBigrams)('aab');
            expect(bigrams.has('aa')).toBe(true);
            expect(bigrams.has('ab')).toBe(true);
        });
    });
    // =====================================================
    // diceCoefficient
    // =====================================================
    describe('diceCoefficient', () => {
        it('should return 1.0 for identical sets', () => {
            const set = new Set(['ab', 'bc', 'cd']);
            expect((0, product_info_service_1.diceCoefficient)(set, set)).toBe(1.0);
        });
        it('should return 0 for disjoint sets', () => {
            const set1 = new Set(['ab', 'bc']);
            const set2 = new Set(['xy', 'yz']);
            expect((0, product_info_service_1.diceCoefficient)(set1, set2)).toBe(0);
        });
        it('should return 0 for empty sets', () => {
            expect((0, product_info_service_1.diceCoefficient)(new Set(), new Set(['ab']))).toBe(0);
            expect((0, product_info_service_1.diceCoefficient)(new Set(['ab']), new Set())).toBe(0);
        });
        it('should return partial match for overlapping sets', () => {
            const set1 = new Set(['ab', 'bc', 'cd']);
            const set2 = new Set(['bc', 'cd', 'de']);
            // intersection = 2, sum = 6, dice = 4/6 = 0.666...
            expect((0, product_info_service_1.diceCoefficient)(set1, set2)).toBeCloseTo(0.667, 2);
        });
    });
    // =====================================================
    // isProductInfoQuestion
    // =====================================================
    describe('isProductInfoQuestion', () => {
        it('should detect "pra que serve"', () => {
            expect((0, product_info_service_1.isProductInfoQuestion)('pra que serve o ultra reconstrução?')).toBe(true);
            expect((0, product_info_service_1.isProductInfoQuestion)('Pra que serve Encanthus')).toBe(true);
        });
        it('should detect "para que serve"', () => {
            expect((0, product_info_service_1.isProductInfoQuestion)('para que serve esse produto?')).toBe(true);
        });
        it('should detect "como usar"', () => {
            expect((0, product_info_service_1.isProductInfoQuestion)('como usar o encanthus?')).toBe(true);
            expect((0, product_info_service_1.isProductInfoQuestion)('Como usa o shampoo?')).toBe(true);
        });
        it('should detect "beneficios"', () => {
            expect((0, product_info_service_1.isProductInfoQuestion)('quais os benefícios do produto?')).toBe(true);
        });
        it('should detect "indicacao"', () => {
            expect((0, product_info_service_1.isProductInfoQuestion)('qual a indicação?')).toBe(true);
            expect((0, product_info_service_1.isProductInfoQuestion)('indicado para que tipo de cabelo?')).toBe(true);
        });
        it('should detect "ativos"', () => {
            expect((0, product_info_service_1.isProductInfoQuestion)('quais os ativos?')).toBe(true);
            expect((0, product_info_service_1.isProductInfoQuestion)('qual o ativo principal?')).toBe(true);
        });
        it('should detect "ingredientes"', () => {
            expect((0, product_info_service_1.isProductInfoQuestion)('quais ingredientes tem?')).toBe(true);
        });
        it('should detect "contraindicacao"', () => {
            expect((0, product_info_service_1.isProductInfoQuestion)('tem contraindicação?')).toBe(true);
        });
        it('should detect "o que faz" variations', () => {
            expect((0, product_info_service_1.isProductInfoQuestion)('o que faz esse produto?')).toBe(true);
            expect((0, product_info_service_1.isProductInfoQuestion)('oque faz?')).toBe(true);
            expect((0, product_info_service_1.isProductInfoQuestion)('faz o que?')).toBe(true);
        });
        it('should NOT detect non-product questions', () => {
            expect((0, product_info_service_1.isProductInfoQuestion)('oi')).toBe(false);
            expect((0, product_info_service_1.isProductInfoQuestion)('quero agendar')).toBe(false);
            expect((0, product_info_service_1.isProductInfoQuestion)('qual o preço?')).toBe(false);
            expect((0, product_info_service_1.isProductInfoQuestion)('tem disponível?')).toBe(false);
        });
    });
    // =====================================================
    // calculateMatchScore
    // =====================================================
    describe('calculateMatchScore', () => {
        it('should return high score for exact match', () => {
            const score = (0, product_info_service_1.calculateMatchScore)('ultra reconstrucao', 'ultra reconstrucao');
            expect(score).toBeGreaterThan(0.8);
        });
        it('should return good score for partial token match', () => {
            const msgNorm = (0, product_info_service_1.normalizeText)('pra que serve o ultra reconstrução');
            const prodNorm = (0, product_info_service_1.normalizeText)('Ultra Reconstrução Intense');
            const score = (0, product_info_service_1.calculateMatchScore)(msgNorm, prodNorm);
            expect(score).toBeGreaterThan(0.28); // threshold
        });
        it('should handle typos via bigram similarity', () => {
            const msgNorm = (0, product_info_service_1.normalizeText)('pra que serve recontrução'); // typo
            const prodNorm = (0, product_info_service_1.normalizeText)('Reconstrução Intense');
            const score = (0, product_info_service_1.calculateMatchScore)(msgNorm, prodNorm);
            expect(score).toBeGreaterThan(0.2); // some match via bigrams
        });
        it('should return low score for unrelated products', () => {
            const msgNorm = (0, product_info_service_1.normalizeText)('pra que serve o shampoo roxo');
            const prodNorm = (0, product_info_service_1.normalizeText)('Ultra Reconstrução Intense');
            const score = (0, product_info_service_1.calculateMatchScore)(msgNorm, prodNorm);
            expect(score).toBeLessThan(0.28); // below threshold
        });
        it('should return 0 for empty product name', () => {
            expect((0, product_info_service_1.calculateMatchScore)('alguma mensagem', '')).toBe(0);
        });
    });
    // =====================================================
    // formatExpertResponse
    // =====================================================
    describe('formatExpertResponse', () => {
        const baseProduct = {
            id: 1,
            name: 'Ultra Reconstrução Intense',
            brand: 'Encanthus',
            category: 'Tratamento',
            description: 'Máscara de reconstrução intensa',
            benefits: ['Repara fios danificados', 'Devolve a força'],
            howToUse: 'Aplicar nos fios úmidos por 5 minutos',
            contraindications: 'Evitar contato com os olhos',
            ingredients: 'Queratina, Pantenol, Óleo de Argan',
            salePrice: '89.90',
            alexisMeta: null,
        };
        it('should include product name and brand in header', () => {
            const response = (0, product_info_service_1.formatExpertResponse)(baseProduct);
            expect(response).toContain('*Ultra Reconstrução Intense*');
            expect(response).toContain('(Encanthus)');
        });
        it('should include description when no alexisMeta', () => {
            const response = (0, product_info_service_1.formatExpertResponse)(baseProduct);
            expect(response).toContain('Máscara de reconstrução intensa');
        });
        it('should include benefits', () => {
            const response = (0, product_info_service_1.formatExpertResponse)(baseProduct);
            expect(response).toContain('Repara fios danificados');
        });
        it('should include how to use', () => {
            const response = (0, product_info_service_1.formatExpertResponse)(baseProduct);
            expect(response).toContain('*Como usar:*');
            expect(response).toContain('5 minutos');
        });
        it('should include precautions', () => {
            const response = (0, product_info_service_1.formatExpertResponse)(baseProduct);
            expect(response).toContain('*Cuidados:*');
            expect(response).toContain('Evitar contato');
        });
        it('should include CTA at the end', () => {
            const response = (0, product_info_service_1.formatExpertResponse)(baseProduct);
            expect(response).toContain('tipo de cabelo');
        });
        it('should prefer alexisMeta over traditional fields', () => {
            const productWithMeta = {
                ...baseProduct,
                alexisMeta: {
                    summary: 'Tratamento premium para cabelos muito danificados',
                    indications: ['Cabelos quimicamente tratados', 'Fios quebradiços'],
                    actives: ['Queratina hidrolisada', 'Ceramidas'],
                    benefits: ['Reconstrução profunda', 'Brilho intenso'],
                    howToUse: 'Aplicar mecha a mecha por 10 min',
                    precautions: 'Não usar em couro cabeludo',
                },
            };
            const response = (0, product_info_service_1.formatExpertResponse)(productWithMeta);
            expect(response).toContain('Tratamento premium'); // summary from meta
            expect(response).toContain('Cabelos quimicamente tratados'); // indications
            expect(response).toContain('Queratina hidrolisada'); // actives
            expect(response).toContain('10 min'); // howToUse from meta
            expect(response).toContain('Não usar em couro'); // precautions from meta
        });
        it('should handle product without brand', () => {
            const productNoBrand = {
                ...baseProduct,
                brand: null,
            };
            const response = (0, product_info_service_1.formatExpertResponse)(productNoBrand);
            expect(response).toContain('*Ultra Reconstrução Intense*');
            expect(response).not.toContain('(null)');
        });
    });
    // =====================================================
    // formatNotFoundResponse
    // =====================================================
    describe('formatNotFoundResponse', () => {
        it('should return disambiguation message', () => {
            const response = (0, product_info_service_1.formatNotFoundResponse)();
            expect(response).toContain('identificar o produto');
            expect(response).toContain('nome completo');
        });
    });
});
//# sourceMappingURL=product-info.spec.js.map