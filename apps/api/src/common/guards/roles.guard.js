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
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../decorators/roles.decorator");
const public_decorator_1 = require("../decorators/public.decorator");
/**
 * Guard para verificação de permissões baseadas em roles
 *
 * Hierarquia de permissões:
 * - OWNER: Acesso total ao sistema
 * - MANAGER: Acesso administrativo (exceto configurações críticas)
 * - RECEPTIONIST: Acesso a agendamentos e clientes
 * - STYLIST: Acesso apenas aos próprios agendamentos
 */
let RolesGuard = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RolesGuard = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RolesGuard = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        reflector;
        constructor(reflector) {
            this.reflector = reflector;
        }
        canActivate(context) {
            // Verifica se a rota é pública
            const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            if (isPublic) {
                return true;
            }
            // Obtém as roles necessárias para acessar o endpoint
            const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [context.getHandler(), context.getClass()]);
            // Se não há roles definidas, permite acesso (para endpoints sem restrição)
            if (!requiredRoles || requiredRoles.length === 0) {
                return true;
            }
            const request = context.switchToHttp().getRequest();
            const user = request.user;
            if (!user) {
                throw new common_1.ForbiddenException('Acesso negado: usuário não autenticado');
            }
            // Verifica se o usuário tem uma das roles necessárias
            const hasRole = requiredRoles.some((role) => user.role === role);
            // OWNER sempre tem acesso total
            if (user.role === 'OWNER') {
                return true;
            }
            if (!hasRole) {
                throw new common_1.ForbiddenException(`Acesso negado: requer uma das seguintes permissões: ${requiredRoles.join(', ')}`);
            }
            return true;
        }
    };
    return RolesGuard = _classThis;
})();
exports.RolesGuard = RolesGuard;
//# sourceMappingURL=roles.guard.js.map