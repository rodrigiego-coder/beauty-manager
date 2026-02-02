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
exports.MessageSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema = __importStar(require("../../database/schema"));
/**
 * MessageSchedulerService
 * Handles scheduling and processing of automated messages
 */
let MessageSchedulerService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MessageSchedulerService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MessageSchedulerService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        whatsappService;
        smsService;
        logger = new common_1.Logger(MessageSchedulerService.name);
        constructor(whatsappService, smsService) {
            this.whatsappService = whatsappService;
            this.smsService = smsService;
        }
        /**
         * Agenda lembretes para um agendamento
         */
        async scheduleAppointmentReminders(appointmentId, salonId, clientId, scheduledDate, scheduledTime) {
            const settings = await this.getSettings(salonId);
            if (!settings || !settings.reminderEnabled)
                return;
            // Busca template de lembrete
            const template = await connection_1.db.query.messageTemplates.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.messageTemplates.salonId, salonId), (0, drizzle_orm_1.eq)(schema.messageTemplates.type, 'APPOINTMENT_REMINDER'), (0, drizzle_orm_1.eq)(schema.messageTemplates.isActive, true)),
            });
            if (!template)
                return;
            // Calcula horário de envio
            const appointmentDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
            const scheduledFor = new Date(appointmentDateTime);
            scheduledFor.setHours(scheduledFor.getHours() - settings.reminderHoursBefore);
            // Só agenda se a data de envio ainda não passou
            if (scheduledFor <= new Date())
                return;
            // Determina canal
            const channel = this.determineChannel(template.channel, settings);
            await connection_1.db.insert(schema.scheduledMessages).values({
                salonId,
                templateId: template.id,
                clientId,
                appointmentId,
                channel,
                scheduledFor,
            });
            this.logger.log(`Lembrete agendado para ${scheduledFor.toISOString()}`);
        }
        /**
         * Agenda pedido de confirmação
         */
        async scheduleConfirmationRequest(appointmentId, salonId, clientId, scheduledDate, scheduledTime) {
            const settings = await this.getSettings(salonId);
            if (!settings || !settings.confirmationEnabled)
                return;
            const template = await connection_1.db.query.messageTemplates.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.messageTemplates.salonId, salonId), (0, drizzle_orm_1.eq)(schema.messageTemplates.type, 'APPOINTMENT_CONFIRMATION'), (0, drizzle_orm_1.eq)(schema.messageTemplates.isActive, true)),
            });
            if (!template)
                return;
            const appointmentDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
            const scheduledFor = new Date(appointmentDateTime);
            scheduledFor.setHours(scheduledFor.getHours() - settings.confirmationHoursBefore);
            if (scheduledFor <= new Date())
                return;
            const channel = this.determineChannel(template.channel, settings);
            await connection_1.db.insert(schema.scheduledMessages).values({
                salonId,
                templateId: template.id,
                clientId,
                appointmentId,
                channel,
                scheduledFor,
            });
            this.logger.log(`Confirmação agendada para ${scheduledFor.toISOString()}`);
        }
        /**
         * Agenda mensagens de aniversário do dia
         */
        async scheduleBirthdayMessages() {
            const today = new Date();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            // Busca clientes aniversariantes
            const birthdayClients = await connection_1.db.query.clients.findMany({
                where: (0, drizzle_orm_1.sql) `TO_CHAR(${schema.clients.birthDate}, 'MM-DD') = ${`${month}-${day}`}`,
            });
            this.logger.log(`Encontrados ${birthdayClients.length} aniversariantes`);
            let scheduled = 0;
            for (const client of birthdayClients) {
                if (!client.salonId)
                    continue;
                const settings = await this.getSettings(client.salonId);
                if (!settings || !settings.birthdayEnabled)
                    continue;
                const template = await connection_1.db.query.messageTemplates.findFirst({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.messageTemplates.salonId, client.salonId), (0, drizzle_orm_1.eq)(schema.messageTemplates.type, 'BIRTHDAY'), (0, drizzle_orm_1.eq)(schema.messageTemplates.isActive, true)),
                });
                if (!template)
                    continue;
                // Verifica se já não foi agendada hoje
                const existing = await connection_1.db.query.scheduledMessages.findFirst({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.scheduledMessages.clientId, client.id), (0, drizzle_orm_1.eq)(schema.scheduledMessages.templateId, template.id), (0, drizzle_orm_1.gte)(schema.scheduledMessages.scheduledFor, new Date(today.setHours(0, 0, 0, 0)))),
                });
                if (existing)
                    continue;
                // Agenda para o horário configurado
                const [hours, minutes] = settings.birthdayTime.split(':').map(Number);
                const scheduledFor = new Date();
                scheduledFor.setHours(hours, minutes, 0, 0);
                // Se o horário já passou hoje, não agenda
                if (scheduledFor <= new Date())
                    continue;
                const channel = this.determineChannel(template.channel, settings);
                await connection_1.db.insert(schema.scheduledMessages).values({
                    salonId: client.salonId,
                    templateId: template.id,
                    clientId: client.id,
                    channel,
                    scheduledFor,
                });
                scheduled++;
            }
            return scheduled;
        }
        /**
         * Processa mensagens agendadas pendentes
         */
        async processScheduledMessages() {
            const now = new Date();
            const pendingMessages = await connection_1.db.query.scheduledMessages.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.scheduledMessages.status, 'PENDING'), (0, drizzle_orm_1.lte)(schema.scheduledMessages.scheduledFor, now)),
                limit: 50,
            });
            let sent = 0;
            let failed = 0;
            for (const scheduled of pendingMessages) {
                try {
                    // Busca dados necessários
                    const [template, client, appointment, salon] = await Promise.all([
                        connection_1.db.query.messageTemplates.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema.messageTemplates.id, scheduled.templateId),
                        }),
                        connection_1.db.query.clients.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema.clients.id, scheduled.clientId),
                        }),
                        scheduled.appointmentId
                            ? connection_1.db.query.appointments.findFirst({
                                where: (0, drizzle_orm_1.eq)(schema.appointments.id, scheduled.appointmentId),
                            })
                            : null,
                        connection_1.db.query.salons.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema.salons.id, scheduled.salonId),
                        }),
                    ]);
                    if (!template || !client || !client.phone) {
                        await this.markAsFailed(scheduled.id, 'Dados incompletos');
                        failed++;
                        continue;
                    }
                    // Monta variáveis
                    const variables = {
                        nome: client.name || undefined,
                        salonNome: salon?.name || undefined,
                        salonTelefone: salon?.phone || undefined,
                    };
                    if (appointment) {
                        variables.data = appointment.date;
                        variables.horario = appointment.time;
                        // Busca serviço e profissional
                        const [service, professional] = await Promise.all([
                            appointment.serviceId
                                ? connection_1.db.query.services.findFirst({
                                    where: (0, drizzle_orm_1.eq)(schema.services.id, appointment.serviceId),
                                })
                                : null,
                            appointment.professionalId
                                ? connection_1.db.query.users.findFirst({
                                    where: (0, drizzle_orm_1.eq)(schema.users.id, appointment.professionalId),
                                })
                                : null,
                        ]);
                        variables.servico = service?.name;
                        variables.profissional = professional?.name;
                    }
                    // Substitui variáveis no conteúdo
                    const content = this.replaceVariables(template.content, variables);
                    // Envia mensagem
                    const result = await this.sendMessage(scheduled.salonId, client.phone, content, scheduled.channel);
                    if (result.success) {
                        // Registra log
                        await connection_1.db.insert(schema.messageLogs).values({
                            salonId: scheduled.salonId,
                            templateId: template.id,
                            clientId: client.id,
                            appointmentId: scheduled.appointmentId,
                            channel: scheduled.channel,
                            phoneNumber: client.phone,
                            content,
                            status: 'SENT',
                            externalId: result.messageId,
                            sentAt: new Date(),
                        });
                        // Marca como enviada
                        await connection_1.db
                            .update(schema.scheduledMessages)
                            .set({ status: 'SENT' })
                            .where((0, drizzle_orm_1.eq)(schema.scheduledMessages.id, scheduled.id));
                        sent++;
                    }
                    else {
                        await this.markAsFailed(scheduled.id, result.error || 'Erro desconhecido');
                        await connection_1.db.insert(schema.messageLogs).values({
                            salonId: scheduled.salonId,
                            templateId: template.id,
                            clientId: client.id,
                            appointmentId: scheduled.appointmentId,
                            channel: scheduled.channel,
                            phoneNumber: client.phone,
                            content,
                            status: 'FAILED',
                            errorMessage: result.error,
                        });
                        failed++;
                    }
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                    await this.markAsFailed(scheduled.id, errorMessage);
                    failed++;
                }
            }
            return { processed: pendingMessages.length, sent, failed };
        }
        /**
         * Cancela mensagens de um agendamento
         */
        async cancelScheduledMessages(appointmentId, reason) {
            const result = await connection_1.db
                .update(schema.scheduledMessages)
                .set({
                status: 'CANCELLED',
                cancelledReason: reason || 'Agendamento cancelado',
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.scheduledMessages.appointmentId, appointmentId), (0, drizzle_orm_1.eq)(schema.scheduledMessages.status, 'PENDING')));
            return result.rowCount || 0;
        }
        /**
         * Envia mensagem de boas-vindas para novo cliente
         */
        async sendWelcomeMessage(salonId, clientId) {
            const settings = await this.getSettings(salonId);
            if (!settings)
                return;
            const template = await connection_1.db.query.messageTemplates.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.messageTemplates.salonId, salonId), (0, drizzle_orm_1.eq)(schema.messageTemplates.type, 'WELCOME'), (0, drizzle_orm_1.eq)(schema.messageTemplates.isActive, true)),
            });
            if (!template)
                return;
            const [client, salon] = await Promise.all([
                connection_1.db.query.clients.findFirst({ where: (0, drizzle_orm_1.eq)(schema.clients.id, clientId) }),
                connection_1.db.query.salons.findFirst({ where: (0, drizzle_orm_1.eq)(schema.salons.id, salonId) }),
            ]);
            if (!client || !client.phone)
                return;
            const content = this.replaceVariables(template.content, {
                nome: client.name || undefined,
                salonNome: salon?.name || undefined,
                salonTelefone: salon?.phone || undefined,
            });
            const channel = this.determineChannel(template.channel, settings);
            const result = await this.sendMessage(salonId, client.phone, content, channel);
            await connection_1.db.insert(schema.messageLogs).values({
                salonId,
                templateId: template.id,
                clientId,
                channel,
                phoneNumber: client.phone,
                content,
                status: result.success ? 'SENT' : 'FAILED',
                externalId: result.messageId,
                errorMessage: result.error,
                sentAt: result.success ? new Date() : null,
            });
        }
        // ==================== PRIVATE METHODS ====================
        async getSettings(salonId) {
            return connection_1.db.query.automationSettings.findFirst({
                where: (0, drizzle_orm_1.eq)(schema.automationSettings.salonId, salonId),
            });
        }
        determineChannel(templateChannel, settings) {
            if (templateChannel === 'WHATSAPP' && settings.whatsappEnabled) {
                return 'WHATSAPP';
            }
            if (templateChannel === 'SMS' && settings.smsEnabled) {
                return 'SMS';
            }
            if (templateChannel === 'BOTH') {
                if (settings.whatsappEnabled)
                    return 'WHATSAPP';
                if (settings.smsEnabled)
                    return 'SMS';
            }
            return 'WHATSAPP';
        }
        async sendMessage(salonId, phone, content, channel) {
            if (channel === 'WHATSAPP' || channel === 'BOTH') {
                const result = await this.whatsappService.sendMessage(salonId, phone, content);
                if (result.success)
                    return result;
                // Fallback para SMS se WhatsApp falhar e canal for BOTH
                if (channel === 'BOTH') {
                    return this.smsService.sendSMS(salonId, phone, content);
                }
                return result;
            }
            return this.smsService.sendSMS(salonId, phone, content);
        }
        replaceVariables(template, variables) {
            let result = template;
            Object.entries(variables).forEach(([key, value]) => {
                if (value) {
                    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
                }
            });
            // Remove variáveis não substituídas
            result = result.replace(/\{\{[^}]+\}\}/g, '');
            return result.trim();
        }
        async markAsFailed(id, reason) {
            await connection_1.db
                .update(schema.scheduledMessages)
                .set({
                status: 'CANCELLED',
                cancelledReason: `Falha: ${reason}`,
            })
                .where((0, drizzle_orm_1.eq)(schema.scheduledMessages.id, id));
        }
    };
    return MessageSchedulerService = _classThis;
})();
exports.MessageSchedulerService = MessageSchedulerService;
//# sourceMappingURL=message-scheduler.service.js.map