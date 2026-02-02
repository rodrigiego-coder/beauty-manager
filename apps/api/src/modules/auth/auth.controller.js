"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const dto_1 = require("./dto");
let AuthController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Auth'), (0, common_1.Controller)('auth')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _signup_decorators;
    let _login_decorators;
    let _refresh_decorators;
    let _logout_decorators;
    let _createPassword_decorators;
    let _validateToken_decorators;
    var AuthController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _signup_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('signup'), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED), (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }), (0, swagger_1.ApiOperation)({ summary: 'Cadastro público de novo salão' }), (0, swagger_1.ApiBody)({ type: dto_1.SignupDto })];
            _login_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('login'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }), (0, swagger_1.ApiOperation)({ summary: 'Login do usuário' }), (0, swagger_1.ApiBody)({ type: dto_1.LoginDto })];
            _refresh_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('refresh'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }), (0, swagger_1.ApiOperation)({ summary: 'Renovar access token' }), (0, swagger_1.ApiBody)({ type: dto_1.RefreshTokenDto })];
            _logout_decorators = [(0, common_1.Post)('logout'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Logout (invalidar refresh token)' }), (0, swagger_1.ApiBody)({ type: dto_1.LogoutDto })];
            _createPassword_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('create-password'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }), (0, swagger_1.ApiOperation)({ summary: 'Criar senha via token (primeiro acesso)' }), (0, swagger_1.ApiBody)({ type: dto_1.CreatePasswordDto })];
            _validateToken_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('validate-token'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }), (0, swagger_1.ApiOperation)({ summary: 'Validar token de criacao de senha' }), (0, swagger_1.ApiQuery)({ name: 'token', description: 'Token de criacao de senha' })];
            __esDecorate(this, null, _signup_decorators, { kind: "method", name: "signup", static: false, private: false, access: { has: obj => "signup" in obj, get: obj => obj.signup }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _login_decorators, { kind: "method", name: "login", static: false, private: false, access: { has: obj => "login" in obj, get: obj => obj.login }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _refresh_decorators, { kind: "method", name: "refresh", static: false, private: false, access: { has: obj => "refresh" in obj, get: obj => obj.refresh }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _logout_decorators, { kind: "method", name: "logout", static: false, private: false, access: { has: obj => "logout" in obj, get: obj => obj.logout }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createPassword_decorators, { kind: "method", name: "createPassword", static: false, private: false, access: { has: obj => "createPassword" in obj, get: obj => obj.createPassword }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _validateToken_decorators, { kind: "method", name: "validateToken", static: false, private: false, access: { has: obj => "validateToken" in obj, get: obj => obj.validateToken }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        authService = __runInitializers(this, _instanceExtraInitializers);
        constructor(authService) {
            this.authService = authService;
        }
        /**
         * POST /auth/signup
         * Cadastro publico de novo salao + usuario OWNER
         * Rota publica - nao requer autenticacao
         *
         * RATE LIMIT: 3 por minuto (protege contra spam)
         */
        async signup(signupDto) {
            return this.authService.signup(signupDto);
        }
        /**
         * POST /auth/login
         * Realiza o login do usuario
         * Rota publica - nao requer autenticacao
         *
         * RATE LIMIT: 5 tentativas por minuto
         * Protege contra ataques de forca bruta
         */
        async login(loginDto) {
            return this.authService.login(loginDto.email, loginDto.password);
        }
        /**
         * POST /auth/refresh
         * Renova o access token usando o refresh token
         * Rota publica - nao requer autenticacao (usa o refresh token)
         *
         * RATE LIMIT: 10 por minuto
         */
        async refresh(refreshDto) {
            return this.authService.refreshToken(refreshDto.refreshToken);
        }
        /**
         * POST /auth/logout
         * Invalida o refresh token (adiciona na blacklist)
         * Requer autenticacao - precisa estar logado
         */
        async logout(logoutDto, user) {
            return this.authService.logout(logoutDto.refreshToken, user.sub);
        }
        /**
         * POST /auth/create-password
         * Cria senha usando token recebido via WhatsApp
         * Rota publica - nao requer autenticacao
         *
         * RATE LIMIT: 5 tentativas por minuto
         * Protege contra ataques de forca bruta
         */
        async createPassword(dto) {
            return this.authService.createPassword(dto.token, dto.password);
        }
        /**
         * GET /auth/validate-token
         * Valida se um token de criacao de senha eh valido
         * Rota publica - nao requer autenticacao
         *
         * RATE LIMIT: 10 por minuto
         */
        async validateToken(token) {
            return this.authService.validatePasswordToken(token);
        }
    };
    return AuthController = _classThis;
})();
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map