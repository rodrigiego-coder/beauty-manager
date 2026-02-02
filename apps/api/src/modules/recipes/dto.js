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
exports.SaveRecipeDto = exports.RecipeVariantDto = exports.RecipeLineDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
// DTO para linha da receita
let RecipeLineDto = (() => {
    let _productId_decorators;
    let _productId_initializers = [];
    let _productId_extraInitializers = [];
    let _productGroupId_decorators;
    let _productGroupId_initializers = [];
    let _productGroupId_extraInitializers = [];
    let _quantityStandard_decorators;
    let _quantityStandard_initializers = [];
    let _quantityStandard_extraInitializers = [];
    let _quantityBuffer_decorators;
    let _quantityBuffer_initializers = [];
    let _quantityBuffer_extraInitializers = [];
    let _unit_decorators;
    let _unit_initializers = [];
    let _unit_extraInitializers = [];
    let _isRequired_decorators;
    let _isRequired_initializers = [];
    let _isRequired_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _sortOrder_decorators;
    let _sortOrder_initializers = [];
    let _sortOrder_extraInitializers = [];
    return class RecipeLineDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productId_decorators = [(0, class_validator_1.IsNumber)()];
            _productGroupId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUUID)()];
            _quantityStandard_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0.001)];
            _quantityBuffer_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _unit_decorators = [(0, class_validator_1.IsString)()];
            _isRequired_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _notes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _sortOrder_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: obj => "productId" in obj, get: obj => obj.productId, set: (obj, value) => { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _productGroupId_decorators, { kind: "field", name: "productGroupId", static: false, private: false, access: { has: obj => "productGroupId" in obj, get: obj => obj.productGroupId, set: (obj, value) => { obj.productGroupId = value; } }, metadata: _metadata }, _productGroupId_initializers, _productGroupId_extraInitializers);
            __esDecorate(null, null, _quantityStandard_decorators, { kind: "field", name: "quantityStandard", static: false, private: false, access: { has: obj => "quantityStandard" in obj, get: obj => obj.quantityStandard, set: (obj, value) => { obj.quantityStandard = value; } }, metadata: _metadata }, _quantityStandard_initializers, _quantityStandard_extraInitializers);
            __esDecorate(null, null, _quantityBuffer_decorators, { kind: "field", name: "quantityBuffer", static: false, private: false, access: { has: obj => "quantityBuffer" in obj, get: obj => obj.quantityBuffer, set: (obj, value) => { obj.quantityBuffer = value; } }, metadata: _metadata }, _quantityBuffer_initializers, _quantityBuffer_extraInitializers);
            __esDecorate(null, null, _unit_decorators, { kind: "field", name: "unit", static: false, private: false, access: { has: obj => "unit" in obj, get: obj => obj.unit, set: (obj, value) => { obj.unit = value; } }, metadata: _metadata }, _unit_initializers, _unit_extraInitializers);
            __esDecorate(null, null, _isRequired_decorators, { kind: "field", name: "isRequired", static: false, private: false, access: { has: obj => "isRequired" in obj, get: obj => obj.isRequired, set: (obj, value) => { obj.isRequired = value; } }, metadata: _metadata }, _isRequired_initializers, _isRequired_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: obj => "sortOrder" in obj, get: obj => obj.sortOrder, set: (obj, value) => { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        productId = __runInitializers(this, _productId_initializers, void 0);
        productGroupId = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _productGroupId_initializers, void 0));
        quantityStandard = (__runInitializers(this, _productGroupId_extraInitializers), __runInitializers(this, _quantityStandard_initializers, void 0));
        quantityBuffer = (__runInitializers(this, _quantityStandard_extraInitializers), __runInitializers(this, _quantityBuffer_initializers, void 0));
        unit = (__runInitializers(this, _quantityBuffer_extraInitializers), __runInitializers(this, _unit_initializers, void 0)); // 'ML', 'G', 'UN', etc.
        isRequired = (__runInitializers(this, _unit_extraInitializers), __runInitializers(this, _isRequired_initializers, void 0));
        notes = (__runInitializers(this, _isRequired_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        sortOrder = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _sortOrder_initializers, void 0));
        constructor() {
            __runInitializers(this, _sortOrder_extraInitializers);
        }
    };
})();
exports.RecipeLineDto = RecipeLineDto;
// DTO para variação
let RecipeVariantDto = (() => {
    let _code_decorators;
    let _code_initializers = [];
    let _code_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _multiplier_decorators;
    let _multiplier_initializers = [];
    let _multiplier_extraInitializers = [];
    let _isDefault_decorators;
    let _isDefault_initializers = [];
    let _isDefault_extraInitializers = [];
    let _sortOrder_decorators;
    let _sortOrder_initializers = [];
    let _sortOrder_extraInitializers = [];
    return class RecipeVariantDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _code_decorators = [(0, class_validator_1.IsString)()];
            _name_decorators = [(0, class_validator_1.IsString)()];
            _multiplier_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0.1)];
            _isDefault_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _sortOrder_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            __esDecorate(null, null, _code_decorators, { kind: "field", name: "code", static: false, private: false, access: { has: obj => "code" in obj, get: obj => obj.code, set: (obj, value) => { obj.code = value; } }, metadata: _metadata }, _code_initializers, _code_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _multiplier_decorators, { kind: "field", name: "multiplier", static: false, private: false, access: { has: obj => "multiplier" in obj, get: obj => obj.multiplier, set: (obj, value) => { obj.multiplier = value; } }, metadata: _metadata }, _multiplier_initializers, _multiplier_extraInitializers);
            __esDecorate(null, null, _isDefault_decorators, { kind: "field", name: "isDefault", static: false, private: false, access: { has: obj => "isDefault" in obj, get: obj => obj.isDefault, set: (obj, value) => { obj.isDefault = value; } }, metadata: _metadata }, _isDefault_initializers, _isDefault_extraInitializers);
            __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: obj => "sortOrder" in obj, get: obj => obj.sortOrder, set: (obj, value) => { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        code = __runInitializers(this, _code_initializers, void 0); // 'DEFAULT', 'SHORT', 'MEDIUM', 'LONG', etc.
        name = (__runInitializers(this, _code_extraInitializers), __runInitializers(this, _name_initializers, void 0)); // 'Cabelo Curto', 'Cabelo Médio', etc.
        multiplier = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _multiplier_initializers, void 0)); // 0.6, 1.0, 1.5, etc.
        isDefault = (__runInitializers(this, _multiplier_extraInitializers), __runInitializers(this, _isDefault_initializers, void 0));
        sortOrder = (__runInitializers(this, _isDefault_extraInitializers), __runInitializers(this, _sortOrder_initializers, void 0));
        constructor() {
            __runInitializers(this, _sortOrder_extraInitializers);
        }
    };
})();
exports.RecipeVariantDto = RecipeVariantDto;
// DTO para criar/atualizar receita completa
let SaveRecipeDto = (() => {
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _targetMarginPercent_decorators;
    let _targetMarginPercent_initializers = [];
    let _targetMarginPercent_extraInitializers = [];
    let _lines_decorators;
    let _lines_initializers = [];
    let _lines_extraInitializers = [];
    let _variants_decorators;
    let _variants_initializers = [];
    let _variants_extraInitializers = [];
    return class SaveRecipeDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _notes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _targetMarginPercent_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _lines_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(() => RecipeLineDto)];
            _variants_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(() => RecipeVariantDto)];
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, null, _targetMarginPercent_decorators, { kind: "field", name: "targetMarginPercent", static: false, private: false, access: { has: obj => "targetMarginPercent" in obj, get: obj => obj.targetMarginPercent, set: (obj, value) => { obj.targetMarginPercent = value; } }, metadata: _metadata }, _targetMarginPercent_initializers, _targetMarginPercent_extraInitializers);
            __esDecorate(null, null, _lines_decorators, { kind: "field", name: "lines", static: false, private: false, access: { has: obj => "lines" in obj, get: obj => obj.lines, set: (obj, value) => { obj.lines = value; } }, metadata: _metadata }, _lines_initializers, _lines_extraInitializers);
            __esDecorate(null, null, _variants_decorators, { kind: "field", name: "variants", static: false, private: false, access: { has: obj => "variants" in obj, get: obj => obj.variants, set: (obj, value) => { obj.variants = value; } }, metadata: _metadata }, _variants_initializers, _variants_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        notes = __runInitializers(this, _notes_initializers, void 0);
        targetMarginPercent = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _targetMarginPercent_initializers, void 0));
        lines = (__runInitializers(this, _targetMarginPercent_extraInitializers), __runInitializers(this, _lines_initializers, void 0));
        variants = (__runInitializers(this, _lines_extraInitializers), __runInitializers(this, _variants_initializers, void 0));
        constructor() {
            __runInitializers(this, _variants_extraInitializers);
        }
    };
})();
exports.SaveRecipeDto = SaveRecipeDto;
//# sourceMappingURL=dto.js.map