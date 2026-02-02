/**
 * =====================================================
 * SCHEDULING SKILL V2 — FSM transacional (P0.1)
 * Lógica pura: recebe state + text, retorna nextState + reply.
 * Sem dependência de DB (testável em isolamento).
 * =====================================================
 */
import { ConversationState } from './conversation-state';
import { ProfessionalInfo, ProfessionalServiceAssignment } from './professional-resolver';
export interface SkillResult {
    nextState: Partial<ConversationState>;
    replyText: string;
    handover?: boolean;
    /** Se true, a mensagem é uma pergunta de info (preço/produto/horário de funcionamento)
     *  que deve ser respondida pelo pipeline normal ANTES de enviar o replyText (resume prompt). */
    interruptionQuery?: boolean;
}
export interface SkillContext {
    services: Array<{
        id: string;
        name: string;
        price?: number;
    }>;
    professionals?: ProfessionalInfo[];
    professionalAssignments?: ProfessionalServiceAssignment[];
}
/** Inicia fluxo de agendamento */
export declare function startScheduling(): SkillResult;
/** Roteia turno para o step correto */
export declare function handleSchedulingTurn(state: ConversationState, text: string, context: SkillContext): SkillResult;
/** Detecta pergunta sobre profissional/cabeleireiro */
export declare function isStaffQuestion(text: string): boolean;
/** Detecta perguntas de info (preço/produto/horário) durante step ativo */
export declare function isInfoQuestion(text: string): boolean;
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
export declare function parseDatetime(text: string): ParsedDatetime | ParsedPeriod | 'INVALID_HOUR' | null;
/** Detecta período do dia em texto normalizado */
export declare function detectPeriod(normalized: string): DayPeriod | null;
/**
 * Resolve data base do texto usando America/Sao_Paulo.
 * "hoje" → hoje, "depois de amanhã" → +2, default → amanhã.
 */
export declare function resolveDate(normalized: string): Date;
/** Mapa de sugestões de horário por período */
export declare const PERIOD_SUGGESTIONS: Record<DayPeriod, string>;
/** Detecta perguntas de disponibilidade sem horário concreto */
export declare function isAvailabilityQuestion(text: string): boolean;
//# sourceMappingURL=scheduling-skill.d.ts.map