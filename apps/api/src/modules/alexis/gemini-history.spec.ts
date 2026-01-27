import {
  GeminiService,
  ConversationTurn,
  CONVERSATION_HISTORY_LIMIT,
  MESSAGE_TRUNCATE_LENGTH,
} from './gemini.service';

describe('GeminiService — conversation history', () => {
  let service: GeminiService;

  beforeEach(() => {
    service = new GeminiService();
  });

  // ========== formatHistory ==========
  describe('formatHistory', () => {
    it('returns empty string when history is empty', () => {
      expect(service.formatHistory([])).toBe('');
    });

    it('returns empty string when history is undefined-ish', () => {
      expect(service.formatHistory(undefined as any)).toBe('');
      expect(service.formatHistory(null as any)).toBe('');
    });

    it('formats client and ai turns with correct labels', () => {
      const history: ConversationTurn[] = [
        { role: 'client', content: 'Oi, tudo bem?' },
        { role: 'ai', content: 'Olá! Como posso ajudar?' },
      ];

      const result = service.formatHistory(history);

      expect(result).toContain('[cliente] Oi, tudo bem?');
      expect(result).toContain('[assistente] Olá! Como posso ajudar?');
      expect(result).toContain('HISTÓRICO RECENTE (últimos 2 turnos)');
    });

    it('truncates messages longer than MESSAGE_TRUNCATE_LENGTH', () => {
      const longMessage = 'A'.repeat(MESSAGE_TRUNCATE_LENGTH + 100);
      const history: ConversationTurn[] = [
        { role: 'client', content: longMessage },
      ];

      const result = service.formatHistory(history);

      // Should contain truncated message ending with "..."
      expect(result).toContain('A'.repeat(MESSAGE_TRUNCATE_LENGTH) + '...');
      // Should NOT contain the full message
      expect(result).not.toContain(longMessage);
    });

    it('does NOT truncate messages within the limit', () => {
      const shortMessage = 'Quero saber sobre o Ultra Reconstrução';
      const history: ConversationTurn[] = [
        { role: 'client', content: shortMessage },
      ];

      const result = service.formatHistory(history);

      expect(result).toContain(shortMessage);
      expect(result).not.toContain('...');
    });
  });

  // ========== Constants ==========
  describe('constants', () => {
    it('CONVERSATION_HISTORY_LIMIT is 8', () => {
      expect(CONVERSATION_HISTORY_LIMIT).toBe(8);
    });

    it('MESSAGE_TRUNCATE_LENGTH is between 500 and 800', () => {
      expect(MESSAGE_TRUNCATE_LENGTH).toBeGreaterThanOrEqual(500);
      expect(MESSAGE_TRUNCATE_LENGTH).toBeLessThanOrEqual(800);
    });
  });

  // ========== generateResponse includes history ==========
  describe('generateResponse with history', () => {
    it('accepts history parameter without error (model unavailable → fallback)', async () => {
      // Without Gemini API key, model is null → fallback response
      const history: ConversationTurn[] = [
        { role: 'client', content: 'Oi' },
        { role: 'ai', content: 'Olá! Como posso ajudar?' },
      ];

      const result = await service.generateResponse('TestSalon', 'Quero agendar', {}, history);

      // Should return a fallback string (not throw)
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('works without history (backwards compatible)', async () => {
      const result = await service.generateResponse('TestSalon', 'Oi', {});

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
