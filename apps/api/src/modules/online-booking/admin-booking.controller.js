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
exports.AdminBookingController = void 0;
const common_1 = require("@nestjs/common");
const guards_1 = require("../../common/guards");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
/**
 * Controller administrativo para gerenciar agendamento online
 * Requer autenticação e permissões de OWNER/MANAGER
 */
let AdminBookingController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('OnlineBooking'), (0, common_1.Controller)('online-booking'), (0, common_1.UseGuards)(guards_1.AuthGuard, guards_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getSettings_decorators;
    let _updateSettings_decorators;
    let _toggleBooking_decorators;
    let _generateAssistedLink_decorators;
    let _listRules_decorators;
    let _createRule_decorators;
    let _updateRule_decorators;
    let _deleteRule_decorators;
    let _listBlockedClients_decorators;
    let _blockClient_decorators;
    let _unblockClient_decorators;
    let _listActiveHolds_decorators;
    let _releaseHold_decorators;
    let _cleanupHolds_decorators;
    let _listPendingDeposits_decorators;
    let _confirmDeposit_decorators;
    let _refundDeposit_decorators;
    let _getStats_decorators;
    var AdminBookingController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getSettings_decorators = [(0, common_1.Get)('settings'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _updateSettings_decorators = [(0, common_1.Put)('settings'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _toggleBooking_decorators = [(0, common_1.Patch)('settings/toggle'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _generateAssistedLink_decorators = [(0, common_1.Post)('generate-assisted-link'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _listRules_decorators = [(0, common_1.Get)('rules'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _createRule_decorators = [(0, common_1.Post)('rules'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _updateRule_decorators = [(0, common_1.Patch)('rules/:ruleId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _deleteRule_decorators = [(0, common_1.Delete)('rules/:ruleId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _listBlockedClients_decorators = [(0, common_1.Get)('blocked-clients'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _blockClient_decorators = [(0, common_1.Post)('block-client'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _unblockClient_decorators = [(0, common_1.Post)('unblock-client'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _listActiveHolds_decorators = [(0, common_1.Get)('holds'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _releaseHold_decorators = [(0, common_1.Post)('holds/:holdId/release'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _cleanupHolds_decorators = [(0, common_1.Post)('holds/cleanup'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _listPendingDeposits_decorators = [(0, common_1.Get)('deposits/pending'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _confirmDeposit_decorators = [(0, common_1.Post)('deposits/:depositId/confirm'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _refundDeposit_decorators = [(0, common_1.Post)('deposits/:depositId/refund'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getStats_decorators = [(0, common_1.Get)('stats'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            __esDecorate(this, null, _getSettings_decorators, { kind: "method", name: "getSettings", static: false, private: false, access: { has: obj => "getSettings" in obj, get: obj => obj.getSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateSettings_decorators, { kind: "method", name: "updateSettings", static: false, private: false, access: { has: obj => "updateSettings" in obj, get: obj => obj.updateSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _toggleBooking_decorators, { kind: "method", name: "toggleBooking", static: false, private: false, access: { has: obj => "toggleBooking" in obj, get: obj => obj.toggleBooking }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _generateAssistedLink_decorators, { kind: "method", name: "generateAssistedLink", static: false, private: false, access: { has: obj => "generateAssistedLink" in obj, get: obj => obj.generateAssistedLink }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listRules_decorators, { kind: "method", name: "listRules", static: false, private: false, access: { has: obj => "listRules" in obj, get: obj => obj.listRules }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createRule_decorators, { kind: "method", name: "createRule", static: false, private: false, access: { has: obj => "createRule" in obj, get: obj => obj.createRule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateRule_decorators, { kind: "method", name: "updateRule", static: false, private: false, access: { has: obj => "updateRule" in obj, get: obj => obj.updateRule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteRule_decorators, { kind: "method", name: "deleteRule", static: false, private: false, access: { has: obj => "deleteRule" in obj, get: obj => obj.deleteRule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listBlockedClients_decorators, { kind: "method", name: "listBlockedClients", static: false, private: false, access: { has: obj => "listBlockedClients" in obj, get: obj => obj.listBlockedClients }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _blockClient_decorators, { kind: "method", name: "blockClient", static: false, private: false, access: { has: obj => "blockClient" in obj, get: obj => obj.blockClient }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _unblockClient_decorators, { kind: "method", name: "unblockClient", static: false, private: false, access: { has: obj => "unblockClient" in obj, get: obj => obj.unblockClient }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listActiveHolds_decorators, { kind: "method", name: "listActiveHolds", static: false, private: false, access: { has: obj => "listActiveHolds" in obj, get: obj => obj.listActiveHolds }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _releaseHold_decorators, { kind: "method", name: "releaseHold", static: false, private: false, access: { has: obj => "releaseHold" in obj, get: obj => obj.releaseHold }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cleanupHolds_decorators, { kind: "method", name: "cleanupHolds", static: false, private: false, access: { has: obj => "cleanupHolds" in obj, get: obj => obj.cleanupHolds }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listPendingDeposits_decorators, { kind: "method", name: "listPendingDeposits", static: false, private: false, access: { has: obj => "listPendingDeposits" in obj, get: obj => obj.listPendingDeposits }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _confirmDeposit_decorators, { kind: "method", name: "confirmDeposit", static: false, private: false, access: { has: obj => "confirmDeposit" in obj, get: obj => obj.confirmDeposit }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _refundDeposit_decorators, { kind: "method", name: "refundDeposit", static: false, private: false, access: { has: obj => "refundDeposit" in obj, get: obj => obj.refundDeposit }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminBookingController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        settingsService = __runInitializers(this, _instanceExtraInitializers);
        rulesService;
        holdsService;
        depositsService;
        constructor(settingsService, rulesService, holdsService, depositsService) {
            this.settingsService = settingsService;
            this.rulesService = rulesService;
            this.holdsService = holdsService;
            this.depositsService = depositsService;
        }
        // ==================== CONFIGURAÇÕES ====================
        /**
         * Obtém configurações de booking online do salão
         */
        async getSettings(req) {
            return this.settingsService.getSettings(req.user.salonId);
        }
        /**
         * Atualiza configurações de booking online
         */
        async updateSettings(req, dto) {
            return this.settingsService.updateSettings(req.user.salonId, dto);
        }
        /**
         * Habilita/desabilita booking online
         */
        async toggleBooking(req, body) {
            return this.settingsService.toggleEnabled(req.user.salonId, body.enabled);
        }
        /**
         * Gera link assistido para Alexis enviar ao cliente
         * Usado quando Alexis precisa enviar um link de agendamento pré-preenchido
         */
        async generateAssistedLink(req, dto) {
            return this.settingsService.generateAssistedLink({
                ...dto,
                salonId: req.user.salonId,
            });
        }
        // ==================== REGRAS DE CLIENTES ====================
        /**
         * Lista todas as regras de clientes
         */
        async listRules(req, includeInactive) {
            return this.rulesService.listRules(req.user.salonId, includeInactive === 'true');
        }
        /**
         * Cria uma nova regra para cliente
         */
        async createRule(req, dto) {
            return this.rulesService.createRule(req.user.salonId, dto, req.user.id);
        }
        /**
         * Atualiza uma regra
         */
        async updateRule(req, ruleId, dto) {
            return this.rulesService.updateRule(req.user.salonId, ruleId, dto);
        }
        /**
         * Remove uma regra
         */
        async deleteRule(req, ruleId) {
            await this.rulesService.deleteRule(req.user.salonId, ruleId);
            return { message: 'Regra removida com sucesso' };
        }
        /**
         * Lista clientes bloqueados
         */
        async listBlockedClients(req) {
            return this.rulesService.listBlockedClients(req.user.salonId);
        }
        /**
         * Bloqueia um cliente
         */
        async blockClient(req, body) {
            return this.rulesService.blockClient(req.user.salonId, { phone: body.phone, clientId: body.clientId }, body.reason, req.user.id, body.expiresAt);
        }
        /**
         * Desbloqueia um cliente
         */
        async unblockClient(req, body) {
            await this.rulesService.unblockClient(req.user.salonId, {
                phone: body.phone,
                clientId: body.clientId,
            });
            return { message: 'Cliente desbloqueado com sucesso' };
        }
        // ==================== HOLDS (RESERVAS TEMPORÁRIAS) ====================
        /**
         * Lista holds ativos
         */
        async listActiveHolds(_req, _date) {
            // TODO: Implementar listagem de holds ativos
            return { message: 'Em desenvolvimento' };
        }
        /**
         * Libera um hold manualmente
         */
        async releaseHold(req, holdId) {
            await this.holdsService.releaseHold(req.user.salonId, holdId);
            return { message: 'Reserva liberada com sucesso' };
        }
        /**
         * Limpa holds expirados manualmente
         */
        async cleanupHolds() {
            await this.holdsService.cleanupExpiredHolds();
            return { message: 'Limpeza de reservas expiradas concluída' };
        }
        // ==================== DEPÓSITOS ====================
        /**
         * Lista depósitos pendentes
         */
        async listPendingDeposits(_req) {
            // TODO: Implementar listagem de depósitos pendentes
            return { message: 'Em desenvolvimento' };
        }
        /**
         * Confirma pagamento de depósito manualmente
         */
        async confirmDeposit(req, depositId, body) {
            return this.depositsService.markAsPaid(req.user.salonId, depositId, {
                paymentMethod: body.paymentMethod,
                paymentReference: body.paymentReference,
            });
        }
        /**
         * Reembolsa um depósito
         */
        async refundDeposit(req, depositId, body) {
            return this.depositsService.refundDeposit(req.user.salonId, depositId, body.reason);
        }
        // ==================== ESTATÍSTICAS ====================
        /**
         * Obtém estatísticas de agendamento online
         */
        async getStats(_req, startDate, endDate) {
            // TODO: Implementar estatísticas
            return {
                message: 'Em desenvolvimento',
                period: { startDate, endDate },
            };
        }
    };
    return AdminBookingController = _classThis;
})();
exports.AdminBookingController = AdminBookingController;
//# sourceMappingURL=admin-booking.controller.js.map