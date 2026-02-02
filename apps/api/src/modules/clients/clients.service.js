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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../../database");
let ClientsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ClientsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ClientsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * Lista todos os clientes de um salão com filtros
         */
        async findAll(options) {
            const { salonId, search, includeInactive } = options;
            const conditions = [(0, drizzle_orm_1.eq)(database_1.clients.salonId, salonId)];
            // Filtro de ativos/inativos
            if (!includeInactive) {
                conditions.push((0, drizzle_orm_1.eq)(database_1.clients.active, true));
            }
            // Busca por nome, telefone ou email
            if (search && search.trim()) {
                const searchTerm = `%${search.trim()}%`;
                conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(database_1.clients.name, searchTerm), (0, drizzle_orm_1.ilike)(database_1.clients.phone, searchTerm), (0, drizzle_orm_1.ilike)(database_1.clients.email, searchTerm)));
            }
            return this.db
                .select()
                .from(database_1.clients)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy((0, drizzle_orm_1.desc)(database_1.clients.createdAt));
        }
        /**
         * Busca cliente por ID
         */
        async findById(id) {
            const result = await this.db
                .select()
                .from(database_1.clients)
                .where((0, drizzle_orm_1.eq)(database_1.clients.id, id))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Busca cliente pelo telefone
         */
        async findByPhone(phone, salonId) {
            const conditions = [(0, drizzle_orm_1.eq)(database_1.clients.phone, phone)];
            if (salonId) {
                conditions.push((0, drizzle_orm_1.eq)(database_1.clients.salonId, salonId));
            }
            const result = await this.db
                .select()
                .from(database_1.clients)
                .where((0, drizzle_orm_1.and)(...conditions))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Busca clientes por termo (nome, email ou telefone)
         */
        async search(salonId, term, includeInactive = false) {
            const searchTerm = `%${term}%`;
            const conditions = [
                (0, drizzle_orm_1.eq)(database_1.clients.salonId, salonId),
                (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(database_1.clients.name, searchTerm), (0, drizzle_orm_1.ilike)(database_1.clients.email, searchTerm), (0, drizzle_orm_1.ilike)(database_1.clients.phone, searchTerm)),
            ];
            if (!includeInactive) {
                conditions.push((0, drizzle_orm_1.eq)(database_1.clients.active, true));
            }
            return this.db
                .select()
                .from(database_1.clients)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy(database_1.clients.name);
        }
        /**
         * Cria um novo cliente
         */
        async create(data) {
            const result = await this.db
                .insert(database_1.clients)
                .values(data)
                .returning();
            return result[0];
        }
        /**
         * Cria ou retorna cliente existente pelo telefone
         */
        async findOrCreate(phone, salonId, name) {
            let client = await this.findByPhone(phone, salonId);
            if (!client) {
                const newClient = {
                    phone,
                    salonId,
                    name,
                    aiActive: true,
                };
                client = await this.create(newClient);
            }
            return client;
        }
        /**
         * Atualiza dados do cliente
         */
        async update(id, data) {
            const result = await this.db
                .update(database_1.clients)
                .set({
                ...data,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.clients.id, id))
                .returning();
            return result[0] || null;
        }
        /**
         * Soft delete - desativa cliente
         */
        async delete(id) {
            return this.update(id, { active: false });
        }
        /**
         * Reativa cliente
         */
        async reactivate(id) {
            return this.update(id, { active: true });
        }
        /**
         * Atualiza o status da IA para um cliente
         */
        async setAiActive(id, active) {
            return this.update(id, { aiActive: active });
        }
        /**
         * Verifica se a IA está ativa para um cliente
         */
        async isAiActive(phone, salonId) {
            const client = await this.findByPhone(phone, salonId);
            return client?.aiActive ?? true;
        }
        /**
         * Atualiza a data da última visita e incrementa total de visitas
         */
        async updateLastVisit(id) {
            const today = new Date().toISOString().split('T')[0];
            const client = await this.findById(id);
            if (!client)
                return null;
            return this.update(id, {
                lastVisitDate: today,
                totalVisits: client.totalVisits + 1,
            });
        }
        /**
         * Retorna estatísticas dos clientes
         */
        async getStats(salonId) {
            const allClients = await this.db
                .select()
                .from(database_1.clients)
                .where((0, drizzle_orm_1.eq)(database_1.clients.salonId, salonId));
            const activeClients = allClients.filter(c => c.active);
            const churnRiskCount = activeClients.filter(c => c.churnRisk).length;
            const recurringClients = activeClients.filter(c => c.totalVisits > 1).length;
            // Clientes novos este mês
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const newThisMonth = activeClients.filter(c => {
                const createdAt = new Date(c.createdAt);
                return createdAt >= startOfMonth;
            }).length;
            return {
                totalClients: allClients.length,
                activeClients: activeClients.length,
                newThisMonth,
                recurringClients,
                churnRiskCount,
            };
        }
        /**
         * Retorna histórico de comandas do cliente
         */
        async getHistory(clientId) {
            // Buscar comandas do cliente
            const clientCommands = await this.db
                .select({
                id: database_1.commands.id,
                code: database_1.commands.code,
                cardNumber: database_1.commands.cardNumber,
                status: database_1.commands.status,
                totalNet: database_1.commands.totalNet,
                openedAt: database_1.commands.openedAt,
                closedAt: database_1.commands.cashierClosedAt,
            })
                .from(database_1.commands)
                .where((0, drizzle_orm_1.eq)(database_1.commands.clientId, clientId))
                .orderBy((0, drizzle_orm_1.desc)(database_1.commands.openedAt))
                .limit(20);
            // Calcular totais
            const closedCommands = clientCommands.filter(c => c.status === 'CLOSED');
            const totalSpent = closedCommands.reduce((acc, c) => {
                return acc + parseFloat(c.totalNet || '0');
            }, 0);
            const averageTicket = closedCommands.length > 0
                ? totalSpent / closedCommands.length
                : 0;
            return {
                commands: clientCommands,
                totalSpent,
                averageTicket,
                totalVisits: closedCommands.length,
            };
        }
    };
    return ClientsService = _classThis;
})();
exports.ClientsService = ClientsService;
//# sourceMappingURL=clients.service.js.map