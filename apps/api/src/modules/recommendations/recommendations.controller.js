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
exports.RecommendationsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
/**
 * RecommendationsController
 * Endpoints para gerenciamento de recomendações de produtos
 */
let RecommendationsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('recommendations'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _listRules_decorators;
    let _getRule_decorators;
    let _createRule_decorators;
    let _updateRule_decorators;
    let _deleteRule_decorators;
    let _getRecommendationsForClient_decorators;
    let _logRecommendation_decorators;
    let _acceptRecommendation_decorators;
    let _rejectRecommendation_decorators;
    let _getStats_decorators;
    var RecommendationsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _listRules_decorators = [(0, common_1.Get)('rules'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getRule_decorators = [(0, common_1.Get)('rules/:ruleId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _createRule_decorators = [(0, common_1.Post)('rules'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _updateRule_decorators = [(0, common_1.Put)('rules/:ruleId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _deleteRule_decorators = [(0, common_1.Delete)('rules/:ruleId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getRecommendationsForClient_decorators = [(0, common_1.Get)('client/:clientId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _logRecommendation_decorators = [(0, common_1.Post)('log'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _acceptRecommendation_decorators = [(0, common_1.Post)('log/:logId/accept'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _rejectRecommendation_decorators = [(0, common_1.Post)('log/:logId/reject'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getStats_decorators = [(0, common_1.Get)('stats'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            __esDecorate(this, null, _listRules_decorators, { kind: "method", name: "listRules", static: false, private: false, access: { has: obj => "listRules" in obj, get: obj => obj.listRules }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getRule_decorators, { kind: "method", name: "getRule", static: false, private: false, access: { has: obj => "getRule" in obj, get: obj => obj.getRule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createRule_decorators, { kind: "method", name: "createRule", static: false, private: false, access: { has: obj => "createRule" in obj, get: obj => obj.createRule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateRule_decorators, { kind: "method", name: "updateRule", static: false, private: false, access: { has: obj => "updateRule" in obj, get: obj => obj.updateRule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteRule_decorators, { kind: "method", name: "deleteRule", static: false, private: false, access: { has: obj => "deleteRule" in obj, get: obj => obj.deleteRule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getRecommendationsForClient_decorators, { kind: "method", name: "getRecommendationsForClient", static: false, private: false, access: { has: obj => "getRecommendationsForClient" in obj, get: obj => obj.getRecommendationsForClient }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _logRecommendation_decorators, { kind: "method", name: "logRecommendation", static: false, private: false, access: { has: obj => "logRecommendation" in obj, get: obj => obj.logRecommendation }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _acceptRecommendation_decorators, { kind: "method", name: "acceptRecommendation", static: false, private: false, access: { has: obj => "acceptRecommendation" in obj, get: obj => obj.acceptRecommendation }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _rejectRecommendation_decorators, { kind: "method", name: "rejectRecommendation", static: false, private: false, access: { has: obj => "rejectRecommendation" in obj, get: obj => obj.rejectRecommendation }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RecommendationsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        recommendationsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(recommendationsService) {
            this.recommendationsService = recommendationsService;
        }
        // ==================== RULES ====================
        /**
         * GET /recommendations/rules
         * Lista todas as regras de recomendação
         */
        async listRules(req) {
            return this.recommendationsService.listRules(req.user.salonId);
        }
        /**
         * GET /recommendations/rules/:ruleId
         * Obtém uma regra específica
         */
        async getRule(ruleId, req) {
            return this.recommendationsService.getRuleById(req.user.salonId, ruleId);
        }
        /**
         * POST /recommendations/rules
         * Cria uma nova regra de recomendação
         */
        async createRule(dto, req) {
            return this.recommendationsService.createRule(req.user.salonId, dto, req.user.sub);
        }
        /**
         * PUT /recommendations/rules/:ruleId
         * Atualiza uma regra existente
         */
        async updateRule(ruleId, dto, req) {
            return this.recommendationsService.updateRule(req.user.salonId, ruleId, dto);
        }
        /**
         * DELETE /recommendations/rules/:ruleId
         * Remove uma regra
         */
        async deleteRule(ruleId, req) {
            await this.recommendationsService.deleteRule(req.user.salonId, ruleId);
            return { message: 'Regra removida com sucesso' };
        }
        // ==================== RECOMMENDATIONS ====================
        /**
         * GET /recommendations/client/:clientId
         * Obtém recomendações para um cliente específico
         */
        async getRecommendationsForClient(clientId, req) {
            return this.recommendationsService.getRecommendationsForClient(req.user.salonId, clientId);
        }
        // ==================== LOGGING ====================
        /**
         * POST /recommendations/log
         * Registra uma recomendação mostrada
         */
        async logRecommendation(dto, req) {
            await this.recommendationsService.logRecommendation(req.user.salonId, dto);
            return { message: 'Recomendação registrada' };
        }
        /**
         * POST /recommendations/log/:logId/accept
         * Marca uma recomendação como aceita
         */
        async acceptRecommendation(logId, req) {
            await this.recommendationsService.acceptRecommendation(req.user.salonId, logId);
            return { message: 'Recomendação aceita' };
        }
        /**
         * POST /recommendations/log/:logId/reject
         * Marca uma recomendação como rejeitada
         */
        async rejectRecommendation(logId, req) {
            await this.recommendationsService.rejectRecommendation(req.user.salonId, logId);
            return { message: 'Recomendação rejeitada' };
        }
        // ==================== STATISTICS ====================
        /**
         * GET /recommendations/stats
         * Obtém estatísticas das recomendações
         */
        async getStats(days, req) {
            return this.recommendationsService.getStats(req.user.salonId, days ? parseInt(days, 10) : 30);
        }
    };
    return RecommendationsController = _classThis;
})();
exports.RecommendationsController = RecommendationsController;
//# sourceMappingURL=recommendations.controller.js.map