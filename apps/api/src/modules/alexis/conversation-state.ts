/**
 * =====================================================
 * CONVERSATION STATE — FSM para Alexis WhatsApp (P0.1)
 * Tipos puros + helpers sem dependência de DB
 * =====================================================
 */

export type ActiveSkill = 'NONE' | 'SCHEDULING';

export type ScheduleStep =
  | 'NONE'
  | 'AWAITING_SERVICE'
  | 'AWAITING_DATETIME'
  | 'AWAITING_CONFIRM';

export interface SchedulingSlots {
  serviceId?: string;
  serviceLabel?: string;
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
}

/** Debounce window (ms) */
export const DEBOUNCE_MS = 2500;

/** TTL de state ativo (minutos) */
export const STATE_TTL_MINUTES = 60;

/** Máximo de tentativas confusas antes de handover */
export const MAX_CONFUSION = 3;

/** Máximo de recusas de horário antes de handover */
export const MAX_DECLINES = 3;

export function defaultState(): ConversationState {
  return {
    activeSkill: 'NONE',
    step: 'NONE',
    slots: {},
    userAlreadyGreeted: false,
    lastGreetingAt: null,
    confusionCount: 0,
    declineCount: 0,
    ttlExpiresAt: null,
  };
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function isExpired(ttlExpiresAt: string | null): boolean {
  if (!ttlExpiresAt) return false;
  return new Date(ttlExpiresAt) < new Date();
}

export function bumpTTL(minutes = STATE_TTL_MINUTES): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

export function mergeBufferTexts(texts: string[]): string {
  return texts.filter(Boolean).join('\n').trim();
}
