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
exports.CalendarController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let CalendarController = (() => {
    let _classDecorators = [(0, common_1.Controller)('calendar'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _isConfigured_decorators;
    let _getConnectUrl_decorators;
    let _handleCallback_decorators;
    let _disconnect_decorators;
    let _getStatus_decorators;
    let _getAllStatuses_decorators;
    let _updateSettings_decorators;
    let _listCalendars_decorators;
    let _sync_decorators;
    let _getSyncLogs_decorators;
    let _getConflicts_decorators;
    let _resolveConflict_decorators;
    let _resolveConflictsBulk_decorators;
    var CalendarController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _isConfigured_decorators = [(0, common_1.Get)('google/configured')];
            _getConnectUrl_decorators = [(0, common_1.Get)('google/connect-url'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST')];
            _handleCallback_decorators = [(0, common_1.Get)('google/callback')];
            _disconnect_decorators = [(0, common_1.Post)('google/disconnect'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST')];
            _getStatus_decorators = [(0, common_1.Get)('google/status'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST')];
            _getAllStatuses_decorators = [(0, common_1.Get)('google/status/all'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _updateSettings_decorators = [(0, common_1.Patch)('google/settings'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST')];
            _listCalendars_decorators = [(0, common_1.Get)('google/calendars'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST')];
            _sync_decorators = [(0, common_1.Post)('google/sync'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST')];
            _getSyncLogs_decorators = [(0, common_1.Get)('google/sync-logs'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST')];
            _getConflicts_decorators = [(0, common_1.Get)('google/conflicts'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST')];
            _resolveConflict_decorators = [(0, common_1.Post)('google/conflicts/resolve'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST')];
            _resolveConflictsBulk_decorators = [(0, common_1.Post)('google/conflicts/resolve-bulk'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST')];
            __esDecorate(this, null, _isConfigured_decorators, { kind: "method", name: "isConfigured", static: false, private: false, access: { has: obj => "isConfigured" in obj, get: obj => obj.isConfigured }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getConnectUrl_decorators, { kind: "method", name: "getConnectUrl", static: false, private: false, access: { has: obj => "getConnectUrl" in obj, get: obj => obj.getConnectUrl }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleCallback_decorators, { kind: "method", name: "handleCallback", static: false, private: false, access: { has: obj => "handleCallback" in obj, get: obj => obj.handleCallback }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _disconnect_decorators, { kind: "method", name: "disconnect", static: false, private: false, access: { has: obj => "disconnect" in obj, get: obj => obj.disconnect }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStatus_decorators, { kind: "method", name: "getStatus", static: false, private: false, access: { has: obj => "getStatus" in obj, get: obj => obj.getStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAllStatuses_decorators, { kind: "method", name: "getAllStatuses", static: false, private: false, access: { has: obj => "getAllStatuses" in obj, get: obj => obj.getAllStatuses }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateSettings_decorators, { kind: "method", name: "updateSettings", static: false, private: false, access: { has: obj => "updateSettings" in obj, get: obj => obj.updateSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listCalendars_decorators, { kind: "method", name: "listCalendars", static: false, private: false, access: { has: obj => "listCalendars" in obj, get: obj => obj.listCalendars }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sync_decorators, { kind: "method", name: "sync", static: false, private: false, access: { has: obj => "sync" in obj, get: obj => obj.sync }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSyncLogs_decorators, { kind: "method", name: "getSyncLogs", static: false, private: false, access: { has: obj => "getSyncLogs" in obj, get: obj => obj.getSyncLogs }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getConflicts_decorators, { kind: "method", name: "getConflicts", static: false, private: false, access: { has: obj => "getConflicts" in obj, get: obj => obj.getConflicts }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resolveConflict_decorators, { kind: "method", name: "resolveConflict", static: false, private: false, access: { has: obj => "resolveConflict" in obj, get: obj => obj.resolveConflict }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resolveConflictsBulk_decorators, { kind: "method", name: "resolveConflictsBulk", static: false, private: false, access: { has: obj => "resolveConflictsBulk" in obj, get: obj => obj.resolveConflictsBulk }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CalendarController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        googleCalendarService = __runInitializers(this, _instanceExtraInitializers);
        calendarSyncService;
        constructor(googleCalendarService, calendarSyncService) {
            this.googleCalendarService = googleCalendarService;
            this.calendarSyncService = calendarSyncService;
        }
        // ==================== CONEXÃO GOOGLE ====================
        /**
         * Verifica se Google Calendar está configurado
         */
        isConfigured() {
            return { configured: this.googleCalendarService.isConfigured() };
        }
        /**
         * Gera URL de autenticação OAuth
         */
        getConnectUrl(user, query) {
            const professionalId = query.professionalId || user.id;
            // Estado contém informações para o callback
            const state = Buffer.from(JSON.stringify({
                salonId: user.salonId,
                professionalId,
                calendarId: query.calendarId || 'primary',
                syncDirection: query.syncDirection || 'GOOGLE_TO_APP',
                userId: user.id,
            })).toString('base64');
            const url = this.googleCalendarService.getAuthUrl(state);
            return { url };
        }
        /**
         * Callback OAuth - Processa retorno do Google
         */
        async handleCallback(code, state, error, res) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            if (error) {
                res.redirect(`${frontendUrl}/integracoes?error=${encodeURIComponent(error)}`);
                return;
            }
            if (!code || !state) {
                res.redirect(`${frontendUrl}/integracoes?error=missing_params`);
                return;
            }
            try {
                // Decodifica state
                const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
                const { salonId, professionalId, calendarId, syncDirection } = stateData;
                // Troca código por tokens
                const tokens = await this.googleCalendarService.exchangeCodeForTokens(code);
                // Obtém email do Google
                const userInfo = await this.googleCalendarService.getUserInfo(tokens.access_token);
                // Salva integração
                await this.googleCalendarService.saveIntegration(salonId, professionalId, userInfo.email, tokens, calendarId, syncDirection);
                res.redirect(`${frontendUrl}/integracoes?success=true&email=${encodeURIComponent(userInfo.email)}`);
            }
            catch (err) {
                console.error('OAuth callback error:', err);
                const message = err instanceof Error ? err.message : 'unknown_error';
                res.redirect(`${frontendUrl}/integracoes?error=${encodeURIComponent(message)}`);
            }
        }
        /**
         * Desconecta integração Google
         */
        async disconnect(user, professionalId) {
            const targetProfessionalId = professionalId || user.id;
            // Verifica permissão (owner/manager podem desconectar qualquer um, stylist só si mesmo)
            if (user.role === 'STYLIST' && targetProfessionalId !== user.id) {
                throw new common_1.BadRequestException('Você só pode desconectar sua própria conta.');
            }
            await this.googleCalendarService.disconnectIntegration(user.salonId, targetProfessionalId);
            return { success: true };
        }
        // ==================== STATUS ====================
        /**
         * Status da integração do usuário atual ou profissional específico
         */
        async getStatus(user, professionalId) {
            const targetProfessionalId = professionalId || user.id;
            return this.calendarSyncService.getIntegrationStatus(user.salonId, targetProfessionalId);
        }
        /**
         * Status de todas as integrações do salão
         */
        async getAllStatuses(user) {
            return this.calendarSyncService.getAllIntegrationStatuses(user.salonId);
        }
        // ==================== CONFIGURAÇÕES ====================
        /**
         * Atualiza configurações da integração
         */
        async updateSettings(user, dto, professionalId) {
            const targetProfessionalId = professionalId || user.id;
            // Verifica permissão
            if (user.role === 'STYLIST' && targetProfessionalId !== user.id) {
                throw new common_1.BadRequestException('Você só pode alterar suas próprias configurações.');
            }
            const integration = await this.googleCalendarService.getIntegration(user.salonId, targetProfessionalId);
            if (!integration) {
                throw new common_1.BadRequestException('Integração não encontrada.');
            }
            return this.googleCalendarService.updateSettings(integration.id, dto);
        }
        /**
         * Lista calendários disponíveis na conta Google
         */
        async listCalendars(user, professionalId) {
            const targetProfessionalId = professionalId || user.id;
            const integration = await this.googleCalendarService.getIntegration(user.salonId, targetProfessionalId);
            if (!integration) {
                throw new common_1.BadRequestException('Integração não encontrada.');
            }
            const accessToken = await this.googleCalendarService.getValidAccessToken(integration);
            return this.googleCalendarService.listCalendars(accessToken);
        }
        // ==================== SINCRONIZAÇÃO ====================
        /**
         * Executa sincronização manual
         */
        async sync(user, dto) {
            const professionalId = dto.professionalId || user.id;
            // Verifica permissão
            if (user.role === 'STYLIST' && professionalId !== user.id) {
                throw new common_1.BadRequestException('Você só pode sincronizar sua própria agenda.');
            }
            return this.calendarSyncService.manualSync(user.salonId, professionalId, dto.fullSync);
        }
        /**
         * Logs de sincronização
         */
        async getSyncLogs(user, professionalId, limit) {
            const targetProfessionalId = user.role === 'STYLIST' ? user.id : professionalId || undefined;
            return this.calendarSyncService.getSyncLogs(user.salonId, targetProfessionalId, limit ? parseInt(limit, 10) : 20);
        }
        // ==================== CONFLITOS ====================
        /**
         * Lista conflitos pendentes
         */
        async getConflicts(user, professionalId) {
            const targetProfessionalId = user.role === 'STYLIST' ? user.id : professionalId || undefined;
            return this.calendarSyncService.getConflicts(user.salonId, targetProfessionalId);
        }
        /**
         * Resolve um conflito
         */
        async resolveConflict(user, dto) {
            await this.calendarSyncService.resolveConflict(dto.conflictId, dto.resolution, user.id);
            return { success: true };
        }
        /**
         * Resolve múltiplos conflitos
         */
        async resolveConflictsBulk(user, dto) {
            for (const conflictId of dto.conflictIds) {
                await this.calendarSyncService.resolveConflict(conflictId, dto.resolution, user.id);
            }
            return { success: true, resolved: dto.conflictIds.length };
        }
    };
    return CalendarController = _classThis;
})();
exports.CalendarController = CalendarController;
//# sourceMappingURL=calendar.controller.js.map