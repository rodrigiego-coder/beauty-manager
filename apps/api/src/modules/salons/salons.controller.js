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
exports.SalonsController = void 0;
const common_1 = require("@nestjs/common");
let SalonsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('salons')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getMySalon_decorators;
    let _updateMySalon_decorators;
    let _findAll_decorators;
    let _findById_decorators;
    let _create_decorators;
    let _update_decorators;
    let _deactivate_decorators;
    var SalonsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getMySalon_decorators = [(0, common_1.Get)('my')];
            _updateMySalon_decorators = [(0, common_1.Patch)('my')];
            _findAll_decorators = [(0, common_1.Get)()];
            _findById_decorators = [(0, common_1.Get)(':id')];
            _create_decorators = [(0, common_1.Post)()];
            _update_decorators = [(0, common_1.Patch)(':id')];
            _deactivate_decorators = [(0, common_1.Delete)(':id')];
            __esDecorate(this, null, _getMySalon_decorators, { kind: "method", name: "getMySalon", static: false, private: false, access: { has: obj => "getMySalon" in obj, get: obj => obj.getMySalon }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateMySalon_decorators, { kind: "method", name: "updateMySalon", static: false, private: false, access: { has: obj => "updateMySalon" in obj, get: obj => obj.updateMySalon }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deactivate_decorators, { kind: "method", name: "deactivate", static: false, private: false, access: { has: obj => "deactivate" in obj, get: obj => obj.deactivate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SalonsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        salonsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(salonsService) {
            this.salonsService = salonsService;
        }
        /**
         * GET /salons/my
         * Retorna o salao do usuario logado
         */
        async getMySalon(user) {
            if (!user || !user.salonId) {
                throw new common_1.UnauthorizedException('Usuario nao autenticado');
            }
            const salon = await this.salonsService.findById(user.salonId);
            if (!salon) {
                throw new common_1.NotFoundException('Salao nao encontrado');
            }
            return salon;
        }
        /**
         * PATCH /salons/my
         * Atualiza o salao do usuario logado
         */
        async updateMySalon(user, data) {
            if (!user || !user.salonId) {
                throw new common_1.UnauthorizedException('Usuario nao autenticado');
            }
            // Apenas OWNER e MANAGER podem atualizar o salao
            if (user.role !== 'OWNER' && user.role !== 'MANAGER') {
                throw new common_1.UnauthorizedException('Sem permissao para atualizar o salao');
            }
            const salon = await this.salonsService.update(user.salonId, data);
            if (!salon) {
                throw new common_1.NotFoundException('Salao nao encontrado');
            }
            return {
                ...salon,
                message: 'Salao atualizado com sucesso',
            };
        }
        /**
         * GET /salons
         * Lista todos os saloes ativos
         */
        async findAll() {
            return this.salonsService.findAll();
        }
        /**
         * GET /salons/:id
         * Busca salao por ID
         */
        async findById(id) {
            const salon = await this.salonsService.findById(id);
            if (!salon) {
                throw new common_1.NotFoundException('Salao nao encontrado');
            }
            return salon;
        }
        /**
         * POST /salons
         * Cria um novo salao
         */
        async create(data) {
            return this.salonsService.create(data);
        }
        /**
         * PATCH /salons/:id
         * Atualiza um salao
         */
        async update(id, data) {
            const salon = await this.salonsService.update(id, data);
            if (!salon) {
                throw new common_1.NotFoundException('Salao nao encontrado');
            }
            return salon;
        }
        /**
         * DELETE /salons/:id
         * Desativa um salao (soft delete)
         */
        async deactivate(id) {
            const salon = await this.salonsService.deactivate(id);
            if (!salon) {
                throw new common_1.NotFoundException('Salao nao encontrado');
            }
            return { message: 'Salao desativado com sucesso' };
        }
    };
    return SalonsController = _classThis;
})();
exports.SalonsController = SalonsController;
//# sourceMappingURL=salons.controller.js.map