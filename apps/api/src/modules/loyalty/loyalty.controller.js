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
exports.LoyaltyController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const dto_1 = require("./dto");
const swagger_1 = require("@nestjs/swagger");
/**
 * LoyaltyController
 * Endpoints para gerenciamento do programa de fidelidade
 */
let LoyaltyController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Loyalty'), (0, common_1.Controller)('loyalty'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getProgram_decorators;
    let _createProgram_decorators;
    let _updateProgram_decorators;
    let _listTiers_decorators;
    let _createTier_decorators;
    let _updateTier_decorators;
    let _deleteTier_decorators;
    let _listRewards_decorators;
    let _createReward_decorators;
    let _updateReward_decorators;
    let _deleteReward_decorators;
    let _getAccount_decorators;
    let _enrollClient_decorators;
    let _getTransactions_decorators;
    let _getAvailableRewards_decorators;
    let _redeemReward_decorators;
    let _adjustPoints_decorators;
    let _validateVoucher_decorators;
    let _useVoucher_decorators;
    let _getReferralInfo_decorators;
    let _getStats_decorators;
    let _getLeaderboard_decorators;
    let _getOptions_decorators;
    let _calculatePoints_decorators;
    var LoyaltyController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getProgram_decorators = [(0, common_1.Get)('program'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _createProgram_decorators = [(0, common_1.Post)('program'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _updateProgram_decorators = [(0, common_1.Patch)('program'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _listTiers_decorators = [(0, common_1.Get)('tiers'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _createTier_decorators = [(0, common_1.Post)('tiers'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _updateTier_decorators = [(0, common_1.Patch)('tiers/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _deleteTier_decorators = [(0, common_1.Delete)('tiers/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _listRewards_decorators = [(0, common_1.Get)('rewards'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _createReward_decorators = [(0, common_1.Post)('rewards'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _updateReward_decorators = [(0, common_1.Patch)('rewards/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _deleteReward_decorators = [(0, common_1.Delete)('rewards/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getAccount_decorators = [(0, common_1.Get)('account/:clientId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _enrollClient_decorators = [(0, common_1.Post)('account/:clientId/enroll'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getTransactions_decorators = [(0, common_1.Get)('account/:clientId/transactions'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getAvailableRewards_decorators = [(0, common_1.Get)('account/:clientId/available-rewards'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _redeemReward_decorators = [(0, common_1.Post)('account/:clientId/redeem/:rewardId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _adjustPoints_decorators = [(0, common_1.Post)('account/:clientId/adjust'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _validateVoucher_decorators = [(0, common_1.Get)('voucher/:code'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _useVoucher_decorators = [(0, common_1.Post)('voucher/:code/use'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getReferralInfo_decorators = [(0, common_1.Get)('referral/:code'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getStats_decorators = [(0, common_1.Get)('stats'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getLeaderboard_decorators = [(0, common_1.Get)('leaderboard'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getOptions_decorators = [(0, common_1.Get)('options'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _calculatePoints_decorators = [(0, common_1.Get)('calculate/:commandId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            __esDecorate(this, null, _getProgram_decorators, { kind: "method", name: "getProgram", static: false, private: false, access: { has: obj => "getProgram" in obj, get: obj => obj.getProgram }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createProgram_decorators, { kind: "method", name: "createProgram", static: false, private: false, access: { has: obj => "createProgram" in obj, get: obj => obj.createProgram }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateProgram_decorators, { kind: "method", name: "updateProgram", static: false, private: false, access: { has: obj => "updateProgram" in obj, get: obj => obj.updateProgram }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listTiers_decorators, { kind: "method", name: "listTiers", static: false, private: false, access: { has: obj => "listTiers" in obj, get: obj => obj.listTiers }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createTier_decorators, { kind: "method", name: "createTier", static: false, private: false, access: { has: obj => "createTier" in obj, get: obj => obj.createTier }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateTier_decorators, { kind: "method", name: "updateTier", static: false, private: false, access: { has: obj => "updateTier" in obj, get: obj => obj.updateTier }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteTier_decorators, { kind: "method", name: "deleteTier", static: false, private: false, access: { has: obj => "deleteTier" in obj, get: obj => obj.deleteTier }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listRewards_decorators, { kind: "method", name: "listRewards", static: false, private: false, access: { has: obj => "listRewards" in obj, get: obj => obj.listRewards }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createReward_decorators, { kind: "method", name: "createReward", static: false, private: false, access: { has: obj => "createReward" in obj, get: obj => obj.createReward }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateReward_decorators, { kind: "method", name: "updateReward", static: false, private: false, access: { has: obj => "updateReward" in obj, get: obj => obj.updateReward }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteReward_decorators, { kind: "method", name: "deleteReward", static: false, private: false, access: { has: obj => "deleteReward" in obj, get: obj => obj.deleteReward }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAccount_decorators, { kind: "method", name: "getAccount", static: false, private: false, access: { has: obj => "getAccount" in obj, get: obj => obj.getAccount }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _enrollClient_decorators, { kind: "method", name: "enrollClient", static: false, private: false, access: { has: obj => "enrollClient" in obj, get: obj => obj.enrollClient }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getTransactions_decorators, { kind: "method", name: "getTransactions", static: false, private: false, access: { has: obj => "getTransactions" in obj, get: obj => obj.getTransactions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAvailableRewards_decorators, { kind: "method", name: "getAvailableRewards", static: false, private: false, access: { has: obj => "getAvailableRewards" in obj, get: obj => obj.getAvailableRewards }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _redeemReward_decorators, { kind: "method", name: "redeemReward", static: false, private: false, access: { has: obj => "redeemReward" in obj, get: obj => obj.redeemReward }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _adjustPoints_decorators, { kind: "method", name: "adjustPoints", static: false, private: false, access: { has: obj => "adjustPoints" in obj, get: obj => obj.adjustPoints }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _validateVoucher_decorators, { kind: "method", name: "validateVoucher", static: false, private: false, access: { has: obj => "validateVoucher" in obj, get: obj => obj.validateVoucher }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _useVoucher_decorators, { kind: "method", name: "useVoucher", static: false, private: false, access: { has: obj => "useVoucher" in obj, get: obj => obj.useVoucher }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getReferralInfo_decorators, { kind: "method", name: "getReferralInfo", static: false, private: false, access: { has: obj => "getReferralInfo" in obj, get: obj => obj.getReferralInfo }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getLeaderboard_decorators, { kind: "method", name: "getLeaderboard", static: false, private: false, access: { has: obj => "getLeaderboard" in obj, get: obj => obj.getLeaderboard }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getOptions_decorators, { kind: "method", name: "getOptions", static: false, private: false, access: { has: obj => "getOptions" in obj, get: obj => obj.getOptions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _calculatePoints_decorators, { kind: "method", name: "calculatePoints", static: false, private: false, access: { has: obj => "calculatePoints" in obj, get: obj => obj.calculatePoints }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LoyaltyController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        loyaltyService = __runInitializers(this, _instanceExtraInitializers);
        constructor(loyaltyService) {
            this.loyaltyService = loyaltyService;
        }
        // ==================== PROGRAM ENDPOINTS ====================
        /**
         * GET /loyalty/program
         * Obtém configuração do programa de fidelidade
         */
        async getProgram(req) {
            return this.loyaltyService.getProgram(req.user.salonId);
        }
        /**
         * POST /loyalty/program
         * Cria/ativa programa de fidelidade
         */
        async createProgram(dto, req) {
            return this.loyaltyService.createProgram(req.user.salonId, dto);
        }
        /**
         * PATCH /loyalty/program
         * Atualiza configurações do programa
         */
        async updateProgram(dto, req) {
            return this.loyaltyService.updateProgram(req.user.salonId, dto);
        }
        // ==================== TIER ENDPOINTS ====================
        /**
         * GET /loyalty/tiers
         * Lista níveis do programa
         */
        async listTiers(req) {
            return this.loyaltyService.listTiers(req.user.salonId);
        }
        /**
         * POST /loyalty/tiers
         * Cria novo nível
         */
        async createTier(dto, req) {
            return this.loyaltyService.createTier(req.user.salonId, dto);
        }
        /**
         * PATCH /loyalty/tiers/:id
         * Atualiza nível
         */
        async updateTier(id, dto, req) {
            return this.loyaltyService.updateTier(req.user.salonId, id, dto);
        }
        /**
         * DELETE /loyalty/tiers/:id
         * Remove nível
         */
        async deleteTier(id, req) {
            await this.loyaltyService.deleteTier(req.user.salonId, id);
            return { message: 'Nível removido com sucesso' };
        }
        // ==================== REWARD ENDPOINTS ====================
        /**
         * GET /loyalty/rewards
         * Lista recompensas
         */
        async listRewards(req) {
            return this.loyaltyService.listRewards(req.user.salonId);
        }
        /**
         * POST /loyalty/rewards
         * Cria nova recompensa
         */
        async createReward(dto, req) {
            return this.loyaltyService.createReward(req.user.salonId, dto);
        }
        /**
         * PATCH /loyalty/rewards/:id
         * Atualiza recompensa
         */
        async updateReward(id, dto, req) {
            return this.loyaltyService.updateReward(req.user.salonId, id, dto);
        }
        /**
         * DELETE /loyalty/rewards/:id
         * Remove recompensa (soft delete)
         */
        async deleteReward(id, req) {
            await this.loyaltyService.deleteReward(req.user.salonId, id);
            return { message: 'Recompensa removida com sucesso' };
        }
        // ==================== ACCOUNT ENDPOINTS ====================
        /**
         * GET /loyalty/account/:clientId
         * Obtém conta de fidelidade do cliente
         */
        async getAccount(clientId, req) {
            return this.loyaltyService.getAccount(req.user.salonId, clientId);
        }
        /**
         * POST /loyalty/account/:clientId/enroll
         * Inscreve cliente no programa
         */
        async enrollClient(clientId, dto, req) {
            return this.loyaltyService.enrollClient(req.user.salonId, clientId, dto.referralCode, req.user.sub);
        }
        /**
         * GET /loyalty/account/:clientId/transactions
         * Lista extrato de pontos do cliente
         */
        async getTransactions(clientId, limit, req) {
            return this.loyaltyService.getTransactions(req.user.salonId, clientId, limit ? parseInt(limit, 10) : 50);
        }
        /**
         * GET /loyalty/account/:clientId/available-rewards
         * Lista recompensas disponíveis para o cliente
         */
        async getAvailableRewards(clientId, req) {
            return this.loyaltyService.getAvailableRewards(req.user.salonId, clientId);
        }
        /**
         * POST /loyalty/account/:clientId/redeem/:rewardId
         * Resgata recompensa
         */
        async redeemReward(clientId, rewardId, req) {
            return this.loyaltyService.redeemReward(req.user.salonId, clientId, rewardId, req.user.sub);
        }
        /**
         * POST /loyalty/account/:clientId/adjust
         * Ajuste manual de pontos (admin)
         */
        async adjustPoints(clientId, dto, req) {
            return this.loyaltyService.adjustPoints(req.user.salonId, clientId, dto, req.user.sub);
        }
        // ==================== VOUCHER ENDPOINTS ====================
        /**
         * GET /loyalty/voucher/:code
         * Valida voucher
         */
        async validateVoucher(code, req) {
            return this.loyaltyService.validateVoucher(req.user.salonId, code);
        }
        /**
         * POST /loyalty/voucher/:code/use
         * Usa voucher na comanda
         */
        async useVoucher(code, dto, req) {
            await this.loyaltyService.useVoucher(req.user.salonId, code, dto.commandId);
            return { message: 'Voucher aplicado com sucesso' };
        }
        // ==================== REFERRAL ENDPOINTS ====================
        /**
         * GET /loyalty/referral/:code
         * Info do código de indicação
         */
        async getReferralInfo(code, req) {
            return this.loyaltyService.getReferralInfo(req.user.salonId, code);
        }
        // ==================== STATS ENDPOINTS ====================
        /**
         * GET /loyalty/stats
         * Estatísticas do programa
         */
        async getStats(req) {
            return this.loyaltyService.getStats(req.user.salonId);
        }
        /**
         * GET /loyalty/leaderboard
         * Ranking de clientes
         */
        async getLeaderboard(limit, req) {
            return this.loyaltyService.getLeaderboard(req.user.salonId, limit ? parseInt(limit, 10) : 10);
        }
        // ==================== OPTIONS ENDPOINT ====================
        /**
         * GET /loyalty/options
         * Retorna opções para formulários
         */
        getOptions() {
            return {
                rewardTypes: Object.entries(dto_1.RewardTypeLabels).map(([value, label]) => ({ value, label })),
                transactionTypes: Object.entries(dto_1.TransactionTypeLabels).map(([value, label]) => ({ value, label })),
            };
        }
        // ==================== POINTS CALCULATION ENDPOINT ====================
        /**
         * GET /loyalty/calculate/:commandId
         * Calcula pontos para uma comanda
         */
        async calculatePoints(commandId, req) {
            return this.loyaltyService.calculatePointsForCommand(req.user.salonId, commandId);
        }
    };
    return LoyaltyController = _classThis;
})();
exports.LoyaltyController = LoyaltyController;
//# sourceMappingURL=loyalty.controller.js.map