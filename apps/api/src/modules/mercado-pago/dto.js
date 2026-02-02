"use strict";
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardPaymentDto = exports.WebhookDto = exports.CreatePixDto = exports.CreatePreferenceDto = void 0;
const class_validator_1 = require("class-validator");
let CreatePreferenceDto = (() => {
    let _invoiceId_decorators;
    let _invoiceId_initializers = [];
    let _invoiceId_extraInitializers = [];
    let _successUrl_decorators;
    let _successUrl_initializers = [];
    let _successUrl_extraInitializers = [];
    let _failureUrl_decorators;
    let _failureUrl_initializers = [];
    let _failureUrl_extraInitializers = [];
    let _pendingUrl_decorators;
    let _pendingUrl_initializers = [];
    let _pendingUrl_extraInitializers = [];
    return class CreatePreferenceDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _invoiceId_decorators = [(0, class_validator_1.IsUUID)()];
            _successUrl_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _failureUrl_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _pendingUrl_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _invoiceId_decorators, { kind: "field", name: "invoiceId", static: false, private: false, access: { has: obj => "invoiceId" in obj, get: obj => obj.invoiceId, set: (obj, value) => { obj.invoiceId = value; } }, metadata: _metadata }, _invoiceId_initializers, _invoiceId_extraInitializers);
            __esDecorate(null, null, _successUrl_decorators, { kind: "field", name: "successUrl", static: false, private: false, access: { has: obj => "successUrl" in obj, get: obj => obj.successUrl, set: (obj, value) => { obj.successUrl = value; } }, metadata: _metadata }, _successUrl_initializers, _successUrl_extraInitializers);
            __esDecorate(null, null, _failureUrl_decorators, { kind: "field", name: "failureUrl", static: false, private: false, access: { has: obj => "failureUrl" in obj, get: obj => obj.failureUrl, set: (obj, value) => { obj.failureUrl = value; } }, metadata: _metadata }, _failureUrl_initializers, _failureUrl_extraInitializers);
            __esDecorate(null, null, _pendingUrl_decorators, { kind: "field", name: "pendingUrl", static: false, private: false, access: { has: obj => "pendingUrl" in obj, get: obj => obj.pendingUrl, set: (obj, value) => { obj.pendingUrl = value; } }, metadata: _metadata }, _pendingUrl_initializers, _pendingUrl_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        invoiceId = __runInitializers(this, _invoiceId_initializers, void 0);
        successUrl = (__runInitializers(this, _invoiceId_extraInitializers), __runInitializers(this, _successUrl_initializers, void 0));
        failureUrl = (__runInitializers(this, _successUrl_extraInitializers), __runInitializers(this, _failureUrl_initializers, void 0));
        pendingUrl = (__runInitializers(this, _failureUrl_extraInitializers), __runInitializers(this, _pendingUrl_initializers, void 0));
        constructor() {
            __runInitializers(this, _pendingUrl_extraInitializers);
        }
    };
})();
exports.CreatePreferenceDto = CreatePreferenceDto;
let CreatePixDto = (() => {
    let _invoiceId_decorators;
    let _invoiceId_initializers = [];
    let _invoiceId_extraInitializers = [];
    let _expirationMinutes_decorators;
    let _expirationMinutes_initializers = [];
    let _expirationMinutes_extraInitializers = [];
    return class CreatePixDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _invoiceId_decorators = [(0, class_validator_1.IsUUID)()];
            _expirationMinutes_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _invoiceId_decorators, { kind: "field", name: "invoiceId", static: false, private: false, access: { has: obj => "invoiceId" in obj, get: obj => obj.invoiceId, set: (obj, value) => { obj.invoiceId = value; } }, metadata: _metadata }, _invoiceId_initializers, _invoiceId_extraInitializers);
            __esDecorate(null, null, _expirationMinutes_decorators, { kind: "field", name: "expirationMinutes", static: false, private: false, access: { has: obj => "expirationMinutes" in obj, get: obj => obj.expirationMinutes, set: (obj, value) => { obj.expirationMinutes = value; } }, metadata: _metadata }, _expirationMinutes_initializers, _expirationMinutes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        invoiceId = __runInitializers(this, _invoiceId_initializers, void 0);
        expirationMinutes = (__runInitializers(this, _invoiceId_extraInitializers), __runInitializers(this, _expirationMinutes_initializers, void 0));
        constructor() {
            __runInitializers(this, _expirationMinutes_extraInitializers);
        }
    };
})();
exports.CreatePixDto = CreatePixDto;
let WebhookDto = (() => {
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _action_decorators;
    let _action_initializers = [];
    let _action_extraInitializers = [];
    let _data_decorators;
    let _data_initializers = [];
    let _data_extraInitializers = [];
    return class WebhookDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _type_decorators = [(0, class_validator_1.IsString)()];
            _action_decorators = [(0, class_validator_1.IsString)()];
            _data_decorators = [(0, class_validator_1.IsObject)()];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _action_decorators, { kind: "field", name: "action", static: false, private: false, access: { has: obj => "action" in obj, get: obj => obj.action, set: (obj, value) => { obj.action = value; } }, metadata: _metadata }, _action_initializers, _action_extraInitializers);
            __esDecorate(null, null, _data_decorators, { kind: "field", name: "data", static: false, private: false, access: { has: obj => "data" in obj, get: obj => obj.data, set: (obj, value) => { obj.data = value; } }, metadata: _metadata }, _data_initializers, _data_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        type = __runInitializers(this, _type_initializers, void 0);
        action = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _action_initializers, void 0));
        data = (__runInitializers(this, _action_extraInitializers), __runInitializers(this, _data_initializers, void 0));
        constructor() {
            __runInitializers(this, _data_extraInitializers);
        }
    };
})();
exports.WebhookDto = WebhookDto;
let CardPaymentDto = (() => {
    let _invoiceId_decorators;
    let _invoiceId_initializers = [];
    let _invoiceId_extraInitializers = [];
    let _token_decorators;
    let _token_initializers = [];
    let _token_extraInitializers = [];
    let _paymentMethodId_decorators;
    let _paymentMethodId_initializers = [];
    let _paymentMethodId_extraInitializers = [];
    let _installments_decorators;
    let _installments_initializers = [];
    let _installments_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    return class CardPaymentDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _invoiceId_decorators = [(0, class_validator_1.IsUUID)()];
            _token_decorators = [(0, class_validator_1.IsString)()];
            _paymentMethodId_decorators = [(0, class_validator_1.IsString)()];
            _installments_decorators = [(0, class_validator_1.IsNumber)()];
            _email_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _invoiceId_decorators, { kind: "field", name: "invoiceId", static: false, private: false, access: { has: obj => "invoiceId" in obj, get: obj => obj.invoiceId, set: (obj, value) => { obj.invoiceId = value; } }, metadata: _metadata }, _invoiceId_initializers, _invoiceId_extraInitializers);
            __esDecorate(null, null, _token_decorators, { kind: "field", name: "token", static: false, private: false, access: { has: obj => "token" in obj, get: obj => obj.token, set: (obj, value) => { obj.token = value; } }, metadata: _metadata }, _token_initializers, _token_extraInitializers);
            __esDecorate(null, null, _paymentMethodId_decorators, { kind: "field", name: "paymentMethodId", static: false, private: false, access: { has: obj => "paymentMethodId" in obj, get: obj => obj.paymentMethodId, set: (obj, value) => { obj.paymentMethodId = value; } }, metadata: _metadata }, _paymentMethodId_initializers, _paymentMethodId_extraInitializers);
            __esDecorate(null, null, _installments_decorators, { kind: "field", name: "installments", static: false, private: false, access: { has: obj => "installments" in obj, get: obj => obj.installments, set: (obj, value) => { obj.installments = value; } }, metadata: _metadata }, _installments_initializers, _installments_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        invoiceId = __runInitializers(this, _invoiceId_initializers, void 0);
        token = (__runInitializers(this, _invoiceId_extraInitializers), __runInitializers(this, _token_initializers, void 0));
        paymentMethodId = (__runInitializers(this, _token_extraInitializers), __runInitializers(this, _paymentMethodId_initializers, void 0));
        installments = (__runInitializers(this, _paymentMethodId_extraInitializers), __runInitializers(this, _installments_initializers, void 0));
        email = (__runInitializers(this, _installments_extraInitializers), __runInitializers(this, _email_initializers, void 0));
        constructor() {
            __runInitializers(this, _email_extraInitializers);
        }
    };
})();
exports.CardPaymentDto = CardPaymentDto;
//# sourceMappingURL=dto.js.map