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
exports.CommissionsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../database/schema");
let CommissionsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CommissionsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CommissionsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * Lista comissoes com filtros
         */
        async findAll(salonId, filters) {
            // Buscar comissoes
            let query = this.db
                .select()
                .from(schema_1.commissions)
                .where((0, drizzle_orm_1.eq)(schema_1.commissions.salonId, salonId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.commissions.createdAt));
            const allCommissions = await query;
            // Aplicar filtros em memoria (para simplificar)
            let filtered = allCommissions;
            if (filters?.professionalId) {
                filtered = filtered.filter(c => c.professionalId === filters.professionalId);
            }
            if (filters?.status) {
                filtered = filtered.filter(c => c.status === filters.status);
            }
            if (filters?.startDate) {
                const start = new Date(filters.startDate);
                start.setHours(0, 0, 0, 0);
                filtered = filtered.filter(c => new Date(c.createdAt) >= start);
            }
            if (filters?.endDate) {
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999);
                filtered = filtered.filter(c => new Date(c.createdAt) <= end);
            }
            // Buscar dados relacionados
            const professionalIds = [...new Set(filtered.map(c => c.professionalId))];
            const commandIds = [...new Set(filtered.map(c => c.commandId))];
            const paidByIds = [...new Set(filtered.filter(c => c.paidById).map(c => c.paidById))];
            // Buscar profissionais
            const professionals = professionalIds.length > 0
                ? await this.db.select().from(schema_1.users).where((0, drizzle_orm_1.sql) `${schema_1.users.id} IN (${drizzle_orm_1.sql.join(professionalIds.map(id => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})`)
                : [];
            // Buscar comandas
            const commandsList = commandIds.length > 0
                ? await this.db.select().from(schema_1.commands).where((0, drizzle_orm_1.sql) `${schema_1.commands.id} IN (${drizzle_orm_1.sql.join(commandIds.map(id => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})`)
                : [];
            // Buscar quem pagou
            const paidByUsers = paidByIds.length > 0
                ? await this.db.select().from(schema_1.users).where((0, drizzle_orm_1.sql) `${schema_1.users.id} IN (${drizzle_orm_1.sql.join(paidByIds.map(id => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})`)
                : [];
            // Mapear dados
            const professionalMap = new Map(professionals.map(p => [p.id, p.name]));
            const commandMap = new Map(commandsList.map(c => [c.id, { code: c.code, cardNumber: c.cardNumber }]));
            const paidByMap = new Map(paidByUsers.map(u => [u.id, u.name]));
            return filtered.map(c => ({
                ...c,
                professionalName: professionalMap.get(c.professionalId) || 'Desconhecido',
                commandCode: commandMap.get(c.commandId)?.code || '',
                commandCardNumber: commandMap.get(c.commandId)?.cardNumber || '',
                paidByName: c.paidById ? paidByMap.get(c.paidById) || '' : undefined,
            }));
        }
        /**
         * Busca uma comissao por ID
         */
        async findById(salonId, id) {
            const result = await this.db
                .select()
                .from(schema_1.commissions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commissions.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commissions.id, id)))
                .limit(1);
            if (result.length === 0) {
                throw new common_1.NotFoundException('Comissao nao encontrada');
            }
            const commission = result[0];
            // Buscar dados relacionados
            const [professional] = await this.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, commission.professionalId))
                .limit(1);
            const [command] = await this.db
                .select()
                .from(schema_1.commands)
                .where((0, drizzle_orm_1.eq)(schema_1.commands.id, commission.commandId))
                .limit(1);
            let paidByName;
            if (commission.paidById) {
                const [paidBy] = await this.db
                    .select()
                    .from(schema_1.users)
                    .where((0, drizzle_orm_1.eq)(schema_1.users.id, commission.paidById))
                    .limit(1);
                paidByName = paidBy?.name;
            }
            return {
                ...commission,
                professionalName: professional?.name || 'Desconhecido',
                commandCode: command?.code || '',
                commandCardNumber: command?.cardNumber || '',
                paidByName,
            };
        }
        /**
         * Retorna resumo geral das comissoes
         */
        async getSummary(salonId) {
            const allCommissions = await this.db
                .select()
                .from(schema_1.commissions)
                .where((0, drizzle_orm_1.eq)(schema_1.commissions.salonId, salonId));
            // Total pendente
            const totalPending = allCommissions
                .filter(c => c.status === 'PENDING')
                .reduce((sum, c) => sum + parseFloat(c.commissionValue), 0);
            // Total pago este mes
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const totalPaidThisMonth = allCommissions
                .filter(c => c.status === 'PAID' && c.paidAt && new Date(c.paidAt) >= firstDayOfMonth)
                .reduce((sum, c) => sum + parseFloat(c.commissionValue), 0);
            // Profissionais com pendencia
            const professionalsWithPending = new Set(allCommissions.filter(c => c.status === 'PENDING').map(c => c.professionalId)).size;
            return {
                totalPending,
                totalPaidThisMonth,
                professionalsWithPending,
            };
        }
        /**
         * Retorna resumo por profissional
         */
        async getSummaryByProfessional(salonId) {
            const allCommissions = await this.db
                .select()
                .from(schema_1.commissions)
                .where((0, drizzle_orm_1.eq)(schema_1.commissions.salonId, salonId));
            // Agrupar por profissional
            const byProfessional = new Map();
            allCommissions.forEach(c => {
                const current = byProfessional.get(c.professionalId) || {
                    pending: 0,
                    paid: 0,
                    pendingCount: 0,
                    paidCount: 0,
                };
                if (c.status === 'PENDING') {
                    current.pending += parseFloat(c.commissionValue);
                    current.pendingCount++;
                }
                else if (c.status === 'PAID') {
                    current.paid += parseFloat(c.commissionValue);
                    current.paidCount++;
                }
                byProfessional.set(c.professionalId, current);
            });
            // Buscar nomes dos profissionais
            const professionalIds = [...byProfessional.keys()];
            const professionals = professionalIds.length > 0
                ? await this.db.select().from(schema_1.users).where((0, drizzle_orm_1.sql) `${schema_1.users.id} IN (${drizzle_orm_1.sql.join(professionalIds.map(id => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})`)
                : [];
            const professionalMap = new Map(professionals.map(p => [p.id, p.name]));
            return professionalIds.map(id => {
                const data = byProfessional.get(id);
                return {
                    professionalId: id,
                    professionalName: professionalMap.get(id) || 'Desconhecido',
                    totalPending: data.pending,
                    totalPaid: data.paid,
                    pendingCount: data.pendingCount,
                    paidCount: data.paidCount,
                };
            }).sort((a, b) => b.totalPending - a.totalPending);
        }
        /**
         * Paga comissoes selecionadas
         */
        async payCommissions(salonId, commissionIds, paidById) {
            if (commissionIds.length === 0) {
                throw new common_1.BadRequestException('Nenhuma comissao selecionada');
            }
            // Verificar se todas as comissoes existem e estao pendentes
            const toUpdate = await this.db
                .select()
                .from(schema_1.commissions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commissions.salonId, salonId), (0, drizzle_orm_1.sql) `${schema_1.commissions.id} IN (${drizzle_orm_1.sql.join(commissionIds.map(id => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})`));
            const pending = toUpdate.filter(c => c.status === 'PENDING');
            if (pending.length === 0) {
                throw new common_1.BadRequestException('Nenhuma comissao pendente encontrada');
            }
            // Atualizar status para PAID
            const now = new Date();
            for (const commission of pending) {
                await this.db
                    .update(schema_1.commissions)
                    .set({
                    status: 'PAID',
                    paidAt: now,
                    paidById,
                    updatedAt: now,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.commissions.id, commission.id));
            }
            const total = pending.reduce((sum, c) => sum + parseFloat(c.commissionValue), 0);
            return {
                paid: pending.length,
                total,
            };
        }
        /**
         * Paga todas as comissoes pendentes de um profissional
         */
        async payProfessionalCommissions(salonId, professionalId, paidById, startDate, endDate) {
            // Buscar comissoes pendentes do profissional
            let allCommissions = await this.db
                .select()
                .from(schema_1.commissions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commissions.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commissions.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema_1.commissions.status, 'PENDING')));
            // Filtrar por data se fornecido
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                allCommissions = allCommissions.filter(c => new Date(c.createdAt) >= start);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                allCommissions = allCommissions.filter(c => new Date(c.createdAt) <= end);
            }
            if (allCommissions.length === 0) {
                throw new common_1.BadRequestException('Nenhuma comissao pendente encontrada para este profissional');
            }
            // Atualizar todas para PAID
            const now = new Date();
            for (const commission of allCommissions) {
                await this.db
                    .update(schema_1.commissions)
                    .set({
                    status: 'PAID',
                    paidAt: now,
                    paidById,
                    updatedAt: now,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.commissions.id, commission.id));
            }
            const total = allCommissions.reduce((sum, c) => sum + parseFloat(c.commissionValue), 0);
            return {
                paid: allCommissions.length,
                total,
            };
        }
        /**
         * Cria comissao para um item de comanda
         * Chamado pelo CommandsService ao fechar o caixa
         */
        async createFromCommandItem(salonId, commandId, commandItemId, professionalId, itemDescription, itemValue, commissionPercentage) {
            const commissionValue = (itemValue * commissionPercentage) / 100;
            const newCommission = {
                salonId,
                commandId,
                commandItemId,
                professionalId,
                itemDescription,
                itemValue: itemValue.toFixed(2),
                commissionPercentage: commissionPercentage.toFixed(2),
                commissionValue: commissionValue.toFixed(2),
                status: 'PENDING',
            };
            await this.db.insert(schema_1.commissions).values(newCommission);
        }
        /**
         * Cancela comissoes de uma comanda (usado quando comanda e cancelada)
         */
        async cancelByCommand(commandId) {
            await this.db
                .update(schema_1.commissions)
                .set({
                status: 'CANCELLED',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commissions.commandId, commandId), (0, drizzle_orm_1.eq)(schema_1.commissions.status, 'PENDING')));
        }
    };
    return CommissionsService = _classThis;
})();
exports.CommissionsService = CommissionsService;
//# sourceMappingURL=commissions.service.js.map