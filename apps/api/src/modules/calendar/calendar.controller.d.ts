import { Response } from 'express';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { GoogleCalendarService } from './google-calendar.service';
import { CalendarSyncService } from './calendar-sync.service';
import { ConnectGoogleCalendarDto, UpdateIntegrationSettingsDto, ManualSyncDto, ResolveConflictDto, BulkResolveConflictsDto } from './dto';
export declare class CalendarController {
    private readonly googleCalendarService;
    private readonly calendarSyncService;
    constructor(googleCalendarService: GoogleCalendarService, calendarSyncService: CalendarSyncService);
    /**
     * Verifica se Google Calendar está configurado
     */
    isConfigured(): {
        configured: boolean;
    };
    /**
     * Gera URL de autenticação OAuth
     */
    getConnectUrl(user: AuthenticatedUser, query: ConnectGoogleCalendarDto): {
        url: string;
    };
    /**
     * Callback OAuth - Processa retorno do Google
     */
    handleCallback(code: string, state: string, error: string, res: Response): Promise<void>;
    /**
     * Desconecta integração Google
     */
    disconnect(user: AuthenticatedUser, professionalId?: string): Promise<{
        success: boolean;
    }>;
    /**
     * Status da integração do usuário atual ou profissional específico
     */
    getStatus(user: AuthenticatedUser, professionalId?: string): Promise<import("./dto").IntegrationStatusResponse>;
    /**
     * Status de todas as integrações do salão
     */
    getAllStatuses(user: AuthenticatedUser): Promise<import("./dto").IntegrationStatusResponse[]>;
    /**
     * Atualiza configurações da integração
     */
    updateSettings(user: AuthenticatedUser, dto: UpdateIntegrationSettingsDto, professionalId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        status: "ACTIVE" | "ERROR" | "DISCONNECTED" | "TOKEN_EXPIRED";
        professionalId: string;
        googleAccountEmail: string;
        accessToken: string;
        refreshToken: string;
        tokenExpiresAt: Date;
        calendarId: string;
        syncDirection: "GOOGLE_TO_APP" | "APP_TO_GOOGLE" | "BIDIRECTIONAL";
        syncEnabled: boolean;
        lastSyncAt: Date | null;
        lastSyncStatus: "ACTIVE" | "ERROR" | "DISCONNECTED" | "TOKEN_EXPIRED" | null;
        errorMessage: string | null;
        settings: unknown;
    }>;
    /**
     * Lista calendários disponíveis na conta Google
     */
    listCalendars(user: AuthenticatedUser, professionalId?: string): Promise<{
        id: string;
        summary: string;
        primary?: boolean;
    }[]>;
    /**
     * Executa sincronização manual
     */
    sync(user: AuthenticatedUser, dto: ManualSyncDto): Promise<import("./dto").SyncResult>;
    /**
     * Logs de sincronização
     */
    getSyncLogs(user: AuthenticatedUser, professionalId?: string, limit?: string): Promise<import("./dto").SyncLogDetails[]>;
    /**
     * Lista conflitos pendentes
     */
    getConflicts(user: AuthenticatedUser, professionalId?: string): Promise<import("./dto").ConflictDetails[]>;
    /**
     * Resolve um conflito
     */
    resolveConflict(user: AuthenticatedUser, dto: ResolveConflictDto): Promise<{
        success: boolean;
    }>;
    /**
     * Resolve múltiplos conflitos
     */
    resolveConflictsBulk(user: AuthenticatedUser, dto: BulkResolveConflictsDto): Promise<{
        success: boolean;
        resolved: number;
    }>;
}
//# sourceMappingURL=calendar.controller.d.ts.map