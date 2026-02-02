import { TeamService } from './team.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto';
export declare class TeamController {
    private readonly teamService;
    constructor(teamService: TeamService);
    /**
     * GET /team - Lista membros da equipe
     */
    findAll(user: any, includeInactive?: string): Promise<{
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
        workSchedule: import("../../database").WorkSchedule | null;
        specialties: string | null;
        active: boolean;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    /**
     * GET /team/summary - Resumo da equipe
     */
    getSummary(user: any): Promise<{
        totalActive: number;
        totalStylists: number;
        totalManagers: number;
        totalReceptionists: number;
        pendingCommissionsTotal: number;
    }>;
    /**
     * GET /team/:id - Busca membro por ID
     */
    findById(id: string, user: any): Promise<{
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
        workSchedule: import("../../database").WorkSchedule | null;
        specialties: string | null;
        active: boolean;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * POST /team - Convida novo membro
     */
    invite(data: CreateTeamMemberDto, user: any): Promise<{
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
        workSchedule?: import("../../database").WorkSchedule | null;
        specialties?: string | null;
        passwordResetToken?: string | null;
        passwordResetExpires?: Date | null;
    }>;
    /**
     * PATCH /team/:id - Atualiza membro
     */
    update(id: string, data: UpdateTeamMemberDto, user: any): Promise<{
        id: string;
        salonId: string | null;
        name: string;
        email: string | null;
        passwordHash: string | null;
        phone: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: import("../../database").WorkSchedule | null;
        specialties: string | null;
        active: boolean;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | undefined>;
    /**
     * DELETE /team/:id - Desativa membro
     */
    deactivate(id: string, user: any): Promise<{
        id: string;
        salonId: string | null;
        name: string;
        email: string | null;
        passwordHash: string | null;
        phone: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: import("../../database").WorkSchedule | null;
        specialties: string | null;
        active: boolean;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | undefined>;
    /**
     * PATCH /team/:id/reactivate - Reativa membro
     */
    reactivate(id: string, user: any): Promise<{
        id: string;
        salonId: string | null;
        name: string;
        email: string | null;
        passwordHash: string | null;
        phone: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: import("../../database").WorkSchedule | null;
        specialties: string | null;
        active: boolean;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * GET /team/:id/services - Lista serviços que o profissional realiza
     */
    getServices(id: string, user: any): Promise<{
        serviceId: number;
        enabled: boolean;
        priority: number;
        serviceName: string;
        serviceCategory: "HAIR" | "BARBER" | "NAILS" | "SKIN" | "MAKEUP" | "OTHER";
        servicePrice: string;
    }[]>;
    /**
     * PUT /team/:id/services - Define serviços do profissional (replace all)
     */
    setServices(id: string, body: {
        serviceIds: number[];
    }, user: any): Promise<{
        success: boolean;
        count: number;
    }>;
}
//# sourceMappingURL=team.controller.d.ts.map