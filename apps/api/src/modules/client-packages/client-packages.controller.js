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
exports.ClientPackagesController = void 0;
const common_1 = require("@nestjs/common");
let ClientPackagesController = (() => {
    let _classDecorators = [(0, common_1.Controller)('client-packages')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findByClient_decorators;
    let _findActiveByClient_decorators;
    let _getClientStats_decorators;
    let _findById_decorators;
    let _getBalances_decorators;
    let _getUsageHistory_decorators;
    let _purchase_decorators;
    let _consumeSession_decorators;
    let _useSession_decorators;
    let _revertSession_decorators;
    let _checkService_decorators;
    let _cancel_decorators;
    var ClientPackagesController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findByClient_decorators = [(0, common_1.Get)('client/:clientId')];
            _findActiveByClient_decorators = [(0, common_1.Get)('client/:clientId/active')];
            _getClientStats_decorators = [(0, common_1.Get)('client/:clientId/stats')];
            _findById_decorators = [(0, common_1.Get)(':id')];
            _getBalances_decorators = [(0, common_1.Get)(':id/balances')];
            _getUsageHistory_decorators = [(0, common_1.Get)(':id/history')];
            _purchase_decorators = [(0, common_1.Post)('purchase')];
            _consumeSession_decorators = [(0, common_1.Post)('consume')];
            _useSession_decorators = [(0, common_1.Post)(':id/use')];
            _revertSession_decorators = [(0, common_1.Post)('usages/:usageId/revert')];
            _checkService_decorators = [(0, common_1.Post)('check-service')];
            _cancel_decorators = [(0, common_1.Delete)(':id')];
            __esDecorate(this, null, _findByClient_decorators, { kind: "method", name: "findByClient", static: false, private: false, access: { has: obj => "findByClient" in obj, get: obj => obj.findByClient }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findActiveByClient_decorators, { kind: "method", name: "findActiveByClient", static: false, private: false, access: { has: obj => "findActiveByClient" in obj, get: obj => obj.findActiveByClient }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getClientStats_decorators, { kind: "method", name: "getClientStats", static: false, private: false, access: { has: obj => "getClientStats" in obj, get: obj => obj.getClientStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getBalances_decorators, { kind: "method", name: "getBalances", static: false, private: false, access: { has: obj => "getBalances" in obj, get: obj => obj.getBalances }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getUsageHistory_decorators, { kind: "method", name: "getUsageHistory", static: false, private: false, access: { has: obj => "getUsageHistory" in obj, get: obj => obj.getUsageHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _purchase_decorators, { kind: "method", name: "purchase", static: false, private: false, access: { has: obj => "purchase" in obj, get: obj => obj.purchase }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _consumeSession_decorators, { kind: "method", name: "consumeSession", static: false, private: false, access: { has: obj => "consumeSession" in obj, get: obj => obj.consumeSession }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _useSession_decorators, { kind: "method", name: "useSession", static: false, private: false, access: { has: obj => "useSession" in obj, get: obj => obj.useSession }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _revertSession_decorators, { kind: "method", name: "revertSession", static: false, private: false, access: { has: obj => "revertSession" in obj, get: obj => obj.revertSession }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkService_decorators, { kind: "method", name: "checkService", static: false, private: false, access: { has: obj => "checkService" in obj, get: obj => obj.checkService }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cancel_decorators, { kind: "method", name: "cancel", static: false, private: false, access: { has: obj => "cancel" in obj, get: obj => obj.cancel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ClientPackagesController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        clientPackagesService = __runInitializers(this, _instanceExtraInitializers);
        constructor(clientPackagesService) {
            this.clientPackagesService = clientPackagesService;
        }
        /**
         * GET /client-packages/client/:clientId
         * List all packages for a client
         */
        async findByClient(clientId) {
            return this.clientPackagesService.findByClient(clientId);
        }
        /**
         * GET /client-packages/client/:clientId/active
         * List active packages with balances for a client
         */
        async findActiveByClient(clientId) {
            return this.clientPackagesService.findActiveByClientWithBalances(clientId);
        }
        /**
         * GET /client-packages/client/:clientId/stats
         * Get client package statistics
         */
        async getClientStats(clientId) {
            return this.clientPackagesService.getClientStats(clientId);
        }
        /**
         * GET /client-packages/:id
         * Find client package by ID
         */
        async findById(id) {
            const clientPkg = await this.clientPackagesService.findById(id);
            if (!clientPkg) {
                throw new common_1.NotFoundException('Client package not found');
            }
            return clientPkg;
        }
        /**
         * GET /client-packages/:id/balances
         * Get balances for a client package
         */
        async getBalances(id) {
            const clientPkg = await this.clientPackagesService.findByIdWithBalances(id);
            if (!clientPkg) {
                throw new common_1.NotFoundException('Client package not found');
            }
            return clientPkg;
        }
        /**
         * GET /client-packages/:id/history
         * Get usage history for a client package
         */
        async getUsageHistory(id) {
            const clientPkg = await this.clientPackagesService.findById(id);
            if (!clientPkg) {
                throw new common_1.NotFoundException('Client package not found');
            }
            return this.clientPackagesService.getUsageHistory(id);
        }
        /**
         * POST /client-packages/purchase
         * Purchase a package for a client
         */
        async purchase(data) {
            return this.clientPackagesService.purchasePackage(data.clientId, data.packageId, data.salonId);
        }
        /**
         * POST /client-packages/consume
         * Consume a session from a package
         */
        async consumeSession(data) {
            return this.clientPackagesService.consumeSession(data);
        }
        /**
         * POST /client-packages/:id/use
         * Use a session from the package (legacy endpoint)
         * @deprecated Use POST /client-packages/consume instead
         */
        async useSession(id) {
            return this.clientPackagesService.useSession(id);
        }
        /**
         * POST /client-packages/usages/:usageId/revert
         * Revert a consumed session
         */
        async revertSession(usageId, data) {
            return this.clientPackagesService.revertSession(usageId, data.notes);
        }
        /**
         * POST /client-packages/check-service
         * Check if client has valid package for a service
         */
        async checkService(data) {
            return this.clientPackagesService.hasValidPackageForService(data.clientId, data.serviceId);
        }
        /**
         * DELETE /client-packages/:id
         * Cancel a client package
         */
        async cancel(id) {
            const clientPkg = await this.clientPackagesService.cancel(id);
            if (!clientPkg) {
                throw new common_1.NotFoundException('Client package not found');
            }
            return { message: 'Package cancelled successfully' };
        }
    };
    return ClientPackagesController = _classThis;
})();
exports.ClientPackagesController = ClientPackagesController;
//# sourceMappingURL=client-packages.controller.js.map