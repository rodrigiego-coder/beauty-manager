import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { CreateClientBookingRuleDto, UpdateClientBookingRuleDto } from './dto';
export interface BookingEligibility {
    canBook: boolean;
    reason?: string;
    requiresDeposit?: boolean;
    restrictedServices?: number[];
    isVipOnly?: boolean;
}
export declare class ClientBookingRulesService {
    private readonly db;
    private readonly logger;
    constructor(db: NodePgDatabase<typeof schema>);
    /**
     * Cria uma regra de booking para um cliente
     */
    createRule(salonId: string, dto: CreateClientBookingRuleDto, createdById: string): Promise<schema.ClientBookingRule>;
    /**
     * Atualiza uma regra de booking
     */
    updateRule(salonId: string, ruleId: string, dto: UpdateClientBookingRuleDto): Promise<schema.ClientBookingRule>;
    /**
     * Remove uma regra
     */
    deleteRule(salonId: string, ruleId: string): Promise<void>;
    /**
     * Desativa uma regra
     */
    deactivateRule(salonId: string, ruleId: string): Promise<void>;
    /**
     * Obtém uma regra pelo ID
     */
    getRule(salonId: string, ruleId: string): Promise<schema.ClientBookingRule | null>;
    /**
     * Lista regras de um salão
     */
    listRules(salonId: string, includeInactive?: boolean): Promise<schema.ClientBookingRule[]>;
    /**
     * Obtém regras ativas para um cliente (por telefone ou ID)
     */
    getActiveRulesForClient(salonId: string, clientPhone?: string, clientId?: string): Promise<schema.ClientBookingRule[]>;
    /**
     * Verifica elegibilidade de um cliente para agendar
     */
    checkBookingEligibility(salonId: string, clientPhone: string, serviceId?: number): Promise<BookingEligibility>;
    /**
     * Bloqueia um cliente para agendamento online
     */
    blockClient(salonId: string, identifier: {
        phone?: string;
        clientId?: string;
    }, reason: string, createdById: string, expiresAt?: string): Promise<schema.ClientBookingRule>;
    /**
     * Desbloqueia um cliente
     */
    unblockClient(salonId: string, identifier: {
        phone?: string;
        clientId?: string;
    }): Promise<void>;
    /**
     * Lista clientes bloqueados
     */
    listBlockedClients(salonId: string): Promise<schema.ClientBookingRule[]>;
    /**
     * Verifica no-shows e bloqueia automaticamente se exceder limite
     */
    checkAndBlockForNoShows(salonId: string, clientPhone: string, maxNoShows: number | undefined, blockDays: number | undefined, createdById: string): Promise<boolean>;
}
//# sourceMappingURL=client-booking-rules.service.d.ts.map