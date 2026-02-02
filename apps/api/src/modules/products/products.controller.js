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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let ProductsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('products'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _getStats_decorators;
    let _findLowStock_decorators;
    let _findById_decorators;
    let _create_decorators;
    let _update_decorators;
    let _adjustStock_decorators;
    let _transferStock_decorators;
    let _reactivate_decorators;
    let _delete_decorators;
    var ProductsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, common_1.Get)(), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getStats_decorators = [(0, common_1.Get)('stats'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _findLowStock_decorators = [(0, common_1.Get)('low-stock'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _findById_decorators = [(0, common_1.Get)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _create_decorators = [(0, common_1.Post)(), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _update_decorators = [(0, common_1.Patch)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _adjustStock_decorators = [(0, common_1.Post)(':id/adjust-stock'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _transferStock_decorators = [(0, common_1.Post)(':id/transfer'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _reactivate_decorators = [(0, common_1.Patch)(':id/reactivate'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _delete_decorators = [(0, common_1.Delete)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findLowStock_decorators, { kind: "method", name: "findLowStock", static: false, private: false, access: { has: obj => "findLowStock" in obj, get: obj => obj.findLowStock }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _adjustStock_decorators, { kind: "method", name: "adjustStock", static: false, private: false, access: { has: obj => "adjustStock" in obj, get: obj => obj.adjustStock }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _transferStock_decorators, { kind: "method", name: "transferStock", static: false, private: false, access: { has: obj => "transferStock" in obj, get: obj => obj.transferStock }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _reactivate_decorators, { kind: "method", name: "reactivate", static: false, private: false, access: { has: obj => "reactivate" in obj, get: obj => obj.reactivate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ProductsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        productsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(productsService) {
            this.productsService = productsService;
        }
        /**
         * GET /products
         * Lista todos os produtos do salão com filtros opcionais
         */
        async findAll(user, search, includeInactive, lowStockOnly, retailOnly, backbarOnly) {
            return this.productsService.findAll({
                salonId: user.salonId,
                search,
                includeInactive: includeInactive === 'true',
                lowStockOnly: lowStockOnly === 'true',
                retailOnly: retailOnly === 'true',
                backbarOnly: backbarOnly === 'true',
            });
        }
        /**
         * GET /products/stats
         * Retorna estatísticas do estoque
         */
        async getStats(user) {
            return this.productsService.getStats(user.salonId);
        }
        /**
         * GET /products/low-stock
         * Lista produtos com estoque baixo
         */
        async findLowStock(user) {
            return this.productsService.findLowStock(user.salonId);
        }
        /**
         * GET /products/:id
         * Busca produto por ID
         */
        async findById(id, user) {
            const product = await this.productsService.findById(id);
            if (!product || product.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Produto nao encontrado');
            }
            return product;
        }
        /**
         * POST /products
         * Cria um novo produto
         */
        async create(user, data) {
            return this.productsService.create(user.salonId, data);
        }
        /**
         * PATCH /products/:id
         * Atualiza um produto
         */
        async update(id, user, data) {
            // Verificar se produto pertence ao salão
            const existing = await this.productsService.findById(id);
            if (!existing || existing.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Produto nao encontrado');
            }
            const product = await this.productsService.update(id, data);
            return product;
        }
        /**
         * POST /products/:id/adjust-stock
         * Ajusta o estoque (entrada ou saída manual)
         */
        async adjustStock(id, user, data) {
            return this.productsService.adjustStock(id, user.salonId, user.id, data);
        }
        /**
         * POST /products/:id/transfer
         * Transfere estoque entre localizações (RETAIL <-> INTERNAL)
         */
        async transferStock(id, user, data) {
            // Verificar se produto pertence ao salão
            const existing = await this.productsService.findById(id);
            if (!existing || existing.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Produto nao encontrado');
            }
            return this.productsService.transferStock(id, user.salonId, user.id, data.quantity, data.fromLocation, data.toLocation, data.reason);
        }
        /**
         * PATCH /products/:id/reactivate
         * Reativa um produto desativado
         */
        async reactivate(id, user) {
            // Verificar se produto pertence ao salão
            const existing = await this.productsService.findById(id);
            if (!existing || existing.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Produto nao encontrado');
            }
            const product = await this.productsService.reactivate(id);
            return product;
        }
        /**
         * DELETE /products/:id
         * Desativa um produto (soft delete)
         */
        async delete(id, user) {
            // Verificar se produto pertence ao salão
            const existing = await this.productsService.findById(id);
            if (!existing || existing.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Produto nao encontrado');
            }
            await this.productsService.delete(id);
            return { message: 'Produto desativado com sucesso' };
        }
    };
    return ProductsController = _classThis;
})();
exports.ProductsController = ProductsController;
//# sourceMappingURL=products.controller.js.map