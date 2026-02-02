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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
let UsersController = (() => {
    let _classDecorators = [(0, common_1.Controller)('users')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getMe_decorators;
    let _updateMe_decorators;
    let _changeMyPassword_decorators;
    let _findAll_decorators;
    let _findProfessionals_decorators;
    let _findById_decorators;
    let _create_decorators;
    let _update_decorators;
    let _updateSchedule_decorators;
    let _deactivate_decorators;
    let _sendPasswordLink_decorators;
    var UsersController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getMe_decorators = [(0, common_1.Get)('me')];
            _updateMe_decorators = [(0, common_1.Patch)('me')];
            _changeMyPassword_decorators = [(0, common_1.Post)('me/change-password')];
            _findAll_decorators = [(0, common_1.Get)()];
            _findProfessionals_decorators = [(0, common_1.Get)('professionals')];
            _findById_decorators = [(0, common_1.Get)(':id')];
            _create_decorators = [(0, common_1.Post)()];
            _update_decorators = [(0, common_1.Patch)(':id')];
            _updateSchedule_decorators = [(0, common_1.Patch)(':id/schedule')];
            _deactivate_decorators = [(0, common_1.Delete)(':id')];
            _sendPasswordLink_decorators = [(0, common_1.Post)(':id/send-password-link')];
            __esDecorate(this, null, _getMe_decorators, { kind: "method", name: "getMe", static: false, private: false, access: { has: obj => "getMe" in obj, get: obj => obj.getMe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateMe_decorators, { kind: "method", name: "updateMe", static: false, private: false, access: { has: obj => "updateMe" in obj, get: obj => obj.updateMe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _changeMyPassword_decorators, { kind: "method", name: "changeMyPassword", static: false, private: false, access: { has: obj => "changeMyPassword" in obj, get: obj => obj.changeMyPassword }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findProfessionals_decorators, { kind: "method", name: "findProfessionals", static: false, private: false, access: { has: obj => "findProfessionals" in obj, get: obj => obj.findProfessionals }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateSchedule_decorators, { kind: "method", name: "updateSchedule", static: false, private: false, access: { has: obj => "updateSchedule" in obj, get: obj => obj.updateSchedule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deactivate_decorators, { kind: "method", name: "deactivate", static: false, private: false, access: { has: obj => "deactivate" in obj, get: obj => obj.deactivate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sendPasswordLink_decorators, { kind: "method", name: "sendPasswordLink", static: false, private: false, access: { has: obj => "sendPasswordLink" in obj, get: obj => obj.sendPasswordLink }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            UsersController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        usersService = __runInitializers(this, _instanceExtraInitializers);
        constructor(usersService) {
            this.usersService = usersService;
        }
        /**
         * GET /users/me
         * Retorna o perfil do usuario logado
         * (Alias para /profile - mesma logica)
         */
        async getMe(user) {
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
         * PATCH /users/me
         * Atualiza o perfil do usuario logado
         * (Alias para PATCH /profile - mesma logica)
         */
        async updateMe(user, data) {
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
         * POST /users/me/change-password
         * Altera a senha do usuario logado
         * (Alias para POST /profile/change-password - mesma logica)
         */
        async changeMyPassword(user, data) {
            if (!user || !user.id) {
                throw new common_1.UnauthorizedException('Usuario nao autenticado');
            }
            return this.usersService.changePassword(user.id, data.currentPassword, data.newPassword);
        }
        /**
         * GET /users
         * Lista usuarios do salão do usuario logado
         */
        async findAll(user, includeInactive) {
            console.log('[UsersController] findAll - user:', user?.id, 'salonId:', user?.salonId, 'includeInactive:', includeInactive);
            const result = await this.usersService.findAll(user?.salonId, includeInactive === 'true');
            console.log('[UsersController] findAll - returning', result.length, 'users');
            return result;
        }
        /**
         * GET /users/professionals
         * Lista apenas profissionais ativos do salão
         */
        async findProfessionals(user) {
            return this.usersService.findProfessionals(user?.salonId);
        }
        /**
         * GET /users/:id
         * Busca usuario por ID
         */
        async findById(id) {
            const user = await this.usersService.findById(id);
            if (!user) {
                throw new common_1.NotFoundException('Usuario nao encontrado');
            }
            return user;
        }
        /**
         * POST /users
         * Cria um novo usuario
         * Se criado sem senha e com telefone, envia link de criacao de senha via WhatsApp
         */
        async create(data) {
            const { sendPasswordLink, ...userData } = data;
            const user = await this.usersService.create(userData);
            // Se não tem senha e tem telefone, envia link de criação de senha
            // sendPasswordLink: true por default se não vier senha, false se vier
            const shouldSendLink = sendPasswordLink !== false && !data.password && user.phone;
            if (shouldSendLink) {
                try {
                    await this.usersService.sendPasswordCreationLink(user.id);
                    return {
                        ...user,
                        message: 'Usuario criado. Link de criacao de senha enviado via WhatsApp.',
                    };
                }
                catch (error) {
                    // Se falhar o envio, ainda retorna o usuário criado
                    console.error('Erro ao enviar link de senha:', error);
                    return {
                        ...user,
                        message: 'Usuario criado. Falha ao enviar link via WhatsApp.',
                    };
                }
            }
            return user;
        }
        /**
         * PATCH /users/:id
         * Atualiza um usuario
         */
        async update(id, data) {
            const user = await this.usersService.update(id, data);
            if (!user) {
                throw new common_1.NotFoundException('Usuario nao encontrado');
            }
            return user;
        }
        /**
         * PATCH /users/:id/schedule
         * Atualiza o horario de trabalho do profissional
         */
        async updateSchedule(id, schedule) {
            const user = await this.usersService.updateWorkSchedule(id, schedule);
            if (!user) {
                throw new common_1.NotFoundException('Usuario nao encontrado');
            }
            return user;
        }
        /**
         * DELETE /users/:id
         * Desativa um usuario (soft delete)
         */
        async deactivate(id) {
            const user = await this.usersService.deactivate(id);
            if (!user) {
                throw new common_1.NotFoundException('Usuario nao encontrado');
            }
            return { message: 'Usuario desativado com sucesso' };
        }
        /**
         * POST /users/:id/send-password-link
         * Reenvia link de criacao de senha via WhatsApp
         */
        async sendPasswordLink(id) {
            const user = await this.usersService.findById(id);
            if (!user) {
                throw new common_1.NotFoundException('Usuario nao encontrado');
            }
            return this.usersService.sendPasswordCreationLink(id);
        }
    };
    return UsersController = _classThis;
})();
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map