import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
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

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private subscriptionsService: SalonSubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    // Verifica a assinatura do salao
    const subscriptionStatus = await this.subscriptionsService.isSubscriptionValid(user.salonId);

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
