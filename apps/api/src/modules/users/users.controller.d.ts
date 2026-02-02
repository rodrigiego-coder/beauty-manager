import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UpdateWorkScheduleDto, UpdateProfileDto, ChangePasswordDto } from './dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    /**
     * GET /users/me
     * Retorna o perfil do usuario logado
     * (Alias para /profile - mesma logica)
     */
    getMe(user: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string | null;
        email: string | null;
        salonId: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: import("../../database").WorkSchedule | null;
        specialties: string | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
    }>;
    /**
     * PATCH /users/me
     * Atualiza o perfil do usuario logado
     * (Alias para PATCH /profile - mesma logica)
     */
    updateMe(user: AuthenticatedUser, data: UpdateProfileDto): Promise<{
        message: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string | null;
        email: string | null;
        salonId: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: import("../../database").WorkSchedule | null;
        specialties: string | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
    }>;
    /**
     * POST /users/me/change-password
     * Altera a senha do usuario logado
     * (Alias para POST /profile/change-password - mesma logica)
     */
    changeMyPassword(user: AuthenticatedUser, data: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * GET /users
     * Lista usuarios do salão do usuario logado
     */
    findAll(user: AuthenticatedUser, includeInactive?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string | null;
        email: string | null;
        salonId: string | null;
        passwordHash: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: import("../../database").WorkSchedule | null;
        specialties: string | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
    }[]>;
    /**
     * GET /users/professionals
     * Lista apenas profissionais ativos do salão
     */
    findProfessionals(user: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string | null;
        email: string | null;
        salonId: string | null;
        passwordHash: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: import("../../database").WorkSchedule | null;
        specialties: string | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
    }[]>;
    /**
     * GET /users/:id
     * Busca usuario por ID
     */
    findById(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string | null;
        email: string | null;
        salonId: string | null;
        passwordHash: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: import("../../database").WorkSchedule | null;
        specialties: string | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
    }>;
    /**
     * POST /users
     * Cria um novo usuario
     * Se criado sem senha e com telefone, envia link de criacao de senha via WhatsApp
     */
    create(data: CreateUserDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string | null;
        email: string | null;
        salonId: string | null;
        passwordHash: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: import("../../database").WorkSchedule | null;
        specialties: string | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
    } | {
        message: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string | null;
        email: string | null;
        salonId: string | null;
        passwordHash: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: import("../../database").WorkSchedule | null;
        specialties: string | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
    }>;
    /**
     * PATCH /users/:id
     * Atualiza um usuario
     */
    update(id: string, data: UpdateUserDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string | null;
        email: string | null;
        salonId: string | null;
        passwordHash: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: import("../../database").WorkSchedule | null;
        specialties: string | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
    }>;
    /**
     * PATCH /users/:id/schedule
     * Atualiza o horario de trabalho do profissional
     */
    updateSchedule(id: string, schedule: UpdateWorkScheduleDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string | null;
        email: string | null;
        salonId: string | null;
        passwordHash: string | null;
        role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "RECEPTIONIST" | "STYLIST";
        commissionRate: string | null;
        workSchedule: import("../../database").WorkSchedule | null;
        specialties: string | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
    }>;
    /**
     * DELETE /users/:id
     * Desativa um usuario (soft delete)
     */
    deactivate(id: string): Promise<{
        message: string;
    }>;
    /**
     * POST /users/:id/send-password-link
     * Reenvia link de criacao de senha via WhatsApp
     */
    sendPasswordLink(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=users.controller.d.ts.map