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
exports.LogRecommendationDto = exports.UpdateRecommendationRuleDto = exports.CreateRecommendationRuleDto = exports.RecommendedProductDto = exports.RuleConditionsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
/**
 * Condições para regra de recomendação
 */
let RuleConditionsDto = (() => {
    let _hairTypes_decorators;
    let _hairTypes_initializers = [];
    let _hairTypes_extraInitializers = [];
    let _hairThickness_decorators;
    let _hairThickness_initializers = [];
    let _hairThickness_extraInitializers = [];
    let _hairLength_decorators;
    let _hairLength_initializers = [];
    let _hairLength_extraInitializers = [];
    let _hairPorosity_decorators;
    let _hairPorosity_initializers = [];
    let _hairPorosity_extraInitializers = [];
    let _scalpTypes_decorators;
    let _scalpTypes_initializers = [];
    let _scalpTypes_extraInitializers = [];
    let _chemicalHistory_decorators;
    let _chemicalHistory_initializers = [];
    let _chemicalHistory_extraInitializers = [];
    let _mainConcerns_decorators;
    let _mainConcerns_initializers = [];
    let _mainConcerns_extraInitializers = [];
    let _logic_decorators;
    let _logic_initializers = [];
    let _logic_extraInitializers = [];
    return class RuleConditionsDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _hairTypes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _hairThickness_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _hairLength_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _hairPorosity_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _scalpTypes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _chemicalHistory_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _mainConcerns_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _logic_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _hairTypes_decorators, { kind: "field", name: "hairTypes", static: false, private: false, access: { has: obj => "hairTypes" in obj, get: obj => obj.hairTypes, set: (obj, value) => { obj.hairTypes = value; } }, metadata: _metadata }, _hairTypes_initializers, _hairTypes_extraInitializers);
            __esDecorate(null, null, _hairThickness_decorators, { kind: "field", name: "hairThickness", static: false, private: false, access: { has: obj => "hairThickness" in obj, get: obj => obj.hairThickness, set: (obj, value) => { obj.hairThickness = value; } }, metadata: _metadata }, _hairThickness_initializers, _hairThickness_extraInitializers);
            __esDecorate(null, null, _hairLength_decorators, { kind: "field", name: "hairLength", static: false, private: false, access: { has: obj => "hairLength" in obj, get: obj => obj.hairLength, set: (obj, value) => { obj.hairLength = value; } }, metadata: _metadata }, _hairLength_initializers, _hairLength_extraInitializers);
            __esDecorate(null, null, _hairPorosity_decorators, { kind: "field", name: "hairPorosity", static: false, private: false, access: { has: obj => "hairPorosity" in obj, get: obj => obj.hairPorosity, set: (obj, value) => { obj.hairPorosity = value; } }, metadata: _metadata }, _hairPorosity_initializers, _hairPorosity_extraInitializers);
            __esDecorate(null, null, _scalpTypes_decorators, { kind: "field", name: "scalpTypes", static: false, private: false, access: { has: obj => "scalpTypes" in obj, get: obj => obj.scalpTypes, set: (obj, value) => { obj.scalpTypes = value; } }, metadata: _metadata }, _scalpTypes_initializers, _scalpTypes_extraInitializers);
            __esDecorate(null, null, _chemicalHistory_decorators, { kind: "field", name: "chemicalHistory", static: false, private: false, access: { has: obj => "chemicalHistory" in obj, get: obj => obj.chemicalHistory, set: (obj, value) => { obj.chemicalHistory = value; } }, metadata: _metadata }, _chemicalHistory_initializers, _chemicalHistory_extraInitializers);
            __esDecorate(null, null, _mainConcerns_decorators, { kind: "field", name: "mainConcerns", static: false, private: false, access: { has: obj => "mainConcerns" in obj, get: obj => obj.mainConcerns, set: (obj, value) => { obj.mainConcerns = value; } }, metadata: _metadata }, _mainConcerns_initializers, _mainConcerns_extraInitializers);
            __esDecorate(null, null, _logic_decorators, { kind: "field", name: "logic", static: false, private: false, access: { has: obj => "logic" in obj, get: obj => obj.logic, set: (obj, value) => { obj.logic = value; } }, metadata: _metadata }, _logic_initializers, _logic_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        hairTypes = __runInitializers(this, _hairTypes_initializers, void 0);
        hairThickness = (__runInitializers(this, _hairTypes_extraInitializers), __runInitializers(this, _hairThickness_initializers, void 0));
        hairLength = (__runInitializers(this, _hairThickness_extraInitializers), __runInitializers(this, _hairLength_initializers, void 0));
        hairPorosity = (__runInitializers(this, _hairLength_extraInitializers), __runInitializers(this, _hairPorosity_initializers, void 0));
        scalpTypes = (__runInitializers(this, _hairPorosity_extraInitializers), __runInitializers(this, _scalpTypes_initializers, void 0));
        chemicalHistory = (__runInitializers(this, _scalpTypes_extraInitializers), __runInitializers(this, _chemicalHistory_initializers, void 0));
        mainConcerns = (__runInitializers(this, _chemicalHistory_extraInitializers), __runInitializers(this, _mainConcerns_initializers, void 0));
        logic = (__runInitializers(this, _mainConcerns_extraInitializers), __runInitializers(this, _logic_initializers, void 0));
        constructor() {
            __runInitializers(this, _logic_extraInitializers);
        }
    };
})();
exports.RuleConditionsDto = RuleConditionsDto;
/**
 * Produto recomendado na regra
 */
let RecommendedProductDto = (() => {
    let _productId_decorators;
    let _productId_initializers = [];
    let _productId_extraInitializers = [];
    let _priority_decorators;
    let _priority_initializers = [];
    let _priority_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    return class RecommendedProductDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productId_decorators = [(0, class_validator_1.IsNumber)()];
            _priority_decorators = [(0, class_validator_1.IsNumber)()];
            _reason_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: obj => "productId" in obj, get: obj => obj.productId, set: (obj, value) => { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: obj => "priority" in obj, get: obj => obj.priority, set: (obj, value) => { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        productId = __runInitializers(this, _productId_initializers, void 0);
        priority = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _priority_initializers, void 0));
        reason = (__runInitializers(this, _priority_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
        constructor() {
            __runInitializers(this, _reason_extraInitializers);
        }
    };
})();
exports.RecommendedProductDto = RecommendedProductDto;
/**
 * DTO para criar regra de recomendação
 */
let CreateRecommendationRuleDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _conditions_decorators;
    let _conditions_initializers = [];
    let _conditions_extraInitializers = [];
    let _recommendedProducts_decorators;
    let _recommendedProducts_initializers = [];
    let _recommendedProducts_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _priority_decorators;
    let _priority_initializers = [];
    let _priority_extraInitializers = [];
    return class CreateRecommendationRuleDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)()];
            _description_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _conditions_decorators = [(0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => RuleConditionsDto)];
            _recommendedProducts_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(() => RecommendedProductDto)];
            _isActive_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _priority_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _conditions_decorators, { kind: "field", name: "conditions", static: false, private: false, access: { has: obj => "conditions" in obj, get: obj => obj.conditions, set: (obj, value) => { obj.conditions = value; } }, metadata: _metadata }, _conditions_initializers, _conditions_extraInitializers);
            __esDecorate(null, null, _recommendedProducts_decorators, { kind: "field", name: "recommendedProducts", static: false, private: false, access: { has: obj => "recommendedProducts" in obj, get: obj => obj.recommendedProducts, set: (obj, value) => { obj.recommendedProducts = value; } }, metadata: _metadata }, _recommendedProducts_initializers, _recommendedProducts_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: obj => "priority" in obj, get: obj => obj.priority, set: (obj, value) => { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        conditions = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _conditions_initializers, void 0));
        recommendedProducts = (__runInitializers(this, _conditions_extraInitializers), __runInitializers(this, _recommendedProducts_initializers, void 0));
        isActive = (__runInitializers(this, _recommendedProducts_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        priority = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _priority_initializers, void 0));
        constructor() {
            __runInitializers(this, _priority_extraInitializers);
        }
    };
})();
exports.CreateRecommendationRuleDto = CreateRecommendationRuleDto;
/**
 * DTO para atualizar regra de recomendação
 */
let UpdateRecommendationRuleDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _conditions_decorators;
    let _conditions_initializers = [];
    let _conditions_extraInitializers = [];
    let _recommendedProducts_decorators;
    let _recommendedProducts_initializers = [];
    let _recommendedProducts_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _priority_decorators;
    let _priority_initializers = [];
    let _priority_extraInitializers = [];
    return class UpdateRecommendationRuleDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _description_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _conditions_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => RuleConditionsDto)];
            _recommendedProducts_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(() => RecommendedProductDto)];
            _isActive_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _priority_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _conditions_decorators, { kind: "field", name: "conditions", static: false, private: false, access: { has: obj => "conditions" in obj, get: obj => obj.conditions, set: (obj, value) => { obj.conditions = value; } }, metadata: _metadata }, _conditions_initializers, _conditions_extraInitializers);
            __esDecorate(null, null, _recommendedProducts_decorators, { kind: "field", name: "recommendedProducts", static: false, private: false, access: { has: obj => "recommendedProducts" in obj, get: obj => obj.recommendedProducts, set: (obj, value) => { obj.recommendedProducts = value; } }, metadata: _metadata }, _recommendedProducts_initializers, _recommendedProducts_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: obj => "priority" in obj, get: obj => obj.priority, set: (obj, value) => { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        conditions = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _conditions_initializers, void 0));
        recommendedProducts = (__runInitializers(this, _conditions_extraInitializers), __runInitializers(this, _recommendedProducts_initializers, void 0));
        isActive = (__runInitializers(this, _recommendedProducts_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        priority = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _priority_initializers, void 0));
        constructor() {
            __runInitializers(this, _priority_extraInitializers);
        }
    };
})();
exports.UpdateRecommendationRuleDto = UpdateRecommendationRuleDto;
/**
 * DTO para registrar aceitação/rejeição de recomendação
 */
let LogRecommendationDto = (() => {
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _productId_decorators;
    let _productId_initializers = [];
    let _productId_extraInitializers = [];
    let _commandId_decorators;
    let _commandId_initializers = [];
    let _commandId_extraInitializers = [];
    let _appointmentId_decorators;
    let _appointmentId_initializers = [];
    let _appointmentId_extraInitializers = [];
    let _ruleId_decorators;
    let _ruleId_initializers = [];
    let _ruleId_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    return class LogRecommendationDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _clientId_decorators = [(0, class_validator_1.IsUUID)()];
            _productId_decorators = [(0, class_validator_1.IsNumber)()];
            _commandId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUUID)()];
            _appointmentId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUUID)()];
            _ruleId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUUID)()];
            _reason_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: obj => "productId" in obj, get: obj => obj.productId, set: (obj, value) => { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _commandId_decorators, { kind: "field", name: "commandId", static: false, private: false, access: { has: obj => "commandId" in obj, get: obj => obj.commandId, set: (obj, value) => { obj.commandId = value; } }, metadata: _metadata }, _commandId_initializers, _commandId_extraInitializers);
            __esDecorate(null, null, _appointmentId_decorators, { kind: "field", name: "appointmentId", static: false, private: false, access: { has: obj => "appointmentId" in obj, get: obj => obj.appointmentId, set: (obj, value) => { obj.appointmentId = value; } }, metadata: _metadata }, _appointmentId_initializers, _appointmentId_extraInitializers);
            __esDecorate(null, null, _ruleId_decorators, { kind: "field", name: "ruleId", static: false, private: false, access: { has: obj => "ruleId" in obj, get: obj => obj.ruleId, set: (obj, value) => { obj.ruleId = value; } }, metadata: _metadata }, _ruleId_initializers, _ruleId_extraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        clientId = __runInitializers(this, _clientId_initializers, void 0);
        productId = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _productId_initializers, void 0));
        commandId = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _commandId_initializers, void 0));
        appointmentId = (__runInitializers(this, _commandId_extraInitializers), __runInitializers(this, _appointmentId_initializers, void 0));
        ruleId = (__runInitializers(this, _appointmentId_extraInitializers), __runInitializers(this, _ruleId_initializers, void 0));
        reason = (__runInitializers(this, _ruleId_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
        constructor() {
            __runInitializers(this, _reason_extraInitializers);
        }
    };
})();
exports.LogRecommendationDto = LogRecommendationDto;
//# sourceMappingURL=dto.js.map