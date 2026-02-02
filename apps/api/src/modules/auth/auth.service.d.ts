import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { UsersService } from '../users/users.service';
import { SalonsService } from '../salons/salons.service';
import { SalonSubscriptionsService } from '../subscriptions/salon-subscriptions.service';
import { SignupDto } from './dto';
import * as schema from '../../database/schema';
export declare class AuthService {
    private readonly usersService;
    private readonly salonsService;
    private readonly subscriptionsService;
    private readonly jwtService;
    private readonly db;
    constructor(usersService: UsersService, salonsService: SalonsService, subscriptionsService: SalonSubscriptionsService, jwtService: JwtService, db: NodePgDatabase<typeof schema>);
    /**
     * Realiza o login com validação real no banco de dados
     */
    login(email: string, password: string): Promise<{
        message: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
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
            workSchedule: schema.WorkSchedule | null;
            specialties: string | null;
            passwordResetToken: string | null;
            passwordResetExpires: Date | null;
        };
    }>;
    /**
     * Renova o access token usando o refresh token
     */
    refreshToken(refreshToken: string): Promise<{
        message: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    /**
     * Realiza o logout invalidando o refresh token
     */
    logout(refreshToken: string, userId: string): Promise<{
        message: string;
    }>;
    /**
     * Cria senha usando token recebido via WhatsApp
     * Valida token, verifica expiração e define a senha
     */
    createPassword(token: string, password: string): Promise<{
        message: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
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
            workSchedule: schema.WorkSchedule | null;
            specialties: string | null;
        };
    }>;
    /**
     * Valida se um token de criação de senha é válido (sem criar a senha)
     */
    validatePasswordToken(token: string): Promise<{
        valid: boolean;
        userName?: string;
    }>;
    /**
     * Realiza o signup (cadastro público) de um novo salão
     * Cria: Salão + Usuário OWNER + Assinatura Trial
     */
    signup(dto: SignupDto): Promise<{
        message: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
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
            workSchedule: schema.WorkSchedule | null;
            specialties: string | null;
        };
        salon: {
            id: string;
            name: string;
            slug: string | null;
        };
        subscription: {
            id: string;
            status: string;
            trialEndsAt: Date | null;
        };
    }>;
    /**
     * Gera um slug único baseado no nome do salão
     */
    private generateUniqueSlug;
    /**
     * Verifica se um token está na blacklist
     */
    private isTokenBlacklisted;
    /**
     * Gera access token e refresh token
     */
    private generateTokens;
}
//# sourceMappingURL=auth.service.d.ts.map