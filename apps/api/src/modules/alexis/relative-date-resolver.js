"use strict";
/**
 * =====================================================
 * RELATIVE DATE RESOLVER (P0.5)
 * Detecta perguntas de data relativa em pt-BR e responde
 * de forma determinística (sem IA) usando America/Sao_Paulo.
 * =====================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRelativeDate = resolveRelativeDate;
const WEEKDAYS_PT = {
    Sunday: 'domingo',
    Monday: 'segunda-feira',
    Tuesday: 'terça-feira',
    Wednesday: 'quarta-feira',
    Thursday: 'quinta-feira',
    Friday: 'sexta-feira',
    Saturday: 'sábado',
};
/**
 * Regex patterns para detectar perguntas de data relativa.
 * Captura: "amanhã que dia é?", "que dia é amanhã?", "hoje que dia é?",
 *          "depois de amanhã que dia é?", "que data é hoje?", etc.
 */
const RELATIVE_DATE_PATTERNS = [
    { pattern: /(?:^|\s)depois\s+de\s+amanh[aã](?:\s|[?!.,]|$)/, offsetDays: 2, label: 'Depois de amanhã' },
    { pattern: /(?:^|\s)amanh[aã](?:\s|[?!.,]|$)/, offsetDays: 1, label: 'Amanhã' },
    { pattern: /\bhoje\b/, offsetDays: 0, label: 'Hoje' },
];
const DATE_QUESTION_PATTERN = /(?:^|\s)(que\s+di[aá]|qual\s+(?:a\s+)?dat[aá]|que\s+dat[aá])(?:\s|[?!.,]|$)/;
/**
 * Verifica se a mensagem é uma pergunta de data relativa e retorna resposta formatada.
 * Usa Intl.DateTimeFormat com timezone America/Sao_Paulo (sem dependência externa).
 */
function resolveRelativeDate(message) {
    const lower = message.toLowerCase().trim();
    // Deve parecer uma pergunta de data
    if (!DATE_QUESTION_PATTERN.test(lower)) {
        return { matched: false };
    }
    for (const { pattern, offsetDays, label } of RELATIVE_DATE_PATTERNS) {
        if (pattern.test(lower)) {
            const response = formatRelativeDate(offsetDays, label);
            return { matched: true, response };
        }
    }
    return { matched: false };
}
/**
 * Formata a data relativa usando America/Sao_Paulo.
 * Ex: "Amanhã é quinta-feira, 29/01."
 */
function formatRelativeDate(offsetDays, label) {
    // Calcula data no fuso de São Paulo
    const now = new Date();
    const spFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    // Obtem data atual em SP
    const spParts = spFormatter.formatToParts(now);
    const spYear = parseInt(spParts.find((p) => p.type === 'year').value, 10);
    const spMonth = parseInt(spParts.find((p) => p.type === 'month').value, 10) - 1;
    const spDay = parseInt(spParts.find((p) => p.type === 'day').value, 10);
    // Cria data local em SP e aplica offset
    const target = new Date(spYear, spMonth, spDay + offsetDays);
    const weekdayEn = target.toLocaleDateString('en-US', { weekday: 'long' });
    const weekdayPt = WEEKDAYS_PT[weekdayEn] || weekdayEn;
    const dd = target.getDate().toString().padStart(2, '0');
    const mm = (target.getMonth() + 1).toString().padStart(2, '0');
    return `${label} é ${weekdayPt}, ${dd}/${mm}. 😊`;
}
//# sourceMappingURL=relative-date-resolver.js.map