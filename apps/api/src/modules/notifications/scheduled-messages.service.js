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
exports.ScheduledMessagesService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../database/schema");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
// ID único do worker para identificação em logs
const WORKER_ID = `worker-${process.pid}-${Date.now().toString(36)}`;
let ScheduledMessagesService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ScheduledMessagesService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ScheduledMessagesService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        logger = new common_1.Logger(ScheduledMessagesService.name);
        constructor(db) {
            this.db = db;
            this.logger.log(`Worker ID: ${WORKER_ID}`);
        }
        // ==================== AGENDAMENTO DE NOTIFICAÇÕES ====================
        /**
         * Agenda mensagem de confirmação ao criar agendamento
         * IDEMPOTENTE: Usa dedupeKey para evitar duplicação
         */
        async scheduleAppointmentConfirmation(appointment, triageLink) {
            if (!appointment.clientPhone) {
                this.logger.warn(`Agendamento ${appointment.id} sem telefone do cliente`);
                return;
            }
            // Busca dados do salão (endereço e localização)
            const salonInfo = await this.getSalonInfo(appointment.salonId);
            const variables = this.buildTemplateVariables(appointment, salonInfo);
            if (triageLink) {
                variables.triageLink = triageLink;
            }
            const dedupeKey = `${appointment.id}:APPOINTMENT_CONFIRMATION`;
            await this.createNotificationIdempotent({
                salonId: appointment.salonId,
                appointmentId: appointment.id,
                recipientPhone: this.formatPhone(appointment.clientPhone),
                recipientName: appointment.clientName,
                notificationType: 'APPOINTMENT_CONFIRMATION',
                templateKey: 'appointment_confirmation',
                templateVariables: variables,
                scheduledFor: new Date(),
                dedupeKey,
            });
            this.logger.log(`Confirmação agendada para ${appointment.clientPhone}${triageLink ? ' com link de triagem' : ''}`);
        }
        /**
         * Agenda lembrete 24h antes do agendamento
         */
        async scheduleReminder24h(appointment, triageLink) {
            if (!appointment.clientPhone)
                return;
            const appointmentDateTime = this.parseAppointmentDateTime(appointment);
            const reminderTime = (0, date_fns_1.addHours)(appointmentDateTime, -24);
            if (reminderTime <= new Date()) {
                this.logger.debug(`Lembrete 24h já passou para agendamento ${appointment.id}`);
                return;
            }
            const variables = this.buildTemplateVariables(appointment);
            if (triageLink) {
                variables.triageLink = triageLink;
                variables.triagePending = 'true';
            }
            const dedupeKey = `${appointment.id}:APPOINTMENT_REMINDER_24H`;
            await this.createNotificationIdempotent({
                salonId: appointment.salonId,
                appointmentId: appointment.id,
                recipientPhone: this.formatPhone(appointment.clientPhone),
                recipientName: appointment.clientName,
                notificationType: 'APPOINTMENT_REMINDER_24H',
                templateKey: 'appointment_reminder_24h',
                templateVariables: variables,
                scheduledFor: reminderTime,
                dedupeKey,
            });
            this.logger.log(`Lembrete 24h agendado para ${(0, date_fns_1.format)(reminderTime, 'dd/MM HH:mm')}`);
        }
        /**
         * Agenda lembrete 1h30 antes do agendamento
         */
        async scheduleReminder1h30(appointment) {
            if (!appointment.clientPhone)
                return;
            const appointmentDateTime = this.parseAppointmentDateTime(appointment);
            const reminderTime = (0, date_fns_1.addMinutes)(appointmentDateTime, -90); // 1h30 = 90 minutos
            if (reminderTime <= new Date()) {
                this.logger.debug(`Lembrete 1h30 já passou para agendamento ${appointment.id}`);
                return;
            }
            const variables = this.buildTemplateVariables(appointment);
            const dedupeKey = `${appointment.id}:APPOINTMENT_REMINDER_1H30`;
            await this.createNotificationIdempotent({
                salonId: appointment.salonId,
                appointmentId: appointment.id,
                recipientPhone: this.formatPhone(appointment.clientPhone),
                recipientName: appointment.clientName,
                notificationType: 'APPOINTMENT_REMINDER_1H30',
                templateKey: 'appointment_reminder_1h30',
                templateVariables: variables,
                scheduledFor: reminderTime,
                dedupeKey,
            });
            this.logger.log(`Lembrete 1h30 agendado para ${(0, date_fns_1.format)(reminderTime, 'dd/MM HH:mm')}`);
        }
        /**
         * Agenda notificação de cancelamento
         */
        async scheduleAppointmentCancellation(appointment) {
            if (!appointment.clientPhone)
                return;
            const variables = this.buildTemplateVariables(appointment);
            const dedupeKey = `${appointment.id}:APPOINTMENT_CANCELLED:${Date.now()}`;
            await this.createNotificationIdempotent({
                salonId: appointment.salonId,
                appointmentId: appointment.id,
                recipientPhone: this.formatPhone(appointment.clientPhone),
                recipientName: appointment.clientName,
                notificationType: 'APPOINTMENT_CANCELLED',
                templateKey: 'appointment_cancelled',
                templateVariables: variables,
                scheduledFor: new Date(),
                dedupeKey,
            });
            this.logger.log(`Notificação de cancelamento agendada para ${appointment.clientPhone}`);
        }
        /**
         * Agenda notificação de reagendamento
         */
        async scheduleAppointmentRescheduled(appointment, oldDate, oldTime) {
            if (!appointment.clientPhone)
                return;
            const variables = {
                ...this.buildTemplateVariables(appointment),
                dataAnterior: oldDate,
                horarioAnterior: oldTime,
            };
            const dedupeKey = `${appointment.id}:APPOINTMENT_RESCHEDULED:${Date.now()}`;
            await this.createNotificationIdempotent({
                salonId: appointment.salonId,
                appointmentId: appointment.id,
                recipientPhone: this.formatPhone(appointment.clientPhone),
                recipientName: appointment.clientName,
                notificationType: 'APPOINTMENT_RESCHEDULED',
                templateKey: 'appointment_rescheduled',
                templateVariables: variables,
                scheduledFor: new Date(),
                dedupeKey,
            });
            this.logger.log(`Notificação de reagendamento agendada para ${appointment.clientPhone}`);
        }
        /**
         * Agenda todas as notificações de um agendamento
         */
        async scheduleAllAppointmentNotifications(appointment, triageLink) {
            try {
                await this.scheduleAppointmentConfirmation(appointment, triageLink);
                await this.scheduleReminder24h(appointment, triageLink);
                await this.scheduleReminder1h30(appointment);
            }
            catch (error) {
                this.logger.error(`Erro ao agendar notificações para ${appointment.id}:`, error);
                // Degradação graciosa: não propaga erro
            }
        }
        /**
         * Cancela todas as notificações pendentes de um agendamento
         */
        async cancelAppointmentNotifications(appointmentId) {
            await this.db
                .update(schema_1.appointmentNotifications)
                .set({
                status: 'CANCELLED',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointmentNotifications.appointmentId, appointmentId), (0, drizzle_orm_1.inArray)(schema_1.appointmentNotifications.status, ['PENDING', 'SCHEDULED'])));
            this.logger.log(`Notificações canceladas para agendamento ${appointmentId}`);
        }
        // ==================== PROCESSAMENTO COM SKIP LOCKED ====================
        /**
         * Busca mensagens pendentes para processamento usando SKIP LOCKED
         * CONCORRÊNCIA SEGURA: Evita que múltiplos workers processem a mesma mensagem
         */
        async getPendingMessagesWithLock(limit = 20) {
            try {
                this.logger.log(`[getPendingMessagesWithLock] Iniciando busca (limit=${limit})`);
                // Usa transaction com FOR UPDATE SKIP LOCKED
                const result = await this.db.transaction(async (tx) => {
                    // 1. Seleciona mensagens pendentes com lock exclusivo
                    const messages = await tx.execute((0, drizzle_orm_1.sql) `
          SELECT *
          FROM appointment_notifications
          WHERE status IN ('PENDING', 'SCHEDULED')
            AND scheduled_for <= NOW()
            AND (processing_started_at IS NULL OR processing_started_at < NOW() - INTERVAL '5 minutes')
          ORDER BY scheduled_for ASC, created_at ASC
          LIMIT ${limit}
          FOR UPDATE SKIP LOCKED
        `);
                    // DEBUG: Log da estrutura retornada
                    this.logger.log(`[getPendingMessagesWithLock] Resultado bruto: ${JSON.stringify({
                        type: typeof messages,
                        isArray: Array.isArray(messages),
                        hasRows: !!messages?.rows,
                        rowsLength: messages?.rows?.length,
                        keys: messages ? Object.keys(messages) : [],
                        firstItem: Array.isArray(messages) ? messages[0] : messages?.rows?.[0],
                    })}`);
                    // Drizzle pode retornar como array direto ou como { rows: [] }
                    const rows = Array.isArray(messages) ? messages : (messages?.rows || []);
                    if (!rows || rows.length === 0) {
                        this.logger.log('[getPendingMessagesWithLock] Nenhuma mensagem encontrada após parse');
                        return [];
                    }
                    const messageIds = rows.map((m) => m.id);
                    this.logger.log(`[getPendingMessagesWithLock] Encontradas ${messageIds.length} mensagens: ${messageIds.join(', ')}`);
                    // 2. Marca como em processamento usando IN com sql.join
                    const idPlaceholders = drizzle_orm_1.sql.join(messageIds.map((id) => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `);
                    await tx.execute((0, drizzle_orm_1.sql) `
          UPDATE appointment_notifications
          SET
            status = 'SENDING',
            processing_started_at = NOW(),
            processing_worker_id = ${WORKER_ID}
          WHERE id IN (${idPlaceholders})
        `);
                    return rows;
                });
                // Garante que sempre retorna array
                const finalResult = result || [];
                this.logger.log(`[getPendingMessagesWithLock] Retornando ${finalResult.length} mensagens`);
                return finalResult;
            }
            catch (error) {
                this.logger.error(`[getPendingMessagesWithLock] ERRO: ${error.message || error}`);
                this.logger.error(`[getPendingMessagesWithLock] Stack: ${error.stack || 'N/A'}`);
                return []; // Degradação graciosa - retorna array vazio em caso de erro
            }
        }
        /**
         * Método legado para compatibilidade
         */
        async getPendingMessages(limit = 50) {
            return this.db
                .select()
                .from(schema_1.appointmentNotifications)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.appointmentNotifications.status, ['PENDING', 'SCHEDULED']), (0, drizzle_orm_1.lte)(schema_1.appointmentNotifications.scheduledFor, new Date())))
                .limit(limit);
        }
        /**
         * Atualiza status da mensagem após envio
         * COM RETRY e backoff exponencial
         */
        async updateMessageStatus(messageId, status, providerMessageId, error) {
            const updateData = {
                status,
                updatedAt: new Date(),
                lastAttemptAt: new Date(),
                processingStartedAt: null,
                processingWorkerId: null,
            };
            if (providerMessageId) {
                updateData.providerMessageId = providerMessageId;
            }
            if (status === 'SENT') {
                updateData.sentAt = new Date();
            }
            if (status === 'DELIVERED') {
                updateData.deliveredAt = new Date();
            }
            if (status === 'READ') {
                updateData.readAt = new Date();
            }
            if (error) {
                updateData.lastError = error;
            }
            await this.db
                .update(schema_1.appointmentNotifications)
                .set({
                ...updateData,
                attempts: (0, drizzle_orm_1.sql) `${schema_1.appointmentNotifications.attempts} + 1`,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.appointmentNotifications.id, messageId));
        }
        /**
         * Marca mensagem para retry com backoff exponencial
         */
        async scheduleRetry(messageId, currentAttempts, error) {
            // Backoff: 2^attempts minutos (1, 2, 4, 8, 16...)
            const backoffMinutes = Math.pow(2, currentAttempts);
            const nextAttempt = (0, date_fns_1.addMinutes)(new Date(), Math.min(backoffMinutes, 60));
            await this.db
                .update(schema_1.appointmentNotifications)
                .set({
                status: 'PENDING',
                scheduledFor: nextAttempt,
                lastError: error,
                lastAttemptAt: new Date(),
                processingStartedAt: null,
                processingWorkerId: null,
                attempts: (0, drizzle_orm_1.sql) `${schema_1.appointmentNotifications.attempts} + 1`,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.appointmentNotifications.id, messageId));
            this.logger.debug(`Retry agendado para ${(0, date_fns_1.format)(nextAttempt, 'HH:mm')} (tentativa ${currentAttempts + 1})`);
        }
        /**
         * ALFA.1: Agenda retry específico para QUOTA_EXCEEDED com backoff longo
         * Base 30 min + jitter ±10%, capped at 60 min
         */
        async scheduleQuotaRetry(messageId, currentAttempts, error) {
            // Base 30 minutos + jitter ±10% (27-33 min)
            const baseMinutes = 30;
            const jitter = baseMinutes * 0.1 * (Math.random() * 2 - 1); // -3 to +3 min
            const backoffMinutes = Math.min(baseMinutes + jitter, 60);
            const nextAttempt = (0, date_fns_1.addMinutes)(new Date(), backoffMinutes);
            await this.db
                .update(schema_1.appointmentNotifications)
                .set({
                status: 'PENDING',
                scheduledFor: nextAttempt,
                lastError: error,
                lastAttemptAt: new Date(),
                processingStartedAt: null,
                processingWorkerId: null,
                attempts: (0, drizzle_orm_1.sql) `${schema_1.appointmentNotifications.attempts} + 1`,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.appointmentNotifications.id, messageId));
            this.logger.log(`[Quota] Retry agendado para ${(0, date_fns_1.format)(nextAttempt, 'HH:mm')} (tentativa ${currentAttempts + 1}, delay=${Math.round(backoffMinutes)}min)`);
            return nextAttempt;
        }
        /**
         * Registra resposta do cliente
         */
        async registerClientResponse(appointmentId, response) {
            await this.db
                .update(schema_1.appointmentNotifications)
                .set({
                clientResponse: response.toUpperCase(),
                clientRespondedAt: new Date(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointmentNotifications.appointmentId, appointmentId), (0, drizzle_orm_1.eq)(schema_1.appointmentNotifications.notificationType, 'APPOINTMENT_CONFIRMATION')));
        }
        /**
         * Busca estatísticas de mensagens por salão
         */
        async getMessageStats(salonId) {
            const result = await this.db
                .select({
                status: schema_1.appointmentNotifications.status,
                count: (0, drizzle_orm_1.sql) `count(*)::int`,
            })
                .from(schema_1.appointmentNotifications)
                .where((0, drizzle_orm_1.eq)(schema_1.appointmentNotifications.salonId, salonId))
                .groupBy(schema_1.appointmentNotifications.status);
            return result.reduce((acc, row) => {
                acc[row.status.toLowerCase()] = row.count;
                return acc;
            }, {
                pending: 0,
                scheduled: 0,
                sending: 0,
                sent: 0,
                delivered: 0,
                read: 0,
                failed: 0,
                cancelled: 0,
            });
        }
        // ==================== UTILITÁRIOS PRIVADOS ====================
        /**
         * Cria notificação com idempotência
         * SEGURO: Se dedupeKey já existe, ignora silenciosamente
         */
        async createNotificationIdempotent(data) {
            try {
                const scheduledFor = data.scheduledFor || new Date();
                await this.db.insert(schema_1.appointmentNotifications).values({
                    ...data,
                    status: scheduledFor <= new Date() ? 'PENDING' : 'SCHEDULED',
                });
            }
            catch (error) {
                // Código 23505 = unique_violation (PostgreSQL)
                if (error.code === '23505' && error.constraint?.includes('dedupe')) {
                    this.logger.debug(`Notificação já existe: ${data.dedupeKey} (idempotente)`);
                    return; // Não é erro!
                }
                throw error;
            }
        }
        /**
         * Busca informações do salão (endereço e localização)
         */
        async getSalonInfo(salonId) {
            try {
                const [salon] = await this.db
                    .select({
                    address: schema_1.salons.address,
                    locationUrl: schema_1.salons.locationUrl,
                    wazeUrl: schema_1.salons.wazeUrl,
                })
                    .from(schema_1.salons)
                    .where((0, drizzle_orm_1.eq)(schema_1.salons.id, salonId))
                    .limit(1);
                return salon || {};
            }
            catch (error) {
                this.logger.warn(`Erro ao buscar dados do salão ${salonId}: ${error}`);
                return {};
            }
        }
        /**
         * Monta variáveis do template
         */
        buildTemplateVariables(appointment, salonInfo) {
            const dateFormatted = (0, date_fns_1.format)(new Date(appointment.date), "EEEE, dd 'de' MMMM", {
                locale: locale_1.ptBR,
            });
            // Gera Waze URL automaticamente se não existir mas tiver Google Maps URL
            let wazeUrl = salonInfo?.wazeUrl || '';
            if (!wazeUrl && salonInfo?.locationUrl) {
                wazeUrl = this.generateWazeUrlFromGoogleMaps(salonInfo.locationUrl);
            }
            return {
                nome: appointment.clientName || 'Cliente',
                data: dateFormatted,
                horario: appointment.time || appointment.startTime,
                servico: appointment.service || '',
                profissional: appointment.professionalName || '',
                endereco: salonInfo?.address || '',
                localizacao: salonInfo?.locationUrl || '',
                waze: wazeUrl,
            };
        }
        /**
         * Extrai coordenadas do Google Maps URL e gera Waze URL
         * Suporta formatos:
         * - https://maps.google.com/maps?q=-22.6641832,-50.4373021
         * - https://www.google.com/maps?q=-22.6641832,-50.4373021
         * - https://goo.gl/maps/... (não suportado, retorna vazio)
         */
        generateWazeUrlFromGoogleMaps(googleMapsUrl) {
            if (!googleMapsUrl)
                return '';
            try {
                // Regex para extrair coordenadas do formato ?q=lat,lng ou @lat,lng
                const patterns = [
                    /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // ?q=-22.664,-50.437
                    /@(-?\d+\.?\d*),(-?\d+\.?\d*)/, // @-22.664,-50.437
                    /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // ll=-22.664,-50.437
                ];
                for (const pattern of patterns) {
                    const match = googleMapsUrl.match(pattern);
                    if (match && match[1] && match[2]) {
                        const lat = match[1];
                        const lng = match[2];
                        return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
                    }
                }
                this.logger.debug(`Não foi possível extrair coordenadas de: ${googleMapsUrl}`);
                return '';
            }
            catch (error) {
                this.logger.warn(`Erro ao gerar Waze URL: ${error}`);
                return '';
            }
        }
        /**
         * Converte data + hora do agendamento em Date
         */
        parseAppointmentDateTime(appointment) {
            const dateStr = appointment.date;
            const timeStr = appointment.time || appointment.startTime;
            return new Date(`${dateStr}T${timeStr}:00`);
        }
        /**
         * Formata telefone para padrão internacional
         */
        formatPhone(phone) {
            let cleaned = phone.replace(/\D/g, '');
            if (cleaned.length <= 11) {
                cleaned = '55' + cleaned;
            }
            return cleaned;
        }
    };
    return ScheduledMessagesService = _classThis;
})();
exports.ScheduledMessagesService = ScheduledMessagesService;
//# sourceMappingURL=scheduled-messages.service.js.map