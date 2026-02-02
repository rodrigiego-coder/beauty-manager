import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
/**
 * Guard para garantir que o usuário só acesse dados do seu próprio salão
 * Implementa isolamento de dados multi-tenant
 */
export declare class SalonAccessGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=salon-access.guard.d.ts.map