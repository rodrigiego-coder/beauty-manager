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
exports.SalonAccessGuard = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../decorators/public.decorator");
/**
 * Guard para garantir que o usuário só acesse dados do seu próprio salão
 * Implementa isolamento de dados multi-tenant
 */
let SalonAccessGuard = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SalonAccessGuard = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SalonAccessGuard = _classThis = _classDescriptor.value;
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
            const request = context.switchToHttp().getRequest();
            const user = request.user;
            if (!user) {
                return true; // Deixa o AuthGuard lidar com usuários não autenticados
            }
            // Extrai salonId do request (body, params ou query)
            const requestSalonId = request.body?.salonId ||
                request.params?.salonId ||
                request.query?.salonId;
            // Se não há salonId no request, permite (o endpoint pode não precisar)
            if (!requestSalonId) {
                return true;
            }
            // SUPER_ADMIN em modo suporte delegado: só pode acessar o salão selecionado
            if (user.role === 'SUPER_ADMIN' && user.actingAsSalonId) {
                if (user.actingAsSalonId !== requestSalonId) {
                    throw new common_1.ForbiddenException('Modo suporte: você só pode acessar dados do salão selecionado');
                }
                return true;
            }
            // SUPER_ADMIN sem actingAsSalonId pode acessar qualquer salão (console admin)
            if (user.role === 'SUPER_ADMIN') {
                return true;
            }
            // Verifica se o usuário pertence ao salão sendo acessado
            if (user.salonId !== requestSalonId) {
                throw new common_1.ForbiddenException('Acesso negado: você não tem permissão para acessar dados deste salão');
            }
            return true;
        }
    };
    return SalonAccessGuard = _classThis;
})();
exports.SalonAccessGuard = SalonAccessGuard;
//# sourceMappingURL=salon-access.guard.js.map