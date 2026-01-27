import {
  isSchedulePrompt,
  normalizeText,
  fuzzyMatchService,
} from './schedule-continuation';

describe('schedule-continuation', () => {
  // ========== isSchedulePrompt ==========
  describe('isSchedulePrompt', () => {
    it('detects "Qual serviço você gostaria?" prompt', () => {
      const prompt = `Claro, vou te ajudar a agendar! 😊\n\nQual serviço você gostaria?\n\n• Corte - R$ 50\n• Mechas - R$ 150`;
      expect(isSchedulePrompt(prompt)).toBe(true);
    });

    it('detects "É só me dizer o serviço" prompt', () => {
      const prompt = 'É só me dizer o serviço e sua preferência de dia/horário!';
      expect(isSchedulePrompt(prompt)).toBe(true);
    });

    it('returns false for generic AI response', () => {
      expect(isSchedulePrompt('Olá! Como posso ajudar?')).toBe(false);
    });

    it('returns false for null/empty', () => {
      expect(isSchedulePrompt('')).toBe(false);
      expect(isSchedulePrompt(null as any)).toBe(false);
    });
  });

  // ========== normalizeText ==========
  describe('normalizeText', () => {
    it('removes accents and lowercases', () => {
      expect(normalizeText('Alisamento')).toBe('alisamento');
      expect(normalizeText('Coloração')).toBe('coloracao');
      expect(normalizeText('  Ombré  ')).toBe('ombre');
    });
  });

  // ========== fuzzyMatchService ==========
  describe('fuzzyMatchService', () => {
    const services = [
      { name: 'Corte Feminino', id: '1' },
      { name: 'Mechas', id: '2' },
      { name: 'Alisamento', id: '3' },
      { name: 'Coloração', id: '4' },
      { name: 'Progressiva', id: '5' },
      { name: 'Hidratação Profunda', id: '6' },
    ];

    // --- Continuação: user responde com nome do serviço ---
    it('"alisamento" => matches Alisamento', () => {
      expect(fuzzyMatchService('alisamento', services)?.name).toBe('Alisamento');
    });

    it('"Alisamento" (com acento) => matches Alisamento', () => {
      expect(fuzzyMatchService('Alisamento', services)?.name).toBe('Alisamento');
    });

    it('"coloração" (com acento) => matches Coloração', () => {
      expect(fuzzyMatchService('coloração', services)?.name).toBe('Coloração');
    });

    it('"coloracao" (sem acento) => matches Coloração', () => {
      expect(fuzzyMatchService('coloracao', services)?.name).toBe('Coloração');
    });

    it('"mechas" => matches Mechas', () => {
      expect(fuzzyMatchService('mechas', services)?.name).toBe('Mechas');
    });

    it('"Corte Feminino - R$ 50" (copiou da lista) => matches Corte Feminino', () => {
      expect(fuzzyMatchService('Corte Feminino - R$ 50', services)?.name).toBe('Corte Feminino');
    });

    it('"hidratação" => matches Hidratação Profunda (partial)', () => {
      expect(fuzzyMatchService('hidratação', services)?.name).toBe('Hidratação Profunda');
    });

    // --- Não deve inventar ---
    it('"banana" => null (serviço inexistente)', () => {
      expect(fuzzyMatchService('banana', services)).toBeNull();
    });

    it('"oi" => null (mensagem muito curta)', () => {
      expect(fuzzyMatchService('oi', services)).toBeNull();
    });

    it('empty/null => null', () => {
      expect(fuzzyMatchService('', services)).toBeNull();
      expect(fuzzyMatchService('test', [])).toBeNull();
      expect(fuzzyMatchService(null as any, services)).toBeNull();
    });
  });

  // ========== Cenário integrado (puro) ==========
  describe('cenário: bot pergunta serviço → user responde', () => {
    const botMessage = `Claro, vou te ajudar a agendar! 😊\n\nQual serviço você gostaria?\n\n• Alisamento - R$ 250\n• Corte - R$ 50\n\nÉ só me dizer o serviço e sua preferência de dia/horário!`;
    const services = [
      { name: 'Alisamento', id: '1' },
      { name: 'Corte', id: '2' },
    ];

    it('prompt detectado como schedule + "alisamento" encontra serviço', () => {
      expect(isSchedulePrompt(botMessage)).toBe(true);
      expect(fuzzyMatchService('alisamento', services)?.name).toBe('Alisamento');
    });

    it('prompt detectado + "banana" NÃO encontra serviço', () => {
      expect(isSchedulePrompt(botMessage)).toBe(true);
      expect(fuzzyMatchService('banana', services)).toBeNull();
    });
  });
});
