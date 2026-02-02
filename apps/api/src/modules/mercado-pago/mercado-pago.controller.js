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
exports.MercadoPagoController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let MercadoPagoController = (() => {
    let _classDecorators = [(0, common_1.Controller)('mercado-pago')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getPublicKey_decorators;
    let _createPix_decorators;
    let _createPreference_decorators;
    let _handleWebhook_decorators;
    let _getPaymentStatus_decorators;
    let _simulatePayment_decorators;
    var MercadoPagoController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getPublicKey_decorators = [(0, common_1.Get)('public-key'), (0, public_decorator_1.Public)()];
            _createPix_decorators = [(0, common_1.Post)('create-pix'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER')];
            _createPreference_decorators = [(0, common_1.Post)('create-preference'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER')];
            _handleWebhook_decorators = [(0, common_1.Post)('webhook'), (0, public_decorator_1.Public)(), (0, common_1.HttpCode)(200)];
            _getPaymentStatus_decorators = [(0, common_1.Get)('payment/:id'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
            _simulatePayment_decorators = [(0, common_1.Post)('simulate/:invoiceId'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'OWNER')];
            __esDecorate(this, null, _getPublicKey_decorators, { kind: "method", name: "getPublicKey", static: false, private: false, access: { has: obj => "getPublicKey" in obj, get: obj => obj.getPublicKey }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createPix_decorators, { kind: "method", name: "createPix", static: false, private: false, access: { has: obj => "createPix" in obj, get: obj => obj.createPix }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createPreference_decorators, { kind: "method", name: "createPreference", static: false, private: false, access: { has: obj => "createPreference" in obj, get: obj => obj.createPreference }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleWebhook_decorators, { kind: "method", name: "handleWebhook", static: false, private: false, access: { has: obj => "handleWebhook" in obj, get: obj => obj.handleWebhook }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPaymentStatus_decorators, { kind: "method", name: "getPaymentStatus", static: false, private: false, access: { has: obj => "getPaymentStatus" in obj, get: obj => obj.getPaymentStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _simulatePayment_decorators, { kind: "method", name: "simulatePayment", static: false, private: false, access: { has: obj => "simulatePayment" in obj, get: obj => obj.simulatePayment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MercadoPagoController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        mercadoPagoService = __runInitializers(this, _instanceExtraInitializers);
        constructor(mercadoPagoService) {
            this.mercadoPagoService = mercadoPagoService;
        }
        /**
         * GET /mercado-pago/public-key - Get public key for frontend SDK
         */
        getPublicKey() {
            return {
                publicKey: this.mercadoPagoService.getPublicKey(),
            };
        }
        /**
         * POST /mercado-pago/create-pix - Create PIX payment
         */
        async createPix(dto) {
            return this.mercadoPagoService.createPixPayment(dto.invoiceId);
        }
        /**
         * POST /mercado-pago/create-preference - Create checkout preference
         */
        async createPreference(dto) {
            return this.mercadoPagoService.createPreference(dto.invoiceId, {
                success: dto.successUrl,
                failure: dto.failureUrl,
                pending: dto.pendingUrl,
            });
        }
        /**
         * POST /mercado-pago/webhook - Receive webhook notifications
         */
        async handleWebhook(body, _signature, _requestId) {
            // TODO: Verify signature in production
            // const isValid = this.mercadoPagoService.verifyWebhookSignature(
            //   _signature,
            //   _requestId,
            //   body.data.id,
            //   new Date().toISOString()
            // );
            await this.mercadoPagoService.handleWebhook(body.type, body.data);
            return { received: true };
        }
        /**
         * GET /mercado-pago/payment/:id - Get payment status
         */
        async getPaymentStatus(paymentId) {
            return this.mercadoPagoService.getPaymentStatus(paymentId);
        }
        /**
         * POST /mercado-pago/simulate/:invoiceId - Simulate payment (dev only)
         */
        async simulatePayment(invoiceId) {
            await this.mercadoPagoService.simulatePayment(invoiceId);
            return { success: true, message: 'Pagamento simulado com sucesso' };
        }
    };
    return MercadoPagoController = _classThis;
})();
exports.MercadoPagoController = MercadoPagoController;
//# sourceMappingURL=mercado-pago.controller.js.map