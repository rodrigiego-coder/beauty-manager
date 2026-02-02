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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../database/schema");
let ServicesService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ServicesService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ServicesService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * Lista todos os serviços do salão
         */
        async findAll(salonId, includeInactive = false) {
            if (includeInactive) {
                return this.db
                    .select()
                    .from(schema_1.services)
                    .where((0, drizzle_orm_1.eq)(schema_1.services.salonId, salonId))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.services.createdAt));
            }
            return this.db
                .select()
                .from(schema_1.services)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.services.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.services.active, true)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.services.createdAt));
        }
        /**
         * Busca serviços por nome/descrição
         */
        async search(salonId, query, includeInactive = false) {
            const conditions = [
                (0, drizzle_orm_1.eq)(schema_1.services.salonId, salonId),
                (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.services.name, `%${query}%`), (0, drizzle_orm_1.ilike)(schema_1.services.description, `%${query}%`)),
            ];
            if (!includeInactive) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.services.active, true));
            }
            return this.db
                .select()
                .from(schema_1.services)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.services.createdAt));
        }
        /**
         * Busca serviço por ID
         */
        async findById(id) {
            const result = await this.db
                .select()
                .from(schema_1.services)
                .where((0, drizzle_orm_1.eq)(schema_1.services.id, id))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Cria um novo serviço
         */
        async create(salonId, data) {
            const [service] = await this.db
                .insert(schema_1.services)
                .values({
                salonId,
                name: data.name,
                description: data.description || null,
                category: data.category || 'HAIR',
                durationMinutes: data.durationMinutes || 60,
                basePrice: data.basePrice.toString(),
                commissionPercentage: (data.commissionPercentage || 0).toString(),
                active: true,
            })
                .returning();
            return service;
        }
        /**
         * Atualiza um serviço existente
         */
        async update(id, salonId, data) {
            const existing = await this.findById(id);
            if (!existing) {
                throw new common_1.NotFoundException('Servico nao encontrado');
            }
            if (existing.salonId !== salonId) {
                throw new common_1.NotFoundException('Servico nao encontrado');
            }
            const updateData = {
                updatedAt: new Date(),
            };
            if (data.name !== undefined) {
                updateData.name = data.name;
            }
            if (data.description !== undefined) {
                updateData.description = data.description;
            }
            if (data.category !== undefined) {
                updateData.category = data.category;
            }
            if (data.durationMinutes !== undefined) {
                updateData.durationMinutes = data.durationMinutes;
            }
            if (data.basePrice !== undefined) {
                updateData.basePrice = data.basePrice.toString();
            }
            if (data.commissionPercentage !== undefined) {
                updateData.commissionPercentage = data.commissionPercentage.toString();
            }
            const [updated] = await this.db
                .update(schema_1.services)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.services.id, id))
                .returning();
            return updated;
        }
        /**
         * Desativa um serviço (soft delete)
         */
        async delete(id, salonId) {
            const existing = await this.findById(id);
            if (!existing) {
                throw new common_1.NotFoundException('Servico nao encontrado');
            }
            if (existing.salonId !== salonId) {
                throw new common_1.NotFoundException('Servico nao encontrado');
            }
            const [deactivated] = await this.db
                .update(schema_1.services)
                .set({
                active: false,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.services.id, id))
                .returning();
            return deactivated;
        }
        /**
         * Reativa um serviço
         */
        async reactivate(id, salonId) {
            const existing = await this.findById(id);
            if (!existing) {
                throw new common_1.NotFoundException('Servico nao encontrado');
            }
            if (existing.salonId !== salonId) {
                throw new common_1.NotFoundException('Servico nao encontrado');
            }
            const [reactivated] = await this.db
                .update(schema_1.services)
                .set({
                active: true,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.services.id, id))
                .returning();
            return reactivated;
        }
        /**
         * Lista serviços por categoria
         */
        async findByCategory(salonId, category) {
            return this.db
                .select()
                .from(schema_1.services)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.services.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.services.category, category), (0, drizzle_orm_1.eq)(schema_1.services.active, true)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.services.createdAt));
        }
        /**
         * Ativa/desativa múltiplos serviços de uma vez
         */
        async bulkUpdateStatus(ids, active, salonId) {
            if (!ids || ids.length === 0) {
                return { updated: 0 };
            }
            const result = await this.db
                .update(schema_1.services)
                .set({
                active,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.services.id, ids), (0, drizzle_orm_1.eq)(schema_1.services.salonId, salonId)))
                .returning();
            return { updated: result.length };
        }
    };
    return ServicesService = _classThis;
})();
exports.ServicesService = ServicesService;
//# sourceMappingURL=services.service.js.map