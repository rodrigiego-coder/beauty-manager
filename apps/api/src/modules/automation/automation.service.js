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
exports.AutomationService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema = __importStar(require("../../database/schema"));
/**
 * AutomationService
 * Main service for automation settings and template management
 */
let AutomationService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AutomationService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AutomationService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        whatsappService;
        smsService;
        logger = new common_1.Logger(AutomationService.name);
        constructor(whatsappService, smsService) {
            this.whatsappService = whatsappService;
            this.smsService = smsService;
        }
        // ==================== SETTINGS ====================
        /**
         * Retorna configurações de automação do salão
         */
        async getSettings(salonId) {
            let settings = await connection_1.db.query.automationSettings.findFirst({
                where: (0, drizzle_orm_1.eq)(schema.automationSettings.salonId, salonId),
            });
            if (!settings) {
                // Cria configurações padrão
                const result = await connection_1.db
                    .insert(schema.automationSettings)
                    .values({ salonId })
                    .returning();
                settings = result[0];
            }
            // Testa conexões
            const [whatsappConnection, smsConnection, smsBalance] = await Promise.all([
                settings.whatsappEnabled
                    ? this.whatsappService.testConnection(salonId)
                    : { connected: false },
                settings.smsEnabled ? this.smsService.testConnection(salonId) : { connected: false },
                settings.smsEnabled ? this.smsService.getBalance(salonId) : null,
            ]);
            return {
                id: settings.id,
                salonId: settings.salonId,
                whatsappEnabled: settings.whatsappEnabled,
                whatsappProvider: settings.whatsappProvider,
                whatsappConnected: whatsappConnection.connected,
                smsEnabled: settings.smsEnabled,
                smsProvider: settings.smsProvider,
                smsConnected: smsConnection.connected,
                smsBalance: smsBalance?.balance,
                reminderEnabled: settings.reminderEnabled,
                reminderHoursBefore: settings.reminderHoursBefore,
                confirmationEnabled: settings.confirmationEnabled,
                confirmationHoursBefore: settings.confirmationHoursBefore,
                birthdayEnabled: settings.birthdayEnabled,
                birthdayTime: settings.birthdayTime,
                birthdayDiscountPercent: settings.birthdayDiscountPercent ?? undefined,
                reviewRequestEnabled: settings.reviewRequestEnabled,
                reviewRequestHoursAfter: settings.reviewRequestHoursAfter,
            };
        }
        /**
         * Atualiza configurações de automação
         */
        async updateSettings(salonId, dto) {
            const existing = await connection_1.db.query.automationSettings.findFirst({
                where: (0, drizzle_orm_1.eq)(schema.automationSettings.salonId, salonId),
            });
            if (existing) {
                await connection_1.db
                    .update(schema.automationSettings)
                    .set({ ...dto, updatedAt: new Date() })
                    .where((0, drizzle_orm_1.eq)(schema.automationSettings.salonId, salonId));
            }
            else {
                await connection_1.db.insert(schema.automationSettings).values({ salonId, ...dto });
            }
            return this.getSettings(salonId);
        }
        // ==================== TEMPLATES ====================
        /**
         * Lista templates do salão
         */
        async getTemplates(salonId) {
            return connection_1.db.query.messageTemplates.findMany({
                where: (0, drizzle_orm_1.eq)(schema.messageTemplates.salonId, salonId),
                orderBy: [(0, drizzle_orm_1.desc)(schema.messageTemplates.createdAt)],
            });
        }
        /**
         * Busca template por ID
         */
        async getTemplateById(id, salonId) {
            const template = await connection_1.db.query.messageTemplates.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.messageTemplates.id, id), (0, drizzle_orm_1.eq)(schema.messageTemplates.salonId, salonId)),
            });
            if (!template) {
                throw new common_1.NotFoundException('Template não encontrado.');
            }
            return template;
        }
        /**
         * Cria novo template
         */
        async createTemplate(salonId, dto) {
            // Se for default, desativa outros defaults do mesmo tipo
            if (dto.isDefault) {
                await connection_1.db
                    .update(schema.messageTemplates)
                    .set({ isDefault: false })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.messageTemplates.salonId, salonId), (0, drizzle_orm_1.eq)(schema.messageTemplates.type, dto.type)));
            }
            const result = await connection_1.db
                .insert(schema.messageTemplates)
                .values({
                salonId,
                ...dto,
            })
                .returning();
            this.logger.log(`Template criado: ${result[0].id}`);
            return result[0];
        }
        /**
         * Atualiza template
         */
        async updateTemplate(id, salonId, dto) {
            const template = await this.getTemplateById(id, salonId);
            // Se tornando default, desativa outros
            if (dto.isDefault && !template.isDefault) {
                const type = dto.type || template.type;
                await connection_1.db
                    .update(schema.messageTemplates)
                    .set({ isDefault: false })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.messageTemplates.salonId, salonId), (0, drizzle_orm_1.eq)(schema.messageTemplates.type, type)));
            }
            const result = await connection_1.db
                .update(schema.messageTemplates)
                .set({ ...dto, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema.messageTemplates.id, id))
                .returning();
            return result[0];
        }
        /**
         * Remove template
         */
        async deleteTemplate(id, salonId) {
            // Verifica se o template existe
            await this.getTemplateById(id, salonId);
            // Verifica se tem mensagens agendadas
            const scheduled = await connection_1.db.query.scheduledMessages.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.scheduledMessages.templateId, id), (0, drizzle_orm_1.eq)(schema.scheduledMessages.status, 'PENDING')),
            });
            if (scheduled) {
                throw new common_1.BadRequestException('Não é possível excluir template com mensagens agendadas pendentes.');
            }
            await connection_1.db
                .delete(schema.messageTemplates)
                .where((0, drizzle_orm_1.eq)(schema.messageTemplates.id, id));
            this.logger.log(`Template excluído: ${id}`);
        }
        /**
         * Cria templates padrão para o salão
         */
        async createDefaultTemplates(salonId) {
            const defaultTemplates = [
                {
                    name: 'Lembrete de Agendamento',
                    type: 'APPOINTMENT_REMINDER',
                    channel: 'WHATSAPP',
                    content: 'Olá {{nome}}! Lembrete: você tem um agendamento amanhã, dia {{data}} às {{horario}} para {{servico}} com {{profissional}}. Confirme sua presença! {{salonNome}}',
                    isDefault: true,
                    triggerHoursBefore: 24,
                },
                {
                    name: 'Confirmação de Presença',
                    type: 'APPOINTMENT_CONFIRMATION',
                    channel: 'WHATSAPP',
                    content: 'Olá {{nome}}! Confirme sua presença para o dia {{data}} às {{horario}}. Responda SIM para confirmar ou NÃO para cancelar. {{salonNome}}',
                    isDefault: true,
                    triggerHoursBefore: 48,
                },
                {
                    name: 'Aniversário',
                    type: 'BIRTHDAY',
                    channel: 'WHATSAPP',
                    content: 'Feliz aniversário, {{nome}}! A equipe do {{salonNome}} deseja um dia incrível! Venha nos visitar e ganhe um desconto especial!',
                    isDefault: true,
                },
                {
                    name: 'Boas-vindas',
                    type: 'WELCOME',
                    channel: 'WHATSAPP',
                    content: 'Olá {{nome}}! Seja bem-vindo(a) ao {{salonNome}}! Estamos felizes em ter você conosco. Agende seu próximo horário pelo nosso app ou ligue: {{salonTelefone}}',
                    isDefault: true,
                },
                {
                    name: 'Avaliação',
                    type: 'REVIEW_REQUEST',
                    channel: 'WHATSAPP',
                    content: 'Olá {{nome}}! Como foi sua experiência conosco? Sua opinião é muito importante! Deixe sua avaliação: {{linkConfirmacao}}',
                    isDefault: true,
                },
            ];
            for (const template of defaultTemplates) {
                const existing = await connection_1.db.query.messageTemplates.findFirst({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.messageTemplates.salonId, salonId), (0, drizzle_orm_1.eq)(schema.messageTemplates.type, template.type)),
                });
                if (!existing) {
                    await connection_1.db.insert(schema.messageTemplates).values({ salonId, ...template });
                }
            }
        }
        // ==================== MESSAGES ====================
        /**
         * Envia mensagem manual
         */
        async sendMessage(salonId, dto) {
            const settings = await connection_1.db.query.automationSettings.findFirst({
                where: (0, drizzle_orm_1.eq)(schema.automationSettings.salonId, salonId),
            });
            if (!settings) {
                throw new common_1.BadRequestException('Automação não configurada.');
            }
            // Valida template se informado
            if (dto.templateId) {
                await this.getTemplateById(dto.templateId, salonId);
            }
            // Envia mensagem
            let result;
            if (dto.channel === 'WHATSAPP' || dto.channel === 'BOTH') {
                result = await this.whatsappService.sendMessage(salonId, dto.phoneNumber, dto.content);
                if (!result.success && dto.channel === 'BOTH') {
                    result = await this.smsService.sendSMS(salonId, dto.phoneNumber, dto.content);
                }
            }
            else {
                result = await this.smsService.sendSMS(salonId, dto.phoneNumber, dto.content);
            }
            // Registra log
            const [log] = await connection_1.db
                .insert(schema.messageLogs)
                .values({
                salonId,
                templateId: dto.templateId,
                clientId: dto.clientId,
                appointmentId: dto.appointmentId,
                channel: dto.channel === 'BOTH' ? (result.success ? 'WHATSAPP' : 'SMS') : dto.channel,
                phoneNumber: dto.phoneNumber,
                content: dto.content,
                status: result.success ? 'SENT' : 'FAILED',
                externalId: result.messageId,
                errorMessage: result.error,
                sentAt: result.success ? new Date() : null,
                cost: result.cost?.toString(),
            })
                .returning();
            return log;
        }
        /**
         * Envia mensagem de teste
         */
        async sendTestMessage(salonId, channel, phoneNumber) {
            const testContent = 'Esta é uma mensagem de teste do Beauty Manager. Se você recebeu esta mensagem, a configuração está correta!';
            if (channel === 'WHATSAPP') {
                return this.whatsappService.sendMessage(salonId, phoneNumber, testContent);
            }
            return this.smsService.sendSMS(salonId, phoneNumber, testContent);
        }
        // ==================== LOGS & STATS ====================
        /**
         * Lista histórico de mensagens
         */
        async getMessageLogs(salonId, filters) {
            const conditions = [(0, drizzle_orm_1.eq)(schema.messageLogs.salonId, salonId)];
            if (filters.status) {
                conditions.push((0, drizzle_orm_1.eq)(schema.messageLogs.status, filters.status));
            }
            if (filters.channel) {
                conditions.push((0, drizzle_orm_1.eq)(schema.messageLogs.channel, filters.channel));
            }
            if (filters.clientId) {
                conditions.push((0, drizzle_orm_1.eq)(schema.messageLogs.clientId, filters.clientId));
            }
            if (filters.startDate) {
                conditions.push((0, drizzle_orm_1.gte)(schema.messageLogs.createdAt, new Date(filters.startDate)));
            }
            if (filters.endDate) {
                conditions.push((0, drizzle_orm_1.lte)(schema.messageLogs.createdAt, new Date(filters.endDate)));
            }
            const [logs, countResult] = await Promise.all([
                connection_1.db.query.messageLogs.findMany({
                    where: (0, drizzle_orm_1.and)(...conditions),
                    orderBy: [(0, drizzle_orm_1.desc)(schema.messageLogs.createdAt)],
                    limit: filters.limit || 50,
                    offset: filters.offset || 0,
                }),
                connection_1.db
                    .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                    .from(schema.messageLogs)
                    .where((0, drizzle_orm_1.and)(...conditions)),
            ]);
            return {
                logs,
                total: countResult[0]?.count || 0,
            };
        }
        /**
         * Retorna estatísticas de mensagens
         */
        async getStats(salonId, days = 30) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const logs = await connection_1.db.query.messageLogs.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.messageLogs.salonId, salonId), (0, drizzle_orm_1.gte)(schema.messageLogs.createdAt, startDate)),
            });
            const stats = {
                totalSent: 0,
                totalDelivered: 0,
                totalRead: 0,
                totalFailed: 0,
                deliveryRate: 0,
                readRate: 0,
                totalCost: 0,
                byChannel: {
                    whatsapp: { sent: 0, delivered: 0, read: 0, failed: 0 },
                    sms: { sent: 0, delivered: 0, cost: 0, failed: 0 },
                },
                byType: {
                    reminder: 0,
                    confirmation: 0,
                    birthday: 0,
                    custom: 0,
                },
            };
            for (const log of logs) {
                if (log.status === 'SENT' || log.status === 'DELIVERED' || log.status === 'READ') {
                    stats.totalSent++;
                    if (log.channel === 'WHATSAPP') {
                        stats.byChannel.whatsapp.sent++;
                    }
                    else {
                        stats.byChannel.sms.sent++;
                    }
                }
                if (log.status === 'DELIVERED' || log.status === 'READ') {
                    stats.totalDelivered++;
                    if (log.channel === 'WHATSAPP') {
                        stats.byChannel.whatsapp.delivered++;
                    }
                    else {
                        stats.byChannel.sms.delivered++;
                    }
                }
                if (log.status === 'READ') {
                    stats.totalRead++;
                    if (log.channel === 'WHATSAPP') {
                        stats.byChannel.whatsapp.read++;
                    }
                }
                if (log.status === 'FAILED') {
                    stats.totalFailed++;
                    if (log.channel === 'WHATSAPP') {
                        stats.byChannel.whatsapp.failed++;
                    }
                    else {
                        stats.byChannel.sms.failed++;
                    }
                }
                if (log.cost) {
                    const cost = parseFloat(log.cost);
                    stats.totalCost += cost;
                    if (log.channel === 'SMS') {
                        stats.byChannel.sms.cost += cost;
                    }
                }
            }
            // Calcula taxas
            if (stats.totalSent > 0) {
                stats.deliveryRate = (stats.totalDelivered / stats.totalSent) * 100;
                stats.readRate = (stats.totalRead / stats.totalSent) * 100;
            }
            // Busca contagem por tipo de template
            const templateIds = [...new Set(logs.filter((l) => l.templateId).map((l) => l.templateId))];
            for (const templateId of templateIds) {
                const template = await connection_1.db.query.messageTemplates.findFirst({
                    where: (0, drizzle_orm_1.eq)(schema.messageTemplates.id, templateId),
                });
                if (template) {
                    const count = logs.filter((l) => l.templateId === templateId).length;
                    switch (template.type) {
                        case 'APPOINTMENT_REMINDER':
                            stats.byType.reminder += count;
                            break;
                        case 'APPOINTMENT_CONFIRMATION':
                            stats.byType.confirmation += count;
                            break;
                        case 'BIRTHDAY':
                            stats.byType.birthday += count;
                            break;
                        default:
                            stats.byType.custom += count;
                    }
                }
            }
            return stats;
        }
        // ==================== WEBHOOKS ====================
        /**
         * Processa webhook do WhatsApp
         */
        async processWhatsAppWebhook(body) {
            const statuses = body.entry?.[0]?.changes?.[0]?.value?.statuses;
            if (!statuses)
                return;
            for (const status of statuses) {
                const log = await connection_1.db.query.messageLogs.findFirst({
                    where: (0, drizzle_orm_1.eq)(schema.messageLogs.externalId, status.id),
                });
                if (!log)
                    continue;
                const updates = {};
                const timestamp = new Date(parseInt(status.timestamp) * 1000);
                switch (status.status) {
                    case 'sent':
                        updates.status = 'SENT';
                        updates.sentAt = timestamp;
                        break;
                    case 'delivered':
                        updates.status = 'DELIVERED';
                        updates.deliveredAt = timestamp;
                        break;
                    case 'read':
                        updates.status = 'READ';
                        updates.readAt = timestamp;
                        break;
                    case 'failed':
                        updates.status = 'FAILED';
                        break;
                }
                if (Object.keys(updates).length > 0) {
                    await connection_1.db
                        .update(schema.messageLogs)
                        .set(updates)
                        .where((0, drizzle_orm_1.eq)(schema.messageLogs.id, log.id));
                }
            }
        }
        /**
         * Processa webhook do Twilio
         */
        async processTwilioWebhook(body) {
            if (!body.MessageSid || !body.MessageStatus)
                return;
            const log = await connection_1.db.query.messageLogs.findFirst({
                where: (0, drizzle_orm_1.eq)(schema.messageLogs.externalId, body.MessageSid),
            });
            if (!log)
                return;
            const statusMap = {
                queued: 'PENDING',
                sent: 'SENT',
                delivered: 'DELIVERED',
                failed: 'FAILED',
                undelivered: 'FAILED',
            };
            const newStatus = statusMap[body.MessageStatus.toLowerCase()];
            if (newStatus) {
                const updates = {
                    status: newStatus,
                };
                if (newStatus === 'DELIVERED') {
                    updates.deliveredAt = new Date();
                }
                await connection_1.db
                    .update(schema.messageLogs)
                    .set(updates)
                    .where((0, drizzle_orm_1.eq)(schema.messageLogs.id, log.id));
            }
        }
    };
    return AutomationService = _classThis;
})();
exports.AutomationService = AutomationService;
//# sourceMappingURL=automation.service.js.map