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
exports.ServiceConsumptionsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let ServiceConsumptionsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('services'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findByService_decorators;
    let _replaceConsumptions_decorators;
    var ServiceConsumptionsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findByService_decorators = [(0, common_1.Get)(':serviceId/consumptions'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _replaceConsumptions_decorators = [(0, common_1.Put)(':serviceId/consumptions'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            __esDecorate(this, null, _findByService_decorators, { kind: "method", name: "findByService", static: false, private: false, access: { has: obj => "findByService" in obj, get: obj => obj.findByService }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _replaceConsumptions_decorators, { kind: "method", name: "replaceConsumptions", static: false, private: false, access: { has: obj => "replaceConsumptions" in obj, get: obj => obj.replaceConsumptions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ServiceConsumptionsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        serviceConsumptionsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(serviceConsumptionsService) {
            this.serviceConsumptionsService = serviceConsumptionsService;
        }
        /**
         * GET /services/:serviceId/consumptions
         * Lista BOM (Bill of Materials) do serviço
         */
        async findByService(serviceId, user) {
            return this.serviceConsumptionsService.findByService(serviceId, user.salonId);
        }
        /**
         * PUT /services/:serviceId/consumptions
         * Substitui completamente o BOM do serviço
         */
        async replaceConsumptions(serviceId, user, data) {
            return this.serviceConsumptionsService.replaceConsumptions(serviceId, user.salonId, data.items);
        }
    };
    return ServiceConsumptionsController = _classThis;
})();
exports.ServiceConsumptionsController = ServiceConsumptionsController;
//# sourceMappingURL=service-consumptions.controller.js.map