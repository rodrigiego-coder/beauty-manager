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
exports.ConvertCartLinkDto = exports.UpdateCartLinkDto = exports.CreateCartLinkDto = exports.CartLinkItemDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
// ==================== CART LINK DTOs ====================
let CartLinkItemDto = (() => {
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _itemId_decorators;
    let _itemId_initializers = [];
    let _itemId_extraInitializers = [];
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    let _discount_decorators;
    let _discount_initializers = [];
    let _discount_extraInitializers = [];
    return class CartLinkItemDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _type_decorators = [(0, swagger_1.ApiProperty)({ description: 'Tipo do item', enum: ['PRODUCT', 'SERVICE'], example: 'PRODUCT' }), (0, class_validator_1.IsEnum)(['PRODUCT', 'SERVICE'])];
            _itemId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do item (produto ou serviço)', example: 123 }), (0, class_validator_1.IsNumber)()];
            _quantity_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Quantidade', example: 2, minimum: 1 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            _discount_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Desconto em reais', example: 10.00, minimum: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _itemId_decorators, { kind: "field", name: "itemId", static: false, private: false, access: { has: obj => "itemId" in obj, get: obj => obj.itemId, set: (obj, value) => { obj.itemId = value; } }, metadata: _metadata }, _itemId_initializers, _itemId_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _discount_decorators, { kind: "field", name: "discount", static: false, private: false, access: { has: obj => "discount" in obj, get: obj => obj.discount, set: (obj, value) => { obj.discount = value; } }, metadata: _metadata }, _discount_initializers, _discount_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        type = __runInitializers(this, _type_initializers, void 0);
        itemId = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _itemId_initializers, void 0));
        quantity = (__runInitializers(this, _itemId_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
        discount = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _discount_initializers, void 0));
        constructor() {
            __runInitializers(this, _discount_extraInitializers);
        }
    };
})();
exports.CartLinkItemDto = CartLinkItemDto;
let CreateCartLinkDto = (() => {
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _clientPhone_decorators;
    let _clientPhone_initializers = [];
    let _clientPhone_extraInitializers = [];
    let _clientName_decorators;
    let _clientName_initializers = [];
    let _clientName_extraInitializers = [];
    let _source_decorators;
    let _source_initializers = [];
    let _source_extraInitializers = [];
    let _message_decorators;
    let _message_initializers = [];
    let _message_extraInitializers = [];
    let _expiresAt_decorators;
    let _expiresAt_initializers = [];
    let _expiresAt_extraInitializers = [];
    let _items_decorators;
    let _items_initializers = [];
    let _items_extraInitializers = [];
    return class CreateCartLinkDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _clientId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _clientPhone_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Telefone do cliente', example: '11999998888' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _clientName_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome do cliente', example: 'Maria Silva' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _source_decorators = [(0, swagger_1.ApiProperty)({ description: 'Origem do link', enum: ['WHATSAPP', 'SMS', 'EMAIL', 'MANUAL'], example: 'WHATSAPP' }), (0, class_validator_1.IsEnum)(['WHATSAPP', 'SMS', 'EMAIL', 'MANUAL'])];
            _message_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Mensagem personalizada', example: 'Confira esses produtos!' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _expiresAt_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data de expiração (ISO 8601)', example: '2024-02-28T23:59:59Z' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _items_decorators = [(0, swagger_1.ApiProperty)({ description: 'Itens do carrinho', type: [CartLinkItemDto], isArray: true }), (0, class_validator_1.IsArray)()];
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _clientPhone_decorators, { kind: "field", name: "clientPhone", static: false, private: false, access: { has: obj => "clientPhone" in obj, get: obj => obj.clientPhone, set: (obj, value) => { obj.clientPhone = value; } }, metadata: _metadata }, _clientPhone_initializers, _clientPhone_extraInitializers);
            __esDecorate(null, null, _clientName_decorators, { kind: "field", name: "clientName", static: false, private: false, access: { has: obj => "clientName" in obj, get: obj => obj.clientName, set: (obj, value) => { obj.clientName = value; } }, metadata: _metadata }, _clientName_initializers, _clientName_extraInitializers);
            __esDecorate(null, null, _source_decorators, { kind: "field", name: "source", static: false, private: false, access: { has: obj => "source" in obj, get: obj => obj.source, set: (obj, value) => { obj.source = value; } }, metadata: _metadata }, _source_initializers, _source_extraInitializers);
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: obj => "message" in obj, get: obj => obj.message, set: (obj, value) => { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(null, null, _expiresAt_decorators, { kind: "field", name: "expiresAt", static: false, private: false, access: { has: obj => "expiresAt" in obj, get: obj => obj.expiresAt, set: (obj, value) => { obj.expiresAt = value; } }, metadata: _metadata }, _expiresAt_initializers, _expiresAt_extraInitializers);
            __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: obj => "items" in obj, get: obj => obj.items, set: (obj, value) => { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        clientId = __runInitializers(this, _clientId_initializers, void 0);
        clientPhone = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _clientPhone_initializers, void 0));
        clientName = (__runInitializers(this, _clientPhone_extraInitializers), __runInitializers(this, _clientName_initializers, void 0));
        source = (__runInitializers(this, _clientName_extraInitializers), __runInitializers(this, _source_initializers, void 0));
        message = (__runInitializers(this, _source_extraInitializers), __runInitializers(this, _message_initializers, void 0));
        expiresAt = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _expiresAt_initializers, void 0));
        items = (__runInitializers(this, _expiresAt_extraInitializers), __runInitializers(this, _items_initializers, void 0));
        constructor() {
            __runInitializers(this, _items_extraInitializers);
        }
    };
})();
exports.CreateCartLinkDto = CreateCartLinkDto;
let UpdateCartLinkDto = (() => {
    let _message_decorators;
    let _message_initializers = [];
    let _message_extraInitializers = [];
    let _expiresAt_decorators;
    let _expiresAt_initializers = [];
    let _expiresAt_extraInitializers = [];
    let _items_decorators;
    let _items_initializers = [];
    let _items_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    return class UpdateCartLinkDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _message_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Mensagem personalizada', example: 'Confira esses produtos!' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _expiresAt_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data de expiração (ISO 8601)', example: '2024-02-28T23:59:59Z' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _items_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Itens do carrinho', type: [CartLinkItemDto], isArray: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _isActive_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Link ativo', example: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: obj => "message" in obj, get: obj => obj.message, set: (obj, value) => { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(null, null, _expiresAt_decorators, { kind: "field", name: "expiresAt", static: false, private: false, access: { has: obj => "expiresAt" in obj, get: obj => obj.expiresAt, set: (obj, value) => { obj.expiresAt = value; } }, metadata: _metadata }, _expiresAt_initializers, _expiresAt_extraInitializers);
            __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: obj => "items" in obj, get: obj => obj.items, set: (obj, value) => { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        message = __runInitializers(this, _message_initializers, void 0);
        expiresAt = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _expiresAt_initializers, void 0));
        items = (__runInitializers(this, _expiresAt_extraInitializers), __runInitializers(this, _items_initializers, void 0));
        isActive = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        constructor() {
            __runInitializers(this, _isActive_extraInitializers);
        }
    };
})();
exports.UpdateCartLinkDto = UpdateCartLinkDto;
let ConvertCartLinkDto = (() => {
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _clientName_decorators;
    let _clientName_initializers = [];
    let _clientName_extraInitializers = [];
    let _clientPhone_decorators;
    let _clientPhone_initializers = [];
    let _clientPhone_extraInitializers = [];
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
    return class ConvertCartLinkDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _clientId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _clientName_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome do cliente', example: 'Maria Silva' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _clientPhone_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Telefone do cliente', example: '11999998888' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _deliveryType_decorators = [(0, swagger_1.ApiProperty)({ description: 'Tipo de entrega', enum: ['PICKUP', 'DELIVERY'], example: 'PICKUP' }), (0, class_validator_1.IsEnum)(['PICKUP', 'DELIVERY'])];
            _deliveryAddress_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Endereço de entrega (para DELIVERY)', example: 'Rua das Flores, 123' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _paymentMethod_decorators = [(0, swagger_1.ApiProperty)({ description: 'Método de pagamento', enum: ['PIX', 'CARD', 'CASH'], example: 'PIX' }), (0, class_validator_1.IsEnum)(['PIX', 'CARD', 'CASH'])];
            _notes_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Observações', example: 'Entregar após as 18h' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _clientName_decorators, { kind: "field", name: "clientName", static: false, private: false, access: { has: obj => "clientName" in obj, get: obj => obj.clientName, set: (obj, value) => { obj.clientName = value; } }, metadata: _metadata }, _clientName_initializers, _clientName_extraInitializers);
            __esDecorate(null, null, _clientPhone_decorators, { kind: "field", name: "clientPhone", static: false, private: false, access: { has: obj => "clientPhone" in obj, get: obj => obj.clientPhone, set: (obj, value) => { obj.clientPhone = value; } }, metadata: _metadata }, _clientPhone_initializers, _clientPhone_extraInitializers);
            __esDecorate(null, null, _deliveryType_decorators, { kind: "field", name: "deliveryType", static: false, private: false, access: { has: obj => "deliveryType" in obj, get: obj => obj.deliveryType, set: (obj, value) => { obj.deliveryType = value; } }, metadata: _metadata }, _deliveryType_initializers, _deliveryType_extraInitializers);
            __esDecorate(null, null, _deliveryAddress_decorators, { kind: "field", name: "deliveryAddress", static: false, private: false, access: { has: obj => "deliveryAddress" in obj, get: obj => obj.deliveryAddress, set: (obj, value) => { obj.deliveryAddress = value; } }, metadata: _metadata }, _deliveryAddress_initializers, _deliveryAddress_extraInitializers);
            __esDecorate(null, null, _paymentMethod_decorators, { kind: "field", name: "paymentMethod", static: false, private: false, access: { has: obj => "paymentMethod" in obj, get: obj => obj.paymentMethod, set: (obj, value) => { obj.paymentMethod = value; } }, metadata: _metadata }, _paymentMethod_initializers, _paymentMethod_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        clientId = __runInitializers(this, _clientId_initializers, void 0);
        clientName = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _clientName_initializers, void 0));
        clientPhone = (__runInitializers(this, _clientName_extraInitializers), __runInitializers(this, _clientPhone_initializers, void 0));
        deliveryType = (__runInitializers(this, _clientPhone_extraInitializers), __runInitializers(this, _deliveryType_initializers, void 0));
        deliveryAddress = (__runInitializers(this, _deliveryType_extraInitializers), __runInitializers(this, _deliveryAddress_initializers, void 0));
        paymentMethod = (__runInitializers(this, _deliveryAddress_extraInitializers), __runInitializers(this, _paymentMethod_initializers, void 0));
        notes = (__runInitializers(this, _paymentMethod_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        constructor() {
            __runInitializers(this, _notes_extraInitializers);
        }
    };
})();
exports.ConvertCartLinkDto = ConvertCartLinkDto;
//# sourceMappingURL=dto.js.map