import { Database, Appointment, NewAppointment, ProfessionalAvailability, ProfessionalBlock, NewProfessionalBlock } from '../../database';
import { UsersService } from '../users';
import { ScheduledMessagesService } from '../notifications';
import { TriageService } from '../triage/triage.service';
import { SchedulesService } from '../schedules/schedules.service';
export interface AppointmentWithDetails extends Appointment {
    clientName: string | null;
    professionalName: string;
    serviceName: string;
    serviceDetails?: {
        id: number;
        name: string;
        duration: number;
        price: string;
        bufferBefore: number;
        bufferAfter: number;
    };
}
export interface DaySchedule {
    date: string;
    appointments: AppointmentWithDetails[];
    professionals: {
        id: string;
        name: string;
        color?: string;
    }[];
    blocks: ProfessionalBlock[];
}
export interface WeekSchedule {
    startDate: string;
    endDate: string;
    days: DaySchedule[];
}
export interface MonthSchedule {
    year: number;
    month: number;
    days: {
        date: string;
        appointmentCount: number;
        hasBlocks: boolean;
        occupancyLevel: 'low' | 'medium' | 'high';
        appointments: AppointmentWithDetails[];
    }[];
}
export interface TimeSlot {
    time: string;
    available: boolean;
    reason?: string;
}
export interface AvailabilityCheck {
    available: boolean;
    reason?: string;
    conflicts?: Appointment[];
    suggestedTimes?: string[];
}
export interface WorkingHours {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakStartTime?: string | null;
    breakEndTime?: string | null;
    isActive: boolean;
}
export interface BlockWithProfessional extends ProfessionalBlock {
    professionalName: string;
}
export declare class AppointmentsService {
    private db;
    private usersService;
    private scheduledMessagesService;
    private triageService;
    private schedulesService;
    private readonly logger;
    constructor(db: Database, usersService: UsersService, scheduledMessagesService: ScheduledMessagesService, triageService: TriageService, schedulesService: SchedulesService);
    /**
     * Lista todos os agendamentos do salão com filtros
     */
    findAll(salonId: string, filters?: {
        date?: string;
        professionalId?: string;
        status?: string;
        clientId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<AppointmentWithDetails[]>;
    /**
     * Busca agendamento por ID
     */
    findById(id: string, salonId: string): Promise<AppointmentWithDetails | null>;
    /**
     * Busca agendamentos por data (dia específico)
     */
    findByDay(salonId: string, date: string): Promise<DaySchedule>;
    /**
     * Busca agendamentos da semana
     */
    findByWeek(salonId: string, startDate: string): Promise<WeekSchedule>;
    /**
     * Busca agendamentos do mês
     */
    findByMonth(salonId: string, year: number, month: number): Promise<MonthSchedule>;
    /**
     * Cria um novo agendamento
     */
    create(salonId: string, data: Partial<NewAppointment>, createdById: string): Promise<Appointment>;
    /**
     * Atualiza um agendamento
     */
    update(id: string, salonId: string, data: Partial<NewAppointment>, updatedById: string): Promise<Appointment | null>;
    /**
     * Cancela um agendamento
     */
    cancel(id: string, salonId: string, cancelledById: string, reason?: string): Promise<Appointment | null>;
    /**
     * Confirma um agendamento
     */
    confirm(id: string, salonId: string, via?: string): Promise<Appointment | null>;
    /**
     * Inicia um atendimento
     */
    start(id: string, salonId: string): Promise<Appointment | null>;
    /**
     * Finaliza um atendimento
     */
    complete(id: string, salonId: string): Promise<Appointment | null>;
    /**
     * Marca como não compareceu e registra no histórico
     */
    noShow(id: string, salonId: string): Promise<Appointment | null>;
    /**
     * Reagenda um agendamento
     */
    reschedule(id: string, salonId: string, newDate: string, newTime: string, newProfessionalId?: string, updatedById?: string): Promise<Appointment | null>;
    /**
     * Retorna horários disponíveis para um profissional em uma data
     */
    getAvailableSlots(professionalId: string, salonId: string, date: string, serviceId?: number, interval?: number): Promise<TimeSlot[]>;
    /**
     * Verifica disponibilidade completa
     */
    checkAvailability(salonId: string, professionalId: string, date: string, startTime: string, duration: number): Promise<AvailabilityCheck>;
    /**
     * Encontra próximo horário disponível
     */
    findNextAvailable(serviceId: number, salonId: string, professionalId?: string): Promise<{
        date: string;
        time: string;
        professionalId: string;
        professionalName: string;
    } | null>;
    /**
     * Lista bloqueios
     */
    getBlocks(salonId: string, filters?: {
        professionalId?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<BlockWithProfessional[]>;
    /**
     * Busca bloqueio por ID
     */
    getBlockById(id: string, salonId: string): Promise<ProfessionalBlock | null>;
    /**
     * Cria bloqueio
     */
    createBlock(salonId: string, data: Partial<NewProfessionalBlock>, createdById: string): Promise<ProfessionalBlock>;
    /**
     * Atualiza bloqueio
     */
    updateBlock(id: string, salonId: string, data: Partial<NewProfessionalBlock>): Promise<ProfessionalBlock | null>;
    /**
     * Remove bloqueio
     */
    deleteBlock(id: string, salonId: string): Promise<boolean>;
    /**
     * Aprova bloqueio
     */
    approveBlock(id: string, salonId: string, approvedById: string): Promise<ProfessionalBlock | null>;
    /**
     * Rejeita bloqueio
     */
    rejectBlock(id: string, salonId: string, reason?: string): Promise<ProfessionalBlock | null>;
    /**
     * Retorna horários de trabalho de um profissional
     */
    getWorkingHours(professionalId: string, salonId: string): Promise<WorkingHours[]>;
    /**
     * Define horários de trabalho
     */
    setWorkingHours(professionalId: string, salonId: string, hours: WorkingHours[]): Promise<ProfessionalAvailability[]>;
    /**
     * Atualiza horário de trabalho específico
     */
    updateWorkingHour(id: string, salonId: string, data: Partial<WorkingHours>): Promise<ProfessionalAvailability | null>;
    /**
     * Converte agendamento em comanda
     */
    convertToCommand(id: string, salonId: string, userId: string): Promise<{
        appointmentId: string;
        commandId: string;
    }>;
    /**
     * Lista agendamentos por profissional
     */
    findByProfessional(professionalId: string, salonId: string, date?: string): Promise<AppointmentWithDetails[]>;
    /**
     * Lista agendamentos por cliente
     */
    findByClient(clientId: string, salonId: string): Promise<AppointmentWithDetails[]>;
    /**
     * Calcula KPIs do negócio
     */
    calculateKPIs(salonId: string, startDate?: string, endDate?: string): Promise<{
        ticketMedio: number;
        taxaRetorno: number;
        totalFaturamento: number;
        totalAgendamentos: number;
        totalClientes: number;
        clientesRecorrentes: number;
        taxaNoShow: number;
        taxaConfirmacao: number;
        top3Servicos: {
            service: string;
            count: number;
            revenue: number;
        }[];
    }>;
    /**
     * Verifica conflito de horário
     */
    private checkConflict;
    /**
     * Retorna agendamentos conflitantes
     */
    private getConflictingAppointments;
    /**
     * Encontra próximos slots disponíveis
     */
    private findNextAvailableSlots;
    /**
     * Busca bloqueios para uma data
     */
    private getBlocksForDate;
    /**
     * Busca bloqueios para um range de datas
     */
    private getBlocksForDateRange;
    /**
     * Verifica se há bloqueio em data/horário específico
     */
    private hasBlockOnDate;
    /**
     * Verifica se cliente está bloqueado
     */
    private isClientBlocked;
    /**
     * Enrich appointments with client/professional/service names
     */
    private enrichAppointments;
    /**
     * Generate card number - Numeração sequencial simples (1, 2, 3...)
     */
    private generateCardNumber;
    /**
     * Convert time string to minutes
     */
    private timeToMinutes;
    /**
     * Convert minutes to time string
     */
    private minutesToTime;
    /**
     * Calculate end time from start time and duration
     */
    private calculateEndTime;
}
//# sourceMappingURL=appointments.service.d.ts.map