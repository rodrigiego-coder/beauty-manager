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
exports.AppointmentHoldsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../../database/schema"));
let AppointmentHoldsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AppointmentHoldsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AppointmentHoldsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        settingsService;
        logger = new common_1.Logger(AppointmentHoldsService.name);
        constructor(db, settingsService) {
            this.db = db;
            this.settingsService = settingsService;
        }
        /**
         * Cria um hold (reserva temporária) para um horário
         */
        async createHold(salonId, dto, clientIp) {
            const { professionalId, serviceId, date, startTime, endTime, clientPhone, clientName, sessionId } = dto;
            // Busca configurações do salão
            const settings = await this.settingsService.getSettings(salonId);
            if (!settings.enabled) {
                throw new common_1.BadRequestException('Agendamento online não está habilitado para este salão');
            }
            // Verifica se o serviço existe e permite booking online
            const [service] = await this.db
                .select()
                .from(schema.services)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.services.id, serviceId), (0, drizzle_orm_1.eq)(schema.services.salonId, salonId), (0, drizzle_orm_1.eq)(schema.services.active, true), (0, drizzle_orm_1.eq)(schema.services.allowOnlineBooking, true)))
                .limit(1);
            if (!service) {
                throw new common_1.NotFoundException('Serviço não encontrado ou não disponível para agendamento online');
            }
            // Verifica se o profissional existe
            const [professional] = await this.db
                .select()
                .from(schema.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.id, professionalId), (0, drizzle_orm_1.eq)(schema.users.salonId, salonId), (0, drizzle_orm_1.eq)(schema.users.active, true)))
                .limit(1);
            if (!professional) {
                throw new common_1.NotFoundException('Profissional não encontrado');
            }
            // Verifica conflitos com holds ativos
            const conflictingHold = await this.checkHoldConflict(salonId, professionalId, date, startTime, endTime);
            if (conflictingHold) {
                throw new common_1.ConflictException('Este horário já está reservado temporariamente');
            }
            // Verifica conflitos com agendamentos existentes
            const conflictingAppointment = await this.checkAppointmentConflict(salonId, professionalId, date, startTime, endTime);
            if (conflictingAppointment) {
                throw new common_1.ConflictException('Este horário já possui um agendamento');
            }
            // Busca cliente existente pelo telefone
            const [existingClient] = await this.db
                .select()
                .from(schema.clients)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clients.salonId, salonId), (0, drizzle_orm_1.eq)(schema.clients.phone, clientPhone)))
                .limit(1);
            // Calcula expiração
            const expiresAt = new Date(Date.now() + settings.holdDurationMinutes * 60 * 1000);
            // Cria o hold
            const [hold] = await this.db
                .insert(schema.appointmentHolds)
                .values({
                salonId,
                professionalId,
                serviceId,
                date,
                startTime,
                endTime,
                clientPhone,
                clientName,
                clientId: existingClient?.id,
                status: 'ACTIVE',
                expiresAt,
                sessionId,
                clientIp,
            })
                .returning();
            this.logger.log(`Hold criado: ${hold.id} para ${date} ${startTime}-${endTime}`);
            return {
                id: hold.id,
                date: hold.date,
                startTime: hold.startTime,
                endTime: hold.endTime,
                professionalName: professional.name,
                serviceName: service.name,
                expiresAt: hold.expiresAt,
                expiresInSeconds: Math.ceil((hold.expiresAt.getTime() - Date.now()) / 1000),
            };
        }
        /**
         * Obtém um hold pelo ID
         */
        async getHold(salonId, holdId) {
            const [hold] = await this.db
                .select()
                .from(schema.appointmentHolds)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.appointmentHolds.id, holdId), (0, drizzle_orm_1.eq)(schema.appointmentHolds.salonId, salonId)))
                .limit(1);
            return hold || null;
        }
        /**
         * Obtém hold ativo pelo ID
         */
        async getActiveHold(salonId, holdId) {
            const hold = await this.getHold(salonId, holdId);
            if (!hold) {
                throw new common_1.NotFoundException('Reserva não encontrada');
            }
            if (hold.status !== 'ACTIVE') {
                throw new common_1.BadRequestException('Esta reserva não está mais ativa');
            }
            if (hold.expiresAt < new Date()) {
                // Marca como expirado
                await this.expireHold(hold.id);
                throw new common_1.BadRequestException('Esta reserva expirou');
            }
            return hold;
        }
        /**
         * Converte um hold em agendamento
         */
        async convertToAppointment(salonId, holdId, appointmentId) {
            await this.db
                .update(schema.appointmentHolds)
                .set({
                status: 'CONVERTED',
                appointmentId,
                convertedAt: new Date(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.appointmentHolds.id, holdId), (0, drizzle_orm_1.eq)(schema.appointmentHolds.salonId, salonId)));
            this.logger.log(`Hold ${holdId} convertido em agendamento ${appointmentId}`);
        }
        /**
         * Libera um hold manualmente
         */
        async releaseHold(salonId, holdId) {
            await this.db
                .update(schema.appointmentHolds)
                .set({
                status: 'RELEASED',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.appointmentHolds.id, holdId), (0, drizzle_orm_1.eq)(schema.appointmentHolds.salonId, salonId), (0, drizzle_orm_1.eq)(schema.appointmentHolds.status, 'ACTIVE')));
            this.logger.log(`Hold ${holdId} liberado`);
        }
        /**
         * Marca um hold como expirado
         */
        async expireHold(holdId) {
            await this.db
                .update(schema.appointmentHolds)
                .set({
                status: 'EXPIRED',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.appointmentHolds.id, holdId));
        }
        /**
         * Verifica conflito com holds ativos
         */
        async checkHoldConflict(salonId, professionalId, date, startTime, endTime, excludeHoldId) {
            const conditions = [
                (0, drizzle_orm_1.eq)(schema.appointmentHolds.salonId, salonId),
                (0, drizzle_orm_1.eq)(schema.appointmentHolds.professionalId, professionalId),
                (0, drizzle_orm_1.eq)(schema.appointmentHolds.date, date),
                (0, drizzle_orm_1.eq)(schema.appointmentHolds.status, 'ACTIVE'),
                (0, drizzle_orm_1.gt)(schema.appointmentHolds.expiresAt, new Date()),
            ];
            if (excludeHoldId) {
                conditions.push((0, drizzle_orm_1.ne)(schema.appointmentHolds.id, excludeHoldId));
            }
            const holds = await this.db
                .select()
                .from(schema.appointmentHolds)
                .where((0, drizzle_orm_1.and)(...conditions));
            // Verifica sobreposição de horários
            for (const hold of holds) {
                if (this.timesOverlap(startTime, endTime, hold.startTime, hold.endTime)) {
                    return true;
                }
            }
            return false;
        }
        /**
         * Verifica conflito com agendamentos existentes
         */
        async checkAppointmentConflict(salonId, professionalId, date, startTime, endTime, excludeAppointmentId) {
            const conditions = [
                (0, drizzle_orm_1.eq)(schema.appointments.salonId, salonId),
                (0, drizzle_orm_1.eq)(schema.appointments.professionalId, professionalId),
                (0, drizzle_orm_1.eq)(schema.appointments.date, date),
                (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema.appointments.status, 'SCHEDULED'), (0, drizzle_orm_1.eq)(schema.appointments.status, 'CONFIRMED'), (0, drizzle_orm_1.eq)(schema.appointments.status, 'PENDING_CONFIRMATION')),
            ];
            if (excludeAppointmentId) {
                conditions.push((0, drizzle_orm_1.ne)(schema.appointments.id, excludeAppointmentId));
            }
            const appointments = await this.db
                .select()
                .from(schema.appointments)
                .where((0, drizzle_orm_1.and)(...conditions));
            // Verifica sobreposição de horários
            for (const apt of appointments) {
                const aptStart = apt.startTime || apt.time;
                const aptEnd = apt.endTime || this.addMinutes(apt.time, apt.duration);
                if (this.timesOverlap(startTime, endTime, aptStart, aptEnd)) {
                    return true;
                }
            }
            return false;
        }
        /**
         * Limpa holds expirados (job de limpeza)
         */
        async cleanupExpiredHolds() {
            await this.db
                .update(schema.appointmentHolds)
                .set({
                status: 'EXPIRED',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.appointmentHolds.status, 'ACTIVE'), (0, drizzle_orm_1.lt)(schema.appointmentHolds.expiresAt, new Date())));
            this.logger.log(`Holds expirados atualizados`);
            return 0;
        }
        /**
         * Obtém holds ativos por sessão
         */
        async getHoldsBySession(salonId, sessionId) {
            return this.db
                .select()
                .from(schema.appointmentHolds)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.appointmentHolds.salonId, salonId), (0, drizzle_orm_1.eq)(schema.appointmentHolds.sessionId, sessionId), (0, drizzle_orm_1.eq)(schema.appointmentHolds.status, 'ACTIVE'), (0, drizzle_orm_1.gt)(schema.appointmentHolds.expiresAt, new Date())));
        }
        /**
         * Estende o tempo de um hold
         */
        async extendHold(salonId, holdId, extraMinutes = 5) {
            const hold = await this.getActiveHold(salonId, holdId);
            const settings = await this.settingsService.getSettings(salonId);
            // Não permite estender além do máximo
            const maxExtension = settings.holdDurationMinutes * 1.5;
            const currentDuration = (hold.expiresAt.getTime() - new Date(hold.createdAt).getTime()) / 60000;
            if (currentDuration + extraMinutes > maxExtension) {
                throw new common_1.BadRequestException('Tempo máximo de reserva atingido');
            }
            const newExpiresAt = new Date(hold.expiresAt.getTime() + extraMinutes * 60 * 1000);
            await this.db
                .update(schema.appointmentHolds)
                .set({
                expiresAt: newExpiresAt,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.appointmentHolds.id, holdId));
            // Busca dados adicionais
            const [professional] = await this.db
                .select()
                .from(schema.users)
                .where((0, drizzle_orm_1.eq)(schema.users.id, hold.professionalId))
                .limit(1);
            const [service] = await this.db
                .select()
                .from(schema.services)
                .where((0, drizzle_orm_1.eq)(schema.services.id, hold.serviceId))
                .limit(1);
            return {
                id: hold.id,
                date: hold.date,
                startTime: hold.startTime,
                endTime: hold.endTime,
                professionalName: professional?.name || 'Profissional',
                serviceName: service?.name || 'Serviço',
                expiresAt: newExpiresAt,
                expiresInSeconds: Math.ceil((newExpiresAt.getTime() - Date.now()) / 1000),
            };
        }
        /**
         * Verifica se dois períodos de tempo se sobrepõem
         */
        timesOverlap(start1, end1, start2, end2) {
            const toMinutes = (time) => {
                const [h, m] = time.split(':').map(Number);
                return h * 60 + m;
            };
            const s1 = toMinutes(start1);
            const e1 = toMinutes(end1);
            const s2 = toMinutes(start2);
            const e2 = toMinutes(end2);
            return s1 < e2 && s2 < e1;
        }
        /**
         * Adiciona minutos a um horário
         */
        addMinutes(time, minutes) {
            const [h, m] = time.split(':').map(Number);
            const totalMinutes = h * 60 + m + minutes;
            const newH = Math.floor(totalMinutes / 60) % 24;
            const newM = totalMinutes % 60;
            return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
        }
    };
    return AppointmentHoldsService = _classThis;
})();
exports.AppointmentHoldsService = AppointmentHoldsService;
//# sourceMappingURL=appointment-holds.service.js.map