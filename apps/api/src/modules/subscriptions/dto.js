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
exports.InvoiceFiltersDto = exports.PayInvoiceDto = exports.CreateInvoiceDto = exports.ReactivateSubscriptionDto = exports.CancelSubscriptionDto = exports.ChangePlanDto = exports.StartTrialDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
let StartTrialDto = (() => {
    let _planId_decorators;
    let _planId_initializers = [];
    let _planId_extraInitializers = [];
    let _trialDays_decorators;
    let _trialDays_initializers = [];
    let _trialDays_extraInitializers = [];
    return class StartTrialDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _planId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do plano para iniciar trial (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsUUID)()];
            _trialDays_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Duração do período de trial em dias', example: 14 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _planId_decorators, { kind: "field", name: "planId", static: false, private: false, access: { has: obj => "planId" in obj, get: obj => obj.planId, set: (obj, value) => { obj.planId = value; } }, metadata: _metadata }, _planId_initializers, _planId_extraInitializers);
            __esDecorate(null, null, _trialDays_decorators, { kind: "field", name: "trialDays", static: false, private: false, access: { has: obj => "trialDays" in obj, get: obj => obj.trialDays, set: (obj, value) => { obj.trialDays = value; } }, metadata: _metadata }, _trialDays_initializers, _trialDays_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        planId = __runInitializers(this, _planId_initializers, void 0);
        trialDays = (__runInitializers(this, _planId_extraInitializers), __runInitializers(this, _trialDays_initializers, void 0));
        constructor() {
            __runInitializers(this, _trialDays_extraInitializers);
        }
    };
})();
exports.StartTrialDto = StartTrialDto;
let ChangePlanDto = (() => {
    let _newPlanId_decorators;
    let _newPlanId_initializers = [];
    let _newPlanId_extraInitializers = [];
    let _billingPeriod_decorators;
    let _billingPeriod_initializers = [];
    let _billingPeriod_extraInitializers = [];
    return class ChangePlanDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _newPlanId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do novo plano (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' }), (0, class_validator_1.IsUUID)()];
            _billingPeriod_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Período de cobrança', enum: ['MONTHLY', 'YEARLY'], example: 'MONTHLY' }), (0, class_validator_1.IsEnum)(['MONTHLY', 'YEARLY']), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _newPlanId_decorators, { kind: "field", name: "newPlanId", static: false, private: false, access: { has: obj => "newPlanId" in obj, get: obj => obj.newPlanId, set: (obj, value) => { obj.newPlanId = value; } }, metadata: _metadata }, _newPlanId_initializers, _newPlanId_extraInitializers);
            __esDecorate(null, null, _billingPeriod_decorators, { kind: "field", name: "billingPeriod", static: false, private: false, access: { has: obj => "billingPeriod" in obj, get: obj => obj.billingPeriod, set: (obj, value) => { obj.billingPeriod = value; } }, metadata: _metadata }, _billingPeriod_initializers, _billingPeriod_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        newPlanId = __runInitializers(this, _newPlanId_initializers, void 0);
        billingPeriod = (__runInitializers(this, _newPlanId_extraInitializers), __runInitializers(this, _billingPeriod_initializers, void 0));
        constructor() {
            __runInitializers(this, _billingPeriod_extraInitializers);
        }
    };
})();
exports.ChangePlanDto = ChangePlanDto;
let CancelSubscriptionDto = (() => {
    let _cancelAtPeriodEnd_decorators;
    let _cancelAtPeriodEnd_initializers = [];
    let _cancelAtPeriodEnd_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    return class CancelSubscriptionDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _cancelAtPeriodEnd_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Cancelar ao fim do período atual', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _reason_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Motivo do cancelamento', example: 'Não estou usando o sistema' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _cancelAtPeriodEnd_decorators, { kind: "field", name: "cancelAtPeriodEnd", static: false, private: false, access: { has: obj => "cancelAtPeriodEnd" in obj, get: obj => obj.cancelAtPeriodEnd, set: (obj, value) => { obj.cancelAtPeriodEnd = value; } }, metadata: _metadata }, _cancelAtPeriodEnd_initializers, _cancelAtPeriodEnd_extraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        cancelAtPeriodEnd = __runInitializers(this, _cancelAtPeriodEnd_initializers, void 0);
        reason = (__runInitializers(this, _cancelAtPeriodEnd_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
        constructor() {
            __runInitializers(this, _reason_extraInitializers);
        }
    };
})();
exports.CancelSubscriptionDto = CancelSubscriptionDto;
let ReactivateSubscriptionDto = (() => {
    let _planId_decorators;
    let _planId_initializers = [];
    let _planId_extraInitializers = [];
    return class ReactivateSubscriptionDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _planId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do plano para reativar (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _planId_decorators, { kind: "field", name: "planId", static: false, private: false, access: { has: obj => "planId" in obj, get: obj => obj.planId, set: (obj, value) => { obj.planId = value; } }, metadata: _metadata }, _planId_initializers, _planId_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        planId = __runInitializers(this, _planId_initializers, void 0);
        constructor() {
            __runInitializers(this, _planId_extraInitializers);
        }
    };
})();
exports.ReactivateSubscriptionDto = ReactivateSubscriptionDto;
let CreateInvoiceDto = (() => {
    let _subscriptionId_decorators;
    let _subscriptionId_initializers = [];
    let _subscriptionId_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _dueDate_decorators;
    let _dueDate_initializers = [];
    let _dueDate_extraInitializers = [];
    return class CreateInvoiceDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _subscriptionId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID da assinatura (UUID)', example: '550e8400-e29b-41d4-a716-446655440002' }), (0, class_validator_1.IsUUID)()];
            _amount_decorators = [(0, swagger_1.ApiProperty)({ description: 'Valor da fatura em reais', example: 99.90 }), (0, class_validator_1.IsNumber)()];
            _dueDate_decorators = [(0, swagger_1.ApiProperty)({ description: 'Data de vencimento (ISO 8601)', example: '2024-02-15T00:00:00Z' }), (0, class_transformer_1.Type)(() => Date), (0, class_validator_1.IsDate)()];
            __esDecorate(null, null, _subscriptionId_decorators, { kind: "field", name: "subscriptionId", static: false, private: false, access: { has: obj => "subscriptionId" in obj, get: obj => obj.subscriptionId, set: (obj, value) => { obj.subscriptionId = value; } }, metadata: _metadata }, _subscriptionId_initializers, _subscriptionId_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _dueDate_decorators, { kind: "field", name: "dueDate", static: false, private: false, access: { has: obj => "dueDate" in obj, get: obj => obj.dueDate, set: (obj, value) => { obj.dueDate = value; } }, metadata: _metadata }, _dueDate_initializers, _dueDate_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        subscriptionId = __runInitializers(this, _subscriptionId_initializers, void 0);
        amount = (__runInitializers(this, _subscriptionId_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
        dueDate = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _dueDate_initializers, void 0));
        constructor() {
            __runInitializers(this, _dueDate_extraInitializers);
        }
    };
})();
exports.CreateInvoiceDto = CreateInvoiceDto;
let PayInvoiceDto = (() => {
    let _method_decorators;
    let _method_initializers = [];
    let _method_extraInitializers = [];
    let _cardToken_decorators;
    let _cardToken_initializers = [];
    let _cardToken_extraInitializers = [];
    return class PayInvoiceDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _method_decorators = [(0, swagger_1.ApiProperty)({ description: 'Método de pagamento', enum: ['PIX', 'CARD', 'BOLETO'], example: 'PIX' }), (0, class_validator_1.IsEnum)(['PIX', 'CARD', 'BOLETO'])];
            _cardToken_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Token do cartão (quando pagamento por cartão)', example: 'tok_xxxxxxxxxxxx' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _method_decorators, { kind: "field", name: "method", static: false, private: false, access: { has: obj => "method" in obj, get: obj => obj.method, set: (obj, value) => { obj.method = value; } }, metadata: _metadata }, _method_initializers, _method_extraInitializers);
            __esDecorate(null, null, _cardToken_decorators, { kind: "field", name: "cardToken", static: false, private: false, access: { has: obj => "cardToken" in obj, get: obj => obj.cardToken, set: (obj, value) => { obj.cardToken = value; } }, metadata: _metadata }, _cardToken_initializers, _cardToken_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        method = __runInitializers(this, _method_initializers, void 0);
        cardToken = (__runInitializers(this, _method_extraInitializers), __runInitializers(this, _cardToken_initializers, void 0));
        constructor() {
            __runInitializers(this, _cardToken_extraInitializers);
        }
    };
})();
exports.PayInvoiceDto = PayInvoiceDto;
let InvoiceFiltersDto = (() => {
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _startDate_decorators;
    let _startDate_initializers = [];
    let _startDate_extraInitializers = [];
    let _endDate_decorators;
    let _endDate_initializers = [];
    let _endDate_extraInitializers = [];
    return class InvoiceFiltersDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _status_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Status da fatura', enum: ['PENDING', 'PAID', 'OVERDUE', 'CANCELED', 'FAILED'], example: 'PENDING' }), (0, class_validator_1.IsEnum)(['PENDING', 'PAID', 'OVERDUE', 'CANCELED', 'FAILED']), (0, class_validator_1.IsOptional)()];
            _startDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data inicial do filtro (ISO 8601)', example: '2024-01-01T00:00:00Z' }), (0, class_transformer_1.Type)(() => Date), (0, class_validator_1.IsDate)(), (0, class_validator_1.IsOptional)()];
            _endDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data final do filtro (ISO 8601)', example: '2024-12-31T23:59:59Z' }), (0, class_transformer_1.Type)(() => Date), (0, class_validator_1.IsDate)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _startDate_decorators, { kind: "field", name: "startDate", static: false, private: false, access: { has: obj => "startDate" in obj, get: obj => obj.startDate, set: (obj, value) => { obj.startDate = value; } }, metadata: _metadata }, _startDate_initializers, _startDate_extraInitializers);
            __esDecorate(null, null, _endDate_decorators, { kind: "field", name: "endDate", static: false, private: false, access: { has: obj => "endDate" in obj, get: obj => obj.endDate, set: (obj, value) => { obj.endDate = value; } }, metadata: _metadata }, _endDate_initializers, _endDate_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        status = __runInitializers(this, _status_initializers, void 0);
        startDate = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _startDate_initializers, void 0));
        endDate = (__runInitializers(this, _startDate_extraInitializers), __runInitializers(this, _endDate_initializers, void 0));
        constructor() {
            __runInitializers(this, _endDate_extraInitializers);
        }
    };
})();
exports.InvoiceFiltersDto = InvoiceFiltersDto;
//# sourceMappingURL=dto.js.map