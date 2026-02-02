/**
 * DTO para criar uma sessão de suporte delegado
 */
export declare class CreateSupportSessionDto {
    salonId: string;
    reason: string;
}
/**
 * DTO para consumir um token de suporte
 */
export declare class ConsumeSupportTokenDto {
    token: string;
}
/**
 * Interface para o payload JWT de suporte delegado
 */
export interface SupportTokenPayload {
    sub: string;
    id: string;
    email: string;
    role: 'SUPER_ADMIN';
    salonId: string | null;
    actingAsSalonId: string;
    supportSessionId: string;
    type: 'access';
}
/**
 * Interface para resposta de criação de sessão
 */
export interface CreateSessionResponse {
    sessionId: string;
    token: string;
    expiresAt: Date;
    salonName: string;
    salonId: string;
}
/**
 * Interface para resposta de consumo de token
 */
export interface ConsumeTokenResponse {
    accessToken: string;
    expiresIn: number;
    salonId: string;
    salonName: string;
}
//# sourceMappingURL=dto.d.ts.map