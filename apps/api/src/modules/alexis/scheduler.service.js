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
exports.AlexisSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
let AlexisSchedulerService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AlexisSchedulerService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AlexisSchedulerService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        schedulesService;
        logger = new common_1.Logger(AlexisSchedulerService.name);
        constructor(schedulesService) {
            this.schedulesService = schedulesService;
        }
        /**
         * Busca horários disponíveis para um serviço
         */
        async getAvailableSlots(salonId, serviceId, date, professionalId) {
            try {
                // Busca serviço para saber duração
                const [service] = await connection_1.db.select().from(schema_1.services).where((0, drizzle_orm_1.eq)(schema_1.services.id, serviceId)).limit(1);
                if (!service) {
                    this.logger.warn(`Serviço ${serviceId} não encontrado`);
                    return [];
                }
                // Busca profissionais ativos do salão
                const allProfessionals = await connection_1.db
                    .select()
                    .from(schema_1.users)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.users.role, 'STYLIST'), (0, drizzle_orm_1.eq)(schema_1.users.active, true)));
                // Filtra por professional_services (se houver assignments para o serviço)
                const enabledIds = await connection_1.db
                    .select({ professionalId: schema_1.professionalServices.professionalId })
                    .from(schema_1.professionalServices)
                    .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.professionalServices.professionalId, schema_1.users.id))
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.professionalServices.serviceId, serviceId), (0, drizzle_orm_1.eq)(schema_1.professionalServices.enabled, true), (0, drizzle_orm_1.eq)(schema_1.users.salonId, salonId)));
                let filteredProfessionals = allProfessionals;
                if (enabledIds.length > 0) {
                    const aptSet = new Set(enabledIds.map((r) => r.professionalId));
                    filteredProfessionals = allProfessionals.filter((p) => aptSet.has(p.id));
                }
                const targetProfessionals = professionalId
                    ? filteredProfessionals.filter((p) => p.id === professionalId)
                    : filteredProfessionals;
                if (targetProfessionals.length === 0) {
                    return [];
                }
                // Formato de data YYYY-MM-DD
                const dateStr = date.toISOString().split('T')[0];
                // Busca agendamentos do dia
                const existingAppointments = await connection_1.db
                    .select()
                    .from(schema_1.appointments)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointments.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.appointments.date, dateStr), (0, drizzle_orm_1.eq)(schema_1.appointments.status, 'SCHEDULED')));
                // Calcula slots disponíveis (8h às 20h, intervalos de 30min)
                const slots = [];
                const serviceDuration = service.durationMinutes;
                for (const professional of targetProfessionals) {
                    for (let hour = 8; hour < 20; hour++) {
                        for (const minute of [0, 30]) {
                            const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                            const slotDate = new Date(date);
                            slotDate.setHours(hour, minute, 0, 0);
                            // Verifica se já passou (para o dia atual)
                            if (slotDate < new Date()) {
                                continue;
                            }
                            // Calcula o fim do slot baseado na duração do serviço
                            const slotEndMinutes = hour * 60 + minute + serviceDuration;
                            // Verifica se tem conflito com outro agendamento
                            const hasConflict = existingAppointments.some((apt) => {
                                if (apt.professionalId !== professional.id)
                                    return false;
                                // Converte horário do agendamento existente para minutos
                                const [aptHour, aptMin] = (apt.time || '00:00').split(':').map(Number);
                                const aptStartMinutes = aptHour * 60 + aptMin;
                                const aptEndMinutes = aptStartMinutes + apt.duration;
                                // Verifica sobreposição
                                const slotStartMinutes = hour * 60 + minute;
                                return ((slotStartMinutes >= aptStartMinutes && slotStartMinutes < aptEndMinutes) ||
                                    (slotEndMinutes > aptStartMinutes && slotEndMinutes <= aptEndMinutes) ||
                                    (slotStartMinutes <= aptStartMinutes && slotEndMinutes >= aptEndMinutes));
                            });
                            if (!hasConflict) {
                                slots.push({
                                    time: slotTime,
                                    professionalId: professional.id,
                                    professionalName: professional.name || 'Profissional',
                                });
                            }
                        }
                    }
                }
                return slots;
            }
            catch (error) {
                this.logger.error('Erro ao buscar horários disponíveis:', error?.message || error);
                return [];
            }
        }
        /**
         * Cria um novo agendamento
         */
        async createAppointment(data) {
            try {
                // Busca ou cria cliente
                let [client] = await connection_1.db
                    .select()
                    .from(schema_1.clients)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.clients.salonId, data.salonId), (0, drizzle_orm_1.eq)(schema_1.clients.phone, data.clientPhone)))
                    .limit(1);
                if (!client) {
                    const [newClient] = await connection_1.db
                        .insert(schema_1.clients)
                        .values({
                        salonId: data.salonId,
                        name: data.clientName || 'Cliente WhatsApp',
                        phone: data.clientPhone,
                    })
                        .returning();
                    client = newClient;
                }
                // Busca serviço
                const [service] = await connection_1.db
                    .select()
                    .from(schema_1.services)
                    .where((0, drizzle_orm_1.eq)(schema_1.services.id, data.serviceId))
                    .limit(1);
                if (!service) {
                    return { success: false, error: 'Serviço não encontrado' };
                }
                // Formata data como YYYY-MM-DD
                const dateStr = data.date.toISOString().split('T')[0];
                // Verifica disponibilidade usando SchedulesService (validação completa)
                const availability = await this.schedulesService.checkAvailability(data.salonId, data.professionalId, dateStr, data.time, service.durationMinutes);
                if (!availability.available) {
                    // Retorna mensagem amigável baseada no motivo
                    const friendlyMessage = this.formatAvailabilityError(availability);
                    return { success: false, error: friendlyMessage };
                }
                // Calcula o horário de fim
                const [hour, minute] = data.time.split(':').map(Number);
                const endMinutes = hour * 60 + minute + service.durationMinutes;
                const endHour = Math.floor(endMinutes / 60);
                const endMin = endMinutes % 60;
                const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
                // Cria o agendamento
                const [appointment] = await connection_1.db
                    .insert(schema_1.appointments)
                    .values({
                    salonId: data.salonId,
                    clientId: client.id,
                    serviceId: data.serviceId,
                    professionalId: data.professionalId,
                    date: dateStr,
                    time: data.time,
                    startTime: data.time,
                    endTime: endTime,
                    duration: service.durationMinutes,
                    service: service.name,
                    status: 'SCHEDULED',
                })
                    .returning();
                this.logger.log(`Agendamento criado via WhatsApp: ${appointment.id}`);
                return { success: true, appointment };
            }
            catch (error) {
                this.logger.error('Erro ao criar agendamento:', error?.message || error);
                return { success: false, error: 'Erro ao criar agendamento' };
            }
        }
        /**
         * Formata a lista de horários disponíveis para exibição
         */
        formatAvailableSlots(slots, limit = 6) {
            if (slots.length === 0) {
                return 'Não há horários disponíveis para esta data.';
            }
            const limitedSlots = slots.slice(0, limit);
            return limitedSlots.map((s) => `• ${s.time} - ${s.professionalName}`).join('\n');
        }
        /**
         * Formata erro de disponibilidade em mensagem amigável para WhatsApp
         */
        formatAvailabilityError(availability) {
            const suggestions = availability.suggestedSlots?.length
                ? `\n\nHorários sugeridos: ${availability.suggestedSlots.join(', ')}`
                : '';
            switch (availability.reason) {
                case 'SALON_CLOSED':
                    return `${availability.message}${suggestions}`;
                case 'EXCEEDS_CLOSING_TIME':
                    return `Esse horário não dá porque o serviço terminaria às ${availability.details?.serviceEndTime}, ` +
                        `mas o salão fecha às ${availability.details?.salonCloseTime?.substring(0, 5)}.${suggestions}`;
                case 'PROFESSIONAL_NOT_WORKING':
                    return `${availability.message}${suggestions}`;
                case 'EXCEEDS_WORK_HOURS':
                    return `Esse horário passa do expediente do profissional. ` +
                        `O serviço terminaria às ${availability.details?.serviceEndTime}, ` +
                        `mas ele encerra às ${availability.details?.professionalEndTime?.substring(0, 5)}.${suggestions}`;
                case 'PROFESSIONAL_BLOCKED':
                    return `O profissional tem um compromisso nesse horário.${suggestions}`;
                case 'SLOT_OCCUPIED':
                    return `Já existe um agendamento nesse horário.${suggestions}`;
                default:
                    return availability.message || 'Horário não disponível. Tente outro horário.';
            }
        }
    };
    return AlexisSchedulerService = _classThis;
})();
exports.AlexisSchedulerService = AlexisSchedulerService;
//# sourceMappingURL=scheduler.service.js.map