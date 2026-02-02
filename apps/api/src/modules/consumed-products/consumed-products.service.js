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
exports.ConsumedProductsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../../database");
let ConsumedProductsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ConsumedProductsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ConsumedProductsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        productsService;
        constructor(db, productsService) {
            this.db = db;
            this.productsService = productsService;
        }
        /**
         * Lista todos os produtos consumidos
         */
        async findAll() {
            return this.db.select().from(database_1.consumedProducts);
        }
        /**
         * Lista produtos consumidos por agendamento
         */
        async findByAppointment(appointmentId) {
            return this.db
                .select()
                .from(database_1.consumedProducts)
                .where((0, drizzle_orm_1.eq)(database_1.consumedProducts.appointmentId, appointmentId));
        }
        /**
         * Registra consumo de produto em atendimento
         * - Busca o custo atual do produto
         * - Desconta do estoque via ProductsService.adjustStock (auditoria em stock_adjustments)
         * - Registra o consumo com o custo no momento
         */
        async register(data) {
            // Busca o produto para obter o custo atual
            const product = await this.productsService.findById(data.productId);
            if (!product) {
                throw new common_1.NotFoundException('Produto nao encontrado');
            }
            // Validação multi-tenant
            if (product.salonId !== data.salonId) {
                throw new common_1.NotFoundException('Produto nao encontrado');
            }
            if (!product.active) {
                throw new common_1.BadRequestException('Produto esta inativo');
            }
            // Verifica estoque disponível (usa stockInternal para consumo de serviço)
            if (product.stockInternal < data.quantityUsed) {
                throw new common_1.BadRequestException(`Estoque interno insuficiente. Disponivel: ${product.stockInternal} ${product.unit}`);
            }
            // Desconta do estoque INTERNAL via ProductsService (registra em stock_movements)
            await this.productsService.adjustStockWithLocation({
                productId: data.productId,
                salonId: data.salonId,
                userId: data.userId,
                quantity: -data.quantityUsed, // negativo = saída
                locationType: 'INTERNAL',
                movementType: 'SERVICE_CONSUMPTION',
                reason: 'Consumo em serviço',
                referenceType: 'appointment',
                referenceId: data.appointmentId,
            });
            // Registra o consumo com o custo no momento
            const consumed = {
                appointmentId: data.appointmentId,
                productId: data.productId,
                quantityUsed: data.quantityUsed.toString(),
                costAtTime: product.costPrice,
            };
            const result = await this.db
                .insert(database_1.consumedProducts)
                .values(consumed)
                .returning();
            return result[0];
        }
        /**
         * Calcula o custo total de produtos de um atendimento
         */
        async calculateAppointmentCost(appointmentId) {
            const consumed = await this.findByAppointment(appointmentId);
            const items = [];
            let totalCost = 0;
            for (const item of consumed) {
                const productResult = await this.db
                    .select()
                    .from(database_1.products)
                    .where((0, drizzle_orm_1.eq)(database_1.products.id, item.productId))
                    .limit(1);
                const product = productResult[0];
                const quantity = parseFloat(item.quantityUsed);
                const unitCost = parseFloat(item.costAtTime);
                const itemTotal = quantity * unitCost;
                items.push({
                    productId: item.productId,
                    productName: product?.name || 'Produto removido',
                    quantity: item.quantityUsed,
                    unitCost: item.costAtTime,
                    totalCost: Math.round(itemTotal * 100) / 100,
                });
                totalCost += itemTotal;
            }
            return {
                items,
                totalCost: Math.round(totalCost * 100) / 100,
            };
        }
        /**
         * Calcula lucro real de um atendimento (preço - custos)
         */
        async calculateAppointmentProfit(appointmentId) {
            // Busca o agendamento para pegar o preço
            const appointmentResult = await this.db
                .select()
                .from(database_1.appointments)
                .where((0, drizzle_orm_1.eq)(database_1.appointments.id, appointmentId))
                .limit(1);
            const appointment = appointmentResult[0];
            if (!appointment) {
                throw new common_1.BadRequestException('Agendamento nao encontrado');
            }
            const revenue = Number(appointment.price || 0) / 100; // centavos para reais
            const costData = await this.calculateAppointmentCost(appointmentId);
            const productCost = costData.totalCost;
            const profit = revenue - productCost;
            const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
            return {
                revenue: Math.round(revenue * 100) / 100,
                productCost,
                profit: Math.round(profit * 100) / 100,
                profitMargin: Math.round(profitMargin * 100) / 100,
            };
        }
        /**
         * Remove um consumo (estorna o estoque via ProductsService.adjustStock)
         */
        async remove(id, ctx) {
            // Busca o consumo para estornar o estoque
            const consumedResult = await this.db
                .select()
                .from(database_1.consumedProducts)
                .where((0, drizzle_orm_1.eq)(database_1.consumedProducts.id, id))
                .limit(1);
            const consumed = consumedResult[0];
            if (!consumed) {
                return false;
            }
            // Busca o produto para validar tenant
            const product = await this.productsService.findById(consumed.productId);
            if (!product) {
                return false;
            }
            // Validação multi-tenant
            if (product.salonId !== ctx.salonId) {
                return false;
            }
            // Estorna o estoque INTERNAL via ProductsService (registra em stock_movements)
            await this.productsService.adjustStockWithLocation({
                productId: consumed.productId,
                salonId: ctx.salonId,
                userId: ctx.userId,
                quantity: parseFloat(consumed.quantityUsed), // positivo = entrada (estorno)
                locationType: 'INTERNAL',
                movementType: 'RETURN',
                reason: 'Estorno de consumo em serviço',
            });
            // Remove o registro
            await this.db.delete(database_1.consumedProducts).where((0, drizzle_orm_1.eq)(database_1.consumedProducts.id, id));
            return true;
        }
    };
    return ConsumedProductsService = _classThis;
})();
exports.ConsumedProductsService = ConsumedProductsService;
//# sourceMappingURL=consumed-products.service.js.map