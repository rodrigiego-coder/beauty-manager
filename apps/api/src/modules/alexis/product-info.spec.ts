/**
 * =====================================================
 * PRODUCT INFO SERVICE - TESTES UNITÁRIOS (CHARLIE)
 * Detecção determinística de perguntas sobre produtos
 * =====================================================
 */

import {
  normalizeText,
  extractTokens,
  getBigrams,
  diceCoefficient,
  isProductInfoQuestion,
  calculateMatchScore,
  formatExpertResponse,
  formatNotFoundResponse,
  ProductInfo,
} from './product-info.service';

describe('ProductInfoService - Pure Functions', () => {
  // =====================================================
  // normalizeText
  // =====================================================
  describe('normalizeText', () => {
    it('should lowercase text', () => {
      expect(normalizeText('ULTRA RECONSTRUÇÃO')).toBe('ultra reconstrucao');
    });

    it('should remove accents', () => {
      expect(normalizeText('Reconstrução Intensa')).toBe('reconstrucao intensa');
      expect(normalizeText('máscara nutritiva')).toBe('mascara nutritiva');
    });

    it('should remove punctuation', () => {
      expect(normalizeText('pra que serve?')).toBe('pra que serve');
      expect(normalizeText('olá, qual o preço?!')).toBe('ola qual o preco');
    });

    it('should collapse multiple spaces', () => {
      expect(normalizeText('ultra   reconstrução')).toBe('ultra reconstrucao');
    });

    it('should trim whitespace', () => {
      expect(normalizeText('  encanthus  ')).toBe('encanthus');
    });
  });

  // =====================================================
  // extractTokens
  // =====================================================
  describe('extractTokens', () => {
    it('should filter stopwords', () => {
      const tokens = extractTokens('pra que serve o encanthus');
      expect(tokens).not.toContain('pra');
      expect(tokens).not.toContain('que');
      expect(tokens).toContain('encanthus');
    });

    it('should filter tokens shorter than 3 chars', () => {
      const tokens = extractTokens('o ek vitali e bom');
      expect(tokens).not.toContain('ek'); // 2 chars - filtered
      expect(tokens).toContain('bom'); // 3 chars - included
      expect(tokens).toContain('vitali');
    });

    it('should extract relevant tokens', () => {
      const tokens = extractTokens('ultra reconstrucao intense');
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
      const bigrams = getBigrams('abc');
      expect(bigrams.has('ab')).toBe(true);
      expect(bigrams.has('bc')).toBe(true);
      expect(bigrams.size).toBe(2);
    });

    it('should return empty set for single char', () => {
      expect(getBigrams('a').size).toBe(0);
    });

    it('should handle repeated characters', () => {
      const bigrams = getBigrams('aab');
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
      expect(diceCoefficient(set, set)).toBe(1.0);
    });

    it('should return 0 for disjoint sets', () => {
      const set1 = new Set(['ab', 'bc']);
      const set2 = new Set(['xy', 'yz']);
      expect(diceCoefficient(set1, set2)).toBe(0);
    });

    it('should return 0 for empty sets', () => {
      expect(diceCoefficient(new Set(), new Set(['ab']))).toBe(0);
      expect(diceCoefficient(new Set(['ab']), new Set())).toBe(0);
    });

    it('should return partial match for overlapping sets', () => {
      const set1 = new Set(['ab', 'bc', 'cd']);
      const set2 = new Set(['bc', 'cd', 'de']);
      // intersection = 2, sum = 6, dice = 4/6 = 0.666...
      expect(diceCoefficient(set1, set2)).toBeCloseTo(0.667, 2);
    });
  });

  // =====================================================
  // isProductInfoQuestion
  // =====================================================
  describe('isProductInfoQuestion', () => {
    it('should detect "pra que serve"', () => {
      expect(isProductInfoQuestion('pra que serve o ultra reconstrução?')).toBe(true);
      expect(isProductInfoQuestion('Pra que serve Encanthus')).toBe(true);
    });

    it('should detect "para que serve"', () => {
      expect(isProductInfoQuestion('para que serve esse produto?')).toBe(true);
    });

    it('should detect "como usar"', () => {
      expect(isProductInfoQuestion('como usar o encanthus?')).toBe(true);
      expect(isProductInfoQuestion('Como usa o shampoo?')).toBe(true);
    });

    it('should detect "beneficios"', () => {
      expect(isProductInfoQuestion('quais os benefícios do produto?')).toBe(true);
    });

    it('should detect "indicacao"', () => {
      expect(isProductInfoQuestion('qual a indicação?')).toBe(true);
      expect(isProductInfoQuestion('indicado para que tipo de cabelo?')).toBe(true);
    });

    it('should detect "ativos"', () => {
      expect(isProductInfoQuestion('quais os ativos?')).toBe(true);
      expect(isProductInfoQuestion('qual o ativo principal?')).toBe(true);
    });

    it('should detect "ingredientes"', () => {
      expect(isProductInfoQuestion('quais ingredientes tem?')).toBe(true);
    });

    it('should detect "contraindicacao"', () => {
      expect(isProductInfoQuestion('tem contraindicação?')).toBe(true);
    });

    it('should detect "o que faz" variations', () => {
      expect(isProductInfoQuestion('o que faz esse produto?')).toBe(true);
      expect(isProductInfoQuestion('oque faz?')).toBe(true);
      expect(isProductInfoQuestion('faz o que?')).toBe(true);
    });

    it('should NOT detect non-product questions', () => {
      expect(isProductInfoQuestion('oi')).toBe(false);
      expect(isProductInfoQuestion('quero agendar')).toBe(false);
      expect(isProductInfoQuestion('qual o preço?')).toBe(false);
      expect(isProductInfoQuestion('tem disponível?')).toBe(false);
    });
  });

  // =====================================================
  // calculateMatchScore
  // =====================================================
  describe('calculateMatchScore', () => {
    it('should return high score for exact match', () => {
      const score = calculateMatchScore('ultra reconstrucao', 'ultra reconstrucao');
      expect(score).toBeGreaterThan(0.8);
    });

    it('should return good score for partial token match', () => {
      const msgNorm = normalizeText('pra que serve o ultra reconstrução');
      const prodNorm = normalizeText('Ultra Reconstrução Intense');
      const score = calculateMatchScore(msgNorm, prodNorm);
      expect(score).toBeGreaterThan(0.28); // threshold
    });

    it('should handle typos via bigram similarity', () => {
      const msgNorm = normalizeText('pra que serve recontrução'); // typo
      const prodNorm = normalizeText('Reconstrução Intense');
      const score = calculateMatchScore(msgNorm, prodNorm);
      expect(score).toBeGreaterThan(0.2); // some match via bigrams
    });

    it('should return low score for unrelated products', () => {
      const msgNorm = normalizeText('pra que serve o shampoo roxo');
      const prodNorm = normalizeText('Ultra Reconstrução Intense');
      const score = calculateMatchScore(msgNorm, prodNorm);
      expect(score).toBeLessThan(0.28); // below threshold
    });

    it('should return 0 for empty product name', () => {
      expect(calculateMatchScore('alguma mensagem', '')).toBe(0);
    });
  });

  // =====================================================
  // formatExpertResponse
  // =====================================================
  describe('formatExpertResponse', () => {
    const baseProduct: ProductInfo = {
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
      const response = formatExpertResponse(baseProduct);
      expect(response).toContain('*Ultra Reconstrução Intense*');
      expect(response).toContain('(Encanthus)');
    });

    it('should include description when no alexisMeta', () => {
      const response = formatExpertResponse(baseProduct);
      expect(response).toContain('Máscara de reconstrução intensa');
    });

    it('should include benefits', () => {
      const response = formatExpertResponse(baseProduct);
      expect(response).toContain('Repara fios danificados');
    });

    it('should include how to use', () => {
      const response = formatExpertResponse(baseProduct);
      expect(response).toContain('*Como usar:*');
      expect(response).toContain('5 minutos');
    });

    it('should include precautions', () => {
      const response = formatExpertResponse(baseProduct);
      expect(response).toContain('*Cuidados:*');
      expect(response).toContain('Evitar contato');
    });

    it('should include CTA at the end', () => {
      const response = formatExpertResponse(baseProduct);
      expect(response).toContain('tipo de cabelo');
    });

    it('should prefer alexisMeta over traditional fields', () => {
      const productWithMeta: ProductInfo = {
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

      const response = formatExpertResponse(productWithMeta);
      expect(response).toContain('Tratamento premium'); // summary from meta
      expect(response).toContain('Cabelos quimicamente tratados'); // indications
      expect(response).toContain('Queratina hidrolisada'); // actives
      expect(response).toContain('10 min'); // howToUse from meta
      expect(response).toContain('Não usar em couro'); // precautions from meta
    });

    it('should handle product without brand', () => {
      const productNoBrand: ProductInfo = {
        ...baseProduct,
        brand: null,
      };
      const response = formatExpertResponse(productNoBrand);
      expect(response).toContain('*Ultra Reconstrução Intense*');
      expect(response).not.toContain('(null)');
    });
  });

  // =====================================================
  // formatNotFoundResponse
  // =====================================================
  describe('formatNotFoundResponse', () => {
    it('should return disambiguation message', () => {
      const response = formatNotFoundResponse();
      expect(response).toContain('identificar o produto');
      expect(response).toContain('nome completo');
    });
  });
});
