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
exports.UpdatePaymentMethodDto = exports.CreatePaymentMethodDto = exports.FEE_MODES = exports.FEE_TYPES = exports.PAYMENT_METHOD_TYPES = void 0;
const class_validator_1 = require("class-validator");
// Tipos de forma de pagamento
exports.PAYMENT_METHOD_TYPES = [
    'CASH',
    'PIX',
    'CARD_CREDIT',
    'CARD_DEBIT',
    'TRANSFER',
    'VOUCHER',
    'OTHER',
];
// Tipos de taxa/desconto
exports.FEE_TYPES = ['DISCOUNT', 'FEE'];
exports.FEE_MODES = ['PERCENT', 'FIXED'];
// DTO para criar forma de pagamento
let CreatePaymentMethodDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _feeType_decorators;
    let _feeType_initializers = [];
    let _feeType_extraInitializers = [];
    let _feeMode_decorators;
    let _feeMode_initializers = [];
    let _feeMode_extraInitializers = [];
    let _feeValue_decorators;
    let _feeValue_initializers = [];
    let _feeValue_extraInitializers = [];
    let _sortOrder_decorators;
    let _sortOrder_initializers = [];
    let _sortOrder_extraInitializers = [];
    return class CreatePaymentMethodDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)({ message: 'Nome deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Nome é obrigatório' }), (0, class_validator_1.MinLength)(2, { message: 'Nome deve ter pelo menos 2 caracteres' })];
            _type_decorators = [(0, class_validator_1.IsString)({ message: 'Tipo deve ser uma string' }), (0, class_validator_1.IsIn)(exports.PAYMENT_METHOD_TYPES, {
                    message: `Tipo deve ser: ${exports.PAYMENT_METHOD_TYPES.join(', ')}`,
                }), (0, class_validator_1.IsNotEmpty)({ message: 'Tipo é obrigatório' })];
            _feeType_decorators = [(0, class_validator_1.IsString)({ message: 'Tipo de taxa deve ser uma string' }), (0, class_validator_1.IsIn)(exports.FEE_TYPES, { message: `Tipo de taxa deve ser: ${exports.FEE_TYPES.join(', ')}` }), (0, class_validator_1.IsOptional)()];
            _feeMode_decorators = [(0, class_validator_1.IsString)({ message: 'Modo de taxa deve ser uma string' }), (0, class_validator_1.IsIn)(exports.FEE_MODES, { message: `Modo de taxa deve ser: ${exports.FEE_MODES.join(', ')}` }), (0, class_validator_1.IsOptional)()];
            _feeValue_decorators = [(0, class_validator_1.IsNumber)({}, { message: 'Valor da taxa deve ser um número' }), (0, class_validator_1.Min)(0, { message: 'Valor da taxa não pode ser negativo' }), (0, class_validator_1.IsOptional)()];
            _sortOrder_decorators = [(0, class_validator_1.IsNumber)({}, { message: 'Ordem deve ser um número' }), (0, class_validator_1.Min)(0, { message: 'Ordem não pode ser negativa' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _feeType_decorators, { kind: "field", name: "feeType", static: false, private: false, access: { has: obj => "feeType" in obj, get: obj => obj.feeType, set: (obj, value) => { obj.feeType = value; } }, metadata: _metadata }, _feeType_initializers, _feeType_extraInitializers);
            __esDecorate(null, null, _feeMode_decorators, { kind: "field", name: "feeMode", static: false, private: false, access: { has: obj => "feeMode" in obj, get: obj => obj.feeMode, set: (obj, value) => { obj.feeMode = value; } }, metadata: _metadata }, _feeMode_initializers, _feeMode_extraInitializers);
            __esDecorate(null, null, _feeValue_decorators, { kind: "field", name: "feeValue", static: false, private: false, access: { has: obj => "feeValue" in obj, get: obj => obj.feeValue, set: (obj, value) => { obj.feeValue = value; } }, metadata: _metadata }, _feeValue_initializers, _feeValue_extraInitializers);
            __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: obj => "sortOrder" in obj, get: obj => obj.sortOrder, set: (obj, value) => { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        type = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _type_initializers, void 0));
        feeType = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _feeType_initializers, void 0));
        feeMode = (__runInitializers(this, _feeType_extraInitializers), __runInitializers(this, _feeMode_initializers, void 0));
        feeValue = (__runInitializers(this, _feeMode_extraInitializers), __runInitializers(this, _feeValue_initializers, void 0));
        sortOrder = (__runInitializers(this, _feeValue_extraInitializers), __runInitializers(this, _sortOrder_initializers, void 0));
        constructor() {
            __runInitializers(this, _sortOrder_extraInitializers);
        }
    };
})();
exports.CreatePaymentMethodDto = CreatePaymentMethodDto;
// DTO para atualizar forma de pagamento
let UpdatePaymentMethodDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _feeType_decorators;
    let _feeType_initializers = [];
    let _feeType_extraInitializers = [];
    let _feeMode_decorators;
    let _feeMode_initializers = [];
    let _feeMode_extraInitializers = [];
    let _feeValue_decorators;
    let _feeValue_initializers = [];
    let _feeValue_extraInitializers = [];
    let _sortOrder_decorators;
    let _sortOrder_initializers = [];
    let _sortOrder_extraInitializers = [];
    let _active_decorators;
    let _active_initializers = [];
    let _active_extraInitializers = [];
    return class UpdatePaymentMethodDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)({ message: 'Nome deve ser uma string' }), (0, class_validator_1.MinLength)(2, { message: 'Nome deve ter pelo menos 2 caracteres' }), (0, class_validator_1.IsOptional)()];
            _type_decorators = [(0, class_validator_1.IsString)({ message: 'Tipo deve ser uma string' }), (0, class_validator_1.IsIn)(exports.PAYMENT_METHOD_TYPES, {
                    message: `Tipo deve ser: ${exports.PAYMENT_METHOD_TYPES.join(', ')}`,
                }), (0, class_validator_1.IsOptional)()];
            _feeType_decorators = [(0, class_validator_1.IsString)({ message: 'Tipo de taxa deve ser uma string' }), (0, class_validator_1.IsIn)([...exports.FEE_TYPES, null], { message: `Tipo de taxa deve ser: ${exports.FEE_TYPES.join(', ')} ou null` }), (0, class_validator_1.IsOptional)()];
            _feeMode_decorators = [(0, class_validator_1.IsString)({ message: 'Modo de taxa deve ser uma string' }), (0, class_validator_1.IsIn)([...exports.FEE_MODES, null], { message: `Modo de taxa deve ser: ${exports.FEE_MODES.join(', ')} ou null` }), (0, class_validator_1.IsOptional)()];
            _feeValue_decorators = [(0, class_validator_1.IsNumber)({}, { message: 'Valor da taxa deve ser um número' }), (0, class_validator_1.Min)(0, { message: 'Valor da taxa não pode ser negativo' }), (0, class_validator_1.IsOptional)()];
            _sortOrder_decorators = [(0, class_validator_1.IsNumber)({}, { message: 'Ordem deve ser um número' }), (0, class_validator_1.Min)(0, { message: 'Ordem não pode ser negativa' }), (0, class_validator_1.IsOptional)()];
            _active_decorators = [(0, class_validator_1.IsBoolean)({ message: 'Active deve ser um booleano' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _feeType_decorators, { kind: "field", name: "feeType", static: false, private: false, access: { has: obj => "feeType" in obj, get: obj => obj.feeType, set: (obj, value) => { obj.feeType = value; } }, metadata: _metadata }, _feeType_initializers, _feeType_extraInitializers);
            __esDecorate(null, null, _feeMode_decorators, { kind: "field", name: "feeMode", static: false, private: false, access: { has: obj => "feeMode" in obj, get: obj => obj.feeMode, set: (obj, value) => { obj.feeMode = value; } }, metadata: _metadata }, _feeMode_initializers, _feeMode_extraInitializers);
            __esDecorate(null, null, _feeValue_decorators, { kind: "field", name: "feeValue", static: false, private: false, access: { has: obj => "feeValue" in obj, get: obj => obj.feeValue, set: (obj, value) => { obj.feeValue = value; } }, metadata: _metadata }, _feeValue_initializers, _feeValue_extraInitializers);
            __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: obj => "sortOrder" in obj, get: obj => obj.sortOrder, set: (obj, value) => { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
            __esDecorate(null, null, _active_decorators, { kind: "field", name: "active", static: false, private: false, access: { has: obj => "active" in obj, get: obj => obj.active, set: (obj, value) => { obj.active = value; } }, metadata: _metadata }, _active_initializers, _active_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        type = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _type_initializers, void 0));
        feeType = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _feeType_initializers, void 0));
        feeMode = (__runInitializers(this, _feeType_extraInitializers), __runInitializers(this, _feeMode_initializers, void 0));
        feeValue = (__runInitializers(this, _feeMode_extraInitializers), __runInitializers(this, _feeValue_initializers, void 0));
        sortOrder = (__runInitializers(this, _feeValue_extraInitializers), __runInitializers(this, _sortOrder_initializers, void 0));
        active = (__runInitializers(this, _sortOrder_extraInitializers), __runInitializers(this, _active_initializers, void 0));
        constructor() {
            __runInitializers(this, _active_extraInitializers);
        }
    };
})();
exports.UpdatePaymentMethodDto = UpdatePaymentMethodDto;
//# sourceMappingURL=dto.js.map