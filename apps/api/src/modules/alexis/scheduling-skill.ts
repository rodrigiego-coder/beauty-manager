/**
 * =====================================================
 * SCHEDULING SKILL V2 — FSM transacional (P0.1)
 * Lógica pura: recebe state + text, retorna nextState + reply.
 * Sem dependência de DB (testável em isolamento).
 * =====================================================
 */

import { ConversationState, bumpTTL, MAX_CONFUSION } from './conversation-state';
import { fuzzyMatchService, normalizeText } from './schedule-continuation';

export interface SkillResult {
  nextState: Partial<ConversationState>;
  replyText: string;
  handover?: boolean;
}

export interface SkillContext {
  services: Array<{ id: string; name: string; price?: number }>;
}

// ========== ENTRY POINTS ==========

/** Inicia fluxo de agendamento */
export function startScheduling(): SkillResult {
  return {
    nextState: {
      activeSkill: 'SCHEDULING',
      step: 'AWAITING_SERVICE',
      slots: {},
      confusionCount: 0,
      ttlExpiresAt: bumpTTL(),
    },
    replyText: 'Perfeito 😊 Qual serviço você gostaria de agendar?',
  };
}

/** Roteia turno para o step correto */
export function handleSchedulingTurn(
  state: ConversationState,
  text: string,
  context: SkillContext,
): SkillResult {
  switch (state.step) {
    case 'AWAITING_SERVICE':
      return handleAwaitingService(state, text, context);
    case 'AWAITING_DATETIME':
      return handleAwaitingDatetime(state, text);
    case 'AWAITING_CONFIRM':
      return handleAwaitingConfirm(state, text);
    default:
      return startScheduling();
  }
}

// ========== STEP HANDLERS ==========

function handleAwaitingService(
  state: ConversationState,
  text: string,
  context: SkillContext,
): SkillResult {
  const matched = fuzzyMatchService(text, context.services);

  if (matched) {
    return {
      nextState: {
        step: 'AWAITING_DATETIME',
        slots: {
          serviceId: (matched as any).id,
          serviceLabel: matched.name,
        },
        confusionCount: 0,
        ttlExpiresAt: bumpTTL(),
      },
      replyText: `Ótima escolha! *${matched.name}* 😊 Para qual dia e horário você prefere?`,
    };
  }

  const newConfusion = (state.confusionCount || 0) + 1;

  if (newConfusion >= MAX_CONFUSION) {
    return {
      nextState: {
        activeSkill: 'NONE',
        step: 'NONE',
        slots: {},
        confusionCount: 0,
        handoverSummary: `Cliente tentou agendar mas não informou serviço válido após ${MAX_CONFUSION} tentativas.`,
        handoverAt: new Date().toISOString(),
      },
      replyText:
        'Vou chamar alguém da equipe para te ajudar com o agendamento, tudo bem? 😊',
      handover: true,
    };
  }

  return {
    nextState: {
      confusionCount: newConfusion,
      ttlExpiresAt: bumpTTL(),
    },
    replyText:
      'Não encontrei esse serviço. Pode repetir o nome? Por exemplo: corte, mechas, alisamento… 😊',
  };
}

// ========== DATETIME PARSING ==========

export interface ParsedDatetime {
  dateISO: string;
  time: string;
  display: string;
}

/**
 * Parse simples de data/hora a partir de mensagem do cliente.
 * Reconhece: "10h", "10:30", "14h30", "amanhã 10h", "hoje 15h"
 * Retorna null se não encontrar horário, 'INVALID_HOUR' se hora > 23.
 */
export function parseDatetime(
  text: string,
): ParsedDatetime | 'INVALID_HOUR' | null {
  const normalized = normalizeText(text);

  // Extrai horário: "10h", "10:30", "14h30", "10 horas"
  const timeMatch = normalized.match(
    /(\d{1,2})(?::(\d{2})|h(\d{2})?|\s*horas?)/,
  );
  if (!timeMatch) return null;

  const hour = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2] || timeMatch[3] || '0', 10);

  if (hour > 23) return 'INVALID_HOUR';
  if (minutes > 59) return null;

  const timeStr = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  // Data: "hoje" = hoje, default = amanhã
  const today = new Date();
  let date: Date;

  if (normalized.includes('hoje')) {
    date = new Date(today);
  } else {
    date = new Date(today);
    date.setDate(date.getDate() + 1);
  }

  const dateISO = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const display = `${date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })} às ${timeStr}`;

  return { dateISO, time: timeStr, display };
}

function handleAwaitingDatetime(
  state: ConversationState,
  text: string,
): SkillResult {
  const parsed = parseDatetime(text);

  if (parsed === null) {
    return {
      nextState: { ttlExpiresAt: bumpTTL() },
      replyText:
        'Você prefere amanhã ou outro dia? E qual horário — manhã ou tarde? 😊',
    };
  }

  if (parsed === 'INVALID_HOUR') {
    return {
      nextState: { ttlExpiresAt: bumpTTL() },
      replyText:
        'Meu relógio vai até 24h 😊 Você quis dizer 07h ou prefere um horário à tarde, tipo 15h?',
    };
  }

  return {
    nextState: {
      step: 'AWAITING_CONFIRM',
      slots: { ...state.slots, dateISO: parsed.dateISO, time: parsed.time },
      ttlExpiresAt: bumpTTL(),
    },
    replyText: `Perfeito! Posso confirmar *${state.slots.serviceLabel}* para *${parsed.display}*? (sim/não)`,
  };
}

function handleAwaitingConfirm(
  state: ConversationState,
  text: string,
): SkillResult {
  const normalized = normalizeText(text);

  const positives = [
    'sim', 's', 'confirmo', 'confirma', 'pode', 'ok',
    'beleza', 'certo', 'combinado', 'isso',
  ];
  const negatives = [
    'nao', 'n', 'cancelar', 'cancela', 'nao quero', 'desisto',
  ];

  const isConfirm = positives.some(
    (w) => normalized === w || normalized.startsWith(w + ' '),
  );
  const isDecline = negatives.some(
    (w) => normalized === w || normalized.startsWith(w + ' '),
  );

  if (isConfirm) {
    const summary = `Serviço: ${state.slots.serviceLabel}, Data: ${state.slots.dateISO}, Hora: ${state.slots.time}`;
    return {
      nextState: {
        activeSkill: 'NONE',
        step: 'NONE',
        slots: {},
        confusionCount: 0,
        handoverSummary: summary,
        handoverAt: new Date().toISOString(),
      },
      replyText: `Anotado! Vou encaminhar para a recepção confirmar seu agendamento de *${state.slots.serviceLabel}* 😊 Pode me dizer seu nome completo, por favor?`,
      handover: true,
    };
  }

  if (isDecline) {
    return {
      nextState: {
        activeSkill: 'NONE',
        step: 'NONE',
        slots: {},
        confusionCount: 0,
      },
      replyText: 'Sem problemas! Quando quiser agendar, é só me avisar 😊',
    };
  }

  return {
    nextState: { ttlExpiresAt: bumpTTL() },
    replyText: `Posso confirmar *${state.slots.serviceLabel}* para *${state.slots.dateISO}* às *${state.slots.time}*? Responda *sim* ou *não* 😊`,
  };
}
