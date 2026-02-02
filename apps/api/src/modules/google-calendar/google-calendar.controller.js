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
exports.GoogleCalendarController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let GoogleCalendarController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Google Calendar'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('integrations/google')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getStatus_decorators;
    let _redirectToGoogle_decorators;
    let _getAuthUrl_decorators;
    let _handleCallback_decorators;
    let _syncAppointment_decorators;
    let _syncFromGoogle_decorators;
    let _deleteEvent_decorators;
    let _toggleSync_decorators;
    let _disconnect_decorators;
    var GoogleCalendarController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getStatus_decorators = [(0, common_1.Get)('status'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST'), (0, swagger_1.ApiOperation)({ summary: 'Verificar status da conexão Google Calendar' })];
            _redirectToGoogle_decorators = [(0, common_1.Get)('auth'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST'), (0, swagger_1.ApiOperation)({ summary: 'Iniciar fluxo de autorização Google Calendar' })];
            _getAuthUrl_decorators = [(0, common_1.Get)('auth-url'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST'), (0, swagger_1.ApiOperation)({ summary: 'Obter URL de autorização Google Calendar' })];
            _handleCallback_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('callback'), (0, swagger_1.ApiOperation)({ summary: 'Callback OAuth2 do Google' }), (0, swagger_1.ApiQuery)({ name: 'code', required: true }), (0, swagger_1.ApiQuery)({ name: 'state', required: true })];
            _syncAppointment_decorators = [(0, common_1.Post)('sync'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Sincronizar agendamento com Google Calendar' })];
            _syncFromGoogle_decorators = [(0, common_1.Post)('sync-from-google'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Importar eventos do Google Calendar' })];
            _deleteEvent_decorators = [(0, common_1.Delete)('event'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Remover evento do Google Calendar' })];
            _toggleSync_decorators = [(0, common_1.Post)('toggle-sync'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Ativar/desativar sincronização automática' })];
            _disconnect_decorators = [(0, common_1.Delete)('disconnect'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST'), (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT), (0, swagger_1.ApiOperation)({ summary: 'Desconectar Google Calendar' })];
            __esDecorate(this, null, _getStatus_decorators, { kind: "method", name: "getStatus", static: false, private: false, access: { has: obj => "getStatus" in obj, get: obj => obj.getStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _redirectToGoogle_decorators, { kind: "method", name: "redirectToGoogle", static: false, private: false, access: { has: obj => "redirectToGoogle" in obj, get: obj => obj.redirectToGoogle }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAuthUrl_decorators, { kind: "method", name: "getAuthUrl", static: false, private: false, access: { has: obj => "getAuthUrl" in obj, get: obj => obj.getAuthUrl }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleCallback_decorators, { kind: "method", name: "handleCallback", static: false, private: false, access: { has: obj => "handleCallback" in obj, get: obj => obj.handleCallback }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _syncAppointment_decorators, { kind: "method", name: "syncAppointment", static: false, private: false, access: { has: obj => "syncAppointment" in obj, get: obj => obj.syncAppointment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _syncFromGoogle_decorators, { kind: "method", name: "syncFromGoogle", static: false, private: false, access: { has: obj => "syncFromGoogle" in obj, get: obj => obj.syncFromGoogle }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteEvent_decorators, { kind: "method", name: "deleteEvent", static: false, private: false, access: { has: obj => "deleteEvent" in obj, get: obj => obj.deleteEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _toggleSync_decorators, { kind: "method", name: "toggleSync", static: false, private: false, access: { has: obj => "toggleSync" in obj, get: obj => obj.toggleSync }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _disconnect_decorators, { kind: "method", name: "disconnect", static: false, private: false, access: { has: obj => "disconnect" in obj, get: obj => obj.disconnect }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            GoogleCalendarController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        googleCalendarService = __runInitializers(this, _instanceExtraInitializers);
        constructor(googleCalendarService) {
            this.googleCalendarService = googleCalendarService;
        }
        /**
         * GET /integrations/google/status
         * Verifica status da conexão Google Calendar
         */
        async getStatus(user) {
            return this.googleCalendarService.getConnectionStatus(user.id, user.salonId);
        }
        /**
         * GET /integrations/google/auth
         * Redireciona para autorização do Google
         */
        async redirectToGoogle(user, reply) {
            const url = this.googleCalendarService.getAuthUrl(user.id, user.salonId);
            return reply.redirect(url);
        }
        /**
         * GET /integrations/google/auth-url
         * Retorna a URL de autorização (para uso em popup)
         */
        async getAuthUrl(user) {
            const url = this.googleCalendarService.getAuthUrl(user.id, user.salonId);
            return { url };
        }
        /**
         * GET /integrations/google/callback
         * Callback OAuth2 do Google - PÚBLICO (chamado pelo Google)
         */
        async handleCallback(code, state, error, reply) {
            const frontendUrl = process.env.FRONTEND_URL || 'https://app.agendasalaopro.com.br';
            // Log detalhado para diagnóstico
            console.log('[OAuth Controller] Callback recebido:', {
                hasCode: !!code,
                codeLength: code?.length,
                hasState: !!state,
                stateLength: state?.length,
                error: error || 'none',
            });
            if (error) {
                console.log('[OAuth Controller] Google retornou erro:', error);
                reply?.status(302).redirect(`${frontendUrl}/integracoes?google=error&message=${encodeURIComponent(error)}`);
                return;
            }
            if (!code || !state) {
                console.log('[OAuth Controller] Parâmetros faltando - code:', !!code, 'state:', !!state);
                reply?.status(302).redirect(`${frontendUrl}/integracoes?google=error&message=missing_params`);
                return;
            }
            try {
                const result = await this.googleCalendarService.handleCallback(code, state);
                if (result.success) {
                    reply?.status(302).redirect(`${frontendUrl}/integracoes?google=success&email=${encodeURIComponent(result.email || '')}`);
                }
                else {
                    reply?.status(302).redirect(`${frontendUrl}/integracoes?google=error&message=auth_failed`);
                }
            }
            catch (err) {
                reply?.status(302).redirect(`${frontendUrl}/integracoes?google=error&message=${encodeURIComponent(err?.message || 'unknown')}`);
            }
        }
        /**
         * POST /integrations/google/sync
         * Sincroniza um agendamento específico com Google Calendar
         */
        async syncAppointment(user, body) {
            return this.googleCalendarService.syncAppointmentToGoogle(user.id, user.salonId, body.appointmentId);
        }
        /**
         * POST /integrations/google/sync-from-google
         * Importa eventos do Google Calendar (próximos 30 dias)
         */
        async syncFromGoogle(user) {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);
            return this.googleCalendarService.syncGoogleToSystem(user.id, user.salonId, startDate, endDate);
        }
        /**
         * DELETE /integrations/google/event
         * Remove um evento do Google Calendar
         */
        async deleteEvent(user, body) {
            return this.googleCalendarService.deleteEventFromGoogle(user.id, user.salonId, body.eventId);
        }
        /**
         * POST /integrations/google/toggle-sync
         * Ativa/desativa sincronização automática
         */
        async toggleSync(user, body) {
            await this.googleCalendarService.toggleSync(user.id, user.salonId, body.enabled);
            return { success: true, syncEnabled: body.enabled };
        }
        /**
         * DELETE /integrations/google/disconnect
         * Desconecta o Google Calendar
         */
        async disconnect(user) {
            await this.googleCalendarService.disconnectGoogle(user.id, user.salonId);
        }
    };
    return GoogleCalendarController = _classThis;
})();
exports.GoogleCalendarController = GoogleCalendarController;
//# sourceMappingURL=google-calendar.controller.js.map