import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto, RescheduleAppointmentDto, CancelAppointmentDto, CheckAvailabilityDto, CreateBlockDto, UpdateBlockDto, RejectBlockDto, SetWorkingHoursDto, UpdateWorkingHourDto, AppointmentFiltersDto, BlockFiltersDto } from './dto';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    /**
     * GET /appointments - Lista agendamentos com filtros
     */
    findAll(user: any, filters: AppointmentFiltersDto): Promise<import("./appointments.service").AppointmentWithDetails[]>;
    /**
     * GET /appointments/kpis - KPIs de agendamentos
     */
    getKPIs(user: any, startDate?: string, endDate?: string): Promise<{
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
     * GET /appointments/day/:date - Agenda do dia
     */
    findByDay(user: any, date: string): Promise<import("./appointments.service").DaySchedule>;
    /**
     * GET /appointments/week/:startDate - Agenda da semana
     */
    findByWeek(user: any, startDate: string): Promise<import("./appointments.service").WeekSchedule>;
    /**
     * GET /appointments/month/:year/:month - Agenda do mês
     */
    findByMonth(user: any, year: number, month: number): Promise<import("./appointments.service").MonthSchedule>;
    /**
     * GET /appointments/professional/:id - Agendamentos de um profissional
     */
    findByProfessional(user: any, professionalId: string, date?: string): Promise<import("./appointments.service").AppointmentWithDetails[]>;
    /**
     * GET /appointments/client/:id - Agendamentos de um cliente
     */
    findByClient(user: any, clientId: string): Promise<import("./appointments.service").AppointmentWithDetails[]>;
    /**
     * GET /appointments/:id - Detalhes do agendamento
     */
    findById(user: any, id: string): Promise<import("./appointments.service").AppointmentWithDetails>;
    /**
     * POST /appointments - Criar agendamento
     */
    create(user: any, dto: CreateAppointmentDto): Promise<{
        date: string;
        duration: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        salonId: string;
        status: "SCHEDULED" | "PENDING_CONFIRMATION" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
        notes: string | null;
        clientId: string | null;
        clientName: string | null;
        clientPhone: string | null;
        clientEmail: string | null;
        professionalId: string;
        bufferBefore: number;
        bufferAfter: number;
        serviceId: number | null;
        service: string;
        time: string;
        startTime: string | null;
        endTime: string | null;
        locationType: "SALON" | "HOME" | "ONLINE";
        confirmationStatus: "PENDING" | "CONFIRMED" | "AUTO_CONFIRMED";
        confirmedAt: Date | null;
        confirmedVia: "MANUAL" | "WHATSAPP" | "SMS" | "EMAIL" | null;
        priority: "NORMAL" | "VIP" | "URGENT";
        color: string | null;
        price: string;
        internalNotes: string | null;
        commandId: string | null;
        clientPackageId: number | null;
        reminderSentAt: Date | null;
        noShowCount: number;
        source: "ONLINE" | "MANUAL" | "WHATSAPP" | "APP" | "ALEXIS";
        createdById: string | null;
        updatedById: string | null;
        cancelledById: string | null;
        cancellationReason: string | null;
        holdId: string | null;
        depositId: string | null;
        verifiedPhone: boolean | null;
        clientAccessToken: string | null;
        clientAccessTokenExpiresAt: Date | null;
        bookedOnlineAt: Date | null;
        clientIp: string | null;
        rescheduledFromId: string | null;
        rescheduledToId: string | null;
        rescheduleCount: number | null;
        googleEventId: string | null;
    }>;
    /**
     * PATCH /appointments/:id - Atualizar agendamento
     */
    update(user: any, id: string, dto: UpdateAppointmentDto): Promise<{
        date: string;
        duration: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        salonId: string;
        status: "SCHEDULED" | "PENDING_CONFIRMATION" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
        notes: string | null;
        clientId: string | null;
        clientName: string | null;
        clientPhone: string | null;
        clientEmail: string | null;
        professionalId: string;
        bufferBefore: number;
        bufferAfter: number;
        serviceId: number | null;
        service: string;
        time: string;
        startTime: string | null;
        endTime: string | null;
        locationType: "SALON" | "HOME" | "ONLINE";
        confirmationStatus: "PENDING" | "CONFIRMED" | "AUTO_CONFIRMED";
        confirmedAt: Date | null;
        confirmedVia: "MANUAL" | "WHATSAPP" | "SMS" | "EMAIL" | null;
        priority: "NORMAL" | "VIP" | "URGENT";
        color: string | null;
        price: string;
        internalNotes: string | null;
        commandId: string | null;
        clientPackageId: number | null;
        reminderSentAt: Date | null;
        noShowCount: number;
        source: "ONLINE" | "MANUAL" | "WHATSAPP" | "APP" | "ALEXIS";
        createdById: string | null;
        updatedById: string | null;
        cancelledById: string | null;
        cancellationReason: string | null;
        holdId: string | null;
        depositId: string | null;
        verifiedPhone: boolean | null;
        clientAccessToken: string | null;
        clientAccessTokenExpiresAt: Date | null;
        bookedOnlineAt: Date | null;
        clientIp: string | null;
        rescheduledFromId: string | null;
        rescheduledToId: string | null;
        rescheduleCount: number | null;
        googleEventId: string | null;
    }>;
    /**
     * DELETE /appointments/:id - Cancelar agendamento
     */
    cancel(user: any, id: string, dto: CancelAppointmentDto): Promise<{
        date: string;
        duration: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        salonId: string;
        status: "SCHEDULED" | "PENDING_CONFIRMATION" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
        notes: string | null;
        clientId: string | null;
        clientName: string | null;
        clientPhone: string | null;
        clientEmail: string | null;
        professionalId: string;
        bufferBefore: number;
        bufferAfter: number;
        serviceId: number | null;
        service: string;
        time: string;
        startTime: string | null;
        endTime: string | null;
        locationType: "SALON" | "HOME" | "ONLINE";
        confirmationStatus: "PENDING" | "CONFIRMED" | "AUTO_CONFIRMED";
        confirmedAt: Date | null;
        confirmedVia: "MANUAL" | "WHATSAPP" | "SMS" | "EMAIL" | null;
        priority: "NORMAL" | "VIP" | "URGENT";
        color: string | null;
        price: string;
        internalNotes: string | null;
        commandId: string | null;
        clientPackageId: number | null;
        reminderSentAt: Date | null;
        noShowCount: number;
        source: "ONLINE" | "MANUAL" | "WHATSAPP" | "APP" | "ALEXIS";
        createdById: string | null;
        updatedById: string | null;
        cancelledById: string | null;
        cancellationReason: string | null;
        holdId: string | null;
        depositId: string | null;
        verifiedPhone: boolean | null;
        clientAccessToken: string | null;
        clientAccessTokenExpiresAt: Date | null;
        bookedOnlineAt: Date | null;
        clientIp: string | null;
        rescheduledFromId: string | null;
        rescheduledToId: string | null;
        rescheduleCount: number | null;
        googleEventId: string | null;
    }>;
    /**
     * GET /appointments/availability/:professionalId/:date - Horários disponíveis
     */
    getAvailableSlots(user: any, professionalId: string, date: string, serviceId?: string): Promise<import("./appointments.service").TimeSlot[]>;
    /**
     * POST /appointments/check-availability - Verificar disponibilidade
     */
    checkAvailability(user: any, dto: CheckAvailabilityDto): Promise<import("./appointments.service").AvailabilityCheck>;
    /**
     * GET /appointments/next-available/:serviceId - Próximo horário disponível
     */
    findNextAvailable(user: any, serviceId: number, professionalId?: string): Promise<{
        date: string;
        time: string;
        professionalId: string;
        professionalName: string;
    } | null>;
    /**
     * POST /appointments/:id/confirm - Confirmar agendamento
     */
    confirm(user: any, id: string, via?: string): Promise<{
        date: string;
        duration: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        salonId: string;
        status: "SCHEDULED" | "PENDING_CONFIRMATION" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
        notes: string | null;
        clientId: string | null;
        clientName: string | null;
        clientPhone: string | null;
        clientEmail: string | null;
        professionalId: string;
        bufferBefore: number;
        bufferAfter: number;
        serviceId: number | null;
        service: string;
        time: string;
        startTime: string | null;
        endTime: string | null;
        locationType: "SALON" | "HOME" | "ONLINE";
        confirmationStatus: "PENDING" | "CONFIRMED" | "AUTO_CONFIRMED";
        confirmedAt: Date | null;
        confirmedVia: "MANUAL" | "WHATSAPP" | "SMS" | "EMAIL" | null;
        priority: "NORMAL" | "VIP" | "URGENT";
        color: string | null;
        price: string;
        internalNotes: string | null;
        commandId: string | null;
        clientPackageId: number | null;
        reminderSentAt: Date | null;
        noShowCount: number;
        source: "ONLINE" | "MANUAL" | "WHATSAPP" | "APP" | "ALEXIS";
        createdById: string | null;
        updatedById: string | null;
        cancelledById: string | null;
        cancellationReason: string | null;
        holdId: string | null;
        depositId: string | null;
        verifiedPhone: boolean | null;
        clientAccessToken: string | null;
        clientAccessTokenExpiresAt: Date | null;
        bookedOnlineAt: Date | null;
        clientIp: string | null;
        rescheduledFromId: string | null;
        rescheduledToId: string | null;
        rescheduleCount: number | null;
        googleEventId: string | null;
    }>;
    /**
     * POST /appointments/:id/start - Iniciar atendimento
     */
    start(user: any, id: string): Promise<{
        date: string;
        duration: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        salonId: string;
        status: "SCHEDULED" | "PENDING_CONFIRMATION" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
        notes: string | null;
        clientId: string | null;
        clientName: string | null;
        clientPhone: string | null;
        clientEmail: string | null;
        professionalId: string;
        bufferBefore: number;
        bufferAfter: number;
        serviceId: number | null;
        service: string;
        time: string;
        startTime: string | null;
        endTime: string | null;
        locationType: "SALON" | "HOME" | "ONLINE";
        confirmationStatus: "PENDING" | "CONFIRMED" | "AUTO_CONFIRMED";
        confirmedAt: Date | null;
        confirmedVia: "MANUAL" | "WHATSAPP" | "SMS" | "EMAIL" | null;
        priority: "NORMAL" | "VIP" | "URGENT";
        color: string | null;
        price: string;
        internalNotes: string | null;
        commandId: string | null;
        clientPackageId: number | null;
        reminderSentAt: Date | null;
        noShowCount: number;
        source: "ONLINE" | "MANUAL" | "WHATSAPP" | "APP" | "ALEXIS";
        createdById: string | null;
        updatedById: string | null;
        cancelledById: string | null;
        cancellationReason: string | null;
        holdId: string | null;
        depositId: string | null;
        verifiedPhone: boolean | null;
        clientAccessToken: string | null;
        clientAccessTokenExpiresAt: Date | null;
        bookedOnlineAt: Date | null;
        clientIp: string | null;
        rescheduledFromId: string | null;
        rescheduledToId: string | null;
        rescheduleCount: number | null;
        googleEventId: string | null;
    }>;
    /**
     * POST /appointments/:id/complete - Finalizar atendimento
     */
    complete(user: any, id: string): Promise<{
        date: string;
        duration: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        salonId: string;
        status: "SCHEDULED" | "PENDING_CONFIRMATION" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
        notes: string | null;
        clientId: string | null;
        clientName: string | null;
        clientPhone: string | null;
        clientEmail: string | null;
        professionalId: string;
        bufferBefore: number;
        bufferAfter: number;
        serviceId: number | null;
        service: string;
        time: string;
        startTime: string | null;
        endTime: string | null;
        locationType: "SALON" | "HOME" | "ONLINE";
        confirmationStatus: "PENDING" | "CONFIRMED" | "AUTO_CONFIRMED";
        confirmedAt: Date | null;
        confirmedVia: "MANUAL" | "WHATSAPP" | "SMS" | "EMAIL" | null;
        priority: "NORMAL" | "VIP" | "URGENT";
        color: string | null;
        price: string;
        internalNotes: string | null;
        commandId: string | null;
        clientPackageId: number | null;
        reminderSentAt: Date | null;
        noShowCount: number;
        source: "ONLINE" | "MANUAL" | "WHATSAPP" | "APP" | "ALEXIS";
        createdById: string | null;
        updatedById: string | null;
        cancelledById: string | null;
        cancellationReason: string | null;
        holdId: string | null;
        depositId: string | null;
        verifiedPhone: boolean | null;
        clientAccessToken: string | null;
        clientAccessTokenExpiresAt: Date | null;
        bookedOnlineAt: Date | null;
        clientIp: string | null;
        rescheduledFromId: string | null;
        rescheduledToId: string | null;
        rescheduleCount: number | null;
        googleEventId: string | null;
    }>;
    /**
     * POST /appointments/:id/no-show - Marcar como não compareceu
     */
    noShow(user: any, id: string): Promise<{
        date: string;
        duration: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        salonId: string;
        status: "SCHEDULED" | "PENDING_CONFIRMATION" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
        notes: string | null;
        clientId: string | null;
        clientName: string | null;
        clientPhone: string | null;
        clientEmail: string | null;
        professionalId: string;
        bufferBefore: number;
        bufferAfter: number;
        serviceId: number | null;
        service: string;
        time: string;
        startTime: string | null;
        endTime: string | null;
        locationType: "SALON" | "HOME" | "ONLINE";
        confirmationStatus: "PENDING" | "CONFIRMED" | "AUTO_CONFIRMED";
        confirmedAt: Date | null;
        confirmedVia: "MANUAL" | "WHATSAPP" | "SMS" | "EMAIL" | null;
        priority: "NORMAL" | "VIP" | "URGENT";
        color: string | null;
        price: string;
        internalNotes: string | null;
        commandId: string | null;
        clientPackageId: number | null;
        reminderSentAt: Date | null;
        noShowCount: number;
        source: "ONLINE" | "MANUAL" | "WHATSAPP" | "APP" | "ALEXIS";
        createdById: string | null;
        updatedById: string | null;
        cancelledById: string | null;
        cancellationReason: string | null;
        holdId: string | null;
        depositId: string | null;
        verifiedPhone: boolean | null;
        clientAccessToken: string | null;
        clientAccessTokenExpiresAt: Date | null;
        bookedOnlineAt: Date | null;
        clientIp: string | null;
        rescheduledFromId: string | null;
        rescheduledToId: string | null;
        rescheduleCount: number | null;
        googleEventId: string | null;
    }>;
    /**
     * POST /appointments/:id/reschedule - Reagendar
     */
    reschedule(user: any, id: string, dto: RescheduleAppointmentDto): Promise<{
        date: string;
        duration: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        salonId: string;
        status: "SCHEDULED" | "PENDING_CONFIRMATION" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
        notes: string | null;
        clientId: string | null;
        clientName: string | null;
        clientPhone: string | null;
        clientEmail: string | null;
        professionalId: string;
        bufferBefore: number;
        bufferAfter: number;
        serviceId: number | null;
        service: string;
        time: string;
        startTime: string | null;
        endTime: string | null;
        locationType: "SALON" | "HOME" | "ONLINE";
        confirmationStatus: "PENDING" | "CONFIRMED" | "AUTO_CONFIRMED";
        confirmedAt: Date | null;
        confirmedVia: "MANUAL" | "WHATSAPP" | "SMS" | "EMAIL" | null;
        priority: "NORMAL" | "VIP" | "URGENT";
        color: string | null;
        price: string;
        internalNotes: string | null;
        commandId: string | null;
        clientPackageId: number | null;
        reminderSentAt: Date | null;
        noShowCount: number;
        source: "ONLINE" | "MANUAL" | "WHATSAPP" | "APP" | "ALEXIS";
        createdById: string | null;
        updatedById: string | null;
        cancelledById: string | null;
        cancellationReason: string | null;
        holdId: string | null;
        depositId: string | null;
        verifiedPhone: boolean | null;
        clientAccessToken: string | null;
        clientAccessTokenExpiresAt: Date | null;
        bookedOnlineAt: Date | null;
        clientIp: string | null;
        rescheduledFromId: string | null;
        rescheduledToId: string | null;
        rescheduleCount: number | null;
        googleEventId: string | null;
    }>;
    /**
     * POST /appointments/:id/convert-to-command - Converter em comanda
     */
    convertToCommand(user: any, id: string): Promise<{
        appointmentId: string;
        commandId: string;
    }>;
    /**
     * GET /appointments/blocks - Lista bloqueios
     */
    getBlocks(user: any, filters: BlockFiltersDto): Promise<import("./appointments.service").BlockWithProfessional[]>;
    /**
     * GET /appointments/blocks/my - Meus bloqueios (profissional)
     */
    getMyBlocks(user: any, filters: BlockFiltersDto): Promise<import("./appointments.service").BlockWithProfessional[]>;
    /**
     * GET /appointments/blocks/:id - Detalhes do bloqueio
     */
    getBlockById(user: any, id: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        status: "PENDING" | "CANCELLED" | "APPROVED" | "REJECTED";
        type: "OTHER" | "DAY_OFF" | "VACATION" | "SICK_LEAVE" | "PERSONAL" | "LUNCH" | "TRAINING" | "MAINTENANCE";
        professionalId: string;
        startTime: string | null;
        endTime: string | null;
        createdById: string;
        title: string;
        startDate: string;
        endDate: string;
        allDay: boolean;
        recurring: boolean;
        recurringPattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | null;
        recurringDays: unknown;
        recurringEndDate: string | null;
        requiresApproval: boolean;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        externalSource: string | null;
        externalEventId: string | null;
    }>;
    /**
     * POST /appointments/blocks - Criar bloqueio
     */
    createBlock(user: any, dto: CreateBlockDto): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        status: "PENDING" | "CANCELLED" | "APPROVED" | "REJECTED";
        type: "OTHER" | "DAY_OFF" | "VACATION" | "SICK_LEAVE" | "PERSONAL" | "LUNCH" | "TRAINING" | "MAINTENANCE";
        professionalId: string;
        startTime: string | null;
        endTime: string | null;
        createdById: string;
        title: string;
        startDate: string;
        endDate: string;
        allDay: boolean;
        recurring: boolean;
        recurringPattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | null;
        recurringDays: unknown;
        recurringEndDate: string | null;
        requiresApproval: boolean;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        externalSource: string | null;
        externalEventId: string | null;
    }>;
    /**
     * PATCH /appointments/blocks/:id - Atualizar bloqueio
     */
    updateBlock(user: any, id: string, dto: UpdateBlockDto): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        status: "PENDING" | "CANCELLED" | "APPROVED" | "REJECTED";
        type: "OTHER" | "DAY_OFF" | "VACATION" | "SICK_LEAVE" | "PERSONAL" | "LUNCH" | "TRAINING" | "MAINTENANCE";
        professionalId: string;
        startTime: string | null;
        endTime: string | null;
        createdById: string;
        title: string;
        startDate: string;
        endDate: string;
        allDay: boolean;
        recurring: boolean;
        recurringPattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | null;
        recurringDays: unknown;
        recurringEndDate: string | null;
        requiresApproval: boolean;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        externalSource: string | null;
        externalEventId: string | null;
    }>;
    /**
     * DELETE /appointments/blocks/:id - Remover bloqueio
     */
    deleteBlock(user: any, id: string): Promise<{
        success: boolean;
    }>;
    /**
     * POST /appointments/blocks/:id/approve - Aprovar bloqueio
     */
    approveBlock(user: any, id: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        status: "PENDING" | "CANCELLED" | "APPROVED" | "REJECTED";
        type: "OTHER" | "DAY_OFF" | "VACATION" | "SICK_LEAVE" | "PERSONAL" | "LUNCH" | "TRAINING" | "MAINTENANCE";
        professionalId: string;
        startTime: string | null;
        endTime: string | null;
        createdById: string;
        title: string;
        startDate: string;
        endDate: string;
        allDay: boolean;
        recurring: boolean;
        recurringPattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | null;
        recurringDays: unknown;
        recurringEndDate: string | null;
        requiresApproval: boolean;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        externalSource: string | null;
        externalEventId: string | null;
    }>;
    /**
     * POST /appointments/blocks/:id/reject - Rejeitar bloqueio
     */
    rejectBlock(user: any, id: string, dto: RejectBlockDto): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        status: "PENDING" | "CANCELLED" | "APPROVED" | "REJECTED";
        type: "OTHER" | "DAY_OFF" | "VACATION" | "SICK_LEAVE" | "PERSONAL" | "LUNCH" | "TRAINING" | "MAINTENANCE";
        professionalId: string;
        startTime: string | null;
        endTime: string | null;
        createdById: string;
        title: string;
        startDate: string;
        endDate: string;
        allDay: boolean;
        recurring: boolean;
        recurringPattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | null;
        recurringDays: unknown;
        recurringEndDate: string | null;
        requiresApproval: boolean;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        externalSource: string | null;
        externalEventId: string | null;
    }>;
    /**
     * GET /appointments/working-hours/:professionalId - Horários de trabalho
     */
    getWorkingHours(user: any, professionalId: string): Promise<import("./appointments.service").WorkingHours[]>;
    /**
     * POST /appointments/working-hours - Definir horários de trabalho
     */
    setWorkingHours(user: any, dto: SetWorkingHoursDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        professionalId: string;
        startTime: string;
        endTime: string;
        dayOfWeek: number;
        breakStartTime: string | null;
        breakEndTime: string | null;
    }[]>;
    /**
     * PATCH /appointments/working-hours/:id - Atualizar horário específico
     */
    updateWorkingHour(user: any, id: string, dto: UpdateWorkingHourDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        professionalId: string;
        startTime: string;
        endTime: string;
        dayOfWeek: number;
        breakStartTime: string | null;
        breakEndTime: string | null;
    }>;
}
//# sourceMappingURL=appointments.controller.d.ts.map