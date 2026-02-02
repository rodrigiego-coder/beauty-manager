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
exports.UpdateTeamMemberDto = exports.CreateTeamMemberDto = void 0;
const class_validator_1 = require("class-validator");
let CreateTeamMemberDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    let _role_decorators;
    let _role_initializers = [];
    let _role_extraInitializers = [];
    let _defaultCommission_decorators;
    let _defaultCommission_initializers = [];
    let _defaultCommission_extraInitializers = [];
    return class CreateTeamMemberDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)()];
            _email_decorators = [(0, class_validator_1.IsEmail)()];
            _phone_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _role_decorators = [(0, class_validator_1.IsEnum)(['MANAGER', 'RECEPTIONIST', 'STYLIST'])];
            _defaultCommission_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.Max)(100)];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: obj => "role" in obj, get: obj => obj.role, set: (obj, value) => { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            __esDecorate(null, null, _defaultCommission_decorators, { kind: "field", name: "defaultCommission", static: false, private: false, access: { has: obj => "defaultCommission" in obj, get: obj => obj.defaultCommission, set: (obj, value) => { obj.defaultCommission = value; } }, metadata: _metadata }, _defaultCommission_initializers, _defaultCommission_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        email = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _email_initializers, void 0));
        phone = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
        role = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _role_initializers, void 0));
        defaultCommission = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _defaultCommission_initializers, void 0));
        constructor() {
            __runInitializers(this, _defaultCommission_extraInitializers);
        }
    };
})();
exports.CreateTeamMemberDto = CreateTeamMemberDto;
let UpdateTeamMemberDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    let _role_decorators;
    let _role_initializers = [];
    let _role_extraInitializers = [];
    let _defaultCommission_decorators;
    let _defaultCommission_initializers = [];
    let _defaultCommission_extraInitializers = [];
    let _specialties_decorators;
    let _specialties_initializers = [];
    let _specialties_extraInitializers = [];
    return class UpdateTeamMemberDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _email_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEmail)()];
            _phone_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _role_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(['MANAGER', 'RECEPTIONIST', 'STYLIST'])];
            _defaultCommission_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.Max)(100)];
            _specialties_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: obj => "role" in obj, get: obj => obj.role, set: (obj, value) => { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            __esDecorate(null, null, _defaultCommission_decorators, { kind: "field", name: "defaultCommission", static: false, private: false, access: { has: obj => "defaultCommission" in obj, get: obj => obj.defaultCommission, set: (obj, value) => { obj.defaultCommission = value; } }, metadata: _metadata }, _defaultCommission_initializers, _defaultCommission_extraInitializers);
            __esDecorate(null, null, _specialties_decorators, { kind: "field", name: "specialties", static: false, private: false, access: { has: obj => "specialties" in obj, get: obj => obj.specialties, set: (obj, value) => { obj.specialties = value; } }, metadata: _metadata }, _specialties_initializers, _specialties_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        email = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _email_initializers, void 0));
        phone = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
        role = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _role_initializers, void 0));
        defaultCommission = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _defaultCommission_initializers, void 0));
        specialties = (__runInitializers(this, _defaultCommission_extraInitializers), __runInitializers(this, _specialties_initializers, void 0));
        constructor() {
            __runInitializers(this, _specialties_extraInitializers);
        }
    };
})();
exports.UpdateTeamMemberDto = UpdateTeamMemberDto;
//# sourceMappingURL=dto.js.map