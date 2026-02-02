import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, LogoutDto, CreatePasswordDto, SignupDto } from './dto';
import { JwtPayload } from './jwt.strategy';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    /**
     * POST /auth/signup
     * Cadastro publico de novo salao + usuario OWNER
     * Rota publica - nao requer autenticacao
     *
     * RATE LIMIT: 3 por minuto (protege contra spam)
     */
    signup(signupDto: SignupDto): Promise<{
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
            workSchedule: import("../../database").WorkSchedule | null;
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
     * POST /auth/login
     * Realiza o login do usuario
     * Rota publica - nao requer autenticacao
     *
     * RATE LIMIT: 5 tentativas por minuto
     * Protege contra ataques de forca bruta
     */
    login(loginDto: LoginDto): Promise<{
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
            workSchedule: import("../../database").WorkSchedule | null;
            specialties: string | null;
            passwordResetToken: string | null;
            passwordResetExpires: Date | null;
        };
    }>;
    /**
     * POST /auth/refresh
     * Renova o access token usando o refresh token
     * Rota publica - nao requer autenticacao (usa o refresh token)
     *
     * RATE LIMIT: 10 por minuto
     */
    refresh(refreshDto: RefreshTokenDto): Promise<{
        message: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    /**
     * POST /auth/logout
     * Invalida o refresh token (adiciona na blacklist)
     * Requer autenticacao - precisa estar logado
     */
    logout(logoutDto: LogoutDto, user: JwtPayload): Promise<{
        message: string;
    }>;
    /**
     * POST /auth/create-password
     * Cria senha usando token recebido via WhatsApp
     * Rota publica - nao requer autenticacao
     *
     * RATE LIMIT: 5 tentativas por minuto
     * Protege contra ataques de forca bruta
     */
    createPassword(dto: CreatePasswordDto): Promise<{
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
            workSchedule: import("../../database").WorkSchedule | null;
            specialties: string | null;
        };
    }>;
    /**
     * GET /auth/validate-token
     * Valida se um token de criacao de senha eh valido
     * Rota publica - nao requer autenticacao
     *
     * RATE LIMIT: 10 por minuto
     */
    validateToken(token: string): Promise<{
        valid: boolean;
        userName?: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map