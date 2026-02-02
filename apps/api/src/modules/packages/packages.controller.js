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
exports.PackagesController = void 0;
const common_1 = require("@nestjs/common");
let PackagesController = (() => {
    let _classDecorators = [(0, common_1.Controller)('packages')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _findById_decorators;
    let _getPackageServices_decorators;
    let _create_decorators;
    let _update_decorators;
    let _deactivate_decorators;
    let _isServiceIncluded_decorators;
    var PackagesController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, common_1.Get)()];
            _findById_decorators = [(0, common_1.Get)(':id')];
            _getPackageServices_decorators = [(0, common_1.Get)(':id/services')];
            _create_decorators = [(0, common_1.Post)()];
            _update_decorators = [(0, common_1.Patch)(':id')];
            _deactivate_decorators = [(0, common_1.Delete)(':id')];
            _isServiceIncluded_decorators = [(0, common_1.Get)(':id/check-service/:serviceId')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPackageServices_decorators, { kind: "method", name: "getPackageServices", static: false, private: false, access: { has: obj => "getPackageServices" in obj, get: obj => obj.getPackageServices }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deactivate_decorators, { kind: "method", name: "deactivate", static: false, private: false, access: { has: obj => "deactivate" in obj, get: obj => obj.deactivate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _isServiceIncluded_decorators, { kind: "method", name: "isServiceIncluded", static: false, private: false, access: { has: obj => "isServiceIncluded" in obj, get: obj => obj.isServiceIncluded }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PackagesController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        packagesService = __runInitializers(this, _instanceExtraInitializers);
        constructor(packagesService) {
            this.packagesService = packagesService;
        }
        /**
         * GET /packages
         * List all active packages for a salon
         */
        async findAll(salonId) {
            if (!salonId) {
                throw new common_1.BadRequestException('salonId is required');
            }
            return this.packagesService.findAll(salonId);
        }
        /**
         * GET /packages/:id
         * Find package by ID with services
         */
        async findById(id) {
            const pkg = await this.packagesService.findById(id);
            if (!pkg) {
                throw new common_1.NotFoundException('Package not found');
            }
            return pkg;
        }
        /**
         * GET /packages/:id/services
         * Get services included in a package
         */
        async getPackageServices(id) {
            const pkg = await this.packagesService.findById(id);
            if (!pkg) {
                throw new common_1.NotFoundException('Package not found');
            }
            return this.packagesService.getPackageServices(id);
        }
        /**
         * POST /packages
         * Create a new package with services
         */
        async create(data) {
            return this.packagesService.create(data);
        }
        /**
         * PATCH /packages/:id
         * Update a package
         */
        async update(id, data) {
            const pkg = await this.packagesService.update(id, data);
            if (!pkg) {
                throw new common_1.NotFoundException('Package not found');
            }
            return pkg;
        }
        /**
         * DELETE /packages/:id
         * Deactivate a package (soft delete)
         */
        async deactivate(id) {
            const pkg = await this.packagesService.deactivate(id);
            if (!pkg) {
                throw new common_1.NotFoundException('Package not found');
            }
            return { message: 'Package deactivated successfully' };
        }
        /**
         * POST /packages/:id/check-service/:serviceId
         * Check if a service is included in a package
         */
        async isServiceIncluded(id, serviceId) {
            const isIncluded = await this.packagesService.isServiceIncluded(id, serviceId);
            const sessions = await this.packagesService.getSessionsForService(id, serviceId);
            return {
                isIncluded,
                sessionsIncluded: sessions,
            };
        }
    };
    return PackagesController = _classThis;
})();
exports.PackagesController = PackagesController;
//# sourceMappingURL=packages.controller.js.map