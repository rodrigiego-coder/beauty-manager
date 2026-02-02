import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { CreateHoldDto, SendOtpDto, VerifyOtpDto, GetAvailableSlotsDto, CreateOnlineBookingDto, CancelOnlineBookingDto, AvailableSlot, HoldResponse, BookingConfirmation } from './dto';
import { OnlineBookingSettingsService } from './online-booking-settings.service';
import { AppointmentHoldsService } from './appointment-holds.service';
import { OtpService } from './otp.service';
import { DepositsService } from './deposits.service';
import { ClientBookingRulesService } from './client-booking-rules.service';
import { ScheduledMessagesService } from '../notifications/scheduled-messages.service';
/**
 * Controller público para agendamento online
 * Não requer autenticação - acessível por clientes
 */
export declare class PublicBookingController {
    private readonly db;
    private readonly settingsService;
    private readonly holdsService;
    private readonly otpService;
    private readonly depositsService;
    private readonly rulesService;
    private readonly scheduledMessagesService;
    private readonly logger;
    constructor(db: NodePgDatabase<typeof schema>, settingsService: OnlineBookingSettingsService, holdsService: AppointmentHoldsService, otpService: OtpService, depositsService: DepositsService, rulesService: ClientBookingRulesService, scheduledMessagesService: ScheduledMessagesService);
    /**
     * Obtém informações do salão para booking
     */
    getSalonInfo(salonSlug: string): Promise<{
        salonId: string;
        salonName: string;
        welcomeMessage: string | null;
        termsUrl: string | null;
        requireTermsAcceptance: boolean;
        requirePhoneVerification: boolean;
        minAdvanceHours: number;
        maxAdvanceDays: number;
        cancellationHours: number;
        allowRescheduling: boolean;
    }>;
    /**
     * Lista serviços disponíveis para agendamento online
     */
    getAvailableServices(salonSlug: string): Promise<{
        id: number;
        name: string;
        description: string | null;
        category: "HAIR" | "BARBER" | "NAILS" | "SKIN" | "MAKEUP" | "OTHER";
        durationMinutes: number;
        basePrice: string;
    }[]>;
    /**
     * Lista profissionais disponíveis para um serviço
     */
    getAvailableProfessionals(salonSlug: string, serviceId?: string): Promise<{
        id: string;
        name: string;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
    }[]>;
    /**
     * Obtém horários disponíveis
     */
    getAvailableSlots(salonSlug: string, query: GetAvailableSlotsDto): Promise<AvailableSlot[]>;
    /**
     * Verifica elegibilidade do cliente antes de criar hold
     */
    checkClientEligibility(salonSlug: string, body: {
        clientPhone: string;
        serviceId?: number;
    }): Promise<{
        canBook: boolean;
        reason: string | undefined;
        requiresDeposit: boolean;
        depositAmount: number | null;
        isClientBlocked: boolean | undefined;
    }>;
    /**
     * Cria uma reserva temporária (hold)
     */
    createHold(salonSlug: string, dto: CreateHoldDto, clientIp: string): Promise<HoldResponse>;
    /**
     * Estende o tempo de uma reserva
     */
    extendHold(salonSlug: string, holdId: string): Promise<HoldResponse>;
    /**
     * Libera uma reserva
     */
    releaseHold(salonSlug: string, holdId: string): Promise<{
        message: string;
    }>;
    /**
     * Envia código OTP para verificação de telefone
     */
    sendOtp(salonSlug: string, dto: SendOtpDto, clientIp: string): Promise<{
        message: string;
        expiresIn: number;
    }>;
    /**
     * Verifica código OTP
     */
    verifyOtp(salonSlug: string, dto: VerifyOtpDto): Promise<{
        valid: boolean;
        message: string;
    }>;
    /**
     * Confirma agendamento (converte hold em appointment)
     */
    confirmBooking(salonSlug: string, dto: CreateOnlineBookingDto, clientIp: string): Promise<BookingConfirmation>;
    /**
     * Consulta status de um agendamento pelo token
     */
    getAppointmentStatus(salonSlug: string, appointmentId: string, token?: string): Promise<{
        id: string;
        date: string;
        time: string;
        service: string;
        status: "SCHEDULED" | "PENDING_CONFIRMATION" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
        confirmationStatus: "PENDING" | "CONFIRMED" | "AUTO_CONFIRMED";
        deposit: {
            status: "PENDING" | "PAID" | "REFUNDED" | "FORFEITED";
            amount: string;
            paidAt: Date | null;
        } | null;
    }>;
    /**
     * Cancela um agendamento
     */
    cancelBooking(salonSlug: string, dto: CancelOnlineBookingDto): Promise<{
        message: string;
    }>;
    /**
     * Busca salão pelo slug
     */
    private findSalonBySlug;
    /**
     * Verifica se booking está habilitado
     */
    private checkBookingEnabled;
    /**
     * Busca ou cria cliente
     */
    private findOrCreateClient;
    /**
     * Gera slots disponíveis para um profissional
     */
    private generateSlotsForProfessional;
    /**
     * Adiciona minutos a um horário
     */
    private addMinutes;
}
//# sourceMappingURL=public-booking.controller.d.ts.map