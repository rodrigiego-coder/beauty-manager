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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../../database");
// ==================== SERVICE ====================
let AppointmentsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AppointmentsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AppointmentsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        usersService;
        scheduledMessagesService;
        triageService;
        schedulesService;
        logger = new common_1.Logger(AppointmentsService.name);
        constructor(db, usersService, scheduledMessagesService, triageService, schedulesService) {
            this.db = db;
            this.usersService = usersService;
            this.scheduledMessagesService = scheduledMessagesService;
            this.triageService = triageService;
            this.schedulesService = schedulesService;
        }
        // ==================== APPOINTMENTS CRUD ====================
        /**
         * Lista todos os agendamentos do salão com filtros
         */
        async findAll(salonId, filters) {
            const conditions = [(0, drizzle_orm_1.eq)(database_1.appointments.salonId, salonId)];
            if (filters?.date) {
                conditions.push((0, drizzle_orm_1.eq)(database_1.appointments.date, filters.date));
            }
            if (filters?.professionalId) {
                conditions.push((0, drizzle_orm_1.eq)(database_1.appointments.professionalId, filters.professionalId));
            }
            if (filters?.status) {
                conditions.push((0, drizzle_orm_1.eq)(database_1.appointments.status, filters.status));
            }
            if (filters?.clientId) {
                conditions.push((0, drizzle_orm_1.eq)(database_1.appointments.clientId, filters.clientId));
            }
            if (filters?.startDate) {
                conditions.push((0, drizzle_orm_1.gte)(database_1.appointments.date, filters.startDate));
            }
            if (filters?.endDate) {
                conditions.push((0, drizzle_orm_1.lte)(database_1.appointments.date, filters.endDate));
            }
            const results = await this.db
                .select()
                .from(database_1.appointments)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy(database_1.appointments.date, database_1.appointments.time);
            return this.enrichAppointments(results);
        }
        /**
         * Busca agendamento por ID
         */
        async findById(id, salonId) {
            const result = await this.db
                .select()
                .from(database_1.appointments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.appointments.id, id), (0, drizzle_orm_1.eq)(database_1.appointments.salonId, salonId)))
                .limit(1);
            if (!result[0])
                return null;
            const enriched = await this.enrichAppointments([result[0]]);
            return enriched[0];
        }
        /**
         * Busca agendamentos por data (dia específico)
         */
        async findByDay(salonId, date) {
            const dayAppointments = await this.findAll(salonId, { date });
            // Get all active professionals
            const professionals = await this.db
                .select({ id: database_1.users.id, name: database_1.users.name })
                .from(database_1.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.users.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.users.role, 'STYLIST'), (0, drizzle_orm_1.eq)(database_1.users.active, true)));
            // Get blocks for this day
            const blocks = await this.getBlocksForDate(salonId, date);
            return {
                date,
                appointments: dayAppointments,
                professionals,
                blocks,
            };
        }
        /**
         * Busca agendamentos da semana
         */
        async findByWeek(salonId, startDate) {
            const start = new Date(startDate);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            const endDate = end.toISOString().split('T')[0];
            const weekAppointments = await this.findAll(salonId, { startDate, endDate });
            // Get professionals once
            const professionals = await this.db
                .select({ id: database_1.users.id, name: database_1.users.name })
                .from(database_1.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.users.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.users.role, 'STYLIST'), (0, drizzle_orm_1.eq)(database_1.users.active, true)));
            // Get all blocks for the week
            const allBlocks = await this.getBlocksForDateRange(salonId, startDate, endDate);
            // Group by day
            const days = [];
            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(start);
                dayDate.setDate(dayDate.getDate() + i);
                const dateStr = dayDate.toISOString().split('T')[0];
                const dayApts = weekAppointments.filter(a => a.date === dateStr);
                const dayBlocks = allBlocks.filter(b => b.startDate <= dateStr && b.endDate >= dateStr);
                days.push({
                    date: dateStr,
                    appointments: dayApts,
                    professionals,
                    blocks: dayBlocks,
                });
            }
            return { startDate, endDate, days };
        }
        /**
         * Busca agendamentos do mês
         */
        async findByMonth(salonId, year, month) {
            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
            const monthAppointments = await this.findAll(salonId, { startDate, endDate });
            const allBlocks = await this.getBlocksForDateRange(salonId, startDate, endDate);
            // Get max slots per day (based on professionals and working hours)
            const maxSlotsPerDay = 50; // Simplified - would calculate based on working hours
            // Group by day
            const days = [];
            for (let d = 1; d <= lastDay; d++) {
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const dayApts = monthAppointments.filter(a => a.date === dateStr);
                const hasBlocks = allBlocks.some(b => b.startDate <= dateStr && b.endDate >= dateStr);
                // Calculate occupancy level
                const occupancy = dayApts.length / maxSlotsPerDay;
                let occupancyLevel = 'low';
                if (occupancy > 0.7)
                    occupancyLevel = 'high';
                else if (occupancy > 0.4)
                    occupancyLevel = 'medium';
                days.push({
                    date: dateStr,
                    appointmentCount: dayApts.length,
                    hasBlocks,
                    occupancyLevel,
                    appointments: dayApts,
                });
            }
            return { year, month, days };
        }
        /**
         * Cria um novo agendamento
         */
        async create(salonId, data, createdById) {
            // Validate required fields
            if (!data.professionalId) {
                throw new common_1.BadRequestException('Profissional é obrigatório');
            }
            if (!data.date) {
                throw new common_1.BadRequestException('Data é obrigatória');
            }
            if (!data.time) {
                throw new common_1.BadRequestException('Horário é obrigatório');
            }
            if (!data.duration) {
                throw new common_1.BadRequestException('Duração é obrigatória');
            }
            if (!data.service) {
                throw new common_1.BadRequestException('Serviço é obrigatório');
            }
            // Validate client is not blocked
            if (data.clientId) {
                const isBlocked = await this.isClientBlocked(salonId, data.clientId);
                if (isBlocked) {
                    throw new common_1.BadRequestException('Cliente está bloqueado devido a histórico de não comparecimentos');
                }
            }
            // Validate availability using SchedulesService (provides detailed error messages)
            const availability = await this.schedulesService.checkAvailability(salonId, data.professionalId, data.date, data.time, data.duration);
            if (!availability.available) {
                const error = new common_1.BadRequestException(availability.message);
                error.response = {
                    statusCode: 400,
                    error: 'APPOINTMENT_NOT_AVAILABLE',
                    reason: availability.reason,
                    message: availability.message,
                    details: availability.details,
                    suggestedSlots: availability.suggestedSlots,
                };
                throw error;
            }
            // Validate professional
            const professional = await this.usersService.findById(data.professionalId);
            if (!professional) {
                throw new common_1.BadRequestException('Profissional não encontrado');
            }
            if (!professional.active) {
                throw new common_1.BadRequestException('Profissional está inativo');
            }
            // Check working hours
            const dayOfWeek = new Date(data.date).getDay();
            const workingHours = await this.getWorkingHours(data.professionalId, salonId);
            const daySchedule = workingHours.find(w => w.dayOfWeek === dayOfWeek && w.isActive);
            if (!daySchedule) {
                throw new common_1.BadRequestException('Profissional não trabalha neste dia');
            }
            // Check if within working hours
            if (data.time < daySchedule.startTime || data.time >= daySchedule.endTime) {
                throw new common_1.BadRequestException(`Horário fora do expediente (${daySchedule.startTime} - ${daySchedule.endTime})`);
            }
            // Check for breaks
            if (daySchedule.breakStartTime && daySchedule.breakEndTime) {
                const endMinutes = this.timeToMinutes(data.time) + data.duration;
                const endTime = this.minutesToTime(endMinutes);
                if ((data.time >= daySchedule.breakStartTime && data.time < daySchedule.breakEndTime) ||
                    (endTime > daySchedule.breakStartTime && endTime <= daySchedule.breakEndTime)) {
                    throw new common_1.BadRequestException('Horário conflita com intervalo de almoço');
                }
            }
            // Check for blocks
            const hasBlock = await this.hasBlockOnDate(data.professionalId, salonId, data.date, data.time, data.duration);
            if (hasBlock) {
                throw new common_1.BadRequestException('Profissional tem bloqueio neste horário');
            }
            // Check for conflicts with buffers
            const bufferBefore = data.bufferBefore || 0;
            const bufferAfter = data.bufferAfter || 0;
            const totalDuration = bufferBefore + data.duration + bufferAfter;
            const adjustedTime = this.minutesToTime(this.timeToMinutes(data.time) - bufferBefore);
            const hasConflict = await this.checkConflict(data.date, adjustedTime, totalDuration, data.professionalId);
            if (hasConflict) {
                throw new common_1.BadRequestException('Profissional já tem agendamento neste horário');
            }
            // Calculate end time
            const endTime = this.calculateEndTime(data.time, data.duration);
            // Get client info
            let clientName = data.clientName;
            let clientPhone = data.clientPhone;
            let clientEmail = data.clientEmail;
            let noShowCount = 0;
            if (data.clientId) {
                const client = await this.db
                    .select({ name: database_1.clients.name, phone: database_1.clients.phone, email: database_1.clients.email })
                    .from(database_1.clients)
                    .where((0, drizzle_orm_1.eq)(database_1.clients.id, data.clientId))
                    .limit(1);
                if (client[0]) {
                    clientName = clientName || client[0].name;
                    clientPhone = clientPhone || client[0].phone || undefined;
                    clientEmail = clientEmail || client[0].email || undefined;
                }
                // Get no-show count
                const noShows = await this.db
                    .select()
                    .from(database_1.clientNoShows)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.clientNoShows.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.clientNoShows.clientId, data.clientId)));
                noShowCount = noShows.length;
            }
            const result = await this.db
                .insert(database_1.appointments)
                .values({
                salonId,
                clientId: data.clientId || null,
                clientName: clientName || null,
                clientPhone: clientPhone || null,
                clientEmail: clientEmail || null,
                professionalId: data.professionalId,
                serviceId: data.serviceId || null,
                service: data.service,
                date: data.date,
                time: data.time,
                startTime: data.time,
                endTime,
                duration: data.duration,
                bufferBefore: bufferBefore,
                bufferAfter: bufferAfter,
                locationType: data.locationType || 'SALON',
                address: data.address || null,
                status: 'SCHEDULED',
                confirmationStatus: 'PENDING',
                priority: data.priority || 'NORMAL',
                color: data.color || null,
                price: data.price || '0',
                notes: data.notes || null,
                internalNotes: data.internalNotes || null,
                noShowCount,
                source: data.source || 'MANUAL',
                createdById,
            })
                .returning();
            const appointment = result[0];
            // Verificar se serviço requer triagem e criar resposta
            let triageLink = null;
            try {
                if (data.serviceId) {
                    const form = await this.triageService.getFormForService(salonId, data.serviceId);
                    if (form) {
                        const triageResponse = await this.triageService.createTriageResponse(salonId, appointment.id, form.id, data.clientId || undefined);
                        triageLink = triageResponse.publicLink;
                        this.logger.log(`Triagem criada para agendamento ${appointment.id}, link: ${triageLink}`);
                    }
                }
            }
            catch (error) {
                this.logger.warn(`Erro ao criar triagem para agendamento ${appointment.id}: ${error}`);
            }
            // Agendar notificações WhatsApp automáticas
            try {
                await this.scheduledMessagesService.scheduleAllAppointmentNotifications({
                    ...appointment,
                    salonId,
                    professionalName: professional.name,
                }, triageLink || undefined);
            }
            catch (error) {
                // Log error but don't fail the appointment creation
                this.logger.error('Erro ao agendar notificações WhatsApp:', error);
            }
            return appointment;
        }
        /**
         * Atualiza um agendamento
         */
        async update(id, salonId, data, updatedById) {
            const existing = await this.findById(id, salonId);
            if (!existing)
                return null;
            // If changing time/professional, validate again
            if (data.professionalId || data.date || data.time || data.duration) {
                const professionalId = data.professionalId || existing.professionalId;
                const date = data.date || existing.date;
                const time = data.time || existing.time;
                const duration = data.duration || existing.duration;
                // Check conflict excluding current appointment
                const hasConflict = await this.checkConflict(date, time, duration, professionalId, id);
                if (hasConflict) {
                    throw new common_1.BadRequestException('Profissional já tem agendamento neste horário');
                }
            }
            // Recalculate end time if needed
            const updateData = { ...data, updatedById, updatedAt: new Date() };
            if (data.time || data.duration) {
                const t = data.time || existing.time;
                const d = data.duration || existing.duration;
                updateData.startTime = t;
                updateData.endTime = this.calculateEndTime(t, d);
            }
            const result = await this.db
                .update(database_1.appointments)
                .set(updateData)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.appointments.id, id), (0, drizzle_orm_1.eq)(database_1.appointments.salonId, salonId)))
                .returning();
            return result[0] || null;
        }
        /**
         * Cancela um agendamento
         */
        async cancel(id, salonId, cancelledById, reason) {
            const existing = await this.findById(id, salonId);
            const result = await this.db
                .update(database_1.appointments)
                .set({
                status: 'CANCELLED',
                cancelledById,
                cancellationReason: reason || null,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.appointments.id, id), (0, drizzle_orm_1.eq)(database_1.appointments.salonId, salonId)))
                .returning();
            const appointment = result[0];
            if (appointment) {
                // Cancelar notificações pendentes e agendar notificação de cancelamento
                try {
                    await this.scheduledMessagesService.cancelAppointmentNotifications(id);
                    if (existing?.clientPhone) {
                        await this.scheduledMessagesService.scheduleAppointmentCancellation({
                            ...appointment,
                            salonId,
                            clientPhone: existing.clientPhone,
                            clientName: existing.clientName,
                        });
                    }
                }
                catch (error) {
                    console.error('Erro ao processar notificações de cancelamento:', error);
                }
            }
            return appointment || null;
        }
        // ==================== STATUS TRANSITIONS ====================
        /**
         * Confirma um agendamento
         */
        async confirm(id, salonId, via) {
            const result = await this.db
                .update(database_1.appointments)
                .set({
                status: 'CONFIRMED',
                confirmationStatus: 'CONFIRMED',
                confirmedAt: new Date(),
                confirmedVia: (via || 'MANUAL'),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.appointments.id, id), (0, drizzle_orm_1.eq)(database_1.appointments.salonId, salonId)))
                .returning();
            return result[0] || null;
        }
        /**
         * Inicia um atendimento
         */
        async start(id, salonId) {
            const result = await this.db
                .update(database_1.appointments)
                .set({
                status: 'IN_PROGRESS',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.appointments.id, id), (0, drizzle_orm_1.eq)(database_1.appointments.salonId, salonId)))
                .returning();
            return result[0] || null;
        }
        /**
         * Finaliza um atendimento
         */
        async complete(id, salonId) {
            const result = await this.db
                .update(database_1.appointments)
                .set({
                status: 'COMPLETED',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.appointments.id, id), (0, drizzle_orm_1.eq)(database_1.appointments.salonId, salonId)))
                .returning();
            return result[0] || null;
        }
        /**
         * Marca como não compareceu e registra no histórico
         */
        async noShow(id, salonId) {
            const appointment = await this.findById(id, salonId);
            if (!appointment)
                return null;
            // Update appointment
            const result = await this.db
                .update(database_1.appointments)
                .set({
                status: 'NO_SHOW',
                noShowCount: (appointment.noShowCount || 0) + 1,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.appointments.id, id), (0, drizzle_orm_1.eq)(database_1.appointments.salonId, salonId)))
                .returning();
            // Record no-show in history if client exists
            if (appointment.clientId) {
                await this.db.insert(database_1.clientNoShows).values({
                    salonId,
                    clientId: appointment.clientId,
                    appointmentId: id,
                    date: appointment.date,
                    blocked: false,
                });
                // Check if should block client (3+ no-shows)
                const noShowCount = await this.db
                    .select()
                    .from(database_1.clientNoShows)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.clientNoShows.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.clientNoShows.clientId, appointment.clientId)));
                if (noShowCount.length >= 3) {
                    const blockUntil = new Date();
                    blockUntil.setDate(blockUntil.getDate() + 30);
                    await this.db
                        .update(database_1.clientNoShows)
                        .set({
                        blocked: true,
                        blockedUntil: blockUntil.toISOString().split('T')[0],
                    })
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.clientNoShows.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.clientNoShows.clientId, appointment.clientId)));
                }
            }
            return result[0] || null;
        }
        /**
         * Reagenda um agendamento
         */
        async reschedule(id, salonId, newDate, newTime, newProfessionalId, updatedById) {
            const existing = await this.findById(id, salonId);
            if (!existing)
                return null;
            const oldDate = existing.date;
            const oldTime = existing.time;
            const professionalId = newProfessionalId || existing.professionalId;
            // Check availability
            const hasConflict = await this.checkConflict(newDate, newTime, existing.duration, professionalId, id);
            if (hasConflict) {
                throw new common_1.BadRequestException('Horário não disponível');
            }
            const endTime = this.calculateEndTime(newTime, existing.duration);
            const result = await this.db
                .update(database_1.appointments)
                .set({
                date: newDate,
                time: newTime,
                startTime: newTime,
                endTime,
                professionalId,
                status: 'SCHEDULED',
                confirmationStatus: 'PENDING',
                confirmedAt: null,
                confirmedVia: null,
                updatedById: updatedById || null,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.appointments.id, id), (0, drizzle_orm_1.eq)(database_1.appointments.salonId, salonId)))
                .returning();
            const appointment = result[0];
            if (appointment && existing.clientPhone) {
                // Cancelar notificações antigas e reagendar novas
                try {
                    await this.scheduledMessagesService.cancelAppointmentNotifications(id);
                    await this.scheduledMessagesService.scheduleAppointmentRescheduled({ ...appointment, salonId, clientPhone: existing.clientPhone, clientName: existing.clientName }, oldDate, oldTime);
                    // Reagendar lembretes para o novo horário
                    await this.scheduledMessagesService.scheduleReminder24h({
                        ...appointment,
                        salonId,
                        clientPhone: existing.clientPhone,
                        clientName: existing.clientName,
                    });
                    await this.scheduledMessagesService.scheduleReminder1h30({
                        ...appointment,
                        salonId,
                        clientPhone: existing.clientPhone,
                        clientName: existing.clientName,
                    });
                }
                catch (error) {
                    console.error('Erro ao processar notificações de reagendamento:', error);
                }
            }
            return appointment || null;
        }
        // ==================== AVAILABILITY ====================
        /**
         * Retorna horários disponíveis para um profissional em uma data
         */
        async getAvailableSlots(professionalId, salonId, date, serviceId, interval = 30) {
            const slots = [];
            // Get service duration
            let duration = 60;
            if (serviceId) {
                const service = await this.db
                    .select()
                    .from(database_1.services)
                    .where((0, drizzle_orm_1.eq)(database_1.services.id, serviceId))
                    .limit(1);
                if (service[0]) {
                    duration = service[0].durationMinutes;
                }
            }
            // Get working hours for this day
            const dayOfWeek = new Date(date).getDay();
            const workingHours = await this.getWorkingHours(professionalId, salonId);
            const daySchedule = workingHours.find(w => w.dayOfWeek === dayOfWeek && w.isActive);
            if (!daySchedule) {
                return []; // Professional doesn't work this day
            }
            // Get existing appointments
            const existingApts = await this.db
                .select()
                .from(database_1.appointments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.appointments.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.appointments.professionalId, professionalId), (0, drizzle_orm_1.eq)(database_1.appointments.date, date), (0, drizzle_orm_1.ne)(database_1.appointments.status, 'CANCELLED'), (0, drizzle_orm_1.ne)(database_1.appointments.status, 'NO_SHOW')));
            // Get blocks
            const blocks = await this.getBlocksForDate(salonId, date, professionalId);
            // Generate slots
            let currentTime = this.timeToMinutes(daySchedule.startTime);
            const endTime = this.timeToMinutes(daySchedule.endTime);
            const breakStart = daySchedule.breakStartTime ? this.timeToMinutes(daySchedule.breakStartTime) : null;
            const breakEnd = daySchedule.breakEndTime ? this.timeToMinutes(daySchedule.breakEndTime) : null;
            while (currentTime + duration <= endTime) {
                const timeStr = this.minutesToTime(currentTime);
                const slotEnd = currentTime + duration;
                // Check if in break
                let available = true;
                let reason;
                if (breakStart !== null && breakEnd !== null) {
                    if (currentTime >= breakStart && currentTime < breakEnd) {
                        available = false;
                        reason = 'Intervalo de almoço';
                    }
                    else if (slotEnd > breakStart && slotEnd <= breakEnd) {
                        available = false;
                        reason = 'Conflita com intervalo';
                    }
                }
                // Check blocks
                if (available) {
                    for (const block of blocks) {
                        if (block.allDay) {
                            available = false;
                            reason = block.title || 'Bloqueado';
                            break;
                        }
                        if (block.startTime && block.endTime) {
                            const blockStart = this.timeToMinutes(block.startTime);
                            const blockEnd = this.timeToMinutes(block.endTime);
                            if (currentTime < blockEnd && slotEnd > blockStart) {
                                available = false;
                                reason = block.title || 'Bloqueado';
                                break;
                            }
                        }
                    }
                }
                // Check existing appointments
                if (available) {
                    for (const apt of existingApts) {
                        const aptStart = this.timeToMinutes(apt.time);
                        const aptEnd = aptStart + apt.duration + (apt.bufferAfter || 0);
                        const aptStartWithBuffer = aptStart - (apt.bufferBefore || 0);
                        if (currentTime < aptEnd && slotEnd > aptStartWithBuffer) {
                            available = false;
                            reason = 'Horário ocupado';
                            break;
                        }
                    }
                }
                slots.push({ time: timeStr, available, reason });
                currentTime += interval;
            }
            return slots;
        }
        /**
         * Verifica disponibilidade completa
         */
        async checkAvailability(salonId, professionalId, date, startTime, duration) {
            // Check working hours
            const dayOfWeek = new Date(date).getDay();
            const workingHours = await this.getWorkingHours(professionalId, salonId);
            const daySchedule = workingHours.find(w => w.dayOfWeek === dayOfWeek && w.isActive);
            if (!daySchedule) {
                return { available: false, reason: 'Profissional não trabalha neste dia' };
            }
            if (startTime < daySchedule.startTime) {
                return { available: false, reason: 'Antes do horário de expediente' };
            }
            const endTime = this.calculateEndTime(startTime, duration);
            if (endTime > daySchedule.endTime) {
                return { available: false, reason: 'Após o horário de expediente' };
            }
            // Check blocks
            const hasBlock = await this.hasBlockOnDate(professionalId, salonId, date, startTime, duration);
            if (hasBlock) {
                return { available: false, reason: 'Profissional tem bloqueio neste horário' };
            }
            // Check conflicts
            const hasConflict = await this.checkConflict(date, startTime, duration, professionalId);
            if (hasConflict) {
                const conflicts = await this.getConflictingAppointments(date, startTime, duration, professionalId);
                const suggestedTimes = await this.findNextAvailableSlots(professionalId, salonId, date, duration, 3);
                return {
                    available: false,
                    reason: 'Horário já está ocupado',
                    conflicts,
                    suggestedTimes,
                };
            }
            return { available: true };
        }
        /**
         * Encontra próximo horário disponível
         */
        async findNextAvailable(serviceId, salonId, professionalId) {
            const service = await this.db
                .select()
                .from(database_1.services)
                .where((0, drizzle_orm_1.eq)(database_1.services.id, serviceId))
                .limit(1);
            if (!service[0])
                return null;
            // Duration is fetched internally by getAvailableSlots using serviceId
            // Get professionals
            let professionals;
            if (professionalId) {
                const prof = await this.db
                    .select({ id: database_1.users.id, name: database_1.users.name })
                    .from(database_1.users)
                    .where((0, drizzle_orm_1.eq)(database_1.users.id, professionalId))
                    .limit(1);
                professionals = prof;
            }
            else {
                professionals = await this.db
                    .select({ id: database_1.users.id, name: database_1.users.name })
                    .from(database_1.users)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.users.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.users.role, 'STYLIST'), (0, drizzle_orm_1.eq)(database_1.users.active, true)));
            }
            // Search next 14 days
            const today = new Date();
            for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
                const date = new Date(today);
                date.setDate(date.getDate() + dayOffset);
                const dateStr = date.toISOString().split('T')[0];
                for (const prof of professionals) {
                    const slots = await this.getAvailableSlots(prof.id, salonId, dateStr, serviceId);
                    const availableSlot = slots.find(s => s.available);
                    if (availableSlot) {
                        return {
                            date: dateStr,
                            time: availableSlot.time,
                            professionalId: prof.id,
                            professionalName: prof.name,
                        };
                    }
                }
            }
            return null;
        }
        // ==================== BLOCKS/FOLGAS ====================
        /**
         * Lista bloqueios
         */
        async getBlocks(salonId, filters) {
            const conditions = [(0, drizzle_orm_1.eq)(database_1.professionalBlocks.salonId, salonId)];
            if (filters?.professionalId) {
                conditions.push((0, drizzle_orm_1.eq)(database_1.professionalBlocks.professionalId, filters.professionalId));
            }
            if (filters?.status) {
                conditions.push((0, drizzle_orm_1.eq)(database_1.professionalBlocks.status, filters.status));
            }
            if (filters?.startDate) {
                conditions.push((0, drizzle_orm_1.gte)(database_1.professionalBlocks.startDate, filters.startDate));
            }
            if (filters?.endDate) {
                conditions.push((0, drizzle_orm_1.lte)(database_1.professionalBlocks.endDate, filters.endDate));
            }
            const blocks = await this.db
                .select()
                .from(database_1.professionalBlocks)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy((0, drizzle_orm_1.desc)(database_1.professionalBlocks.startDate));
            // Enrich with professional name
            const enriched = [];
            for (const block of blocks) {
                const prof = await this.db
                    .select({ name: database_1.users.name })
                    .from(database_1.users)
                    .where((0, drizzle_orm_1.eq)(database_1.users.id, block.professionalId))
                    .limit(1);
                enriched.push({
                    ...block,
                    professionalName: prof[0]?.name || 'Profissional',
                });
            }
            return enriched;
        }
        /**
         * Busca bloqueio por ID
         */
        async getBlockById(id, salonId) {
            const result = await this.db
                .select()
                .from(database_1.professionalBlocks)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.professionalBlocks.id, id), (0, drizzle_orm_1.eq)(database_1.professionalBlocks.salonId, salonId)))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Cria bloqueio
         */
        async createBlock(salonId, data, createdById) {
            // Check if there are appointments in the block period
            if (data.professionalId && data.startDate && data.endDate) {
                const conflictingApts = await this.db
                    .select()
                    .from(database_1.appointments)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.appointments.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.appointments.professionalId, data.professionalId), (0, drizzle_orm_1.gte)(database_1.appointments.date, data.startDate), (0, drizzle_orm_1.lte)(database_1.appointments.date, data.endDate), (0, drizzle_orm_1.ne)(database_1.appointments.status, 'CANCELLED'), (0, drizzle_orm_1.ne)(database_1.appointments.status, 'NO_SHOW')));
                if (conflictingApts.length > 0) {
                    throw new common_1.BadRequestException(`Existem ${conflictingApts.length} agendamento(s) neste período`);
                }
            }
            const result = await this.db
                .insert(database_1.professionalBlocks)
                .values({
                salonId,
                professionalId: data.professionalId,
                type: data.type || 'DAY_OFF',
                title: data.title || 'Folga',
                description: data.description || null,
                startDate: data.startDate,
                endDate: data.endDate,
                startTime: data.startTime || null,
                endTime: data.endTime || null,
                allDay: data.allDay ?? true,
                recurring: data.recurring ?? false,
                recurringPattern: data.recurringPattern || null,
                recurringDays: data.recurringDays || null,
                recurringEndDate: data.recurringEndDate || null,
                status: data.requiresApproval ? 'PENDING' : 'APPROVED',
                requiresApproval: data.requiresApproval ?? false,
                createdById,
            })
                .returning();
            return result[0];
        }
        /**
         * Atualiza bloqueio
         */
        async updateBlock(id, salonId, data) {
            const result = await this.db
                .update(database_1.professionalBlocks)
                .set({
                ...data,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.professionalBlocks.id, id), (0, drizzle_orm_1.eq)(database_1.professionalBlocks.salonId, salonId)))
                .returning();
            return result[0] || null;
        }
        /**
         * Remove bloqueio
         */
        async deleteBlock(id, salonId) {
            const result = await this.db
                .delete(database_1.professionalBlocks)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.professionalBlocks.id, id), (0, drizzle_orm_1.eq)(database_1.professionalBlocks.salonId, salonId)))
                .returning();
            return result.length > 0;
        }
        /**
         * Aprova bloqueio
         */
        async approveBlock(id, salonId, approvedById) {
            const result = await this.db
                .update(database_1.professionalBlocks)
                .set({
                status: 'APPROVED',
                approvedById,
                approvedAt: new Date(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.professionalBlocks.id, id), (0, drizzle_orm_1.eq)(database_1.professionalBlocks.salonId, salonId)))
                .returning();
            return result[0] || null;
        }
        /**
         * Rejeita bloqueio
         */
        async rejectBlock(id, salonId, reason) {
            const result = await this.db
                .update(database_1.professionalBlocks)
                .set({
                status: 'REJECTED',
                rejectionReason: reason || null,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.professionalBlocks.id, id), (0, drizzle_orm_1.eq)(database_1.professionalBlocks.salonId, salonId)))
                .returning();
            return result[0] || null;
        }
        // ==================== WORKING HOURS ====================
        /**
         * Retorna horários de trabalho de um profissional
         */
        async getWorkingHours(professionalId, salonId) {
            const availability = await this.db
                .select()
                .from(database_1.professionalAvailabilities)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.professionalAvailabilities.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.professionalAvailabilities.professionalId, professionalId)))
                .orderBy(database_1.professionalAvailabilities.dayOfWeek);
            // If no custom hours, return default (Mon-Sat 9-18)
            if (availability.length === 0) {
                return [1, 2, 3, 4, 5, 6].map(day => ({
                    dayOfWeek: day,
                    startTime: '09:00',
                    endTime: '18:00',
                    breakStartTime: '12:00',
                    breakEndTime: '13:00',
                    isActive: day !== 0, // Sunday off
                }));
            }
            return availability.map(a => ({
                dayOfWeek: a.dayOfWeek,
                startTime: a.startTime,
                endTime: a.endTime,
                breakStartTime: a.breakStartTime,
                breakEndTime: a.breakEndTime,
                isActive: a.isActive,
            }));
        }
        /**
         * Define horários de trabalho
         */
        async setWorkingHours(professionalId, salonId, hours) {
            // Delete existing hours
            await this.db
                .delete(database_1.professionalAvailabilities)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.professionalAvailabilities.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.professionalAvailabilities.professionalId, professionalId)));
            // Insert new hours
            const results = [];
            for (const h of hours) {
                const result = await this.db
                    .insert(database_1.professionalAvailabilities)
                    .values({
                    salonId,
                    professionalId,
                    dayOfWeek: h.dayOfWeek,
                    startTime: h.startTime,
                    endTime: h.endTime,
                    breakStartTime: h.breakStartTime || null,
                    breakEndTime: h.breakEndTime || null,
                    isActive: h.isActive,
                })
                    .returning();
                results.push(result[0]);
            }
            return results;
        }
        /**
         * Atualiza horário de trabalho específico
         */
        async updateWorkingHour(id, salonId, data) {
            const result = await this.db
                .update(database_1.professionalAvailabilities)
                .set({
                startTime: data.startTime,
                endTime: data.endTime,
                breakStartTime: data.breakStartTime,
                breakEndTime: data.breakEndTime,
                isActive: data.isActive,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.professionalAvailabilities.id, id), (0, drizzle_orm_1.eq)(database_1.professionalAvailabilities.salonId, salonId)))
                .returning();
            return result[0] || null;
        }
        // ==================== CONVERT TO COMMAND ====================
        /**
         * Converte agendamento em comanda
         */
        async convertToCommand(id, salonId, userId) {
            const appointment = await this.findById(id, salonId);
            if (!appointment) {
                throw new common_1.NotFoundException('Agendamento não encontrado');
            }
            if (appointment.commandId) {
                throw new common_1.BadRequestException('Agendamento já possui uma comanda');
            }
            // Create command with appointmentId link and IN_SERVICE status
            const cardNumber = await this.generateCardNumber(salonId);
            const [newCommand] = await this.db
                .insert(database_1.commands)
                .values({
                salonId,
                cardNumber,
                clientId: appointment.clientId,
                appointmentId: appointment.id, // P0: Link to source appointment
                status: 'IN_SERVICE', // P0: Start as IN_SERVICE since it already has a service item
                openedById: userId,
                openedAt: new Date(),
                totalGross: '0',
                totalDiscounts: '0',
                totalNet: '0',
            })
                .returning();
            // Add service as command item with referenceId from appointment.serviceId
            const price = parseFloat(appointment.price || '0');
            await this.db.insert(database_1.commandItems).values({
                commandId: newCommand.id,
                type: 'SERVICE',
                referenceId: appointment.serviceId ? String(appointment.serviceId) : null, // P0: Link to service
                description: appointment.service,
                quantity: '1',
                unitPrice: price.toFixed(2),
                discount: '0',
                totalPrice: price.toFixed(2),
                performerId: appointment.professionalId,
                addedById: userId,
            });
            // Update command totals
            await this.db
                .update(database_1.commands)
                .set({
                totalGross: price.toFixed(2),
                totalNet: price.toFixed(2),
            })
                .where((0, drizzle_orm_1.eq)(database_1.commands.id, newCommand.id));
            // Link appointment to command and mark as in progress
            await this.db
                .update(database_1.appointments)
                .set({
                commandId: newCommand.id,
                status: 'IN_PROGRESS',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.appointments.id, id));
            return { appointmentId: id, commandId: newCommand.id };
        }
        // ==================== SEARCH/QUERIES ====================
        /**
         * Lista agendamentos por profissional
         */
        async findByProfessional(professionalId, salonId, date) {
            const filters = { professionalId };
            if (date)
                filters.date = date;
            return this.findAll(salonId, filters);
        }
        /**
         * Lista agendamentos por cliente
         */
        async findByClient(clientId, salonId) {
            return this.findAll(salonId, { clientId });
        }
        // ==================== KPIs ====================
        /**
         * Calcula KPIs do negócio
         */
        async calculateKPIs(salonId, startDate, endDate) {
            const conditions = [(0, drizzle_orm_1.eq)(database_1.appointments.salonId, salonId)];
            if (startDate)
                conditions.push((0, drizzle_orm_1.gte)(database_1.appointments.date, startDate));
            if (endDate)
                conditions.push((0, drizzle_orm_1.lte)(database_1.appointments.date, endDate));
            const allAppointments = await this.db
                .select()
                .from(database_1.appointments)
                .where((0, drizzle_orm_1.and)(...conditions));
            const completedApts = allAppointments.filter(a => a.status === 'COMPLETED');
            const noShowApts = allAppointments.filter(a => a.status === 'NO_SHOW');
            const confirmedApts = allAppointments.filter(a => a.confirmationStatus === 'CONFIRMED');
            const totalFaturamento = completedApts.reduce((sum, apt) => sum + parseFloat(apt.price || '0'), 0);
            const uniqueClients = new Set(completedApts.filter(a => a.clientId).map(apt => apt.clientId));
            const totalClientes = uniqueClients.size;
            const ticketMedio = totalClientes > 0 ? totalFaturamento / completedApts.length : 0;
            const clientAppointmentCount = {};
            completedApts.forEach(apt => {
                if (apt.clientId) {
                    clientAppointmentCount[apt.clientId] = (clientAppointmentCount[apt.clientId] || 0) + 1;
                }
            });
            const clientesRecorrentes = Object.values(clientAppointmentCount).filter(count => count > 1).length;
            const taxaRetorno = totalClientes > 0 ? (clientesRecorrentes / totalClientes) * 100 : 0;
            const totalAgendamentos = allAppointments.length;
            const taxaNoShow = totalAgendamentos > 0 ? (noShowApts.length / totalAgendamentos) * 100 : 0;
            const taxaConfirmacao = totalAgendamentos > 0 ? (confirmedApts.length / totalAgendamentos) * 100 : 0;
            const serviceStats = {};
            completedApts.forEach(apt => {
                const svc = apt.service;
                if (!serviceStats[svc]) {
                    serviceStats[svc] = { count: 0, revenue: 0 };
                }
                serviceStats[svc].count++;
                serviceStats[svc].revenue += parseFloat(apt.price || '0');
            });
            const top3Servicos = Object.entries(serviceStats)
                .map(([service, stats]) => ({ service, ...stats }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 3);
            return {
                ticketMedio: Math.round(ticketMedio * 100) / 100,
                taxaRetorno: Math.round(taxaRetorno * 100) / 100,
                totalFaturamento: Math.round(totalFaturamento * 100) / 100,
                totalAgendamentos,
                totalClientes,
                clientesRecorrentes,
                taxaNoShow: Math.round(taxaNoShow * 100) / 100,
                taxaConfirmacao: Math.round(taxaConfirmacao * 100) / 100,
                top3Servicos,
            };
        }
        // ==================== PRIVATE HELPERS ====================
        /**
         * Verifica conflito de horário
         */
        async checkConflict(date, time, duration, professionalId, excludeId) {
            const existingAppointments = await this.db
                .select()
                .from(database_1.appointments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.appointments.date, date), (0, drizzle_orm_1.eq)(database_1.appointments.professionalId, professionalId)));
            const newStart = this.timeToMinutes(time);
            const newEnd = newStart + duration;
            for (const apt of existingAppointments) {
                if (excludeId && apt.id === excludeId)
                    continue;
                if (apt.status === 'CANCELLED' || apt.status === 'NO_SHOW')
                    continue;
                const aptStart = this.timeToMinutes(apt.time) - (apt.bufferBefore || 0);
                const aptEnd = this.timeToMinutes(apt.time) + apt.duration + (apt.bufferAfter || 0);
                if (newStart < aptEnd && newEnd > aptStart) {
                    return true;
                }
            }
            return false;
        }
        /**
         * Retorna agendamentos conflitantes
         */
        async getConflictingAppointments(date, time, duration, professionalId) {
            const existingAppointments = await this.db
                .select()
                .from(database_1.appointments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.appointments.date, date), (0, drizzle_orm_1.eq)(database_1.appointments.professionalId, professionalId), (0, drizzle_orm_1.ne)(database_1.appointments.status, 'CANCELLED'), (0, drizzle_orm_1.ne)(database_1.appointments.status, 'NO_SHOW')));
            const newStart = this.timeToMinutes(time);
            const newEnd = newStart + duration;
            return existingAppointments.filter(apt => {
                const aptStart = this.timeToMinutes(apt.time);
                const aptEnd = aptStart + apt.duration;
                return newStart < aptEnd && newEnd > aptStart;
            });
        }
        /**
         * Encontra próximos slots disponíveis
         */
        async findNextAvailableSlots(professionalId, salonId, date, _duration, count) {
            const slots = await this.getAvailableSlots(professionalId, salonId, date);
            return slots.filter(s => s.available).slice(0, count).map(s => s.time);
        }
        /**
         * Busca bloqueios para uma data
         */
        async getBlocksForDate(salonId, date, professionalId) {
            const conditions = [
                (0, drizzle_orm_1.eq)(database_1.professionalBlocks.salonId, salonId),
                (0, drizzle_orm_1.lte)(database_1.professionalBlocks.startDate, date),
                (0, drizzle_orm_1.gte)(database_1.professionalBlocks.endDate, date),
                (0, drizzle_orm_1.eq)(database_1.professionalBlocks.status, 'APPROVED'),
            ];
            if (professionalId) {
                conditions.push((0, drizzle_orm_1.eq)(database_1.professionalBlocks.professionalId, professionalId));
            }
            return this.db
                .select()
                .from(database_1.professionalBlocks)
                .where((0, drizzle_orm_1.and)(...conditions));
        }
        /**
         * Busca bloqueios para um range de datas
         */
        async getBlocksForDateRange(salonId, startDate, endDate) {
            return this.db
                .select()
                .from(database_1.professionalBlocks)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.professionalBlocks.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.professionalBlocks.status, 'APPROVED'), (0, drizzle_orm_1.or)((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(database_1.professionalBlocks.startDate, startDate), (0, drizzle_orm_1.lte)(database_1.professionalBlocks.startDate, endDate)), (0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(database_1.professionalBlocks.endDate, startDate), (0, drizzle_orm_1.lte)(database_1.professionalBlocks.endDate, endDate)), (0, drizzle_orm_1.and)((0, drizzle_orm_1.lte)(database_1.professionalBlocks.startDate, startDate), (0, drizzle_orm_1.gte)(database_1.professionalBlocks.endDate, endDate)))));
        }
        /**
         * Verifica se há bloqueio em data/horário específico
         */
        async hasBlockOnDate(professionalId, salonId, date, time, duration) {
            const blocks = await this.getBlocksForDate(salonId, date, professionalId);
            for (const block of blocks) {
                if (block.allDay)
                    return true;
                if (block.startTime && block.endTime) {
                    const blockStart = this.timeToMinutes(block.startTime);
                    const blockEnd = this.timeToMinutes(block.endTime);
                    const aptStart = this.timeToMinutes(time);
                    const aptEnd = aptStart + duration;
                    if (aptStart < blockEnd && aptEnd > blockStart) {
                        return true;
                    }
                }
            }
            return false;
        }
        /**
         * Verifica se cliente está bloqueado
         */
        async isClientBlocked(salonId, clientId) {
            const today = new Date().toISOString().split('T')[0];
            const blocked = await this.db
                .select()
                .from(database_1.clientNoShows)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.clientNoShows.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.clientNoShows.clientId, clientId), (0, drizzle_orm_1.eq)(database_1.clientNoShows.blocked, true), (0, drizzle_orm_1.or)((0, drizzle_orm_1.sql) `${database_1.clientNoShows.blockedUntil} IS NULL`, (0, drizzle_orm_1.gte)(database_1.clientNoShows.blockedUntil, today))))
                .limit(1);
            return blocked.length > 0;
        }
        /**
         * Enrich appointments with client/professional/service names
         */
        async enrichAppointments(apts) {
            const enriched = [];
            for (const apt of apts) {
                let clientNameResolved = apt.clientName;
                if (!clientNameResolved && apt.clientId) {
                    const client = await this.db
                        .select({ name: database_1.clients.name })
                        .from(database_1.clients)
                        .where((0, drizzle_orm_1.eq)(database_1.clients.id, apt.clientId))
                        .limit(1);
                    clientNameResolved = client[0]?.name || null;
                }
                const professional = await this.db
                    .select({ name: database_1.users.name })
                    .from(database_1.users)
                    .where((0, drizzle_orm_1.eq)(database_1.users.id, apt.professionalId))
                    .limit(1);
                let serviceName = apt.service;
                let serviceDetails;
                if (apt.serviceId) {
                    const svc = await this.db
                        .select()
                        .from(database_1.services)
                        .where((0, drizzle_orm_1.eq)(database_1.services.id, apt.serviceId))
                        .limit(1);
                    if (svc[0]) {
                        serviceName = svc[0].name;
                        serviceDetails = {
                            id: svc[0].id,
                            name: svc[0].name,
                            duration: svc[0].durationMinutes,
                            price: svc[0].basePrice,
                            bufferBefore: svc[0].bufferBefore,
                            bufferAfter: svc[0].bufferAfter,
                        };
                    }
                }
                enriched.push({
                    ...apt,
                    clientName: clientNameResolved,
                    professionalName: professional[0]?.name || 'Profissional',
                    serviceName,
                    serviceDetails,
                });
            }
            return enriched;
        }
        /**
         * Generate card number - Numeração sequencial simples (1, 2, 3...)
         */
        async generateCardNumber(salonId) {
            // Busca todos os cardNumbers do salão
            const existingCommands = await this.db
                .select({ cardNumber: database_1.commands.cardNumber })
                .from(database_1.commands)
                .where((0, drizzle_orm_1.eq)(database_1.commands.salonId, salonId));
            // Encontra o maior número existente (apenas números puros, ignora formato antigo)
            let maxNumber = 0;
            for (const cmd of existingCommands) {
                if (cmd.cardNumber && /^\d+$/.test(cmd.cardNumber)) {
                    const num = parseInt(cmd.cardNumber, 10);
                    if (!isNaN(num) && num > maxNumber) {
                        maxNumber = num;
                    }
                }
            }
            // Retorna o próximo número sequencial
            return String(maxNumber + 1);
        }
        /**
         * Convert time string to minutes
         */
        timeToMinutes(time) {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        }
        /**
         * Convert minutes to time string
         */
        minutesToTime(minutes) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        }
        /**
         * Calculate end time from start time and duration
         */
        calculateEndTime(startTime, duration) {
            const startMinutes = this.timeToMinutes(startTime);
            return this.minutesToTime(startMinutes + duration);
        }
    };
    return AppointmentsService = _classThis;
})();
exports.AppointmentsService = AppointmentsService;
//# sourceMappingURL=appointments.service.js.map