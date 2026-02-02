/**
 * =====================================================
 * TERMOS PROIBIDOS - ANVISA + LGPD + JURÍDICO
 * =====================================================
 * Alexis é uma ASSISTENTE ADMINISTRATIVA E COMERCIAL
 * NÃO é médica, dermatologista ou química
 * =====================================================
 */
export declare const FORBIDDEN_REGEX: {
    anvisa: RegExp;
    medical: RegExp;
    promises: RegExp;
    absolute: RegExp;
    transformation: RegExp;
    offensive: RegExp;
    bypass: RegExp;
};
export declare const SAFE_REPLACEMENTS: Record<string, string>;
export declare const BLOCKED_RESPONSE = "Para esse tipo de avalia\u00E7\u00E3o, o ideal \u00E9 conversar diretamente com um profissional durante o atendimento presencial.\n\nPosso te ajudar a agendar um hor\u00E1rio ou explicar nossos servi\u00E7os! \uD83D\uDE0A";
export declare const COMMANDS: {
    HUMAN_TAKEOVER: string;
    AI_RESUME: string;
};
export declare const COMMAND_RESPONSES: {
    HUMAN_TAKEOVER: string;
    AI_RESUME: string;
};
export declare const ALEXIS_SYSTEM_PROMPT: (salonName: string) => string;
export declare const INTENT_KEYWORDS: {
    GREETING: string[];
    SCHEDULE: string[];
    RESCHEDULE: string[];
    CANCEL: string[];
    PRODUCT_INFO: string[];
    SERVICE_INFO: string[];
    PRICE_INFO: string[];
    HOURS_INFO: string[];
};
//# sourceMappingURL=forbidden-terms.d.ts.map