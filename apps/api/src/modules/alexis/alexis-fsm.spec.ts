import {
  defaultState,
  mergeBufferTexts,
  isExpired,
  bumpTTL,
  DEBOUNCE_MS,
  ConversationState,
} from './conversation-state';
import {
  handleSchedulingTurn,
  startScheduling,
  parseDatetime,
} from './scheduling-skill';
import {
  composeResponse,
  shouldGreet,
} from './response-composer.service';

// =====================================================
// 1. DEBOUNCE — pure helpers
// =====================================================
describe('debounce helpers', () => {
  it('mergeBufferTexts joins messages with newline', () => {
    expect(mergeBufferTexts(['oi', 'quero agendar'])).toBe('oi\nquero agendar');
  });

  it('mergeBufferTexts handles single message', () => {
    expect(mergeBufferTexts(['alisamento'])).toBe('alisamento');
  });

  it('mergeBufferTexts filters empty strings', () => {
    expect(mergeBufferTexts(['', 'oi', ''])).toBe('oi');
  });

  it('DEBOUNCE_MS is between 2000 and 3000', () => {
    expect(DEBOUNCE_MS).toBeGreaterThanOrEqual(2000);
    expect(DEBOUNCE_MS).toBeLessThanOrEqual(3000);
  });
});

// =====================================================
// 2. SCHEDULING FSM
// =====================================================
describe('scheduling FSM', () => {
  const services = [
    { id: '1', name: 'Alisamento', price: 250 },
    { id: '2', name: 'Corte Feminino', price: 50 },
    { id: '3', name: 'Mechas', price: 150 },
    { id: '4', name: 'Progressiva', price: 300 },
  ];

  describe('startScheduling', () => {
    it('returns AWAITING_SERVICE step', () => {
      const result = startScheduling();
      expect(result.nextState.activeSkill).toBe('SCHEDULING');
      expect(result.nextState.step).toBe('AWAITING_SERVICE');
      expect(result.replyText).toContain('serviço');
    });
  });

  describe('AWAITING_SERVICE', () => {
    const stateAwaitingService: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_SERVICE',
      ttlExpiresAt: bumpTTL(),
    };

    it('"alisamento" => transitions to AWAITING_DATETIME', () => {
      const result = handleSchedulingTurn(stateAwaitingService, 'alisamento', { services });
      expect(result.nextState.step).toBe('AWAITING_DATETIME');
      expect(result.nextState.slots?.serviceLabel).toBe('Alisamento');
      expect(result.replyText).toContain('Alisamento');
    });

    it('"banana" => stays AWAITING_SERVICE, confusionCount++', () => {
      const result = handleSchedulingTurn(stateAwaitingService, 'banana', { services });
      expect(result.nextState.step).toBeUndefined(); // doesn't change step
      expect(result.nextState.confusionCount).toBe(1);
      expect(result.replyText).toContain('Não encontrei');
    });

    it('3 confusions => handover', () => {
      const confused = { ...stateAwaitingService, confusionCount: 2 };
      const result = handleSchedulingTurn(confused, 'banana', { services });
      expect(result.nextState.activeSkill).toBe('NONE');
      expect(result.nextState.step).toBe('NONE');
      expect(result.handover).toBe(true);
    });
  });

  describe('AWAITING_DATETIME', () => {
    const stateAwaitingDatetime: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_DATETIME',
      slots: { serviceId: '1', serviceLabel: 'Alisamento' },
      ttlExpiresAt: bumpTTL(),
    };

    it('"amanhã 10h" => transitions to AWAITING_CONFIRM', () => {
      const result = handleSchedulingTurn(stateAwaitingDatetime, 'amanhã 10h', { services });
      expect(result.nextState.step).toBe('AWAITING_CONFIRM');
      expect(result.nextState.slots?.time).toBe('10:00');
      expect(result.replyText).toContain('Alisamento');
      expect(result.replyText).toContain('sim/não');
    });

    it('"27h" => INVALID_HOUR, stays in step, friendly message', () => {
      const result = handleSchedulingTurn(stateAwaitingDatetime, '27h', { services });
      expect(result.nextState.step).toBeUndefined(); // doesn't change step
      expect(result.replyText).toContain('24h');
    });

    it('vague message => asks for preference', () => {
      const result = handleSchedulingTurn(stateAwaitingDatetime, 'qualquer dia', { services });
      expect(result.nextState.step).toBeUndefined();
      expect(result.replyText).toContain('amanhã');
    });
  });

  describe('AWAITING_CONFIRM', () => {
    const stateAwaitingConfirm: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_CONFIRM',
      slots: { serviceId: '1', serviceLabel: 'Alisamento', dateISO: '2026-01-28', time: '10:00' },
      ttlExpiresAt: bumpTTL(),
    };

    it('"sim" => confirms, resets state, handover', () => {
      const result = handleSchedulingTurn(stateAwaitingConfirm, 'sim', { services });
      expect(result.nextState.activeSkill).toBe('NONE');
      expect(result.nextState.step).toBe('NONE');
      expect(result.handover).toBe(true);
      expect(result.nextState.handoverSummary).toContain('Alisamento');
      expect(result.replyText).toContain('recepção');
    });

    it('"não" => cancels, resets state', () => {
      const result = handleSchedulingTurn(stateAwaitingConfirm, 'não', { services });
      expect(result.nextState.activeSkill).toBe('NONE');
      expect(result.nextState.step).toBe('NONE');
      expect(result.handover).toBeUndefined();
      expect(result.replyText).toContain('Sem problemas');
    });

    it('"talvez" => repeats confirmation question', () => {
      const result = handleSchedulingTurn(stateAwaitingConfirm, 'talvez', { services });
      expect(result.replyText).toContain('sim');
    });
  });
});

// =====================================================
// 3. DATETIME PARSING
// =====================================================
describe('parseDatetime', () => {
  it('"10h" => parses hour 10:00', () => {
    const result = parseDatetime('10h');
    expect(result).not.toBeNull();
    expect(result).not.toBe('INVALID_HOUR');
    if (result && result !== 'INVALID_HOUR') {
      expect(result.time).toBe('10:00');
    }
  });

  it('"14:30" => parses 14:30', () => {
    const result = parseDatetime('14:30');
    expect(result).not.toBeNull();
    if (result && result !== 'INVALID_HOUR') {
      expect(result.time).toBe('14:30');
    }
  });

  it('"14h30" => parses 14:30', () => {
    const result = parseDatetime('14h30');
    expect(result).not.toBeNull();
    if (result && result !== 'INVALID_HOUR') {
      expect(result.time).toBe('14:30');
    }
  });

  it('"27h" => INVALID_HOUR', () => {
    expect(parseDatetime('27h')).toBe('INVALID_HOUR');
  });

  it('"qualquer dia" => null (no time)', () => {
    expect(parseDatetime('qualquer dia')).toBeNull();
  });
});

// =====================================================
// 4. STATE TTL
// =====================================================
describe('state TTL', () => {
  it('isExpired returns false for future date', () => {
    expect(isExpired(bumpTTL(60))).toBe(false);
  });

  it('isExpired returns true for past date', () => {
    expect(isExpired('2020-01-01T00:00:00.000Z')).toBe(true);
  });

  it('isExpired returns false for null', () => {
    expect(isExpired(null)).toBe(false);
  });
});

// =====================================================
// 5. ANTI-GREETING (pure function)
// =====================================================
describe('anti-greeting', () => {
  it('shouldGreet returns true when lastGreetedAt is null (first contact)', () => {
    expect(shouldGreet(null)).toBe(true);
  });

  it('shouldGreet returns false when recently greeted (< 12h)', () => {
    const recent = new Date();
    recent.setHours(recent.getHours() - 1);
    expect(shouldGreet(recent)).toBe(false);
  });

  it('composeResponse skips greeting when greeting is empty string', () => {
    const result = composeResponse({
      greeting: '',
      introduction: null,
      clientName: null,
      baseText: 'Aqui estão os horários disponíveis.',
      cta: null,
      askName: false,
    });
    // Should NOT have "Bom dia" or "Boa tarde" prefix
    expect(result).not.toMatch(/^(Bom dia|Boa tarde|Boa noite)/);
    expect(result).toContain('Aqui estão os horários disponíveis.');
  });

  it('composeResponse includes greeting when provided', () => {
    const result = composeResponse({
      greeting: 'Bom dia',
      introduction: 'Eu sou a Alexis, assistente do Salão.',
      clientName: 'Maria',
      baseText: 'Como posso ajudar?',
      cta: null,
      askName: false,
    });
    expect(result).toContain('Bom dia, Maria!');
    expect(result).toContain('Eu sou a Alexis');
  });
});
