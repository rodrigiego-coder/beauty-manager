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
exports.PlansController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const swagger_1 = require("@nestjs/swagger");
let PlansController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Plans'), (0, common_1.Controller)('plans')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _findById_decorators;
    let _create_decorators;
    let _update_decorators;
    let _deactivate_decorators;
    let _seed_decorators;
    var PlansController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, common_1.Get)(), (0, public_decorator_1.Public)()];
            _findById_decorators = [(0, common_1.Get)(':id'), (0, public_decorator_1.Public)()];
            _create_decorators = [(0, common_1.Post)(), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('SUPER_ADMIN')];
            _update_decorators = [(0, common_1.Patch)(':id'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('SUPER_ADMIN')];
            _deactivate_decorators = [(0, common_1.Delete)(':id'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('SUPER_ADMIN')];
            _seed_decorators = [(0, common_1.Post)('seed'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('SUPER_ADMIN')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deactivate_decorators, { kind: "method", name: "deactivate", static: false, private: false, access: { has: obj => "deactivate" in obj, get: obj => obj.deactivate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _seed_decorators, { kind: "method", name: "seed", static: false, private: false, access: { has: obj => "seed" in obj, get: obj => obj.seed }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PlansController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        plansService = __runInitializers(this, _instanceExtraInitializers);
        constructor(plansService) {
            this.plansService = plansService;
        }
        /**
         * GET /plans - List all active plans (public)
         */
        async findAll(includeInactive) {
            const include = includeInactive === 'true';
            return this.plansService.findAll(include);
        }
        /**
         * GET /plans/:id - Get plan details
         */
        async findById(id) {
            return this.plansService.findById(id);
        }
        /**
         * POST /plans - Create a new plan (SUPER_ADMIN only)
         */
        async create(dto) {
            return this.plansService.create(dto);
        }
        /**
         * PATCH /plans/:id - Update a plan (SUPER_ADMIN only)
         */
        async update(id, dto) {
            return this.plansService.update(id, dto);
        }
        /**
         * DELETE /plans/:id - Deactivate a plan (SUPER_ADMIN only)
         */
        async deactivate(id) {
            return this.plansService.deactivate(id);
        }
        /**
         * POST /plans/seed - Seed default plans (SUPER_ADMIN only)
         */
        async seed() {
            await this.plansService.seedPlans();
            return { message: 'Planos padrão criados com sucesso' };
        }
    };
    return PlansController = _classThis;
})();
exports.PlansController = PlansController;
//# sourceMappingURL=plans.controller.js.map