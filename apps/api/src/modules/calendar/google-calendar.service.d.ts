import * as schema from '../../database/schema';
import { GoogleCalendarEvent, GoogleTokens, GoogleUserInfo, SyncDirection, IntegrationStatus } from './dto';
/**
 * GoogleCalendarService
 * Handles OAuth flow and Google Calendar API interactions
 */
export declare class GoogleCalendarService {
    private readonly clientId;
    private readonly clientSecret;
    private readonly redirectUri;
    private readonly scopes;
    constructor();
    /**
     * Verifica se a integração está configurada
     */
    isConfigured(): boolean;
    /**
     * Gera URL de autenticação OAuth
     */
    getAuthUrl(state: string): string;
    /**
     * Troca código de autorização por tokens
     */
    exchangeCodeForTokens(code: string): Promise<GoogleTokens>;
    /**
     * Renova access token usando refresh token
     */
    refreshAccessToken(refreshToken: string): Promise<GoogleTokens>;
    /**
     * Obtém informações do usuário Google
     */
    getUserInfo(accessToken: string): Promise<GoogleUserInfo>;
    /**
     * Lista eventos do calendário
     */
    listEvents(accessToken: string, calendarId?: string, timeMin?: Date, timeMax?: Date, pageToken?: string): Promise<{
        events: GoogleCalendarEvent[];
        nextPageToken?: string;
    }>;
    /**
     * Obtém um evento específico
     */
    getEvent(accessToken: string, calendarId: string, eventId: string): Promise<GoogleCalendarEvent | null>;
    /**
     * Cria um evento no calendário
     */
    createEvent(accessToken: string, calendarId: string, event: Partial<GoogleCalendarEvent>): Promise<GoogleCalendarEvent>;
    /**
     * Atualiza um evento no calendário
     */
    updateEvent(accessToken: string, calendarId: string, eventId: string, event: Partial<GoogleCalendarEvent>): Promise<GoogleCalendarEvent>;
    /**
     * Remove um evento do calendário
     */
    deleteEvent(accessToken: string, calendarId: string, eventId: string): Promise<void>;
    /**
     * Lista calendários disponíveis
     */
    listCalendars(accessToken: string): Promise<Array<{
        id: string;
        summary: string;
        primary?: boolean;
    }>>;
    /**
     * Salva ou atualiza integração no banco
     */
    saveIntegration(salonId: string, professionalId: string, googleEmail: string, tokens: GoogleTokens, calendarId?: string, syncDirection?: SyncDirection): Promise<schema.GoogleIntegration>;
    /**
     * Obtém integração ativa para profissional
     */
    getIntegration(salonId: string, professionalId: string): Promise<schema.GoogleIntegration | null>;
    /**
     * Obtém access token válido, renovando se necessário
     */
    getValidAccessToken(integration: schema.GoogleIntegration): Promise<string>;
    /**
     * Desconecta integração
     */
    disconnectIntegration(salonId: string, professionalId: string): Promise<void>;
    /**
     * Atualiza configurações da integração
     */
    updateSettings(integrationId: string, settings: {
        calendarId?: string;
        syncDirection?: SyncDirection;
        syncEnabled?: boolean;
    }): Promise<schema.GoogleIntegration>;
    /**
     * Marca erro na integração
     */
    markError(integrationId: string, errorMessage: string): Promise<void>;
    /**
     * Atualiza timestamp de última sincronização
     */
    updateLastSync(integrationId: string, status: IntegrationStatus): Promise<void>;
    /**
     * Lista todas as integrações ativas para sincronização
     */
    getActiveIntegrations(): Promise<schema.GoogleIntegration[]>;
}
//# sourceMappingURL=google-calendar.service.d.ts.map