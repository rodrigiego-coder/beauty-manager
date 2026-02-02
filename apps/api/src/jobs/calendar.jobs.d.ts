/**
 * CalendarSyncJob
 * Scheduled tasks for Google Calendar synchronization
 */
export declare class CalendarSyncJob {
    private readonly logger;
    /**
     * Sincronização incremental a cada 15 minutos
     * Sincroniza todas as integrações ativas
     */
    incrementalSync(): Promise<void>;
    /**
     * Sincronização completa diária às 3h da manhã
     * Resincroniza tudo para garantir consistência
     */
    fullSync(): Promise<void>;
    /**
     * Limpeza de logs antigos - semanal (domingo 4h)
     */
    cleanupOldLogs(): Promise<void>;
    /**
     * Verifica tokens expirando e notifica/renova
     */
    checkExpiringTokens(): Promise<void>;
    private syncIntegration;
    private getValidAccessToken;
    private refreshToken;
    private fetchGoogleEvents;
    private syncGoogleToLocal;
    private parseEventDates;
    private tryReactivateIntegration;
}
//# sourceMappingURL=calendar.jobs.d.ts.map