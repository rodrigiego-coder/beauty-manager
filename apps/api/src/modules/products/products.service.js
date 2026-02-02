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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../../database");
let ProductsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ProductsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ProductsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * Lista todos os produtos do salão com filtros opcionais
         */
        async findAll(options) {
            const { salonId, search, includeInactive, lowStockOnly, retailOnly, backbarOnly } = options;
            // Construir condições
            const conditions = [(0, drizzle_orm_1.eq)(database_1.products.salonId, salonId)];
            // Filtro de ativos/inativos
            if (!includeInactive) {
                conditions.push((0, drizzle_orm_1.eq)(database_1.products.active, true));
            }
            // Filtro de produtos vendáveis (retail)
            if (retailOnly) {
                conditions.push((0, drizzle_orm_1.eq)(database_1.products.isRetail, true));
            }
            // Filtro de produtos de consumo interno (backbar)
            if (backbarOnly) {
                conditions.push((0, drizzle_orm_1.eq)(database_1.products.isBackbar, true));
            }
            // Busca por nome ou descrição
            if (search && search.trim()) {
                const searchTerm = `%${search.trim()}%`;
                conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(database_1.products.name, searchTerm), (0, drizzle_orm_1.ilike)(database_1.products.description, searchTerm)));
            }
            const result = await this.db
                .select()
                .from(database_1.products)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy(database_1.products.name);
            // Filtro de estoque baixo (verifica ambos os estoques)
            if (lowStockOnly) {
                return result.filter(p => {
                    const retailLow = p.isRetail && p.stockRetail <= p.minStockRetail;
                    const internalLow = p.isBackbar && p.stockInternal <= p.minStockInternal;
                    return retailLow || internalLow;
                });
            }
            return result;
        }
        /**
         * Busca produto por ID
         */
        async findById(id) {
            const result = await this.db
                .select()
                .from(database_1.products)
                .where((0, drizzle_orm_1.eq)(database_1.products.id, id))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Cria um novo produto
         */
        async create(salonId, data) {
            const result = await this.db
                .insert(database_1.products)
                .values({
                ...data,
                salonId,
                costPrice: String(data.costPrice),
                salePrice: String(data.salePrice),
            })
                .returning();
            return result[0];
        }
        /**
         * Atualiza um produto
         */
        async update(id, data) {
            // Converter preços para string se fornecidos
            const updateData = { ...data, updatedAt: new Date() };
            if (data.costPrice !== undefined) {
                updateData.costPrice = String(data.costPrice);
            }
            if (data.salePrice !== undefined) {
                updateData.salePrice = String(data.salePrice);
            }
            const result = await this.db
                .update(database_1.products)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(database_1.products.id, id))
                .returning();
            return result[0] || null;
        }
        /**
         * Desativa um produto (soft delete)
         */
        async delete(id) {
            return this.update(id, { active: false });
        }
        /**
         * Reativa um produto
         */
        async reactivate(id) {
            return this.update(id, { active: true });
        }
        /**
         * Ajusta o estoque de um produto com localização (NOVO MÉTODO PRINCIPAL)
         * @param params Parâmetros do ajuste de estoque
         * @returns Produto atualizado e movimento registrado
         */
        async adjustStockWithLocation(params) {
            const { productId, salonId, userId, quantity, locationType, movementType, reason, referenceType, referenceId, transferGroupId, } = params;
            // Buscar produto atual
            const product = await this.findById(productId);
            if (!product) {
                throw new common_1.NotFoundException('Produto não encontrado');
            }
            // Verificar se o produto pertence ao salão
            if (product.salonId !== salonId) {
                throw new common_1.NotFoundException('Produto não encontrado');
            }
            // Determinar estoque atual e calcular novo estoque
            const isRetailLocation = locationType === 'RETAIL';
            const currentStock = isRetailLocation ? product.stockRetail : product.stockInternal;
            const newStock = currentStock + quantity; // quantity já é positivo para entrada, negativo para saída
            // Validar que não fica negativo
            if (newStock < 0) {
                throw new common_1.BadRequestException(`Estoque ${isRetailLocation ? 'Retail' : 'Internal'} insuficiente. ` +
                    `Estoque atual: ${currentStock}, quantidade solicitada: ${Math.abs(quantity)}`);
            }
            // Atualizar estoque do produto
            const updateData = isRetailLocation
                ? { stockRetail: newStock }
                : { stockInternal: newStock };
            const updatedProduct = await this.update(productId, updateData);
            // Registrar movimento no histórico
            const [movement] = await this.db
                .insert(database_1.stockMovements)
                .values({
                productId,
                salonId,
                locationType,
                delta: quantity,
                movementType,
                referenceType: referenceType || null,
                referenceId: referenceId || null,
                transferGroupId: transferGroupId || null,
                reason: reason || null,
                createdByUserId: userId,
            })
                .returning();
            return {
                product: updatedProduct,
                movement,
            };
        }
        /**
         * Ajusta o estoque de um produto (MÉTODO LEGADO - mantido para compatibilidade)
         * Por padrão, usa RETAIL e ADJUSTMENT
         */
        async adjustStock(id, salonId, userId, data) {
            const { quantity, type, reason } = data;
            // Buscar produto atual
            const product = await this.findById(id);
            if (!product) {
                throw new common_1.NotFoundException('Produto não encontrado');
            }
            // Verificar se o produto pertence ao salão
            if (product.salonId !== salonId) {
                throw new common_1.NotFoundException('Produto não encontrado');
            }
            // Calcular novo estoque (usando stockRetail como padrão para compatibilidade)
            const previousStock = product.stockRetail;
            let newStock;
            if (type === 'IN') {
                newStock = previousStock + quantity;
            }
            else {
                // Verificar se há estoque suficiente para saída
                if (quantity > previousStock) {
                    throw new common_1.BadRequestException(`Estoque insuficiente. Estoque atual: ${previousStock}, quantidade solicitada: ${quantity}`);
                }
                newStock = previousStock - quantity;
            }
            // Atualizar estoque do produto (stockRetail)
            const updatedProduct = await this.update(id, { stockRetail: newStock });
            // Registrar ajuste no histórico legado
            const [adjustment] = await this.db
                .insert(database_1.stockAdjustments)
                .values({
                productId: id,
                salonId,
                userId,
                type,
                quantity,
                previousStock,
                newStock,
                reason,
            })
                .returning();
            // Também registrar no novo sistema de movimentos
            const delta = type === 'IN' ? quantity : -quantity;
            const movementType = type === 'IN' ? 'PURCHASE' : 'ADJUSTMENT';
            await this.db
                .insert(database_1.stockMovements)
                .values({
                productId: id,
                salonId,
                locationType: 'RETAIL',
                delta,
                movementType,
                reason,
                createdByUserId: userId,
            });
            return {
                product: updatedProduct,
                adjustment,
            };
        }
        /**
         * Lista produtos com estoque baixo (verifica ambos os estoques)
         */
        async findLowStock(salonId) {
            const allProducts = await this.db
                .select()
                .from(database_1.products)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.products.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.products.active, true)));
            // Filtra produtos onde qualquer estoque está baixo
            return allProducts.filter(p => {
                const retailLow = p.isRetail && p.stockRetail <= p.minStockRetail;
                const internalLow = p.isBackbar && p.stockInternal <= p.minStockInternal;
                return retailLow || internalLow;
            });
        }
        /**
         * Retorna estatísticas do estoque
         */
        async getStats(salonId) {
            const allProducts = await this.db
                .select()
                .from(database_1.products)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.products.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.products.active, true)));
            const lowStockCount = allProducts.filter(p => {
                const retailLow = p.isRetail && p.stockRetail <= p.minStockRetail;
                const internalLow = p.isBackbar && p.stockInternal <= p.minStockInternal;
                return retailLow || internalLow;
            }).length;
            // Calcular valor total em estoque (ambos os estoques)
            let retailStockValue = 0;
            let internalStockValue = 0;
            allProducts.forEach(p => {
                const costPrice = parseFloat(p.costPrice);
                retailStockValue += p.stockRetail * costPrice;
                internalStockValue += p.stockInternal * costPrice;
            });
            return {
                totalProducts: allProducts.length,
                lowStockCount,
                totalStockValue: Math.round((retailStockValue + internalStockValue) * 100) / 100,
                retailStockValue: Math.round(retailStockValue * 100) / 100,
                internalStockValue: Math.round(internalStockValue * 100) / 100,
            };
        }
        /**
         * Busca histórico de ajustes de estoque de um produto (legado)
         */
        async getAdjustmentHistory(productId) {
            return this.db
                .select()
                .from(database_1.stockAdjustments)
                .where((0, drizzle_orm_1.eq)(database_1.stockAdjustments.productId, productId))
                .orderBy(database_1.stockAdjustments.createdAt);
        }
        /**
         * Busca histórico de movimentos de estoque de um produto (novo)
         */
        async getMovementHistory(productId) {
            return this.db
                .select()
                .from(database_1.stockMovements)
                .where((0, drizzle_orm_1.eq)(database_1.stockMovements.productId, productId))
                .orderBy(database_1.stockMovements.createdAt);
        }
        /**
         * Transfere estoque entre localizações (RETAIL <-> INTERNAL)
         */
        async transferStock(productId, salonId, userId, quantity, fromLocation, toLocation, reason) {
            if (fromLocation === toLocation) {
                throw new common_1.BadRequestException('Origem e destino devem ser diferentes');
            }
            if (quantity <= 0) {
                throw new common_1.BadRequestException('Quantidade deve ser positiva');
            }
            // Gerar ID de grupo para vincular os dois movimentos
            const transferGroupId = crypto.randomUUID();
            // Saída da origem
            await this.adjustStockWithLocation({
                productId,
                salonId,
                userId,
                quantity: -quantity, // negativo = saída
                locationType: fromLocation,
                movementType: 'TRANSFER',
                reason: reason || `Transferência para ${toLocation}`,
                transferGroupId,
            });
            // Entrada no destino
            const { product: finalProduct } = await this.adjustStockWithLocation({
                productId,
                salonId,
                userId,
                quantity: quantity, // positivo = entrada
                locationType: toLocation,
                movementType: 'TRANSFER',
                reason: reason || `Transferência de ${fromLocation}`,
                transferGroupId,
            });
            // Buscar ambos os movimentos
            const movements = await this.db
                .select()
                .from(database_1.stockMovements)
                .where((0, drizzle_orm_1.eq)(database_1.stockMovements.transferGroupId, transferGroupId));
            return {
                product: finalProduct,
                movements,
            };
        }
    };
    return ProductsService = _classThis;
})();
exports.ProductsService = ProductsService;
//# sourceMappingURL=products.service.js.map