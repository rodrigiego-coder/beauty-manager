import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SalonSubscriptionsService } from './salon-subscriptions.service';
export declare class SubscriptionGuard implements CanActivate {
    private reflector;
    private subscriptionsService;
    private readonly logger;
    constructor(reflector: Reflector, subscriptionsService: SalonSubscriptionsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
//# sourceMappingURL=subscription.guard.d.ts.map