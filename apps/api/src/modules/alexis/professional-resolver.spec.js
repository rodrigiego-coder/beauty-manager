"use strict";
/**
 * =====================================================
 * P0.3 TESTS — Professional Resolver + FSM AWAITING_PROFESSIONAL
 * =====================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
const professional_resolver_1 = require("./professional-resolver");
const scheduling_skill_1 = require("./scheduling-skill");
const conversation_state_1 = require("./conversation-state");
// =====================================================
// 1. resolveAptProfessionals
// =====================================================
describe('resolveAptProfessionals', () => {
    const pros = [
        { id: 'p1', name: 'Ana', active: true },
        { id: 'p2', name: 'Bruno', active: true },
        { id: 'p3', name: 'Carla', active: false },
        { id: 'p4', name: 'Daniel', active: true },
    ];
    it('legacy mode (no assignments) => returns all active', () => {
        const result = (0, professional_resolver_1.resolveAptProfessionals)(1, pros, []);
        expect(result).toHaveLength(3); // Ana, Bruno, Daniel (Carla inactive)
        expect(result.map((p) => p.name)).toEqual(['Ana', 'Bruno', 'Daniel']);
    });
    it('filtered mode => only assigned professionals', () => {
        const assignments = [
            { professionalId: 'p1', serviceId: 1, enabled: true },
            { professionalId: 'p2', serviceId: 2, enabled: true },
            { professionalId: 'p4', serviceId: 1, enabled: true },
        ];
        const result = (0, professional_resolver_1.resolveAptProfessionals)(1, pros, assignments);
        expect(result).toHaveLength(2);
        expect(result.map((p) => p.name)).toEqual(['Ana', 'Daniel']);
    });
    it('disabled assignment is excluded', () => {
        const assignments = [
            { professionalId: 'p1', serviceId: 1, enabled: true },
            { professionalId: 'p2', serviceId: 1, enabled: false },
        ];
        const result = (0, professional_resolver_1.resolveAptProfessionals)(1, pros, assignments);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Ana');
    });
    it('inactive professional excluded even if assigned', () => {
        const assignments = [
            { professionalId: 'p3', serviceId: 1, enabled: true }, // Carla is inactive
        ];
        const result = (0, professional_resolver_1.resolveAptProfessionals)(1, pros, assignments);
        expect(result).toHaveLength(0);
    });
    it('string serviceId is parsed', () => {
        const assignments = [
            { professionalId: 'p1', serviceId: 5, enabled: true },
        ];
        const result = (0, professional_resolver_1.resolveAptProfessionals)('5', pros, assignments);
        expect(result).toHaveLength(1);
    });
});
// =====================================================
// 2. formatProfessionalList
// =====================================================
describe('formatProfessionalList', () => {
    it('formats numbered list', () => {
        const pros = [
            { id: 'p1', name: 'Ana', active: true },
            { id: 'p2', name: 'Bruno', active: true },
        ];
        const result = (0, professional_resolver_1.formatProfessionalList)(pros);
        expect(result).toBe('1. Ana\n2. Bruno');
    });
    it('empty list returns empty string', () => {
        expect((0, professional_resolver_1.formatProfessionalList)([])).toBe('');
    });
});
// =====================================================
// 3. fuzzyMatchProfessional
// =====================================================
describe('fuzzyMatchProfessional', () => {
    const pros = [
        { id: 'p1', name: 'Ana Maria', active: true },
        { id: 'p2', name: 'Bruno Silva', active: true },
        { id: 'p3', name: 'Carla', active: true },
    ];
    it('match by number "1" => Ana Maria', () => {
        expect((0, professional_resolver_1.fuzzyMatchProfessional)('1', pros)?.name).toBe('Ana Maria');
    });
    it('match by number "2" => Bruno Silva', () => {
        expect((0, professional_resolver_1.fuzzyMatchProfessional)('2', pros)?.name).toBe('Bruno Silva');
    });
    it('match by full name', () => {
        expect((0, professional_resolver_1.fuzzyMatchProfessional)('Ana Maria', pros)?.name).toBe('Ana Maria');
    });
    it('match by first name', () => {
        expect((0, professional_resolver_1.fuzzyMatchProfessional)('Bruno', pros)?.name).toBe('Bruno Silva');
    });
    it('match by partial name', () => {
        expect((0, professional_resolver_1.fuzzyMatchProfessional)('carla', pros)?.name).toBe('Carla');
    });
    it('no match returns null', () => {
        expect((0, professional_resolver_1.fuzzyMatchProfessional)('Zé', pros)).toBeNull();
    });
    it('empty text returns null', () => {
        expect((0, professional_resolver_1.fuzzyMatchProfessional)('', pros)).toBeNull();
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
    const pros = [
        { id: 'p1', name: 'Ana', active: true },
        { id: 'p2', name: 'Bruno', active: true },
    ];
    const assignments = [
        { professionalId: 'p1', serviceId: 1, enabled: true },
        { professionalId: 'p2', serviceId: 1, enabled: true },
    ];
    const ctx = { services, professionals: pros, professionalAssignments: assignments };
    it('"alisamento" => AWAITING_PROFESSIONAL when 2+ pros', () => {
        const state = {
            ...(0, conversation_state_1.defaultState)(),
            activeSkill: 'SCHEDULING',
            step: 'AWAITING_SERVICE',
            ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
        };
        const result = (0, scheduling_skill_1.handleSchedulingTurn)(state, 'alisamento', ctx);
        expect(result.nextState.step).toBe('AWAITING_PROFESSIONAL');
        expect(result.nextState.slots?.serviceId).toBe('1');
        expect(result.replyText).toContain('profissional');
        expect(result.replyText).toContain('Ana');
        expect(result.replyText).toContain('Bruno');
    });
    it('"alisamento" => AWAITING_DATETIME when only 1 pro', () => {
        const singleAssign = [
            { professionalId: 'p1', serviceId: 1, enabled: true },
        ];
        const singleCtx = { services, professionals: pros, professionalAssignments: singleAssign };
        const state = {
            ...(0, conversation_state_1.defaultState)(),
            activeSkill: 'SCHEDULING',
            step: 'AWAITING_SERVICE',
            ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
        };
        const result = (0, scheduling_skill_1.handleSchedulingTurn)(state, 'alisamento', singleCtx);
        expect(result.nextState.step).toBe('AWAITING_DATETIME');
        expect(result.nextState.slots?.professionalId).toBe('p1');
        expect(result.nextState.slots?.professionalLabel).toBe('Ana');
    });
    it('"alisamento" => AWAITING_DATETIME when no assignments (legacy)', () => {
        const legacyCtx = { services, professionals: pros, professionalAssignments: [] };
        const state = {
            ...(0, conversation_state_1.defaultState)(),
            activeSkill: 'SCHEDULING',
            step: 'AWAITING_SERVICE',
            ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
        };
        // Legacy: all pros qualify, but more than 1 => AWAITING_PROFESSIONAL
        const result = (0, scheduling_skill_1.handleSchedulingTurn)(state, 'alisamento', legacyCtx);
        expect(result.nextState.step).toBe('AWAITING_PROFESSIONAL');
    });
    it('AWAITING_PROFESSIONAL: "Ana" => fills professionalId, goes AWAITING_DATETIME', () => {
        const state = {
            ...(0, conversation_state_1.defaultState)(),
            activeSkill: 'SCHEDULING',
            step: 'AWAITING_PROFESSIONAL',
            slots: { serviceId: '1', serviceLabel: 'Alisamento' },
            ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
        };
        const result = (0, scheduling_skill_1.handleSchedulingTurn)(state, 'Ana', ctx);
        expect(result.nextState.step).toBe('AWAITING_DATETIME');
        expect(result.nextState.slots?.professionalId).toBe('p1');
        expect(result.nextState.slots?.professionalLabel).toBe('Ana');
    });
    it('AWAITING_PROFESSIONAL: "1" => selects first professional', () => {
        const state = {
            ...(0, conversation_state_1.defaultState)(),
            activeSkill: 'SCHEDULING',
            step: 'AWAITING_PROFESSIONAL',
            slots: { serviceId: '1', serviceLabel: 'Alisamento' },
            ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
        };
        const result = (0, scheduling_skill_1.handleSchedulingTurn)(state, '1', ctx);
        expect(result.nextState.step).toBe('AWAITING_DATETIME');
        expect(result.nextState.slots?.professionalId).toBe('p1');
    });
    it('AWAITING_PROFESSIONAL: "qualquer" => skips professional, goes AWAITING_DATETIME', () => {
        const state = {
            ...(0, conversation_state_1.defaultState)(),
            activeSkill: 'SCHEDULING',
            step: 'AWAITING_PROFESSIONAL',
            slots: { serviceId: '1', serviceLabel: 'Alisamento' },
            ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
        };
        const result = (0, scheduling_skill_1.handleSchedulingTurn)(state, 'qualquer', ctx);
        expect(result.nextState.step).toBe('AWAITING_DATETIME');
        expect(result.nextState.slots?.professionalId).toBeUndefined();
    });
    it('AWAITING_PROFESSIONAL: "tanto faz" => skips professional', () => {
        const state = {
            ...(0, conversation_state_1.defaultState)(),
            activeSkill: 'SCHEDULING',
            step: 'AWAITING_PROFESSIONAL',
            slots: { serviceId: '1', serviceLabel: 'Alisamento' },
            ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
        };
        const result = (0, scheduling_skill_1.handleSchedulingTurn)(state, 'tanto faz', ctx);
        expect(result.nextState.step).toBe('AWAITING_DATETIME');
    });
    it('AWAITING_PROFESSIONAL: unknown name => confusionCount++', () => {
        const state = {
            ...(0, conversation_state_1.defaultState)(),
            activeSkill: 'SCHEDULING',
            step: 'AWAITING_PROFESSIONAL',
            slots: { serviceId: '1', serviceLabel: 'Alisamento' },
            ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
        };
        const result = (0, scheduling_skill_1.handleSchedulingTurn)(state, 'Zé', ctx);
        expect(result.nextState.step).toBeUndefined(); // stays in same step
        expect(result.nextState.confusionCount).toBe(1);
    });
    it('AWAITING_PROFESSIONAL: 3 confusions => auto-skip to AWAITING_DATETIME', () => {
        const state = {
            ...(0, conversation_state_1.defaultState)(),
            activeSkill: 'SCHEDULING',
            step: 'AWAITING_PROFESSIONAL',
            slots: { serviceId: '1', serviceLabel: 'Alisamento' },
            confusionCount: 2,
            ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
        };
        const result = (0, scheduling_skill_1.handleSchedulingTurn)(state, 'Zé', ctx);
        expect(result.nextState.step).toBe('AWAITING_DATETIME');
        expect(result.replyText).toContain('disponível');
    });
    it('AWAITING_CONFIRM includes professional in summary when set', () => {
        const state = {
            ...(0, conversation_state_1.defaultState)(),
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
            ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
        };
        const result = (0, scheduling_skill_1.handleSchedulingTurn)(state, 'sim', ctx);
        expect(result.handover).toBe(true);
        expect(result.nextState.handoverSummary).toContain('Ana');
    });
});
// =====================================================
// 5. ScheduleStep enum includes AWAITING_PROFESSIONAL
// =====================================================
describe('ScheduleStep includes AWAITING_PROFESSIONAL', () => {
    it('defaultState has step NONE', () => {
        expect((0, conversation_state_1.defaultState)().step).toBe('NONE');
    });
    it('slots support professionalId/professionalLabel', () => {
        const state = (0, conversation_state_1.defaultState)();
        state.slots.professionalId = 'p1';
        state.slots.professionalLabel = 'Ana';
        expect(state.slots.professionalId).toBe('p1');
    });
});
//# sourceMappingURL=professional-resolver.spec.js.map