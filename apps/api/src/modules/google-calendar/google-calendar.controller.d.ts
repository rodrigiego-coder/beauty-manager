import { FastifyReply } from 'fastify';
import { GoogleCalendarService } from './google-calendar.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
export declare class GoogleCalendarController {
    private readonly googleCalendarService;
    constructor(googleCalendarService: GoogleCalendarService);
    /**
     * GET /integrations/google/status
     * Verifica status da conexão Google Calendar
     */
    getStatus(user: AuthenticatedUser): Promise<import("./google-calendar.service").GoogleCalendarStatus>;
    /**
     * GET /integrations/google/auth
     * Redireciona para autorização do Google
     */
    redirectToGoogle(user: AuthenticatedUser, reply: FastifyReply): Promise<never>;
    /**
     * GET /integrations/google/auth-url
     * Retorna a URL de autorização (para uso em popup)
     */
    getAuthUrl(user: AuthenticatedUser): Promise<{
        url: string;
    }>;
    /**
     * GET /integrations/google/callback
     * Callback OAuth2 do Google - PÚBLICO (chamado pelo Google)
     */
    handleCallback(code: string, state: string, error?: string, reply?: FastifyReply): Promise<void>;
    /**
     * POST /integrations/google/sync
     * Sincroniza um agendamento específico com Google Calendar
     */
    syncAppointment(user: AuthenticatedUser, body: {
        appointmentId: string;
    }): Promise<import("./google-calendar.service").SyncResult>;
    /**
     * POST /integrations/google/sync-from-google
     * Importa eventos do Google Calendar (próximos 30 dias)
     */
    syncFromGoogle(user: AuthenticatedUser): Promise<{
        events: import("googleapis").calendar_v3.Schema$Event[];
        count: number;
    }>;
    /**
     * DELETE /integrations/google/event
     * Remove um evento do Google Calendar
     */
    deleteEvent(user: AuthenticatedUser, body: {
        eventId: string;
    }): Promise<import("./google-calendar.service").SyncResult>;
    /**
     * POST /integrations/google/toggle-sync
     * Ativa/desativa sincronização automática
     */
    toggleSync(user: AuthenticatedUser, body: {
        enabled: boolean;
    }): Promise<{
        success: boolean;
        syncEnabled: boolean;
    }>;
    /**
     * DELETE /integrations/google/disconnect
     * Desconecta o Google Calendar
     */
    disconnect(user: AuthenticatedUser): Promise<void>;
}
//# sourceMappingURL=google-calendar.controller.d.ts.map