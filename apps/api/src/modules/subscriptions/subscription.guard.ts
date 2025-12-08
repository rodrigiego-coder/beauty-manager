import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private subscriptionsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Se nao tem usuario autenticado, deixa o AuthGuard tratar
    if (!user) {
      return true;
    }

    // Se nao tem salao vinculado, permite (pode ser admin do sistema)
    if (!user.salonId) {
      return true;
    }

    // Verifica a assinatura do salao
    const subscriptionStatus = await this.subscriptionsService.isSubscriptionValid(user.salonId);

    if (!subscriptionStatus.valid) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'SUBSCRIPTION_INVALID',
        status: subscriptionStatus.status,
        message: subscriptionStatus.message,
        daysRemaining: subscriptionStatus.daysRemaining,
      });
    }

    // Adiciona info da assinatura na request para uso nos controllers
    request.subscription = subscriptionStatus;

    return true;
  }
}