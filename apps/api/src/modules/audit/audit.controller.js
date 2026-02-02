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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
let AuditController = (() => {
    let _classDecorators = [(0, common_1.Controller)('audit')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findBySalon_decorators;
    let _findByEntity_decorators;
    let _findByUser_decorators;
    let _findByPeriod_decorators;
    let _findByAction_decorators;
    let _getEntityHistory_decorators;
    var AuditController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findBySalon_decorators = [(0, common_1.Get)('salon/:salonId')];
            _findByEntity_decorators = [(0, common_1.Get)('entity/:entity')];
            _findByUser_decorators = [(0, common_1.Get)('user/:userId')];
            _findByPeriod_decorators = [(0, common_1.Get)('period')];
            _findByAction_decorators = [(0, common_1.Get)('action/:action')];
            _getEntityHistory_decorators = [(0, common_1.Get)('history/:entity/:entityId')];
            __esDecorate(this, null, _findBySalon_decorators, { kind: "method", name: "findBySalon", static: false, private: false, access: { has: obj => "findBySalon" in obj, get: obj => obj.findBySalon }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByEntity_decorators, { kind: "method", name: "findByEntity", static: false, private: false, access: { has: obj => "findByEntity" in obj, get: obj => obj.findByEntity }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByUser_decorators, { kind: "method", name: "findByUser", static: false, private: false, access: { has: obj => "findByUser" in obj, get: obj => obj.findByUser }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByPeriod_decorators, { kind: "method", name: "findByPeriod", static: false, private: false, access: { has: obj => "findByPeriod" in obj, get: obj => obj.findByPeriod }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByAction_decorators, { kind: "method", name: "findByAction", static: false, private: false, access: { has: obj => "findByAction" in obj, get: obj => obj.findByAction }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getEntityHistory_decorators, { kind: "method", name: "getEntityHistory", static: false, private: false, access: { has: obj => "getEntityHistory" in obj, get: obj => obj.getEntityHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuditController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        auditService = __runInitializers(this, _instanceExtraInitializers);
        constructor(auditService) {
            this.auditService = auditService;
        }
        /**
         * GET /audit/salon/:salonId
         * Lista todos os logs de auditoria de um salão
         */
        async findBySalon(salonId) {
            return this.auditService.findBySalon(salonId);
        }
        /**
         * GET /audit/entity/:entity
         * Lista logs de auditoria por entidade (opcionalmente filtrando por entityId)
         */
        async findByEntity(entity, entityId) {
            return this.auditService.findByEntity(entity, entityId);
        }
        /**
         * GET /audit/user/:userId
         * Lista logs de auditoria por usuário
         */
        async findByUser(userId) {
            return this.auditService.findByUser(userId);
        }
        /**
         * GET /audit/period
         * Lista logs de auditoria por período
         */
        async findByPeriod(startDate, endDate, salonId) {
            return this.auditService.findByPeriod(new Date(startDate), new Date(endDate), salonId);
        }
        /**
         * GET /audit/action/:action
         * Lista logs de auditoria por tipo de ação
         */
        async findByAction(action, salonId) {
            return this.auditService.findByAction(action, salonId);
        }
        /**
         * GET /audit/history/:entity/:entityId
         * Busca histórico completo de alterações de um registro específico
         */
        async getEntityHistory(entity, entityId) {
            return this.auditService.getEntityHistory(entity, entityId);
        }
    };
    return AuditController = _classThis;
})();
exports.AuditController = AuditController;
//# sourceMappingURL=audit.controller.js.map