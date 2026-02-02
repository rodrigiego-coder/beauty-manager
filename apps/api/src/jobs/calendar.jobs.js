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
exports.CalendarSyncJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const is_jest_1 = require("../common/is-jest");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../database/connection");
const schema = __importStar(require("../database/schema"));
/**
 * CalendarSyncJob
 * Scheduled tasks for Google Calendar synchronization
 */
let CalendarSyncJob = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _incrementalSync_decorators;
    let _fullSync_decorators;
    let _cleanupOldLogs_decorators;
    let _checkExpiringTokens_decorators;
    var CalendarSyncJob = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _incrementalSync_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_MINUTES, { disabled: is_jest_1.IS_JEST })];
            _fullSync_decorators = [(0, schedule_1.Cron)('0 3 * * *', { disabled: is_jest_1.IS_JEST })];
            _cleanupOldLogs_decorators = [(0, schedule_1.Cron)('0 4 * * 0', { disabled: is_jest_1.IS_JEST })];
            _checkExpiringTokens_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR, { disabled: is_jest_1.IS_JEST })];
            __esDecorate(this, null, _incrementalSync_decorators, { kind: "method", name: "incrementalSync", static: false, private: false, access: { has: obj => "incrementalSync" in obj, get: obj => obj.incrementalSync }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _fullSync_decorators, { kind: "method", name: "fullSync", static: false, private: false, access: { has: obj => "fullSync" in obj, get: obj => obj.fullSync }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cleanupOldLogs_decorators, { kind: "method", name: "cleanupOldLogs", static: false, private: false, access: { has: obj => "cleanupOldLogs" in obj, get: obj => obj.cleanupOldLogs }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkExpiringTokens_decorators, { kind: "method", name: "checkExpiringTokens", static: false, private: false, access: { has: obj => "checkExpiringTokens" in obj, get: obj => obj.checkExpiringTokens }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CalendarSyncJob = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = (__runInitializers(this, _instanceExtraInitializers), new common_1.Logger(CalendarSyncJob.name));
        /**
         * Sincronização incremental a cada 15 minutos
         * Sincroniza todas as integrações ativas
         */
        async incrementalSync() {
            this.logger.log('Starting incremental calendar sync...');
            try {
                // Busca integrações ativas
                const integrations = await connection_1.db.query.googleIntegrations.findMany({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.googleIntegrations.syncEnabled, true), (0, drizzle_orm_1.eq)(schema.googleIntegrations.status, 'ACTIVE')),
                });
                this.logger.log(`Found ${integrations.length} active integrations to sync`);
                let successCount = 0;
                let errorCount = 0;
                for (const integration of integrations) {
                    try {
                        await this.syncIntegration(integration, 'INCREMENTAL');
                        successCount++;
                    }
                    catch (error) {
                        errorCount++;
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        this.logger.error(`Failed to sync integration ${integration.id}: ${errorMessage}`);
                        // Marca erro na integração
                        await connection_1.db
                            .update(schema.googleIntegrations)
                            .set({
                            status: 'ERROR',
                            errorMessage: errorMessage,
                            updatedAt: new Date(),
                        })
                            .where((0, drizzle_orm_1.eq)(schema.googleIntegrations.id, integration.id));
                    }
                }
                this.logger.log(`Incremental sync completed: ${successCount} success, ${errorCount} errors`);
            }
            catch (error) {
                this.logger.error('Incremental sync job failed:', error);
            }
        }
        /**
         * Sincronização completa diária às 3h da manhã
         * Resincroniza tudo para garantir consistência
         */
        async fullSync() {
            this.logger.log('Starting full calendar sync...');
            try {
                const integrations = await connection_1.db.query.googleIntegrations.findMany({
                    where: (0, drizzle_orm_1.eq)(schema.googleIntegrations.syncEnabled, true),
                });
                this.logger.log(`Found ${integrations.length} integrations for full sync`);
                for (const integration of integrations) {
                    try {
                        // Tenta reativar integrações com erro
                        if (integration.status === 'ERROR' || integration.status === 'TOKEN_EXPIRED') {
                            await this.tryReactivateIntegration(integration);
                        }
                        if (integration.status === 'ACTIVE') {
                            await this.syncIntegration(integration, 'FULL');
                        }
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        this.logger.error(`Full sync failed for integration ${integration.id}: ${errorMessage}`);
                    }
                }
                this.logger.log('Full calendar sync completed');
            }
            catch (error) {
                this.logger.error('Full sync job failed:', error);
            }
        }
        /**
         * Limpeza de logs antigos - semanal (domingo 4h)
         */
        async cleanupOldLogs() {
            this.logger.log('Starting sync logs cleanup...');
            try {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                await connection_1.db
                    .delete(schema.googleSyncLogs)
                    .where((0, drizzle_orm_1.lt)(schema.googleSyncLogs.startedAt, thirtyDaysAgo));
                this.logger.log(`Cleaned up old sync logs`);
                // Também limpa conflitos resolvidos há mais de 7 dias
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                await connection_1.db.delete(schema.googleEventConflicts).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.lt)(schema.googleEventConflicts.resolvedAt, sevenDaysAgo)));
                this.logger.log('Cleanup completed');
            }
            catch (error) {
                this.logger.error('Cleanup job failed:', error);
            }
        }
        /**
         * Verifica tokens expirando e notifica/renova
         */
        async checkExpiringTokens() {
            try {
                const oneHourFromNow = new Date();
                oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
                // Busca integrações com token expirando na próxima hora
                const expiringIntegrations = await connection_1.db.query.googleIntegrations.findMany({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.googleIntegrations.status, 'ACTIVE'), (0, drizzle_orm_1.lt)(schema.googleIntegrations.tokenExpiresAt, oneHourFromNow)),
                });
                for (const integration of expiringIntegrations) {
                    try {
                        await this.refreshToken(integration);
                    }
                    catch (error) {
                        this.logger.warn(`Failed to refresh token for integration ${integration.id}`);
                    }
                }
            }
            catch (error) {
                this.logger.error('Token check job failed:', error);
            }
        }
        // ==================== HELPERS ====================
        async syncIntegration(integration, syncType) {
            // Verifica se token é válido
            const accessToken = await this.getValidAccessToken(integration);
            // Define período
            const timeMin = new Date();
            timeMin.setDate(timeMin.getDate() - (syncType === 'FULL' ? 30 : 7));
            const timeMax = new Date();
            timeMax.setDate(timeMax.getDate() + 90);
            // Cria log
            const [log] = await connection_1.db
                .insert(schema.googleSyncLogs)
                .values({
                integrationId: integration.id,
                salonId: integration.salonId,
                professionalId: integration.professionalId,
                syncType,
                direction: integration.syncDirection,
                status: 'SUCCESS',
            })
                .returning();
            try {
                // Busca eventos do Google
                const events = await this.fetchGoogleEvents(accessToken, integration.calendarId, timeMin, timeMax);
                let created = 0;
                let updated = 0;
                let deleted = 0;
                // Processa eventos (sincronização Google -> App)
                if (integration.syncDirection === 'GOOGLE_TO_APP' ||
                    integration.syncDirection === 'BIDIRECTIONAL') {
                    const result = await this.syncGoogleToLocal(integration, events);
                    created = result.created;
                    updated = result.updated;
                    deleted = result.deleted;
                }
                // Atualiza log
                await connection_1.db
                    .update(schema.googleSyncLogs)
                    .set({
                    status: 'SUCCESS',
                    eventsCreated: created,
                    eventsUpdated: updated,
                    eventsDeleted: deleted,
                    completedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema.googleSyncLogs.id, log.id));
                // Atualiza última sincronização
                await connection_1.db
                    .update(schema.googleIntegrations)
                    .set({
                    lastSyncAt: new Date(),
                    lastSyncStatus: 'ACTIVE',
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema.googleIntegrations.id, integration.id));
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                await connection_1.db
                    .update(schema.googleSyncLogs)
                    .set({
                    status: 'ERROR',
                    errorMessage,
                    completedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema.googleSyncLogs.id, log.id));
                throw error;
            }
        }
        async getValidAccessToken(integration) {
            const now = new Date();
            const expiresAt = new Date(integration.tokenExpiresAt);
            expiresAt.setMinutes(expiresAt.getMinutes() - 5);
            if (now < expiresAt) {
                return integration.accessToken;
            }
            // Refresh token
            return this.refreshToken(integration);
        }
        async refreshToken(integration) {
            const clientId = process.env.GOOGLE_CLIENT_ID || '';
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
            if (!clientId || !clientSecret) {
                throw new Error('Google Calendar not configured');
            }
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    refresh_token: integration.refreshToken,
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'refresh_token',
                }),
            });
            if (!response.ok) {
                await connection_1.db
                    .update(schema.googleIntegrations)
                    .set({
                    status: 'TOKEN_EXPIRED',
                    errorMessage: 'Token refresh failed',
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema.googleIntegrations.id, integration.id));
                throw new Error('Token refresh failed');
            }
            const tokens = (await response.json());
            const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);
            await connection_1.db
                .update(schema.googleIntegrations)
                .set({
                accessToken: tokens.access_token,
                tokenExpiresAt: newExpiresAt,
                status: 'ACTIVE',
                errorMessage: null,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.googleIntegrations.id, integration.id));
            return tokens.access_token;
        }
        async fetchGoogleEvents(accessToken, calendarId, timeMin, timeMax) {
            const events = [];
            let pageToken;
            do {
                const params = new URLSearchParams({
                    singleEvents: 'true',
                    orderBy: 'startTime',
                    maxResults: '250',
                    timeMin: timeMin.toISOString(),
                    timeMax: timeMax.toISOString(),
                });
                if (pageToken)
                    params.append('pageToken', pageToken);
                const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`, { headers: { Authorization: `Bearer ${accessToken}` } });
                if (!response.ok) {
                    throw new Error('Failed to fetch Google Calendar events');
                }
                const data = (await response.json());
                events.push(...(data.items || []));
                pageToken = data.nextPageToken;
            } while (pageToken);
            return events.filter((e) => e.status !== 'cancelled');
        }
        async syncGoogleToLocal(integration, events) {
            let created = 0;
            let updated = 0;
            let deleted = 0;
            // Busca blocks existentes do Google
            const existingBlocks = await connection_1.db.query.professionalBlocks.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.professionalBlocks.professionalId, integration.professionalId), (0, drizzle_orm_1.eq)(schema.professionalBlocks.externalSource, 'GOOGLE')),
            });
            const existingMap = new Map(existingBlocks.map((b) => [b.externalEventId, b]));
            const processedIds = new Set();
            for (const event of events) {
                processedIds.add(event.id);
                const existing = existingMap.get(event.id);
                const { startDate, endDate, startTime, endTime, allDay } = this.parseEventDates(event);
                if (existing) {
                    // Atualiza se mudou
                    const needsUpdate = existing.title !== event.summary ||
                        existing.startDate !== startDate ||
                        existing.endDate !== endDate;
                    if (needsUpdate) {
                        await connection_1.db
                            .update(schema.professionalBlocks)
                            .set({
                            title: event.summary || 'Evento Google',
                            description: event.description || null,
                            startDate,
                            endDate,
                            startTime,
                            endTime,
                            allDay,
                            updatedAt: new Date(),
                        })
                            .where((0, drizzle_orm_1.eq)(schema.professionalBlocks.id, existing.id));
                        updated++;
                    }
                }
                else {
                    // Cria novo
                    await connection_1.db.insert(schema.professionalBlocks).values({
                        salonId: integration.salonId,
                        professionalId: integration.professionalId,
                        type: 'OTHER',
                        title: event.summary || 'Evento Google',
                        description: event.description || null,
                        startDate,
                        endDate,
                        startTime,
                        endTime,
                        allDay,
                        status: 'APPROVED',
                        externalSource: 'GOOGLE',
                        externalEventId: event.id,
                        createdById: integration.professionalId,
                    });
                    created++;
                }
            }
            // Remove blocks que não existem mais no Google
            for (const block of existingBlocks) {
                if (block.externalEventId && !processedIds.has(block.externalEventId)) {
                    await connection_1.db
                        .delete(schema.professionalBlocks)
                        .where((0, drizzle_orm_1.eq)(schema.professionalBlocks.id, block.id));
                    deleted++;
                }
            }
            return { created, updated, deleted };
        }
        parseEventDates(event) {
            if (event.start.date) {
                return {
                    startDate: event.start.date,
                    endDate: event.end.date || event.start.date,
                    startTime: null,
                    endTime: null,
                    allDay: true,
                };
            }
            const startDt = new Date(event.start.dateTime);
            const endDt = new Date(event.end.dateTime);
            return {
                startDate: startDt.toISOString().split('T')[0],
                endDate: endDt.toISOString().split('T')[0],
                startTime: startDt.toTimeString().slice(0, 5),
                endTime: endDt.toTimeString().slice(0, 5),
                allDay: false,
            };
        }
        async tryReactivateIntegration(integration) {
            try {
                await this.refreshToken(integration);
                this.logger.log(`Reactivated integration ${integration.id}`);
            }
            catch {
                this.logger.warn(`Could not reactivate integration ${integration.id}`);
            }
        }
    };
    return CalendarSyncJob = _classThis;
})();
exports.CalendarSyncJob = CalendarSyncJob;
//# sourceMappingURL=calendar.jobs.js.map