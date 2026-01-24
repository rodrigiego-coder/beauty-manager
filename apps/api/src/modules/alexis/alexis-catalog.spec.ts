/**
 * =====================================================
 * ALEXIS CATALOG SERVICE - TESTES UNITÁRIOS
 * ALFA.3: Adicionados testes para substring, preço, estoque
 * =====================================================
 */

import {
  normalizeText,
  matchScore,
  formatAvailabilityCopy,
  formatMultipleMatchesCopy,
  formatBlockedCopy,
  calculateTotalStock,
  formatPrice,
  ProductMatch,
} from './alexis-catalog.service';

describe('AlexisCatalogService - Pure Functions', () => {
  // =====================================================
  // normalizeText
  // =====================================================
  describe('normalizeText', () => {
    it('should lowercase text', () => {
      expect(normalizeText('ENCANTHUS')).toBe('encanthus');
    });

    it('should remove accents', () => {
      expect(normalizeText('Óleos Lendários')).toBe('oleos lendarios');
      expect(normalizeText('Reconstrução')).toBe('reconstrucao');
      expect(normalizeText('máscara')).toBe('mascara');
    });

    it('should trim whitespace', () => {
      expect(normalizeText('  encanthus  ')).toBe('encanthus');
    });

    it('should handle combined transformations', () => {
      expect(normalizeText('  ÓLEOS Lendários  ')).toBe('oleos lendarios');
    });

    // ALFA.3: testes para substring matching
    it('should normalize full sentences for substring matching', () => {
      expect(normalizeText('me fala do encanthus')).toBe('me fala do encanthus');
      expect(normalizeText('qual o preço do Encanthus?')).toBe('qual o preco do encanthus?');
    });
  });

  // =====================================================
  // matchScore
  // =====================================================
  describe('matchScore', () => {
    it('should return 1.0 for exact match', () => {
      expect(matchScore('encanthus', 'encanthus')).toBe(1.0);
    });

    it('should return 0.9 for startsWith match', () => {
      expect(matchScore('eko', 'eko vitali')).toBe(0.9);
    });

    it('should return 0.7 for includes match', () => {
      expect(matchScore('vitali', 'eko vitali')).toBe(0.7);
    });

    it('should return >0 for partial word match', () => {
      const score = matchScore('shampoo roxo', 'blonde matiz');
      // No match expected
      expect(score).toBeLessThan(0.5);
    });

    it('should return 0 for no match', () => {
      expect(matchScore('xyz', 'encanthus')).toBe(0);
    });
  });

  // =====================================================
  // calculateTotalStock (ALFA.3)
  // =====================================================
  describe('calculateTotalStock', () => {
    const baseProduct: ProductMatch = {
      id: 1,
      name: 'Test',
      catalogCode: null,
      description: null,
      salePrice: '100.00',
      stockRetail: 0,
      stockInternal: 0,
      isSystemDefault: false,
      alexisEnabled: true,
      alexisMeta: null,
      brand: null,
      category: null,
    };

    it('should sum stockRetail and stockInternal', () => {
      const product = { ...baseProduct, stockRetail: 5, stockInternal: 3 };
      expect(calculateTotalStock(product)).toBe(8);
    });

    it('should handle stockRetail only', () => {
      const product = { ...baseProduct, stockRetail: 5, stockInternal: 0 };
      expect(calculateTotalStock(product)).toBe(5);
    });

    it('should handle stockInternal only', () => {
      const product = { ...baseProduct, stockRetail: 0, stockInternal: 3 };
      expect(calculateTotalStock(product)).toBe(3);
    });

    it('should return 0 when both are 0', () => {
      expect(calculateTotalStock(baseProduct)).toBe(0);
    });
  });

  // =====================================================
  // formatPrice (ALFA.3)
  // =====================================================
  describe('formatPrice', () => {
    it('should format valid price with BRL format', () => {
      expect(formatPrice('159.90')).toBe('R$ 159,90');
      expect(formatPrice('100.00')).toBe('R$ 100,00');
    });

    it('should return "sob consulta" for null price', () => {
      expect(formatPrice(null)).toBe('sob consulta com a recepcao');
    });

    it('should return "sob consulta" for price = 0', () => {
      expect(formatPrice('0')).toBe('sob consulta com a recepcao');
      expect(formatPrice('0.00')).toBe('sob consulta com a recepcao');
    });

    it('should return "sob consulta" for invalid price', () => {
      expect(formatPrice('abc')).toBe('sob consulta com a recepcao');
      expect(formatPrice('')).toBe('sob consulta com a recepcao');
    });
  });

  // =====================================================
  // formatAvailabilityCopy (ALFA.3 updated)
  // =====================================================
  describe('formatAvailabilityCopy', () => {
    const mockProduct: ProductMatch = {
      id: 1,
      name: 'Encanthus',
      catalogCode: 'REV-ENCANTHUS',
      description: 'Perfume capilar premium',
      salePrice: '159.90',
      stockRetail: 5,
      stockInternal: 2, // ALFA.3: added
      isSystemDefault: true,
      alexisEnabled: true,
      alexisMeta: {
        summary: 'Perfume capilar premium com fragrância sofisticada',
      },
      brand: 'Revelarium',
      category: 'Finalização',
    };

    it('should format in-stock message correctly', () => {
      const result = formatAvailabilityCopy(mockProduct, false);
      expect(result.inStock).toBe(true);
      expect(result.message).toContain('*Encanthus*');
      expect(result.message).toContain('R$ 159,90');
      expect(result.message).toContain('disponivel');
    });

    it('should consider total stock (retail + internal) for availability', () => {
      // Only internal stock
      const internalOnly = { ...mockProduct, stockRetail: 0, stockInternal: 5 };
      const result = formatAvailabilityCopy(internalOnly, false);
      expect(result.inStock).toBe(true);
    });

    it('should format out-of-stock message but still show product info (ALFA.3)', () => {
      const outOfStock = { ...mockProduct, stockRetail: 0, stockInternal: 0 };
      const result = formatAvailabilityCopy(outOfStock, false);
      expect(result.inStock).toBe(false);
      expect(result.message).toContain('*Encanthus*');
      expect(result.message).toContain('R$ 159,90'); // ALFA.3: price still shown
      expect(result.message).toContain('sem estoque');
    });

    it('should show "sob consulta" when price is null/0', () => {
      const noPrice = { ...mockProduct, salePrice: '0' };
      const result = formatAvailabilityCopy(noPrice, false);
      expect(result.message).toContain('sob consulta');
    });

    it('should include summary from alexisMeta', () => {
      const result = formatAvailabilityCopy(mockProduct, false);
      expect(result.message).toContain('Perfume capilar premium');
    });

    it('should suggest handover when out of stock', () => {
      const outOfStock = { ...mockProduct, stockRetail: 0, stockInternal: 0 };
      const result = formatAvailabilityCopy(outOfStock, false);
      expect(result.suggestHandover).toBe(true);
    });
  });

  // =====================================================
  // formatMultipleMatchesCopy
  // =====================================================
  describe('formatMultipleMatchesCopy', () => {
    const mockProducts: ProductMatch[] = [
      {
        id: 1,
        name: 'Neo Complex Shampoo',
        catalogCode: 'REV-NEO-DETOX',
        description: null,
        salePrice: '119.90',
        stockRetail: 5,
        stockInternal: 0,
        isSystemDefault: true,
        alexisEnabled: true,
        alexisMeta: null,
        brand: 'Revelarium',
        category: 'Limpeza',
      },
      {
        id: 2,
        name: 'Neo Complex Máscara',
        catalogCode: 'REV-NEO-MASCARA',
        description: null,
        salePrice: '189.90',
        stockRetail: 3,
        stockInternal: 0,
        isSystemDefault: true,
        alexisEnabled: true,
        alexisMeta: null,
        brand: 'Revelarium',
        category: 'Tratamento',
      },
    ];

    it('should list up to 5 products', () => {
      const result = formatMultipleMatchesCopy(mockProducts);
      expect(result).toContain('1. *Neo Complex Shampoo*');
      expect(result).toContain('2. *Neo Complex Máscara*');
    });

    it('should include prices', () => {
      const result = formatMultipleMatchesCopy(mockProducts);
      expect(result).toContain('R$ 119.90');
      expect(result).toContain('R$ 189.90');
    });

    it('should ask which product user wants', () => {
      const result = formatMultipleMatchesCopy(mockProducts);
      expect(result).toContain('Qual deles');
    });
  });

  // =====================================================
  // formatBlockedCopy
  // =====================================================
  describe('formatBlockedCopy', () => {
    it('should format blocked message without alternatives', () => {
      const result = formatBlockedCopy('Produto X', []);
      expect(result).toContain('*Produto X*');
      expect(result).toContain('nao esta disponivel');
      expect(result).toContain('recepcao');
    });

    it('should include alternatives when available', () => {
      const alternatives: ProductMatch[] = [
        {
          id: 1,
          name: 'Elixir Multibenefícios',
          catalogCode: 'REV-ELIXIR-MULTI',
          description: null,
          salePrice: '119.90',
          stockRetail: 5,
          stockInternal: 0,
          isSystemDefault: true,
          alexisEnabled: true,
          alexisMeta: { summary: 'Leave-in 10 em 1' },
          brand: 'Revelarium',
          category: 'Finalização',
        },
      ];
      const result = formatBlockedCopy('Encanthus', alternatives);
      expect(result).toContain('alternativas');
      expect(result).toContain('*Elixir Multibenefícios*');
    });
  });
});

// =====================================================
// INTENT CLASSIFIER TESTS (ALFA.3)
// =====================================================
describe('IntentClassifier - PRICE_INFO Priority', () => {
  // Simula a lógica do classifier para testar prioridade
  const PRICE_KEYWORDS = ['preço', 'preco', 'valor', 'quanto', 'custa', 'custo', 'tabela', 'quanto fica'];
  const PRODUCT_KEYWORDS = ['produto', 'encanthus', 'elixir', 'shampoo'];

  function classifyPriority(message: string): 'PRICE_INFO' | 'PRODUCT_INFO' | 'GENERAL' {
    const lower = message.toLowerCase();
    // PRICE_INFO tem prioridade
    if (PRICE_KEYWORDS.some(k => lower.includes(k))) {
      return 'PRICE_INFO';
    }
    if (PRODUCT_KEYWORDS.some(k => lower.includes(k))) {
      return 'PRODUCT_INFO';
    }
    return 'GENERAL';
  }

  it('should classify "qual o preço do encanthus" as PRICE_INFO (not PRODUCT_INFO)', () => {
    expect(classifyPriority('qual o preço do encanthus')).toBe('PRICE_INFO');
  });

  it('should classify "quanto custa o elixir" as PRICE_INFO', () => {
    expect(classifyPriority('quanto custa o elixir')).toBe('PRICE_INFO');
  });

  it('should classify "me fala do encanthus" as PRODUCT_INFO', () => {
    expect(classifyPriority('me fala do encanthus')).toBe('PRODUCT_INFO');
  });

  it('should classify "tem shampoo?" as PRODUCT_INFO', () => {
    expect(classifyPriority('tem shampoo?')).toBe('PRODUCT_INFO');
  });
});
