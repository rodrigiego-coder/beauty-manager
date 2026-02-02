import { JwtService } from '@nestjs/jwt';
import { Database } from '../../database/database.module';
import { CreateSessionResponse, ConsumeTokenResponse } from './dto';
export declare class SupportService {
    private db;
    private jwtService;
    constructor(db: Database, jwtService: JwtService);
    /**
     * Cria uma sessão de suporte delegado (SUPER_ADMIN only)
     * Gera um token único que pode ser consumido uma única vez
     */
    createSession(adminUserId: string, targetSalonId: string, reason: string, ipAddress?: string, userAgent?: string): Promise<CreateSessionResponse>;
    /**
     * Consome o token de suporte e retorna um JWT com actingAsSalonId
     */
    consumeToken(token: string, adminUserId: string, ipAddress?: string, userAgent?: string): Promise<ConsumeTokenResponse>;
    /**
     * Lista sessões de suporte (para auditoria)
     */
    listSessions(filters?: {
        adminUserId?: string;
        status?: string;
        limit?: number;
    }): Promise<{
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
     * Revoga uma sessão pendente
     */
    revokeSession(sessionId: string, adminUserId: string, ipAddress?: string): Promise<void>;
    /**
     * Expira sessões antigas automaticamente (pode ser chamado por um cron job)
     */
    expireOldSessions(): Promise<number>;
}
//# sourceMappingURL=support.service.d.ts.map