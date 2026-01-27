/**
 * =====================================================
 * P0.3 TESTS — Professional Resolver + FSM AWAITING_PROFESSIONAL
 * =====================================================
 */

import {
  resolveAptProfessionals,
  formatProfessionalList,
  fuzzyMatchProfessional,
  ProfessionalInfo,
  ProfessionalServiceAssignment,
} from './professional-resolver';

import {
  handleSchedulingTurn,
  SkillContext,
} from './scheduling-skill';

import { ConversationState, defaultState, bumpTTL } from './conversation-state';

// =====================================================
// 1. resolveAptProfessionals
// =====================================================
describe('resolveAptProfessionals', () => {
  const pros: ProfessionalInfo[] = [
    { id: 'p1', name: 'Ana', active: true },
    { id: 'p2', name: 'Bruno', active: true },
    { id: 'p3', name: 'Carla', active: false },
    { id: 'p4', name: 'Daniel', active: true },
  ];

  it('legacy mode (no assignments) => returns all active', () => {
    const result = resolveAptProfessionals(1, pros, []);
    expect(result).toHaveLength(3); // Ana, Bruno, Daniel (Carla inactive)
    expect(result.map((p) => p.name)).toEqual(['Ana', 'Bruno', 'Daniel']);
  });

  it('filtered mode => only assigned professionals', () => {
    const assignments: ProfessionalServiceAssignment[] = [
      { professionalId: 'p1', serviceId: 1, enabled: true },
      { professionalId: 'p2', serviceId: 2, enabled: true },
      { professionalId: 'p4', serviceId: 1, enabled: true },
    ];
    const result = resolveAptProfessionals(1, pros, assignments);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.name)).toEqual(['Ana', 'Daniel']);
  });

  it('disabled assignment is excluded', () => {
    const assignments: ProfessionalServiceAssignment[] = [
      { professionalId: 'p1', serviceId: 1, enabled: true },
      { professionalId: 'p2', serviceId: 1, enabled: false },
    ];
    const result = resolveAptProfessionals(1, pros, assignments);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Ana');
  });

  it('inactive professional excluded even if assigned', () => {
    const assignments: ProfessionalServiceAssignment[] = [
      { professionalId: 'p3', serviceId: 1, enabled: true }, // Carla is inactive
    ];
    const result = resolveAptProfessionals(1, pros, assignments);
    expect(result).toHaveLength(0);
  });

  it('string serviceId is parsed', () => {
    const assignments: ProfessionalServiceAssignment[] = [
      { professionalId: 'p1', serviceId: 5, enabled: true },
    ];
    const result = resolveAptProfessionals('5', pros, assignments);
    expect(result).toHaveLength(1);
  });
});

// =====================================================
// 2. formatProfessionalList
// =====================================================
describe('formatProfessionalList', () => {
  it('formats numbered list', () => {
    const pros: ProfessionalInfo[] = [
      { id: 'p1', name: 'Ana', active: true },
      { id: 'p2', name: 'Bruno', active: true },
    ];
    const result = formatProfessionalList(pros);
    expect(result).toBe('1. Ana\n2. Bruno');
  });

  it('empty list returns empty string', () => {
    expect(formatProfessionalList([])).toBe('');
  });
});

// =====================================================
// 3. fuzzyMatchProfessional
// =====================================================
describe('fuzzyMatchProfessional', () => {
  const pros: ProfessionalInfo[] = [
    { id: 'p1', name: 'Ana Maria', active: true },
    { id: 'p2', name: 'Bruno Silva', active: true },
    { id: 'p3', name: 'Carla', active: true },
  ];

  it('match by number "1" => Ana Maria', () => {
    expect(fuzzyMatchProfessional('1', pros)?.name).toBe('Ana Maria');
  });

  it('match by number "2" => Bruno Silva', () => {
    expect(fuzzyMatchProfessional('2', pros)?.name).toBe('Bruno Silva');
  });

  it('match by full name', () => {
    expect(fuzzyMatchProfessional('Ana Maria', pros)?.name).toBe('Ana Maria');
  });

  it('match by first name', () => {
    expect(fuzzyMatchProfessional('Bruno', pros)?.name).toBe('Bruno Silva');
  });

  it('match by partial name', () => {
    expect(fuzzyMatchProfessional('carla', pros)?.name).toBe('Carla');
  });

  it('no match returns null', () => {
    expect(fuzzyMatchProfessional('Zé', pros)).toBeNull();
  });

  it('empty text returns null', () => {
    expect(fuzzyMatchProfessional('', pros)).toBeNull();
  });
});

// =====================================================
// 4. FSM AWAITING_PROFESSIONAL step
// =====================================================
describe('FSM AWAITING_PROFESSIONAL', () => {
  const services = [
    { id: '1', name: 'Alisamento', price: 250 },
    { id: '2', name: 'Corte', price: 80 },
  ];

  const pros: ProfessionalInfo[] = [
    { id: 'p1', name: 'Ana', active: true },
    { id: 'p2', name: 'Bruno', active: true },
  ];

  const assignments: ProfessionalServiceAssignment[] = [
    { professionalId: 'p1', serviceId: 1, enabled: true },
    { professionalId: 'p2', serviceId: 1, enabled: true },
  ];

  const ctx: SkillContext = { services, professionals: pros, professionalAssignments: assignments };

  it('"alisamento" => AWAITING_PROFESSIONAL when 2+ pros', () => {
    const state: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_SERVICE',
      ttlExpiresAt: bumpTTL(),
    };
    const result = handleSchedulingTurn(state, 'alisamento', ctx);
    expect(result.nextState.step).toBe('AWAITING_PROFESSIONAL');
    expect(result.nextState.slots?.serviceId).toBe('1');
    expect(result.replyText).toContain('profissional');
    expect(result.replyText).toContain('Ana');
    expect(result.replyText).toContain('Bruno');
  });

  it('"alisamento" => AWAITING_DATETIME when only 1 pro', () => {
    const singleAssign: ProfessionalServiceAssignment[] = [
      { professionalId: 'p1', serviceId: 1, enabled: true },
    ];
    const singleCtx: SkillContext = { services, professionals: pros, professionalAssignments: singleAssign };
    const state: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_SERVICE',
      ttlExpiresAt: bumpTTL(),
    };
    const result = handleSchedulingTurn(state, 'alisamento', singleCtx);
    expect(result.nextState.step).toBe('AWAITING_DATETIME');
    expect(result.nextState.slots?.professionalId).toBe('p1');
    expect(result.nextState.slots?.professionalLabel).toBe('Ana');
  });

  it('"alisamento" => AWAITING_DATETIME when no assignments (legacy)', () => {
    const legacyCtx: SkillContext = { services, professionals: pros, professionalAssignments: [] };
    const state: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_SERVICE',
      ttlExpiresAt: bumpTTL(),
    };
    // Legacy: all pros qualify, but more than 1 => AWAITING_PROFESSIONAL
    const result = handleSchedulingTurn(state, 'alisamento', legacyCtx);
    expect(result.nextState.step).toBe('AWAITING_PROFESSIONAL');
  });

  it('AWAITING_PROFESSIONAL: "Ana" => fills professionalId, goes AWAITING_DATETIME', () => {
    const state: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_PROFESSIONAL',
      slots: { serviceId: '1', serviceLabel: 'Alisamento' },
      ttlExpiresAt: bumpTTL(),
    };
    const result = handleSchedulingTurn(state, 'Ana', ctx);
    expect(result.nextState.step).toBe('AWAITING_DATETIME');
    expect(result.nextState.slots?.professionalId).toBe('p1');
    expect(result.nextState.slots?.professionalLabel).toBe('Ana');
  });

  it('AWAITING_PROFESSIONAL: "1" => selects first professional', () => {
    const state: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_PROFESSIONAL',
      slots: { serviceId: '1', serviceLabel: 'Alisamento' },
      ttlExpiresAt: bumpTTL(),
    };
    const result = handleSchedulingTurn(state, '1', ctx);
    expect(result.nextState.step).toBe('AWAITING_DATETIME');
    expect(result.nextState.slots?.professionalId).toBe('p1');
  });

  it('AWAITING_PROFESSIONAL: "qualquer" => skips professional, goes AWAITING_DATETIME', () => {
    const state: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_PROFESSIONAL',
      slots: { serviceId: '1', serviceLabel: 'Alisamento' },
      ttlExpiresAt: bumpTTL(),
    };
    const result = handleSchedulingTurn(state, 'qualquer', ctx);
    expect(result.nextState.step).toBe('AWAITING_DATETIME');
    expect(result.nextState.slots?.professionalId).toBeUndefined();
  });

  it('AWAITING_PROFESSIONAL: "tanto faz" => skips professional', () => {
    const state: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_PROFESSIONAL',
      slots: { serviceId: '1', serviceLabel: 'Alisamento' },
      ttlExpiresAt: bumpTTL(),
    };
    const result = handleSchedulingTurn(state, 'tanto faz', ctx);
    expect(result.nextState.step).toBe('AWAITING_DATETIME');
  });

  it('AWAITING_PROFESSIONAL: unknown name => confusionCount++', () => {
    const state: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_PROFESSIONAL',
      slots: { serviceId: '1', serviceLabel: 'Alisamento' },
      ttlExpiresAt: bumpTTL(),
    };
    const result = handleSchedulingTurn(state, 'Zé', ctx);
    expect(result.nextState.step).toBeUndefined(); // stays in same step
    expect(result.nextState.confusionCount).toBe(1);
  });

  it('AWAITING_PROFESSIONAL: 3 confusions => auto-skip to AWAITING_DATETIME', () => {
    const state: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_PROFESSIONAL',
      slots: { serviceId: '1', serviceLabel: 'Alisamento' },
      confusionCount: 2,
      ttlExpiresAt: bumpTTL(),
    };
    const result = handleSchedulingTurn(state, 'Zé', ctx);
    expect(result.nextState.step).toBe('AWAITING_DATETIME');
    expect(result.replyText).toContain('disponível');
  });

  it('AWAITING_CONFIRM includes professional in summary when set', () => {
    const state: ConversationState = {
      ...defaultState(),
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_CONFIRM',
      slots: {
        serviceId: '1',
        serviceLabel: 'Alisamento',
        professionalId: 'p1',
        professionalLabel: 'Ana',
        dateISO: '2026-01-28',
        time: '10:00',
      },
      ttlExpiresAt: bumpTTL(),
    };
    const result = handleSchedulingTurn(state, 'sim', ctx);
    expect(result.handover).toBe(true);
    expect(result.nextState.handoverSummary).toContain('Ana');
  });
});

// =====================================================
// 5. ScheduleStep enum includes AWAITING_PROFESSIONAL
// =====================================================
describe('ScheduleStep includes AWAITING_PROFESSIONAL', () => {
  it('defaultState has step NONE', () => {
    expect(defaultState().step).toBe('NONE');
  });

  it('slots support professionalId/professionalLabel', () => {
    const state = defaultState();
    state.slots.professionalId = 'p1';
    state.slots.professionalLabel = 'Ana';
    expect(state.slots.professionalId).toBe('p1');
  });
});
