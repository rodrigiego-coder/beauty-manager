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
exports.ServiceConsumptionsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../../database");
let ServiceConsumptionsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ServiceConsumptionsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ServiceConsumptionsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * Lista todos os consumos de um serviço (BOM)
         */
        async findByService(serviceId, salonId) {
            // Verificar se o serviço existe e pertence ao salão
            const service = await this.db
                .select()
                .from(database_1.services)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.services.id, serviceId), (0, drizzle_orm_1.eq)(database_1.services.salonId, salonId)))
                .limit(1);
            if (!service.length) {
                throw new common_1.NotFoundException('Servico nao encontrado');
            }
            return this.db
                .select()
                .from(database_1.serviceConsumptions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.serviceConsumptions.serviceId, serviceId), (0, drizzle_orm_1.eq)(database_1.serviceConsumptions.salonId, salonId)));
        }
        /**
         * Substitui completamente o BOM de um serviço
         * - Insere novos itens
         * - Atualiza existentes
         * - Remove os que não estão na lista
         */
        async replaceConsumptions(serviceId, salonId, items) {
            // Verificar se o serviço existe e pertence ao salão
            const service = await this.db
                .select()
                .from(database_1.services)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.services.id, serviceId), (0, drizzle_orm_1.eq)(database_1.services.salonId, salonId)))
                .limit(1);
            if (!service.length) {
                throw new common_1.NotFoundException('Servico nao encontrado');
            }
            // Validar todos os produtos
            const productIds = items.map(i => i.productId);
            if (productIds.length > 0) {
                const foundProducts = await this.db
                    .select()
                    .from(database_1.products)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.products.salonId, salonId), (0, drizzle_orm_1.inArray)(database_1.products.id, productIds)));
                // Verificar se todos os produtos existem
                const foundIds = new Set(foundProducts.map(p => p.id));
                for (const productId of productIds) {
                    if (!foundIds.has(productId)) {
                        throw new common_1.BadRequestException(`Produto ${productId} nao encontrado`);
                    }
                }
                // Validar que produtos são backbar (ou pelo menos não são retail-only)
                for (const product of foundProducts) {
                    if (!product.isBackbar && product.isRetail) {
                        // Produto é apenas retail, não pode ser usado no BOM
                        throw new common_1.BadRequestException(`Produto "${product.name}" (${product.id}) e apenas para venda (retail). ` +
                            `Para usar no BOM, marque como "Uso no salao" (backbar).`);
                    }
                }
            }
            // Remover todos os consumos atuais
            await this.db
                .delete(database_1.serviceConsumptions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.serviceConsumptions.serviceId, serviceId), (0, drizzle_orm_1.eq)(database_1.serviceConsumptions.salonId, salonId)));
            // Se não há itens, retornar vazio
            if (items.length === 0) {
                return [];
            }
            // Inserir novos consumos
            const now = new Date();
            const result = await this.db
                .insert(database_1.serviceConsumptions)
                .values(items.map(item => ({
                salonId,
                serviceId,
                productId: item.productId,
                quantity: String(item.quantity),
                unit: item.unit,
                createdAt: now,
                updatedAt: now,
            })))
                .returning();
            return result;
        }
        /**
         * Busca consumos para múltiplos serviços (útil para closeService)
         */
        async findByServiceIds(serviceIds, salonId) {
            if (serviceIds.length === 0) {
                return [];
            }
            return this.db
                .select()
                .from(database_1.serviceConsumptions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.serviceConsumptions.salonId, salonId), (0, drizzle_orm_1.inArray)(database_1.serviceConsumptions.serviceId, serviceIds)));
        }
    };
    return ServiceConsumptionsService = _classThis;
})();
exports.ServiceConsumptionsService = ServiceConsumptionsService;
//# sourceMappingURL=service-consumptions.service.js.map