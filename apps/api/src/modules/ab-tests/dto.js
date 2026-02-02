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
exports.RecordConversionDto = exports.UpdateABTestDto = exports.CreateABTestDto = exports.VariantConfigDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
// ==================== AB TEST DTOs ====================
let VariantConfigDto = (() => {
    let _message_decorators;
    let _message_initializers = [];
    let _message_extraInitializers = [];
    let _discount_decorators;
    let _discount_initializers = [];
    let _discount_extraInitializers = [];
    let _timing_decorators;
    let _timing_initializers = [];
    let _timing_extraInitializers = [];
    let _offer_decorators;
    let _offer_initializers = [];
    let _offer_extraInitializers = [];
    return class VariantConfigDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _message_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _discount_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _timing_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _offer_decorators = [(0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: obj => "message" in obj, get: obj => obj.message, set: (obj, value) => { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(null, null, _discount_decorators, { kind: "field", name: "discount", static: false, private: false, access: { has: obj => "discount" in obj, get: obj => obj.discount, set: (obj, value) => { obj.discount = value; } }, metadata: _metadata }, _discount_initializers, _discount_extraInitializers);
            __esDecorate(null, null, _timing_decorators, { kind: "field", name: "timing", static: false, private: false, access: { has: obj => "timing" in obj, get: obj => obj.timing, set: (obj, value) => { obj.timing = value; } }, metadata: _metadata }, _timing_initializers, _timing_extraInitializers);
            __esDecorate(null, null, _offer_decorators, { kind: "field", name: "offer", static: false, private: false, access: { has: obj => "offer" in obj, get: obj => obj.offer, set: (obj, value) => { obj.offer = value; } }, metadata: _metadata }, _offer_initializers, _offer_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        message = __runInitializers(this, _message_initializers, void 0);
        discount = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _discount_initializers, void 0));
        timing = (__runInitializers(this, _discount_extraInitializers), __runInitializers(this, _timing_initializers, void 0));
        offer = (__runInitializers(this, _timing_extraInitializers), __runInitializers(this, _offer_initializers, void 0));
        constructor() {
            __runInitializers(this, _offer_extraInitializers);
        }
    };
})();
exports.VariantConfigDto = VariantConfigDto;
let CreateABTestDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _variantA_decorators;
    let _variantA_initializers = [];
    let _variantA_extraInitializers = [];
    let _variantB_decorators;
    let _variantB_initializers = [];
    let _variantB_extraInitializers = [];
    return class CreateABTestDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)()];
            _type_decorators = [(0, class_validator_1.IsEnum)(['MESSAGE', 'OFFER', 'DISCOUNT', 'TIMING'])];
            _variantA_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => VariantConfigDto)];
            _variantB_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => VariantConfigDto)];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _variantA_decorators, { kind: "field", name: "variantA", static: false, private: false, access: { has: obj => "variantA" in obj, get: obj => obj.variantA, set: (obj, value) => { obj.variantA = value; } }, metadata: _metadata }, _variantA_initializers, _variantA_extraInitializers);
            __esDecorate(null, null, _variantB_decorators, { kind: "field", name: "variantB", static: false, private: false, access: { has: obj => "variantB" in obj, get: obj => obj.variantB, set: (obj, value) => { obj.variantB = value; } }, metadata: _metadata }, _variantB_initializers, _variantB_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        type = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _type_initializers, void 0));
        variantA = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _variantA_initializers, void 0));
        variantB = (__runInitializers(this, _variantA_extraInitializers), __runInitializers(this, _variantB_initializers, void 0));
        constructor() {
            __runInitializers(this, _variantB_extraInitializers);
        }
    };
})();
exports.CreateABTestDto = CreateABTestDto;
let UpdateABTestDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _variantA_decorators;
    let _variantA_initializers = [];
    let _variantA_extraInitializers = [];
    let _variantB_decorators;
    let _variantB_initializers = [];
    let _variantB_extraInitializers = [];
    return class UpdateABTestDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _variantA_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => VariantConfigDto)];
            _variantB_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => VariantConfigDto)];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _variantA_decorators, { kind: "field", name: "variantA", static: false, private: false, access: { has: obj => "variantA" in obj, get: obj => obj.variantA, set: (obj, value) => { obj.variantA = value; } }, metadata: _metadata }, _variantA_initializers, _variantA_extraInitializers);
            __esDecorate(null, null, _variantB_decorators, { kind: "field", name: "variantB", static: false, private: false, access: { has: obj => "variantB" in obj, get: obj => obj.variantB, set: (obj, value) => { obj.variantB = value; } }, metadata: _metadata }, _variantB_initializers, _variantB_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        variantA = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _variantA_initializers, void 0));
        variantB = (__runInitializers(this, _variantA_extraInitializers), __runInitializers(this, _variantB_initializers, void 0));
        constructor() {
            __runInitializers(this, _variantB_extraInitializers);
        }
    };
})();
exports.UpdateABTestDto = UpdateABTestDto;
let RecordConversionDto = (() => {
    let _testId_decorators;
    let _testId_initializers = [];
    let _testId_extraInitializers = [];
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _clientPhone_decorators;
    let _clientPhone_initializers = [];
    let _clientPhone_extraInitializers = [];
    return class RecordConversionDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _testId_decorators = [(0, class_validator_1.IsString)()];
            _clientId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _clientPhone_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _testId_decorators, { kind: "field", name: "testId", static: false, private: false, access: { has: obj => "testId" in obj, get: obj => obj.testId, set: (obj, value) => { obj.testId = value; } }, metadata: _metadata }, _testId_initializers, _testId_extraInitializers);
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _clientPhone_decorators, { kind: "field", name: "clientPhone", static: false, private: false, access: { has: obj => "clientPhone" in obj, get: obj => obj.clientPhone, set: (obj, value) => { obj.clientPhone = value; } }, metadata: _metadata }, _clientPhone_initializers, _clientPhone_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        testId = __runInitializers(this, _testId_initializers, void 0);
        clientId = (__runInitializers(this, _testId_extraInitializers), __runInitializers(this, _clientId_initializers, void 0));
        clientPhone = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _clientPhone_initializers, void 0));
        constructor() {
            __runInitializers(this, _clientPhone_extraInitializers);
        }
    };
})();
exports.RecordConversionDto = RecordConversionDto;
//# sourceMappingURL=dto.js.map