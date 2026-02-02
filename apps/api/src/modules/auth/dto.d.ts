/**
 * DTO para login
 */
export declare class LoginDto {
    email: string;
    password: string;
}
/**
 * DTO para refresh token
 */
export declare class RefreshTokenDto {
    refreshToken: string;
}
/**
 * DTO para logout
 */
export declare class LogoutDto {
    refreshToken: string;
}
/**
 * DTO para criar senha via token
 */
export declare class CreatePasswordDto {
    token: string;
    password: string;
}
/**
 * DTO para signup (cadastro público)
 */
export declare class SignupDto {
    salonName: string;
    ownerName: string;
    email: string;
    phone: string;
    password: string;
    planId?: string;
}
//# sourceMappingURL=dto.d.ts.map