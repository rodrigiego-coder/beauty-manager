import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

/**
 * Guard para verificação de permissões baseadas em roles
 *
 * Hierarquia de permissões:
 * - OWNER: Acesso total ao sistema
 * - MANAGER: Acesso administrativo (exceto configurações críticas)
 * - RECEPTIONIST: Acesso a agendamentos e clientes
 * - STYLIST: Acesso apenas aos próprios agendamentos
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Verifica se a rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Obtém as roles necessárias para acessar o endpoint
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se não há roles definidas, permite acesso (para endpoints sem restrição)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      throw new ForbiddenException(
        'Acesso negado: usuário não autenticado',
      );
    }

    // Verifica se o usuário tem uma das roles necessárias
    const hasRole = requiredRoles.some((role) => user.role === role);

    // OWNER sempre tem acesso total
    if (user.role === 'OWNER') {
      return true;
    }

    if (!hasRole) {
      throw new ForbiddenException(
        `Acesso negado: requer uma das seguintes permissões: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
