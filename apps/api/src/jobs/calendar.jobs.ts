import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IS_JEST } from '../common/is-jest';
import { eq, and, lt } from 'drizzle-orm';
import { db } from '../database/connection';
import * as schema from '../database/schema';

/**
 * CalendarSyncJob
 * Scheduled tasks for Google Calendar synchronization
 */
@Injectable()
export class CalendarSyncJob {
  private readonly logger = new Logger(CalendarSyncJob.name);

  /**
   * Sincronização incremental a cada 15 minutos
   * Sincroniza todas as integrações ativas
   */
  @Cron(CronExpression.EVERY_30_MINUTES, { disabled: IS_JEST })
  async incrementalSync(): Promise<void> {
    this.logger.log('Starting incremental calendar sync...');

    try {
      // Busca integrações ativas
      const integrations = await db.query.googleIntegrations.findMany({
        where: and(
          eq(schema.googleIntegrations.syncEnabled, true),
          eq(schema.googleIntegrations.status, 'ACTIVE'),
        ),
      });

      this.logger.log(`Found ${integrations.length} active integrations to sync`);

      let successCount = 0;
      let errorCount = 0;

      for (const integration of integrations) {
        try {
          await this.syncIntegration(integration, 'INCREMENTAL');
          successCount++;
        } catch (error) {
          errorCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Failed to sync integration ${integration.id}: ${errorMessage}`,
          );

          // Marca erro na integração
          await db
            .update(schema.googleIntegrations)
            .set({
              status: 'ERROR',
              errorMessage: errorMessage,
              updatedAt: new Date(),
            })
            .where(eq(schema.googleIntegrations.id, integration.id));
        }
      }

      this.logger.log(
        `Incremental sync completed: ${successCount} success, ${errorCount} errors`,
      );
    } catch (error) {
      this.logger.error('Incremental sync job failed:', error);
    }
  }

  /**
   * Sincronização completa diária às 3h da manhã
   * Resincroniza tudo para garantir consistência
   */
  @Cron('0 3 * * *', { disabled: IS_JEST }) // 3:00 AM
  async fullSync(): Promise<void> {
    this.logger.log('Starting full calendar sync...');

    try {
      const integrations = await db.query.googleIntegrations.findMany({
        where: eq(schema.googleIntegrations.syncEnabled, true),
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
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Full sync failed for integration ${integration.id}: ${errorMessage}`,
          );
        }
      }

      this.logger.log('Full calendar sync completed');
    } catch (error) {
      this.logger.error('Full sync job failed:', error);
    }
  }

  /**
   * Limpeza de logs antigos - semanal (domingo 4h)
   */
  @Cron('0 4 * * 0', { disabled: IS_JEST }) // Sunday 4:00 AM
  async cleanupOldLogs(): Promise<void> {
    this.logger.log('Starting sync logs cleanup...');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await db
        .delete(schema.googleSyncLogs)
        .where(lt(schema.googleSyncLogs.startedAt, thirtyDaysAgo));

      this.logger.log(`Cleaned up old sync logs`);

      // Também limpa conflitos resolvidos há mais de 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      await db.delete(schema.googleEventConflicts).where(
        and(
          lt(schema.googleEventConflicts.resolvedAt, sevenDaysAgo),
        ),
      );

      this.logger.log('Cleanup completed');
    } catch (error) {
      this.logger.error('Cleanup job failed:', error);
    }
  }

  /**
   * Verifica tokens expirando e notifica/renova
   */
  @Cron(CronExpression.EVERY_HOUR, { disabled: IS_JEST })
  async checkExpiringTokens(): Promise<void> {
    try {
      const oneHourFromNow = new Date();
      oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

      // Busca integrações com token expirando na próxima hora
      const expiringIntegrations = await db.query.googleIntegrations.findMany({
        where: and(
          eq(schema.googleIntegrations.status, 'ACTIVE'),
          lt(schema.googleIntegrations.tokenExpiresAt, oneHourFromNow),
        ),
      });

      for (const integration of expiringIntegrations) {
        try {
          await this.refreshToken(integration);
        } catch (error) {
          this.logger.warn(
            `Failed to refresh token for integration ${integration.id}`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Token check job failed:', error);
    }
  }

  // ==================== HELPERS ====================

  private async syncIntegration(
    integration: schema.GoogleIntegration,
    syncType: 'FULL' | 'INCREMENTAL',
  ): Promise<void> {
    // Verifica se token é válido
    const accessToken = await this.getValidAccessToken(integration);

    // Define período
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - (syncType === 'FULL' ? 30 : 7));

    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 90);

    // Cria log
    const [log] = await db
      .insert(schema.googleSyncLogs)
      .values({
        integrationId: integration.id,
        salonId: integration.salonId,
        professionalId: integration.professionalId,
        syncType,
        direction: integration.syncDirection as 'GOOGLE_TO_APP' | 'APP_TO_GOOGLE' | 'BIDIRECTIONAL',
        status: 'SUCCESS',
      })
      .returning();

    try {
      // Busca eventos do Google
      const events = await this.fetchGoogleEvents(
        accessToken,
        integration.calendarId,
        timeMin,
        timeMax,
      );

      let created = 0;
      let updated = 0;
      let deleted = 0;

      // Processa eventos (sincronização Google -> App)
      if (
        integration.syncDirection === 'GOOGLE_TO_APP' ||
        integration.syncDirection === 'BIDIRECTIONAL'
      ) {
        const result = await this.syncGoogleToLocal(integration, events);
        created = result.created;
        updated = result.updated;
        deleted = result.deleted;
      }

      // Atualiza log
      await db
        .update(schema.googleSyncLogs)
        .set({
          status: 'SUCCESS',
          eventsCreated: created,
          eventsUpdated: updated,
          eventsDeleted: deleted,
          completedAt: new Date(),
        })
        .where(eq(schema.googleSyncLogs.id, log.id));

      // Atualiza última sincronização
      await db
        .update(schema.googleIntegrations)
        .set({
          lastSyncAt: new Date(),
          lastSyncStatus: 'ACTIVE',
          updatedAt: new Date(),
        })
        .where(eq(schema.googleIntegrations.id, integration.id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await db
        .update(schema.googleSyncLogs)
        .set({
          status: 'ERROR',
          errorMessage,
          completedAt: new Date(),
        })
        .where(eq(schema.googleSyncLogs.id, log.id));

      throw error;
    }
  }

  private async getValidAccessToken(
    integration: schema.GoogleIntegration,
  ): Promise<string> {
    const now = new Date();
    const expiresAt = new Date(integration.tokenExpiresAt);
    expiresAt.setMinutes(expiresAt.getMinutes() - 5);

    if (now < expiresAt) {
      return integration.accessToken;
    }

    // Refresh token
    return this.refreshToken(integration);
  }

  private async refreshToken(integration: schema.GoogleIntegration): Promise<string> {
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
      await db
        .update(schema.googleIntegrations)
        .set({
          status: 'TOKEN_EXPIRED',
          errorMessage: 'Token refresh failed',
          updatedAt: new Date(),
        })
        .where(eq(schema.googleIntegrations.id, integration.id));

      throw new Error('Token refresh failed');
    }

    const tokens = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    await db
      .update(schema.googleIntegrations)
      .set({
        accessToken: tokens.access_token,
        tokenExpiresAt: newExpiresAt,
        status: 'ACTIVE',
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.googleIntegrations.id, integration.id));

    return tokens.access_token;
  }

  private async fetchGoogleEvents(
    accessToken: string,
    calendarId: string,
    timeMin: Date,
    timeMax: Date,
  ): Promise<GoogleEvent[]> {
    const events: GoogleEvent[] = [];
    let pageToken: string | undefined;

    do {
      const params = new URLSearchParams({
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '250',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
      });

      if (pageToken) params.append('pageToken', pageToken);

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Google Calendar events');
      }

      const data = (await response.json()) as {
        items: GoogleEvent[];
        nextPageToken?: string;
      };

      events.push(...(data.items || []));
      pageToken = data.nextPageToken;
    } while (pageToken);

    return events.filter((e) => e.status !== 'cancelled');
  }

  private async syncGoogleToLocal(
    integration: schema.GoogleIntegration,
    events: GoogleEvent[],
  ): Promise<{ created: number; updated: number; deleted: number }> {
    let created = 0;
    let updated = 0;
    let deleted = 0;

    // Busca blocks existentes do Google
    const existingBlocks = await db.query.professionalBlocks.findMany({
      where: and(
        eq(schema.professionalBlocks.professionalId, integration.professionalId),
        eq(schema.professionalBlocks.externalSource, 'GOOGLE'),
      ),
    });

    const existingMap = new Map(existingBlocks.map((b) => [b.externalEventId, b]));
    const processedIds = new Set<string>();

    for (const event of events) {
      processedIds.add(event.id);
      const existing = existingMap.get(event.id);

      const { startDate, endDate, startTime, endTime, allDay } = this.parseEventDates(event);

      if (existing) {
        // Atualiza se mudou
        const needsUpdate =
          existing.title !== event.summary ||
          existing.startDate !== startDate ||
          existing.endDate !== endDate;

        if (needsUpdate) {
          await db
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
            .where(eq(schema.professionalBlocks.id, existing.id));
          updated++;
        }
      } else {
        // Cria novo
        await db.insert(schema.professionalBlocks).values({
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
        await db
          .delete(schema.professionalBlocks)
          .where(eq(schema.professionalBlocks.id, block.id));
        deleted++;
      }
    }

    return { created, updated, deleted };
  }

  private parseEventDates(event: GoogleEvent): {
    startDate: string;
    endDate: string;
    startTime: string | null;
    endTime: string | null;
    allDay: boolean;
  } {
    if (event.start.date) {
      return {
        startDate: event.start.date,
        endDate: event.end.date || event.start.date,
        startTime: null,
        endTime: null,
        allDay: true,
      };
    }

    const startDt = new Date(event.start.dateTime!);
    const endDt = new Date(event.end.dateTime!);

    return {
      startDate: startDt.toISOString().split('T')[0],
      endDate: endDt.toISOString().split('T')[0],
      startTime: startDt.toTimeString().slice(0, 5),
      endTime: endDt.toTimeString().slice(0, 5),
      allDay: false,
    };
  }

  private async tryReactivateIntegration(
    integration: schema.GoogleIntegration,
  ): Promise<void> {
    try {
      await this.refreshToken(integration);
      this.logger.log(`Reactivated integration ${integration.id}`);
    } catch {
      this.logger.warn(`Could not reactivate integration ${integration.id}`);
    }
  }
}

interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
  status: string;
}
