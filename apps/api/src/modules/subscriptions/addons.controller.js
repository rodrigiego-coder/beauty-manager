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
exports.CreditsController = exports.AddonsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const addons_dto_1 = require("./addons.dto");
let AddonsController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Subscriptions - Add-ons'), (0, swagger_1.ApiBearerAuth)('access-token'), (0, common_1.Controller)('subscriptions/addons'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getCatalog_decorators;
    let _getStatus_decorators;
    let _activateAddon_decorators;
    var AddonsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getCatalog_decorators = [(0, common_1.Get)('catalog'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST'), (0, swagger_1.ApiOperation)({ summary: 'Listar catálogo de add-ons disponíveis' })];
            _getStatus_decorators = [(0, common_1.Get)('status'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST'), (0, swagger_1.ApiOperation)({ summary: 'Status dos add-ons e quotas do salão' })];
            _activateAddon_decorators = [(0, common_1.Post)('activate'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'), (0, swagger_1.ApiOperation)({ summary: 'Ativar add-on para o salão' }), (0, swagger_1.ApiBody)({ type: addons_dto_1.ActivateAddonDto })];
            __esDecorate(this, null, _getCatalog_decorators, { kind: "method", name: "getCatalog", static: false, private: false, access: { has: obj => "getCatalog" in obj, get: obj => obj.getCatalog }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStatus_decorators, { kind: "method", name: "getStatus", static: false, private: false, access: { has: obj => "getStatus" in obj, get: obj => obj.getStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _activateAddon_decorators, { kind: "method", name: "activateAddon", static: false, private: false, access: { has: obj => "activateAddon" in obj, get: obj => obj.activateAddon }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AddonsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        addonsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(addonsService) {
            this.addonsService = addonsService;
        }
        /**
         * GET /subscriptions/addons/catalog
         * Retorna o catálogo de add-ons e pacotes de crédito disponíveis
         * Acessível por: OWNER, MANAGER, RECEPTIONIST, STYLIST
         */
        async getCatalog() {
            return this.addonsService.getCatalog();
        }
        /**
         * GET /subscriptions/addons/status
         * Retorna os add-ons ativos do salão e as quotas do mês atual
         * Acessível por: OWNER, MANAGER, RECEPTIONIST, STYLIST
         */
        async getStatus(user) {
            return this.addonsService.getStatus(user.salonId);
        }
        /**
         * POST /subscriptions/addons/activate
         * Ativa um add-on para o salão (sem cobrança MP - somente simulação)
         * Acessível por: OWNER, MANAGER
         */
        async activateAddon(user, dto) {
            return this.addonsService.activateAddon(user.salonId, dto.addonCode, user.id);
        }
    };
    return AddonsController = _classThis;
})();
exports.AddonsController = AddonsController;
let CreditsController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Subscriptions - Créditos'), (0, swagger_1.ApiBearerAuth)('access-token'), (0, common_1.Controller)('subscriptions/credits'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _grantCredits_decorators;
    var CreditsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _grantCredits_decorators = [(0, common_1.Post)('grant'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'), (0, swagger_1.ApiOperation)({ summary: 'Comprar créditos extras' }), (0, swagger_1.ApiBody)({ type: addons_dto_1.GrantCreditsDto })];
            __esDecorate(this, null, _grantCredits_decorators, { kind: "method", name: "grantCredits", static: false, private: false, access: { has: obj => "grantCredits" in obj, get: obj => obj.grantCredits }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CreditsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        addonsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(addonsService) {
            this.addonsService = addonsService;
        }
        /**
         * POST /subscriptions/credits/grant
         * Concede créditos extras ao salão (simulação de compra)
         * Acessível por: OWNER, MANAGER
         */
        async grantCredits(user, dto) {
            return this.addonsService.grantCredits(user.salonId, dto.packageCode, dto.qtyPackages, user.id);
        }
    };
    return CreditsController = _classThis;
})();
exports.CreditsController = CreditsController;
//# sourceMappingURL=addons.controller.js.map