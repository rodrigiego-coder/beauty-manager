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
exports.RecipesService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../database/schema");
let RecipesService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RecipesService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RecipesService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * Busca a receita ATIVA de um serviço
         */
        async getActiveRecipe(serviceId, salonId) {
            const [recipe] = await this.db
                .select()
                .from(schema_1.serviceRecipes)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.serviceRecipes.serviceId, serviceId), (0, drizzle_orm_1.eq)(schema_1.serviceRecipes.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.serviceRecipes.status, 'ACTIVE')))
                .limit(1);
            if (!recipe) {
                return null;
            }
            return this.buildRecipeResponse(recipe);
        }
        /**
         * Busca receita por ID
         */
        async getRecipeById(recipeId, salonId) {
            const [recipe] = await this.db
                .select()
                .from(schema_1.serviceRecipes)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.serviceRecipes.id, recipeId), (0, drizzle_orm_1.eq)(schema_1.serviceRecipes.salonId, salonId)))
                .limit(1);
            if (!recipe) {
                return null;
            }
            return this.buildRecipeResponse(recipe);
        }
        /**
         * Lista todas as versões de receita de um serviço
         */
        async getRecipeHistory(serviceId, salonId) {
            const recipes = await this.db
                .select()
                .from(schema_1.serviceRecipes)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.serviceRecipes.serviceId, serviceId), (0, drizzle_orm_1.eq)(schema_1.serviceRecipes.salonId, salonId)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.serviceRecipes.version));
            return Promise.all(recipes.map((r) => this.buildRecipeResponse(r)));
        }
        /**
         * Salva receita (cria nova versão se já existir)
         */
        async saveRecipe(serviceId, salonId, userId, data) {
            // Verificar se serviço existe
            const [service] = await this.db
                .select()
                .from(schema_1.services)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.services.id, serviceId), (0, drizzle_orm_1.eq)(schema_1.services.salonId, salonId)))
                .limit(1);
            if (!service) {
                throw new common_1.NotFoundException('Serviço não encontrado');
            }
            // Validar produtos (devem ser isBackbar = true)
            for (const line of data.lines) {
                const [product] = await this.db
                    .select()
                    .from(schema_1.products)
                    .where((0, drizzle_orm_1.eq)(schema_1.products.id, line.productId))
                    .limit(1);
                if (!product) {
                    throw new common_1.BadRequestException(`Produto ID ${line.productId} não encontrado`);
                }
                if (!product.isBackbar) {
                    throw new common_1.BadRequestException(`Produto "${product.name}" não está marcado como "Uso em Serviços". ` +
                        `Apenas produtos backbar podem ser usados em receitas.`);
                }
            }
            // Buscar receita ativa atual (se existir)
            const [currentRecipe] = await this.db
                .select()
                .from(schema_1.serviceRecipes)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.serviceRecipes.serviceId, serviceId), (0, drizzle_orm_1.eq)(schema_1.serviceRecipes.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.serviceRecipes.status, 'ACTIVE')))
                .limit(1);
            let newVersion = 1;
            // Se existe receita ativa, arquivar ela
            if (currentRecipe) {
                await this.db
                    .update(schema_1.serviceRecipes)
                    .set({
                    status: 'ARCHIVED',
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.serviceRecipes.id, currentRecipe.id));
                newVersion = currentRecipe.version + 1;
            }
            // Calcular custo estimado
            const estimatedCost = await this.calculateRecipeCost(data.lines);
            // Criar nova receita
            const [newRecipe] = await this.db
                .insert(schema_1.serviceRecipes)
                .values({
                salonId,
                serviceId,
                version: newVersion,
                status: 'ACTIVE',
                effectiveFrom: new Date().toISOString().split('T')[0],
                notes: data.notes,
                estimatedCost: estimatedCost.toString(),
                targetMarginPercent: (data.targetMarginPercent || 60).toString(),
                createdById: userId,
            })
                .returning();
            // Inserir linhas
            if (data.lines.length > 0) {
                await this.db.insert(schema_1.serviceRecipeLines).values(data.lines.map((line, index) => ({
                    recipeId: newRecipe.id,
                    productId: line.productId,
                    productGroupId: line.productGroupId || null,
                    quantityStandard: line.quantityStandard.toString(),
                    quantityBuffer: (line.quantityBuffer || 0).toString(),
                    unit: line.unit,
                    isRequired: line.isRequired ?? true,
                    notes: line.notes || null,
                    sortOrder: line.sortOrder ?? index,
                })));
            }
            // Inserir variações (se houver)
            if (data.variants && data.variants.length > 0) {
                await this.db.insert(schema_1.recipeVariants).values(data.variants.map((variant, index) => ({
                    recipeId: newRecipe.id,
                    code: variant.code,
                    name: variant.name,
                    multiplier: variant.multiplier.toString(),
                    isDefault: variant.isDefault ?? false,
                    sortOrder: variant.sortOrder ?? index,
                })));
            }
            else {
                // Criar variação DEFAULT se nenhuma foi especificada
                await this.db.insert(schema_1.recipeVariants).values({
                    recipeId: newRecipe.id,
                    code: 'DEFAULT',
                    name: 'Padrão',
                    multiplier: '1',
                    isDefault: true,
                    sortOrder: 0,
                });
            }
            return this.buildRecipeResponse(newRecipe);
        }
        /**
         * Deleta receita (marca como ARCHIVED)
         */
        async deleteRecipe(recipeId, salonId) {
            const [recipe] = await this.db
                .select()
                .from(schema_1.serviceRecipes)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.serviceRecipes.id, recipeId), (0, drizzle_orm_1.eq)(schema_1.serviceRecipes.salonId, salonId)))
                .limit(1);
            if (!recipe) {
                throw new common_1.NotFoundException('Receita não encontrada');
            }
            await this.db
                .update(schema_1.serviceRecipes)
                .set({
                status: 'ARCHIVED',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.serviceRecipes.id, recipeId));
        }
        /**
         * Calcula o custo total da receita
         */
        async calculateRecipeCost(lines) {
            let total = 0;
            for (const line of lines) {
                const [product] = await this.db
                    .select()
                    .from(schema_1.products)
                    .where((0, drizzle_orm_1.eq)(schema_1.products.id, line.productId))
                    .limit(1);
                if (product) {
                    const qty = line.quantityStandard + (line.quantityBuffer || 0);
                    total += parseFloat(product.costPrice) * qty;
                }
            }
            return Math.round(total * 100) / 100;
        }
        /**
         * Constrói response completa da receita
         */
        async buildRecipeResponse(recipe) {
            // Buscar serviço
            const [service] = await this.db
                .select()
                .from(schema_1.services)
                .where((0, drizzle_orm_1.eq)(schema_1.services.id, recipe.serviceId))
                .limit(1);
            // Buscar linhas com dados do produto
            const lines = await this.db
                .select({
                line: schema_1.serviceRecipeLines,
                product: schema_1.products,
            })
                .from(schema_1.serviceRecipeLines)
                .leftJoin(schema_1.products, (0, drizzle_orm_1.eq)(schema_1.serviceRecipeLines.productId, schema_1.products.id))
                .where((0, drizzle_orm_1.eq)(schema_1.serviceRecipeLines.recipeId, recipe.id))
                .orderBy(schema_1.serviceRecipeLines.sortOrder);
            // Buscar variações
            const variants = await this.db
                .select()
                .from(schema_1.recipeVariants)
                .where((0, drizzle_orm_1.eq)(schema_1.recipeVariants.recipeId, recipe.id))
                .orderBy(schema_1.recipeVariants.sortOrder);
            // Calcular custo base
            const baseCost = lines.reduce((sum, { line, product }) => {
                const qty = parseFloat(line.quantityStandard) +
                    parseFloat(line.quantityBuffer || '0');
                const cost = product ? parseFloat(product.costPrice) : 0;
                return sum + qty * cost;
            }, 0);
            // Montar response das linhas
            const linesResponse = lines.map(({ line, product }) => ({
                id: line.id,
                productId: line.productId,
                productName: product?.name || 'Produto não encontrado',
                productUnit: product?.unit || 'UN',
                productCost: product ? parseFloat(product.costPrice) : 0,
                productGroupId: line.productGroupId || undefined,
                quantityStandard: parseFloat(line.quantityStandard),
                quantityBuffer: parseFloat(line.quantityBuffer || '0'),
                unit: line.unit,
                isRequired: line.isRequired,
                notes: line.notes || undefined,
                sortOrder: line.sortOrder,
                lineCost: (parseFloat(line.quantityStandard) +
                    parseFloat(line.quantityBuffer || '0')) *
                    (product ? parseFloat(product.costPrice) : 0),
            }));
            // Montar response das variações
            const variantsResponse = variants.map((v) => ({
                id: v.id,
                code: v.code,
                name: v.name,
                multiplier: parseFloat(v.multiplier),
                isDefault: v.isDefault,
                sortOrder: v.sortOrder,
                estimatedCost: Math.round(baseCost * parseFloat(v.multiplier) * 100) / 100,
            }));
            return {
                id: recipe.id,
                serviceId: recipe.serviceId,
                serviceName: service?.name || 'Serviço não encontrado',
                version: recipe.version,
                status: recipe.status,
                effectiveFrom: recipe.effectiveFrom,
                notes: recipe.notes || undefined,
                estimatedCost: Math.round(baseCost * 100) / 100,
                targetMarginPercent: parseFloat(recipe.targetMarginPercent || '60'),
                lines: linesResponse,
                variants: variantsResponse,
                createdAt: recipe.createdAt?.toISOString(),
                updatedAt: recipe.updatedAt?.toISOString(),
            };
        }
    };
    return RecipesService = _classThis;
})();
exports.RecipesService = RecipesService;
//# sourceMappingURL=recipes.service.js.map