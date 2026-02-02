import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { CreateHoldDto, HoldResponse } from './dto';
import { OnlineBookingSettingsService } from './online-booking-settings.service';
export declare class AppointmentHoldsService {
    private readonly db;
    private readonly settingsService;
    private readonly logger;
    constructor(db: NodePgDatabase<typeof schema>, settingsService: OnlineBookingSettingsService);
    /**
     * Cria um hold (reserva temporária) para um horário
     */
    createHold(salonId: string, dto: CreateHoldDto, clientIp?: string): Promise<HoldResponse>;
    /**
     * Obtém um hold pelo ID
     */
    getHold(salonId: string, holdId: string): Promise<schema.AppointmentHold | null>;
    /**
     * Obtém hold ativo pelo ID
     */
    getActiveHold(salonId: string, holdId: string): Promise<schema.AppointmentHold>;
    /**
     * Converte um hold em agendamento
     */
    convertToAppointment(salonId: string, holdId: string, appointmentId: string): Promise<void>;
    /**
     * Libera um hold manualmente
     */
    releaseHold(salonId: string, holdId: string): Promise<void>;
    /**
     * Marca um hold como expirado
     */
    expireHold(holdId: string): Promise<void>;
    /**
     * Verifica conflito com holds ativos
     */
    checkHoldConflict(salonId: string, professionalId: string, date: string, startTime: string, endTime: string, excludeHoldId?: string): Promise<boolean>;
    /**
     * Verifica conflito com agendamentos existentes
     */
    checkAppointmentConflict(salonId: string, professionalId: string, date: string, startTime: string, endTime: string, excludeAppointmentId?: string): Promise<boolean>;
    /**
     * Limpa holds expirados (job de limpeza)
     */
    cleanupExpiredHolds(): Promise<number>;
    /**
     * Obtém holds ativos por sessão
     */
    getHoldsBySession(salonId: string, sessionId: string): Promise<schema.AppointmentHold[]>;
    /**
     * Estende o tempo de um hold
     */
    extendHold(salonId: string, holdId: string, extraMinutes?: number): Promise<HoldResponse>;
    /**
     * Verifica se dois períodos de tempo se sobrepõem
     */
    private timesOverlap;
    /**
     * Adiciona minutos a um horário
     */
    private addMinutes;
}
//# sourceMappingURL=appointment-holds.service.d.ts.map