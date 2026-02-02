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
exports.TeamController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let TeamController = (() => {
    let _classDecorators = [(0, common_1.Controller)('team'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _getSummary_decorators;
    let _findById_decorators;
    let _invite_decorators;
    let _update_decorators;
    let _deactivate_decorators;
    let _reactivate_decorators;
    let _getServices_decorators;
    let _setServices_decorators;
    var TeamController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, common_1.Get)(), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getSummary_decorators = [(0, common_1.Get)('summary'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _findById_decorators = [(0, common_1.Get)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _invite_decorators = [(0, common_1.Post)(), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _update_decorators = [(0, common_1.Patch)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _deactivate_decorators = [(0, common_1.Delete)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _reactivate_decorators = [(0, common_1.Patch)(':id/reactivate'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getServices_decorators = [(0, common_1.Get)(':id/services'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _setServices_decorators = [(0, common_1.Patch)(':id/services'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSummary_decorators, { kind: "method", name: "getSummary", static: false, private: false, access: { has: obj => "getSummary" in obj, get: obj => obj.getSummary }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _invite_decorators, { kind: "method", name: "invite", static: false, private: false, access: { has: obj => "invite" in obj, get: obj => obj.invite }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deactivate_decorators, { kind: "method", name: "deactivate", static: false, private: false, access: { has: obj => "deactivate" in obj, get: obj => obj.deactivate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _reactivate_decorators, { kind: "method", name: "reactivate", static: false, private: false, access: { has: obj => "reactivate" in obj, get: obj => obj.reactivate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getServices_decorators, { kind: "method", name: "getServices", static: false, private: false, access: { has: obj => "getServices" in obj, get: obj => obj.getServices }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setServices_decorators, { kind: "method", name: "setServices", static: false, private: false, access: { has: obj => "setServices" in obj, get: obj => obj.setServices }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TeamController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        teamService = __runInitializers(this, _instanceExtraInitializers);
        constructor(teamService) {
            this.teamService = teamService;
        }
        /**
         * GET /team - Lista membros da equipe
         */
        async findAll(user, includeInactive) {
            return this.teamService.findAll(user.salonId, includeInactive === 'true');
        }
        /**
         * GET /team/summary - Resumo da equipe
         */
        async getSummary(user) {
            return this.teamService.getSummary(user.salonId);
        }
        /**
         * GET /team/:id - Busca membro por ID
         */
        async findById(id, user) {
            return this.teamService.findById(id, user.salonId);
        }
        /**
         * POST /team - Convida novo membro
         */
        async invite(data, user) {
            return this.teamService.invite(user.salonId, data);
        }
        /**
         * PATCH /team/:id - Atualiza membro
         */
        async update(id, data, user) {
            return this.teamService.update(id, user.salonId, data);
        }
        /**
         * DELETE /team/:id - Desativa membro
         */
        async deactivate(id, user) {
            return this.teamService.deactivate(id, user.salonId);
        }
        /**
         * PATCH /team/:id/reactivate - Reativa membro
         */
        async reactivate(id, user) {
            return this.teamService.reactivate(id, user.salonId);
        }
        /**
         * GET /team/:id/services - Lista serviços que o profissional realiza
         */
        async getServices(id, user) {
            return this.teamService.getAssignedServices(id, user.salonId);
        }
        /**
         * PUT /team/:id/services - Define serviços do profissional (replace all)
         */
        async setServices(id, body, user) {
            return this.teamService.setAssignedServices(id, user.salonId, body.serviceIds || []);
        }
    };
    return TeamController = _classThis;
})();
exports.TeamController = TeamController;
//# sourceMappingURL=team.controller.js.map