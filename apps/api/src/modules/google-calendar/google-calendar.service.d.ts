import { ConfigService } from '@nestjs/config';
import { calendar_v3 } from 'googleapis';
/**
 * =====================================================
 * GOOGLE CALENDAR SERVICE
 * Integração bidirecional com Google Calendar
 * =====================================================
 */
export interface SyncResult {
    success: boolean;
    eventId?: string;
    error?: string;
}
export interface GoogleCalendarStatus {
    connected: boolean;
    email?: string;
    calendarId?: string;
    lastSyncAt?: Date;
    syncEnabled?: boolean;
}
export declare class GoogleCalendarService {
    private configService;
    private readonly logger;
    private oauth2Client;
    private readonly SCOPES;
    constructor(configService: ConfigService);
    /**
     * Codifica string para Base64 URL-safe
     * Substitui + por -, / por _, remove =
     */
    private encodeBase64UrlSafe;
    /**
     * Decodifica Base64 URL-safe para string
     * Restaura + e / e adiciona padding se necessário
     */
    private decodeBase64UrlSafe;
    /**
     * Gera a URL de autorização OAuth2 do Google
     * Inclui state para preservar userId/salonId
     */
    getAuthUrl(userId: string, salonId: string): string;
    /**
     * Processa o callback do OAuth2 e salva os tokens no banco
     */
    handleCallback(code: string, state: string): Promise<{
        success: boolean;
        email?: string;
    }>;
    /**
     * Obtém tokens válidos para um usuário, atualizando se necessário
     */
    getValidTokens(userId: string, salonId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    } | null>;
    /**
     * Renova o access token usando o refresh token
     */
    refreshTokenIfNeeded(refreshToken: string): Promise<{
        accessToken: string;
        expiry: Date;
    } | null>;
    /**
     * Sincroniza um agendamento do sistema para o Google Calendar
     */
    syncAppointmentToGoogle(userId: string, salonId: string, appointmentId: string): Promise<SyncResult>;
    /**
     * Remove um evento do Google Calendar
     */
    deleteEventFromGoogle(userId: string, salonId: string, googleEventId: string): Promise<SyncResult>;
    /**
     * Importa eventos do Google Calendar para o sistema como bloqueios
     * (eventos pessoais do profissional que bloqueiam sua agenda)
     */
    syncGoogleToSystem(userId: string, salonId: string, startDate: Date, endDate: Date): Promise<{
        events: calendar_v3.Schema$Event[];
        count: number;
    }>;
    /**
     * Desconecta o Google Calendar do usuário
     */
    disconnectGoogle(userId: string, salonId: string): Promise<void>;
    /**
     * Obtém status da conexão Google Calendar
     */
    getConnectionStatus(userId: string, salonId: string): Promise<GoogleCalendarStatus>;
    /**
     * Alterna sincronização automática
     */
    toggleSync(userId: string, salonId: string, enabled: boolean): Promise<void>;
    /**
     * Calcula horário de término baseado no início e duração
     */
    private calculateEndTime;
}
//# sourceMappingURL=google-calendar.service.d.ts.map