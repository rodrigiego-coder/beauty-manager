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
exports.PlansService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
let PlansService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PlansService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PlansService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        /**
         * List all active plans (public)
         */
        async findAll(includeInactive = false) {
            const conditions = includeInactive ? [] : [(0, drizzle_orm_1.eq)(schema_1.plans.isActive, true)];
            const result = await connection_1.db
                .select()
                .from(schema_1.plans)
                .where(conditions.length ? conditions[0] : undefined)
                .orderBy((0, drizzle_orm_1.asc)(schema_1.plans.sortOrder));
            return result;
        }
        /**
         * Get plan by ID
         */
        async findById(id) {
            const result = await connection_1.db
                .select()
                .from(schema_1.plans)
                .where((0, drizzle_orm_1.eq)(schema_1.plans.id, id))
                .limit(1);
            if (result.length === 0) {
                throw new common_1.NotFoundException('Plano não encontrado');
            }
            return result[0];
        }
        /**
         * Get plan by code
         */
        async findByCode(code) {
            const result = await connection_1.db
                .select()
                .from(schema_1.plans)
                .where((0, drizzle_orm_1.eq)(schema_1.plans.code, code.toUpperCase()))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Create a new plan (SUPER_ADMIN only)
         */
        async create(dto) {
            // Check if code already exists
            const existing = await this.findByCode(dto.code);
            if (existing) {
                throw new common_1.ConflictException(`Plano com código ${dto.code} já existe`);
            }
            const newPlan = {
                code: dto.code.toUpperCase(),
                name: dto.name,
                description: dto.description,
                priceMonthly: String(dto.priceMonthly),
                priceYearly: dto.priceYearly ? String(dto.priceYearly) : null,
                maxUsers: dto.maxUsers,
                maxClients: dto.maxClients,
                maxSalons: dto.maxSalons || 1,
                features: dto.features || [],
                hasFiscal: dto.hasFiscal || false,
                hasAutomation: dto.hasAutomation || false,
                hasReports: dto.hasReports || false,
                hasAI: dto.hasAI || false,
                trialDays: dto.trialDays || 14,
                sortOrder: dto.sortOrder || 0,
                isActive: true,
            };
            const result = await connection_1.db
                .insert(schema_1.plans)
                .values(newPlan)
                .returning();
            return result[0];
        }
        /**
         * Update a plan (SUPER_ADMIN only)
         */
        async update(id, dto) {
            // Verify plan exists
            await this.findById(id);
            const updateData = {
                updatedAt: new Date(),
            };
            if (dto.name !== undefined)
                updateData.name = dto.name;
            if (dto.description !== undefined)
                updateData.description = dto.description;
            if (dto.priceMonthly !== undefined)
                updateData.priceMonthly = String(dto.priceMonthly);
            if (dto.priceYearly !== undefined)
                updateData.priceYearly = String(dto.priceYearly);
            if (dto.maxUsers !== undefined)
                updateData.maxUsers = dto.maxUsers;
            if (dto.maxClients !== undefined)
                updateData.maxClients = dto.maxClients;
            if (dto.maxSalons !== undefined)
                updateData.maxSalons = dto.maxSalons;
            if (dto.features !== undefined)
                updateData.features = dto.features;
            if (dto.hasFiscal !== undefined)
                updateData.hasFiscal = dto.hasFiscal;
            if (dto.hasAutomation !== undefined)
                updateData.hasAutomation = dto.hasAutomation;
            if (dto.hasReports !== undefined)
                updateData.hasReports = dto.hasReports;
            if (dto.hasAI !== undefined)
                updateData.hasAI = dto.hasAI;
            if (dto.trialDays !== undefined)
                updateData.trialDays = dto.trialDays;
            if (dto.isActive !== undefined)
                updateData.isActive = dto.isActive;
            if (dto.sortOrder !== undefined)
                updateData.sortOrder = dto.sortOrder;
            const result = await connection_1.db
                .update(schema_1.plans)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.plans.id, id))
                .returning();
            return result[0];
        }
        /**
         * Deactivate a plan (SUPER_ADMIN only)
         */
        async deactivate(id) {
            await this.findById(id);
            const result = await connection_1.db
                .update(schema_1.plans)
                .set({ isActive: false, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.plans.id, id))
                .returning();
            return result[0];
        }
        /**
         * Get free plan (for new salon signups)
         */
        async getFreePlan() {
            const result = await connection_1.db
                .select()
                .from(schema_1.plans)
                .where((0, drizzle_orm_1.eq)(schema_1.plans.code, 'FREE'))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Seed default plans if they don't exist
         */
        async seedPlans() {
            const existingPlans = await this.findAll(true);
            if (existingPlans.length > 0) {
                return; // Plans already exist
            }
            const defaultPlans = [
                {
                    code: 'FREE',
                    name: 'Plano Gratuito',
                    description: 'Ideal para começar. Limitado a 1 usuário e 50 clientes.',
                    priceMonthly: 0,
                    priceYearly: 0,
                    maxUsers: 1,
                    maxClients: 50,
                    maxSalons: 1,
                    features: ['Agendamentos básicos', 'Comandas', 'Relatórios simples'],
                    hasFiscal: false,
                    hasAutomation: false,
                    hasReports: false,
                    hasAI: false,
                    trialDays: 0,
                    sortOrder: 0,
                },
                {
                    code: 'BASIC',
                    name: 'Plano Básico',
                    description: 'Para salões pequenos. Até 3 usuários e 200 clientes.',
                    priceMonthly: 99,
                    priceYearly: 999,
                    maxUsers: 3,
                    maxClients: 200,
                    maxSalons: 1,
                    features: ['Agendamentos', 'Comandas', 'Estoque básico', 'Relatórios básicos'],
                    hasFiscal: false,
                    hasAutomation: false,
                    hasReports: true,
                    hasAI: false,
                    trialDays: 14,
                    sortOrder: 1,
                },
                {
                    code: 'PRO',
                    name: 'Plano Profissional',
                    description: 'Para salões em crescimento. Até 10 usuários e 1000 clientes.',
                    priceMonthly: 199,
                    priceYearly: 1999,
                    maxUsers: 10,
                    maxClients: 1000,
                    maxSalons: 1,
                    features: [
                        'Agendamentos avançados',
                        'Comandas',
                        'Estoque completo',
                        'Relatórios avançados',
                        'Módulo fiscal (NF-e)',
                        'Comissões',
                        'Multi-usuário',
                    ],
                    hasFiscal: true,
                    hasAutomation: false,
                    hasReports: true,
                    hasAI: false,
                    trialDays: 14,
                    sortOrder: 2,
                },
                {
                    code: 'PREMIUM',
                    name: 'Plano Premium',
                    description: 'Para grandes salões. Usuários e clientes ilimitados.',
                    priceMonthly: 399,
                    priceYearly: 3999,
                    maxUsers: 999,
                    maxClients: 99999,
                    maxSalons: 5,
                    features: [
                        'Tudo do PRO',
                        'Automação WhatsApp',
                        'IA para atendimento',
                        'Multi-unidades',
                        'API de integração',
                        'Suporte prioritário',
                    ],
                    hasFiscal: true,
                    hasAutomation: true,
                    hasReports: true,
                    hasAI: true,
                    trialDays: 14,
                    sortOrder: 3,
                },
            ];
            for (const plan of defaultPlans) {
                await this.create(plan);
            }
        }
    };
    return PlansService = _classThis;
})();
exports.PlansService = PlansService;
//# sourceMappingURL=plans.service.js.map