import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto';
import { ClientBookingRulesService } from '../online-booking/client-booking-rules.service';
/** User payload from JWT token */
interface CurrentUserPayload {
    id: string;
    salonId: string;
    role: string;
}
export declare class ClientsController {
    private readonly clientsService;
    private readonly bookingRulesService;
    constructor(clientsService: ClientsService, bookingRulesService: ClientBookingRulesService);
    /**
     * GET /clients
     * Lista todos os clientes do salão
     */
    findAll(user: CurrentUserPayload, search?: string, includeInactive?: string, requiresDeposit?: string): Promise<{
        requiresDeposit: boolean;
        blockedFromOnline: boolean;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string;
        email: string | null;
        salonId: string | null;
        birthDate: string | null;
        aiActive: boolean;
        technicalNotes: string | null;
        preferences: string | null;
        lastVisitDate: string | null;
        totalVisits: number;
        churnRisk: boolean;
    }[]>;
    /**
     * GET /clients/stats
     * Retorna estatísticas dos clientes
     */
    getStats(user: CurrentUserPayload): Promise<import("./clients.service").ClientStats>;
    /**
     * GET /clients/search?term=xxx
     * Busca clientes por termo
     */
    search(user: CurrentUserPayload, term: string, includeInactive?: string): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string;
        email: string | null;
        salonId: string | null;
        birthDate: string | null;
        aiActive: boolean;
        technicalNotes: string | null;
        preferences: string | null;
        lastVisitDate: string | null;
        totalVisits: number;
        churnRisk: boolean;
    }[]>;
    /**
     * GET /clients/:id
     * Busca cliente por ID
     */
    findById(id: string, user: CurrentUserPayload): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string;
        email: string | null;
        salonId: string | null;
        birthDate: string | null;
        aiActive: boolean;
        technicalNotes: string | null;
        preferences: string | null;
        lastVisitDate: string | null;
        totalVisits: number;
        churnRisk: boolean;
    }>;
    /**
     * GET /clients/:id/history
     * Retorna histórico de comandas do cliente
     */
    getHistory(id: string, user: CurrentUserPayload): Promise<import("./clients.service").ClientHistory>;
    /**
     * POST /clients
     * Cria um novo cliente
     */
    create(user: CurrentUserPayload, data: CreateClientDto): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string;
        email: string | null;
        salonId: string | null;
        birthDate: string | null;
        aiActive: boolean;
        technicalNotes: string | null;
        preferences: string | null;
        lastVisitDate: string | null;
        totalVisits: number;
        churnRisk: boolean;
    }>;
    /**
     * PATCH /clients/:id
     * Atualiza um cliente
     */
    update(id: string, user: CurrentUserPayload, data: UpdateClientDto): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string;
        email: string | null;
        salonId: string | null;
        birthDate: string | null;
        aiActive: boolean;
        technicalNotes: string | null;
        preferences: string | null;
        lastVisitDate: string | null;
        totalVisits: number;
        churnRisk: boolean;
    } | null>;
    /**
     * PATCH /clients/:id/reactivate
     * Reativa um cliente desativado
     */
    reactivate(id: string, user: CurrentUserPayload): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string;
        email: string | null;
        salonId: string | null;
        birthDate: string | null;
        aiActive: boolean;
        technicalNotes: string | null;
        preferences: string | null;
        lastVisitDate: string | null;
        totalVisits: number;
        churnRisk: boolean;
    } | null>;
    /**
     * DELETE /clients/:id
     * Desativa um cliente (soft delete)
     */
    delete(id: string, user: CurrentUserPayload): Promise<{
        message: string;
    }>;
    /**
     * PATCH /clients/:id/toggle-ai
     * Alterna o status da IA para o cliente
     */
    toggleAi(id: string, user: CurrentUserPayload): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string;
        email: string | null;
        salonId: string | null;
        birthDate: string | null;
        aiActive: boolean;
        technicalNotes: string | null;
        preferences: string | null;
        lastVisitDate: string | null;
        totalVisits: number;
        churnRisk: boolean;
    } | null>;
    /**
     * GET /clients/:id/booking-rules
     * Retorna regras de agendamento online para o cliente
     */
    getBookingRules(id: string, user: CurrentUserPayload): Promise<{
        requiresDeposit: boolean;
        blockedFromOnline: boolean;
        depositNotes: string;
        blockNotes: string;
        rules: {
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
        }[];
    }>;
    /**
     * PATCH /clients/:id/booking-rules
     * Atualiza regras de agendamento online para o cliente
     */
    updateBookingRules(id: string, user: CurrentUserPayload, body: {
        requiresDeposit?: boolean;
        blockedFromOnline?: boolean;
        depositNotes?: string;
        blockNotes?: string;
    }): Promise<{
        requiresDeposit: boolean;
        blockedFromOnline: boolean;
        depositNotes: string;
        blockNotes: string;
        rules: {
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
        }[];
    }>;
    /**
     * GET /clients/with-deposit-rule
     * Lista clientes que tem regra de deposito obrigatorio
     */
    getClientsWithDepositRule(user: CurrentUserPayload): Promise<({
        depositNotes: string | null | undefined;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string;
        email: string | null;
        salonId: string | null;
        birthDate: string | null;
        aiActive: boolean;
        technicalNotes: string | null;
        preferences: string | null;
        lastVisitDate: string | null;
        totalVisits: number;
        churnRisk: boolean;
    } | null)[]>;
}
export {};
//# sourceMappingURL=clients.controller.d.ts.map