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
exports.TransferStockDto = exports.StockEntryDto = exports.AdjustStockDto = exports.UpdateProductDto = exports.CreateProductDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
// DTO para criar produto
let CreateProductDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _costPrice_decorators;
    let _costPrice_initializers = [];
    let _costPrice_extraInitializers = [];
    let _salePrice_decorators;
    let _salePrice_initializers = [];
    let _salePrice_extraInitializers = [];
    let _stockRetail_decorators;
    let _stockRetail_initializers = [];
    let _stockRetail_extraInitializers = [];
    let _minStockRetail_decorators;
    let _minStockRetail_initializers = [];
    let _minStockRetail_extraInitializers = [];
    let _stockInternal_decorators;
    let _stockInternal_initializers = [];
    let _stockInternal_extraInitializers = [];
    let _minStockInternal_decorators;
    let _minStockInternal_initializers = [];
    let _minStockInternal_extraInitializers = [];
    let _unit_decorators;
    let _unit_initializers = [];
    let _unit_extraInitializers = [];
    let _isRetail_decorators;
    let _isRetail_initializers = [];
    let _isRetail_extraInitializers = [];
    let _isBackbar_decorators;
    let _isBackbar_initializers = [];
    let _isBackbar_extraInitializers = [];
    return class CreateProductDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiProperty)({ description: 'Nome do produto', example: 'Shampoo Profissional 1L', minLength: 2 }), (0, class_validator_1.IsString)({ message: 'Nome deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Nome é obrigatório' }), (0, class_validator_1.MinLength)(2, { message: 'Nome deve ter pelo menos 2 caracteres' })];
            _description_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Descrição do produto', example: 'Shampoo para cabelos oleosos' }), (0, class_validator_1.IsString)({ message: 'Descrição deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            _costPrice_decorators = [(0, swagger_1.ApiProperty)({ description: 'Preço de custo em reais', example: 25.0, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Preço de custo deve ser um número' }), (0, class_validator_1.Min)(0, { message: 'Preço de custo não pode ser negativo' }), (0, class_validator_1.IsNotEmpty)({ message: 'Preço de custo é obrigatório' })];
            _salePrice_decorators = [(0, swagger_1.ApiProperty)({ description: 'Preço de venda em reais', example: 45.0, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Preço de venda deve ser um número' }), (0, class_validator_1.Min)(0, { message: 'Preço de venda não pode ser negativo' }), (0, class_validator_1.IsNotEmpty)({ message: 'Preço de venda é obrigatório' })];
            _stockRetail_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Estoque Loja (para venda)', example: 10, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Estoque Loja deve ser um número' }), (0, class_validator_1.Min)(0, { message: 'Estoque Loja não pode ser negativo' }), (0, class_validator_1.IsOptional)()];
            _minStockRetail_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Estoque mínimo Loja (alerta)', example: 3, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Estoque Mínimo Loja deve ser um número' }), (0, class_validator_1.Min)(0, { message: 'Estoque Mínimo Loja não pode ser negativo' }), (0, class_validator_1.IsOptional)()];
            _stockInternal_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Estoque Salão (uso interno)', example: 5, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Estoque Salão deve ser um número' }), (0, class_validator_1.Min)(0, { message: 'Estoque Salão não pode ser negativo' }), (0, class_validator_1.IsOptional)()];
            _minStockInternal_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Estoque mínimo Salão (alerta)', example: 2, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Estoque Mínimo Salão deve ser um número' }), (0, class_validator_1.Min)(0, { message: 'Estoque Mínimo Salão não pode ser negativo' }), (0, class_validator_1.IsOptional)()];
            _unit_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Unidade de medida', enum: ['UN', 'ML', 'KG', 'L', 'G'], example: 'UN' }), (0, class_validator_1.IsString)({ message: 'Unidade deve ser uma string' }), (0, class_validator_1.IsIn)(['UN', 'ML', 'KG', 'L', 'G'], { message: 'Unidade deve ser UN, ML, KG, L ou G' }), (0, class_validator_1.IsOptional)()];
            _isRetail_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Produto para venda (Loja)', example: true }), (0, class_validator_1.IsBoolean)({ message: 'isRetail deve ser um booleano' }), (0, class_validator_1.IsOptional)()];
            _isBackbar_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Produto para uso interno (Backbar)', example: true }), (0, class_validator_1.IsBoolean)({ message: 'isBackbar deve ser um booleano' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _costPrice_decorators, { kind: "field", name: "costPrice", static: false, private: false, access: { has: obj => "costPrice" in obj, get: obj => obj.costPrice, set: (obj, value) => { obj.costPrice = value; } }, metadata: _metadata }, _costPrice_initializers, _costPrice_extraInitializers);
            __esDecorate(null, null, _salePrice_decorators, { kind: "field", name: "salePrice", static: false, private: false, access: { has: obj => "salePrice" in obj, get: obj => obj.salePrice, set: (obj, value) => { obj.salePrice = value; } }, metadata: _metadata }, _salePrice_initializers, _salePrice_extraInitializers);
            __esDecorate(null, null, _stockRetail_decorators, { kind: "field", name: "stockRetail", static: false, private: false, access: { has: obj => "stockRetail" in obj, get: obj => obj.stockRetail, set: (obj, value) => { obj.stockRetail = value; } }, metadata: _metadata }, _stockRetail_initializers, _stockRetail_extraInitializers);
            __esDecorate(null, null, _minStockRetail_decorators, { kind: "field", name: "minStockRetail", static: false, private: false, access: { has: obj => "minStockRetail" in obj, get: obj => obj.minStockRetail, set: (obj, value) => { obj.minStockRetail = value; } }, metadata: _metadata }, _minStockRetail_initializers, _minStockRetail_extraInitializers);
            __esDecorate(null, null, _stockInternal_decorators, { kind: "field", name: "stockInternal", static: false, private: false, access: { has: obj => "stockInternal" in obj, get: obj => obj.stockInternal, set: (obj, value) => { obj.stockInternal = value; } }, metadata: _metadata }, _stockInternal_initializers, _stockInternal_extraInitializers);
            __esDecorate(null, null, _minStockInternal_decorators, { kind: "field", name: "minStockInternal", static: false, private: false, access: { has: obj => "minStockInternal" in obj, get: obj => obj.minStockInternal, set: (obj, value) => { obj.minStockInternal = value; } }, metadata: _metadata }, _minStockInternal_initializers, _minStockInternal_extraInitializers);
            __esDecorate(null, null, _unit_decorators, { kind: "field", name: "unit", static: false, private: false, access: { has: obj => "unit" in obj, get: obj => obj.unit, set: (obj, value) => { obj.unit = value; } }, metadata: _metadata }, _unit_initializers, _unit_extraInitializers);
            __esDecorate(null, null, _isRetail_decorators, { kind: "field", name: "isRetail", static: false, private: false, access: { has: obj => "isRetail" in obj, get: obj => obj.isRetail, set: (obj, value) => { obj.isRetail = value; } }, metadata: _metadata }, _isRetail_initializers, _isRetail_extraInitializers);
            __esDecorate(null, null, _isBackbar_decorators, { kind: "field", name: "isBackbar", static: false, private: false, access: { has: obj => "isBackbar" in obj, get: obj => obj.isBackbar, set: (obj, value) => { obj.isBackbar = value; } }, metadata: _metadata }, _isBackbar_initializers, _isBackbar_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        costPrice = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _costPrice_initializers, void 0));
        salePrice = (__runInitializers(this, _costPrice_extraInitializers), __runInitializers(this, _salePrice_initializers, void 0));
        // Dual stock system - Estoque Loja (Retail)
        stockRetail = (__runInitializers(this, _salePrice_extraInitializers), __runInitializers(this, _stockRetail_initializers, void 0));
        minStockRetail = (__runInitializers(this, _stockRetail_extraInitializers), __runInitializers(this, _minStockRetail_initializers, void 0));
        // Dual stock system - Estoque Salão (Internal)
        stockInternal = (__runInitializers(this, _minStockRetail_extraInitializers), __runInitializers(this, _stockInternal_initializers, void 0));
        minStockInternal = (__runInitializers(this, _stockInternal_extraInitializers), __runInitializers(this, _minStockInternal_initializers, void 0));
        unit = (__runInitializers(this, _minStockInternal_extraInitializers), __runInitializers(this, _unit_initializers, void 0));
        isRetail = (__runInitializers(this, _unit_extraInitializers), __runInitializers(this, _isRetail_initializers, void 0));
        isBackbar = (__runInitializers(this, _isRetail_extraInitializers), __runInitializers(this, _isBackbar_initializers, void 0));
        constructor() {
            __runInitializers(this, _isBackbar_extraInitializers);
        }
    };
})();
exports.CreateProductDto = CreateProductDto;
// DTO para atualizar produto
let UpdateProductDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _costPrice_decorators;
    let _costPrice_initializers = [];
    let _costPrice_extraInitializers = [];
    let _salePrice_decorators;
    let _salePrice_initializers = [];
    let _salePrice_extraInitializers = [];
    let _stockRetail_decorators;
    let _stockRetail_initializers = [];
    let _stockRetail_extraInitializers = [];
    let _minStockRetail_decorators;
    let _minStockRetail_initializers = [];
    let _minStockRetail_extraInitializers = [];
    let _stockInternal_decorators;
    let _stockInternal_initializers = [];
    let _stockInternal_extraInitializers = [];
    let _minStockInternal_decorators;
    let _minStockInternal_initializers = [];
    let _minStockInternal_extraInitializers = [];
    let _unit_decorators;
    let _unit_initializers = [];
    let _unit_extraInitializers = [];
    let _active_decorators;
    let _active_initializers = [];
    let _active_extraInitializers = [];
    let _isRetail_decorators;
    let _isRetail_initializers = [];
    let _isRetail_extraInitializers = [];
    let _isBackbar_decorators;
    let _isBackbar_initializers = [];
    let _isBackbar_extraInitializers = [];
    return class UpdateProductDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome do produto', example: 'Shampoo Profissional 1L', minLength: 2 }), (0, class_validator_1.IsString)({ message: 'Nome deve ser uma string' }), (0, class_validator_1.MinLength)(2, { message: 'Nome deve ter pelo menos 2 caracteres' }), (0, class_validator_1.IsOptional)()];
            _description_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Descrição do produto', example: 'Shampoo para cabelos oleosos' }), (0, class_validator_1.IsString)({ message: 'Descrição deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            _costPrice_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Preço de custo em reais', example: 25.0, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Preço de custo deve ser um número' }), (0, class_validator_1.Min)(0, { message: 'Preço de custo não pode ser negativo' }), (0, class_validator_1.IsOptional)()];
            _salePrice_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Preço de venda em reais', example: 45.0, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Preço de venda deve ser um número' }), (0, class_validator_1.Min)(0, { message: 'Preço de venda não pode ser negativo' }), (0, class_validator_1.IsOptional)()];
            _stockRetail_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Estoque Loja (para venda)', example: 10, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Estoque Loja deve ser um número' }), (0, class_validator_1.Min)(0, { message: 'Estoque Loja não pode ser negativo' }), (0, class_validator_1.IsOptional)()];
            _minStockRetail_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Estoque mínimo Loja (alerta)', example: 3, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Estoque Mínimo Loja deve ser um número' }), (0, class_validator_1.Min)(0, { message: 'Estoque Mínimo Loja não pode ser negativo' }), (0, class_validator_1.IsOptional)()];
            _stockInternal_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Estoque Salão (uso interno)', example: 5, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Estoque Salão deve ser um número' }), (0, class_validator_1.Min)(0, { message: 'Estoque Salão não pode ser negativo' }), (0, class_validator_1.IsOptional)()];
            _minStockInternal_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Estoque mínimo Salão (alerta)', example: 2, minimum: 0 }), (0, class_validator_1.IsNumber)({}, { message: 'Estoque Mínimo Salão deve ser um número' }), (0, class_validator_1.Min)(0, { message: 'Estoque Mínimo Salão não pode ser negativo' }), (0, class_validator_1.IsOptional)()];
            _unit_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Unidade de medida', enum: ['UN', 'ML', 'KG', 'L', 'G'], example: 'UN' }), (0, class_validator_1.IsString)({ message: 'Unidade deve ser uma string' }), (0, class_validator_1.IsIn)(['UN', 'ML', 'KG', 'L', 'G'], { message: 'Unidade deve ser UN, ML, KG, L ou G' }), (0, class_validator_1.IsOptional)()];
            _active_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Produto ativo', example: true }), (0, class_validator_1.IsBoolean)({ message: 'Active deve ser um booleano' }), (0, class_validator_1.IsOptional)()];
            _isRetail_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Produto para venda (Loja)', example: true }), (0, class_validator_1.IsBoolean)({ message: 'isRetail deve ser um booleano' }), (0, class_validator_1.IsOptional)()];
            _isBackbar_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Produto para uso interno (Backbar)', example: true }), (0, class_validator_1.IsBoolean)({ message: 'isBackbar deve ser um booleano' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _costPrice_decorators, { kind: "field", name: "costPrice", static: false, private: false, access: { has: obj => "costPrice" in obj, get: obj => obj.costPrice, set: (obj, value) => { obj.costPrice = value; } }, metadata: _metadata }, _costPrice_initializers, _costPrice_extraInitializers);
            __esDecorate(null, null, _salePrice_decorators, { kind: "field", name: "salePrice", static: false, private: false, access: { has: obj => "salePrice" in obj, get: obj => obj.salePrice, set: (obj, value) => { obj.salePrice = value; } }, metadata: _metadata }, _salePrice_initializers, _salePrice_extraInitializers);
            __esDecorate(null, null, _stockRetail_decorators, { kind: "field", name: "stockRetail", static: false, private: false, access: { has: obj => "stockRetail" in obj, get: obj => obj.stockRetail, set: (obj, value) => { obj.stockRetail = value; } }, metadata: _metadata }, _stockRetail_initializers, _stockRetail_extraInitializers);
            __esDecorate(null, null, _minStockRetail_decorators, { kind: "field", name: "minStockRetail", static: false, private: false, access: { has: obj => "minStockRetail" in obj, get: obj => obj.minStockRetail, set: (obj, value) => { obj.minStockRetail = value; } }, metadata: _metadata }, _minStockRetail_initializers, _minStockRetail_extraInitializers);
            __esDecorate(null, null, _stockInternal_decorators, { kind: "field", name: "stockInternal", static: false, private: false, access: { has: obj => "stockInternal" in obj, get: obj => obj.stockInternal, set: (obj, value) => { obj.stockInternal = value; } }, metadata: _metadata }, _stockInternal_initializers, _stockInternal_extraInitializers);
            __esDecorate(null, null, _minStockInternal_decorators, { kind: "field", name: "minStockInternal", static: false, private: false, access: { has: obj => "minStockInternal" in obj, get: obj => obj.minStockInternal, set: (obj, value) => { obj.minStockInternal = value; } }, metadata: _metadata }, _minStockInternal_initializers, _minStockInternal_extraInitializers);
            __esDecorate(null, null, _unit_decorators, { kind: "field", name: "unit", static: false, private: false, access: { has: obj => "unit" in obj, get: obj => obj.unit, set: (obj, value) => { obj.unit = value; } }, metadata: _metadata }, _unit_initializers, _unit_extraInitializers);
            __esDecorate(null, null, _active_decorators, { kind: "field", name: "active", static: false, private: false, access: { has: obj => "active" in obj, get: obj => obj.active, set: (obj, value) => { obj.active = value; } }, metadata: _metadata }, _active_initializers, _active_extraInitializers);
            __esDecorate(null, null, _isRetail_decorators, { kind: "field", name: "isRetail", static: false, private: false, access: { has: obj => "isRetail" in obj, get: obj => obj.isRetail, set: (obj, value) => { obj.isRetail = value; } }, metadata: _metadata }, _isRetail_initializers, _isRetail_extraInitializers);
            __esDecorate(null, null, _isBackbar_decorators, { kind: "field", name: "isBackbar", static: false, private: false, access: { has: obj => "isBackbar" in obj, get: obj => obj.isBackbar, set: (obj, value) => { obj.isBackbar = value; } }, metadata: _metadata }, _isBackbar_initializers, _isBackbar_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        costPrice = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _costPrice_initializers, void 0));
        salePrice = (__runInitializers(this, _costPrice_extraInitializers), __runInitializers(this, _salePrice_initializers, void 0));
        // Dual stock system - Estoque Loja (Retail)
        stockRetail = (__runInitializers(this, _salePrice_extraInitializers), __runInitializers(this, _stockRetail_initializers, void 0));
        minStockRetail = (__runInitializers(this, _stockRetail_extraInitializers), __runInitializers(this, _minStockRetail_initializers, void 0));
        // Dual stock system - Estoque Salão (Internal)
        stockInternal = (__runInitializers(this, _minStockRetail_extraInitializers), __runInitializers(this, _stockInternal_initializers, void 0));
        minStockInternal = (__runInitializers(this, _stockInternal_extraInitializers), __runInitializers(this, _minStockInternal_initializers, void 0));
        unit = (__runInitializers(this, _minStockInternal_extraInitializers), __runInitializers(this, _unit_initializers, void 0));
        active = (__runInitializers(this, _unit_extraInitializers), __runInitializers(this, _active_initializers, void 0));
        isRetail = (__runInitializers(this, _active_extraInitializers), __runInitializers(this, _isRetail_initializers, void 0));
        isBackbar = (__runInitializers(this, _isRetail_extraInitializers), __runInitializers(this, _isBackbar_initializers, void 0));
        constructor() {
            __runInitializers(this, _isBackbar_extraInitializers);
        }
    };
})();
exports.UpdateProductDto = UpdateProductDto;
// DTO para ajuste de estoque
let AdjustStockDto = (() => {
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    return class AdjustStockDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _quantity_decorators = [(0, swagger_1.ApiProperty)({ description: 'Quantidade a ajustar', example: 5, minimum: 1 }), (0, class_validator_1.IsNumber)({}, { message: 'Quantidade deve ser um número' }), (0, class_validator_1.Min)(1, { message: 'Quantidade deve ser pelo menos 1' }), (0, class_validator_1.IsNotEmpty)({ message: 'Quantidade é obrigatória' })];
            _type_decorators = [(0, swagger_1.ApiProperty)({ description: 'Tipo de ajuste', enum: ['IN', 'OUT'], example: 'IN' }), (0, class_validator_1.IsString)({ message: 'Tipo deve ser uma string' }), (0, class_validator_1.IsIn)(['IN', 'OUT'], { message: 'Tipo deve ser IN (entrada) ou OUT (saída)' }), (0, class_validator_1.IsNotEmpty)({ message: 'Tipo é obrigatório' })];
            _reason_decorators = [(0, swagger_1.ApiProperty)({ description: 'Motivo do ajuste', example: 'Compra de estoque', minLength: 3 }), (0, class_validator_1.IsString)({ message: 'Motivo deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Motivo é obrigatório' }), (0, class_validator_1.MinLength)(3, { message: 'Motivo deve ter pelo menos 3 caracteres' })];
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        quantity = __runInitializers(this, _quantity_initializers, void 0);
        type = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _type_initializers, void 0));
        reason = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
        constructor() {
            __runInitializers(this, _reason_extraInitializers);
        }
    };
})();
exports.AdjustStockDto = AdjustStockDto;
// DTO legado para entrada de estoque (mantido para compatibilidade)
let StockEntryDto = (() => {
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    return class StockEntryDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _quantity_decorators = [(0, swagger_1.ApiProperty)({ description: 'Quantidade a adicionar', example: 10, minimum: 1 }), (0, class_validator_1.IsNumber)({}, { message: 'Quantidade deve ser um número' }), (0, class_validator_1.Min)(1, { message: 'Quantidade deve ser pelo menos 1' }), (0, class_validator_1.IsNotEmpty)({ message: 'Quantidade é obrigatória' })];
            _description_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Descrição da entrada', example: 'Reposição mensal' }), (0, class_validator_1.IsString)({ message: 'Descrição deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        quantity = __runInitializers(this, _quantity_initializers, void 0);
        description = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        constructor() {
            __runInitializers(this, _description_extraInitializers);
        }
    };
})();
exports.StockEntryDto = StockEntryDto;
// DTO para transferência de estoque entre localizações (RETAIL <-> INTERNAL)
let TransferStockDto = (() => {
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    let _fromLocation_decorators;
    let _fromLocation_initializers = [];
    let _fromLocation_extraInitializers = [];
    let _toLocation_decorators;
    let _toLocation_initializers = [];
    let _toLocation_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    return class TransferStockDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _quantity_decorators = [(0, swagger_1.ApiProperty)({ description: 'Quantidade a transferir', example: 3, minimum: 1 }), (0, class_validator_1.IsNumber)({}, { message: 'Quantidade deve ser um número' }), (0, class_validator_1.Min)(1, { message: 'Quantidade deve ser pelo menos 1' }), (0, class_validator_1.IsNotEmpty)({ message: 'Quantidade é obrigatória' })];
            _fromLocation_decorators = [(0, swagger_1.ApiProperty)({ description: 'Localização de origem', enum: ['RETAIL', 'INTERNAL'], example: 'RETAIL' }), (0, class_validator_1.IsString)({ message: 'Origem deve ser uma string' }), (0, class_validator_1.IsIn)(['RETAIL', 'INTERNAL'], { message: 'Origem deve ser RETAIL ou INTERNAL' }), (0, class_validator_1.IsNotEmpty)({ message: 'Origem é obrigatória' })];
            _toLocation_decorators = [(0, swagger_1.ApiProperty)({ description: 'Localização de destino', enum: ['RETAIL', 'INTERNAL'], example: 'INTERNAL' }), (0, class_validator_1.IsString)({ message: 'Destino deve ser uma string' }), (0, class_validator_1.IsIn)(['RETAIL', 'INTERNAL'], { message: 'Destino deve ser RETAIL ou INTERNAL' }), (0, class_validator_1.IsNotEmpty)({ message: 'Destino é obrigatório' })];
            _reason_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Motivo da transferência', example: 'Reposição para uso no salão' }), (0, class_validator_1.IsString)({ message: 'Motivo deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _fromLocation_decorators, { kind: "field", name: "fromLocation", static: false, private: false, access: { has: obj => "fromLocation" in obj, get: obj => obj.fromLocation, set: (obj, value) => { obj.fromLocation = value; } }, metadata: _metadata }, _fromLocation_initializers, _fromLocation_extraInitializers);
            __esDecorate(null, null, _toLocation_decorators, { kind: "field", name: "toLocation", static: false, private: false, access: { has: obj => "toLocation" in obj, get: obj => obj.toLocation, set: (obj, value) => { obj.toLocation = value; } }, metadata: _metadata }, _toLocation_initializers, _toLocation_extraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        quantity = __runInitializers(this, _quantity_initializers, void 0);
        fromLocation = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _fromLocation_initializers, void 0));
        toLocation = (__runInitializers(this, _fromLocation_extraInitializers), __runInitializers(this, _toLocation_initializers, void 0));
        reason = (__runInitializers(this, _toLocation_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
        constructor() {
            __runInitializers(this, _reason_extraInitializers);
        }
    };
})();
exports.TransferStockDto = TransferStockDto;
//# sourceMappingURL=dto.js.map