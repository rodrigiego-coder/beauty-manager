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
exports.ConsumeSupportTokenDto = exports.CreateSupportSessionDto = void 0;
const class_validator_1 = require("class-validator");
/**
 * DTO para criar uma sessão de suporte delegado
 */
let CreateSupportSessionDto = (() => {
    let _salonId_decorators;
    let _salonId_initializers = [];
    let _salonId_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    return class CreateSupportSessionDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _salonId_decorators = [(0, class_validator_1.IsUUID)('all', { message: 'salonId deve ser um UUID válido' }), (0, class_validator_1.IsNotEmpty)({ message: 'salonId é obrigatório' })];
            _reason_decorators = [(0, class_validator_1.IsString)({ message: 'reason deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Motivo é obrigatório para compliance' }), (0, class_validator_1.MinLength)(10, { message: 'Motivo deve ter pelo menos 10 caracteres' }), (0, class_validator_1.MaxLength)(500, { message: 'Motivo deve ter no máximo 500 caracteres' })];
            __esDecorate(null, null, _salonId_decorators, { kind: "field", name: "salonId", static: false, private: false, access: { has: obj => "salonId" in obj, get: obj => obj.salonId, set: (obj, value) => { obj.salonId = value; } }, metadata: _metadata }, _salonId_initializers, _salonId_extraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        salonId = __runInitializers(this, _salonId_initializers, void 0);
        reason = (__runInitializers(this, _salonId_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
        constructor() {
            __runInitializers(this, _reason_extraInitializers);
        }
    };
})();
exports.CreateSupportSessionDto = CreateSupportSessionDto;
/**
 * DTO para consumir um token de suporte
 */
let ConsumeSupportTokenDto = (() => {
    let _token_decorators;
    let _token_initializers = [];
    let _token_extraInitializers = [];
    return class ConsumeSupportTokenDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _token_decorators = [(0, class_validator_1.IsString)({ message: 'token deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'token é obrigatório' }), (0, class_validator_1.MinLength)(64, { message: 'Token inválido' }), (0, class_validator_1.MaxLength)(64, { message: 'Token inválido' })];
            __esDecorate(null, null, _token_decorators, { kind: "field", name: "token", static: false, private: false, access: { has: obj => "token" in obj, get: obj => obj.token, set: (obj, value) => { obj.token = value; } }, metadata: _metadata }, _token_initializers, _token_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        token = __runInitializers(this, _token_initializers, void 0);
        constructor() {
            __runInitializers(this, _token_extraInitializers);
        }
    };
})();
exports.ConsumeSupportTokenDto = ConsumeSupportTokenDto;
//# sourceMappingURL=dto.js.map