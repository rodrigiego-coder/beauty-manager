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
exports.ConsumedProductsController = void 0;
const common_1 = require("@nestjs/common");
let ConsumedProductsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('consumed-products')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _findByAppointment_decorators;
    let _calculateCost_decorators;
    let _calculateProfit_decorators;
    let _register_decorators;
    let _remove_decorators;
    var ConsumedProductsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, common_1.Get)()];
            _findByAppointment_decorators = [(0, common_1.Get)('appointment/:appointmentId')];
            _calculateCost_decorators = [(0, common_1.Get)('appointment/:appointmentId/cost')];
            _calculateProfit_decorators = [(0, common_1.Get)('appointment/:appointmentId/profit')];
            _register_decorators = [(0, common_1.Post)()];
            _remove_decorators = [(0, common_1.Delete)(':id')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByAppointment_decorators, { kind: "method", name: "findByAppointment", static: false, private: false, access: { has: obj => "findByAppointment" in obj, get: obj => obj.findByAppointment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _calculateCost_decorators, { kind: "method", name: "calculateCost", static: false, private: false, access: { has: obj => "calculateCost" in obj, get: obj => obj.calculateCost }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _calculateProfit_decorators, { kind: "method", name: "calculateProfit", static: false, private: false, access: { has: obj => "calculateProfit" in obj, get: obj => obj.calculateProfit }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _register_decorators, { kind: "method", name: "register", static: false, private: false, access: { has: obj => "register" in obj, get: obj => obj.register }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ConsumedProductsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        consumedProductsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(consumedProductsService) {
            this.consumedProductsService = consumedProductsService;
        }
        /**
         * GET /consumed-products
         * Lista todos os produtos consumidos
         */
        async findAll() {
            return this.consumedProductsService.findAll();
        }
        /**
         * GET /consumed-products/appointment/:appointmentId
         * Lista produtos consumidos por agendamento
         */
        async findByAppointment(appointmentId) {
            return this.consumedProductsService.findByAppointment(appointmentId);
        }
        /**
         * GET /consumed-products/appointment/:appointmentId/cost
         * Calcula o custo total de produtos de um atendimento
         */
        async calculateCost(appointmentId) {
            return this.consumedProductsService.calculateAppointmentCost(appointmentId);
        }
        /**
         * GET /consumed-products/appointment/:appointmentId/profit
         * Calcula o lucro real de um atendimento
         */
        async calculateProfit(appointmentId) {
            return this.consumedProductsService.calculateAppointmentProfit(appointmentId);
        }
        /**
         * POST /consumed-products
         * Registra consumo de produto em atendimento
         */
        async register(user, data) {
            return this.consumedProductsService.register({
                ...data,
                salonId: user.salonId,
                userId: user.id,
            });
        }
        /**
         * DELETE /consumed-products/:id
         * Remove um consumo (estorna o estoque)
         */
        async remove(user, id) {
            const removed = await this.consumedProductsService.remove(id, {
                salonId: user.salonId,
                userId: user.id,
            });
            if (!removed) {
                throw new common_1.NotFoundException('Consumo nao encontrado');
            }
            return { message: 'Consumo removido e estoque estornado' };
        }
    };
    return ConsumedProductsController = _classThis;
})();
exports.ConsumedProductsController = ConsumedProductsController;
//# sourceMappingURL=consumed-products.controller.js.map