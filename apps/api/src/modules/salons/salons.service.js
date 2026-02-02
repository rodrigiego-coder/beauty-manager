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
exports.SalonsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../../database");
let SalonsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SalonsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SalonsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        logger = new common_1.Logger(SalonsService.name);
        TEMPLATE_SALON_ID = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
        constructor(db) {
            this.db = db;
        }
        /**
         * Lista todos os salões ativos
         */
        async findAll() {
            return this.db
                .select()
                .from(database_1.salons)
                .where((0, drizzle_orm_1.eq)(database_1.salons.active, true));
        }
        /**
         * Busca salão por ID
         */
        async findById(id) {
            const result = await this.db
                .select()
                .from(database_1.salons)
                .where((0, drizzle_orm_1.eq)(database_1.salons.id, id))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Busca salão por CNPJ
         */
        async findByTaxId(taxId) {
            const result = await this.db
                .select()
                .from(database_1.salons)
                .where((0, drizzle_orm_1.eq)(database_1.salons.taxId, taxId))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Cria um novo salão e copia serviços/produtos do template
         */
        async create(data) {
            const result = await this.db
                .insert(database_1.salons)
                .values(data)
                .returning();
            const newSalon = result[0];
            // Copia serviços e produtos do template
            try {
                await this.copyTemplateData(newSalon.id);
                this.logger.log(`Template data copied to new salon: ${newSalon.id}`);
            }
            catch (error) {
                this.logger.error(`Failed to copy template data to salon ${newSalon.id}:`, error);
                // Não falha a criação do salão se a cópia falhar
            }
            return newSalon;
        }
        /**
         * Atualiza um salão
         */
        async update(id, data) {
            const result = await this.db
                .update(database_1.salons)
                .set({
                ...data,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.salons.id, id))
                .returning();
            return result[0] || null;
        }
        /**
         * Desativa um salão (soft delete)
         */
        async deactivate(id) {
            return this.update(id, { active: false });
        }
        /**
         * Copia serviços e produtos do salão template para um novo salão
         * Os itens são criados como INATIVOS para o salão ativar conforme necessidade
         */
        async copyTemplateData(newSalonId) {
            // Copiar serviços do template (inativos)
            const servicesResult = await this.db.execute((0, drizzle_orm_1.sql) `
      INSERT INTO services (
        salon_id, name, description, category, duration_minutes, base_price,
        commission_percentage, buffer_before, buffer_after, allow_encaixe,
        requires_room, allow_home_service, home_service_fee,
        max_advance_booking_days, min_advance_booking_hours,
        allow_online_booking, active, created_at, updated_at
      )
      SELECT
        ${newSalonId}::uuid,
        name, description, category, duration_minutes, base_price,
        commission_percentage, buffer_before, buffer_after, allow_encaixe,
        requires_room, allow_home_service, home_service_fee,
        max_advance_booking_days, min_advance_booking_hours,
        allow_online_booking, false, NOW(), NOW()
      FROM services
      WHERE salon_id = ${this.TEMPLATE_SALON_ID}::uuid
    `);
            // Copiar produtos do template (inativos, estoque zerado)
            const productsResult = await this.db.execute((0, drizzle_orm_1.sql) `
      INSERT INTO products (
        salon_id, name, description, cost_price, sale_price,
        stock_retail, stock_internal, min_stock_retail, min_stock_internal,
        unit, active, is_retail, is_backbar, hair_types, concerns,
        contraindications, ingredients, how_to_use, benefits,
        brand, category, created_at, updated_at, catalog_code,
        is_system_default, alexis_enabled
      )
      SELECT
        ${newSalonId}::uuid,
        name, description, cost_price, sale_price,
        0, 0, min_stock_retail, min_stock_internal,
        unit, false, is_retail, is_backbar, hair_types, concerns,
        contraindications, ingredients, how_to_use, benefits,
        brand, category, NOW(), NOW(), catalog_code,
        false, alexis_enabled
      FROM products
      WHERE salon_id = ${this.TEMPLATE_SALON_ID}::uuid
    `);
            const servicesCount = servicesResult.rowCount || 0;
            const productsCount = productsResult.rowCount || 0;
            this.logger.log(`Copied ${servicesCount} services and ${productsCount} products to salon ${newSalonId}`);
            return { services: servicesCount, products: productsCount };
        }
    };
    return SalonsService = _classThis;
})();
exports.SalonsService = SalonsService;
//# sourceMappingURL=salons.service.js.map