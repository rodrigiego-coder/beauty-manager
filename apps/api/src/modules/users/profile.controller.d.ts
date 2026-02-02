import { UsersService } from './users.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto';
interface AuthUser {
    id: string;
    email: string;
    role: string;
    salonId: string;
}
export declare class ProfileController {
    private readonly usersService;
    constructor(usersService: UsersService);
    /**
     * GET /profile
     * Retorna o perfil do usuario logado
     */
    getProfile(user: AuthUser): Promise<{
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
     * PATCH /profile
     * Atualiza o perfil do usuario logado
     */
    updateProfile(user: AuthUser, data: UpdateProfileDto): Promise<{
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
     * POST /profile/change-password
     * Altera a senha do usuario logado
     */
    changePassword(user: AuthUser, data: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
//# sourceMappingURL=profile.controller.d.ts.map