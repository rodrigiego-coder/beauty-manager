import { SchedulesService } from '../schedules/schedules.service';
/**
 * =====================================================
 * ALEXIS SCHEDULER SERVICE
 * Gerenciamento de agendamentos via IA
 * =====================================================
 */
export interface AvailableSlot {
    time: string;
    professionalId: string;
    professionalName: string;
}
export interface CreateAppointmentData {
    salonId: string;
    clientPhone: string;
    clientName: string;
    serviceId: number;
    professionalId: string;
    date: Date;
    time: string;
}
export interface AppointmentResult {
    success: boolean;
    appointment?: any;
    error?: string;
}
export declare class AlexisSchedulerService {
    private readonly schedulesService;
    private readonly logger;
    constructor(schedulesService: SchedulesService);
    /**
     * Busca horários disponíveis para um serviço
     */
    getAvailableSlots(salonId: string, serviceId: number, date: Date, professionalId?: string): Promise<AvailableSlot[]>;
    /**
     * Cria um novo agendamento
     */
    createAppointment(data: CreateAppointmentData): Promise<AppointmentResult>;
    /**
     * Formata a lista de horários disponíveis para exibição
     */
    formatAvailableSlots(slots: AvailableSlot[], limit?: number): string;
    /**
     * Formata erro de disponibilidade em mensagem amigável para WhatsApp
     */
    private formatAvailabilityError;
}
//# sourceMappingURL=scheduler.service.d.ts.map