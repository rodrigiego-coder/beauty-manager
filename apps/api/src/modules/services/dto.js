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
exports.UpdateServiceDto = exports.CreateServiceDto = exports.ServiceCategory = void 0;
const class_validator_1 = require("class-validator");
var ServiceCategory;
(function (ServiceCategory) {
    ServiceCategory["HAIR"] = "HAIR";
    ServiceCategory["BARBER"] = "BARBER";
    ServiceCategory["NAILS"] = "NAILS";
    ServiceCategory["SKIN"] = "SKIN";
    ServiceCategory["MAKEUP"] = "MAKEUP";
    ServiceCategory["OTHER"] = "OTHER";
})(ServiceCategory || (exports.ServiceCategory = ServiceCategory = {}));
let CreateServiceDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _durationMinutes_decorators;
    let _durationMinutes_initializers = [];
    let _durationMinutes_extraInitializers = [];
    let _basePrice_decorators;
    let _basePrice_initializers = [];
    let _basePrice_extraInitializers = [];
    let _commissionPercentage_decorators;
    let _commissionPercentage_initializers = [];
    let _commissionPercentage_extraInitializers = [];
    return class CreateServiceDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(3)];
            _description_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _category_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(ServiceCategory)];
            _durationMinutes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            _basePrice_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0.01)];
            _commissionPercentage_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.Max)(100)];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _durationMinutes_decorators, { kind: "field", name: "durationMinutes", static: false, private: false, access: { has: obj => "durationMinutes" in obj, get: obj => obj.durationMinutes, set: (obj, value) => { obj.durationMinutes = value; } }, metadata: _metadata }, _durationMinutes_initializers, _durationMinutes_extraInitializers);
            __esDecorate(null, null, _basePrice_decorators, { kind: "field", name: "basePrice", static: false, private: false, access: { has: obj => "basePrice" in obj, get: obj => obj.basePrice, set: (obj, value) => { obj.basePrice = value; } }, metadata: _metadata }, _basePrice_initializers, _basePrice_extraInitializers);
            __esDecorate(null, null, _commissionPercentage_decorators, { kind: "field", name: "commissionPercentage", static: false, private: false, access: { has: obj => "commissionPercentage" in obj, get: obj => obj.commissionPercentage, set: (obj, value) => { obj.commissionPercentage = value; } }, metadata: _metadata }, _commissionPercentage_initializers, _commissionPercentage_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        category = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _category_initializers, void 0));
        durationMinutes = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _durationMinutes_initializers, void 0));
        basePrice = (__runInitializers(this, _durationMinutes_extraInitializers), __runInitializers(this, _basePrice_initializers, void 0));
        commissionPercentage = (__runInitializers(this, _basePrice_extraInitializers), __runInitializers(this, _commissionPercentage_initializers, void 0));
        constructor() {
            __runInitializers(this, _commissionPercentage_extraInitializers);
        }
    };
})();
exports.CreateServiceDto = CreateServiceDto;
let UpdateServiceDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _durationMinutes_decorators;
    let _durationMinutes_initializers = [];
    let _durationMinutes_extraInitializers = [];
    let _basePrice_decorators;
    let _basePrice_initializers = [];
    let _basePrice_extraInitializers = [];
    let _commissionPercentage_decorators;
    let _commissionPercentage_initializers = [];
    let _commissionPercentage_extraInitializers = [];
    return class UpdateServiceDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(3)];
            _description_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _category_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(ServiceCategory)];
            _durationMinutes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            _basePrice_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0.01)];
            _commissionPercentage_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.Max)(100)];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _durationMinutes_decorators, { kind: "field", name: "durationMinutes", static: false, private: false, access: { has: obj => "durationMinutes" in obj, get: obj => obj.durationMinutes, set: (obj, value) => { obj.durationMinutes = value; } }, metadata: _metadata }, _durationMinutes_initializers, _durationMinutes_extraInitializers);
            __esDecorate(null, null, _basePrice_decorators, { kind: "field", name: "basePrice", static: false, private: false, access: { has: obj => "basePrice" in obj, get: obj => obj.basePrice, set: (obj, value) => { obj.basePrice = value; } }, metadata: _metadata }, _basePrice_initializers, _basePrice_extraInitializers);
            __esDecorate(null, null, _commissionPercentage_decorators, { kind: "field", name: "commissionPercentage", static: false, private: false, access: { has: obj => "commissionPercentage" in obj, get: obj => obj.commissionPercentage, set: (obj, value) => { obj.commissionPercentage = value; } }, metadata: _metadata }, _commissionPercentage_initializers, _commissionPercentage_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        category = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _category_initializers, void 0));
        durationMinutes = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _durationMinutes_initializers, void 0));
        basePrice = (__runInitializers(this, _durationMinutes_extraInitializers), __runInitializers(this, _basePrice_initializers, void 0));
        commissionPercentage = (__runInitializers(this, _basePrice_extraInitializers), __runInitializers(this, _commissionPercentage_initializers, void 0));
        constructor() {
            __runInitializers(this, _commissionPercentage_extraInitializers);
        }
    };
})();
exports.UpdateServiceDto = UpdateServiceDto;
//# sourceMappingURL=dto.js.map