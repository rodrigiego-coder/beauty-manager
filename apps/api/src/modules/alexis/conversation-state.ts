/**
 * =====================================================
 * CONVERSATION STATE — FSM para Alexis WhatsApp (P0.1)
 * Tipos puros + helpers sem dependência de DB
 * =====================================================
 */

export type ActiveSkill = 'NONE' | 'SCHEDULING' | 'PACKAGE_BATCH_SCHEDULING' | 'CANCELLATION' | 'CHANNEL_CHOICE';

export type ScheduleStep =
  | 'NONE'
  | 'AWAITING_SERVICE'
  | 'AWAITING_PROFESSIONAL'
  | 'AWAITING_DATETIME'
  | 'AWAITING_CONFIRM';

export type CancellationStep =
  | 'NONE'
  | 'AWAITING_CANCEL_CONFIRM'   // "Tem certeza que deseja cancelar?"
  | 'AWAITING_RESCHEDULE';      // "Quer reagendar para outro dia?"

export type PackageBatchStep =
  | 'NONE'
  | 'AWAITING_PREFERENCE'    // "Mesmo dia/horário toda semana?"
  | 'AWAITING_DAY'           // "Qual dia da semana?"
  | 'AWAITING_TIME'          // "Que horário?"
  | 'AWAITING_CONFIRM';      // "Confirma X sessões?"

export type ChannelChoiceStep = 'NONE' | 'AWAITING_CHOICE';

export interface SchedulingSlots {
  serviceId?: string;
  serviceLabel?: string;
  professionalId?: string;
  professionalLabel?: string;
  dateISO?: string;
  time?: string;
  lastDeclinedPeriod?: string;
}

export interface CancellationSlots {
  appointmentId?: string;
  serviceLabel?: string;
  dateISO?: string;
  time?: string;
  professionalLabel?: string;
  /** Horários disponíveis para reagendamento */
  rescheduleSlots?: Array<{ dateISO: string; time: string; display: string }>;
}

export interface PackageBatchSlots {
  clientPackageId?: number;
  packageName?: string;
  remainingSessions?: number;
  preferredDay?: string;         // "monday", "tuesday", etc
  preferredTime?: string;        // "14:00"
  sameTimeEveryWeek?: boolean;
  scheduledDates?: string[];     // ISO dates for batch
}

export interface ConversationState {
  activeSkill: ActiveSkill;
  step: ScheduleStep;
  cancellationStep?: CancellationStep;
  packageBatchStep?: PackageBatchStep;
  slots: SchedulingSlots;
  cancellationSlots?: CancellationSlots;
  packageBatchSlots?: PackageBatchSlots;
  channelChoiceStep?: ChannelChoiceStep;
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
  /** P0: Idempotência — timestamp do cancelamento */
  cancellationCommittedAt?: string;
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
    cancellationStep: 'NONE',
    packageBatchStep: 'NONE',
    slots: {},
    cancellationSlots: {},
    packageBatchSlots: {},
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
