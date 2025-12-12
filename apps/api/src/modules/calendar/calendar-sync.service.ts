import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, gte, lte, desc, or, isNull } from 'drizzle-orm';
import { db } from '../../database/connection';
import * as schema from '../../database/schema';
import { GoogleCalendarService } from './google-calendar.service';
import {
  SyncDirection,
  IntegrationStatus,
  ConflictResolution,
  ConflictStatus,
  SyncResult,
  GoogleCalendarEvent,
  IntegrationStatusResponse,
  ConflictDetails,
  SyncLogDetails,
} from './dto';

/**
 * CalendarSyncService
 * Handles synchronization between Google Calendar and local professional blocks
 */
@Injectable()
export class CalendarSyncService {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  // ==================== STATUS E CONFIGURAÇÃO ====================

  /**
   * Obtém status da integração para um profissional
   */
  async getIntegrationStatus(salonId: string, professionalId: string): Promise<IntegrationStatusResponse> {
    const integration = await this.googleCalendarService.getIntegration(salonId, professionalId);

    if (!integration || integration.status === 'DISCONNECTED') {
      return { connected: false };
    }

    return {
      connected: true,
      professionalId: integration.professionalId,
      googleEmail: integration.googleAccountEmail,
      calendarId: integration.calendarId,
      syncDirection: integration.syncDirection as SyncDirection,
      syncEnabled: integration.syncEnabled,
      lastSyncAt: integration.lastSyncAt || undefined,
      status: integration.status as IntegrationStatus,
      errorMessage: integration.errorMessage || undefined,
    };
  }

  /**
   * Obtém status de todas as integrações do salão
   */
  async getAllIntegrationStatuses(salonId: string): Promise<IntegrationStatusResponse[]> {
    const integrations = await db.query.googleIntegrations.findMany({
      where: eq(schema.googleIntegrations.salonId, salonId),
    });

    const professionals = await db.query.users.findMany({
      where: eq(schema.users.salonId, salonId),
      columns: { id: true, name: true },
    });

    const professionalMap = new Map(professionals.map((p) => [p.id, p.name]));

    return integrations.map((integration) => ({
      connected: integration.status !== 'DISCONNECTED',
      professionalId: integration.professionalId,
      professionalName: professionalMap.get(integration.professionalId),
      googleEmail: integration.googleAccountEmail,
      calendarId: integration.calendarId,
      syncDirection: integration.syncDirection as SyncDirection,
      syncEnabled: integration.syncEnabled,
      lastSyncAt: integration.lastSyncAt || undefined,
      status: integration.status as IntegrationStatus,
      errorMessage: integration.errorMessage || undefined,
    }));
  }

  // ==================== SINCRONIZAÇÃO ====================

  /**
   * Executa sincronização manual
   */
  async manualSync(salonId: string, professionalId: string, fullSync: boolean = false): Promise<SyncResult> {
    const integration = await this.googleCalendarService.getIntegration(salonId, professionalId);

    if (!integration || integration.status === 'DISCONNECTED') {
      throw new NotFoundException('Integração não encontrada ou desconectada.');
    }

    return this.syncProfessional(integration, fullSync ? 'FULL' : 'MANUAL');
  }

  /**
   * Sincroniza um profissional específico
   */
  async syncProfessional(
    integration: schema.GoogleIntegration,
    syncType: 'FULL' | 'INCREMENTAL' | 'MANUAL' = 'INCREMENTAL',
  ): Promise<SyncResult> {
    const result: SyncResult = {
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
      const direction = integration.syncDirection as SyncDirection;

      if (direction === SyncDirection.GOOGLE_TO_APP || direction === SyncDirection.BIDIRECTIONAL) {
        const googleResult = await this.syncGoogleToApp(
          integration,
          accessToken,
          timeMin,
          timeMax,
        );
        result.eventsCreated += googleResult.created;
        result.eventsUpdated += googleResult.updated;
        result.eventsDeleted += googleResult.deleted;
        result.conflictsFound += googleResult.conflicts;
        result.errors.push(...googleResult.errors);
      }

      if (direction === SyncDirection.APP_TO_GOOGLE || direction === SyncDirection.BIDIRECTIONAL) {
        const appResult = await this.syncAppToGoogle(
          integration,
          accessToken,
          timeMin,
          timeMax,
        );
        result.eventsCreated += appResult.created;
        result.eventsUpdated += appResult.updated;
        result.errors.push(...appResult.errors);
      }

      // Atualiza log e status da integração
      await this.completeSyncLog(logId, result);
      await this.googleCalendarService.updateLastSync(
        integration.id,
        result.errors.length > 0 ? IntegrationStatus.ERROR : IntegrationStatus.ACTIVE,
      );

      if (result.errors.length > 0) {
        result.success = false;
      }
    } catch (error) {
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
  private async syncGoogleToApp(
    integration: schema.GoogleIntegration,
    accessToken: string,
    timeMin: Date,
    timeMax: Date,
  ): Promise<{ created: number; updated: number; deleted: number; conflicts: number; errors: string[] }> {
    const result = { created: 0, updated: 0, deleted: 0, conflicts: 0, errors: [] as string[] };

    try {
      // Busca eventos do Google
      let pageToken: string | undefined;
      const allEvents: GoogleCalendarEvent[] = [];

      do {
        const { events, nextPageToken } = await this.googleCalendarService.listEvents(
          accessToken,
          integration.calendarId,
          timeMin,
          timeMax,
          pageToken,
        );
        allEvents.push(...events);
        pageToken = nextPageToken;
      } while (pageToken);

      // Filtra eventos confirmados/ocupados (ignora cancelados)
      const activeEvents = allEvents.filter((e) => e.status !== 'cancelled');

      // Busca blocks existentes sincronizados do Google
      const existingBlocks = await db.query.professionalBlocks.findMany({
        where: and(
          eq(schema.professionalBlocks.professionalId, integration.professionalId),
          eq(schema.professionalBlocks.externalSource, 'GOOGLE'),
        ),
      });

      const existingBlockMap = new Map(existingBlocks.map((b) => [b.externalEventId, b]));
      const processedEventIds = new Set<string>();

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
          } else {
            // Verifica conflitos antes de criar
            const conflict = await this.checkConflict(event, integration);
            if (conflict) {
              result.conflicts++;
            } else {
              await this.createBlockFromGoogle(event, integration);
              result.created++;
            }
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Erro ao processar evento';
          result.errors.push(`Evento ${event.id}: ${msg}`);
        }
      }

      // Remove blocks que não existem mais no Google
      for (const block of existingBlocks) {
        if (block.externalEventId && !processedEventIds.has(block.externalEventId)) {
          await db.delete(schema.professionalBlocks).where(eq(schema.professionalBlocks.id, block.id));
          result.deleted++;
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao sincronizar do Google';
      result.errors.push(msg);
    }

    return result;
  }

  /**
   * Sincroniza blocks do app para o Google
   */
  private async syncAppToGoogle(
    integration: schema.GoogleIntegration,
    accessToken: string,
    timeMin: Date,
    timeMax: Date,
  ): Promise<{ created: number; updated: number; errors: string[] }> {
    const result = { created: 0, updated: 0, errors: [] as string[] };

    try {
      const startDateStr = timeMin.toISOString().split('T')[0];
      const endDateStr = timeMax.toISOString().split('T')[0];

      // Busca blocks locais que não são do Google
      const localBlocks = await db.query.professionalBlocks.findMany({
        where: and(
          eq(schema.professionalBlocks.professionalId, integration.professionalId),
          gte(schema.professionalBlocks.startDate, startDateStr),
          lte(schema.professionalBlocks.endDate, endDateStr),
          or(
            isNull(schema.professionalBlocks.externalSource),
            eq(schema.professionalBlocks.externalSource, ''),
          ),
        ),
      });

      for (const block of localBlocks) {
        try {
          const googleEvent = this.blockToGoogleEvent(block);

          if (block.externalEventId) {
            // Atualiza evento existente
            await this.googleCalendarService.updateEvent(
              accessToken,
              integration.calendarId,
              block.externalEventId,
              googleEvent,
            );
            result.updated++;
          } else {
            // Cria novo evento
            const created = await this.googleCalendarService.createEvent(
              accessToken,
              integration.calendarId,
              googleEvent,
            );

            // Salva o ID do Google no block
            await db
              .update(schema.professionalBlocks)
              .set({
                externalSource: 'GOOGLE',
                externalEventId: created.id,
                updatedAt: new Date(),
              })
              .where(eq(schema.professionalBlocks.id, block.id));

            result.created++;
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Erro ao enviar para Google';
          result.errors.push(`Block ${block.id}: ${msg}`);
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao sincronizar para Google';
      result.errors.push(msg);
    }

    return result;
  }

  // ==================== CONFLITOS ====================

  /**
   * Verifica se há conflito entre evento do Google e blocks locais
   */
  private async checkConflict(
    event: GoogleCalendarEvent,
    integration: schema.GoogleIntegration,
  ): Promise<boolean> {
    const { startDate, endDate, startTime, endTime } = this.parseGoogleEventDates(event);

    // Busca blocks no mesmo período
    const overlappingBlocks = await db.query.professionalBlocks.findMany({
      where: and(
        eq(schema.professionalBlocks.professionalId, integration.professionalId),
        lte(schema.professionalBlocks.startDate, endDate),
        gte(schema.professionalBlocks.endDate, startDate),
        or(
          isNull(schema.professionalBlocks.externalSource),
          eq(schema.professionalBlocks.externalSource, ''),
        ),
      ),
    });

    for (const block of overlappingBlocks) {
      // Para eventos de dia inteiro ou blocks de dia inteiro, qualquer sobreposição é conflito
      if (event.start.date || block.allDay) {
        // Cria registro de conflito
        await db.insert(schema.googleEventConflicts).values({
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
        const timeOverlap =
          (startTime >= block.startTime && startTime < block.endTime) ||
          (endTime > block.startTime && endTime <= block.endTime) ||
          (startTime <= block.startTime && endTime >= block.endTime);

        if (timeOverlap) {
          await db.insert(schema.googleEventConflicts).values({
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
  async getConflicts(salonId: string, professionalId?: string): Promise<ConflictDetails[]> {
    const whereCondition = professionalId
      ? and(
          eq(schema.googleEventConflicts.salonId, salonId),
          eq(schema.googleEventConflicts.professionalId, professionalId),
          eq(schema.googleEventConflicts.status, 'PENDING'),
        )
      : and(
          eq(schema.googleEventConflicts.salonId, salonId),
          eq(schema.googleEventConflicts.status, 'PENDING'),
        );

    const conflicts = await db.query.googleEventConflicts.findMany({
      where: whereCondition,
      orderBy: desc(schema.googleEventConflicts.createdAt),
    });

    return conflicts.map((c) => ({
      id: c.id,
      conflictType: c.conflictType,
      localEvent: c.localData as ConflictDetails['localEvent'],
      googleEvent: c.googleData as ConflictDetails['googleEvent'],
      status: c.status as ConflictStatus,
      createdAt: c.createdAt,
    }));
  }

  /**
   * Resolve um conflito
   */
  async resolveConflict(
    conflictId: string,
    resolution: ConflictResolution,
    userId: string,
  ): Promise<void> {
    const conflict = await db.query.googleEventConflicts.findFirst({
      where: eq(schema.googleEventConflicts.id, conflictId),
    });

    if (!conflict) {
      throw new NotFoundException('Conflito não encontrado.');
    }

    const integration = await db.query.googleIntegrations.findFirst({
      where: eq(schema.googleIntegrations.id, conflict.integrationId),
    });

    if (!integration) {
      throw new NotFoundException('Integração não encontrada.');
    }

    let newStatus: ConflictStatus;

    switch (resolution) {
      case ConflictResolution.KEEP_LOCAL:
        newStatus = ConflictStatus.RESOLVED_KEEP_LOCAL;
        // Não faz nada - mantém o block local, ignora o evento do Google
        break;

      case ConflictResolution.KEEP_GOOGLE:
        newStatus = ConflictStatus.RESOLVED_KEEP_GOOGLE;
        // Remove o block local se existir
        if (conflict.localBlockId) {
          await db
            .delete(schema.professionalBlocks)
            .where(eq(schema.professionalBlocks.id, conflict.localBlockId));
        }
        // Cria block do evento Google
        if (conflict.googleEventId) {
          const accessToken = await this.googleCalendarService.getValidAccessToken(integration);
          const event = await this.googleCalendarService.getEvent(
            accessToken,
            integration.calendarId,
            conflict.googleEventId,
          );
          if (event) {
            await this.createBlockFromGoogle(event, integration);
          }
        }
        break;

      case ConflictResolution.MERGE:
        newStatus = ConflictStatus.RESOLVED_MERGE;
        // Mantém ambos - cria block do Google sem remover o local
        if (conflict.googleEventId && !conflict.localBlockId) {
          const accessToken = await this.googleCalendarService.getValidAccessToken(integration);
          const event = await this.googleCalendarService.getEvent(
            accessToken,
            integration.calendarId,
            conflict.googleEventId,
          );
          if (event) {
            await this.createBlockFromGoogle(event, integration);
          }
        }
        break;

      case ConflictResolution.IGNORE:
      default:
        newStatus = ConflictStatus.IGNORED;
        break;
    }

    await db
      .update(schema.googleEventConflicts)
      .set({
        status: newStatus,
        resolvedAt: new Date(),
        resolvedById: userId,
        resolution: resolution,
      })
      .where(eq(schema.googleEventConflicts.id, conflictId));
  }

  // ==================== LOGS ====================

  /**
   * Obtém logs de sincronização
   */
  async getSyncLogs(
    salonId: string,
    professionalId?: string,
    limit: number = 20,
  ): Promise<SyncLogDetails[]> {
    const whereCondition = professionalId
      ? and(
          eq(schema.googleSyncLogs.salonId, salonId),
          eq(schema.googleSyncLogs.professionalId, professionalId),
        )
      : eq(schema.googleSyncLogs.salonId, salonId);

    const logs = await db.query.googleSyncLogs.findMany({
      where: whereCondition,
      orderBy: desc(schema.googleSyncLogs.startedAt),
      limit,
    });

    return logs.map((log) => ({
      id: log.id,
      syncType: log.syncType,
      direction: log.direction as SyncDirection,
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

  private async createSyncLog(
    integration: schema.GoogleIntegration,
    syncType: string,
  ): Promise<string> {
    const [log] = await db
      .insert(schema.googleSyncLogs)
      .values({
        integrationId: integration.id,
        salonId: integration.salonId,
        professionalId: integration.professionalId,
        syncType,
        direction: integration.syncDirection as 'GOOGLE_TO_APP' | 'APP_TO_GOOGLE' | 'BIDIRECTIONAL',
        status: 'SUCCESS', // Será atualizado no final
      })
      .returning();

    return log.id;
  }

  private async completeSyncLog(logId: string, result: SyncResult): Promise<void> {
    await db
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
      .where(eq(schema.googleSyncLogs.id, logId));
  }

  private async failSyncLog(logId: string, errorMessage: string): Promise<void> {
    await db
      .update(schema.googleSyncLogs)
      .set({
        status: 'ERROR',
        errorMessage,
        completedAt: new Date(),
      })
      .where(eq(schema.googleSyncLogs.id, logId));
  }

  private parseGoogleEventDates(event: GoogleCalendarEvent): {
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    allDay: boolean;
  } {
    if (event.start.date) {
      // Evento de dia inteiro
      return {
        startDate: event.start.date,
        endDate: event.end.date || event.start.date,
        allDay: true,
      };
    }

    // Evento com horário
    const startDt = new Date(event.start.dateTime!);
    const endDt = new Date(event.end.dateTime!);

    return {
      startDate: startDt.toISOString().split('T')[0],
      endDate: endDt.toISOString().split('T')[0],
      startTime: startDt.toTimeString().slice(0, 5), // HH:MM
      endTime: endDt.toTimeString().slice(0, 5),
      allDay: false,
    };
  }

  private eventNeedsUpdate(event: GoogleCalendarEvent, block: schema.ProfessionalBlock): boolean {
    const { startDate, endDate, startTime, endTime, allDay } = this.parseGoogleEventDates(event);

    return (
      block.title !== event.summary ||
      block.startDate !== startDate ||
      block.endDate !== endDate ||
      block.startTime !== startTime ||
      block.endTime !== endTime ||
      block.allDay !== allDay
    );
  }

  private async createBlockFromGoogle(
    event: GoogleCalendarEvent,
    integration: schema.GoogleIntegration,
  ): Promise<void> {
    const { startDate, endDate, startTime, endTime, allDay } = this.parseGoogleEventDates(event);

    await db.insert(schema.professionalBlocks).values({
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

  private async updateBlockFromGoogle(
    blockId: string,
    event: GoogleCalendarEvent,
    _integration: schema.GoogleIntegration,
  ): Promise<void> {
    const { startDate, endDate, startTime, endTime, allDay } = this.parseGoogleEventDates(event);

    await db
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
      .where(eq(schema.professionalBlocks.id, blockId));
  }

  private blockToGoogleEvent(block: schema.ProfessionalBlock): Partial<GoogleCalendarEvent> {
    const event: Partial<GoogleCalendarEvent> = {
      summary: block.title,
      description: block.description || undefined,
    };

    if (block.allDay) {
      event.start = { date: block.startDate };
      event.end = { date: block.endDate };
    } else {
      const startDateTime = `${block.startDate}T${block.startTime || '00:00'}:00`;
      const endDateTime = `${block.endDate}T${block.endTime || '23:59'}:00`;

      event.start = { dateTime: startDateTime, timeZone: 'America/Sao_Paulo' };
      event.end = { dateTime: endDateTime, timeZone: 'America/Sao_Paulo' };
    }

    return event;
  }
}
