import * as schema from '../../database/schema';
import { GoogleCalendarService } from './google-calendar.service';
import { ConflictResolution, SyncResult, IntegrationStatusResponse, ConflictDetails, SyncLogDetails } from './dto';
/**
 * CalendarSyncService
 * Handles synchronization between Google Calendar and local professional blocks
 */
export declare class CalendarSyncService {
    private readonly googleCalendarService;
    constructor(googleCalendarService: GoogleCalendarService);
    /**
     * Obtém status da integração para um profissional
     */
    getIntegrationStatus(salonId: string, professionalId: string): Promise<IntegrationStatusResponse>;
    /**
     * Obtém status de todas as integrações do salão
     */
    getAllIntegrationStatuses(salonId: string): Promise<IntegrationStatusResponse[]>;
    /**
     * Executa sincronização manual
     */
    manualSync(salonId: string, professionalId: string, fullSync?: boolean): Promise<SyncResult>;
    /**
     * Sincroniza um profissional específico
     */
    syncProfessional(integration: schema.GoogleIntegration, syncType?: 'FULL' | 'INCREMENTAL' | 'MANUAL'): Promise<SyncResult>;
    /**
     * Sincroniza eventos do Google para o app (cria/atualiza blocks)
     */
    private syncGoogleToApp;
    /**
     * Sincroniza blocks do app para o Google
     */
    private syncAppToGoogle;
    /**
     * Verifica se há conflito entre evento do Google e blocks locais
     */
    private checkConflict;
    /**
     * Lista conflitos pendentes
     */
    getConflicts(salonId: string, professionalId?: string): Promise<ConflictDetails[]>;
    /**
     * Resolve um conflito
     */
    resolveConflict(conflictId: string, resolution: ConflictResolution, userId: string): Promise<void>;
    /**
     * Obtém logs de sincronização
     */
    getSyncLogs(salonId: string, professionalId?: string, limit?: number): Promise<SyncLogDetails[]>;
    private createSyncLog;
    private completeSyncLog;
    private failSyncLog;
    private parseGoogleEventDates;
    private eventNeedsUpdate;
    private createBlockFromGoogle;
    private updateBlockFromGoogle;
    private blockToGoogleEvent;
}
//# sourceMappingURL=calendar-sync.service.d.ts.map