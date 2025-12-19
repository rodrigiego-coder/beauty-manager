import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

/**
 * Guard para garantir que o usuário só acesse dados do seu próprio salão
 * Implementa isolamento de dados multi-tenant
 */
@Injectable()
export class SalonAccessGuard implements CanActivate {
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

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      return true; // Deixa o AuthGuard lidar com usuários não autenticados
    }

    // Extrai salonId do request (body, params ou query)
    const requestSalonId =
      request.body?.salonId ||
      request.params?.salonId ||
      request.query?.salonId;

    // Se não há salonId no request, permite (o endpoint pode não precisar)
    if (!requestSalonId) {
      return true;
    }

    // SUPER_ADMIN em modo suporte delegado: só pode acessar o salão selecionado
    if (user.role === 'SUPER_ADMIN' && user.actingAsSalonId) {
      if (user.actingAsSalonId !== requestSalonId) {
        throw new ForbiddenException(
          'Modo suporte: você só pode acessar dados do salão selecionado',
        );
      }
      return true;
    }

    // SUPER_ADMIN sem actingAsSalonId pode acessar qualquer salão (console admin)
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Verifica se o usuário pertence ao salão sendo acessado
    if (user.salonId !== requestSalonId) {
      throw new ForbiddenException(
        'Acesso negado: você não tem permissão para acessar dados deste salão',
      );
    }

    return true;
  }
}
