/**
 * =====================================================
 * PROFESSIONAL RESOLVER (P0.3)
 * Resolve profissionais aptos a realizar um serviço.
 * Puro e testável (recebe dados, não faz DB).
 * =====================================================
 */
export interface ProfessionalInfo {
    id: string;
    name: string;
    active: boolean;
}
export interface ProfessionalServiceAssignment {
    professionalId: string;
    serviceId: number;
    enabled: boolean;
}
/**
 * Resolve profissionais aptos ao serviço.
 *
 * REGRA DE COMPATIBILIDADE:
 * - Se NÃO existem registros na matriz para o salonId → modo "legacy":
 *   retorna TODOS os profissionais ativos (não bloqueia).
 * - Se existem registros → filtra apenas os habilitados para o serviceId.
 */
export declare function resolveAptProfessionals(serviceId: number | string, professionals: ProfessionalInfo[], assignments: ProfessionalServiceAssignment[]): ProfessionalInfo[];
/**
 * Formata lista de profissionais para exibição no WhatsApp.
 */
export declare function formatProfessionalList(professionals: ProfessionalInfo[]): string;
/**
 * Tenta match de profissional pelo nome (fuzzy, case-insensitive).
 */
export declare function fuzzyMatchProfessional(text: string, professionals: ProfessionalInfo[]): ProfessionalInfo | null;
//# sourceMappingURL=professional-resolver.d.ts.map