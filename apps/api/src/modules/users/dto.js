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
exports.ChangePasswordDto = exports.UpdateProfileDto = exports.UpdateWorkScheduleDto = exports.UpdateUserDto = exports.CreateUserDto = exports.UserRole = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
// Enum de roles
var UserRole;
(function (UserRole) {
    UserRole["OWNER"] = "OWNER";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["RECEPTIONIST"] = "RECEPTIONIST";
    UserRole["STYLIST"] = "STYLIST";
})(UserRole || (exports.UserRole = UserRole = {}));
// DTO para criar usuario
let CreateUserDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _password_extraInitializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    let _role_decorators;
    let _role_initializers = [];
    let _role_extraInitializers = [];
    let _salonId_decorators;
    let _salonId_initializers = [];
    let _salonId_extraInitializers = [];
    let _commissionRate_decorators;
    let _commissionRate_initializers = [];
    let _commissionRate_extraInitializers = [];
    let _specialties_decorators;
    let _specialties_initializers = [];
    let _specialties_extraInitializers = [];
    let _workSchedule_decorators;
    let _workSchedule_initializers = [];
    let _workSchedule_extraInitializers = [];
    let _sendPasswordLink_decorators;
    let _sendPasswordLink_initializers = [];
    let _sendPasswordLink_extraInitializers = [];
    return class CreateUserDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiProperty)({ description: 'Nome do usuário', example: 'João Silva' }), (0, class_validator_1.IsString)({ message: 'Nome deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Nome e obrigatorio' })];
            _email_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Email do usuário', example: 'joao@exemplo.com' }), (0, class_validator_1.IsEmail)({}, { message: 'Email invalido' }), (0, class_validator_1.IsOptional)()];
            _password_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Senha (mínimo 6 caracteres)', example: 'senha123', minLength: 6 }), (0, class_validator_1.IsString)({ message: 'Senha deve ser uma string' }), (0, class_validator_1.MinLength)(6, { message: 'Senha deve ter no minimo 6 caracteres' }), (0, class_validator_1.IsOptional)()];
            _phone_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Telefone do usuário', example: '11999998888' }), (0, class_validator_1.IsString)({ message: 'Telefone deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            _role_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Papel do usuário no sistema', enum: UserRole, example: 'STYLIST' }), (0, class_validator_1.IsEnum)(UserRole, { message: 'Role deve ser OWNER, MANAGER, RECEPTIONIST ou STYLIST' }), (0, class_validator_1.IsOptional)()];
            _salonId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do salão (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsString)({ message: 'SalonId deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'SalonId e obrigatorio' })];
            _commissionRate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Taxa de comissão (0 a 1)', example: 0.3, minimum: 0, maximum: 1 }), (0, class_validator_1.IsNumber)({}, { message: 'Taxa de comissao deve ser um numero' }), (0, class_validator_1.Min)(0, { message: 'Taxa de comissao deve ser no minimo 0' }), (0, class_validator_1.Max)(1, { message: 'Taxa de comissao deve ser no maximo 1' }), (0, class_validator_1.IsOptional)()];
            _specialties_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Especialidades do profissional', example: 'Corte, Coloração' }), (0, class_validator_1.IsString)({ message: 'Especialidades deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            _workSchedule_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário de trabalho por dia da semana', example: { seg: '09:00-18:00', ter: '09:00-18:00' } }), (0, class_validator_1.IsObject)({ message: 'Horario de trabalho deve ser um objeto' }), (0, class_validator_1.IsOptional)()];
            _sendPasswordLink_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Enviar link de criação de senha via WhatsApp (default: true se sem senha)', example: true }), (0, class_validator_1.IsBoolean)({ message: 'sendPasswordLink deve ser um booleano' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: obj => "role" in obj, get: obj => obj.role, set: (obj, value) => { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            __esDecorate(null, null, _salonId_decorators, { kind: "field", name: "salonId", static: false, private: false, access: { has: obj => "salonId" in obj, get: obj => obj.salonId, set: (obj, value) => { obj.salonId = value; } }, metadata: _metadata }, _salonId_initializers, _salonId_extraInitializers);
            __esDecorate(null, null, _commissionRate_decorators, { kind: "field", name: "commissionRate", static: false, private: false, access: { has: obj => "commissionRate" in obj, get: obj => obj.commissionRate, set: (obj, value) => { obj.commissionRate = value; } }, metadata: _metadata }, _commissionRate_initializers, _commissionRate_extraInitializers);
            __esDecorate(null, null, _specialties_decorators, { kind: "field", name: "specialties", static: false, private: false, access: { has: obj => "specialties" in obj, get: obj => obj.specialties, set: (obj, value) => { obj.specialties = value; } }, metadata: _metadata }, _specialties_initializers, _specialties_extraInitializers);
            __esDecorate(null, null, _workSchedule_decorators, { kind: "field", name: "workSchedule", static: false, private: false, access: { has: obj => "workSchedule" in obj, get: obj => obj.workSchedule, set: (obj, value) => { obj.workSchedule = value; } }, metadata: _metadata }, _workSchedule_initializers, _workSchedule_extraInitializers);
            __esDecorate(null, null, _sendPasswordLink_decorators, { kind: "field", name: "sendPasswordLink", static: false, private: false, access: { has: obj => "sendPasswordLink" in obj, get: obj => obj.sendPasswordLink, set: (obj, value) => { obj.sendPasswordLink = value; } }, metadata: _metadata }, _sendPasswordLink_initializers, _sendPasswordLink_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        email = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _email_initializers, void 0));
        password = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _password_initializers, void 0));
        phone = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
        role = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _role_initializers, void 0));
        salonId = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _salonId_initializers, void 0));
        commissionRate = (__runInitializers(this, _salonId_extraInitializers), __runInitializers(this, _commissionRate_initializers, void 0));
        specialties = (__runInitializers(this, _commissionRate_extraInitializers), __runInitializers(this, _specialties_initializers, void 0));
        workSchedule = (__runInitializers(this, _specialties_extraInitializers), __runInitializers(this, _workSchedule_initializers, void 0));
        sendPasswordLink = (__runInitializers(this, _workSchedule_extraInitializers), __runInitializers(this, _sendPasswordLink_initializers, void 0));
        constructor() {
            __runInitializers(this, _sendPasswordLink_extraInitializers);
        }
    };
})();
exports.CreateUserDto = CreateUserDto;
// DTO para atualizar usuario
let UpdateUserDto = (() => {
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
    let _commissionRate_decorators;
    let _commissionRate_initializers = [];
    let _commissionRate_extraInitializers = [];
    let _specialties_decorators;
    let _specialties_initializers = [];
    let _specialties_extraInitializers = [];
    let _active_decorators;
    let _active_initializers = [];
    let _active_extraInitializers = [];
    return class UpdateUserDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome do usuário', example: 'João Silva' }), (0, class_validator_1.IsString)({ message: 'Nome deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            _email_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Email do usuário', example: 'joao@exemplo.com' }), (0, class_validator_1.IsEmail)({}, { message: 'Email invalido' }), (0, class_validator_1.IsOptional)()];
            _phone_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Telefone do usuário', example: '11999998888' }), (0, class_validator_1.IsString)({ message: 'Telefone deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            _role_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Papel do usuário no sistema', enum: UserRole, example: 'STYLIST' }), (0, class_validator_1.IsEnum)(UserRole, { message: 'Role deve ser OWNER, MANAGER, RECEPTIONIST ou STYLIST' }), (0, class_validator_1.IsOptional)()];
            _commissionRate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Taxa de comissão (0 a 1)', example: 0.3, minimum: 0, maximum: 1 }), (0, class_validator_1.IsNumber)({}, { message: 'Taxa de comissao deve ser um numero' }), (0, class_validator_1.Min)(0, { message: 'Taxa de comissao deve ser no minimo 0' }), (0, class_validator_1.Max)(1, { message: 'Taxa de comissao deve ser no maximo 1' }), (0, class_validator_1.IsOptional)()];
            _specialties_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Especialidades do profissional', example: 'Corte, Coloração' }), (0, class_validator_1.IsString)({ message: 'Especialidades deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            _active_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Usuário ativo', example: true }), (0, class_validator_1.IsBoolean)({ message: 'Active deve ser um booleano' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: obj => "role" in obj, get: obj => obj.role, set: (obj, value) => { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            __esDecorate(null, null, _commissionRate_decorators, { kind: "field", name: "commissionRate", static: false, private: false, access: { has: obj => "commissionRate" in obj, get: obj => obj.commissionRate, set: (obj, value) => { obj.commissionRate = value; } }, metadata: _metadata }, _commissionRate_initializers, _commissionRate_extraInitializers);
            __esDecorate(null, null, _specialties_decorators, { kind: "field", name: "specialties", static: false, private: false, access: { has: obj => "specialties" in obj, get: obj => obj.specialties, set: (obj, value) => { obj.specialties = value; } }, metadata: _metadata }, _specialties_initializers, _specialties_extraInitializers);
            __esDecorate(null, null, _active_decorators, { kind: "field", name: "active", static: false, private: false, access: { has: obj => "active" in obj, get: obj => obj.active, set: (obj, value) => { obj.active = value; } }, metadata: _metadata }, _active_initializers, _active_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        email = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _email_initializers, void 0));
        phone = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
        role = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _role_initializers, void 0));
        commissionRate = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _commissionRate_initializers, void 0));
        specialties = (__runInitializers(this, _commissionRate_extraInitializers), __runInitializers(this, _specialties_initializers, void 0));
        active = (__runInitializers(this, _specialties_extraInitializers), __runInitializers(this, _active_initializers, void 0));
        constructor() {
            __runInitializers(this, _active_extraInitializers);
        }
    };
})();
exports.UpdateUserDto = UpdateUserDto;
// DTO para atualizar horario de trabalho
let UpdateWorkScheduleDto = (() => {
    let _seg_decorators;
    let _seg_initializers = [];
    let _seg_extraInitializers = [];
    let _ter_decorators;
    let _ter_initializers = [];
    let _ter_extraInitializers = [];
    let _qua_decorators;
    let _qua_initializers = [];
    let _qua_extraInitializers = [];
    let _qui_decorators;
    let _qui_initializers = [];
    let _qui_extraInitializers = [];
    let _sex_decorators;
    let _sex_initializers = [];
    let _sex_extraInitializers = [];
    let _sab_decorators;
    let _sab_initializers = [];
    let _sab_extraInitializers = [];
    let _dom_decorators;
    let _dom_initializers = [];
    let _dom_extraInitializers = [];
    return class UpdateWorkScheduleDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _seg_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário de segunda-feira (HH:MM-HH:MM)', example: '09:00-18:00' }), (0, class_validator_1.IsString)({ message: 'Horario de segunda deve ser no formato HH:MM-HH:MM' }), (0, class_validator_1.IsOptional)()];
            _ter_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário de terça-feira (HH:MM-HH:MM)', example: '09:00-18:00' }), (0, class_validator_1.IsString)({ message: 'Horario de terca deve ser no formato HH:MM-HH:MM' }), (0, class_validator_1.IsOptional)()];
            _qua_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário de quarta-feira (HH:MM-HH:MM)', example: '09:00-18:00' }), (0, class_validator_1.IsString)({ message: 'Horario de quarta deve ser no formato HH:MM-HH:MM' }), (0, class_validator_1.IsOptional)()];
            _qui_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário de quinta-feira (HH:MM-HH:MM)', example: '09:00-18:00' }), (0, class_validator_1.IsString)({ message: 'Horario de quinta deve ser no formato HH:MM-HH:MM' }), (0, class_validator_1.IsOptional)()];
            _sex_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário de sexta-feira (HH:MM-HH:MM)', example: '09:00-18:00' }), (0, class_validator_1.IsString)({ message: 'Horario de sexta deve ser no formato HH:MM-HH:MM' }), (0, class_validator_1.IsOptional)()];
            _sab_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário de sábado (HH:MM-HH:MM)', example: '09:00-14:00' }), (0, class_validator_1.IsString)({ message: 'Horario de sabado deve ser no formato HH:MM-HH:MM' }), (0, class_validator_1.IsOptional)()];
            _dom_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário de domingo (HH:MM-HH:MM)', example: null }), (0, class_validator_1.IsString)({ message: 'Horario de domingo deve ser no formato HH:MM-HH:MM' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _seg_decorators, { kind: "field", name: "seg", static: false, private: false, access: { has: obj => "seg" in obj, get: obj => obj.seg, set: (obj, value) => { obj.seg = value; } }, metadata: _metadata }, _seg_initializers, _seg_extraInitializers);
            __esDecorate(null, null, _ter_decorators, { kind: "field", name: "ter", static: false, private: false, access: { has: obj => "ter" in obj, get: obj => obj.ter, set: (obj, value) => { obj.ter = value; } }, metadata: _metadata }, _ter_initializers, _ter_extraInitializers);
            __esDecorate(null, null, _qua_decorators, { kind: "field", name: "qua", static: false, private: false, access: { has: obj => "qua" in obj, get: obj => obj.qua, set: (obj, value) => { obj.qua = value; } }, metadata: _metadata }, _qua_initializers, _qua_extraInitializers);
            __esDecorate(null, null, _qui_decorators, { kind: "field", name: "qui", static: false, private: false, access: { has: obj => "qui" in obj, get: obj => obj.qui, set: (obj, value) => { obj.qui = value; } }, metadata: _metadata }, _qui_initializers, _qui_extraInitializers);
            __esDecorate(null, null, _sex_decorators, { kind: "field", name: "sex", static: false, private: false, access: { has: obj => "sex" in obj, get: obj => obj.sex, set: (obj, value) => { obj.sex = value; } }, metadata: _metadata }, _sex_initializers, _sex_extraInitializers);
            __esDecorate(null, null, _sab_decorators, { kind: "field", name: "sab", static: false, private: false, access: { has: obj => "sab" in obj, get: obj => obj.sab, set: (obj, value) => { obj.sab = value; } }, metadata: _metadata }, _sab_initializers, _sab_extraInitializers);
            __esDecorate(null, null, _dom_decorators, { kind: "field", name: "dom", static: false, private: false, access: { has: obj => "dom" in obj, get: obj => obj.dom, set: (obj, value) => { obj.dom = value; } }, metadata: _metadata }, _dom_initializers, _dom_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        seg = __runInitializers(this, _seg_initializers, void 0);
        ter = (__runInitializers(this, _seg_extraInitializers), __runInitializers(this, _ter_initializers, void 0));
        qua = (__runInitializers(this, _ter_extraInitializers), __runInitializers(this, _qua_initializers, void 0));
        qui = (__runInitializers(this, _qua_extraInitializers), __runInitializers(this, _qui_initializers, void 0));
        sex = (__runInitializers(this, _qui_extraInitializers), __runInitializers(this, _sex_initializers, void 0));
        sab = (__runInitializers(this, _sex_extraInitializers), __runInitializers(this, _sab_initializers, void 0));
        dom = (__runInitializers(this, _sab_extraInitializers), __runInitializers(this, _dom_initializers, void 0));
        constructor() {
            __runInitializers(this, _dom_extraInitializers);
        }
    };
})();
exports.UpdateWorkScheduleDto = UpdateWorkScheduleDto;
// DTO para atualizar perfil do usuario logado
let UpdateProfileDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    return class UpdateProfileDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome do usuário', example: 'João Silva' }), (0, class_validator_1.IsString)({ message: 'Nome deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Nome e obrigatorio' }), (0, class_validator_1.IsOptional)()];
            _email_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Email do usuário', example: 'joao@exemplo.com' }), (0, class_validator_1.IsEmail)({}, { message: 'Email invalido' }), (0, class_validator_1.IsOptional)()];
            _phone_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Telefone do usuário', example: '11999998888' }), (0, class_validator_1.IsString)({ message: 'Telefone deve ser uma string' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        email = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _email_initializers, void 0));
        phone = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
        constructor() {
            __runInitializers(this, _phone_extraInitializers);
        }
    };
})();
exports.UpdateProfileDto = UpdateProfileDto;
// DTO para alterar senha
let ChangePasswordDto = (() => {
    let _currentPassword_decorators;
    let _currentPassword_initializers = [];
    let _currentPassword_extraInitializers = [];
    let _newPassword_decorators;
    let _newPassword_initializers = [];
    let _newPassword_extraInitializers = [];
    return class ChangePasswordDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _currentPassword_decorators = [(0, swagger_1.ApiProperty)({ description: 'Senha atual do usuário', example: 'senhaAtual123' }), (0, class_validator_1.IsString)({ message: 'Senha atual deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Senha atual e obrigatoria' })];
            _newPassword_decorators = [(0, swagger_1.ApiProperty)({ description: 'Nova senha (mínimo 6 caracteres)', example: 'novaSenha456', minLength: 6 }), (0, class_validator_1.IsString)({ message: 'Nova senha deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Nova senha e obrigatoria' }), (0, class_validator_1.MinLength)(6, { message: 'Nova senha deve ter no minimo 6 caracteres' })];
            __esDecorate(null, null, _currentPassword_decorators, { kind: "field", name: "currentPassword", static: false, private: false, access: { has: obj => "currentPassword" in obj, get: obj => obj.currentPassword, set: (obj, value) => { obj.currentPassword = value; } }, metadata: _metadata }, _currentPassword_initializers, _currentPassword_extraInitializers);
            __esDecorate(null, null, _newPassword_decorators, { kind: "field", name: "newPassword", static: false, private: false, access: { has: obj => "newPassword" in obj, get: obj => obj.newPassword, set: (obj, value) => { obj.newPassword = value; } }, metadata: _metadata }, _newPassword_initializers, _newPassword_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        currentPassword = __runInitializers(this, _currentPassword_initializers, void 0);
        newPassword = (__runInitializers(this, _currentPassword_extraInitializers), __runInitializers(this, _newPassword_initializers, void 0));
        constructor() {
            __runInitializers(this, _newPassword_extraInitializers);
        }
    };
})();
exports.ChangePasswordDto = ChangePasswordDto;
//# sourceMappingURL=dto.js.map