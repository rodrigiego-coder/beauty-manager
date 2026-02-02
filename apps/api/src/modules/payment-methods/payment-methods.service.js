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
exports.PaymentMethodsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../database/schema");
let PaymentMethodsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PaymentMethodsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PaymentMethodsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * Lista todas as formas de pagamento do salão
         */
        async findAll(salonId, includeInactive = false) {
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.paymentMethods.salonId, salonId)];
            if (!includeInactive) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.paymentMethods.active, true));
            }
            return this.db
                .select()
                .from(schema_1.paymentMethods)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.paymentMethods.sortOrder), (0, drizzle_orm_1.asc)(schema_1.paymentMethods.name));
        }
        /**
         * Busca forma de pagamento por ID
         */
        async findById(id) {
            const result = await this.db
                .select()
                .from(schema_1.paymentMethods)
                .where((0, drizzle_orm_1.eq)(schema_1.paymentMethods.id, id))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Cria uma nova forma de pagamento
         */
        async create(salonId, data) {
            const [item] = await this.db
                .insert(schema_1.paymentMethods)
                .values({
                salonId,
                name: data.name,
                type: data.type,
                feeType: data.feeType || null,
                feeMode: data.feeMode || null,
                feeValue: data.feeValue?.toString() || '0',
                sortOrder: data.sortOrder || 0,
                active: true,
            })
                .returning();
            return item;
        }
        /**
         * Atualiza uma forma de pagamento existente
         */
        async update(id, data) {
            const existing = await this.findById(id);
            if (!existing) {
                throw new common_1.NotFoundException('Forma de pagamento não encontrada');
            }
            const updateData = {
                updatedAt: new Date(),
            };
            if (data.name !== undefined)
                updateData.name = data.name;
            if (data.type !== undefined)
                updateData.type = data.type;
            if (data.feeType !== undefined)
                updateData.feeType = data.feeType;
            if (data.feeMode !== undefined)
                updateData.feeMode = data.feeMode;
            if (data.feeValue !== undefined)
                updateData.feeValue = data.feeValue.toString();
            if (data.sortOrder !== undefined)
                updateData.sortOrder = data.sortOrder;
            if (data.active !== undefined)
                updateData.active = data.active;
            const [updated] = await this.db
                .update(schema_1.paymentMethods)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.paymentMethods.id, id))
                .returning();
            return updated;
        }
        /**
         * Desativa (soft delete) uma forma de pagamento
         */
        async delete(id) {
            return this.update(id, { active: false });
        }
        /**
         * Reativa uma forma de pagamento
         */
        async reactivate(id) {
            return this.update(id, { active: true });
        }
        /**
         * Cria formas de pagamento padrão para um salão
         */
        async seedDefaultMethods(salonId) {
            const existing = await this.findAll(salonId, true);
            if (existing.length > 0) {
                return; // Já tem formas cadastradas
            }
            const defaults = [
                { name: 'Dinheiro', type: 'CASH', sortOrder: 1 },
                { name: 'PIX', type: 'PIX', sortOrder: 2 },
                { name: 'Cartão de Crédito', type: 'CARD_CREDIT', sortOrder: 3 },
                { name: 'Cartão de Débito', type: 'CARD_DEBIT', sortOrder: 4 },
                { name: 'Transferência', type: 'TRANSFER', sortOrder: 5 },
                { name: 'Vale/Voucher', type: 'VOUCHER', sortOrder: 6 },
            ];
            for (const method of defaults) {
                await this.db.insert(schema_1.paymentMethods).values({
                    salonId,
                    name: method.name,
                    type: method.type,
                    sortOrder: method.sortOrder,
                    active: true,
                });
            }
        }
    };
    return PaymentMethodsService = _classThis;
})();
exports.PaymentMethodsService = PaymentMethodsService;
//# sourceMappingURL=payment-methods.service.js.map