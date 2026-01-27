import { IntentClassifierService } from './intent-classifier.service';

describe('IntentClassifierService', () => {
  let service: IntentClassifierService;

  beforeEach(() => {
    service = new IntentClassifierService();
  });

  // ========== GREETING puro ==========
  describe('GREETING (saudação pura)', () => {
    it.each([
      'Oi',
      'oi',
      'Olá',
      'Bom dia',
      'Boa tarde',
      'Boa noite',
      'Oi!',
      'Bom dia!',
      'opa',
    ])('"%s" => GREETING', (msg) => {
      expect(service.classify(msg)).toBe('GREETING');
    });
  });

  // ========== Saudação + intenção real NÃO deve ser GREETING ==========
  describe('saudação + intenção real => NÃO GREETING', () => {
    it('"Oi, quero saber sobre o Ultra Reconstrução" => PRODUCT_INFO', () => {
      expect(service.classify('Oi, quero saber sobre o Ultra Reconstrução')).toBe('PRODUCT_INFO');
    });

    it('"Bom dia, quanto custa a progressiva?" => PRICE_INFO', () => {
      expect(service.classify('Bom dia, quanto custa a progressiva?')).toBe('PRICE_INFO');
    });

    it('"Olá, quero agendar um horário" => SCHEDULE', () => {
      expect(service.classify('Olá, quero agendar um horário')).toBe('SCHEDULE');
    });

    it('"Oi, quero saber sobre corte" => SERVICE_INFO', () => {
      expect(service.classify('Oi, quero saber sobre corte')).toBe('SERVICE_INFO');
    });

    it('"Boa tarde, que horas abre?" => HOURS_INFO', () => {
      expect(service.classify('Boa tarde, que horas abre?')).toBe('HOURS_INFO');
    });
  });

  // ========== PRICE_INFO precede PRODUCT_INFO ==========
  describe('PRICE_INFO > PRODUCT_INFO', () => {
    it('"Quanto custa o shampoo?" => PRICE_INFO', () => {
      expect(service.classify('Quanto custa o shampoo?')).toBe('PRICE_INFO');
    });

    it('"Valor da progressiva" => PRICE_INFO', () => {
      expect(service.classify('Valor da progressiva')).toBe('PRICE_INFO');
    });
  });

  // ========== Confirmação / Recusa ==========
  describe('APPOINTMENT_CONFIRM / DECLINE', () => {
    it('"sim" => APPOINTMENT_CONFIRM', () => {
      expect(service.classify('sim')).toBe('APPOINTMENT_CONFIRM');
    });

    it('"não" => APPOINTMENT_DECLINE', () => {
      expect(service.classify('não')).toBe('APPOINTMENT_DECLINE');
    });

    it('"Confirmo" => APPOINTMENT_CONFIRM', () => {
      expect(service.classify('Confirmo')).toBe('APPOINTMENT_CONFIRM');
    });
  });

  // ========== GENERAL ==========
  describe('GENERAL (fallback)', () => {
    it('"asdfgh" => GENERAL', () => {
      expect(service.classify('asdfgh')).toBe('GENERAL');
    });
  });
});
