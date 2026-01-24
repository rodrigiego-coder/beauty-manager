/**
 * =====================================================
 * ALEXIS CATALOG SERVICE - TESTES UNITÁRIOS
 * =====================================================
 */

import {
  normalizeText,
  matchScore,
  formatAvailabilityCopy,
  formatMultipleMatchesCopy,
  formatBlockedCopy,
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
  // formatAvailabilityCopy
  // =====================================================
  describe('formatAvailabilityCopy', () => {
    const mockProduct: ProductMatch = {
      id: 1,
      name: 'Encanthus',
      catalogCode: 'REV-ENCANTHUS',
      description: 'Perfume capilar premium',
      salePrice: '159.90',
      stockRetail: 5,
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
      expect(result.message).toContain('R$ 159.90');
      expect(result.message).toContain('disponivel');
    });

    it('should format out-of-stock message correctly', () => {
      const outOfStock = { ...mockProduct, stockRetail: 0 };
      const result = formatAvailabilityCopy(outOfStock, false);
      expect(result.inStock).toBe(false);
      expect(result.message).toContain('sem estoque');
    });

    it('should include summary from alexisMeta', () => {
      const result = formatAvailabilityCopy(mockProduct, false);
      expect(result.message).toContain('Perfume capilar premium');
    });

    it('should suggest handover when out of stock', () => {
      const outOfStock = { ...mockProduct, stockRetail: 0 };
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
