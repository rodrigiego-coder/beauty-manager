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
exports.ProfileController = void 0;
const common_1 = require("@nestjs/common");
let ProfileController = (() => {
    let _classDecorators = [(0, common_1.Controller)('profile')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getProfile_decorators;
    let _updateProfile_decorators;
    let _changePassword_decorators;
    var ProfileController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getProfile_decorators = [(0, common_1.Get)()];
            _updateProfile_decorators = [(0, common_1.Patch)()];
            _changePassword_decorators = [(0, common_1.Post)('change-password')];
            __esDecorate(this, null, _getProfile_decorators, { kind: "method", name: "getProfile", static: false, private: false, access: { has: obj => "getProfile" in obj, get: obj => obj.getProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateProfile_decorators, { kind: "method", name: "updateProfile", static: false, private: false, access: { has: obj => "updateProfile" in obj, get: obj => obj.updateProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _changePassword_decorators, { kind: "method", name: "changePassword", static: false, private: false, access: { has: obj => "changePassword" in obj, get: obj => obj.changePassword }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ProfileController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        usersService = __runInitializers(this, _instanceExtraInitializers);
        constructor(usersService) {
            this.usersService = usersService;
        }
        /**
         * GET /profile
         * Retorna o perfil do usuario logado
         */
        async getProfile(user) {
            if (!user || !user.id) {
                throw new common_1.UnauthorizedException('Usuario nao autenticado');
            }
            const userData = await this.usersService.findById(user.id);
            if (!userData) {
                throw new common_1.NotFoundException('Usuario nao encontrado');
            }
            const { passwordHash, ...profile } = userData;
            return profile;
        }
        /**
         * PATCH /profile
         * Atualiza o perfil do usuario logado
         */
        async updateProfile(user, data) {
            if (!user || !user.id) {
                throw new common_1.UnauthorizedException('Usuario nao autenticado');
            }
            const updatedUser = await this.usersService.updateProfile(user.id, data);
            if (!updatedUser) {
                throw new common_1.NotFoundException('Usuario nao encontrado');
            }
            const { passwordHash, ...profile } = updatedUser;
            return {
                ...profile,
                message: 'Perfil atualizado com sucesso',
            };
        }
        /**
         * POST /profile/change-password
         * Altera a senha do usuario logado
         */
        async changePassword(user, data) {
            if (!user || !user.id) {
                throw new common_1.UnauthorizedException('Usuario nao autenticado');
            }
            return this.usersService.changePassword(user.id, data.currentPassword, data.newPassword);
        }
    };
    return ProfileController = _classThis;
})();
exports.ProfileController = ProfileController;
//# sourceMappingURL=profile.controller.js.map