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
  detectPeriod,
  isAvailabilityQuestion,
  isStaffQuestion,
  isInfoQuestion,
  PERIOD_SUGGESTIONS,
} from './scheduling-skill';
import { replySig } from './conversation-state.store';
import { MAX_DECLINES } from './conversation-state';
import {
  composeResponse,
  shouldGreet,
} from './response-composer.service';
import { GeminiService } from './gemini.service';

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

    // --- P0.1.1: Period-based guided prompts ---

    it('"amanhã de manhã" => suggests morning hours, stays in step', () => {
      const result = handleSchedulingTurn(stateAwaitingDatetime, 'amanhã de manhã', { services });
      expect(result.nextState.step).toBeUndefined(); // stays in AWAITING_DATETIME
      expect(result.replyText).toContain('manhã');
      expect(result.replyText).toContain('09h');
      expect(result.replyText).toContain('Alisamento');
    });

    it('"de tarde" => suggests afternoon hours', () => {
      const result = handleSchedulingTurn(stateAwaitingDatetime, 'de tarde', { services });
      expect(result.replyText).toContain('tarde');
      expect(result.replyText).toContain('14h');
    });

    it('"à noite" => suggests evening hours', () => {
      const result = handleSchedulingTurn(stateAwaitingDatetime, 'à noite', { services });
      expect(result.replyText).toContain('noite');
      expect(result.replyText).toContain('18h');
    });

    it('"qual horário tem livre" => guided availability response, no reset', () => {
      const result = handleSchedulingTurn(stateAwaitingDatetime, 'qual horário tem livre?', { services });
      expect(result.nextState.step).toBeUndefined(); // stays in step
      expect(result.nextState.activeSkill).toBeUndefined(); // NOT reset
      expect(result.replyText).toContain('manhã');
      expect(result.replyText).toContain('tarde');
      expect(result.replyText).toContain('noite');
      expect(result.replyText).toContain('Alisamento');
    });

    it('"tem vaga amanhã" => guided availability response', () => {
      const result = handleSchedulingTurn(stateAwaitingDatetime, 'tem vaga amanhã?', { services });
      expect(result.replyText).toContain('Alisamento');
      expect(result.replyText).toContain('09h');
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

    it('"não" => sales retake: back to AWAITING_DATETIME, keeps service slots', () => {
      const result = handleSchedulingTurn(stateAwaitingConfirm, 'não', { services });
      expect(result.nextState.step).toBe('AWAITING_DATETIME');
      expect(result.nextState.slots?.serviceId).toBe('1');
      expect(result.nextState.slots?.serviceLabel).toBe('Alisamento');
      expect(result.nextState.declineCount).toBe(1);
      expect(result.handover).toBeUndefined();
      expect(result.replyText).toContain('Alisamento');
      expect(result.replyText).toContain('posso tentar');
    });

    it('"não" suggests alternatives in same period (morning for 10:00)', () => {
      const result = handleSchedulingTurn(stateAwaitingConfirm, 'não', { services });
      expect(result.replyText).toContain('manhã');
      expect(result.replyText).toContain('09h');
    });

    it('3 declines => handover with summary', () => {
      const stateWith2Declines: ConversationState = {
        ...stateAwaitingConfirm,
        declineCount: MAX_DECLINES - 1,
      };
      const result = handleSchedulingTurn(stateWith2Declines, 'não', { services });
      expect(result.nextState.activeSkill).toBe('NONE');
      expect(result.nextState.step).toBe('NONE');
      expect(result.handover).toBe(true);
      expect(result.nextState.handoverSummary).toContain('Alisamento');
      expect(result.nextState.handoverSummary).toContain(`${MAX_DECLINES}x`);
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
    if (result && result !== 'INVALID_HOUR' && 'time' in result) {
      expect(result.time).toBe('10:00');
    }
  });

  it('"14:30" => parses 14:30', () => {
    const result = parseDatetime('14:30');
    expect(result).not.toBeNull();
    if (result && result !== 'INVALID_HOUR' && 'time' in result) {
      expect(result.time).toBe('14:30');
    }
  });

  it('"14h30" => parses 14:30', () => {
    const result = parseDatetime('14h30');
    expect(result).not.toBeNull();
    if (result && result !== 'INVALID_HOUR' && 'time' in result) {
      expect(result.time).toBe('14:30');
    }
  });

  it('"27h" => INVALID_HOUR', () => {
    expect(parseDatetime('27h')).toBe('INVALID_HOUR');
  });

  it('"qualquer dia" => null (no time, no period)', () => {
    expect(parseDatetime('qualquer dia')).toBeNull();
  });

  // --- P0.1.1: Period parsing ---

  it('"amanhã de manhã" => ParsedPeriod with MANHA', () => {
    const result = parseDatetime('amanhã de manhã');
    expect(result).not.toBeNull();
    expect(result).not.toBe('INVALID_HOUR');
    if (result && result !== 'INVALID_HOUR' && 'period' in result) {
      expect(result.period).toBe('MANHA');
      expect(result.dateISO).toBeDefined();
    } else {
      fail('Expected ParsedPeriod with period field');
    }
  });

  it('"de manhã" => ParsedPeriod MANHA', () => {
    const result = parseDatetime('de manhã');
    expect(result).not.toBeNull();
    expect(result).not.toBe('INVALID_HOUR');
    if (result && result !== 'INVALID_HOUR' && 'period' in result) {
      expect(result.period).toBe('MANHA');
    } else {
      fail('Expected ParsedPeriod');
    }
  });

  it('"a tarde" => ParsedPeriod TARDE', () => {
    const result = parseDatetime('a tarde');
    expect(result).not.toBeNull();
    expect(result).not.toBe('INVALID_HOUR');
    if (result && result !== 'INVALID_HOUR' && 'period' in result) {
      expect(result.period).toBe('TARDE');
    } else {
      fail('Expected ParsedPeriod');
    }
  });

  it('"à noite" => ParsedPeriod NOITE', () => {
    const result = parseDatetime('à noite');
    expect(result).not.toBeNull();
    expect(result).not.toBe('INVALID_HOUR');
    if (result && result !== 'INVALID_HOUR' && 'period' in result) {
      expect(result.period).toBe('NOITE');
    } else {
      fail('Expected ParsedPeriod');
    }
  });

  it('"amanhã 10h" => ParsedDatetime (time takes priority over period)', () => {
    const result = parseDatetime('amanhã 10h');
    expect(result).not.toBeNull();
    expect(result).not.toBe('INVALID_HOUR');
    if (result && result !== 'INVALID_HOUR' && 'time' in result) {
      expect(result.time).toBe('10:00');
    } else {
      fail('Expected ParsedDatetime with time');
    }
  });

  it('"hoje de tarde" => ParsedPeriod with today date', () => {
    const result = parseDatetime('hoje de tarde');
    expect(result).not.toBeNull();
    expect(result).not.toBe('INVALID_HOUR');
    if (result && result !== 'INVALID_HOUR' && 'period' in result) {
      expect(result.period).toBe('TARDE');
      const today = new Date();
      const expectedISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      expect(result.dateISO).toBe(expectedISO);
    } else {
      fail('Expected ParsedPeriod');
    }
  });
});

// =====================================================
// 3b. PERIOD DETECTION
// =====================================================
describe('detectPeriod', () => {
  it('"de manha" => MANHA', () => {
    expect(detectPeriod('de manha')).toBe('MANHA');
  });

  it('"manha" => MANHA', () => {
    expect(detectPeriod('manha')).toBe('MANHA');
  });

  it('"a tarde" => TARDE', () => {
    expect(detectPeriod('a tarde')).toBe('TARDE');
  });

  it('"tarde" => TARDE', () => {
    expect(detectPeriod('tarde')).toBe('TARDE');
  });

  it('"noite" => NOITE', () => {
    expect(detectPeriod('noite')).toBe('NOITE');
  });

  it('"qualquer dia" => null', () => {
    expect(detectPeriod('qualquer dia')).toBeNull();
  });
});

// =====================================================
// 3c. AVAILABILITY QUESTION DETECTION
// =====================================================
describe('isAvailabilityQuestion', () => {
  it('"qual horário tem livre" => true', () => {
    expect(isAvailabilityQuestion('qual horário tem livre')).toBe(true);
  });

  it('"tem vaga amanhã?" => true', () => {
    expect(isAvailabilityQuestion('tem vaga amanhã?')).toBe(true);
  });

  it('"quais horários disponíveis" => true', () => {
    expect(isAvailabilityQuestion('quais horários disponíveis')).toBe(true);
  });

  it('"tem horário de manhã?" => true', () => {
    expect(isAvailabilityQuestion('tem horário de manhã?')).toBe(true);
  });

  it('"amanhã 10h" => false', () => {
    expect(isAvailabilityQuestion('amanhã 10h')).toBe(false);
  });

  it('"alisamento" => false', () => {
    expect(isAvailabilityQuestion('alisamento')).toBe(false);
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

// =====================================================
// 6. PERIOD SUGGESTIONS (constants)
// =====================================================
describe('PERIOD_SUGGESTIONS', () => {
  it('MANHA includes 09h', () => {
    expect(PERIOD_SUGGESTIONS.MANHA).toContain('09h');
  });

  it('TARDE includes 14h', () => {
    expect(PERIOD_SUGGESTIONS.TARDE).toContain('14h');
  });

  it('NOITE includes 18h', () => {
    expect(PERIOD_SUGGESTIONS.NOITE).toContain('18h');
  });
});

// =====================================================
// 7. REPLY DEDUP GATE — replySig (pure)
// =====================================================
describe('replySig', () => {
  it('produces consistent hash for same text', () => {
    const sig1 = replySig('Boa tarde!');
    const sig2 = replySig('Boa tarde!');
    expect(sig1).toBe(sig2);
  });

  it('produces different hash for different text', () => {
    expect(replySig('Boa tarde!')).not.toBe(replySig('Bom dia!'));
  });

  it('normalizes whitespace before hashing', () => {
    expect(replySig('Boa   tarde!')).toBe(replySig('Boa tarde!'));
  });

  it('normalizes leading/trailing spaces', () => {
    expect(replySig('  Boa tarde!  ')).toBe(replySig('Boa tarde!'));
  });

  it('returns a 16-char hex string', () => {
    const sig = replySig('qualquer texto');
    expect(sig).toMatch(/^[0-9a-f]{16}$/);
  });
});

// =====================================================
// 8. STAFF QUESTION DETECTION
// =====================================================
describe('isStaffQuestion', () => {
  it('"quem é o cabeleireiro?" => true', () => {
    expect(isStaffQuestion('quem é o cabeleireiro?')).toBe(true);
  });

  it('"quem vai me atender?" => true', () => {
    expect(isStaffQuestion('quem vai me atender?')).toBe(true);
  });

  it('"qual profissional?" => true', () => {
    expect(isStaffQuestion('qual profissional?')).toBe(true);
  });

  it('"quem faz o corte?" => true', () => {
    expect(isStaffQuestion('quem faz o corte?')).toBe(true);
  });

  it('"amanhã 10h" => false', () => {
    expect(isStaffQuestion('amanhã 10h')).toBe(false);
  });

  it('"sim" => false', () => {
    expect(isStaffQuestion('sim')).toBe(false);
  });
});

// =====================================================
// 9. INTERRUPTION HANDLER (staff question during scheduling)
// =====================================================
describe('staff interruption during scheduling', () => {
  const services = [
    { id: '1', name: 'Alisamento', price: 250 },
  ];

  it('AWAITING_CONFIRM: "quem é o cabeleireiro?" answers + resumes confirm', () => {
    const state: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_CONFIRM',
      slots: { serviceId: '1', serviceLabel: 'Alisamento', dateISO: '2026-01-28', time: '10:00' },
      ttlExpiresAt: bumpTTL(),
    };
    const result = handleSchedulingTurn(state, 'quem é o cabeleireiro?', { services });

    // Should answer the question
    expect(result.replyText).toContain('equipe do salão');
    // Should resume the confirm step
    expect(result.replyText).toContain('Alisamento');
    expect(result.replyText).toContain('sim/não');
    // Should NOT reset FSM
    expect(result.nextState.activeSkill).toBeUndefined();
    expect(result.nextState.step).toBeUndefined();
  });

  it('AWAITING_DATETIME: "quem vai me atender" answers + resumes datetime', () => {
    const state: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_DATETIME',
      slots: { serviceId: '1', serviceLabel: 'Alisamento' },
      ttlExpiresAt: bumpTTL(),
    };
    const result = handleSchedulingTurn(state, 'quem vai me atender?', { services });

    expect(result.replyText).toContain('equipe do salão');
    expect(result.replyText).toContain('Alisamento');
    expect(result.nextState.step).toBeUndefined();
  });

  it('AWAITING_SERVICE: "qual profissional" answers + resumes service', () => {
    const state: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_SERVICE',
      ttlExpiresAt: bumpTTL(),
    };
    const result = handleSchedulingTurn(state, 'qual profissional?', { services });

    expect(result.replyText).toContain('equipe do salão');
    expect(result.replyText).toContain('serviço');
    expect(result.nextState.step).toBeUndefined();
  });
});

// =====================================================
// 10. SOFTENED COPY (P0.1.2)
// =====================================================
describe('softened availability copy', () => {
  const services = [
    { id: '1', name: 'Alisamento', price: 250 },
  ];
  const stateAwaitingDatetime: ConversationState = {
    ...defaultState(),
    activeSkill: 'SCHEDULING',
    step: 'AWAITING_DATETIME',
    slots: { serviceId: '1', serviceLabel: 'Alisamento' },
    ttlExpiresAt: bumpTTL(),
  };

  it('period suggestion uses "posso tentar" instead of "temos"', () => {
    const result = handleSchedulingTurn(stateAwaitingDatetime, 'de manhã', { services });
    expect(result.replyText).toContain('posso tentar');
    expect(result.replyText).not.toMatch(/\btemos\b/);
  });

  it('availability response uses "posso tentar" instead of "temos"', () => {
    const result = handleSchedulingTurn(stateAwaitingDatetime, 'qual horário tem livre?', { services });
    expect(result.replyText).toContain('posso tentar');
    expect(result.replyText).not.toMatch(/\btemos\b/);
  });
});

// =====================================================
// 11. INFO QUESTION DETECTION (P0.1.3)
// =====================================================
describe('isInfoQuestion', () => {
  it('"quanto custa o corte?" => true', () => {
    expect(isInfoQuestion('quanto custa o corte?')).toBe(true);
  });

  it('"qual o preço do alisamento?" => true', () => {
    expect(isInfoQuestion('qual o preço do alisamento?')).toBe(true);
  });

  it('"que hora abre?" => true', () => {
    expect(isInfoQuestion('que hora abre?')).toBe(true);
  });

  it('"até que hora funciona?" => true', () => {
    expect(isInfoQuestion('até que hora funciona?')).toBe(true);
  });

  it('"horário de funcionamento" => true', () => {
    expect(isInfoQuestion('horário de funcionamento')).toBe(true);
  });

  it('"amanhã 10h" => false', () => {
    expect(isInfoQuestion('amanhã 10h')).toBe(false);
  });

  it('"sim" => false', () => {
    expect(isInfoQuestion('sim')).toBe(false);
  });
});

// =====================================================
// 12. INFO INTERRUPTION DURING SCHEDULING (P0.1.3)
// =====================================================
describe('info interruption during scheduling', () => {
  const services = [
    { id: '1', name: 'Alisamento', price: 250 },
  ];

  it('AWAITING_CONFIRM: "quanto custa?" => interruptionQuery + resume prompt', () => {
    const state: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_CONFIRM',
      slots: { serviceId: '1', serviceLabel: 'Alisamento', dateISO: '2026-01-28', time: '10:00' },
      ttlExpiresAt: bumpTTL(),
    };
    const result = handleSchedulingTurn(state, 'quanto custa o corte?', { services });
    expect(result.interruptionQuery).toBe(true);
    expect(result.replyText).toContain('Voltando ao seu agendamento');
    expect(result.replyText).toContain('Alisamento');
    expect(result.nextState.step).toBeUndefined(); // no FSM reset
  });

  it('AWAITING_DATETIME: "que hora abre?" => interruptionQuery + resume', () => {
    const state: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_DATETIME',
      slots: { serviceId: '1', serviceLabel: 'Alisamento' },
      ttlExpiresAt: bumpTTL(),
    };
    const result = handleSchedulingTurn(state, 'que hora abre?', { services });
    expect(result.interruptionQuery).toBe(true);
    expect(result.replyText).toContain('Voltando');
    expect(result.nextState.step).toBeUndefined();
  });

  it('non-info question does NOT trigger interruptionQuery', () => {
    const state: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_DATETIME',
      slots: { serviceId: '1', serviceLabel: 'Alisamento' },
      ttlExpiresAt: bumpTTL(),
    };
    const result = handleSchedulingTurn(state, 'amanhã 10h', { services });
    expect(result.interruptionQuery).toBeUndefined();
  });
});

// =====================================================
// 13. SALES RETAKE — declineCount + MAX_DECLINES (P0.1.3)
// =====================================================
describe('sales retake constants', () => {
  it('MAX_DECLINES is 3', () => {
    expect(MAX_DECLINES).toBe(3);
  });

  it('defaultState has declineCount 0', () => {
    expect(defaultState().declineCount).toBe(0);
  });
});

// =====================================================
// 14. P0.4 — FALLBACK PREMIUM (Gemini falha)
// =====================================================
describe('P0.4 fallback premium', () => {
  it('getFallbackResponse never contains "instabilidade"', () => {
    const service = new GeminiService();
    // Run multiple times to cover randomness
    for (let i = 0; i < 20; i++) {
      const response = service.getFallbackResponse();
      expect(response.toLowerCase()).not.toContain('instabilidade');
      expect(response.toLowerCase()).not.toContain('tente novamente');
    }
  });

  it('getFallbackResponse returns a helpful message', () => {
    const service = new GeminiService();
    const response = service.getFallbackResponse();
    expect(response.length).toBeGreaterThan(20);
    // Should offer concrete help
    expect(response.toLowerCase()).toMatch(/ajudar|serviço|agend|preço|valor/i);
  });
});

// =====================================================
// 15. P0.4 — GREETING SEM VÍRGULA SOLTA
// =====================================================
describe('P0.4 greeting format', () => {
  it('greeting with name produces "Bom dia, Nome!"', () => {
    const result = composeResponse({
      greeting: 'Bom dia',
      introduction: null,
      clientName: 'Maria Silva',
      baseText: 'Posso ajudar?',
      cta: null,
      askName: false,
    });
    expect(result).toContain('Bom dia, Maria!');
    expect(result).not.toMatch(/^,/); // never starts with comma
  });

  it('no greeting + name does NOT start with comma', () => {
    const result = composeResponse({
      greeting: '',
      introduction: null,
      clientName: 'João Santos',
      baseText: 'Aqui estão os horários.',
      cta: null,
      askName: false,
    });
    expect(result).not.toMatch(/^,/);
    expect(result).not.toContain(', João');
    expect(result).toContain('João,');
  });

  it('no greeting + no name => only baseText', () => {
    const result = composeResponse({
      greeting: '',
      introduction: null,
      clientName: null,
      baseText: 'Resultado aqui.',
      cta: null,
      askName: false,
    });
    expect(result).not.toMatch(/^[,!]/);
    expect(result).toContain('Resultado aqui.');
  });

  it('uses first name only (strips sobrenome)', () => {
    const result = composeResponse({
      greeting: 'Boa tarde',
      introduction: null,
      clientName: 'Ana Paula Oliveira',
      baseText: 'Ok!',
      cta: null,
      askName: false,
    });
    expect(result).toContain('Boa tarde, Ana!');
    expect(result).not.toContain('Paula');
    expect(result).not.toContain('Oliveira');
  });
});
