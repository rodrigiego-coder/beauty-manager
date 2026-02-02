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
exports.ServicesController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
let ServicesController = (() => {
    let _classDecorators = [(0, common_1.Controller)('services'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _bulkUpdateStatus_decorators;
    let _findById_decorators;
    let _create_decorators;
    let _update_decorators;
    let _delete_decorators;
    let _reactivate_decorators;
    var ServicesController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, common_1.Get)()];
            _bulkUpdateStatus_decorators = [(0, common_1.Patch)('bulk-status')];
            _findById_decorators = [(0, common_1.Get)(':id')];
            _create_decorators = [(0, common_1.Post)()];
            _update_decorators = [(0, common_1.Patch)(':id')];
            _delete_decorators = [(0, common_1.Delete)(':id')];
            _reactivate_decorators = [(0, common_1.Patch)(':id/reactivate')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _bulkUpdateStatus_decorators, { kind: "method", name: "bulkUpdateStatus", static: false, private: false, access: { has: obj => "bulkUpdateStatus" in obj, get: obj => obj.bulkUpdateStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _reactivate_decorators, { kind: "method", name: "reactivate", static: false, private: false, access: { has: obj => "reactivate" in obj, get: obj => obj.reactivate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ServicesController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        servicesService = __runInitializers(this, _instanceExtraInitializers);
        constructor(servicesService) {
            this.servicesService = servicesService;
        }
        /**
         * GET /services
         * Lista todos os serviços do salão
         */
        async findAll(user, search, category, includeInactive) {
            const showInactive = includeInactive === 'true';
            if (category) {
                return this.servicesService.findByCategory(user.salonId, category);
            }
            if (search) {
                return this.servicesService.search(user.salonId, search, showInactive);
            }
            return this.servicesService.findAll(user.salonId, showInactive);
        }
        /**
         * PATCH /services/bulk-status
         * Ativa/desativa múltiplos serviços de uma vez
         */
        async bulkUpdateStatus(user, body) {
            return this.servicesService.bulkUpdateStatus(body.ids, body.active, user.salonId);
        }
        /**
         * GET /services/:id
         * Busca serviço por ID
         */
        async findById(id, user) {
            const service = await this.servicesService.findById(id);
            if (!service || service.salonId !== user.salonId) {
                return null;
            }
            return service;
        }
        /**
         * POST /services
         * Cria novo serviço
         */
        async create(user, data) {
            return this.servicesService.create(user.salonId, data);
        }
        /**
         * PATCH /services/:id
         * Atualiza serviço existente
         */
        async update(id, user, data) {
            return this.servicesService.update(id, user.salonId, data);
        }
        /**
         * DELETE /services/:id
         * Desativa serviço (soft delete)
         */
        async delete(id, user) {
            return this.servicesService.delete(id, user.salonId);
        }
        /**
         * PATCH /services/:id/reactivate
         * Reativa serviço desativado
         */
        async reactivate(id, user) {
            return this.servicesService.reactivate(id, user.salonId);
        }
    };
    return ServicesController = _classThis;
})();
exports.ServicesController = ServicesController;
//# sourceMappingURL=services.controller.js.map