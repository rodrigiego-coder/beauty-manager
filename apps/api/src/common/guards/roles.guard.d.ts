import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
/**
 * Guard para verificação de permissões baseadas em roles
 *
 * Hierarquia de permissões:
 * - OWNER: Acesso total ao sistema
 * - MANAGER: Acesso administrativo (exceto configurações críticas)
 * - RECEPTIONIST: Acesso a agendamentos e clientes
 * - STYLIST: Acesso apenas aos próprios agendamentos
 */
export declare class RolesGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=roles.guard.d.ts.map