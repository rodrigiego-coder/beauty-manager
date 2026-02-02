import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto';
export declare class TeamService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    /**
     * Lista todos os membros da equipe do salao com estatisticas
     */
    findAll(salonId: string, includeInactive?: boolean): Promise<{
        stats: {
            appointmentsThisMonth: number;
            revenueThisMonth: number;
            pendingCommissions: number;
            pendingCommissionsCount: number;
        };
        id: string;
        salonId: string | null;
        name: string;
        email: string | null;
        passwordHash: string | null;
        phone: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: schema.WorkSchedule | null;
        specialties: string | null;
        active: boolean;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    /**
     * Busca um membro por ID
     */
    findById(id: string, salonId: string): Promise<{
        stats: {
            appointmentsThisMonth: number;
            revenueThisMonth: number;
            pendingCommissions: number;
            pendingCommissionsCount: number;
        };
        id: string;
        salonId: string | null;
        name: string;
        email: string | null;
        passwordHash: string | null;
        phone: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: schema.WorkSchedule | null;
        specialties: string | null;
        active: boolean;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Convida novo membro (cria usuario e vincula ao salao)
     */
    invite(salonId: string, data: CreateTeamMemberDto): Promise<{
        tempPassword: string;
        id?: string;
        name?: string;
        createdAt?: Date;
        updatedAt?: Date;
        active?: boolean;
        phone?: string | null;
        email?: string | null;
        salonId?: string | null;
        passwordHash?: string | null;
        role?: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate?: string | null;
        workSchedule?: schema.WorkSchedule | null;
        specialties?: string | null;
        passwordResetToken?: string | null;
        passwordResetExpires?: Date | null;
    }>;
    /**
     * Atualiza dados de um membro
     */
    update(id: string, salonId: string, data: UpdateTeamMemberDto): Promise<{
        id: string;
        salonId: string | null;
        name: string;
        email: string | null;
        passwordHash: string | null;
        phone: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: schema.WorkSchedule | null;
        specialties: string | null;
        active: boolean;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | undefined>;
    /**
     * Desativa um membro
     */
    deactivate(id: string, salonId: string): Promise<{
        id: string;
        salonId: string | null;
        name: string;
        email: string | null;
        passwordHash: string | null;
        phone: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: schema.WorkSchedule | null;
        specialties: string | null;
        active: boolean;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | undefined>;
    /**
     * Reativa um membro
     */
    reactivate(id: string, salonId: string): Promise<{
        id: string;
        salonId: string | null;
        name: string;
        email: string | null;
        passwordHash: string | null;
        phone: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: schema.WorkSchedule | null;
        specialties: string | null;
        active: boolean;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Estatisticas do profissional (atendimentos e faturamento do mes)
     */
    getStats(userId: string): Promise<{
        appointmentsThisMonth: number;
        revenueThisMonth: number;
        pendingCommissions: number;
        pendingCommissionsCount: number;
    }>;
    /**
     * Lista serviços atribuídos ao profissional (com dados do serviço)
     */
    getAssignedServices(professionalId: string, salonId: string): Promise<{
        serviceId: number;
        enabled: boolean;
        priority: number;
        serviceName: string;
        serviceCategory: "HAIR" | "BARBER" | "NAILS" | "SKIN" | "MAKEUP" | "OTHER";
        servicePrice: string;
    }[]>;
    /**
     * Define serviços do profissional (replace all).
     * Deleta os existentes e insere os novos.
     */
    setAssignedServices(professionalId: string, salonId: string, serviceIds: number[]): Promise<{
        success: boolean;
        count: number;
    }>;
    /**
     * Resumo geral da equipe
     */
    getSummary(salonId: string): Promise<{
        totalActive: number;
        totalStylists: number;
        totalManagers: number;
        totalReceptionists: number;
        pendingCommissionsTotal: number;
    }>;
}
//# sourceMappingURL=team.service.d.ts.map