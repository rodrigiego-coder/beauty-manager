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
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
/**
 * Entidades que devem ser auditadas automaticamente
 */
const AUDITED_ENTITIES = [
    'clients',
    'products',
    'transactions',
    'appointments',
    'accounts-payable',
    'accounts-receivable',
    'users',
    'packages',
    'client-packages',
];
/**
 * Mapeia métodos HTTP para ações de auditoria
 */
const METHOD_ACTION_MAP = {
    POST: 'CREATE',
    PATCH: 'UPDATE',
    PUT: 'UPDATE',
    DELETE: 'DELETE',
};
/**
 * Interceptor global que registra todas as ações de criação, atualização e exclusão
 * nas entidades principais do sistema para garantir rastreabilidade total.
 */
let AuditInterceptor = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuditInterceptor = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuditInterceptor = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        auditService;
        constructor(auditService) {
            this.auditService = auditService;
        }
        intercept(context, next) {
            const request = context.switchToHttp().getRequest();
            const method = request.method;
            const url = request.url;
            // Verifica se é um método que deve ser auditado
            const action = METHOD_ACTION_MAP[method];
            if (!action) {
                return next.handle();
            }
            // Extrai a entidade da URL (ex: /clients/123 -> clients)
            const entity = this.extractEntityFromUrl(url);
            if (!entity || !AUDITED_ENTITIES.includes(entity)) {
                return next.handle();
            }
            // Captura dados antes da execução
            const entityId = this.extractEntityIdFromUrl(url);
            const oldValues = request.body?._oldValues; // Pode ser passado pelo controller
            const newValues = action !== 'DELETE' ? request.body : undefined;
            // Remove _oldValues do body se existir
            if (request.body?._oldValues) {
                delete request.body._oldValues;
            }
            // Extrai informações do usuário e request
            const userId = request.user?.id; // Do JWT quando implementado
            const salonId = request.body?.salonId || request.params?.salonId || request.query?.salonId;
            const ipAddress = this.getClientIp(request);
            const userAgent = request.headers['user-agent'];
            return next.handle().pipe((0, operators_1.tap)({
                next: async (response) => {
                    // Captura o ID da entidade criada/atualizada
                    const responseId = response?.id;
                    const finalEntityId = entityId || responseId?.toString() || 'unknown';
                    try {
                        await this.auditService.log({
                            salonId,
                            userId,
                            action,
                            entity,
                            entityId: finalEntityId,
                            oldValues: action === 'CREATE' ? undefined : oldValues,
                            newValues: action === 'DELETE' ? undefined : (response || newValues),
                            ipAddress,
                            userAgent,
                        });
                    }
                    catch (error) {
                        // Log de erro mas não falha a requisição principal
                        console.error('[AuditInterceptor] Falha ao registrar auditoria:', error);
                    }
                },
                error: () => {
                    // Não registra auditoria em caso de erro na operação principal
                },
            }));
        }
        /**
         * Extrai o nome da entidade da URL
         */
        extractEntityFromUrl(url) {
            // Remove query string
            const path = url.split('?')[0];
            // Extrai primeiro segmento após /
            const segments = path.split('/').filter(Boolean);
            return segments[0] || null;
        }
        /**
         * Extrai o ID da entidade da URL (se existir)
         */
        extractEntityIdFromUrl(url) {
            const path = url.split('?')[0];
            const segments = path.split('/').filter(Boolean);
            // Retorna o segundo segmento se existir (ex: /clients/123 -> 123)
            return segments.length > 1 ? segments[1] : null;
        }
        /**
         * Obtém o IP do cliente considerando proxies
         */
        getClientIp(request) {
            const req = request;
            const forwarded = req.headers?.['x-forwarded-for'];
            if (forwarded) {
                const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
                return ip?.trim();
            }
            return req.ip || req.connection?.remoteAddress;
        }
    };
    return AuditInterceptor = _classThis;
})();
exports.AuditInterceptor = AuditInterceptor;
//# sourceMappingURL=audit.interceptor.js.map