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
exports.CartLinksController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let CartLinksController = (() => {
    let _classDecorators = [(0, common_1.Controller)('cart-links')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getLinks_decorators;
    let _getStats_decorators;
    let _getLinkById_decorators;
    let _createLink_decorators;
    let _updateLink_decorators;
    let _deleteLink_decorators;
    let _getPublicLink_decorators;
    let _convertPublicLink_decorators;
    let _convertLink_decorators;
    var CartLinksController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getLinks_decorators = [(0, common_1.Get)(), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _getStats_decorators = [(0, common_1.Get)('stats'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getLinkById_decorators = [(0, common_1.Get)(':id'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _createLink_decorators = [(0, common_1.Post)(), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _updateLink_decorators = [(0, common_1.Patch)(':id'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _deleteLink_decorators = [(0, common_1.Delete)(':id'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getPublicLink_decorators = [(0, common_1.Get)('public/:code')];
            _convertPublicLink_decorators = [(0, common_1.Post)('public/:code/convert')];
            _convertLink_decorators = [(0, common_1.Post)(':id/convert'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            __esDecorate(this, null, _getLinks_decorators, { kind: "method", name: "getLinks", static: false, private: false, access: { has: obj => "getLinks" in obj, get: obj => obj.getLinks }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getLinkById_decorators, { kind: "method", name: "getLinkById", static: false, private: false, access: { has: obj => "getLinkById" in obj, get: obj => obj.getLinkById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createLink_decorators, { kind: "method", name: "createLink", static: false, private: false, access: { has: obj => "createLink" in obj, get: obj => obj.createLink }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateLink_decorators, { kind: "method", name: "updateLink", static: false, private: false, access: { has: obj => "updateLink" in obj, get: obj => obj.updateLink }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteLink_decorators, { kind: "method", name: "deleteLink", static: false, private: false, access: { has: obj => "deleteLink" in obj, get: obj => obj.deleteLink }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPublicLink_decorators, { kind: "method", name: "getPublicLink", static: false, private: false, access: { has: obj => "getPublicLink" in obj, get: obj => obj.getPublicLink }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _convertPublicLink_decorators, { kind: "method", name: "convertPublicLink", static: false, private: false, access: { has: obj => "convertPublicLink" in obj, get: obj => obj.convertPublicLink }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _convertLink_decorators, { kind: "method", name: "convertLink", static: false, private: false, access: { has: obj => "convertLink" in obj, get: obj => obj.convertLink }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CartLinksController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        cartLinksService = __runInitializers(this, _instanceExtraInitializers);
        constructor(cartLinksService) {
            this.cartLinksService = cartLinksService;
        }
        // ==================== AUTHENTICATED ROUTES ====================
        async getLinks(req, page, limit, status, source, clientId) {
            return this.cartLinksService.getLinks(req.user.salonId, {
                page: page ? parseInt(page, 10) : undefined,
                limit: limit ? parseInt(limit, 10) : undefined,
                status,
                source,
                clientId,
            });
        }
        async getStats(req, startDate, endDate) {
            return this.cartLinksService.getStats(req.user.salonId, startDate, endDate);
        }
        async getLinkById(req, id) {
            return this.cartLinksService.getLinkById(req.user.salonId, id);
        }
        async createLink(req, dto) {
            return this.cartLinksService.createLink(req.user.salonId, dto, req.user.userId);
        }
        async updateLink(req, id, dto) {
            return this.cartLinksService.updateLink(req.user.salonId, id, dto);
        }
        async deleteLink(req, id) {
            await this.cartLinksService.deleteLink(req.user.salonId, id);
            return { success: true };
        }
        // ==================== PUBLIC ROUTES ====================
        async getPublicLink(code, ip, userAgent, referrer) {
            // Record view
            await this.cartLinksService.recordView(code, { ipAddress: ip, userAgent, referrer });
            return this.cartLinksService.getLinkByCode(code);
        }
        async convertPublicLink(code, dto) {
            return this.cartLinksService.convertLink(code, dto);
        }
        // ==================== AUTHENTICATED CONVERSION ====================
        async convertLink(req, id, dto) {
            const link = await this.cartLinksService.getLinkById(req.user.salonId, id);
            return this.cartLinksService.convertLink(link.code, dto, req.user.userId);
        }
    };
    return CartLinksController = _classThis;
})();
exports.CartLinksController = CartLinksController;
//# sourceMappingURL=cart-links.controller.js.map