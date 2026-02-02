import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { CreateDepositDto } from './dto';
import { OnlineBookingSettingsService } from './online-booking-settings.service';
export declare class DepositsService {
    private readonly db;
    private readonly settingsService;
    private readonly logger;
    private readonly DEPOSIT_EXPIRATION_HOURS;
    constructor(db: NodePgDatabase<typeof schema>, settingsService: OnlineBookingSettingsService);
    /**
     * Calcula o valor do depósito para um serviço
     */
    calculateDepositAmount(salonId: string, servicePrice: number): Promise<number>;
    /**
     * Cria um depósito para um agendamento
     */
    createDeposit(salonId: string, dto: CreateDepositDto): Promise<schema.AppointmentDeposit>;
    /**
     * Obtém um depósito pelo ID
     */
    getDeposit(salonId: string, depositId: string): Promise<schema.AppointmentDeposit | null>;
    /**
     * Obtém depósito por agendamento
     */
    getDepositByAppointment(salonId: string, appointmentId: string): Promise<schema.AppointmentDeposit | null>;
    /**
     * Obtém depósito por hold
     */
    getDepositByHold(salonId: string, holdId: string): Promise<schema.AppointmentDeposit | null>;
    /**
     * Marca depósito como pago
     */
    markAsPaid(salonId: string, depositId: string, paymentData: {
        paymentMethod: string;
        paymentReference?: string;
        mercadoPagoPaymentId?: string;
    }): Promise<schema.AppointmentDeposit>;
    /**
     * Vincula depósito a um agendamento (quando criado a partir de hold)
     */
    linkToAppointment(salonId: string, depositId: string, appointmentId: string): Promise<void>;
    /**
     * Processa reembolso do depósito
     */
    refundDeposit(salonId: string, depositId: string, reason?: string): Promise<schema.AppointmentDeposit>;
    /**
     * Marca depósito como perdido (no-show ou cancelamento tardio)
     */
    forfeitDeposit(salonId: string, depositId: string, reason?: string): Promise<schema.AppointmentDeposit>;
    /**
     * Gera dados do PIX para pagamento
     * Integração com Mercado Pago
     */
    generatePixPayment(salonId: string, depositId: string): Promise<{
        pixCode: string;
        qrCodeBase64: string;
        expiresAt: Date;
    }>;
    /**
     * Verifica se o cancelamento é elegível para reembolso
     */
    isEligibleForRefund(salonId: string, appointmentId: string): Promise<boolean>;
}
//# sourceMappingURL=deposits.service.d.ts.map