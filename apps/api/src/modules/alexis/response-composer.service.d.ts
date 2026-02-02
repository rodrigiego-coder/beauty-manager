/**
 * =====================================================
 * RESPONSE COMPOSER SERVICE (DELTA)
 * Humaniza respostas da Alexis com tom acolhedor
 * Sem emojis por padrao, profissional e direto
 * =====================================================
 */
export interface ComposeInput {
    salonId: string;
    phone: string;
    clientName?: string;
    intent: string;
    baseText: string;
    /** Se true, pula saudação/apresentação (conversa em andamento) */
    skipGreeting?: boolean;
}
export interface ContactInfo {
    id: string;
    name: string | null;
    lastGreetedAt: Date | null;
    lastSeenAt: Date;
}
/**
 * Retorna saudacao contextual baseada no horario
 * Usa horario do servidor (ok para MVP)
 */
export declare function getGreeting(): string;
/**
 * Verifica se deve repetir saudacao/apresentacao
 * Janela padrao: 12 horas
 */
export declare function shouldGreet(lastGreetedAt: Date | null, windowHours?: number): boolean;
/**
 * Verifica se e uma intencao que merece CTA de produto
 */
export declare function isProductIntent(intent: string): boolean;
/**
 * Gera CTA suave para intencoes de produto
 */
export declare function getProductCta(): string;
/**
 * Gera pergunta de nome educada
 */
export declare function getNameQuestion(): string;
/**
 * Gera apresentacao curta da Alexis
 */
export declare function getIntroduction(salonName: string): string;
/**
 * Compoe a resposta final com tom humanizado
 */
export declare function composeResponse(params: {
    greeting: string;
    introduction: string | null;
    clientName: string | null;
    baseText: string;
    cta: string | null;
    askName: boolean;
}): string;
export declare class ResponseComposerService {
    private readonly logger;
    /**
     * Compoe resposta humanizada
     * - Saudacao contextual
     * - Apresentacao no primeiro contato
     * - Pergunta nome se necessario
     * - CTA suave para produtos
     */
    compose(input: ComposeInput): Promise<string>;
    /**
     * Upsert contato (salon_id + phone)
     */
    private upsertContact;
    /**
     * Atualiza lastGreetedAt
     */
    private updateGreetedAt;
    /**
     * Atualiza nome do contato
     */
    private updateContactName;
    /**
     * Busca nome do salao
     */
    private getSalonName;
}
//# sourceMappingURL=response-composer.service.d.ts.map