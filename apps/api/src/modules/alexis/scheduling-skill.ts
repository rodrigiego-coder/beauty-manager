/**
 * =====================================================
 * SCHEDULING SKILL V2 — FSM transacional (P0.1)
 * Lógica pura: recebe state + text, retorna nextState + reply.
 * Sem dependência de DB (testável em isolamento).
 * =====================================================
 */

import { ConversationState, bumpTTL, MAX_CONFUSION, MAX_DECLINES } from './conversation-state';
import { fuzzyMatchService, normalizeText } from './schedule-continuation';

export interface SkillResult {
  nextState: Partial<ConversationState>;
  replyText: string;
  handover?: boolean;
  /** Se true, a mensagem é uma pergunta de info (preço/produto/horário de funcionamento)
   *  que deve ser respondida pelo pipeline normal ANTES de enviar o replyText (resume prompt). */
  interruptionQuery?: boolean;
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
  // Interruption handler: pergunta sobre profissional/cabeleireiro
  const staffInterrupt = handleStaffInterruption(state, text);
  if (staffInterrupt) return staffInterrupt;

  // Interruption handler: pergunta de info (preço/produto/horário de funcionamento)
  const infoInterrupt = handleInfoInterruption(state, text);
  if (infoInterrupt) return infoInterrupt;

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

// ========== INTERRUPTION HANDLERS ==========

/** Detecta pergunta sobre profissional/cabeleireiro */
export function isStaffQuestion(text: string): boolean {
  const normalized = normalizeText(text);
  return /\b(quem\s+(e|vai|sera|eh)\s+(o|a)?\s*(cabeleireir|cabelereir|profissional|atendente|estilista))/.test(normalized)
    || /\b(quem\s+(vai\s+)?(me\s+)?atender)/.test(normalized)
    || /\b(qual\s+(profissional|cabeleireir|cabelereir))/.test(normalized)
    || /\b(quem\s+faz|quem\s+corta|quem\s+atende)/.test(normalized);
}

const STAFF_ANSWER =
  'Hoje o atendimento é com a equipe do salão. Se você tem preferência por algum profissional específico, me diga o nome que eu tento encaixar 😊';

/** Se for pergunta sobre staff, responde e retoma step atual */
function handleStaffInterruption(
  state: ConversationState,
  text: string,
): SkillResult | null {
  if (!isStaffQuestion(text)) return null;

  const resumePrompt = getStepResumePrompt(state);
  return {
    nextState: { ttlExpiresAt: bumpTTL() },
    replyText: resumePrompt
      ? `${STAFF_ANSWER}\n\n${resumePrompt}`
      : STAFF_ANSWER,
  };
}

/** Gera prompt de retomada do step atual */
function getStepResumePrompt(state: ConversationState): string | null {
  switch (state.step) {
    case 'AWAITING_SERVICE':
      return 'Qual serviço você gostaria de agendar?';
    case 'AWAITING_DATETIME':
      return `Para qual dia e horário você prefere o *${state.slots.serviceLabel}*?`;
    case 'AWAITING_CONFIRM':
      return `Posso confirmar *${state.slots.serviceLabel}* para *${state.slots.dateISO}* às *${state.slots.time}*? (sim/não)`;
    default:
      return null;
  }
}

// ========== INFO INTERRUPTION ==========

/** Detecta perguntas de info (preço/produto/horário) durante step ativo */
export function isInfoQuestion(text: string): boolean {
  const normalized = normalizeText(text);
  // Preço
  if (/\b(quanto\s+(custa|e|fica|sai)|qual\s+(o\s+)?preco|preco\s+d|valor\s+d)/.test(normalized)) return true;
  // Produto
  if (/\b(tem\s+(esse|algum|o)\s+produto|quero\s+comprar|vende(m)?\s)/.test(normalized)) return true;
  // Horário de funcionamento
  if (/\b(horario\s+de\s+funcionamento|que\s+hora(s)?\s+(abre|fecha|funciona)|ate\s+que\s+hora)/.test(normalized)) return true;
  return false;
}

/** Se for pergunta de info durante scheduling, sinaliza para pipeline responder + resume */
function handleInfoInterruption(
  state: ConversationState,
  text: string,
): SkillResult | null {
  if (!isInfoQuestion(text)) return null;

  const resumePrompt = getStepResumePrompt(state);
  return {
    nextState: { ttlExpiresAt: bumpTTL() },
    replyText: resumePrompt
      ? `Voltando ao seu agendamento: ${resumePrompt}`
      : '',
    interruptionQuery: true,
  };
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

export type DayPeriod = 'MANHA' | 'TARDE' | 'NOITE';

export interface ParsedDatetime {
  dateISO: string;
  time: string;
  display: string;
}

export interface ParsedPeriod {
  dateISO: string;
  period: DayPeriod;
}

/**
 * Parse de data/hora a partir de mensagem do cliente.
 * Reconhece: "10h", "10:30", "14h30", "amanhã 10h", "hoje 15h"
 * Reconhece períodos: "de manhã", "à tarde", "noite", "amanhã de manhã"
 * Retorna ParsedDatetime se hora exata, ParsedPeriod se período sem hora,
 * 'INVALID_HOUR' se hora > 23, null se nada encontrado.
 */
export function parseDatetime(
  text: string,
): ParsedDatetime | ParsedPeriod | 'INVALID_HOUR' | null {
  const normalized = normalizeText(text);

  // Extrai horário: "10h", "10:30", "14h30", "10 horas"
  const timeMatch = normalized.match(
    /(\d{1,2})(?::(\d{2})|h(\d{2})?|\s*horas?)/,
  );

  // Detecta período do dia
  const periodMatch = detectPeriod(normalized);

  // Nenhuma informação útil
  if (!timeMatch && !periodMatch) return null;

  // Resolve data base: "hoje" = hoje, default = amanhã
  const date = resolveDate(normalized);
  const dateISO = formatDateISO(date);

  // Se temos hora exata, retorna ParsedDatetime
  if (timeMatch) {
    const hour = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2] || timeMatch[3] || '0', 10);

    if (hour > 23) return 'INVALID_HOUR';
    if (minutes > 59) return null;

    const timeStr = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    const display = `${date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })} às ${timeStr}`;

    return { dateISO, time: timeStr, display };
  }

  // Só período (sem hora exata) → ParsedPeriod
  return { dateISO, period: periodMatch! };
}

/** Detecta período do dia em texto normalizado */
export function detectPeriod(normalized: string): DayPeriod | null {
  if (/\b(de\s+)?manha\b/.test(normalized)) return 'MANHA';
  if (/\b(a\s+|de\s+)?tarde\b/.test(normalized)) return 'TARDE';
  if (/\b(a\s+|de\s+)?noite\b/.test(normalized)) return 'NOITE';
  return null;
}

/** Resolve data base do texto: "hoje" → hoje, default → amanhã */
function resolveDate(normalized: string): Date {
  const today = new Date();
  if (normalized.includes('hoje')) {
    return new Date(today);
  }
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

/** Formata Date para YYYY-MM-DD */
function formatDateISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Mapa de sugestões de horário por período */
export const PERIOD_SUGGESTIONS: Record<DayPeriod, string> = {
  MANHA: '09h, 10h ou 11h',
  TARDE: '14h, 15h ou 16h',
  NOITE: '18h, 19h ou 20h',
};

/** Detecta perguntas de disponibilidade sem horário concreto */
export function isAvailabilityQuestion(text: string): boolean {
  const normalized = normalizeText(text);
  return /\b(qual|que|quais)\s+(horario|hora|vaga|disponib)/.test(normalized)
    || /\b(tem\s+(horario|hora|vaga|disponib))/.test(normalized)
    || /\b(horario(s)?\s+(livre|disponiv|aberto))/.test(normalized);
}

function handleAwaitingDatetime(
  state: ConversationState,
  text: string,
): SkillResult {
  // Detecta pergunta de disponibilidade ("qual horário tem livre?")
  if (isAvailabilityQuestion(text)) {
    return {
      nextState: { ttlExpiresAt: bumpTTL() },
      replyText:
        `Para *${state.slots.serviceLabel}*, posso tentar encaixar de manhã (${PERIOD_SUGGESTIONS.MANHA}), tarde (${PERIOD_SUGGESTIONS.TARDE}) ou noite (${PERIOD_SUGGESTIONS.NOITE}). Qual prefere? 😊`,
    };
  }

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

  // ParsedPeriod → sugere horários concretos dentro do período
  if ('period' in parsed) {
    const suggestions = PERIOD_SUGGESTIONS[parsed.period];
    const periodLabel = parsed.period === 'MANHA' ? 'manhã' : parsed.period === 'TARDE' ? 'tarde' : 'noite';
    return {
      nextState: { ttlExpiresAt: bumpTTL() },
      replyText:
        `Legal! Para *${state.slots.serviceLabel}*, no período da ${periodLabel} posso tentar: *${suggestions}*. Qual horário prefere pra eu checar na agenda? 😊`,
    };
  }

  // ParsedDatetime → hora exata, vai para confirmação
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
    const newDeclineCount = (state.declineCount || 0) + 1;

    // 3 recusas => handover humano
    if (newDeclineCount >= MAX_DECLINES) {
      const periodHint = state.slots.lastDeclinedPeriod
        ? `Prefere período: ${state.slots.lastDeclinedPeriod}.`
        : '';
      return {
        nextState: {
          activeSkill: 'NONE',
          step: 'NONE',
          slots: {},
          confusionCount: 0,
          declineCount: 0,
          handoverSummary: `Cliente recusou horário ${newDeclineCount}x para ${state.slots.serviceLabel}. ${periodHint}`.trim(),
          handoverAt: new Date().toISOString(),
        },
        replyText:
          'Vou chamar a equipe para encontrar o melhor horário pra você, tudo bem? 😊',
        handover: true,
      };
    }

    // Detecta período da hora recusada para sugerir alternativas no mesmo período
    const declinedHour = parseInt(state.slots.time || '0', 10);
    const declinedPeriod: string =
      declinedHour < 12 ? 'manhã' : declinedHour < 18 ? 'tarde' : 'noite';
    const periodKey = declinedPeriod === 'manhã' ? 'MANHA' : declinedPeriod === 'tarde' ? 'TARDE' : 'NOITE';
    const alts = PERIOD_SUGGESTIONS[periodKey as keyof typeof PERIOD_SUGGESTIONS];

    // Retomada: volta para AWAITING_DATETIME mantendo service slots
    return {
      nextState: {
        step: 'AWAITING_DATETIME',
        slots: {
          serviceId: state.slots.serviceId,
          serviceLabel: state.slots.serviceLabel,
          lastDeclinedPeriod: declinedPeriod,
        },
        declineCount: newDeclineCount,
        ttlExpiresAt: bumpTTL(),
      },
      replyText:
        `Entendi! Para *${state.slots.serviceLabel}*, posso tentar outros horários no período da ${declinedPeriod}: *${alts}*. Ou prefere outro período/dia? 😊`,
    };
  }

  return {
    nextState: { ttlExpiresAt: bumpTTL() },
    replyText: `Posso confirmar *${state.slots.serviceLabel}* para *${state.slots.dateISO}* às *${state.slots.time}*? Responda *sim* ou *não* 😊`,
  };
}
