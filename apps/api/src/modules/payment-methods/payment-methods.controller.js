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
exports.PaymentMethodsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let PaymentMethodsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('payment-methods'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _findById_decorators;
    let _create_decorators;
    let _update_decorators;
    let _delete_decorators;
    let _reactivate_decorators;
    var PaymentMethodsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, common_1.Get)()];
            _findById_decorators = [(0, common_1.Get)(':id')];
            _create_decorators = [(0, common_1.Post)(), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _update_decorators = [(0, common_1.Patch)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _delete_decorators = [(0, common_1.Delete)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _reactivate_decorators = [(0, common_1.Patch)(':id/reactivate'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _reactivate_decorators, { kind: "method", name: "reactivate", static: false, private: false, access: { has: obj => "reactivate" in obj, get: obj => obj.reactivate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PaymentMethodsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        paymentMethodsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(paymentMethodsService) {
            this.paymentMethodsService = paymentMethodsService;
        }
        /**
         * GET /payment-methods
         * Lista todas as formas de pagamento do salão
         */
        async findAll(user, all) {
            const includeInactive = all === 'true';
            // Seed default methods se necessário
            await this.paymentMethodsService.seedDefaultMethods(user.salonId);
            return this.paymentMethodsService.findAll(user.salonId, includeInactive);
        }
        /**
         * GET /payment-methods/:id
         * Busca uma forma de pagamento por ID
         */
        async findById(id, user) {
            const item = await this.paymentMethodsService.findById(id);
            if (!item || item.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Forma de pagamento não encontrada');
            }
            return item;
        }
        /**
         * POST /payment-methods
         * Cria uma nova forma de pagamento
         */
        async create(user, data) {
            return this.paymentMethodsService.create(user.salonId, data);
        }
        /**
         * PATCH /payment-methods/:id
         * Atualiza uma forma de pagamento
         */
        async update(id, user, data) {
            const existing = await this.paymentMethodsService.findById(id);
            if (!existing || existing.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Forma de pagamento não encontrada');
            }
            return this.paymentMethodsService.update(id, data);
        }
        /**
         * DELETE /payment-methods/:id
         * Desativa uma forma de pagamento (soft delete)
         */
        async delete(id, user) {
            const existing = await this.paymentMethodsService.findById(id);
            if (!existing || existing.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Forma de pagamento não encontrada');
            }
            await this.paymentMethodsService.delete(id);
            return { message: 'Forma de pagamento desativada com sucesso' };
        }
        /**
         * PATCH /payment-methods/:id/reactivate
         * Reativa uma forma de pagamento
         */
        async reactivate(id, user) {
            const existing = await this.paymentMethodsService.findById(id);
            if (!existing || existing.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Forma de pagamento não encontrada');
            }
            return this.paymentMethodsService.reactivate(id);
        }
    };
    return PaymentMethodsController = _classThis;
})();
exports.PaymentMethodsController = PaymentMethodsController;
//# sourceMappingURL=payment-methods.controller.js.map