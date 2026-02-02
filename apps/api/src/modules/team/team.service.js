"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../../database/schema"));
const bcrypt = __importStar(require("bcryptjs"));
let TeamService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TeamService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TeamService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * Lista todos os membros da equipe do salao com estatisticas
         */
        async findAll(salonId, includeInactive = false) {
            const conditions = [(0, drizzle_orm_1.eq)(schema.users.salonId, salonId)];
            if (!includeInactive) {
                conditions.push((0, drizzle_orm_1.eq)(schema.users.active, true));
            }
            const members = await this.db
                .select()
                .from(schema.users)
                .where((0, drizzle_orm_1.and)(...conditions));
            // Get stats for each member
            const membersWithStats = await Promise.all(members.map(async (member) => {
                const stats = await this.getStats(member.id);
                return {
                    ...member,
                    stats,
                };
            }));
            return membersWithStats;
        }
        /**
         * Busca um membro por ID
         */
        async findById(id, salonId) {
            const result = await this.db
                .select()
                .from(schema.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.id, id), (0, drizzle_orm_1.eq)(schema.users.salonId, salonId)))
                .limit(1);
            if (!result[0]) {
                throw new common_1.NotFoundException('Membro nao encontrado');
            }
            const stats = await this.getStats(id);
            return { ...result[0], stats };
        }
        /**
         * Convida novo membro (cria usuario e vincula ao salao)
         */
        async invite(salonId, data) {
            // Check if email already exists
            const existing = await this.db
                .select()
                .from(schema.users)
                .where((0, drizzle_orm_1.eq)(schema.users.email, data.email))
                .limit(1);
            if (existing[0]) {
                throw new common_1.ConflictException('Email ja cadastrado');
            }
            // Generate temporary password
            const tempPassword = Math.random().toString(36).slice(-8);
            const passwordHash = await bcrypt.hash(tempPassword, 10);
            const commissionRate = data.defaultCommission
                ? (data.defaultCommission / 100).toFixed(2)
                : '0.50';
            const result = await this.db
                .insert(schema.users)
                .values({
                salonId,
                name: data.name,
                email: data.email,
                phone: data.phone || null,
                role: data.role,
                commissionRate,
                passwordHash,
                active: true,
            })
                .returning();
            return {
                ...result[0],
                tempPassword, // Return temp password to be sent to user
            };
        }
        /**
         * Atualiza dados de um membro
         */
        async update(id, salonId, data) {
            // Verify member exists and belongs to salon
            await this.findById(id, salonId);
            const updateData = {
                updatedAt: new Date(),
            };
            if (data.name !== undefined)
                updateData.name = data.name;
            if (data.email !== undefined)
                updateData.email = data.email;
            if (data.phone !== undefined)
                updateData.phone = data.phone;
            if (data.role !== undefined)
                updateData.role = data.role;
            if (data.specialties !== undefined)
                updateData.specialties = data.specialties;
            if (data.defaultCommission !== undefined) {
                updateData.commissionRate = (data.defaultCommission / 100).toFixed(2);
            }
            const result = await this.db
                .update(schema.users)
                .set(updateData)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.id, id), (0, drizzle_orm_1.eq)(schema.users.salonId, salonId)))
                .returning();
            return result[0];
        }
        /**
         * Desativa um membro
         */
        async deactivate(id, salonId) {
            // Verify member exists
            await this.findById(id, salonId);
            const result = await this.db
                .update(schema.users)
                .set({ active: false, updatedAt: new Date() })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.id, id), (0, drizzle_orm_1.eq)(schema.users.salonId, salonId)))
                .returning();
            return result[0];
        }
        /**
         * Reativa um membro
         */
        async reactivate(id, salonId) {
            const result = await this.db
                .update(schema.users)
                .set({ active: true, updatedAt: new Date() })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.id, id), (0, drizzle_orm_1.eq)(schema.users.salonId, salonId)))
                .returning();
            if (!result[0]) {
                throw new common_1.NotFoundException('Membro nao encontrado');
            }
            return result[0];
        }
        /**
         * Estatisticas do profissional (atendimentos e faturamento do mes)
         */
        async getStats(userId) {
            // Get start and end of current month (formato ISO para PostgreSQL)
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
            // Count appointments this month
            const appointmentsResult = await this.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema.appointments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.appointments.professionalId, userId), (0, drizzle_orm_1.sql) `${schema.appointments.createdAt} >= ${startOfMonth}`, (0, drizzle_orm_1.sql) `${schema.appointments.createdAt} <= ${endOfMonth}`));
            // Calculate revenue from command items where this user was the performer
            const revenueResult = await this.db
                .select({
                total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema.commandItems.totalPrice}), 0)::text`,
            })
                .from(schema.commandItems)
                .innerJoin(schema.commands, (0, drizzle_orm_1.eq)(schema.commandItems.commandId, schema.commands.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.commandItems.performerId, userId), (0, drizzle_orm_1.sql) `${schema.commands.createdAt} >= ${startOfMonth}`, (0, drizzle_orm_1.sql) `${schema.commands.createdAt} <= ${endOfMonth}`));
            // Get pending commissions
            const pendingCommissionsResult = await this.db
                .select({
                total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema.commissions.commissionValue}), 0)::text`,
                count: (0, drizzle_orm_1.sql) `count(*)::int`,
            })
                .from(schema.commissions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.commissions.professionalId, userId), (0, drizzle_orm_1.eq)(schema.commissions.status, 'PENDING')));
            return {
                appointmentsThisMonth: appointmentsResult[0]?.count || 0,
                revenueThisMonth: parseFloat(revenueResult[0]?.total || '0'),
                pendingCommissions: parseFloat(pendingCommissionsResult[0]?.total || '0'),
                pendingCommissionsCount: pendingCommissionsResult[0]?.count || 0,
            };
        }
        /**
         * Lista serviços atribuídos ao profissional (com dados do serviço)
         */
        async getAssignedServices(professionalId, salonId) {
            // Valida que o profissional pertence ao salão
            await this.findById(professionalId, salonId);
            const rows = await this.db
                .select({
                serviceId: schema.professionalServices.serviceId,
                enabled: schema.professionalServices.enabled,
                priority: schema.professionalServices.priority,
                serviceName: schema.services.name,
                serviceCategory: schema.services.category,
                servicePrice: schema.services.basePrice,
            })
                .from(schema.professionalServices)
                .innerJoin(schema.services, (0, drizzle_orm_1.eq)(schema.professionalServices.serviceId, schema.services.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.professionalServices.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema.professionalServices.enabled, true)));
            return rows;
        }
        /**
         * Define serviços do profissional (replace all).
         * Deleta os existentes e insere os novos.
         */
        async setAssignedServices(professionalId, salonId, serviceIds) {
            // Valida profissional pertence ao salão
            await this.findById(professionalId, salonId);
            // Valida serviços pertencem ao salão
            if (serviceIds.length > 0) {
                const validServices = await this.db
                    .select({ id: schema.services.id })
                    .from(schema.services)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.services.salonId, salonId), (0, drizzle_orm_1.eq)(schema.services.active, true), (0, drizzle_orm_1.inArray)(schema.services.id, serviceIds)));
                const validIds = new Set(validServices.map((s) => s.id));
                const invalid = serviceIds.filter((id) => !validIds.has(id));
                if (invalid.length > 0) {
                    throw new common_1.NotFoundException(`Serviços não encontrados: ${invalid.join(', ')}`);
                }
            }
            // Delete all existing
            await this.db
                .delete(schema.professionalServices)
                .where((0, drizzle_orm_1.eq)(schema.professionalServices.professionalId, professionalId));
            // Insert new
            if (serviceIds.length > 0) {
                await this.db.insert(schema.professionalServices).values(serviceIds.map((serviceId) => ({
                    professionalId,
                    serviceId,
                    enabled: true,
                })));
            }
            return { success: true, count: serviceIds.length };
        }
        /**
         * Resumo geral da equipe
         */
        async getSummary(salonId) {
            // Total members by role
            const membersResult = await this.db
                .select({
                role: schema.users.role,
                count: (0, drizzle_orm_1.sql) `count(*)::int`,
            })
                .from(schema.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.salonId, salonId), (0, drizzle_orm_1.eq)(schema.users.active, true)))
                .groupBy(schema.users.role);
            // Total pending commissions for all members
            const pendingCommissions = await this.db
                .select({
                total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema.commissions.commissionValue}), 0)::text`,
            })
                .from(schema.commissions)
                .innerJoin(schema.users, (0, drizzle_orm_1.eq)(schema.commissions.professionalId, schema.users.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.salonId, salonId), (0, drizzle_orm_1.eq)(schema.commissions.status, 'PENDING')));
            const roleCount = membersResult.reduce((acc, item) => {
                acc[item.role] = item.count;
                return acc;
            }, {});
            const totalActive = membersResult.reduce((acc, item) => acc + item.count, 0);
            const totalStylists = roleCount['STYLIST'] || 0;
            return {
                totalActive,
                totalStylists,
                totalManagers: roleCount['MANAGER'] || 0,
                totalReceptionists: roleCount['RECEPTIONIST'] || 0,
                pendingCommissionsTotal: parseFloat(pendingCommissions[0]?.total || '0'),
            };
        }
    };
    return TeamService = _classThis;
})();
exports.TeamService = TeamService;
//# sourceMappingURL=team.service.js.map