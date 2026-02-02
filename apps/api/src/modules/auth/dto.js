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
exports.SignupDto = exports.CreatePasswordDto = exports.LogoutDto = exports.RefreshTokenDto = exports.LoginDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
/**
 * DTO para login
 */
let LoginDto = (() => {
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _password_extraInitializers = [];
    return class LoginDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _email_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Email do usuário',
                    example: 'usuario@exemplo.com',
                }), (0, class_validator_1.IsEmail)({}, { message: 'Email inválido' }), (0, class_validator_1.IsNotEmpty)({ message: 'Email é obrigatório' })];
            _password_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Senha do usuário (mínimo 6 caracteres)',
                    example: 'senha123',
                    minLength: 6,
                }), (0, class_validator_1.IsString)({ message: 'Senha deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Senha é obrigatória' }), (0, class_validator_1.MinLength)(6, { message: 'Senha deve ter no mínimo 6 caracteres' })];
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        email = __runInitializers(this, _email_initializers, void 0);
        password = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _password_initializers, void 0));
        constructor() {
            __runInitializers(this, _password_extraInitializers);
        }
    };
})();
exports.LoginDto = LoginDto;
/**
 * DTO para refresh token
 */
let RefreshTokenDto = (() => {
    let _refreshToken_decorators;
    let _refreshToken_initializers = [];
    let _refreshToken_extraInitializers = [];
    return class RefreshTokenDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _refreshToken_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Refresh token JWT para renovar o access token',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                }), (0, class_validator_1.IsString)({ message: 'Refresh token deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Refresh token é obrigatório' })];
            __esDecorate(null, null, _refreshToken_decorators, { kind: "field", name: "refreshToken", static: false, private: false, access: { has: obj => "refreshToken" in obj, get: obj => obj.refreshToken, set: (obj, value) => { obj.refreshToken = value; } }, metadata: _metadata }, _refreshToken_initializers, _refreshToken_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        refreshToken = __runInitializers(this, _refreshToken_initializers, void 0);
        constructor() {
            __runInitializers(this, _refreshToken_extraInitializers);
        }
    };
})();
exports.RefreshTokenDto = RefreshTokenDto;
/**
 * DTO para logout
 */
let LogoutDto = (() => {
    let _refreshToken_decorators;
    let _refreshToken_initializers = [];
    let _refreshToken_extraInitializers = [];
    return class LogoutDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _refreshToken_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Refresh token JWT a ser invalidado',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                }), (0, class_validator_1.IsString)({ message: 'Refresh token deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Refresh token é obrigatório' })];
            __esDecorate(null, null, _refreshToken_decorators, { kind: "field", name: "refreshToken", static: false, private: false, access: { has: obj => "refreshToken" in obj, get: obj => obj.refreshToken, set: (obj, value) => { obj.refreshToken = value; } }, metadata: _metadata }, _refreshToken_initializers, _refreshToken_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        refreshToken = __runInitializers(this, _refreshToken_initializers, void 0);
        constructor() {
            __runInitializers(this, _refreshToken_extraInitializers);
        }
    };
})();
exports.LogoutDto = LogoutDto;
/**
 * DTO para criar senha via token
 */
let CreatePasswordDto = (() => {
    let _token_decorators;
    let _token_initializers = [];
    let _token_extraInitializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _password_extraInitializers = [];
    return class CreatePasswordDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _token_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Token de criação de senha recebido via WhatsApp',
                    example: 'a1b2c3d4e5f6...',
                }), (0, class_validator_1.IsString)({ message: 'Token deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Token é obrigatório' })];
            _password_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Nova senha (mínimo 6 caracteres)',
                    example: 'minhaSenha123',
                    minLength: 6,
                }), (0, class_validator_1.IsString)({ message: 'Senha deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Senha é obrigatória' }), (0, class_validator_1.MinLength)(6, { message: 'Senha deve ter no mínimo 6 caracteres' })];
            __esDecorate(null, null, _token_decorators, { kind: "field", name: "token", static: false, private: false, access: { has: obj => "token" in obj, get: obj => obj.token, set: (obj, value) => { obj.token = value; } }, metadata: _metadata }, _token_initializers, _token_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        token = __runInitializers(this, _token_initializers, void 0);
        password = (__runInitializers(this, _token_extraInitializers), __runInitializers(this, _password_initializers, void 0));
        constructor() {
            __runInitializers(this, _password_extraInitializers);
        }
    };
})();
exports.CreatePasswordDto = CreatePasswordDto;
/**
 * DTO para signup (cadastro público)
 */
let SignupDto = (() => {
    let _salonName_decorators;
    let _salonName_initializers = [];
    let _salonName_extraInitializers = [];
    let _ownerName_decorators;
    let _ownerName_initializers = [];
    let _ownerName_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _password_extraInitializers = [];
    let _planId_decorators;
    let _planId_initializers = [];
    let _planId_extraInitializers = [];
    return class SignupDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _salonName_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Nome do salão/estabelecimento',
                    example: 'Studio Maria Beleza',
                }), (0, class_validator_1.IsString)({ message: 'Nome do salão deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Nome do salão é obrigatório' })];
            _ownerName_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Nome completo do proprietário',
                    example: 'Maria Silva',
                }), (0, class_validator_1.IsString)({ message: 'Nome deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Nome é obrigatório' })];
            _email_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Email do proprietário',
                    example: 'maria@exemplo.com',
                }), (0, class_validator_1.IsEmail)({}, { message: 'Email inválido' }), (0, class_validator_1.IsNotEmpty)({ message: 'Email é obrigatório' })];
            _phone_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Telefone com DDD (apenas números)',
                    example: '11999999999',
                }), (0, class_validator_1.IsString)({ message: 'Telefone deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Telefone é obrigatório' }), (0, class_validator_1.Matches)(/^\d{10,11}$/, { message: 'Telefone deve ter 10 ou 11 dígitos' })];
            _password_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Senha (mínimo 6 caracteres)',
                    example: 'senha123',
                    minLength: 6,
                }), (0, class_validator_1.IsString)({ message: 'Senha deve ser uma string' }), (0, class_validator_1.IsNotEmpty)({ message: 'Senha é obrigatória' }), (0, class_validator_1.MinLength)(6, { message: 'Senha deve ter no mínimo 6 caracteres' })];
            _planId_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'ID do plano escolhido (UUID). Se não informado, usa o plano Professional.',
                    example: 'eeeeeee1-eeee-eeee-eeee-eeeeeeeeeeee',
                }), (0, class_validator_1.Matches)(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: 'planId deve ser um UUID válido' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _salonName_decorators, { kind: "field", name: "salonName", static: false, private: false, access: { has: obj => "salonName" in obj, get: obj => obj.salonName, set: (obj, value) => { obj.salonName = value; } }, metadata: _metadata }, _salonName_initializers, _salonName_extraInitializers);
            __esDecorate(null, null, _ownerName_decorators, { kind: "field", name: "ownerName", static: false, private: false, access: { has: obj => "ownerName" in obj, get: obj => obj.ownerName, set: (obj, value) => { obj.ownerName = value; } }, metadata: _metadata }, _ownerName_initializers, _ownerName_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            __esDecorate(null, null, _planId_decorators, { kind: "field", name: "planId", static: false, private: false, access: { has: obj => "planId" in obj, get: obj => obj.planId, set: (obj, value) => { obj.planId = value; } }, metadata: _metadata }, _planId_initializers, _planId_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        salonName = __runInitializers(this, _salonName_initializers, void 0);
        ownerName = (__runInitializers(this, _salonName_extraInitializers), __runInitializers(this, _ownerName_initializers, void 0));
        email = (__runInitializers(this, _ownerName_extraInitializers), __runInitializers(this, _email_initializers, void 0));
        phone = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
        password = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _password_initializers, void 0));
        planId = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _planId_initializers, void 0));
        constructor() {
            __runInitializers(this, _planId_extraInitializers);
        }
    };
})();
exports.SignupDto = SignupDto;
//# sourceMappingURL=dto.js.map