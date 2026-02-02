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
exports.DataCollectorService = void 0;
const common_1 = require("@nestjs/common");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
let DataCollectorService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DataCollectorService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DataCollectorService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = new common_1.Logger(DataCollectorService.name);
        /**
         * Coleta contexto do salão para resposta do WhatsApp
         */
        async collectContext(salonId, clientPhone) {
            try {
                // Dados do salão
                const [salon] = await connection_1.db.select().from(schema_1.salons).where((0, drizzle_orm_1.eq)(schema_1.salons.id, salonId)).limit(1);
                // Serviços ativos
                const activeServices = await connection_1.db
                    .select()
                    .from(schema_1.services)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.services.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.services.active, true)));
                // Produtos ativos com estoque
                const activeProducts = await connection_1.db
                    .select()
                    .from(schema_1.products)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.products.active, true)));
                // Profissionais ativos
                const professionals = await connection_1.db
                    .select({ id: schema_1.users.id, name: schema_1.users.name })
                    .from(schema_1.users)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.users.role, 'STYLIST'), (0, drizzle_orm_1.eq)(schema_1.users.active, true)));
                // Cliente (se existir)
                let clientData = null;
                if (clientPhone) {
                    const [client] = await connection_1.db
                        .select()
                        .from(schema_1.clients)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.clients.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.clients.phone, clientPhone)))
                        .limit(1);
                    if (client) {
                        // Última visita
                        const [lastAppointment] = await connection_1.db
                            .select()
                            .from(schema_1.appointments)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointments.clientId, client.id), (0, drizzle_orm_1.eq)(schema_1.appointments.status, 'COMPLETED')))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.appointments.date))
                            .limit(1);
                        clientData = {
                            name: client.name,
                            isReturning: true,
                            lastVisit: lastAppointment?.date || null,
                        };
                    }
                }
                return {
                    salon: {
                        name: salon?.name || null,
                        phone: salon?.phone || null,
                        address: salon?.address || null,
                        workingHours: '08:00 às 20:00, Segunda a Sábado',
                    },
                    services: activeServices.map((s) => ({
                        id: s.id,
                        name: s.name,
                        description: s.description,
                        price: s.basePrice,
                        duration: s.durationMinutes,
                        category: s.category,
                    })),
                    products: activeProducts.map((p) => ({
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        price: p.salePrice,
                        category: p.category || 'OUTROS',
                        inStock: (p.stockRetail + p.stockInternal) > 0,
                    })),
                    professionals: professionals.map((p) => ({
                        id: p.id,
                        name: p.name || 'Profissional',
                    })),
                    client: clientData,
                };
            }
            catch (error) {
                this.logger.error('Erro ao coletar contexto:', error?.message || error);
                return {
                    salon: { name: null, phone: null, address: null, workingHours: '' },
                    services: [],
                    products: [],
                    professionals: [],
                    client: null,
                };
            }
        }
        /**
         * Coleta dados para briefing do dashboard
         */
        async collectDashboardData(salonId, userId, userRole) {
            try {
                // Formato de data usado nas queries (YYYY-MM-DD)
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                if (userRole === 'OWNER' || userRole === 'MANAGER') {
                    // Faturamento do dia (comandas fechadas hoje)
                    const [revenueResult] = await connection_1.db
                        .select({
                        total: (0, drizzle_orm_1.sql) `COALESCE(SUM(CAST(${schema_1.commands.totalNet} AS NUMERIC)), 0)`,
                    })
                        .from(schema_1.commands)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.sql) `DATE(${schema_1.commands.cashierClosedAt}) = ${todayStr}`));
                    // Agendamentos do dia
                    const todayAppointments = await connection_1.db
                        .select()
                        .from(schema_1.appointments)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointments.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.appointments.date, todayStr)));
                    // Produtos com estoque baixo (verificar ambos os estoques)
                    const allProducts = await connection_1.db
                        .select()
                        .from(schema_1.products)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.products.active, true)));
                    const lowStock = allProducts.filter(p => {
                        const retailLow = p.isRetail && p.stockRetail <= p.minStockRetail;
                        const internalLow = p.isBackbar && p.stockInternal <= p.minStockInternal;
                        return retailLow || internalLow;
                    });
                    return {
                        todayRevenue: Number(revenueResult?.total || 0),
                        todayAppointments: todayAppointments.length,
                        unconfirmedAppointments: todayAppointments.filter((a) => a.status === 'SCHEDULED').length,
                        lowStockProducts: lowStock.map((p) => ({
                            name: p.name,
                            stock: p.stockRetail + p.stockInternal,
                        })),
                    };
                }
                if (userRole === 'RECEPTIONIST') {
                    const todayAppointments = await connection_1.db
                        .select({
                        time: schema_1.appointments.time,
                        status: schema_1.appointments.status,
                        clientId: schema_1.appointments.clientId,
                        serviceId: schema_1.appointments.serviceId,
                        professionalId: schema_1.appointments.professionalId,
                    })
                        .from(schema_1.appointments)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointments.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.appointments.date, todayStr)))
                        .orderBy(schema_1.appointments.time);
                    return {
                        todayAppointments: todayAppointments.length,
                        unconfirmedAppointments: todayAppointments.filter((a) => a.status === 'SCHEDULED').length,
                    };
                }
                // STYLIST (Profissional)
                const myAppointments = await connection_1.db
                    .select({
                    time: schema_1.appointments.time,
                    clientId: schema_1.appointments.clientId,
                    serviceId: schema_1.appointments.serviceId,
                })
                    .from(schema_1.appointments)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointments.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.appointments.professionalId, userId), (0, drizzle_orm_1.eq)(schema_1.appointments.date, todayStr)))
                    .orderBy(schema_1.appointments.time);
                // Buscar nomes dos clientes e serviços
                const appointmentsWithDetails = await Promise.all(myAppointments.map(async (apt) => {
                    const [client] = apt.clientId
                        ? await connection_1.db.select().from(schema_1.clients).where((0, drizzle_orm_1.eq)(schema_1.clients.id, apt.clientId)).limit(1)
                        : [null];
                    const [service] = apt.serviceId
                        ? await connection_1.db.select().from(schema_1.services).where((0, drizzle_orm_1.eq)(schema_1.services.id, apt.serviceId)).limit(1)
                        : [null];
                    return {
                        time: apt.time,
                        client: client?.name || null,
                        service: service?.name || null,
                    };
                }));
                return {
                    myAppointmentsToday: appointmentsWithDetails,
                    nextClient: appointmentsWithDetails[0] || null,
                };
            }
            catch (error) {
                this.logger.error('Erro ao coletar dados do dashboard:', error?.message || error);
                return {};
            }
        }
    };
    return DataCollectorService = _classThis;
})();
exports.DataCollectorService = DataCollectorService;
//# sourceMappingURL=data-collector.service.js.map