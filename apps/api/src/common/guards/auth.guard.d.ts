import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
/**
 * Guard de autenticação JWT
 *
 * Valida o token JWT no header Authorization e adiciona o usuário na requisição
 */
export declare class AuthGuard implements CanActivate {
    private reflector;
    private jwtService;
    constructor(reflector: Reflector, jwtService: JwtService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
//# sourceMappingURL=auth.guard.d.ts.map