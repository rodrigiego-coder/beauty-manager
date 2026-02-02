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
exports.UpdateClientDto = exports.CreateClientDto = exports.IsBrazilianPhoneConstraint = exports.IsFullNameConstraint = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
/**
 * Validador customizado para nome completo (mínimo 2 palavras)
 */
let IsFullNameConstraint = (() => {
    let _classDecorators = [(0, class_validator_1.ValidatorConstraint)({ name: 'isFullName', async: false })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IsFullNameConstraint = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            IsFullNameConstraint = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        validate(name, _args) {
            if (!name || typeof name !== 'string')
                return false;
            // Remove espaços extras e divide por espaços
            const words = name.trim().split(/\s+/).filter(word => word.length > 0);
            // Deve ter pelo menos 2 palavras
            return words.length >= 2;
        }
        defaultMessage(_args) {
            return 'Nome completo é obrigatório (nome e sobrenome)';
        }
    };
    return IsFullNameConstraint = _classThis;
})();
exports.IsFullNameConstraint = IsFullNameConstraint;
/**
 * Validador customizado para telefone brasileiro (10-11 dígitos)
 */
let IsBrazilianPhoneConstraint = (() => {
    let _classDecorators = [(0, class_validator_1.ValidatorConstraint)({ name: 'isBrazilianPhone', async: false })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IsBrazilianPhoneConstraint = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            IsBrazilianPhoneConstraint = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        validate(phone, _args) {
            if (!phone || typeof phone !== 'string')
                return false;
            // Remove tudo que não é dígito
            const digits = phone.replace(/\D/g, '');
            // Telefone brasileiro: 10 dígitos (fixo) ou 11 dígitos (celular com 9)
            return digits.length >= 10 && digits.length <= 11;
        }
        defaultMessage(_args) {
            return 'Telefone inválido. Informe DDD + número (10 ou 11 dígitos)';
        }
    };
    return IsBrazilianPhoneConstraint = _classThis;
})();
exports.IsBrazilianPhoneConstraint = IsBrazilianPhoneConstraint;
/**
 * DTO para criar cliente
 */
let CreateClientDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _technicalNotes_decorators;
    let _technicalNotes_initializers = [];
    let _technicalNotes_extraInitializers = [];
    let _preferences_decorators;
    let _preferences_initializers = [];
    let _preferences_extraInitializers = [];
    let _aiActive_decorators;
    let _aiActive_initializers = [];
    let _aiActive_extraInitializers = [];
    return class CreateClientDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiProperty)({ description: 'Nome completo do cliente (nome e sobrenome)', example: 'Maria Silva Santos', minLength: 3 }), (0, class_validator_1.IsString)({ message: 'Nome deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Nome é obrigatório' }), (0, class_validator_1.MinLength)(3, { message: 'Nome deve ter pelo menos 3 caracteres' }), (0, class_validator_1.Validate)(IsFullNameConstraint)];
            _phone_decorators = [(0, swagger_1.ApiProperty)({ description: 'Telefone brasileiro (DDD + número)', example: '11999998888' }), (0, class_validator_1.IsString)({ message: 'Telefone deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Telefone é obrigatório' }), (0, class_validator_1.Validate)(IsBrazilianPhoneConstraint)];
            _email_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Email do cliente', example: 'maria@exemplo.com' }), (0, class_validator_1.IsEmail)({}, { message: 'Email inválido' }), (0, class_validator_1.IsOptional)()];
            _technicalNotes_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Notas técnicas (visíveis apenas para profissionais)', example: 'Alergia a amônia, preferir coloração sem' }), (0, class_validator_1.IsString)({ message: 'Notas técnicas deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            _preferences_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Preferências do cliente', example: 'Prefere atendimento pela manhã, gosta de café' }), (0, class_validator_1.IsString)({ message: 'Preferências deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            _aiActive_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Ativar assistente IA para este cliente', example: true }), (0, class_validator_1.IsBoolean)({ message: 'aiActive deve ser um booleano' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _technicalNotes_decorators, { kind: "field", name: "technicalNotes", static: false, private: false, access: { has: obj => "technicalNotes" in obj, get: obj => obj.technicalNotes, set: (obj, value) => { obj.technicalNotes = value; } }, metadata: _metadata }, _technicalNotes_initializers, _technicalNotes_extraInitializers);
            __esDecorate(null, null, _preferences_decorators, { kind: "field", name: "preferences", static: false, private: false, access: { has: obj => "preferences" in obj, get: obj => obj.preferences, set: (obj, value) => { obj.preferences = value; } }, metadata: _metadata }, _preferences_initializers, _preferences_extraInitializers);
            __esDecorate(null, null, _aiActive_decorators, { kind: "field", name: "aiActive", static: false, private: false, access: { has: obj => "aiActive" in obj, get: obj => obj.aiActive, set: (obj, value) => { obj.aiActive = value; } }, metadata: _metadata }, _aiActive_initializers, _aiActive_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        phone = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
        email = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _email_initializers, void 0));
        technicalNotes = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _technicalNotes_initializers, void 0));
        preferences = (__runInitializers(this, _technicalNotes_extraInitializers), __runInitializers(this, _preferences_initializers, void 0));
        aiActive = (__runInitializers(this, _preferences_extraInitializers), __runInitializers(this, _aiActive_initializers, void 0));
        constructor() {
            __runInitializers(this, _aiActive_extraInitializers);
        }
    };
})();
exports.CreateClientDto = CreateClientDto;
/**
 * DTO para atualizar cliente
 */
let UpdateClientDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _technicalNotes_decorators;
    let _technicalNotes_initializers = [];
    let _technicalNotes_extraInitializers = [];
    let _preferences_decorators;
    let _preferences_initializers = [];
    let _preferences_extraInitializers = [];
    let _aiActive_decorators;
    let _aiActive_initializers = [];
    let _aiActive_extraInitializers = [];
    return class UpdateClientDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome completo do cliente (nome e sobrenome)', example: 'Maria Silva Santos', minLength: 3 }), (0, class_validator_1.IsString)({ message: 'Nome deve ser uma string' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.MinLength)(3, { message: 'Nome deve ter pelo menos 3 caracteres' }), (0, class_validator_1.Validate)(IsFullNameConstraint)];
            _phone_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Telefone brasileiro (DDD + número)', example: '11999998888' }), (0, class_validator_1.IsString)({ message: 'Telefone deve ser uma string' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.Validate)(IsBrazilianPhoneConstraint)];
            _email_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Email do cliente', example: 'maria@exemplo.com' }), (0, class_validator_1.IsEmail)({}, { message: 'Email inválido' }), (0, class_validator_1.IsOptional)()];
            _technicalNotes_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Notas técnicas (visíveis apenas para profissionais)', example: 'Alergia a amônia, preferir coloração sem' }), (0, class_validator_1.IsString)({ message: 'Notas técnicas deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            _preferences_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Preferências do cliente', example: 'Prefere atendimento pela manhã, gosta de café' }), (0, class_validator_1.IsString)({ message: 'Preferências deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            _aiActive_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Ativar assistente IA para este cliente', example: true }), (0, class_validator_1.IsBoolean)({ message: 'aiActive deve ser um booleano' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _technicalNotes_decorators, { kind: "field", name: "technicalNotes", static: false, private: false, access: { has: obj => "technicalNotes" in obj, get: obj => obj.technicalNotes, set: (obj, value) => { obj.technicalNotes = value; } }, metadata: _metadata }, _technicalNotes_initializers, _technicalNotes_extraInitializers);
            __esDecorate(null, null, _preferences_decorators, { kind: "field", name: "preferences", static: false, private: false, access: { has: obj => "preferences" in obj, get: obj => obj.preferences, set: (obj, value) => { obj.preferences = value; } }, metadata: _metadata }, _preferences_initializers, _preferences_extraInitializers);
            __esDecorate(null, null, _aiActive_decorators, { kind: "field", name: "aiActive", static: false, private: false, access: { has: obj => "aiActive" in obj, get: obj => obj.aiActive, set: (obj, value) => { obj.aiActive = value; } }, metadata: _metadata }, _aiActive_initializers, _aiActive_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        phone = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
        email = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _email_initializers, void 0));
        technicalNotes = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _technicalNotes_initializers, void 0));
        preferences = (__runInitializers(this, _technicalNotes_extraInitializers), __runInitializers(this, _preferences_initializers, void 0));
        aiActive = (__runInitializers(this, _preferences_extraInitializers), __runInitializers(this, _aiActive_initializers, void 0));
        constructor() {
            __runInitializers(this, _aiActive_extraInitializers);
        }
    };
})();
exports.UpdateClientDto = UpdateClientDto;
//# sourceMappingURL=dto.js.map