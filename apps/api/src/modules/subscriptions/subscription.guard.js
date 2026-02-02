"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionGuard = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../../common/decorators/public.decorator");
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
let SubscriptionGuard = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SubscriptionGuard = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SubscriptionGuard = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        reflector;
        subscriptionsService;
        logger = new common_1.Logger(SubscriptionGuard.name);
        constructor(reflector, subscriptionsService) {
            this.reflector = reflector;
            this.subscriptionsService = subscriptionsService;
        }
        async canActivate(context) {
            // Verifica se a rota é pública (via decorator @Public())
            const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            if (isPublic) {
                return true;
            }
            const request = context.switchToHttp().getRequest();
            const user = request.user;
            const path = (request.url ?? request.raw?.url ?? request.path ?? '');
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
            let subscriptionStatus;
            try {
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('SUBSCRIPTION_CHECK_TIMEOUT')), SUBSCRIPTION_CHECK_TIMEOUT);
                });
                subscriptionStatus = await Promise.race([
                    this.subscriptionsService.isSubscriptionValid(user.salonId),
                    timeoutPromise,
                ]);
            }
            catch (error) {
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
            throw new common_1.ForbiddenException({
                statusCode: 403,
                error: 'SUBSCRIPTION_INVALID',
                status: subscriptionStatus.status,
                message: subscriptionStatus.message,
                daysRemaining: subscriptionStatus.daysRemaining,
                canAccess: subscriptionStatus.canAccess,
                allowedRoutes: ALLOWED_ROUTES_WHEN_SUSPENDED,
            });
        }
    };
    return SubscriptionGuard = _classThis;
})();
exports.SubscriptionGuard = SubscriptionGuard;
//# sourceMappingURL=subscription.guard.js.map