/**
 * =====================================================
 * CONVERSATION STATE — FSM para Alexis WhatsApp (P0.1)
 * Tipos puros + helpers sem dependência de DB
 * =====================================================
 */
export type ActiveSkill = 'NONE' | 'SCHEDULING';
export type ScheduleStep = 'NONE' | 'AWAITING_SERVICE' | 'AWAITING_PROFESSIONAL' | 'AWAITING_DATETIME' | 'AWAITING_CONFIRM';
export interface SchedulingSlots {
    serviceId?: string;
    serviceLabel?: string;
    professionalId?: string;
    professionalLabel?: string;
    dateISO?: string;
    time?: string;
    lastDeclinedPeriod?: string;
}
export interface ConversationState {
    activeSkill: ActiveSkill;
    step: ScheduleStep;
    slots: SchedulingSlots;
    userAlreadyGreeted: boolean;
    lastGreetingAt: string | null;
    confusionCount: number;
    declineCount: number;
    ttlExpiresAt: string | null;
    handoverSummary?: string;
    handoverAt?: string;
    /** P0: Idempotência — timestamp do commit do agendamento */
    schedulingCommittedAt?: string;
    /** P0: Idempotência — ID do appointment criado */
    schedulingAppointmentId?: string;
}
/** Debounce window (ms) */
export declare const DEBOUNCE_MS = 2500;
/** TTL de state ativo (minutos) */
export declare const STATE_TTL_MINUTES = 60;
/** Máximo de tentativas confusas antes de handover */
export declare const MAX_CONFUSION = 3;
/** Máximo de recusas de horário antes de handover */
export declare const MAX_DECLINES = 3;
export declare function defaultState(): ConversationState;
export declare function nowIso(): string;
export declare function isExpired(ttlExpiresAt: string | null): boolean;
export declare function bumpTTL(minutes?: number): string;
export declare function mergeBufferTexts(texts: string[]): string;
//# sourceMappingURL=conversation-state.d.ts.map