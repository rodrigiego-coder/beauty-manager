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
exports.AcceptOfferDto = exports.UpdateUpsellRuleDto = exports.CreateUpsellRuleDto = void 0;
const class_validator_1 = require("class-validator");
// ==================== RULE DTOs ====================
let CreateUpsellRuleDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _triggerType_decorators;
    let _triggerType_initializers = [];
    let _triggerType_extraInitializers = [];
    let _triggerServiceIds_decorators;
    let _triggerServiceIds_initializers = [];
    let _triggerServiceIds_extraInitializers = [];
    let _triggerProductIds_decorators;
    let _triggerProductIds_initializers = [];
    let _triggerProductIds_extraInitializers = [];
    let _triggerHairTypes_decorators;
    let _triggerHairTypes_initializers = [];
    let _triggerHairTypes_extraInitializers = [];
    let _recommendedProducts_decorators;
    let _recommendedProducts_initializers = [];
    let _recommendedProducts_extraInitializers = [];
    let _recommendedServices_decorators;
    let _recommendedServices_initializers = [];
    let _recommendedServices_extraInitializers = [];
    let _displayMessage_decorators;
    let _displayMessage_initializers = [];
    let _displayMessage_extraInitializers = [];
    let _discountPercent_decorators;
    let _discountPercent_initializers = [];
    let _discountPercent_extraInitializers = [];
    let _validFrom_decorators;
    let _validFrom_initializers = [];
    let _validFrom_extraInitializers = [];
    let _validUntil_decorators;
    let _validUntil_initializers = [];
    let _validUntil_extraInitializers = [];
    let _maxUsesTotal_decorators;
    let _maxUsesTotal_initializers = [];
    let _maxUsesTotal_extraInitializers = [];
    let _maxUsesPerClient_decorators;
    let _maxUsesPerClient_initializers = [];
    let _maxUsesPerClient_extraInitializers = [];
    let _priority_decorators;
    let _priority_initializers = [];
    let _priority_extraInitializers = [];
    return class CreateUpsellRuleDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)()];
            _triggerType_decorators = [(0, class_validator_1.IsEnum)(['SERVICE', 'PRODUCT', 'HAIR_PROFILE', 'APPOINTMENT'])];
            _triggerServiceIds_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _triggerProductIds_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _triggerHairTypes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _recommendedProducts_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _recommendedServices_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _displayMessage_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _discountPercent_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _validFrom_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _validUntil_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _maxUsesTotal_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _maxUsesPerClient_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _priority_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _triggerType_decorators, { kind: "field", name: "triggerType", static: false, private: false, access: { has: obj => "triggerType" in obj, get: obj => obj.triggerType, set: (obj, value) => { obj.triggerType = value; } }, metadata: _metadata }, _triggerType_initializers, _triggerType_extraInitializers);
            __esDecorate(null, null, _triggerServiceIds_decorators, { kind: "field", name: "triggerServiceIds", static: false, private: false, access: { has: obj => "triggerServiceIds" in obj, get: obj => obj.triggerServiceIds, set: (obj, value) => { obj.triggerServiceIds = value; } }, metadata: _metadata }, _triggerServiceIds_initializers, _triggerServiceIds_extraInitializers);
            __esDecorate(null, null, _triggerProductIds_decorators, { kind: "field", name: "triggerProductIds", static: false, private: false, access: { has: obj => "triggerProductIds" in obj, get: obj => obj.triggerProductIds, set: (obj, value) => { obj.triggerProductIds = value; } }, metadata: _metadata }, _triggerProductIds_initializers, _triggerProductIds_extraInitializers);
            __esDecorate(null, null, _triggerHairTypes_decorators, { kind: "field", name: "triggerHairTypes", static: false, private: false, access: { has: obj => "triggerHairTypes" in obj, get: obj => obj.triggerHairTypes, set: (obj, value) => { obj.triggerHairTypes = value; } }, metadata: _metadata }, _triggerHairTypes_initializers, _triggerHairTypes_extraInitializers);
            __esDecorate(null, null, _recommendedProducts_decorators, { kind: "field", name: "recommendedProducts", static: false, private: false, access: { has: obj => "recommendedProducts" in obj, get: obj => obj.recommendedProducts, set: (obj, value) => { obj.recommendedProducts = value; } }, metadata: _metadata }, _recommendedProducts_initializers, _recommendedProducts_extraInitializers);
            __esDecorate(null, null, _recommendedServices_decorators, { kind: "field", name: "recommendedServices", static: false, private: false, access: { has: obj => "recommendedServices" in obj, get: obj => obj.recommendedServices, set: (obj, value) => { obj.recommendedServices = value; } }, metadata: _metadata }, _recommendedServices_initializers, _recommendedServices_extraInitializers);
            __esDecorate(null, null, _displayMessage_decorators, { kind: "field", name: "displayMessage", static: false, private: false, access: { has: obj => "displayMessage" in obj, get: obj => obj.displayMessage, set: (obj, value) => { obj.displayMessage = value; } }, metadata: _metadata }, _displayMessage_initializers, _displayMessage_extraInitializers);
            __esDecorate(null, null, _discountPercent_decorators, { kind: "field", name: "discountPercent", static: false, private: false, access: { has: obj => "discountPercent" in obj, get: obj => obj.discountPercent, set: (obj, value) => { obj.discountPercent = value; } }, metadata: _metadata }, _discountPercent_initializers, _discountPercent_extraInitializers);
            __esDecorate(null, null, _validFrom_decorators, { kind: "field", name: "validFrom", static: false, private: false, access: { has: obj => "validFrom" in obj, get: obj => obj.validFrom, set: (obj, value) => { obj.validFrom = value; } }, metadata: _metadata }, _validFrom_initializers, _validFrom_extraInitializers);
            __esDecorate(null, null, _validUntil_decorators, { kind: "field", name: "validUntil", static: false, private: false, access: { has: obj => "validUntil" in obj, get: obj => obj.validUntil, set: (obj, value) => { obj.validUntil = value; } }, metadata: _metadata }, _validUntil_initializers, _validUntil_extraInitializers);
            __esDecorate(null, null, _maxUsesTotal_decorators, { kind: "field", name: "maxUsesTotal", static: false, private: false, access: { has: obj => "maxUsesTotal" in obj, get: obj => obj.maxUsesTotal, set: (obj, value) => { obj.maxUsesTotal = value; } }, metadata: _metadata }, _maxUsesTotal_initializers, _maxUsesTotal_extraInitializers);
            __esDecorate(null, null, _maxUsesPerClient_decorators, { kind: "field", name: "maxUsesPerClient", static: false, private: false, access: { has: obj => "maxUsesPerClient" in obj, get: obj => obj.maxUsesPerClient, set: (obj, value) => { obj.maxUsesPerClient = value; } }, metadata: _metadata }, _maxUsesPerClient_initializers, _maxUsesPerClient_extraInitializers);
            __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: obj => "priority" in obj, get: obj => obj.priority, set: (obj, value) => { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        triggerType = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _triggerType_initializers, void 0));
        triggerServiceIds = (__runInitializers(this, _triggerType_extraInitializers), __runInitializers(this, _triggerServiceIds_initializers, void 0));
        triggerProductIds = (__runInitializers(this, _triggerServiceIds_extraInitializers), __runInitializers(this, _triggerProductIds_initializers, void 0));
        triggerHairTypes = (__runInitializers(this, _triggerProductIds_extraInitializers), __runInitializers(this, _triggerHairTypes_initializers, void 0));
        recommendedProducts = (__runInitializers(this, _triggerHairTypes_extraInitializers), __runInitializers(this, _recommendedProducts_initializers, void 0));
        recommendedServices = (__runInitializers(this, _recommendedProducts_extraInitializers), __runInitializers(this, _recommendedServices_initializers, void 0));
        displayMessage = (__runInitializers(this, _recommendedServices_extraInitializers), __runInitializers(this, _displayMessage_initializers, void 0));
        discountPercent = (__runInitializers(this, _displayMessage_extraInitializers), __runInitializers(this, _discountPercent_initializers, void 0));
        validFrom = (__runInitializers(this, _discountPercent_extraInitializers), __runInitializers(this, _validFrom_initializers, void 0));
        validUntil = (__runInitializers(this, _validFrom_extraInitializers), __runInitializers(this, _validUntil_initializers, void 0));
        maxUsesTotal = (__runInitializers(this, _validUntil_extraInitializers), __runInitializers(this, _maxUsesTotal_initializers, void 0));
        maxUsesPerClient = (__runInitializers(this, _maxUsesTotal_extraInitializers), __runInitializers(this, _maxUsesPerClient_initializers, void 0));
        priority = (__runInitializers(this, _maxUsesPerClient_extraInitializers), __runInitializers(this, _priority_initializers, void 0));
        constructor() {
            __runInitializers(this, _priority_extraInitializers);
        }
    };
})();
exports.CreateUpsellRuleDto = CreateUpsellRuleDto;
let UpdateUpsellRuleDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _triggerType_decorators;
    let _triggerType_initializers = [];
    let _triggerType_extraInitializers = [];
    let _triggerServiceIds_decorators;
    let _triggerServiceIds_initializers = [];
    let _triggerServiceIds_extraInitializers = [];
    let _triggerProductIds_decorators;
    let _triggerProductIds_initializers = [];
    let _triggerProductIds_extraInitializers = [];
    let _triggerHairTypes_decorators;
    let _triggerHairTypes_initializers = [];
    let _triggerHairTypes_extraInitializers = [];
    let _recommendedProducts_decorators;
    let _recommendedProducts_initializers = [];
    let _recommendedProducts_extraInitializers = [];
    let _recommendedServices_decorators;
    let _recommendedServices_initializers = [];
    let _recommendedServices_extraInitializers = [];
    let _displayMessage_decorators;
    let _displayMessage_initializers = [];
    let _displayMessage_extraInitializers = [];
    let _discountPercent_decorators;
    let _discountPercent_initializers = [];
    let _discountPercent_extraInitializers = [];
    let _validFrom_decorators;
    let _validFrom_initializers = [];
    let _validFrom_extraInitializers = [];
    let _validUntil_decorators;
    let _validUntil_initializers = [];
    let _validUntil_extraInitializers = [];
    let _maxUsesTotal_decorators;
    let _maxUsesTotal_initializers = [];
    let _maxUsesTotal_extraInitializers = [];
    let _maxUsesPerClient_decorators;
    let _maxUsesPerClient_initializers = [];
    let _maxUsesPerClient_extraInitializers = [];
    let _priority_decorators;
    let _priority_initializers = [];
    let _priority_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    return class UpdateUpsellRuleDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _triggerType_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(['SERVICE', 'PRODUCT', 'HAIR_PROFILE', 'APPOINTMENT'])];
            _triggerServiceIds_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _triggerProductIds_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _triggerHairTypes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _recommendedProducts_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _recommendedServices_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _displayMessage_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _discountPercent_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _validFrom_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _validUntil_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _maxUsesTotal_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _maxUsesPerClient_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _priority_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _isActive_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _triggerType_decorators, { kind: "field", name: "triggerType", static: false, private: false, access: { has: obj => "triggerType" in obj, get: obj => obj.triggerType, set: (obj, value) => { obj.triggerType = value; } }, metadata: _metadata }, _triggerType_initializers, _triggerType_extraInitializers);
            __esDecorate(null, null, _triggerServiceIds_decorators, { kind: "field", name: "triggerServiceIds", static: false, private: false, access: { has: obj => "triggerServiceIds" in obj, get: obj => obj.triggerServiceIds, set: (obj, value) => { obj.triggerServiceIds = value; } }, metadata: _metadata }, _triggerServiceIds_initializers, _triggerServiceIds_extraInitializers);
            __esDecorate(null, null, _triggerProductIds_decorators, { kind: "field", name: "triggerProductIds", static: false, private: false, access: { has: obj => "triggerProductIds" in obj, get: obj => obj.triggerProductIds, set: (obj, value) => { obj.triggerProductIds = value; } }, metadata: _metadata }, _triggerProductIds_initializers, _triggerProductIds_extraInitializers);
            __esDecorate(null, null, _triggerHairTypes_decorators, { kind: "field", name: "triggerHairTypes", static: false, private: false, access: { has: obj => "triggerHairTypes" in obj, get: obj => obj.triggerHairTypes, set: (obj, value) => { obj.triggerHairTypes = value; } }, metadata: _metadata }, _triggerHairTypes_initializers, _triggerHairTypes_extraInitializers);
            __esDecorate(null, null, _recommendedProducts_decorators, { kind: "field", name: "recommendedProducts", static: false, private: false, access: { has: obj => "recommendedProducts" in obj, get: obj => obj.recommendedProducts, set: (obj, value) => { obj.recommendedProducts = value; } }, metadata: _metadata }, _recommendedProducts_initializers, _recommendedProducts_extraInitializers);
            __esDecorate(null, null, _recommendedServices_decorators, { kind: "field", name: "recommendedServices", static: false, private: false, access: { has: obj => "recommendedServices" in obj, get: obj => obj.recommendedServices, set: (obj, value) => { obj.recommendedServices = value; } }, metadata: _metadata }, _recommendedServices_initializers, _recommendedServices_extraInitializers);
            __esDecorate(null, null, _displayMessage_decorators, { kind: "field", name: "displayMessage", static: false, private: false, access: { has: obj => "displayMessage" in obj, get: obj => obj.displayMessage, set: (obj, value) => { obj.displayMessage = value; } }, metadata: _metadata }, _displayMessage_initializers, _displayMessage_extraInitializers);
            __esDecorate(null, null, _discountPercent_decorators, { kind: "field", name: "discountPercent", static: false, private: false, access: { has: obj => "discountPercent" in obj, get: obj => obj.discountPercent, set: (obj, value) => { obj.discountPercent = value; } }, metadata: _metadata }, _discountPercent_initializers, _discountPercent_extraInitializers);
            __esDecorate(null, null, _validFrom_decorators, { kind: "field", name: "validFrom", static: false, private: false, access: { has: obj => "validFrom" in obj, get: obj => obj.validFrom, set: (obj, value) => { obj.validFrom = value; } }, metadata: _metadata }, _validFrom_initializers, _validFrom_extraInitializers);
            __esDecorate(null, null, _validUntil_decorators, { kind: "field", name: "validUntil", static: false, private: false, access: { has: obj => "validUntil" in obj, get: obj => obj.validUntil, set: (obj, value) => { obj.validUntil = value; } }, metadata: _metadata }, _validUntil_initializers, _validUntil_extraInitializers);
            __esDecorate(null, null, _maxUsesTotal_decorators, { kind: "field", name: "maxUsesTotal", static: false, private: false, access: { has: obj => "maxUsesTotal" in obj, get: obj => obj.maxUsesTotal, set: (obj, value) => { obj.maxUsesTotal = value; } }, metadata: _metadata }, _maxUsesTotal_initializers, _maxUsesTotal_extraInitializers);
            __esDecorate(null, null, _maxUsesPerClient_decorators, { kind: "field", name: "maxUsesPerClient", static: false, private: false, access: { has: obj => "maxUsesPerClient" in obj, get: obj => obj.maxUsesPerClient, set: (obj, value) => { obj.maxUsesPerClient = value; } }, metadata: _metadata }, _maxUsesPerClient_initializers, _maxUsesPerClient_extraInitializers);
            __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: obj => "priority" in obj, get: obj => obj.priority, set: (obj, value) => { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        triggerType = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _triggerType_initializers, void 0));
        triggerServiceIds = (__runInitializers(this, _triggerType_extraInitializers), __runInitializers(this, _triggerServiceIds_initializers, void 0));
        triggerProductIds = (__runInitializers(this, _triggerServiceIds_extraInitializers), __runInitializers(this, _triggerProductIds_initializers, void 0));
        triggerHairTypes = (__runInitializers(this, _triggerProductIds_extraInitializers), __runInitializers(this, _triggerHairTypes_initializers, void 0));
        recommendedProducts = (__runInitializers(this, _triggerHairTypes_extraInitializers), __runInitializers(this, _recommendedProducts_initializers, void 0));
        recommendedServices = (__runInitializers(this, _recommendedProducts_extraInitializers), __runInitializers(this, _recommendedServices_initializers, void 0));
        displayMessage = (__runInitializers(this, _recommendedServices_extraInitializers), __runInitializers(this, _displayMessage_initializers, void 0));
        discountPercent = (__runInitializers(this, _displayMessage_extraInitializers), __runInitializers(this, _discountPercent_initializers, void 0));
        validFrom = (__runInitializers(this, _discountPercent_extraInitializers), __runInitializers(this, _validFrom_initializers, void 0));
        validUntil = (__runInitializers(this, _validFrom_extraInitializers), __runInitializers(this, _validUntil_initializers, void 0));
        maxUsesTotal = (__runInitializers(this, _validUntil_extraInitializers), __runInitializers(this, _maxUsesTotal_initializers, void 0));
        maxUsesPerClient = (__runInitializers(this, _maxUsesTotal_extraInitializers), __runInitializers(this, _maxUsesPerClient_initializers, void 0));
        priority = (__runInitializers(this, _maxUsesPerClient_extraInitializers), __runInitializers(this, _priority_initializers, void 0));
        isActive = (__runInitializers(this, _priority_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        constructor() {
            __runInitializers(this, _isActive_extraInitializers);
        }
    };
})();
exports.UpdateUpsellRuleDto = UpdateUpsellRuleDto;
// ==================== OFFER DTOs ====================
let AcceptOfferDto = (() => {
    let _commandId_decorators;
    let _commandId_initializers = [];
    let _commandId_extraInitializers = [];
    return class AcceptOfferDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _commandId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _commandId_decorators, { kind: "field", name: "commandId", static: false, private: false, access: { has: obj => "commandId" in obj, get: obj => obj.commandId, set: (obj, value) => { obj.commandId = value; } }, metadata: _metadata }, _commandId_initializers, _commandId_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        commandId = __runInitializers(this, _commandId_initializers, void 0);
        constructor() {
            __runInitializers(this, _commandId_extraInitializers);
        }
    };
})();
exports.AcceptOfferDto = AcceptOfferDto;
//# sourceMappingURL=dto.js.map