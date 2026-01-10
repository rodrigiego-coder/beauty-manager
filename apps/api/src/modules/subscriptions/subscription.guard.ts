import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { SalonSubscriptionsService } from './salon-subscriptions.service';

// Rotas que podem ser acessadas mesmo com assinatura suspensa
const ALLOWED_ROUTES_WHEN_SUSPENDED = [
  '/subscriptions',
  '/subscriptions/current',
  '/subscriptions/status',
  '/subscriptions/plans',
  '/subscriptions/invoices',
  '/subscriptions/change-plan',
  '/subscriptions/reactivate',
  '/mercado-pago',
  '/plans',
];

// Rotas publicas que nao precisam verificar assinatura
const PUBLIC_ROUTES = [
  '/auth',
  '/plans',
  '/health',
];

// Timeout para verificação de assinatura (5 segundos)
const SUBSCRIPTION_CHECK_TIMEOUT = 5000;

@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);

  constructor(
    private reflector: Reflector,
    private subscriptionsService: SalonSubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verifica se a rota é pública (via decorator @Public())
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const path = (request.url ?? request.raw?.url ?? request.path ?? '') as string;

    // Check if route is public
    if (PUBLIC_ROUTES.some(route => path.startsWith(route))) {
      return true;
    }

    // Se nao tem usuario autenticado, deixa o AuthGuard tratar
    if (!user) {
      return true;
    }

    // SUPER_ADMIN bypassa verificacao de assinatura
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Se nao tem salao vinculado, permite
    if (!user.salonId) {
      return true;
    }

    // Verifica a assinatura do salao com timeout para evitar travamento
    let subscriptionStatus: Awaited<ReturnType<typeof this.subscriptionsService.isSubscriptionValid>>;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('SUBSCRIPTION_CHECK_TIMEOUT')), SUBSCRIPTION_CHECK_TIMEOUT);
      });

      subscriptionStatus = await Promise.race([
        this.subscriptionsService.isSubscriptionValid(user.salonId),
        timeoutPromise,
      ]);
    } catch (error) {
      // Se der timeout ou erro na verificação, permite acesso mas loga o problema
      this.logger.warn(`Falha ao verificar assinatura do salão ${user.salonId}: ${error}`);
      // Em caso de erro, permite acesso para não bloquear o usuário
      // O sistema deve funcionar mesmo se a verificação falhar
      request.subscription = { valid: true, status: 'UNKNOWN', daysRemaining: 0, message: 'Verificação indisponível', canAccess: true };
      return true;
    }

    // Adiciona info da assinatura na request
    request.subscription = subscriptionStatus;

    // Se assinatura valida, permite
    if (subscriptionStatus.valid && subscriptionStatus.canAccess) {
      // Adiciona header de aviso se PAST_DUE
      if (subscriptionStatus.status === 'PAST_DUE') {
        request.res?.setHeader('X-Subscription-Warning', 'past_due');
        request.res?.setHeader('X-Subscription-Days-Remaining', subscriptionStatus.daysRemaining);
      }
      return true;
    }

    // Se assinatura invalida, verifica se a rota é permitida
    const isAllowedRoute = ALLOWED_ROUTES_WHEN_SUSPENDED.some(route => path.startsWith(route));

    if (isAllowedRoute) {
      return true;
    }

    // Bloqueia com mensagem apropriada
    throw new ForbiddenException({
      statusCode: 403,
      error: 'SUBSCRIPTION_INVALID',
      status: subscriptionStatus.status,
      message: subscriptionStatus.message,
      daysRemaining: subscriptionStatus.daysRemaining,
      canAccess: subscriptionStatus.canAccess,
      allowedRoutes: ALLOWED_ROUTES_WHEN_SUSPENDED,
    });
  }
}
