import { SupportService } from './support.service';
import { CreateSupportSessionDto, ConsumeSupportTokenDto } from './dto';
/**
 * Controller para Suporte Delegado
 * Permite que SUPER_ADMIN acesse temporariamente um salão específico
 */
export declare class SupportController {
    private readonly supportService;
    constructor(supportService: SupportService);
    /**
     * POST /support/impersonate
     * Gera um token de suporte para acessar um salão específico
     *
     * @param body - { salonId: string, reason: string }
     * @returns { sessionId, token, expiresAt, salonName }
     */
    createSupportSession(body: CreateSupportSessionDto, adminUserId: string, request: any): Promise<import("./dto").CreateSessionResponse>;
    /**
     * POST /support/consume-token
     * Consome o token e retorna JWT com actingAsSalonId
     *
     * @param body - { token: string }
     * @returns { accessToken, expiresIn, salonId, salonName }
     */
    consumeToken(body: ConsumeSupportTokenDto, adminUserId: string, request: any): Promise<import("./dto").ConsumeTokenResponse>;
    /**
     * GET /support/sessions
     * Lista sessões de suporte para auditoria
     *
     * @param status - Filtrar por status (PENDING, CONSUMED, EXPIRED, REVOKED)
     * @param limit - Limite de resultados (padrão: 50)
     */
    listSessions(status?: string, limit?: string): Promise<{
        id: string;
        adminUserId: string;
        adminName: string;
        adminEmail: string;
        targetSalonId: string;
        salonName: string;
        reason: string | null;
        status: string;
        expiresAt: Date;
        consumedAt: Date | null;
        ipAddress: string | null;
        createdAt: Date;
    }[]>;
    /**
     * DELETE /support/sessions/:id
     * Revoga uma sessão pendente
     */
    revokeSession(sessionId: string, adminUserId: string, request: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=support.controller.d.ts.map