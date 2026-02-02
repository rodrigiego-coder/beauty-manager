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
exports.SchedulesService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../../database/schema"));
const DAYS_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
let SchedulesService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SchedulesService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SchedulesService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        // ==================== SALON SCHEDULES ====================
        async getSalonSchedule(salonId) {
            const schedules = await this.db
                .select()
                .from(schema.salonSchedules)
                .where((0, drizzle_orm_1.eq)(schema.salonSchedules.salonId, salonId))
                .orderBy(schema.salonSchedules.dayOfWeek);
            // Se não existir, criar horários padrão
            if (schedules.length === 0) {
                await this.initializeSalonSchedule(salonId);
                return this.getSalonSchedule(salonId);
            }
            return schedules;
        }
        async initializeSalonSchedule(salonId) {
            const defaultSchedules = [];
            for (let day = 0; day <= 6; day++) {
                defaultSchedules.push({
                    salonId,
                    dayOfWeek: day,
                    isOpen: day !== 0, // Domingo fechado
                    openTime: day !== 0 ? '08:00' : null,
                    closeTime: day !== 0 ? '19:00' : null,
                });
            }
            await this.db.insert(schema.salonSchedules).values(defaultSchedules).onConflictDoNothing();
        }
        async updateSalonSchedule(salonId, dayOfWeek, data) {
            if (dayOfWeek < 0 || dayOfWeek > 6) {
                throw new common_1.BadRequestException('dayOfWeek deve ser entre 0 (domingo) e 6 (sábado)');
            }
            const [updated] = await this.db
                .update(schema.salonSchedules)
                .set({
                isOpen: data.isOpen,
                openTime: data.isOpen ? data.openTime : null,
                closeTime: data.isOpen ? data.closeTime : null,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.salonSchedules.salonId, salonId), (0, drizzle_orm_1.eq)(schema.salonSchedules.dayOfWeek, dayOfWeek)))
                .returning();
            if (!updated) {
                throw new common_1.NotFoundException(`Horário não encontrado para ${DAYS_PT[dayOfWeek]}`);
            }
            return updated;
        }
        // ==================== PROFESSIONAL SCHEDULES ====================
        async getProfessionalSchedule(professionalId) {
            return this.db
                .select()
                .from(schema.professionalSchedules)
                .where((0, drizzle_orm_1.eq)(schema.professionalSchedules.professionalId, professionalId))
                .orderBy(schema.professionalSchedules.dayOfWeek);
        }
        async initializeProfessionalSchedule(professionalId, salonId) {
            // Buscar horário do salão para usar como base
            const salonSchedule = await this.getSalonSchedule(salonId);
            const professionalSchedules = salonSchedule.map((s) => ({
                professionalId,
                salonId,
                dayOfWeek: s.dayOfWeek,
                isWorking: s.isOpen,
                startTime: s.openTime,
                endTime: s.closeTime,
            }));
            await this.db
                .insert(schema.professionalSchedules)
                .values(professionalSchedules)
                .onConflictDoNothing();
        }
        async updateProfessionalSchedule(professionalId, dayOfWeek, data) {
            if (dayOfWeek < 0 || dayOfWeek > 6) {
                throw new common_1.BadRequestException('dayOfWeek deve ser entre 0 (domingo) e 6 (sábado)');
            }
            const [updated] = await this.db
                .update(schema.professionalSchedules)
                .set({
                isWorking: data.isWorking,
                startTime: data.isWorking ? data.startTime : null,
                endTime: data.isWorking ? data.endTime : null,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.professionalSchedules.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema.professionalSchedules.dayOfWeek, dayOfWeek)))
                .returning();
            if (!updated) {
                throw new common_1.NotFoundException(`Horário não encontrado para ${DAYS_PT[dayOfWeek]}`);
            }
            return updated;
        }
        // ==================== PROFESSIONAL BLOCKS ====================
        async getProfessionalBlocks(professionalId, startDate, endDate) {
            let query = this.db
                .select()
                .from(schema.professionalBlocks)
                .where((0, drizzle_orm_1.eq)(schema.professionalBlocks.professionalId, professionalId));
            if (startDate && endDate) {
                query = this.db
                    .select()
                    .from(schema.professionalBlocks)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.professionalBlocks.professionalId, professionalId), (0, drizzle_orm_1.gte)(schema.professionalBlocks.startDate, startDate), (0, drizzle_orm_1.lte)(schema.professionalBlocks.endDate, endDate)));
            }
            return query;
        }
        async createProfessionalBlock(professionalId, salonId, createdById, data) {
            const [block] = await this.db
                .insert(schema.professionalBlocks)
                .values({
                professionalId,
                salonId,
                type: data.blockType === 'VACATION' ? 'VACATION' : 'PERSONAL',
                title: data.reason || 'Bloqueio',
                startDate: data.blockDate,
                endDate: data.blockDate,
                startTime: data.startTime,
                endTime: data.endTime,
                allDay: false,
                recurring: false,
                status: 'APPROVED',
                requiresApproval: false,
                createdById,
            })
                .returning();
            return block;
        }
        async deleteProfessionalBlock(blockId) {
            const result = await this.db
                .delete(schema.professionalBlocks)
                .where((0, drizzle_orm_1.eq)(schema.professionalBlocks.id, blockId))
                .returning();
            if (result.length === 0) {
                throw new common_1.NotFoundException('Bloqueio não encontrado');
            }
        }
        // ==================== AVAILABILITY CHECK ====================
        async checkAvailability(salonId, professionalId, date, startTime, durationMinutes) {
            const requestedDate = new Date(date);
            const dayOfWeek = requestedDate.getDay();
            // Calcular horário de término do serviço
            const [startHour, startMin] = startTime.split(':').map(Number);
            const endMinutes = startHour * 60 + startMin + durationMinutes;
            const endHour = Math.floor(endMinutes / 60);
            const endMin = endMinutes % 60;
            const serviceEndTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
            // 1. Verificar se o salão está aberto nesse dia
            const salonSchedule = await this.db
                .select()
                .from(schema.salonSchedules)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.salonSchedules.salonId, salonId), (0, drizzle_orm_1.eq)(schema.salonSchedules.dayOfWeek, dayOfWeek)))
                .limit(1);
            if (salonSchedule.length === 0 || !salonSchedule[0].isOpen) {
                const openDays = await this.getOpenDays(salonId);
                return {
                    available: false,
                    reason: 'SALON_CLOSED',
                    message: `O salão está fechado ${DAYS_PT[dayOfWeek].toLowerCase()}. Funcionamos ${openDays}.`,
                    details: { requestedTime: startTime },
                };
            }
            const salonCloseTime = salonSchedule[0].closeTime;
            const salonOpenTime = salonSchedule[0].openTime;
            // 2. Verificar se o horário está dentro do funcionamento do salão
            if (salonOpenTime && startTime < salonOpenTime) {
                return {
                    available: false,
                    reason: 'SALON_CLOSED',
                    message: `O salão só abre às ${salonOpenTime}. Tente um horário a partir das ${salonOpenTime}.`,
                    details: { requestedTime: startTime, salonCloseTime: salonCloseTime },
                };
            }
            // 3. Verificar se o serviço termina antes do salão fechar
            if (salonCloseTime && serviceEndTime > salonCloseTime) {
                const suggestedSlots = this.calculateSuggestedSlots(salonOpenTime, salonCloseTime, durationMinutes, startTime);
                return {
                    available: false,
                    reason: 'EXCEEDS_CLOSING_TIME',
                    message: `O serviço terminaria às ${serviceEndTime}, mas o salão fecha às ${salonCloseTime}.`,
                    suggestedSlots,
                    details: {
                        requestedTime: startTime,
                        serviceDuration: durationMinutes,
                        serviceEndTime,
                        salonCloseTime,
                    },
                };
            }
            // 4. Verificar se o profissional trabalha nesse dia
            const profSchedule = await this.db
                .select()
                .from(schema.professionalSchedules)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.professionalSchedules.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema.professionalSchedules.dayOfWeek, dayOfWeek)))
                .limit(1);
            if (profSchedule.length > 0 && !profSchedule[0].isWorking) {
                const workDays = await this.getProfessionalWorkDays(professionalId);
                return {
                    available: false,
                    reason: 'PROFESSIONAL_NOT_WORKING',
                    message: `O profissional não trabalha ${DAYS_PT[dayOfWeek].toLowerCase()}. Dias disponíveis: ${workDays}.`,
                    details: { requestedTime: startTime },
                };
            }
            // 5. Verificar se está dentro do horário de trabalho do profissional
            if (profSchedule.length > 0) {
                const profStartTime = profSchedule[0].startTime;
                const profEndTime = profSchedule[0].endTime;
                if (profStartTime && startTime < profStartTime) {
                    return {
                        available: false,
                        reason: 'PROFESSIONAL_NOT_WORKING',
                        message: `O profissional começa a trabalhar às ${profStartTime}.`,
                        details: { requestedTime: startTime, professionalEndTime: profEndTime },
                    };
                }
                if (profEndTime && serviceEndTime > profEndTime) {
                    const suggestedSlots = this.calculateSuggestedSlots(profStartTime, profEndTime, durationMinutes, startTime);
                    return {
                        available: false,
                        reason: 'EXCEEDS_WORK_HOURS',
                        message: `O serviço terminaria às ${serviceEndTime}, mas o profissional encerra às ${profEndTime}.`,
                        suggestedSlots,
                        details: {
                            requestedTime: startTime,
                            serviceDuration: durationMinutes,
                            serviceEndTime,
                            professionalEndTime: profEndTime,
                        },
                    };
                }
            }
            // 6. Verificar bloqueios do profissional
            const blocks = await this.db
                .select()
                .from(schema.professionalBlocks)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.professionalBlocks.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema.professionalBlocks.startDate, date), (0, drizzle_orm_1.eq)(schema.professionalBlocks.status, 'APPROVED')));
            for (const block of blocks) {
                // Verificar sobreposição de horários
                const blockStart = block.startTime || '00:00';
                const blockEnd = block.endTime || '23:59';
                if (this.timeOverlaps(startTime, serviceEndTime, blockStart, blockEnd)) {
                    return {
                        available: false,
                        reason: 'PROFESSIONAL_BLOCKED',
                        message: `O profissional tem um compromisso das ${blockStart} às ${blockEnd}${block.title ? ` (${block.title})` : ''}.`,
                        details: { requestedTime: startTime },
                    };
                }
            }
            // 7. Verificar conflito com outros agendamentos
            const existingAppointments = await this.db
                .select()
                .from(schema.appointments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.appointments.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema.appointments.date, date)));
            for (const appt of existingAppointments) {
                if (appt.status !== 'CANCELLED' &&
                    appt.status !== 'NO_SHOW' &&
                    appt.startTime &&
                    appt.endTime &&
                    this.timeOverlaps(startTime, serviceEndTime, appt.startTime, appt.endTime)) {
                    const suggestedSlots = await this.findAvailableSlots(salonId, professionalId, date, durationMinutes);
                    return {
                        available: false,
                        reason: 'SLOT_OCCUPIED',
                        message: `Já existe um agendamento das ${appt.startTime} às ${appt.endTime}.`,
                        suggestedSlots,
                        details: { requestedTime: startTime },
                    };
                }
            }
            return { available: true };
        }
        // ==================== HELPER METHODS ====================
        timeOverlaps(start1, end1, start2, end2) {
            return start1 < end2 && end1 > start2;
        }
        calculateSuggestedSlots(dayStart, dayEnd, durationMinutes, aroundTime) {
            const slots = [];
            const [startH, startM] = dayStart.split(':').map(Number);
            const [endH, endM] = dayEnd.split(':').map(Number);
            const [aroundH, aroundM] = aroundTime.split(':').map(Number);
            const dayStartMinutes = startH * 60 + startM;
            const dayEndMinutes = endH * 60 + endM;
            const aroundMinutes = aroundH * 60 + aroundM;
            // Procurar slots antes e depois do horário solicitado
            for (let m = aroundMinutes - 60; m <= aroundMinutes + 60; m += 30) {
                if (m >= dayStartMinutes && m + durationMinutes <= dayEndMinutes && m !== aroundMinutes) {
                    const h = Math.floor(m / 60);
                    const min = m % 60;
                    slots.push(`${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
                }
            }
            return slots.slice(0, 4);
        }
        async getOpenDays(salonId) {
            const schedules = await this.db
                .select()
                .from(schema.salonSchedules)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.salonSchedules.salonId, salonId), (0, drizzle_orm_1.eq)(schema.salonSchedules.isOpen, true)));
            const days = schedules.map((s) => DAYS_PT[s.dayOfWeek].toLowerCase());
            return days.join(', ');
        }
        async getProfessionalWorkDays(professionalId) {
            const schedules = await this.db
                .select()
                .from(schema.professionalSchedules)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.professionalSchedules.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema.professionalSchedules.isWorking, true)));
            const days = schedules.map((s) => DAYS_PT[s.dayOfWeek].toLowerCase());
            return days.join(', ');
        }
        async findAvailableSlots(salonId, professionalId, date, durationMinutes) {
            const requestedDate = new Date(date);
            const dayOfWeek = requestedDate.getDay();
            // Buscar horário do salão
            const salonSchedule = await this.db
                .select()
                .from(schema.salonSchedules)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.salonSchedules.salonId, salonId), (0, drizzle_orm_1.eq)(schema.salonSchedules.dayOfWeek, dayOfWeek)))
                .limit(1);
            if (!salonSchedule[0]?.isOpen || !salonSchedule[0]?.openTime || !salonSchedule[0]?.closeTime) {
                return [];
            }
            const dayStart = salonSchedule[0].openTime;
            const dayEnd = salonSchedule[0].closeTime;
            // Buscar agendamentos existentes
            const appointments = await this.db
                .select()
                .from(schema.appointments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.appointments.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema.appointments.date, date)));
            const occupiedSlots = appointments
                .filter((a) => a.status !== 'CANCELLED' && a.status !== 'NO_SHOW' && a.startTime && a.endTime)
                .map((a) => ({ start: a.startTime, end: a.endTime }));
            // Gerar slots disponíveis
            const slots = [];
            const [startH, startM] = dayStart.split(':').map(Number);
            const [endH, endM] = dayEnd.split(':').map(Number);
            const dayStartMinutes = startH * 60 + startM;
            const dayEndMinutes = endH * 60 + endM;
            for (let m = dayStartMinutes; m + durationMinutes <= dayEndMinutes; m += 30) {
                const h = Math.floor(m / 60);
                const min = m % 60;
                const slotStart = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                const slotEndMin = m + durationMinutes;
                const slotEndH = Math.floor(slotEndMin / 60);
                const slotEndM = slotEndMin % 60;
                const slotEnd = `${slotEndH.toString().padStart(2, '0')}:${slotEndM.toString().padStart(2, '0')}`;
                const isOccupied = occupiedSlots.some((occ) => this.timeOverlaps(slotStart, slotEnd, occ.start, occ.end));
                if (!isOccupied) {
                    slots.push(slotStart);
                }
            }
            return slots.slice(0, 6);
        }
    };
    return SchedulesService = _classThis;
})();
exports.SchedulesService = SchedulesService;
//# sourceMappingURL=schedules.service.js.map