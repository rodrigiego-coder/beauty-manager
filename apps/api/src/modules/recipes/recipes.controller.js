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
exports.RecipesController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let RecipesController = (() => {
    let _classDecorators = [(0, common_1.Controller)('services'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getActiveRecipe_decorators;
    let _getRecipeHistory_decorators;
    let _saveRecipe_decorators;
    let _deleteRecipe_decorators;
    var RecipesController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getActiveRecipe_decorators = [(0, common_1.Get)(':serviceId/recipe'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getRecipeHistory_decorators = [(0, common_1.Get)(':serviceId/recipe/history'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _saveRecipe_decorators = [(0, common_1.Put)(':serviceId/recipe'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _deleteRecipe_decorators = [(0, common_1.Delete)(':serviceId/recipe'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            __esDecorate(this, null, _getActiveRecipe_decorators, { kind: "method", name: "getActiveRecipe", static: false, private: false, access: { has: obj => "getActiveRecipe" in obj, get: obj => obj.getActiveRecipe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getRecipeHistory_decorators, { kind: "method", name: "getRecipeHistory", static: false, private: false, access: { has: obj => "getRecipeHistory" in obj, get: obj => obj.getRecipeHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _saveRecipe_decorators, { kind: "method", name: "saveRecipe", static: false, private: false, access: { has: obj => "saveRecipe" in obj, get: obj => obj.saveRecipe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteRecipe_decorators, { kind: "method", name: "deleteRecipe", static: false, private: false, access: { has: obj => "deleteRecipe" in obj, get: obj => obj.deleteRecipe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RecipesController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        recipesService = __runInitializers(this, _instanceExtraInitializers);
        constructor(recipesService) {
            this.recipesService = recipesService;
        }
        /**
         * GET /services/:serviceId/recipe
         * Busca a receita ATIVA de um serviço
         */
        async getActiveRecipe(serviceId, user) {
            return this.recipesService.getActiveRecipe(serviceId, user.salonId);
        }
        /**
         * GET /services/:serviceId/recipe/history
         * Lista todas as versões de receita de um serviço
         */
        async getRecipeHistory(serviceId, user) {
            return this.recipesService.getRecipeHistory(serviceId, user.salonId);
        }
        /**
         * PUT /services/:serviceId/recipe
         * Salva receita (cria nova versão se já existir)
         */
        async saveRecipe(serviceId, data, user) {
            return this.recipesService.saveRecipe(serviceId, user.salonId, user.id, data);
        }
        /**
         * DELETE /services/:serviceId/recipe
         * Arquiva a receita ativa
         */
        async deleteRecipe(serviceId, user) {
            const recipe = await this.recipesService.getActiveRecipe(serviceId, user.salonId);
            if (!recipe) {
                return { message: 'Nenhuma receita ativa encontrada' };
            }
            await this.recipesService.deleteRecipe(recipe.id, user.salonId);
            return { message: 'Receita arquivada com sucesso' };
        }
    };
    return RecipesController = _classThis;
})();
exports.RecipesController = RecipesController;
//# sourceMappingURL=recipes.controller.js.map