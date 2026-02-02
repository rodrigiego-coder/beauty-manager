"use strict";
/**
 * =====================================================
 * SCHEDULING SKILL V2 — FSM transacional (P0.1)
 * Lógica pura: recebe state + text, retorna nextState + reply.
 * Sem dependência de DB (testável em isolamento).
 * =====================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERIOD_SUGGESTIONS = void 0;
exports.startScheduling = startScheduling;
exports.handleSchedulingTurn = handleSchedulingTurn;
exports.isStaffQuestion = isStaffQuestion;
exports.isInfoQuestion = isInfoQuestion;
exports.parseDatetime = parseDatetime;
exports.detectPeriod = detectPeriod;
exports.resolveDate = resolveDate;
exports.isAvailabilityQuestion = isAvailabilityQuestion;
const conversation_state_1 = require("./conversation-state");
const schedule_continuation_1 = require("./schedule-continuation");
const lexicon_resolver_1 = require("./lexicon/lexicon-resolver");
const repair_templates_1 = require("./lexicon/repair-templates");
const professional_resolver_1 = require("./professional-resolver");
// ========== ENTRY POINTS ==========
/** Inicia fluxo de agendamento */
function startScheduling() {
    return {
        nextState: {
            activeSkill: 'SCHEDULING',
            step: 'AWAITING_SERVICE',
            slots: {},
            confusionCount: 0,
            ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
        },
        replyText: 'Perfeito 😊 Qual serviço você gostaria de agendar?',
    };
}
/** Roteia turno para o step correto */
function handleSchedulingTurn(state, text, context) {
    // Interruption handler: pergunta sobre profissional/cabeleireiro
    const staffInterrupt = handleStaffInterruption(state, text);
    if (staffInterrupt)
        return staffInterrupt;
    // Interruption handler: pergunta de info (preço/produto/horário de funcionamento)
    const infoInterrupt = handleInfoInterruption(state, text);
    if (infoInterrupt)
        return infoInterrupt;
    switch (state.step) {
        case 'AWAITING_SERVICE':
            return handleAwaitingService(state, text, context);
        case 'AWAITING_PROFESSIONAL':
            return handleAwaitingProfessional(state, text, context);
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
function isStaffQuestion(text) {
    const normalized = (0, schedule_continuation_1.normalizeText)(text);
    return /\b(quem\s+(e|vai|sera|eh)\s+(o|a)?\s*(cabeleireir|cabelereir|profissional|atendente|estilista))/.test(normalized)
        || /\b(quem\s+(vai\s+)?(me\s+)?atender)/.test(normalized)
        || /\b(qual\s+(profissional|cabeleireir|cabelereir))/.test(normalized)
        || /\b(quem\s+faz|quem\s+corta|quem\s+atende)/.test(normalized);
}
const STAFF_ANSWER = 'Hoje o atendimento é com a equipe do salão. Se você tem preferência por algum profissional específico, me diga o nome que eu tento encaixar 😊';
/** Se for pergunta sobre staff, responde e retoma step atual */
function handleStaffInterruption(state, text) {
    if (!isStaffQuestion(text))
        return null;
    const resumePrompt = getStepResumePrompt(state);
    return {
        nextState: { ttlExpiresAt: (0, conversation_state_1.bumpTTL)() },
        replyText: resumePrompt
            ? `${STAFF_ANSWER}\n\n${resumePrompt}`
            : STAFF_ANSWER,
    };
}
/** Gera prompt de retomada do step atual */
function getStepResumePrompt(state) {
    switch (state.step) {
        case 'AWAITING_SERVICE':
            return 'Qual serviço você gostaria de agendar?';
        case 'AWAITING_PROFESSIONAL':
            return `Tem preferência de profissional para o *${state.slots.serviceLabel}*?`;
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
function isInfoQuestion(text) {
    const normalized = (0, schedule_continuation_1.normalizeText)(text);
    // Preço
    if (/\b(quanto\s+(custa|e|fica|sai)|qual\s+(o\s+)?preco|preco\s+d|valor\s+d)/.test(normalized))
        return true;
    // Produto
    if (/\b(tem\s+(esse|algum|o)\s+produto|quero\s+comprar|vende(m)?\s)/.test(normalized))
        return true;
    // Horário de funcionamento
    if (/\b(horario\s+de\s+funcionamento|que\s+hora(s)?\s+(abre|fecha|funciona)|ate\s+que\s+hora)/.test(normalized))
        return true;
    return false;
}
/** Se for pergunta de info durante scheduling, sinaliza para pipeline responder + resume */
function handleInfoInterruption(state, text) {
    if (!isInfoQuestion(text))
        return null;
    const resumePrompt = getStepResumePrompt(state);
    return {
        nextState: { ttlExpiresAt: (0, conversation_state_1.bumpTTL)() },
        replyText: resumePrompt
            ? `Voltando ao seu agendamento: ${resumePrompt}`
            : '',
        interruptionQuery: true,
    };
}
// ========== STEP HANDLERS ==========
/**
 * Transiciona serviço encontrado → próximo step (PROFESSIONAL se possível, senão DATETIME).
 */
function transitionAfterService(serviceId, serviceLabel, context, prefix) {
    // Tenta resolver profissionais aptos
    const pros = context.professionals || [];
    const assignments = context.professionalAssignments || [];
    const apt = (0, professional_resolver_1.resolveAptProfessionals)(serviceId, pros, assignments);
    // Se há mais de 1 profissional apto → pergunta
    if (apt.length > 1) {
        const list = (0, professional_resolver_1.formatProfessionalList)(apt);
        return {
            nextState: {
                step: 'AWAITING_PROFESSIONAL',
                slots: { serviceId, serviceLabel },
                confusionCount: 0,
                ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
            },
            replyText: `${prefix}\n\nTem preferência de profissional?\n\n${list}\n\nDigite o nome ou número, ou "qualquer" 😊`,
        };
    }
    // Se exatamente 1 → auto-seleciona
    if (apt.length === 1) {
        return {
            nextState: {
                step: 'AWAITING_DATETIME',
                slots: {
                    serviceId,
                    serviceLabel,
                    professionalId: apt[0].id,
                    professionalLabel: apt[0].name,
                },
                confusionCount: 0,
                ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
            },
            replyText: `${prefix} Com *${apt[0].name}* 😊 Para qual dia e horário você prefere?`,
        };
    }
    // Nenhum ou sem dados → DATETIME direto
    return {
        nextState: {
            step: 'AWAITING_DATETIME',
            slots: { serviceId, serviceLabel },
            confusionCount: 0,
            ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
        },
        replyText: `${prefix} Para qual dia e horário você prefere?`,
    };
}
function handleAwaitingService(state, text, context) {
    // 1. Fuzzy match direto no catálogo do salão
    const matched = (0, schedule_continuation_1.fuzzyMatchService)(text, context.services);
    if (matched) {
        const result = transitionAfterService(matched.id, matched.name, context, `Ótima escolha! *${matched.name}* 😊`);
        // Se transicionou para AWAITING_DATETIME, tenta extrair data+hora da mesma mensagem
        if (result.nextState.step === 'AWAITING_DATETIME') {
            const parsed = parseDatetime(text);
            if (parsed && parsed !== 'INVALID_HOUR' && 'time' in parsed) {
                return {
                    nextState: {
                        ...result.nextState,
                        step: 'AWAITING_CONFIRM',
                        slots: { ...result.nextState.slots, dateISO: parsed.dateISO, time: parsed.time },
                    },
                    replyText: `Perfeito! Posso confirmar *${matched.name}* para *${parsed.display}*? (sim/não)`,
                };
            }
        }
        return result;
    }
    // 2. Lexicon fallback: resolve dialeto → serviço canônico → fuzzy match
    const lexMatch = (0, lexicon_resolver_1.matchLexicon)(text);
    if (lexMatch && lexMatch.entry.suggestedServiceKey) {
        // Tenta encontrar o serviço canônico no catálogo
        const canonicalMatch = (0, schedule_continuation_1.fuzzyMatchService)(lexMatch.entry.canonical, context.services);
        if (canonicalMatch) {
            // Ambíguo → pergunta de confirmação sem preencher slot
            if (lexMatch.needsConfirmation) {
                const repair = (0, repair_templates_1.applyRepairTemplate)({
                    entry: lexMatch.entry,
                    matchedTrigger: lexMatch.matchedTrigger,
                    serviceName: canonicalMatch.name,
                });
                return {
                    nextState: { ttlExpiresAt: (0, conversation_state_1.bumpTTL)() },
                    replyText: (0, repair_templates_1.composeRepairResponse)(repair),
                };
            }
            // Match confiante → preenche slot com o serviço do catálogo
            return transitionAfterService(canonicalMatch.id, canonicalMatch.name, context, `Aqui no salão, *${lexMatch.matchedTrigger}* é o nosso *${canonicalMatch.name}* 😊`);
        }
        // Lexicon match mas serviço não existe no catálogo → responde com repair genérico
        if (lexMatch.needsConfirmation) {
            const repair = (0, repair_templates_1.applyRepairTemplate)({
                entry: lexMatch.entry,
                matchedTrigger: lexMatch.matchedTrigger,
            });
            return {
                nextState: { ttlExpiresAt: (0, conversation_state_1.bumpTTL)() },
                replyText: (0, repair_templates_1.composeRepairResponse)(repair),
            };
        }
        // Serviço não no catálogo mas reconhecido → indica ao cliente
        const repair = (0, repair_templates_1.applyRepairTemplate)({
            entry: lexMatch.entry,
            matchedTrigger: lexMatch.matchedTrigger,
        });
        return {
            nextState: { ttlExpiresAt: (0, conversation_state_1.bumpTTL)() },
            replyText: `${(0, repair_templates_1.composeRepairResponse)(repair)}\n\nVou verificar a disponibilidade com a equipe.`,
        };
    }
    const newConfusion = (state.confusionCount || 0) + 1;
    if (newConfusion >= conversation_state_1.MAX_CONFUSION) {
        return {
            nextState: {
                activeSkill: 'NONE',
                step: 'NONE',
                slots: {},
                confusionCount: 0,
                handoverSummary: `Cliente tentou agendar mas não informou serviço válido após ${conversation_state_1.MAX_CONFUSION} tentativas.`,
                handoverAt: new Date().toISOString(),
            },
            replyText: 'Vou chamar alguém da equipe para te ajudar com o agendamento, tudo bem? 😊',
            handover: true,
        };
    }
    return {
        nextState: {
            confusionCount: newConfusion,
            ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
        },
        replyText: 'Não encontrei esse serviço. Pode repetir o nome? Por exemplo: corte, mechas, alisamento… 😊',
    };
}
// ========== AWAITING PROFESSIONAL ==========
function handleAwaitingProfessional(state, text, context) {
    const normalized = (0, schedule_continuation_1.normalizeText)(text);
    // "qualquer", "tanto faz", "sem preferência" → skip professional
    if (/\b(qualquer|tanto\s+faz|sem\s+prefer|nao\s+tenho|nenhum|qualquer\s+um)\b/.test(normalized)) {
        return {
            nextState: {
                step: 'AWAITING_DATETIME',
                slots: {
                    serviceId: state.slots.serviceId,
                    serviceLabel: state.slots.serviceLabel,
                },
                ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
            },
            replyText: `Sem problema! Para qual dia e horário você prefere o *${state.slots.serviceLabel}*? 😊`,
        };
    }
    // Tenta match do profissional
    const pros = context.professionals || [];
    const assignments = context.professionalAssignments || [];
    const apt = (0, professional_resolver_1.resolveAptProfessionals)(state.slots.serviceId || '', pros, assignments);
    const match = (0, professional_resolver_1.fuzzyMatchProfessional)(text, apt);
    if (match) {
        return {
            nextState: {
                step: 'AWAITING_DATETIME',
                slots: {
                    ...state.slots,
                    professionalId: match.id,
                    professionalLabel: match.name,
                },
                ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
            },
            replyText: `Perfeito, com *${match.name}*! 😊 Para qual dia e horário você prefere?`,
        };
    }
    // Não encontrou → pede novamente
    const newConfusion = (state.confusionCount || 0) + 1;
    if (newConfusion >= conversation_state_1.MAX_CONFUSION) {
        return {
            nextState: {
                step: 'AWAITING_DATETIME',
                slots: {
                    serviceId: state.slots.serviceId,
                    serviceLabel: state.slots.serviceLabel,
                },
                ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
            },
            replyText: `Vou agendar com quem estiver disponível 😊 Para qual dia e horário você prefere o *${state.slots.serviceLabel}*?`,
        };
    }
    const list = (0, professional_resolver_1.formatProfessionalList)(apt);
    return {
        nextState: {
            confusionCount: newConfusion,
            ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
        },
        replyText: list
            ? `Não encontrei esse profissional. As opções são:\n\n${list}\n\nDigite o nome/número ou "qualquer" 😊`
            : 'Não encontrei esse profissional. Pode repetir? Ou digite "qualquer" para quem estiver disponível 😊',
    };
}
/**
 * Parse de data/hora a partir de mensagem do cliente.
 * Reconhece: "10h", "10:30", "14h30", "amanhã 10h", "hoje 15h"
 * Reconhece períodos: "de manhã", "à tarde", "noite", "amanhã de manhã"
 * Retorna ParsedDatetime se hora exata, ParsedPeriod se período sem hora,
 * 'INVALID_HOUR' se hora > 23, null se nada encontrado.
 */
function parseDatetime(text) {
    const normalized = (0, schedule_continuation_1.normalizeText)(text);
    // Extrai horário: "10h", "10:30", "14h30", "10 horas", "as 10", "às 10"
    // Nota: normalizeText já remove acentos, então "às" → "as"
    const timeMatch = normalized.match(/(\d{1,2})(?::(\d{2})|h(\d{2})?|\s*horas?)/) || normalized.match(/\bas\s+(\d{1,2})(?::(\d{2}))?(?:\s|$)/);
    // Detecta período do dia
    const periodMatch = detectPeriod(normalized);
    // Nenhuma informação útil
    if (!timeMatch && !periodMatch)
        return null;
    // Resolve data base: "hoje" = hoje, default = amanhã
    const date = resolveDate(normalized);
    const dateISO = formatDateISO(date);
    // Se temos hora exata, retorna ParsedDatetime
    if (timeMatch) {
        const hour = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2] || timeMatch[3] || '0', 10);
        if (hour > 23)
            return 'INVALID_HOUR';
        if (minutes > 59)
            return null;
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        const display = `${date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        })} às ${timeStr}`;
        return { dateISO, time: timeStr, display };
    }
    // Só período (sem hora exata) → ParsedPeriod
    return { dateISO, period: periodMatch };
}
/** Detecta período do dia em texto normalizado */
function detectPeriod(normalized) {
    if (/\b(de\s+)?manha\b/.test(normalized))
        return 'MANHA';
    if (/\b(a\s+|de\s+)?tarde\b/.test(normalized))
        return 'TARDE';
    if (/\b(a\s+|de\s+)?noite\b/.test(normalized))
        return 'NOITE';
    return null;
}
/**
 * Resolve data base do texto usando America/Sao_Paulo.
 * "hoje" → hoje, "depois de amanhã" → +2, default → amanhã.
 */
function resolveDate(normalized) {
    // Obtem data atual em São Paulo via Intl (sem dependência externa)
    const now = new Date();
    const spFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const spParts = spFormatter.formatToParts(now);
    const y = parseInt(spParts.find((p) => p.type === 'year').value, 10);
    const m = parseInt(spParts.find((p) => p.type === 'month').value, 10) - 1;
    const d = parseInt(spParts.find((p) => p.type === 'day').value, 10);
    let offset = 1; // default: amanhã
    if (normalized.includes('hoje'))
        offset = 0;
    else if (/depois\s+de\s+amanha/.test(normalized))
        offset = 2;
    return new Date(y, m, d + offset);
}
/** Formata Date para YYYY-MM-DD */
function formatDateISO(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
/** Mapa de sugestões de horário por período */
exports.PERIOD_SUGGESTIONS = {
    MANHA: '09h, 10h ou 11h',
    TARDE: '14h, 15h ou 16h',
    NOITE: '18h, 19h ou 20h',
};
/** Detecta perguntas de disponibilidade sem horário concreto */
function isAvailabilityQuestion(text) {
    const normalized = (0, schedule_continuation_1.normalizeText)(text);
    return /\b(qual|que|quais)\s+(horario|hora|vaga|disponib)/.test(normalized)
        || /\b(tem\s+(horario|hora|vaga|disponib))/.test(normalized)
        || /\b(horario(s)?\s+(livre|disponiv|aberto))/.test(normalized);
}
function handleAwaitingDatetime(state, text) {
    // Detecta pergunta de disponibilidade ("qual horário tem livre?")
    if (isAvailabilityQuestion(text)) {
        return {
            nextState: { ttlExpiresAt: (0, conversation_state_1.bumpTTL)() },
            replyText: `Para *${state.slots.serviceLabel}*, posso tentar encaixar de manhã (${exports.PERIOD_SUGGESTIONS.MANHA}), tarde (${exports.PERIOD_SUGGESTIONS.TARDE}) ou noite (${exports.PERIOD_SUGGESTIONS.NOITE}). Qual prefere? 😊`,
        };
    }
    const parsed = parseDatetime(text);
    if (parsed === null) {
        return {
            nextState: { ttlExpiresAt: (0, conversation_state_1.bumpTTL)() },
            replyText: 'Você prefere amanhã ou outro dia? E qual horário — manhã ou tarde? 😊',
        };
    }
    if (parsed === 'INVALID_HOUR') {
        return {
            nextState: { ttlExpiresAt: (0, conversation_state_1.bumpTTL)() },
            replyText: 'Meu relógio vai até 24h 😊 Você quis dizer 07h ou prefere um horário à tarde, tipo 15h?',
        };
    }
    // ParsedPeriod → sugere horários concretos dentro do período
    if ('period' in parsed) {
        const suggestions = exports.PERIOD_SUGGESTIONS[parsed.period];
        const periodLabel = parsed.period === 'MANHA' ? 'manhã' : parsed.period === 'TARDE' ? 'tarde' : 'noite';
        return {
            nextState: { ttlExpiresAt: (0, conversation_state_1.bumpTTL)() },
            replyText: `Legal! Para *${state.slots.serviceLabel}*, no período da ${periodLabel} posso tentar: *${suggestions}*. Qual horário prefere pra eu checar na agenda? 😊`,
        };
    }
    // ParsedDatetime → hora exata, vai para confirmação
    return {
        nextState: {
            step: 'AWAITING_CONFIRM',
            slots: { ...state.slots, dateISO: parsed.dateISO, time: parsed.time },
            ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
        },
        replyText: `Perfeito! Posso confirmar *${state.slots.serviceLabel}* para *${parsed.display}*? (sim/não)`,
    };
}
function handleAwaitingConfirm(state, text) {
    const normalized = (0, schedule_continuation_1.normalizeText)(text);
    const positives = [
        'sim', 's', 'confirmo', 'confirma', 'pode', 'ok',
        'beleza', 'certo', 'combinado', 'isso',
    ];
    const negatives = [
        'nao', 'n', 'cancelar', 'cancela', 'nao quero', 'desisto',
    ];
    const isConfirm = positives.some((w) => normalized === w || normalized.startsWith(w + ' '));
    const isDecline = negatives.some((w) => normalized === w || normalized.startsWith(w + ' '));
    if (isConfirm) {
        const proLabel = state.slots.professionalLabel ? `, Profissional: ${state.slots.professionalLabel}` : '';
        const summary = `Serviço: ${state.slots.serviceLabel}${proLabel}, Data: ${state.slots.dateISO}, Hora: ${state.slots.time}`;
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
        if (newDeclineCount >= conversation_state_1.MAX_DECLINES) {
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
                replyText: 'Vou chamar a equipe para encontrar o melhor horário pra você, tudo bem? 😊',
                handover: true,
            };
        }
        // Detecta período da hora recusada para sugerir alternativas no mesmo período
        const declinedHour = parseInt(state.slots.time || '0', 10);
        const declinedPeriod = declinedHour < 12 ? 'manhã' : declinedHour < 18 ? 'tarde' : 'noite';
        const periodKey = declinedPeriod === 'manhã' ? 'MANHA' : declinedPeriod === 'tarde' ? 'TARDE' : 'NOITE';
        const alts = exports.PERIOD_SUGGESTIONS[periodKey];
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
                ttlExpiresAt: (0, conversation_state_1.bumpTTL)(),
            },
            replyText: `Entendi! Para *${state.slots.serviceLabel}*, posso tentar outros horários no período da ${declinedPeriod}: *${alts}*. Ou prefere outro período/dia? 😊`,
        };
    }
    return {
        nextState: { ttlExpiresAt: (0, conversation_state_1.bumpTTL)() },
        replyText: `Desculpa, não entendi 🙏 Você pode responder *sim* para confirmar ou *não* para eu sugerir outro horário? 😊`,
    };
}
//# sourceMappingURL=scheduling-skill.js.map