/**
 * =====================================================
 * RESPONSE COMPOSER SERVICE - UNIT TESTS (DELTA)
 * Testes para humanizacao de respostas
 * =====================================================
 */

import {
  getGreeting,
  shouldGreet,
  isProductIntent,
  getProductCta,
  getNameQuestion,
  getIntroduction,
  composeResponse,
} from './response-composer.service';

describe('ResponseComposerService - Pure Functions (DELTA)', () => {
  // =====================================================
  // getGreeting
  // =====================================================
  describe('getGreeting', () => {
    it('should return greeting based on current hour', () => {
      const greeting = getGreeting();
      // Verifica que retorna uma das saudacoes validas
      expect(['Bom dia', 'Boa tarde', 'Boa noite']).toContain(greeting);
    });
  });

  // =====================================================
  // shouldGreet
  // =====================================================
  describe('shouldGreet', () => {
    it('should return true for null lastGreetedAt (first contact)', () => {
      expect(shouldGreet(null)).toBe(true);
    });

    it('should return true if greeted more than 2 hours ago', () => {
      const threeHoursAgo = new Date();
      threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
      expect(shouldGreet(threeHoursAgo)).toBe(true);
    });

    it('should return false if greeted within 2 hours', () => {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      expect(shouldGreet(oneHourAgo)).toBe(false);
    });

    it('should respect custom window hours', () => {
      const threeHoursAgo = new Date();
      threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

      // Com janela de 2 horas, 3 horas atras deve saudar
      expect(shouldGreet(threeHoursAgo, 2)).toBe(true);

      // Com janela de 4 horas, 3 horas atras nao deve saudar
      expect(shouldGreet(threeHoursAgo, 4)).toBe(false);
    });
  });

  // =====================================================
  // isProductIntent
  // =====================================================
  describe('isProductIntent', () => {
    it('should return true for PRODUCT_INFO', () => {
      expect(isProductIntent('PRODUCT_INFO')).toBe(true);
    });

    it('should return true for PRICE_INFO', () => {
      expect(isProductIntent('PRICE_INFO')).toBe(true);
    });

    it('should return false for other intents', () => {
      expect(isProductIntent('GREETING')).toBe(false);
      expect(isProductIntent('SCHEDULE')).toBe(false);
      expect(isProductIntent('GENERAL')).toBe(false);
    });
  });

  // =====================================================
  // getProductCta
  // =====================================================
  describe('getProductCta', () => {
    it('should return CTA for product intents', () => {
      const cta = getProductCta();
      expect(cta).toContain('separe');
      expect(cta).toContain('retirar');
    });
  });

  // =====================================================
  // getNameQuestion
  // =====================================================
  describe('getNameQuestion', () => {
    it('should return polite name question', () => {
      const question = getNameQuestion();
      expect(question).toContain('chamar');
      expect(question).toContain('gentileza');
    });
  });

  // =====================================================
  // getIntroduction
  // =====================================================
  describe('getIntroduction', () => {
    it('should include Alexis and salon name', () => {
      const intro = getIntroduction('Salao da Maria');
      expect(intro).toContain('Alexis');
      expect(intro).toContain('Salao da Maria');
    });
  });

  // =====================================================
  // composeResponse
  // =====================================================
  describe('composeResponse', () => {
    it('should compose first contact with name question', () => {
      const response = composeResponse({
        greeting: 'Boa tarde',
        introduction: 'Eu sou a Alexis, assistente do Salao X.',
        clientName: null,
        baseText: 'O Encanthus custa R$ 89,90.',
        cta: 'Quer que eu separe pra voce?',
        askName: true,
      });

      expect(response).toContain('Boa tarde!');
      expect(response).toContain('Alexis');
      expect(response).toContain('R$ 89,90');
      expect(response).toContain('separe');
      expect(response).toContain('chamar');
    });

    it('should compose with client name when available', () => {
      const response = composeResponse({
        greeting: 'Bom dia',
        introduction: null,
        clientName: 'Maria',
        baseText: 'Temos horario as 14h.',
        cta: null,
        askName: false,
      });

      expect(response).toContain('Bom dia, Maria!');
      expect(response).toContain('14h');
      expect(response).not.toContain('chamar');
    });

    it('should NOT repeat introduction on subsequent messages', () => {
      const response = composeResponse({
        greeting: '',
        introduction: null,
        clientName: 'Joao',
        baseText: 'Para que serve esse produto.',
        cta: null,
        askName: false,
      });

      // Nao deve ter saudacao nem apresentacao
      expect(response).not.toContain('Bom dia');
      expect(response).not.toContain('Boa tarde');
      expect(response).not.toContain('Boa noite');
      expect(response).not.toContain('Alexis');
      expect(response).toContain('produto');
    });

    it('should include product CTA for product intents', () => {
      const response = composeResponse({
        greeting: 'Boa noite',
        introduction: null,
        clientName: 'Ana',
        baseText: 'O produto tem ativos de queratina.',
        cta: 'Quer que eu separe pra voce ou prefere retirar no salao?',
        askName: false,
      });

      expect(response).toContain('separe');
      expect(response).toContain('retirar');
    });
  });
});
