import { UpdateOnlineBookingSettingsDto, CreateClientBookingRuleDto, UpdateClientBookingRuleDto, GenerateAssistedLinkDto } from './dto';
import { OnlineBookingSettingsService } from './online-booking-settings.service';
import { ClientBookingRulesService } from './client-booking-rules.service';
import { AppointmentHoldsService } from './appointment-holds.service';
import { DepositsService } from './deposits.service';
/**
 * Controller administrativo para gerenciar agendamento online
 * Requer autenticação e permissões de OWNER/MANAGER
 */
export declare class AdminBookingController {
    private readonly settingsService;
    private readonly rulesService;
    private readonly holdsService;
    private readonly depositsService;
    constructor(settingsService: OnlineBookingSettingsService, rulesService: ClientBookingRulesService, holdsService: AppointmentHoldsService, depositsService: DepositsService);
    /**
     * Obtém configurações de booking online do salão
     */
    getSettings(req: any): Promise<import("./dto").OnlineBookingSettingsResponse>;
    /**
     * Atualiza configurações de booking online
     */
    updateSettings(req: any, dto: UpdateOnlineBookingSettingsDto): Promise<import("./dto").OnlineBookingSettingsResponse>;
    /**
     * Habilita/desabilita booking online
     */
    toggleBooking(req: any, body: {
        enabled: boolean;
    }): Promise<import("./dto").OnlineBookingSettingsResponse>;
    /**
     * Gera link assistido para Alexis enviar ao cliente
     * Usado quando Alexis precisa enviar um link de agendamento pré-preenchido
     */
    generateAssistedLink(req: any, dto: Omit<GenerateAssistedLinkDto, 'salonId'>): Promise<import("./dto").AssistedLinkResponse>;
    /**
     * Lista todas as regras de clientes
     */
    listRules(req: any, includeInactive?: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        startsAt: Date;
        clientId: string | null;
        clientPhone: string | null;
        createdById: string;
        reason: string | null;
        expiresAt: Date | null;
        ruleType: "BLOCKED" | "VIP_ONLY" | "DEPOSIT_REQUIRED" | "RESTRICTED_SERVICES";
        restrictedServiceIds: number[] | null;
    }[]>;
    /**
     * Cria uma nova regra para cliente
     */
    createRule(req: any, dto: CreateClientBookingRuleDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        startsAt: Date;
        clientId: string | null;
        clientPhone: string | null;
        createdById: string;
        reason: string | null;
        expiresAt: Date | null;
        ruleType: "BLOCKED" | "VIP_ONLY" | "DEPOSIT_REQUIRED" | "RESTRICTED_SERVICES";
        restrictedServiceIds: number[] | null;
    }>;
    /**
     * Atualiza uma regra
     */
    updateRule(req: any, ruleId: string, dto: UpdateClientBookingRuleDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        startsAt: Date;
        clientId: string | null;
        clientPhone: string | null;
        createdById: string;
        reason: string | null;
        expiresAt: Date | null;
        ruleType: "BLOCKED" | "VIP_ONLY" | "DEPOSIT_REQUIRED" | "RESTRICTED_SERVICES";
        restrictedServiceIds: number[] | null;
    }>;
    /**
     * Remove uma regra
     */
    deleteRule(req: any, ruleId: string): Promise<{
        message: string;
    }>;
    /**
     * Lista clientes bloqueados
     */
    listBlockedClients(req: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        startsAt: Date;
        clientId: string | null;
        clientPhone: string | null;
        createdById: string;
        reason: string | null;
        expiresAt: Date | null;
        ruleType: "BLOCKED" | "VIP_ONLY" | "DEPOSIT_REQUIRED" | "RESTRICTED_SERVICES";
        restrictedServiceIds: number[] | null;
    }[]>;
    /**
     * Bloqueia um cliente
     */
    blockClient(req: any, body: {
        phone?: string;
        clientId?: string;
        reason: string;
        expiresAt?: string;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        startsAt: Date;
        clientId: string | null;
        clientPhone: string | null;
        createdById: string;
        reason: string | null;
        expiresAt: Date | null;
        ruleType: "BLOCKED" | "VIP_ONLY" | "DEPOSIT_REQUIRED" | "RESTRICTED_SERVICES";
        restrictedServiceIds: number[] | null;
    }>;
    /**
     * Desbloqueia um cliente
     */
    unblockClient(req: any, body: {
        phone?: string;
        clientId?: string;
    }): Promise<{
        message: string;
    }>;
    /**
     * Lista holds ativos
     */
    listActiveHolds(_req: any, _date?: string): Promise<{
        message: string;
    }>;
    /**
     * Libera um hold manualmente
     */
    releaseHold(req: any, holdId: string): Promise<{
        message: string;
    }>;
    /**
     * Limpa holds expirados manualmente
     */
    cleanupHolds(): Promise<{
        message: string;
    }>;
    /**
     * Lista depósitos pendentes
     */
    listPendingDeposits(_req: any): Promise<{
        message: string;
    }>;
    /**
     * Confirma pagamento de depósito manualmente
     */
    confirmDeposit(req: any, depositId: string, body: {
        paymentMethod: string;
        paymentReference?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        status: "PENDING" | "PAID" | "REFUNDED" | "FORFEITED";
        notes: string | null;
        paymentMethod: "MANUAL" | "PIX" | "CARD" | "BOLETO" | "TRANSFER" | null;
        mercadoPagoPaymentId: string | null;
        pixQrCodeBase64: string | null;
        paidAt: Date | null;
        amount: string;
        clientId: string | null;
        holdId: string | null;
        appointmentId: string | null;
        expiresAt: Date | null;
        paymentReference: string | null;
        pixCode: string | null;
        refundedAt: Date | null;
        forfeitedAt: Date | null;
    }>;
    /**
     * Reembolsa um depósito
     */
    refundDeposit(req: any, depositId: string, body: {
        reason?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        status: "PENDING" | "PAID" | "REFUNDED" | "FORFEITED";
        notes: string | null;
        paymentMethod: "MANUAL" | "PIX" | "CARD" | "BOLETO" | "TRANSFER" | null;
        mercadoPagoPaymentId: string | null;
        pixQrCodeBase64: string | null;
        paidAt: Date | null;
        amount: string;
        clientId: string | null;
        holdId: string | null;
        appointmentId: string | null;
        expiresAt: Date | null;
        paymentReference: string | null;
        pixCode: string | null;
        refundedAt: Date | null;
        forfeitedAt: Date | null;
    }>;
    /**
     * Obtém estatísticas de agendamento online
     */
    getStats(_req: any, startDate?: string, endDate?: string): Promise<{
        message: string;
        period: {
            startDate: string | undefined;
            endDate: string | undefined;
        };
    }>;
}
//# sourceMappingURL=admin-booking.controller.d.ts.map