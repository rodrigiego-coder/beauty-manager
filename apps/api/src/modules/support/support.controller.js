"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
/**
 * Controller para Suporte Delegado
 * Permite que SUPER_ADMIN acesse temporariamente um salão específico
 */
let SupportController = (() => {
    let _classDecorators = [(0, common_1.Controller)('support'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('SUPER_ADMIN')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createSupportSession_decorators;
    let _consumeToken_decorators;
    let _listSessions_decorators;
    let _revokeSession_decorators;
    var SupportController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _createSupportSession_decorators = [(0, common_1.Post)('impersonate')];
            _consumeToken_decorators = [(0, common_1.Post)('consume-token')];
            _listSessions_decorators = [(0, common_1.Get)('sessions')];
            _revokeSession_decorators = [(0, common_1.Delete)('sessions/:id')];
            __esDecorate(this, null, _createSupportSession_decorators, { kind: "method", name: "createSupportSession", static: false, private: false, access: { has: obj => "createSupportSession" in obj, get: obj => obj.createSupportSession }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _consumeToken_decorators, { kind: "method", name: "consumeToken", static: false, private: false, access: { has: obj => "consumeToken" in obj, get: obj => obj.consumeToken }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listSessions_decorators, { kind: "method", name: "listSessions", static: false, private: false, access: { has: obj => "listSessions" in obj, get: obj => obj.listSessions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _revokeSession_decorators, { kind: "method", name: "revokeSession", static: false, private: false, access: { has: obj => "revokeSession" in obj, get: obj => obj.revokeSession }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SupportController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        supportService = __runInitializers(this, _instanceExtraInitializers);
        constructor(supportService) {
            this.supportService = supportService;
        }
        /**
         * POST /support/impersonate
         * Gera um token de suporte para acessar um salão específico
         *
         * @param body - { salonId: string, reason: string }
         * @returns { sessionId, token, expiresAt, salonName }
         */
        async createSupportSession(body, adminUserId, request) {
            return this.supportService.createSession(adminUserId, body.salonId, body.reason, request.ip || request.connection?.remoteAddress, request.headers['user-agent']);
        }
        /**
         * POST /support/consume-token
         * Consome o token e retorna JWT com actingAsSalonId
         *
         * @param body - { token: string }
         * @returns { accessToken, expiresIn, salonId, salonName }
         */
        async consumeToken(body, adminUserId, request) {
            return this.supportService.consumeToken(body.token, adminUserId, request.ip || request.connection?.remoteAddress, request.headers['user-agent']);
        }
        /**
         * GET /support/sessions
         * Lista sessões de suporte para auditoria
         *
         * @param status - Filtrar por status (PENDING, CONSUMED, EXPIRED, REVOKED)
         * @param limit - Limite de resultados (padrão: 50)
         */
        async listSessions(status, limit) {
            return this.supportService.listSessions({
                status,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
        }
        /**
         * DELETE /support/sessions/:id
         * Revoga uma sessão pendente
         */
        async revokeSession(sessionId, adminUserId, request) {
            await this.supportService.revokeSession(sessionId, adminUserId, request.ip || request.connection?.remoteAddress);
            return { success: true, message: 'Sessão revogada com sucesso' };
        }
    };
    return SupportController = _classThis;
})();
exports.SupportController = SupportController;
//# sourceMappingURL=support.controller.js.map