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
exports.LinkClientDto = exports.AddNoteDto = exports.ReopenCommandDto = exports.AddPaymentDto = exports.ApplyDiscountDto = exports.RemoveItemDto = exports.UpdateItemDto = exports.AddItemDto = exports.OpenCommandDto = exports.PaymentMethod = exports.CommandItemType = exports.CommandStatus = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
// Regex para UUID genérico (aceita qualquer versão/formato)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Status da comanda
var CommandStatus;
(function (CommandStatus) {
    CommandStatus["OPEN"] = "OPEN";
    CommandStatus["IN_SERVICE"] = "IN_SERVICE";
    CommandStatus["WAITING_PAYMENT"] = "WAITING_PAYMENT";
    CommandStatus["CLOSED"] = "CLOSED";
    CommandStatus["CANCELED"] = "CANCELED";
})(CommandStatus || (exports.CommandStatus = CommandStatus = {}));
// Tipo de item
var CommandItemType;
(function (CommandItemType) {
    CommandItemType["SERVICE"] = "SERVICE";
    CommandItemType["PRODUCT"] = "PRODUCT";
})(CommandItemType || (exports.CommandItemType = CommandItemType = {}));
// Métodos de pagamento
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CARD_CREDIT"] = "CARD_CREDIT";
    PaymentMethod["CARD_DEBIT"] = "CARD_DEBIT";
    PaymentMethod["PIX"] = "PIX";
    PaymentMethod["VOUCHER"] = "VOUCHER";
    PaymentMethod["TRANSFER"] = "TRANSFER";
    PaymentMethod["OTHER"] = "OTHER";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
// DTO para abrir comanda
let OpenCommandDto = (() => {
    let _cardNumber_decorators;
    let _cardNumber_initializers = [];
    let _cardNumber_extraInitializers = [];
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return class OpenCommandDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _cardNumber_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Número do cartão/ficha da comanda', example: '42' }), (0, class_validator_1.IsString)({ message: 'Numero do cartao deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            _clientId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.Matches)(UUID_REGEX, { message: 'ID do cliente deve ser um UUID valido' }), (0, class_validator_1.IsOptional)()];
            _notes_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Notas da comanda', example: 'Cliente aguardando no sofá' }), (0, class_validator_1.IsString)({ message: 'Notas deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _cardNumber_decorators, { kind: "field", name: "cardNumber", static: false, private: false, access: { has: obj => "cardNumber" in obj, get: obj => obj.cardNumber, set: (obj, value) => { obj.cardNumber = value; } }, metadata: _metadata }, _cardNumber_initializers, _cardNumber_extraInitializers);
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        cardNumber = __runInitializers(this, _cardNumber_initializers, void 0);
        clientId = (__runInitializers(this, _cardNumber_extraInitializers), __runInitializers(this, _clientId_initializers, void 0));
        notes = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        constructor() {
            __runInitializers(this, _notes_extraInitializers);
        }
    };
})();
exports.OpenCommandDto = OpenCommandDto;
// DTO para adicionar item
let AddItemDto = (() => {
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    let _unitPrice_decorators;
    let _unitPrice_initializers = [];
    let _unitPrice_extraInitializers = [];
    let _discount_decorators;
    let _discount_initializers = [];
    let _discount_extraInitializers = [];
    let _performerId_decorators;
    let _performerId_initializers = [];
    let _performerId_extraInitializers = [];
    let _referenceId_decorators;
    let _referenceId_initializers = [];
    let _referenceId_extraInitializers = [];
    let _variantId_decorators;
    let _variantId_initializers = [];
    let _variantId_extraInitializers = [];
    return class AddItemDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _type_decorators = [(0, swagger_1.ApiProperty)({ description: 'Tipo do item', enum: CommandItemType, example: 'SERVICE' }), (0, class_validator_1.IsEnum)(CommandItemType, { message: 'Tipo deve ser SERVICE ou PRODUCT' }), (0, class_validator_1.IsNotEmpty)({ message: 'Tipo e obrigatorio' })];
            _description_decorators = [(0, swagger_1.ApiProperty)({ description: 'Descrição do item', example: 'Corte Feminino' }), (0, class_validator_1.IsString)({ message: 'Descricao deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Descricao e obrigatoria' })];
            _quantity_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Quantidade', example: 1, minimum: 0.01 }), (0, class_validator_1.IsNumber)({}, { message: 'Quantidade deve ser um numero' }), (0, class_validator_1.Min)(0.01, { message: 'Quantidade deve ser maior que zero' }), (0, class_validator_1.IsOptional)()];
            _unitPrice_decorators = [(0, swagger_1.ApiProperty)({ description: 'Preço unitário em reais', example: 80.0, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Preco unitario deve ser um numero' }), (0, class_validator_1.Min)(0, { message: 'Preco unitario deve ser maior ou igual a zero' }), (0, class_validator_1.IsNotEmpty)({ message: 'Preco unitario e obrigatorio' })];
            _discount_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Desconto em reais', example: 10.0, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Desconto deve ser um numero' }), (0, class_validator_1.Min)(0, { message: 'Desconto deve ser maior ou igual a zero' }), (0, class_validator_1.IsOptional)()];
            _performerId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do profissional que executou (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' }), (0, class_validator_1.Matches)(UUID_REGEX, { message: 'ID do profissional deve ser um UUID valido' }), (0, class_validator_1.IsOptional)()];
            _referenceId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID de referência (obrigatório para PRODUCT)', example: '123' }), (0, class_validator_1.ValidateIf)((o) => o.type === 'PRODUCT'), (0, class_validator_1.IsNotEmpty)({ message: 'referenceId e obrigatorio para itens do tipo PRODUCT' }), (0, class_validator_1.IsNumberString)({}, { message: 'ID de referencia deve ser um numero inteiro' })];
            _variantId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID da variante de receita (UUID)', example: '550e8400-e29b-41d4-a716-446655440002' }), (0, class_validator_1.Matches)(UUID_REGEX, { message: 'ID da variante deve ser um UUID valido' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _unitPrice_decorators, { kind: "field", name: "unitPrice", static: false, private: false, access: { has: obj => "unitPrice" in obj, get: obj => obj.unitPrice, set: (obj, value) => { obj.unitPrice = value; } }, metadata: _metadata }, _unitPrice_initializers, _unitPrice_extraInitializers);
            __esDecorate(null, null, _discount_decorators, { kind: "field", name: "discount", static: false, private: false, access: { has: obj => "discount" in obj, get: obj => obj.discount, set: (obj, value) => { obj.discount = value; } }, metadata: _metadata }, _discount_initializers, _discount_extraInitializers);
            __esDecorate(null, null, _performerId_decorators, { kind: "field", name: "performerId", static: false, private: false, access: { has: obj => "performerId" in obj, get: obj => obj.performerId, set: (obj, value) => { obj.performerId = value; } }, metadata: _metadata }, _performerId_initializers, _performerId_extraInitializers);
            __esDecorate(null, null, _referenceId_decorators, { kind: "field", name: "referenceId", static: false, private: false, access: { has: obj => "referenceId" in obj, get: obj => obj.referenceId, set: (obj, value) => { obj.referenceId = value; } }, metadata: _metadata }, _referenceId_initializers, _referenceId_extraInitializers);
            __esDecorate(null, null, _variantId_decorators, { kind: "field", name: "variantId", static: false, private: false, access: { has: obj => "variantId" in obj, get: obj => obj.variantId, set: (obj, value) => { obj.variantId = value; } }, metadata: _metadata }, _variantId_initializers, _variantId_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        type = __runInitializers(this, _type_initializers, void 0);
        description = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        quantity = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
        unitPrice = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _unitPrice_initializers, void 0));
        discount = (__runInitializers(this, _unitPrice_extraInitializers), __runInitializers(this, _discount_initializers, void 0));
        performerId = (__runInitializers(this, _discount_extraInitializers), __runInitializers(this, _performerId_initializers, void 0));
        // HARDENING: referenceId obrigatório para PRODUCT, opcional para SERVICE
        referenceId = (__runInitializers(this, _performerId_extraInitializers), __runInitializers(this, _referenceId_initializers, void 0));
        // Variante da receita (para serviços com tamanho de cabelo)
        variantId = (__runInitializers(this, _referenceId_extraInitializers), __runInitializers(this, _variantId_initializers, void 0));
        constructor() {
            __runInitializers(this, _variantId_extraInitializers);
        }
    };
})();
exports.AddItemDto = AddItemDto;
// DTO para atualizar item
let UpdateItemDto = (() => {
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    let _unitPrice_decorators;
    let _unitPrice_initializers = [];
    let _unitPrice_extraInitializers = [];
    let _discount_decorators;
    let _discount_initializers = [];
    let _discount_extraInitializers = [];
    let _performerId_decorators;
    let _performerId_initializers = [];
    let _performerId_extraInitializers = [];
    return class UpdateItemDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _quantity_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Quantidade', example: 2, minimum: 0.01 }), (0, class_validator_1.IsNumber)({}, { message: 'Quantidade deve ser um numero' }), (0, class_validator_1.Min)(0.01, { message: 'Quantidade deve ser maior que zero' }), (0, class_validator_1.IsOptional)()];
            _unitPrice_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Preço unitário em reais', example: 80.0, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Preco unitario deve ser um numero' }), (0, class_validator_1.Min)(0, { message: 'Preco unitario deve ser maior ou igual a zero' }), (0, class_validator_1.IsOptional)()];
            _discount_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Desconto em reais', example: 10.0, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Desconto deve ser um numero' }), (0, class_validator_1.Min)(0, { message: 'Desconto deve ser maior ou igual a zero' }), (0, class_validator_1.IsOptional)()];
            _performerId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do profissional que executou (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' }), (0, class_validator_1.Matches)(UUID_REGEX, { message: 'ID do profissional deve ser um UUID valido' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _unitPrice_decorators, { kind: "field", name: "unitPrice", static: false, private: false, access: { has: obj => "unitPrice" in obj, get: obj => obj.unitPrice, set: (obj, value) => { obj.unitPrice = value; } }, metadata: _metadata }, _unitPrice_initializers, _unitPrice_extraInitializers);
            __esDecorate(null, null, _discount_decorators, { kind: "field", name: "discount", static: false, private: false, access: { has: obj => "discount" in obj, get: obj => obj.discount, set: (obj, value) => { obj.discount = value; } }, metadata: _metadata }, _discount_initializers, _discount_extraInitializers);
            __esDecorate(null, null, _performerId_decorators, { kind: "field", name: "performerId", static: false, private: false, access: { has: obj => "performerId" in obj, get: obj => obj.performerId, set: (obj, value) => { obj.performerId = value; } }, metadata: _metadata }, _performerId_initializers, _performerId_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        quantity = __runInitializers(this, _quantity_initializers, void 0);
        unitPrice = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _unitPrice_initializers, void 0));
        discount = (__runInitializers(this, _unitPrice_extraInitializers), __runInitializers(this, _discount_initializers, void 0));
        performerId = (__runInitializers(this, _discount_extraInitializers), __runInitializers(this, _performerId_initializers, void 0));
        constructor() {
            __runInitializers(this, _performerId_extraInitializers);
        }
    };
})();
exports.UpdateItemDto = UpdateItemDto;
// DTO para remover item
let RemoveItemDto = (() => {
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    return class RemoveItemDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _reason_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Motivo da remoção', example: 'Cliente desistiu do serviço' }), (0, class_validator_1.IsString)({ message: 'Motivo deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        reason = __runInitializers(this, _reason_initializers, void 0);
        constructor() {
            __runInitializers(this, _reason_extraInitializers);
        }
    };
})();
exports.RemoveItemDto = RemoveItemDto;
// DTO para aplicar desconto geral
let ApplyDiscountDto = (() => {
    let _discountAmount_decorators;
    let _discountAmount_initializers = [];
    let _discountAmount_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    return class ApplyDiscountDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _discountAmount_decorators = [(0, swagger_1.ApiProperty)({ description: 'Valor do desconto em reais', example: 20.0, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Valor do desconto deve ser um numero' }), (0, class_validator_1.Min)(0, { message: 'Desconto deve ser maior ou igual a zero' }), (0, class_validator_1.IsNotEmpty)({ message: 'Valor do desconto e obrigatorio' })];
            _reason_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Motivo do desconto', example: 'Desconto de aniversário' }), (0, class_validator_1.IsString)({ message: 'Motivo deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _discountAmount_decorators, { kind: "field", name: "discountAmount", static: false, private: false, access: { has: obj => "discountAmount" in obj, get: obj => obj.discountAmount, set: (obj, value) => { obj.discountAmount = value; } }, metadata: _metadata }, _discountAmount_initializers, _discountAmount_extraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        discountAmount = __runInitializers(this, _discountAmount_initializers, void 0);
        reason = (__runInitializers(this, _discountAmount_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
        constructor() {
            __runInitializers(this, _reason_extraInitializers);
        }
    };
})();
exports.ApplyDiscountDto = ApplyDiscountDto;
// DTO para adicionar pagamento (compatível com formato legado e novo)
let AddPaymentDto = (() => {
    let _method_decorators;
    let _method_initializers = [];
    let _method_extraInitializers = [];
    let _paymentMethodId_decorators;
    let _paymentMethodId_initializers = [];
    let _paymentMethodId_extraInitializers = [];
    let _paymentDestinationId_decorators;
    let _paymentDestinationId_initializers = [];
    let _paymentDestinationId_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return class AddPaymentDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _method_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Método de pagamento (formato legado)', enum: PaymentMethod, example: 'PIX' }), (0, class_validator_1.IsEnum)(PaymentMethod, { message: 'Metodo de pagamento invalido' }), (0, class_validator_1.IsOptional)()];
            _paymentMethodId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID da forma de pagamento configurada (UUID)', example: '550e8400-e29b-41d4-a716-446655440003' }), (0, class_validator_1.Matches)(UUID_REGEX, { message: 'ID da forma de pagamento deve ser um UUID valido' }), (0, class_validator_1.IsOptional)()];
            _paymentDestinationId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do destino do pagamento (UUID)', example: '550e8400-e29b-41d4-a716-446655440004' }), (0, class_validator_1.Matches)(UUID_REGEX, { message: 'ID do destino deve ser um UUID valido' }), (0, class_validator_1.IsOptional)()];
            _amount_decorators = [(0, swagger_1.ApiProperty)({ description: 'Valor do pagamento em reais', example: 150.0, minimum: 0.01 }), (0, class_validator_1.IsNumber)({}, { message: 'Valor deve ser um numero' }), (0, class_validator_1.Min)(0.01, { message: 'Valor deve ser maior que zero' }), (0, class_validator_1.IsNotEmpty)({ message: 'Valor e obrigatorio' })];
            _notes_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Notas do pagamento', example: 'Pagamento parcial' }), (0, class_validator_1.IsString)({ message: 'Notas deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _method_decorators, { kind: "field", name: "method", static: false, private: false, access: { has: obj => "method" in obj, get: obj => obj.method, set: (obj, value) => { obj.method = value; } }, metadata: _metadata }, _method_initializers, _method_extraInitializers);
            __esDecorate(null, null, _paymentMethodId_decorators, { kind: "field", name: "paymentMethodId", static: false, private: false, access: { has: obj => "paymentMethodId" in obj, get: obj => obj.paymentMethodId, set: (obj, value) => { obj.paymentMethodId = value; } }, metadata: _metadata }, _paymentMethodId_initializers, _paymentMethodId_extraInitializers);
            __esDecorate(null, null, _paymentDestinationId_decorators, { kind: "field", name: "paymentDestinationId", static: false, private: false, access: { has: obj => "paymentDestinationId" in obj, get: obj => obj.paymentDestinationId, set: (obj, value) => { obj.paymentDestinationId = value; } }, metadata: _metadata }, _paymentDestinationId_initializers, _paymentDestinationId_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        // Formato legado (mantido para compatibilidade)
        method = __runInitializers(this, _method_initializers, void 0);
        // Novo formato: ID da forma de pagamento configurada
        paymentMethodId = (__runInitializers(this, _method_extraInitializers), __runInitializers(this, _paymentMethodId_initializers, void 0));
        // Novo: ID do destino do pagamento (opcional)
        paymentDestinationId = (__runInitializers(this, _paymentMethodId_extraInitializers), __runInitializers(this, _paymentDestinationId_initializers, void 0));
        amount = (__runInitializers(this, _paymentDestinationId_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
        notes = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        constructor() {
            __runInitializers(this, _notes_extraInitializers);
        }
    };
})();
exports.AddPaymentDto = AddPaymentDto;
// DTO para reabrir comanda (apenas OWNER/MANAGER)
let ReopenCommandDto = (() => {
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    return class ReopenCommandDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _reason_decorators = [(0, swagger_1.ApiProperty)({ description: 'Motivo para reabrir a comanda', example: 'Esqueceu de adicionar serviço' }), (0, class_validator_1.IsString)({ message: 'Motivo deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Motivo e obrigatorio' })];
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        reason = __runInitializers(this, _reason_initializers, void 0);
        constructor() {
            __runInitializers(this, _reason_extraInitializers);
        }
    };
})();
exports.ReopenCommandDto = ReopenCommandDto;
// DTO para adicionar nota
let AddNoteDto = (() => {
    let _note_decorators;
    let _note_initializers = [];
    let _note_extraInitializers = [];
    return class AddNoteDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _note_decorators = [(0, swagger_1.ApiProperty)({ description: 'Nota a adicionar na comanda', example: 'Cliente solicitou água' }), (0, class_validator_1.IsString)({ message: 'Nota deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Nota e obrigatoria' })];
            __esDecorate(null, null, _note_decorators, { kind: "field", name: "note", static: false, private: false, access: { has: obj => "note" in obj, get: obj => obj.note, set: (obj, value) => { obj.note = value; } }, metadata: _metadata }, _note_initializers, _note_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        note = __runInitializers(this, _note_initializers, void 0);
        constructor() {
            __runInitializers(this, _note_extraInitializers);
        }
    };
})();
exports.AddNoteDto = AddNoteDto;
// DTO para vincular cliente
let LinkClientDto = (() => {
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    return class LinkClientDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _clientId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do cliente a vincular (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.Matches)(UUID_REGEX, { message: 'ID do cliente deve ser um UUID valido' }), (0, class_validator_1.IsNotEmpty)({ message: 'ID do cliente e obrigatorio' })];
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        clientId = __runInitializers(this, _clientId_initializers, void 0);
        constructor() {
            __runInitializers(this, _clientId_extraInitializers);
        }
    };
})();
exports.LinkClientDto = LinkClientDto;
//# sourceMappingURL=dto.js.map