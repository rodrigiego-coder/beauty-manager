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
exports.HairProfileController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const dto_1 = require("./dto");
/**
 * HairProfileController
 * Endpoints para gerenciamento de perfis capilares
 */
let HairProfileController = (() => {
    let _classDecorators = [(0, common_1.Controller)('hair-profiles'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getOptions_decorators;
    let _getStats_decorators;
    let _listClientsWithProfile_decorators;
    let _getByClientId_decorators;
    let _upsert_decorators;
    let _update_decorators;
    let _delete_decorators;
    var HairProfileController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getOptions_decorators = [(0, common_1.Get)('options'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getStats_decorators = [(0, common_1.Get)('stats'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _listClientsWithProfile_decorators = [(0, common_1.Get)('clients'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getByClientId_decorators = [(0, common_1.Get)('client/:clientId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _upsert_decorators = [(0, common_1.Post)(), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _update_decorators = [(0, common_1.Put)('client/:clientId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _delete_decorators = [(0, common_1.Delete)('client/:clientId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            __esDecorate(this, null, _getOptions_decorators, { kind: "method", name: "getOptions", static: false, private: false, access: { has: obj => "getOptions" in obj, get: obj => obj.getOptions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listClientsWithProfile_decorators, { kind: "method", name: "listClientsWithProfile", static: false, private: false, access: { has: obj => "listClientsWithProfile" in obj, get: obj => obj.listClientsWithProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getByClientId_decorators, { kind: "method", name: "getByClientId", static: false, private: false, access: { has: obj => "getByClientId" in obj, get: obj => obj.getByClientId }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _upsert_decorators, { kind: "method", name: "upsert", static: false, private: false, access: { has: obj => "upsert" in obj, get: obj => obj.upsert }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            HairProfileController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        hairProfileService = __runInitializers(this, _instanceExtraInitializers);
        constructor(hairProfileService) {
            this.hairProfileService = hairProfileService;
        }
        /**
         * GET /hair-profiles/options
         * Retorna as opções disponíveis para os campos
         */
        getOptions() {
            return {
                hairTypes: Object.entries(dto_1.HairTypeLabels).map(([value, label]) => ({ value, label })),
                hairThickness: Object.entries(dto_1.HairThicknessLabels).map(([value, label]) => ({ value, label })),
                hairLength: Object.entries(dto_1.HairLengthLabels).map(([value, label]) => ({ value, label })),
                hairPorosity: Object.entries(dto_1.HairPorosityLabels).map(([value, label]) => ({ value, label })),
                scalpTypes: Object.entries(dto_1.ScalpTypeLabels).map(([value, label]) => ({ value, label })),
                chemicalHistory: dto_1.ChemicalHistoryOptions.map(value => ({
                    value,
                    label: dto_1.ChemicalHistoryLabels[value],
                })),
                concerns: dto_1.HairConcernsOptions.map(value => ({
                    value,
                    label: dto_1.HairConcernsLabels[value],
                })),
            };
        }
        /**
         * GET /hair-profiles/stats
         * Retorna estatísticas dos perfis capilares
         */
        async getStats(req) {
            return this.hairProfileService.getStats(req.user.salonId);
        }
        /**
         * GET /hair-profiles/clients
         * Lista clientes com indicação se têm perfil
         */
        async listClientsWithProfile(req) {
            return this.hairProfileService.listClientsWithProfile(req.user.salonId);
        }
        /**
         * GET /hair-profiles/client/:clientId
         * Obtém o perfil capilar de um cliente
         */
        async getByClientId(clientId, req) {
            return this.hairProfileService.getByClientId(req.user.salonId, clientId);
        }
        /**
         * POST /hair-profiles
         * Cria ou atualiza o perfil capilar
         */
        async upsert(dto, req) {
            return this.hairProfileService.upsert(req.user.salonId, dto, req.user.sub);
        }
        /**
         * PUT /hair-profiles/client/:clientId
         * Atualiza parcialmente o perfil capilar
         */
        async update(clientId, dto, req) {
            return this.hairProfileService.update(req.user.salonId, clientId, dto, req.user.sub);
        }
        /**
         * DELETE /hair-profiles/client/:clientId
         * Remove o perfil capilar
         */
        async delete(clientId, req) {
            await this.hairProfileService.delete(req.user.salonId, clientId);
            return { message: 'Perfil capilar removido com sucesso' };
        }
    };
    return HairProfileController = _classThis;
})();
exports.HairProfileController = HairProfileController;
//# sourceMappingURL=hair-profile.controller.js.map