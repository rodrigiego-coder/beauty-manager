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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
exports.AutomationJobs = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const is_jest_1 = require("../../common/is-jest");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema = __importStar(require("../../database/schema"));
/**
 * AutomationJobs
 * CRON jobs para processamento de mensagens automáticas
 */
let AutomationJobs = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _processScheduledMessages_decorators;
    let _scheduleBirthdayMessages_decorators;
    let _cleanupOldLogs_decorators;
    let _retryFailedMessages_decorators;
    let _generateWeeklyReport_decorators;
    var AutomationJobs = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _processScheduledMessages_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES, { disabled: is_jest_1.IS_JEST })];
            _scheduleBirthdayMessages_decorators = [(0, schedule_1.Cron)('0 6 * * *', { disabled: is_jest_1.IS_JEST })];
            _cleanupOldLogs_decorators = [(0, schedule_1.Cron)('0 3 1 * *', { disabled: is_jest_1.IS_JEST })];
            _retryFailedMessages_decorators = [(0, schedule_1.Cron)('0 9 * * *', { disabled: is_jest_1.IS_JEST })];
            _generateWeeklyReport_decorators = [(0, schedule_1.Cron)('0 8 * * 1', { disabled: is_jest_1.IS_JEST })];
            __esDecorate(this, null, _processScheduledMessages_decorators, { kind: "method", name: "processScheduledMessages", static: false, private: false, access: { has: obj => "processScheduledMessages" in obj, get: obj => obj.processScheduledMessages }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _scheduleBirthdayMessages_decorators, { kind: "method", name: "scheduleBirthdayMessages", static: false, private: false, access: { has: obj => "scheduleBirthdayMessages" in obj, get: obj => obj.scheduleBirthdayMessages }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cleanupOldLogs_decorators, { kind: "method", name: "cleanupOldLogs", static: false, private: false, access: { has: obj => "cleanupOldLogs" in obj, get: obj => obj.cleanupOldLogs }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _retryFailedMessages_decorators, { kind: "method", name: "retryFailedMessages", static: false, private: false, access: { has: obj => "retryFailedMessages" in obj, get: obj => obj.retryFailedMessages }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _generateWeeklyReport_decorators, { kind: "method", name: "generateWeeklyReport", static: false, private: false, access: { has: obj => "generateWeeklyReport" in obj, get: obj => obj.generateWeeklyReport }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AutomationJobs = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        schedulerService = __runInitializers(this, _instanceExtraInitializers);
        logger = new common_1.Logger(AutomationJobs.name);
        constructor(schedulerService) {
            this.schedulerService = schedulerService;
        }
        /**
         * Processa mensagens agendadas a cada 5 minutos
         * NOTA: Este job processa a tabela scheduled_messages (sistema legado de templates)
         * Para notificações de agendamento, use ScheduledMessagesProcessor que processa appointment_notifications
         */
        async processScheduledMessages() {
            this.logger.debug('[scheduled_messages] Processando mensagens do sistema legado...');
            try {
                const result = await this.schedulerService.processScheduledMessages();
                // Só loga se processou algo
                if (result.processed > 0) {
                    this.logger.log(`[scheduled_messages] Processadas: ${result.processed}, enviadas: ${result.sent}, falhas: ${result.failed}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.logger.error(`[scheduled_messages] Erro: ${errorMessage}`);
            }
        }
        /**
         * Agenda mensagens de aniversário diariamente às 06:00
         */
        async scheduleBirthdayMessages() {
            this.logger.log('Agendando mensagens de aniversário...');
            try {
                const count = await this.schedulerService.scheduleBirthdayMessages();
                this.logger.log(`${count} mensagens de aniversário agendadas`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.logger.error(`Erro ao agendar aniversários: ${errorMessage}`);
            }
        }
        /**
         * Limpa logs antigos mensalmente (primeiro dia às 03:00)
         */
        async cleanupOldLogs() {
            this.logger.log('Limpando logs de mensagens antigos...');
            try {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                // Remove logs com mais de 30 dias
                await connection_1.db
                    .delete(schema.messageLogs)
                    .where((0, drizzle_orm_1.lte)(schema.messageLogs.createdAt, thirtyDaysAgo));
                this.logger.log(`Logs antigos removidos com sucesso`);
                // Remove mensagens agendadas processadas com mais de 7 dias
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                await connection_1.db
                    .delete(schema.scheduledMessages)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.lte)(schema.scheduledMessages.createdAt, sevenDaysAgo), (0, drizzle_orm_1.sql) `${schema.scheduledMessages.status} != 'PENDING'`));
                this.logger.log(`Mensagens agendadas antigas removidas com sucesso`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.logger.error(`Erro ao limpar logs: ${errorMessage}`);
            }
        }
        /**
         * Verifica e reagenda mensagens falhas às 09:00
         */
        async retryFailedMessages() {
            this.logger.log('Verificando mensagens falhas para reenvio...');
            try {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                // Busca mensagens falhas das últimas 24h
                const failedMessages = await connection_1.db.query.messageLogs.findMany({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.messageLogs.status, 'FAILED'), (0, drizzle_orm_1.gte)(schema.messageLogs.createdAt, yesterday)),
                    limit: 50,
                });
                this.logger.log(`${failedMessages.length} mensagens falhas encontradas`);
                // Para cada mensagem falha, cria uma nova tentativa
                let retried = 0;
                for (const log of failedMessages) {
                    // Verifica se não é uma mensagem de teste ou manual
                    if (!log.templateId || !log.clientId)
                        continue;
                    // Verifica se não existe retry pendente
                    const existing = await connection_1.db.query.scheduledMessages.findFirst({
                        where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.scheduledMessages.clientId, log.clientId), (0, drizzle_orm_1.eq)(schema.scheduledMessages.templateId, log.templateId), (0, drizzle_orm_1.eq)(schema.scheduledMessages.status, 'PENDING')),
                    });
                    if (existing)
                        continue;
                    // Agenda reenvio para daqui 1 hora
                    const scheduledFor = new Date();
                    scheduledFor.setHours(scheduledFor.getHours() + 1);
                    await connection_1.db.insert(schema.scheduledMessages).values({
                        salonId: log.salonId,
                        templateId: log.templateId,
                        clientId: log.clientId,
                        appointmentId: log.appointmentId,
                        channel: log.channel,
                        scheduledFor,
                    });
                    retried++;
                }
                this.logger.log(`${retried} mensagens reagendadas para reenvio`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.logger.error(`Erro ao reagendar mensagens: ${errorMessage}`);
            }
        }
        /**
         * Gera relatório semanal de automação (Segunda às 08:00)
         */
        async generateWeeklyReport() {
            this.logger.log('Gerando relatório semanal de automação...');
            try {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                // Busca estatísticas da semana por salão
                const salons = await connection_1.db.query.salons.findMany();
                for (const salon of salons) {
                    const logs = await connection_1.db.query.messageLogs.findMany({
                        where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.messageLogs.salonId, salon.id), (0, drizzle_orm_1.gte)(schema.messageLogs.createdAt, weekAgo)),
                    });
                    if (logs.length === 0)
                        continue;
                    const sent = logs.filter((l) => l.status === 'SENT' || l.status === 'DELIVERED' || l.status === 'READ').length;
                    const delivered = logs.filter((l) => l.status === 'DELIVERED' || l.status === 'READ').length;
                    const failed = logs.filter((l) => l.status === 'FAILED').length;
                    this.logger.log(`Salão ${salon.name}: ${sent} enviadas, ${delivered} entregues, ${failed} falhas`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.logger.error(`Erro ao gerar relatório: ${errorMessage}`);
            }
        }
    };
    return AutomationJobs = _classThis;
})();
exports.AutomationJobs = AutomationJobs;
//# sourceMappingURL=automation.jobs.js.map