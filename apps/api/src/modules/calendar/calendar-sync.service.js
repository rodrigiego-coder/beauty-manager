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
exports.CalendarSyncService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema = __importStar(require("../../database/schema"));
const dto_1 = require("./dto");
/**
 * CalendarSyncService
 * Handles synchronization between Google Calendar and local professional blocks
 */
let CalendarSyncService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CalendarSyncService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CalendarSyncService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        googleCalendarService;
        constructor(googleCalendarService) {
            this.googleCalendarService = googleCalendarService;
        }
        // ==================== STATUS E CONFIGURAÇÃO ====================
        /**
         * Obtém status da integração para um profissional
         */
        async getIntegrationStatus(salonId, professionalId) {
            const integration = await this.googleCalendarService.getIntegration(salonId, professionalId);
            if (!integration || integration.status === 'DISCONNECTED') {
                return { connected: false };
            }
            return {
                connected: true,
                professionalId: integration.professionalId,
                googleEmail: integration.googleAccountEmail,
                calendarId: integration.calendarId,
                syncDirection: integration.syncDirection,
                syncEnabled: integration.syncEnabled,
                lastSyncAt: integration.lastSyncAt || undefined,
                status: integration.status,
                errorMessage: integration.errorMessage || undefined,
            };
        }
        /**
         * Obtém status de todas as integrações do salão
         */
        async getAllIntegrationStatuses(salonId) {
            const integrations = await connection_1.db.query.googleIntegrations.findMany({
                where: (0, drizzle_orm_1.eq)(schema.googleIntegrations.salonId, salonId),
            });
            const professionals = await connection_1.db.query.users.findMany({
                where: (0, drizzle_orm_1.eq)(schema.users.salonId, salonId),
                columns: { id: true, name: true },
            });
            const professionalMap = new Map(professionals.map((p) => [p.id, p.name]));
            return integrations.map((integration) => ({
                connected: integration.status !== 'DISCONNECTED',
                professionalId: integration.professionalId,
                professionalName: professionalMap.get(integration.professionalId),
                googleEmail: integration.googleAccountEmail,
                calendarId: integration.calendarId,
                syncDirection: integration.syncDirection,
                syncEnabled: integration.syncEnabled,
                lastSyncAt: integration.lastSyncAt || undefined,
                status: integration.status,
                errorMessage: integration.errorMessage || undefined,
            }));
        }
        // ==================== SINCRONIZAÇÃO ====================
        /**
         * Executa sincronização manual
         */
        async manualSync(salonId, professionalId, fullSync = false) {
            const integration = await this.googleCalendarService.getIntegration(salonId, professionalId);
            if (!integration || integration.status === 'DISCONNECTED') {
                throw new common_1.NotFoundException('Integração não encontrada ou desconectada.');
            }
            return this.syncProfessional(integration, fullSync ? 'FULL' : 'MANUAL');
        }
        /**
         * Sincroniza um profissional específico
         */
        async syncProfessional(integration, syncType = 'INCREMENTAL') {
            const result = {
                success: true,
                eventsCreated: 0,
                eventsUpdated: 0,
                eventsDeleted: 0,
                conflictsFound: 0,
                errors: [],
            };
            const logId = await this.createSyncLog(integration, syncType);
            try {
                // Obtém token válido
                const accessToken = await this.googleCalendarService.getValidAccessToken(integration);
                // Define período de sincronização
                const timeMin = new Date();
                timeMin.setDate(timeMin.getDate() - 7); // 7 dias atrás
                const timeMax = new Date();
                timeMax.setDate(timeMax.getDate() + 90); // 90 dias à frente
                // Sincroniza baseado na direção
                const direction = integration.syncDirection;
                if (direction === dto_1.SyncDirection.GOOGLE_TO_APP || direction === dto_1.SyncDirection.BIDIRECTIONAL) {
                    const googleResult = await this.syncGoogleToApp(integration, accessToken, timeMin, timeMax);
                    result.eventsCreated += googleResult.created;
                    result.eventsUpdated += googleResult.updated;
                    result.eventsDeleted += googleResult.deleted;
                    result.conflictsFound += googleResult.conflicts;
                    result.errors.push(...googleResult.errors);
                }
                if (direction === dto_1.SyncDirection.APP_TO_GOOGLE || direction === dto_1.SyncDirection.BIDIRECTIONAL) {
                    const appResult = await this.syncAppToGoogle(integration, accessToken, timeMin, timeMax);
                    result.eventsCreated += appResult.created;
                    result.eventsUpdated += appResult.updated;
                    result.errors.push(...appResult.errors);
                }
                // Atualiza log e status da integração
                await this.completeSyncLog(logId, result);
                await this.googleCalendarService.updateLastSync(integration.id, result.errors.length > 0 ? dto_1.IntegrationStatus.ERROR : dto_1.IntegrationStatus.ACTIVE);
                if (result.errors.length > 0) {
                    result.success = false;
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                result.success = false;
                result.errors.push(errorMessage);
                await this.failSyncLog(logId, errorMessage);
                await this.googleCalendarService.markError(integration.id, errorMessage);
            }
            return result;
        }
        /**
         * Sincroniza eventos do Google para o app (cria/atualiza blocks)
         */
        async syncGoogleToApp(integration, accessToken, timeMin, timeMax) {
            const result = { created: 0, updated: 0, deleted: 0, conflicts: 0, errors: [] };
            try {
                // Busca eventos do Google
                let pageToken;
                const allEvents = [];
                do {
                    const { events, nextPageToken } = await this.googleCalendarService.listEvents(accessToken, integration.calendarId, timeMin, timeMax, pageToken);
                    allEvents.push(...events);
                    pageToken = nextPageToken;
                } while (pageToken);
                // Filtra eventos confirmados/ocupados (ignora cancelados)
                const activeEvents = allEvents.filter((e) => e.status !== 'cancelled');
                // Busca blocks existentes sincronizados do Google
                const existingBlocks = await connection_1.db.query.professionalBlocks.findMany({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.professionalBlocks.professionalId, integration.professionalId), (0, drizzle_orm_1.eq)(schema.professionalBlocks.externalSource, 'GOOGLE')),
                });
                const existingBlockMap = new Map(existingBlocks.map((b) => [b.externalEventId, b]));
                const processedEventIds = new Set();
                // Processa cada evento do Google
                for (const event of activeEvents) {
                    processedEventIds.add(event.id);
                    const existingBlock = existingBlockMap.get(event.id);
                    try {
                        if (existingBlock) {
                            // Verifica se precisa atualizar
                            const needsUpdate = this.eventNeedsUpdate(event, existingBlock);
                            if (needsUpdate) {
                                await this.updateBlockFromGoogle(existingBlock.id, event, integration);
                                result.updated++;
                            }
                        }
                        else {
                            // Verifica conflitos antes de criar
                            const conflict = await this.checkConflict(event, integration);
                            if (conflict) {
                                result.conflicts++;
                            }
                            else {
                                await this.createBlockFromGoogle(event, integration);
                                result.created++;
                            }
                        }
                    }
                    catch (error) {
                        const msg = error instanceof Error ? error.message : 'Erro ao processar evento';
                        result.errors.push(`Evento ${event.id}: ${msg}`);
                    }
                }
                // Remove blocks que não existem mais no Google
                for (const block of existingBlocks) {
                    if (block.externalEventId && !processedEventIds.has(block.externalEventId)) {
                        await connection_1.db.delete(schema.professionalBlocks).where((0, drizzle_orm_1.eq)(schema.professionalBlocks.id, block.id));
                        result.deleted++;
                    }
                }
            }
            catch (error) {
                const msg = error instanceof Error ? error.message : 'Erro ao sincronizar do Google';
                result.errors.push(msg);
            }
            return result;
        }
        /**
         * Sincroniza blocks do app para o Google
         */
        async syncAppToGoogle(integration, accessToken, timeMin, timeMax) {
            const result = { created: 0, updated: 0, errors: [] };
            try {
                const startDateStr = timeMin.toISOString().split('T')[0];
                const endDateStr = timeMax.toISOString().split('T')[0];
                // Busca blocks locais que não são do Google
                const localBlocks = await connection_1.db.query.professionalBlocks.findMany({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.professionalBlocks.professionalId, integration.professionalId), (0, drizzle_orm_1.gte)(schema.professionalBlocks.startDate, startDateStr), (0, drizzle_orm_1.lte)(schema.professionalBlocks.endDate, endDateStr), (0, drizzle_orm_1.or)((0, drizzle_orm_1.isNull)(schema.professionalBlocks.externalSource), (0, drizzle_orm_1.eq)(schema.professionalBlocks.externalSource, ''))),
                });
                for (const block of localBlocks) {
                    try {
                        const googleEvent = this.blockToGoogleEvent(block);
                        if (block.externalEventId) {
                            // Atualiza evento existente
                            await this.googleCalendarService.updateEvent(accessToken, integration.calendarId, block.externalEventId, googleEvent);
                            result.updated++;
                        }
                        else {
                            // Cria novo evento
                            const created = await this.googleCalendarService.createEvent(accessToken, integration.calendarId, googleEvent);
                            // Salva o ID do Google no block
                            await connection_1.db
                                .update(schema.professionalBlocks)
                                .set({
                                externalSource: 'GOOGLE',
                                externalEventId: created.id,
                                updatedAt: new Date(),
                            })
                                .where((0, drizzle_orm_1.eq)(schema.professionalBlocks.id, block.id));
                            result.created++;
                        }
                    }
                    catch (error) {
                        const msg = error instanceof Error ? error.message : 'Erro ao enviar para Google';
                        result.errors.push(`Block ${block.id}: ${msg}`);
                    }
                }
            }
            catch (error) {
                const msg = error instanceof Error ? error.message : 'Erro ao sincronizar para Google';
                result.errors.push(msg);
            }
            return result;
        }
        // ==================== CONFLITOS ====================
        /**
         * Verifica se há conflito entre evento do Google e blocks locais
         */
        async checkConflict(event, integration) {
            const { startDate, endDate, startTime, endTime } = this.parseGoogleEventDates(event);
            // Busca blocks no mesmo período
            const overlappingBlocks = await connection_1.db.query.professionalBlocks.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.professionalBlocks.professionalId, integration.professionalId), (0, drizzle_orm_1.lte)(schema.professionalBlocks.startDate, endDate), (0, drizzle_orm_1.gte)(schema.professionalBlocks.endDate, startDate), (0, drizzle_orm_1.or)((0, drizzle_orm_1.isNull)(schema.professionalBlocks.externalSource), (0, drizzle_orm_1.eq)(schema.professionalBlocks.externalSource, ''))),
            });
            for (const block of overlappingBlocks) {
                // Para eventos de dia inteiro ou blocks de dia inteiro, qualquer sobreposição é conflito
                if (event.start.date || block.allDay) {
                    // Cria registro de conflito
                    await connection_1.db.insert(schema.googleEventConflicts).values({
                        integrationId: integration.id,
                        salonId: integration.salonId,
                        professionalId: integration.professionalId,
                        localBlockId: block.id,
                        googleEventId: event.id,
                        conflictType: 'TIME_OVERLAP',
                        localData: {
                            id: block.id,
                            title: block.title,
                            startDate: block.startDate,
                            endDate: block.endDate,
                            startTime: block.startTime,
                            endTime: block.endTime,
                        },
                        googleData: {
                            id: event.id,
                            summary: event.summary,
                            start: event.start.dateTime || event.start.date,
                            end: event.end.dateTime || event.end.date,
                        },
                    });
                    return true;
                }
                // Verifica sobreposição de horários
                if (startTime && endTime && block.startTime && block.endTime) {
                    const timeOverlap = (startTime >= block.startTime && startTime < block.endTime) ||
                        (endTime > block.startTime && endTime <= block.endTime) ||
                        (startTime <= block.startTime && endTime >= block.endTime);
                    if (timeOverlap) {
                        await connection_1.db.insert(schema.googleEventConflicts).values({
                            integrationId: integration.id,
                            salonId: integration.salonId,
                            professionalId: integration.professionalId,
                            localBlockId: block.id,
                            googleEventId: event.id,
                            conflictType: 'TIME_OVERLAP',
                            localData: {
                                id: block.id,
                                title: block.title,
                                startDate: block.startDate,
                                endDate: block.endDate,
                                startTime: block.startTime,
                                endTime: block.endTime,
                            },
                            googleData: {
                                id: event.id,
                                summary: event.summary,
                                start: event.start.dateTime || event.start.date,
                                end: event.end.dateTime || event.end.date,
                            },
                        });
                        return true;
                    }
                }
            }
            return false;
        }
        /**
         * Lista conflitos pendentes
         */
        async getConflicts(salonId, professionalId) {
            const whereCondition = professionalId
                ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.googleEventConflicts.salonId, salonId), (0, drizzle_orm_1.eq)(schema.googleEventConflicts.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema.googleEventConflicts.status, 'PENDING'))
                : (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.googleEventConflicts.salonId, salonId), (0, drizzle_orm_1.eq)(schema.googleEventConflicts.status, 'PENDING'));
            const conflicts = await connection_1.db.query.googleEventConflicts.findMany({
                where: whereCondition,
                orderBy: (0, drizzle_orm_1.desc)(schema.googleEventConflicts.createdAt),
            });
            return conflicts.map((c) => ({
                id: c.id,
                conflictType: c.conflictType,
                localEvent: c.localData,
                googleEvent: c.googleData,
                status: c.status,
                createdAt: c.createdAt,
            }));
        }
        /**
         * Resolve um conflito
         */
        async resolveConflict(conflictId, resolution, userId) {
            const conflict = await connection_1.db.query.googleEventConflicts.findFirst({
                where: (0, drizzle_orm_1.eq)(schema.googleEventConflicts.id, conflictId),
            });
            if (!conflict) {
                throw new common_1.NotFoundException('Conflito não encontrado.');
            }
            const integration = await connection_1.db.query.googleIntegrations.findFirst({
                where: (0, drizzle_orm_1.eq)(schema.googleIntegrations.id, conflict.integrationId),
            });
            if (!integration) {
                throw new common_1.NotFoundException('Integração não encontrada.');
            }
            let newStatus;
            switch (resolution) {
                case dto_1.ConflictResolution.KEEP_LOCAL:
                    newStatus = dto_1.ConflictStatus.RESOLVED_KEEP_LOCAL;
                    // Não faz nada - mantém o block local, ignora o evento do Google
                    break;
                case dto_1.ConflictResolution.KEEP_GOOGLE:
                    newStatus = dto_1.ConflictStatus.RESOLVED_KEEP_GOOGLE;
                    // Remove o block local se existir
                    if (conflict.localBlockId) {
                        await connection_1.db
                            .delete(schema.professionalBlocks)
                            .where((0, drizzle_orm_1.eq)(schema.professionalBlocks.id, conflict.localBlockId));
                    }
                    // Cria block do evento Google
                    if (conflict.googleEventId) {
                        const accessToken = await this.googleCalendarService.getValidAccessToken(integration);
                        const event = await this.googleCalendarService.getEvent(accessToken, integration.calendarId, conflict.googleEventId);
                        if (event) {
                            await this.createBlockFromGoogle(event, integration);
                        }
                    }
                    break;
                case dto_1.ConflictResolution.MERGE:
                    newStatus = dto_1.ConflictStatus.RESOLVED_MERGE;
                    // Mantém ambos - cria block do Google sem remover o local
                    if (conflict.googleEventId && !conflict.localBlockId) {
                        const accessToken = await this.googleCalendarService.getValidAccessToken(integration);
                        const event = await this.googleCalendarService.getEvent(accessToken, integration.calendarId, conflict.googleEventId);
                        if (event) {
                            await this.createBlockFromGoogle(event, integration);
                        }
                    }
                    break;
                case dto_1.ConflictResolution.IGNORE:
                default:
                    newStatus = dto_1.ConflictStatus.IGNORED;
                    break;
            }
            await connection_1.db
                .update(schema.googleEventConflicts)
                .set({
                status: newStatus,
                resolvedAt: new Date(),
                resolvedById: userId,
                resolution: resolution,
            })
                .where((0, drizzle_orm_1.eq)(schema.googleEventConflicts.id, conflictId));
        }
        // ==================== LOGS ====================
        /**
         * Obtém logs de sincronização
         */
        async getSyncLogs(salonId, professionalId, limit = 20) {
            const whereCondition = professionalId
                ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.googleSyncLogs.salonId, salonId), (0, drizzle_orm_1.eq)(schema.googleSyncLogs.professionalId, professionalId))
                : (0, drizzle_orm_1.eq)(schema.googleSyncLogs.salonId, salonId);
            const logs = await connection_1.db.query.googleSyncLogs.findMany({
                where: whereCondition,
                orderBy: (0, drizzle_orm_1.desc)(schema.googleSyncLogs.startedAt),
                limit,
            });
            return logs.map((log) => ({
                id: log.id,
                syncType: log.syncType,
                direction: log.direction,
                status: log.status,
                eventsCreated: log.eventsCreated,
                eventsUpdated: log.eventsUpdated,
                eventsDeleted: log.eventsDeleted,
                conflictsFound: log.conflictsFound,
                errorMessage: log.errorMessage || undefined,
                startedAt: log.startedAt,
                completedAt: log.completedAt || undefined,
            }));
        }
        // ==================== HELPERS PRIVADOS ====================
        async createSyncLog(integration, syncType) {
            const [log] = await connection_1.db
                .insert(schema.googleSyncLogs)
                .values({
                integrationId: integration.id,
                salonId: integration.salonId,
                professionalId: integration.professionalId,
                syncType,
                direction: integration.syncDirection,
                status: 'SUCCESS', // Será atualizado no final
            })
                .returning();
            return log.id;
        }
        async completeSyncLog(logId, result) {
            await connection_1.db
                .update(schema.googleSyncLogs)
                .set({
                status: result.errors.length > 0 ? 'PARTIAL' : 'SUCCESS',
                eventsCreated: result.eventsCreated,
                eventsUpdated: result.eventsUpdated,
                eventsDeleted: result.eventsDeleted,
                conflictsFound: result.conflictsFound,
                errorMessage: result.errors.length > 0 ? result.errors.join('; ') : null,
                completedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.googleSyncLogs.id, logId));
        }
        async failSyncLog(logId, errorMessage) {
            await connection_1.db
                .update(schema.googleSyncLogs)
                .set({
                status: 'ERROR',
                errorMessage,
                completedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.googleSyncLogs.id, logId));
        }
        parseGoogleEventDates(event) {
            if (event.start.date) {
                // Evento de dia inteiro
                return {
                    startDate: event.start.date,
                    endDate: event.end.date || event.start.date,
                    allDay: true,
                };
            }
            // Evento com horário
            const startDt = new Date(event.start.dateTime);
            const endDt = new Date(event.end.dateTime);
            return {
                startDate: startDt.toISOString().split('T')[0],
                endDate: endDt.toISOString().split('T')[0],
                startTime: startDt.toTimeString().slice(0, 5), // HH:MM
                endTime: endDt.toTimeString().slice(0, 5),
                allDay: false,
            };
        }
        eventNeedsUpdate(event, block) {
            const { startDate, endDate, startTime, endTime, allDay } = this.parseGoogleEventDates(event);
            return (block.title !== event.summary ||
                block.startDate !== startDate ||
                block.endDate !== endDate ||
                block.startTime !== startTime ||
                block.endTime !== endTime ||
                block.allDay !== allDay);
        }
        async createBlockFromGoogle(event, integration) {
            const { startDate, endDate, startTime, endTime, allDay } = this.parseGoogleEventDates(event);
            await connection_1.db.insert(schema.professionalBlocks).values({
                salonId: integration.salonId,
                professionalId: integration.professionalId,
                type: 'OTHER', // Evento do Google é genérico
                title: event.summary || 'Evento Google Calendar',
                description: event.description || null,
                startDate,
                endDate,
                startTime: startTime || null,
                endTime: endTime || null,
                allDay,
                status: 'APPROVED',
                externalSource: 'GOOGLE',
                externalEventId: event.id,
                createdById: integration.professionalId,
            });
        }
        async updateBlockFromGoogle(blockId, event, _integration) {
            const { startDate, endDate, startTime, endTime, allDay } = this.parseGoogleEventDates(event);
            await connection_1.db
                .update(schema.professionalBlocks)
                .set({
                title: event.summary || 'Evento Google Calendar',
                description: event.description || null,
                startDate,
                endDate,
                startTime: startTime || null,
                endTime: endTime || null,
                allDay,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.professionalBlocks.id, blockId));
        }
        blockToGoogleEvent(block) {
            const event = {
                summary: block.title,
                description: block.description || undefined,
            };
            if (block.allDay) {
                event.start = { date: block.startDate };
                event.end = { date: block.endDate };
            }
            else {
                const startDateTime = `${block.startDate}T${block.startTime || '00:00'}:00`;
                const endDateTime = `${block.endDate}T${block.endTime || '23:59'}:00`;
                event.start = { dateTime: startDateTime, timeZone: 'America/Sao_Paulo' };
                event.end = { dateTime: endDateTime, timeZone: 'America/Sao_Paulo' };
            }
            return event;
        }
    };
    return CalendarSyncService = _classThis;
})();
exports.CalendarSyncService = CalendarSyncService;
//# sourceMappingURL=calendar-sync.service.js.map