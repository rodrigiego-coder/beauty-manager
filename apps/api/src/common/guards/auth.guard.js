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
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../decorators/public.decorator");
/**
 * Guard de autenticação JWT
 *
 * Valida o token JWT no header Authorization e adiciona o usuário na requisição
 */
let AuthGuard = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthGuard = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthGuard = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        reflector;
        jwtService;
        constructor(reflector, jwtService) {
            this.reflector = reflector;
            this.jwtService = jwtService;
        }
        async canActivate(context) {
            // Verifica se a rota é pública
            const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            if (isPublic) {
                return true;
            }
            const request = context.switchToHttp().getRequest();
            const token = this.extractTokenFromHeader(request);
            if (!token) {
                throw new common_1.UnauthorizedException('Token não fornecido');
            }
            try {
                const payload = await this.jwtService.verifyAsync(token, {
                    secret: process.env.ACCESS_TOKEN_SECRET || 'SEGREDO_ACESSO_FORTE_AQUI',
                });
                // Verifica se é um access token
                if (payload.type !== 'access') {
                    throw new common_1.UnauthorizedException('Token inválido');
                }
                // Adiciona o usuário na requisição
                request.user = {
                    id: payload.sub,
                    email: payload.email,
                    role: payload.role,
                    salonId: payload.salonId,
                    // Campos para suporte delegado (SUPER_ADMIN)
                    actingAsSalonId: payload.actingAsSalonId || null,
                    supportSessionId: payload.supportSessionId || null,
                };
            }
            catch (error) {
                throw new common_1.UnauthorizedException('Token inválido ou expirado');
            }
            return true;
        }
        extractTokenFromHeader(request) {
            const [type, token] = request.headers.authorization?.split(' ') ?? [];
            return type === 'Bearer' ? token : undefined;
        }
    };
    return AuthGuard = _classThis;
})();
exports.AuthGuard = AuthGuard;
//# sourceMappingURL=auth.guard.js.map