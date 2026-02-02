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
exports.PaymentDestinationsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../database/schema");
let PaymentDestinationsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PaymentDestinationsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PaymentDestinationsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * Lista todos os destinos de pagamento do salão
         */
        async findAll(salonId, includeInactive = false) {
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.paymentDestinations.salonId, salonId)];
            if (!includeInactive) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.paymentDestinations.active, true));
            }
            return this.db
                .select()
                .from(schema_1.paymentDestinations)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.paymentDestinations.sortOrder), (0, drizzle_orm_1.asc)(schema_1.paymentDestinations.name));
        }
        /**
         * Busca destino de pagamento por ID
         */
        async findById(id) {
            const result = await this.db
                .select()
                .from(schema_1.paymentDestinations)
                .where((0, drizzle_orm_1.eq)(schema_1.paymentDestinations.id, id))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Cria um novo destino de pagamento
         */
        async create(salonId, data) {
            const [item] = await this.db
                .insert(schema_1.paymentDestinations)
                .values({
                salonId,
                name: data.name,
                type: data.type,
                bankName: data.bankName || null,
                lastDigits: data.lastDigits || null,
                description: data.description || null,
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
         * Atualiza um destino de pagamento existente
         */
        async update(id, data) {
            const existing = await this.findById(id);
            if (!existing) {
                throw new common_1.NotFoundException('Destino de pagamento não encontrado');
            }
            const updateData = {
                updatedAt: new Date(),
            };
            if (data.name !== undefined)
                updateData.name = data.name;
            if (data.type !== undefined)
                updateData.type = data.type;
            if (data.bankName !== undefined)
                updateData.bankName = data.bankName;
            if (data.lastDigits !== undefined)
                updateData.lastDigits = data.lastDigits;
            if (data.description !== undefined)
                updateData.description = data.description;
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
                .update(schema_1.paymentDestinations)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.paymentDestinations.id, id))
                .returning();
            return updated;
        }
        /**
         * Desativa (soft delete) um destino de pagamento
         */
        async delete(id) {
            return this.update(id, { active: false });
        }
        /**
         * Reativa um destino de pagamento
         */
        async reactivate(id) {
            return this.update(id, { active: true });
        }
        /**
         * Cria destinos de pagamento padrão para um salão
         */
        async seedDefaultDestinations(salonId) {
            const existing = await this.findAll(salonId, true);
            if (existing.length > 0) {
                return; // Já tem destinos cadastrados
            }
            const defaults = [
                { name: 'Caixa do Salão', type: 'CASH_DRAWER', sortOrder: 1 },
            ];
            for (const destination of defaults) {
                await this.db.insert(schema_1.paymentDestinations).values({
                    salonId,
                    name: destination.name,
                    type: destination.type,
                    sortOrder: destination.sortOrder,
                    active: true,
                });
            }
        }
    };
    return PaymentDestinationsService = _classThis;
})();
exports.PaymentDestinationsService = PaymentDestinationsService;
//# sourceMappingURL=payment-destinations.service.js.map