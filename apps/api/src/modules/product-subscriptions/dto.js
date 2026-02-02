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
exports.UpdateDeliveryStatusDto = exports.CancelSubscriptionDto = exports.PauseSubscriptionDto = exports.UpdateSubscriptionDto = exports.SubscribeDto = exports.AddPlanItemDto = exports.UpdatePlanDto = exports.CreatePlanDto = exports.CreatePlanItemDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
// ==================== PLAN DTOs ====================
let CreatePlanItemDto = (() => {
    let _productId_decorators;
    let _productId_initializers = [];
    let _productId_extraInitializers = [];
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    return class CreatePlanItemDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do produto', example: 1 }), (0, class_validator_1.IsNumber)()];
            _quantity_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Quantidade do produto', example: 1, minimum: 0.01 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0.01)];
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: obj => "productId" in obj, get: obj => obj.productId, set: (obj, value) => { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        productId = __runInitializers(this, _productId_initializers, void 0);
        quantity = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
        constructor() {
            __runInitializers(this, _quantity_extraInitializers);
        }
    };
})();
exports.CreatePlanItemDto = CreatePlanItemDto;
let CreatePlanDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _billingPeriod_decorators;
    let _billingPeriod_initializers = [];
    let _billingPeriod_extraInitializers = [];
    let _discountPercent_decorators;
    let _discountPercent_initializers = [];
    let _discountPercent_extraInitializers = [];
    let _imageUrl_decorators;
    let _imageUrl_initializers = [];
    let _imageUrl_extraInitializers = [];
    let _benefits_decorators;
    let _benefits_initializers = [];
    let _benefits_extraInitializers = [];
    let _maxSubscribers_decorators;
    let _maxSubscribers_initializers = [];
    let _maxSubscribers_extraInitializers = [];
    let _items_decorators;
    let _items_initializers = [];
    let _items_extraInitializers = [];
    return class CreatePlanDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiProperty)({ description: 'Nome do plano de assinatura', example: 'Kit Mensal Cabelos' }), (0, class_validator_1.IsString)()];
            _description_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Descrição do plano', example: 'Receba mensalmente os melhores produtos' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _billingPeriod_decorators = [(0, swagger_1.ApiProperty)({ description: 'Período de cobrança', enum: ['MONTHLY', 'BIMONTHLY', 'QUARTERLY'], example: 'MONTHLY' }), (0, class_validator_1.IsEnum)(['MONTHLY', 'BIMONTHLY', 'QUARTERLY'])];
            _discountPercent_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Percentual de desconto', example: 10, minimum: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _imageUrl_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'URL da imagem do plano', example: 'https://example.com/plan.jpg' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _benefits_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Lista de benefícios', example: ['Frete grátis', 'Desconto exclusivo'], isArray: true, type: String }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _maxSubscribers_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Máximo de assinantes', example: 100, minimum: 1 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            _items_decorators = [(0, swagger_1.ApiProperty)({ description: 'Itens do plano', type: [CreatePlanItemDto], isArray: true }), (0, class_validator_1.IsArray)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _billingPeriod_decorators, { kind: "field", name: "billingPeriod", static: false, private: false, access: { has: obj => "billingPeriod" in obj, get: obj => obj.billingPeriod, set: (obj, value) => { obj.billingPeriod = value; } }, metadata: _metadata }, _billingPeriod_initializers, _billingPeriod_extraInitializers);
            __esDecorate(null, null, _discountPercent_decorators, { kind: "field", name: "discountPercent", static: false, private: false, access: { has: obj => "discountPercent" in obj, get: obj => obj.discountPercent, set: (obj, value) => { obj.discountPercent = value; } }, metadata: _metadata }, _discountPercent_initializers, _discountPercent_extraInitializers);
            __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: obj => "imageUrl" in obj, get: obj => obj.imageUrl, set: (obj, value) => { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
            __esDecorate(null, null, _benefits_decorators, { kind: "field", name: "benefits", static: false, private: false, access: { has: obj => "benefits" in obj, get: obj => obj.benefits, set: (obj, value) => { obj.benefits = value; } }, metadata: _metadata }, _benefits_initializers, _benefits_extraInitializers);
            __esDecorate(null, null, _maxSubscribers_decorators, { kind: "field", name: "maxSubscribers", static: false, private: false, access: { has: obj => "maxSubscribers" in obj, get: obj => obj.maxSubscribers, set: (obj, value) => { obj.maxSubscribers = value; } }, metadata: _metadata }, _maxSubscribers_initializers, _maxSubscribers_extraInitializers);
            __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: obj => "items" in obj, get: obj => obj.items, set: (obj, value) => { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        billingPeriod = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _billingPeriod_initializers, void 0));
        discountPercent = (__runInitializers(this, _billingPeriod_extraInitializers), __runInitializers(this, _discountPercent_initializers, void 0));
        imageUrl = (__runInitializers(this, _discountPercent_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
        benefits = (__runInitializers(this, _imageUrl_extraInitializers), __runInitializers(this, _benefits_initializers, void 0));
        maxSubscribers = (__runInitializers(this, _benefits_extraInitializers), __runInitializers(this, _maxSubscribers_initializers, void 0));
        items = (__runInitializers(this, _maxSubscribers_extraInitializers), __runInitializers(this, _items_initializers, void 0));
        constructor() {
            __runInitializers(this, _items_extraInitializers);
        }
    };
})();
exports.CreatePlanDto = CreatePlanDto;
let UpdatePlanDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _billingPeriod_decorators;
    let _billingPeriod_initializers = [];
    let _billingPeriod_extraInitializers = [];
    let _discountPercent_decorators;
    let _discountPercent_initializers = [];
    let _discountPercent_extraInitializers = [];
    let _imageUrl_decorators;
    let _imageUrl_initializers = [];
    let _imageUrl_extraInitializers = [];
    let _benefits_decorators;
    let _benefits_initializers = [];
    let _benefits_extraInitializers = [];
    let _maxSubscribers_decorators;
    let _maxSubscribers_initializers = [];
    let _maxSubscribers_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    return class UpdatePlanDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome do plano', example: 'Kit Mensal Cabelos' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _description_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Descrição do plano', example: 'Receba mensalmente os melhores produtos' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _billingPeriod_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Período de cobrança', enum: ['MONTHLY', 'BIMONTHLY', 'QUARTERLY'], example: 'MONTHLY' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(['MONTHLY', 'BIMONTHLY', 'QUARTERLY'])];
            _discountPercent_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Percentual de desconto', example: 10, minimum: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _imageUrl_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'URL da imagem do plano', example: 'https://example.com/plan.jpg' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _benefits_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Lista de benefícios', example: ['Frete grátis', 'Desconto exclusivo'], isArray: true, type: String }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _maxSubscribers_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Máximo de assinantes', example: 100, minimum: 1 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            _isActive_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Plano ativo', example: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _billingPeriod_decorators, { kind: "field", name: "billingPeriod", static: false, private: false, access: { has: obj => "billingPeriod" in obj, get: obj => obj.billingPeriod, set: (obj, value) => { obj.billingPeriod = value; } }, metadata: _metadata }, _billingPeriod_initializers, _billingPeriod_extraInitializers);
            __esDecorate(null, null, _discountPercent_decorators, { kind: "field", name: "discountPercent", static: false, private: false, access: { has: obj => "discountPercent" in obj, get: obj => obj.discountPercent, set: (obj, value) => { obj.discountPercent = value; } }, metadata: _metadata }, _discountPercent_initializers, _discountPercent_extraInitializers);
            __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: obj => "imageUrl" in obj, get: obj => obj.imageUrl, set: (obj, value) => { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
            __esDecorate(null, null, _benefits_decorators, { kind: "field", name: "benefits", static: false, private: false, access: { has: obj => "benefits" in obj, get: obj => obj.benefits, set: (obj, value) => { obj.benefits = value; } }, metadata: _metadata }, _benefits_initializers, _benefits_extraInitializers);
            __esDecorate(null, null, _maxSubscribers_decorators, { kind: "field", name: "maxSubscribers", static: false, private: false, access: { has: obj => "maxSubscribers" in obj, get: obj => obj.maxSubscribers, set: (obj, value) => { obj.maxSubscribers = value; } }, metadata: _metadata }, _maxSubscribers_initializers, _maxSubscribers_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        billingPeriod = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _billingPeriod_initializers, void 0));
        discountPercent = (__runInitializers(this, _billingPeriod_extraInitializers), __runInitializers(this, _discountPercent_initializers, void 0));
        imageUrl = (__runInitializers(this, _discountPercent_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
        benefits = (__runInitializers(this, _imageUrl_extraInitializers), __runInitializers(this, _benefits_initializers, void 0));
        maxSubscribers = (__runInitializers(this, _benefits_extraInitializers), __runInitializers(this, _maxSubscribers_initializers, void 0));
        isActive = (__runInitializers(this, _maxSubscribers_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        constructor() {
            __runInitializers(this, _isActive_extraInitializers);
        }
    };
})();
exports.UpdatePlanDto = UpdatePlanDto;
let AddPlanItemDto = (() => {
    let _productId_decorators;
    let _productId_initializers = [];
    let _productId_extraInitializers = [];
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    return class AddPlanItemDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do produto', example: 1 }), (0, class_validator_1.IsNumber)()];
            _quantity_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Quantidade do produto', example: 1, minimum: 0.01 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0.01)];
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: obj => "productId" in obj, get: obj => obj.productId, set: (obj, value) => { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        productId = __runInitializers(this, _productId_initializers, void 0);
        quantity = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
        constructor() {
            __runInitializers(this, _quantity_extraInitializers);
        }
    };
})();
exports.AddPlanItemDto = AddPlanItemDto;
// ==================== SUBSCRIPTION DTOs ====================
let SubscribeDto = (() => {
    let _deliveryType_decorators;
    let _deliveryType_initializers = [];
    let _deliveryType_extraInitializers = [];
    let _deliveryAddress_decorators;
    let _deliveryAddress_initializers = [];
    let _deliveryAddress_extraInitializers = [];
    let _paymentMethod_decorators;
    let _paymentMethod_initializers = [];
    let _paymentMethod_extraInitializers = [];
    let _startDate_decorators;
    let _startDate_initializers = [];
    let _startDate_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return class SubscribeDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _deliveryType_decorators = [(0, swagger_1.ApiProperty)({ description: 'Tipo de entrega', enum: ['PICKUP', 'DELIVERY'], example: 'DELIVERY' }), (0, class_validator_1.IsEnum)(['PICKUP', 'DELIVERY'])];
            _deliveryAddress_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Endereço de entrega (para DELIVERY)', example: 'Rua das Flores, 123' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _paymentMethod_decorators = [(0, swagger_1.ApiProperty)({ description: 'Método de pagamento', enum: ['PIX', 'CARD', 'CASH_ON_DELIVERY'], example: 'PIX' }), (0, class_validator_1.IsEnum)(['PIX', 'CARD', 'CASH_ON_DELIVERY'])];
            _startDate_decorators = [(0, swagger_1.ApiProperty)({ description: 'Data de início da assinatura (ISO 8601)', example: '2024-02-01' }), (0, class_validator_1.IsDateString)()];
            _notes_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Observações', example: 'Entregar sempre após as 14h' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _deliveryType_decorators, { kind: "field", name: "deliveryType", static: false, private: false, access: { has: obj => "deliveryType" in obj, get: obj => obj.deliveryType, set: (obj, value) => { obj.deliveryType = value; } }, metadata: _metadata }, _deliveryType_initializers, _deliveryType_extraInitializers);
            __esDecorate(null, null, _deliveryAddress_decorators, { kind: "field", name: "deliveryAddress", static: false, private: false, access: { has: obj => "deliveryAddress" in obj, get: obj => obj.deliveryAddress, set: (obj, value) => { obj.deliveryAddress = value; } }, metadata: _metadata }, _deliveryAddress_initializers, _deliveryAddress_extraInitializers);
            __esDecorate(null, null, _paymentMethod_decorators, { kind: "field", name: "paymentMethod", static: false, private: false, access: { has: obj => "paymentMethod" in obj, get: obj => obj.paymentMethod, set: (obj, value) => { obj.paymentMethod = value; } }, metadata: _metadata }, _paymentMethod_initializers, _paymentMethod_extraInitializers);
            __esDecorate(null, null, _startDate_decorators, { kind: "field", name: "startDate", static: false, private: false, access: { has: obj => "startDate" in obj, get: obj => obj.startDate, set: (obj, value) => { obj.startDate = value; } }, metadata: _metadata }, _startDate_initializers, _startDate_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        deliveryType = __runInitializers(this, _deliveryType_initializers, void 0);
        deliveryAddress = (__runInitializers(this, _deliveryType_extraInitializers), __runInitializers(this, _deliveryAddress_initializers, void 0));
        paymentMethod = (__runInitializers(this, _deliveryAddress_extraInitializers), __runInitializers(this, _paymentMethod_initializers, void 0));
        startDate = (__runInitializers(this, _paymentMethod_extraInitializers), __runInitializers(this, _startDate_initializers, void 0));
        notes = (__runInitializers(this, _startDate_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        constructor() {
            __runInitializers(this, _notes_extraInitializers);
        }
    };
})();
exports.SubscribeDto = SubscribeDto;
let UpdateSubscriptionDto = (() => {
    let _deliveryType_decorators;
    let _deliveryType_initializers = [];
    let _deliveryType_extraInitializers = [];
    let _deliveryAddress_decorators;
    let _deliveryAddress_initializers = [];
    let _deliveryAddress_extraInitializers = [];
    let _paymentMethod_decorators;
    let _paymentMethod_initializers = [];
    let _paymentMethod_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return class UpdateSubscriptionDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _deliveryType_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Tipo de entrega', enum: ['PICKUP', 'DELIVERY'], example: 'DELIVERY' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(['PICKUP', 'DELIVERY'])];
            _deliveryAddress_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Endereço de entrega', example: 'Rua das Flores, 123' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _paymentMethod_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Método de pagamento', enum: ['PIX', 'CARD', 'CASH_ON_DELIVERY'], example: 'PIX' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(['PIX', 'CARD', 'CASH_ON_DELIVERY'])];
            _notes_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Observações', example: 'Entregar sempre após as 14h' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _deliveryType_decorators, { kind: "field", name: "deliveryType", static: false, private: false, access: { has: obj => "deliveryType" in obj, get: obj => obj.deliveryType, set: (obj, value) => { obj.deliveryType = value; } }, metadata: _metadata }, _deliveryType_initializers, _deliveryType_extraInitializers);
            __esDecorate(null, null, _deliveryAddress_decorators, { kind: "field", name: "deliveryAddress", static: false, private: false, access: { has: obj => "deliveryAddress" in obj, get: obj => obj.deliveryAddress, set: (obj, value) => { obj.deliveryAddress = value; } }, metadata: _metadata }, _deliveryAddress_initializers, _deliveryAddress_extraInitializers);
            __esDecorate(null, null, _paymentMethod_decorators, { kind: "field", name: "paymentMethod", static: false, private: false, access: { has: obj => "paymentMethod" in obj, get: obj => obj.paymentMethod, set: (obj, value) => { obj.paymentMethod = value; } }, metadata: _metadata }, _paymentMethod_initializers, _paymentMethod_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        deliveryType = __runInitializers(this, _deliveryType_initializers, void 0);
        deliveryAddress = (__runInitializers(this, _deliveryType_extraInitializers), __runInitializers(this, _deliveryAddress_initializers, void 0));
        paymentMethod = (__runInitializers(this, _deliveryAddress_extraInitializers), __runInitializers(this, _paymentMethod_initializers, void 0));
        notes = (__runInitializers(this, _paymentMethod_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        constructor() {
            __runInitializers(this, _notes_extraInitializers);
        }
    };
})();
exports.UpdateSubscriptionDto = UpdateSubscriptionDto;
let PauseSubscriptionDto = (() => {
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    return class PauseSubscriptionDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _reason_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Motivo da pausa', example: 'Viajando por 2 meses' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        reason = __runInitializers(this, _reason_initializers, void 0);
        constructor() {
            __runInitializers(this, _reason_extraInitializers);
        }
    };
})();
exports.PauseSubscriptionDto = PauseSubscriptionDto;
let CancelSubscriptionDto = (() => {
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    return class CancelSubscriptionDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _reason_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Motivo do cancelamento', example: 'Não preciso mais dos produtos' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        reason = __runInitializers(this, _reason_initializers, void 0);
        constructor() {
            __runInitializers(this, _reason_extraInitializers);
        }
    };
})();
exports.CancelSubscriptionDto = CancelSubscriptionDto;
// ==================== DELIVERY DTOs ====================
let UpdateDeliveryStatusDto = (() => {
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return class UpdateDeliveryStatusDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _status_decorators = [(0, swagger_1.ApiProperty)({ description: 'Status da entrega', enum: ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'], example: 'DELIVERED' }), (0, class_validator_1.IsEnum)(['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'])];
            _notes_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Observações da entrega', example: 'Entregue ao porteiro' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        status = __runInitializers(this, _status_initializers, void 0);
        notes = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        constructor() {
            __runInitializers(this, _notes_extraInitializers);
        }
    };
})();
exports.UpdateDeliveryStatusDto = UpdateDeliveryStatusDto;
//# sourceMappingURL=dto.js.map