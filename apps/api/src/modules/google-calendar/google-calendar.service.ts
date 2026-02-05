import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';
import { db } from '../../database/connection';
import { googleCalendarTokens, appointments, clients, professionalBlocks, users } from '../../database/schema';
import { eq, and } from 'drizzle-orm';

/**
 * =====================================================
 * GOOGLE CALENDAR SERVICE
 * Integração bidirecional com Google Calendar
 * =====================================================
 */

export interface SyncResult {
  success: boolean;
  eventId?: string;
  error?: string;
}

export interface GoogleCalendarStatus {
  connected: boolean;
  email?: string;
  calendarId?: string;
  lastSyncAt?: Date;
  syncEnabled?: boolean;
}

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private oauth2Client;

  private readonly SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  constructor(private configService: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  /**
   * Codifica string para Base64 URL-safe
   * Substitui + por -, / por _, remove =
   */
  private encodeBase64UrlSafe(data: string): string {
    return Buffer.from(data)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Decodifica Base64 URL-safe para string
   * Restaura + e / e adiciona padding se necessário
   */
  private decodeBase64UrlSafe(data: string): string {
    // Restaura caracteres Base64 padrão
    let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    // Adiciona padding se necessário
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString();
  }

  /**
   * Gera a URL de autorização OAuth2 do Google
   * Inclui state para preservar userId/salonId
   */
  getAuthUrl(userId: string, salonId: string): string {
    const state = this.encodeBase64UrlSafe(JSON.stringify({ userId, salonId }));

    this.logger.log(`Gerando auth URL para userId=${userId}, salonId=${salonId}`);
    this.logger.debug(`State gerado: ${state}`);

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
      prompt: 'consent',
      state,
    });
  }

  /**
   * Processa o callback do OAuth2 e salva os tokens no banco
   */
  async handleCallback(code: string, state: string): Promise<{ success: boolean; email?: string }> {
    try {
      // Log detalhado para diagnóstico
      this.logger.log(`[OAuth Callback] Iniciando processamento`);
      this.logger.log(`[OAuth Callback] Code length: ${code?.length || 0}`);
      this.logger.log(`[OAuth Callback] Code preview: ${code?.substring(0, 20)}...`);
      this.logger.log(`[OAuth Callback] State: ${state}`);

      // Decodifica state para obter userId e salonId (suporta ambos formatos)
      let decodedState: string;
      try {
        decodedState = this.decodeBase64UrlSafe(state);
      } catch {
        // Fallback para Base64 padrão (compatibilidade)
        decodedState = Buffer.from(state, 'base64').toString();
      }

      this.logger.debug(`State decodificado: ${decodedState}`);

      const { userId, salonId } = JSON.parse(decodedState);

      if (!userId || !salonId) {
        this.logger.error(`State inválido - userId: ${userId}, salonId: ${salonId}`);
        throw new BadRequestException('Estado inválido na autenticação');
      }

      this.logger.log(`[OAuth Callback] Processando para userId=${userId}, salonId=${salonId}`);

      // Troca o código por tokens
      this.logger.log(`[OAuth Callback] Iniciando troca de código por tokens...`);
      this.logger.log(`[OAuth Callback] Redirect URI configurado: ${this.configService.get<string>('GOOGLE_REDIRECT_URI')}`);

      let tokens;
      try {
        const response = await this.oauth2Client.getToken(code);
        tokens = response.tokens;
        this.logger.log(`[OAuth Callback] Tokens obtidos com sucesso`);
      } catch (tokenError: any) {
        this.logger.error(`[OAuth Callback] Falha ao obter tokens: ${tokenError?.message}`);
        this.logger.error(`[OAuth Callback] Detalhes: ${JSON.stringify({
          error: tokenError?.response?.data?.error,
          error_description: tokenError?.response?.data?.error_description,
        })}`);
        throw tokenError;
      }
      this.oauth2Client.setCredentials(tokens);

      // Obtém email do usuário Google
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      const email = userInfo.data.email;

      // Salva ou atualiza tokens no banco
      const existingToken = await db
        .select()
        .from(googleCalendarTokens)
        .where(and(eq(googleCalendarTokens.userId, userId), eq(googleCalendarTokens.salonId, salonId)))
        .limit(1);

      const tokenData = {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        tokenExpiry: new Date(tokens.expiry_date!),
        calendarId: email || 'primary',
        syncEnabled: true,
        updatedAt: new Date(),
      };

      if (existingToken.length > 0) {
        await db
          .update(googleCalendarTokens)
          .set(tokenData)
          .where(eq(googleCalendarTokens.id, existingToken[0].id));
      } else {
        await db.insert(googleCalendarTokens).values({
          userId,
          salonId,
          ...tokenData,
        });
      }

      this.logger.log(`Google Calendar conectado para usuário ${userId}`);

      return { success: true, email: email || undefined };
    } catch (error: any) {
      // Log detalhado para diagnosticar o erro
      this.logger.error('Erro ao processar callback do Google:', {
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        stack: error?.stack?.substring(0, 500),
      });

      // Extrai mensagem de erro mais específica
      const errorMessage =
        error?.response?.data?.error_description ||
        error?.response?.data?.error ||
        error?.message ||
        'Erro desconhecido';

      throw new BadRequestException(`Falha na autenticação com Google: ${errorMessage}`);
    }
  }

  /**
   * Obtém tokens válidos para um usuário, atualizando se necessário
   */
  async getValidTokens(userId: string, salonId: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    const [token] = await db
      .select()
      .from(googleCalendarTokens)
      .where(and(eq(googleCalendarTokens.userId, userId), eq(googleCalendarTokens.salonId, salonId)))
      .limit(1);

    if (!token) {
      return null;
    }

    // Verifica se o token expirou (com 5 min de margem)
    const now = new Date();
    const expiryWithMargin = new Date(token.tokenExpiry.getTime() - 5 * 60 * 1000);

    if (now >= expiryWithMargin) {
      // Renova o token
      const newTokens = await this.refreshTokenIfNeeded(token.refreshToken);
      if (newTokens) {
        await db
          .update(googleCalendarTokens)
          .set({
            accessToken: newTokens.accessToken,
            tokenExpiry: newTokens.expiry,
            updatedAt: new Date(),
          })
          .where(eq(googleCalendarTokens.id, token.id));

        return { accessToken: newTokens.accessToken, refreshToken: token.refreshToken };
      }
      return null;
    }

    return { accessToken: token.accessToken, refreshToken: token.refreshToken };
  }

  /**
   * =====================================================
   * TOKEN DE SERVIÇO DO SALÃO
   * Obtém tokens válidos para o SALÃO (conta principal)
   * Independente de qual profissional está logado
   * =====================================================
   */
  async getSalonTokens(salonId: string): Promise<{ accessToken: string; refreshToken: string; calendarId: string } | null> {
    // Busca QUALQUER token válido conectado ao salão (syncEnabled = true)
    const [token] = await db
      .select()
      .from(googleCalendarTokens)
      .where(and(
        eq(googleCalendarTokens.salonId, salonId),
        eq(googleCalendarTokens.syncEnabled, true),
      ))
      .limit(1);

    if (!token) {
      this.logger.debug(`[SALON_TOKEN] Nenhum token encontrado para salonId=${salonId}`);
      return null;
    }

    // Verifica se o token expirou (com 5 min de margem)
    const now = new Date();
    const expiryWithMargin = new Date(token.tokenExpiry.getTime() - 5 * 60 * 1000);

    if (now >= expiryWithMargin) {
      // Renova o token
      const newTokens = await this.refreshTokenIfNeeded(token.refreshToken);
      if (newTokens) {
        await db
          .update(googleCalendarTokens)
          .set({
            accessToken: newTokens.accessToken,
            tokenExpiry: newTokens.expiry,
            updatedAt: new Date(),
          })
          .where(eq(googleCalendarTokens.id, token.id));

        this.logger.debug(`[SALON_TOKEN] Token renovado para salonId=${salonId}`);
        return {
          accessToken: newTokens.accessToken,
          refreshToken: token.refreshToken,
          calendarId: token.calendarId || 'primary',
        };
      }
      this.logger.warn(`[SALON_TOKEN] Falha ao renovar token para salonId=${salonId}`);
      return null;
    }

    return {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      calendarId: token.calendarId || 'primary',
    };
  }

  /**
   * Renova o access token usando o refresh token
   */
  async refreshTokenIfNeeded(refreshToken: string): Promise<{ accessToken: string; expiry: Date } | null> {
    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await this.oauth2Client.refreshAccessToken();

      return {
        accessToken: credentials.access_token!,
        expiry: new Date(credentials.expiry_date!),
      };
    } catch (error: any) {
      this.logger.error('Erro ao renovar token:', error?.message);
      return null;
    }
  }

  /**
   * Sincroniza um agendamento do sistema para o Google Calendar
   */
  async syncAppointmentToGoogle(
    userId: string,
    salonId: string,
    appointmentId: string,
  ): Promise<SyncResult> {
    try {
      const tokens = await this.getValidTokens(userId, salonId);
      if (!tokens) {
        return { success: false, error: 'Google Calendar não conectado' };
      }

      // Busca o agendamento com dados relacionados
      const [appointment] = await db
        .select({
          id: appointments.id,
          date: appointments.date,
          time: appointments.time,
          startTime: appointments.startTime,
          endTime: appointments.endTime,
          duration: appointments.duration,
          service: appointments.service,
          status: appointments.status,
          clientId: appointments.clientId,
          googleEventId: appointments.googleEventId,
        })
        .from(appointments)
        .where(eq(appointments.id, appointmentId))
        .limit(1);

      if (!appointment) {
        return { success: false, error: 'Agendamento não encontrado' };
      }

      // Busca dados do cliente
      let clientName = 'Cliente';
      if (appointment.clientId) {
        const [client] = await db
          .select({ name: clients.name })
          .from(clients)
          .where(eq(clients.id, appointment.clientId))
          .limit(1);
        if (client?.name) {
          clientName = client.name;
        }
      }

      // Configura o cliente OAuth
      this.oauth2Client.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Monta o horário do evento
      const dateStr = appointment.date;
      const startTime = appointment.startTime || appointment.time;
      const endTime = appointment.endTime || this.calculateEndTime(startTime!, appointment.duration);

      const event: calendar_v3.Schema$Event = {
        summary: `${appointment.service} - ${clientName}`,
        description: `Agendamento via Beauty Manager\nServiço: ${appointment.service}\nCliente: ${clientName}`,
        start: {
          dateTime: `${dateStr}T${startTime}:00`,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: `${dateStr}T${endTime}:00`,
          timeZone: 'America/Sao_Paulo',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'popup', minutes: 60 },
          ],
        },
      };

      let eventId: string;

      if (appointment.googleEventId) {
        // Atualiza evento existente
        const response = await calendar.events.update({
          calendarId: 'primary',
          eventId: appointment.googleEventId,
          requestBody: event,
        });
        eventId = response.data.id!;
      } else {
        // Cria novo evento
        const response = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: event,
        });
        eventId = response.data.id!;

        // Salva o eventId no agendamento
        await db
          .update(appointments)
          .set({ googleEventId: eventId })
          .where(eq(appointments.id, appointmentId));
      }

      this.logger.log(`Agendamento ${appointmentId} sincronizado com Google Calendar: ${eventId}`);

      return { success: true, eventId };
    } catch (error: any) {
      this.logger.error('Erro ao sincronizar com Google:', error?.message);
      return { success: false, error: error?.message || 'Erro desconhecido' };
    }
  }

  /**
   * =====================================================
   * SINCRONIZAÇÃO AUTOMÁTICA VIA CONTA DO SALÃO
   * Usa os tokens do salão principal (salaosanches@gmail.com)
   * Título: "Serviço - Profissional"
   * =====================================================
   */
  async syncAppointmentToGoogleBySalon(
    salonId: string,
    appointmentId: string,
  ): Promise<SyncResult> {
    try {
      const tokens = await this.getSalonTokens(salonId);
      if (!tokens) {
        return { success: false, error: 'Google Calendar do salão não conectado' };
      }

      // Busca o agendamento com dados do profissional
      const [appointment] = await db
        .select({
          id: appointments.id,
          date: appointments.date,
          time: appointments.time,
          startTime: appointments.startTime,
          endTime: appointments.endTime,
          duration: appointments.duration,
          service: appointments.service,
          status: appointments.status,
          clientId: appointments.clientId,
          clientName: appointments.clientName,
          professionalId: appointments.professionalId,
          googleEventId: appointments.googleEventId,
        })
        .from(appointments)
        .where(eq(appointments.id, appointmentId))
        .limit(1);

      if (!appointment) {
        return { success: false, error: 'Agendamento não encontrado' };
      }

      // Busca nome do profissional
      let professionalName = 'Profissional';
      if (appointment.professionalId) {
        const [professional] = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, appointment.professionalId))
          .limit(1);
        if (professional?.name) {
          professionalName = professional.name;
        }
      }

      // Busca dados do cliente
      let clientName = appointment.clientName || 'Cliente';
      if (appointment.clientId && !appointment.clientName) {
        const [client] = await db
          .select({ name: clients.name })
          .from(clients)
          .where(eq(clients.id, appointment.clientId))
          .limit(1);
        if (client?.name) {
          clientName = client.name;
        }
      }

      // Configura o cliente OAuth
      this.oauth2Client.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Monta o horário do evento
      const dateStr = appointment.date;
      const startTime = appointment.startTime || appointment.time;
      const endTime = appointment.endTime || this.calculateEndTime(startTime!, appointment.duration);

      // TÍTULO: "Serviço - Profissional" (Ex: "Progressiva - Nicole")
      const eventTitle = `${appointment.service} - ${professionalName}`;

      const event: calendar_v3.Schema$Event = {
        summary: eventTitle,
        description: `Agendamento via Beauty Manager\nServiço: ${appointment.service}\nProfissional: ${professionalName}\nCliente: ${clientName}`,
        start: {
          dateTime: `${dateStr}T${startTime}:00`,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: `${dateStr}T${endTime}:00`,
          timeZone: 'America/Sao_Paulo',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'popup', minutes: 60 },
          ],
        },
      };

      let eventId: string;

      if (appointment.googleEventId) {
        // Atualiza evento existente
        const response = await calendar.events.update({
          calendarId: tokens.calendarId,
          eventId: appointment.googleEventId,
          requestBody: event,
        });
        eventId = response.data.id!;
        this.logger.log(`[SYNC_AUTO_GOOGLE_SUCCESS] UPDATE ${appointmentId} -> ${eventId} (${eventTitle})`);
      } else {
        // Cria novo evento
        const response = await calendar.events.insert({
          calendarId: tokens.calendarId,
          requestBody: event,
        });
        eventId = response.data.id!;

        // Salva o eventId no agendamento
        await db
          .update(appointments)
          .set({ googleEventId: eventId })
          .where(eq(appointments.id, appointmentId));

        this.logger.log(`[SYNC_AUTO_GOOGLE_SUCCESS] CREATE ${appointmentId} -> ${eventId} (${eventTitle})`);
      }

      return { success: true, eventId };
    } catch (error: any) {
      this.logger.error(`[SYNC_AUTO_GOOGLE_ERROR] ${appointmentId}: ${error?.message}`);
      return { success: false, error: error?.message || 'Erro desconhecido' };
    }
  }

  /**
   * Remove evento do Google Calendar usando tokens do salão
   */
  async deleteEventFromGoogleBySalon(
    salonId: string,
    googleEventId: string,
  ): Promise<SyncResult> {
    try {
      const tokens = await this.getSalonTokens(salonId);
      if (!tokens) {
        return { success: false, error: 'Google Calendar do salão não conectado' };
      }

      this.oauth2Client.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      await calendar.events.delete({
        calendarId: tokens.calendarId,
        eventId: googleEventId,
      });

      this.logger.log(`[SYNC_AUTO_GOOGLE_SUCCESS] DELETE ${googleEventId}`);

      return { success: true };
    } catch (error: any) {
      // 404 não é erro - evento já foi removido
      if (error?.code === 404) {
        this.logger.debug(`[SYNC_AUTO_GOOGLE_INFO] Evento ${googleEventId} já removido do Google`);
        return { success: true };
      }
      this.logger.error(`[SYNC_AUTO_GOOGLE_ERROR] DELETE ${googleEventId}: ${error?.message}`);
      return { success: false, error: error?.message || 'Erro desconhecido' };
    }
  }

  /**
   * Remove um evento do Google Calendar
   */
  async deleteEventFromGoogle(
    userId: string,
    salonId: string,
    googleEventId: string,
  ): Promise<SyncResult> {
    try {
      const tokens = await this.getValidTokens(userId, salonId);
      if (!tokens) {
        return { success: false, error: 'Google Calendar não conectado' };
      }

      this.oauth2Client.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId,
      });

      this.logger.log(`Evento ${googleEventId} removido do Google Calendar`);

      return { success: true };
    } catch (error: any) {
      // 404 não é erro - evento já foi removido
      if (error?.code === 404) {
        return { success: true };
      }
      this.logger.error('Erro ao remover evento do Google:', error?.message);
      return { success: false, error: error?.message || 'Erro desconhecido' };
    }
  }

  /**
   * Importa eventos do Google Calendar para o sistema como bloqueios
   * (eventos pessoais do profissional que bloqueiam sua agenda)
   */
  async syncGoogleToSystem(
    userId: string,
    salonId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ events: calendar_v3.Schema$Event[]; count: number }> {
    try {
      const tokens = await this.getValidTokens(userId, salonId);
      if (!tokens) {
        throw new BadRequestException('Google Calendar não conectado');
      }

      this.oauth2Client.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 100,
      });

      const events = response.data.items || [];

      // Filtra eventos que não são do Beauty Manager (sem nossa descrição)
      const externalEvents = events.filter(
        (e) => !e.description?.includes('Beauty Manager'),
      );

      // Atualiza lastSyncAt
      await db
        .update(googleCalendarTokens)
        .set({ lastSyncAt: new Date(), updatedAt: new Date() })
        .where(and(eq(googleCalendarTokens.userId, userId), eq(googleCalendarTokens.salonId, salonId)));

      return { events: externalEvents, count: externalEvents.length };
    } catch (error: any) {
      this.logger.error('Erro ao buscar eventos do Google:', error?.message);
      throw new BadRequestException('Erro ao sincronizar com Google Calendar');
    }
  }

  /**
   * Desconecta o Google Calendar do usuário
   */
  async disconnectGoogle(userId: string, salonId: string): Promise<void> {
    const deleted = await db
      .delete(googleCalendarTokens)
      .where(and(eq(googleCalendarTokens.userId, userId), eq(googleCalendarTokens.salonId, salonId)))
      .returning();

    if (deleted.length === 0) {
      throw new NotFoundException('Conexão Google Calendar não encontrada');
    }

    this.logger.log(`Google Calendar desconectado para usuário ${userId}`);
  }

  /**
   * Obtém status da conexão Google Calendar
   */
  async getConnectionStatus(userId: string, salonId: string): Promise<GoogleCalendarStatus> {
    const [token] = await db
      .select()
      .from(googleCalendarTokens)
      .where(and(eq(googleCalendarTokens.userId, userId), eq(googleCalendarTokens.salonId, salonId)))
      .limit(1);

    if (!token) {
      return { connected: false };
    }

    return {
      connected: true,
      email: token.calendarId || undefined,
      calendarId: token.calendarId || 'primary',
      lastSyncAt: token.lastSyncAt || undefined,
      syncEnabled: token.syncEnabled ?? true,
    };
  }

  /**
   * Alterna sincronização automática
   */
  async toggleSync(userId: string, salonId: string, enabled: boolean): Promise<void> {
    const result = await db
      .update(googleCalendarTokens)
      .set({ syncEnabled: enabled, updatedAt: new Date() })
      .where(and(eq(googleCalendarTokens.userId, userId), eq(googleCalendarTokens.salonId, salonId)))
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('Conexão Google Calendar não encontrada');
    }
  }

  /**
   * Calcula horário de término baseado no início e duração
   */
  private calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  /**
   * Importa eventos do Google Calendar como bloqueios na agenda do profissional
   * Eventos do Beauty Manager (com "Beauty Manager" na descrição) são ignorados
   */
  async importGoogleEventsAsBlocks(
    userId: string,
    salonId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ created: number; updated: number; deleted: number }> {
    const tokens = await this.getValidTokens(userId, salonId);
    if (!tokens) {
      return { created: 0, updated: 0, deleted: 0 };
    }

    this.oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
    });

    const events = response.data.items || [];

    // Filtra eventos que NÃO são do Beauty Manager
    const externalEvents = events.filter(
      e => !e.description?.includes('Beauty Manager') && e.status !== 'cancelled'
    );

    // Busca bloqueios existentes do Google
    const existingBlocks = await db
      .select()
      .from(professionalBlocks)
      .where(
        and(
          eq(professionalBlocks.professionalId, userId),
          eq(professionalBlocks.salonId, salonId),
          eq(professionalBlocks.externalSource, 'GOOGLE'),
        )
      );

    const existingMap = new Map(existingBlocks.map(b => [b.externalEventId, b]));
    const processedIds = new Set<string>();

    let created = 0, updated = 0, deleted = 0;

    for (const event of externalEvents) {
      if (!event.id) continue;
      processedIds.add(event.id);

      const existing = existingMap.get(event.id);
      const { startDate: sDate, endDate: eDate, startTime, endTime, allDay } = this.parseEventDates(event);

      if (existing) {
        // Atualiza se mudou (incluindo horários para corrigir timezone)
        const needsUpdate =
          existing.title !== event.summary ||
          existing.startDate !== sDate ||
          existing.endDate !== eDate ||
          existing.startTime !== startTime ||
          existing.endTime !== endTime;

        if (needsUpdate) {
          await db.update(professionalBlocks)
            .set({
              title: event.summary || 'Evento Google',
              description: event.description || null,
              startDate: sDate,
              endDate: eDate,
              startTime,
              endTime,
              allDay,
              updatedAt: new Date(),
            })
            .where(eq(professionalBlocks.id, existing.id));
          updated++;
        }
      } else {
        // Cria novo bloqueio
        await db.insert(professionalBlocks).values({
          salonId,
          professionalId: userId,
          type: 'OTHER',
          title: event.summary || 'Evento Google',
          description: event.description || null,
          startDate: sDate,
          endDate: eDate,
          startTime,
          endTime,
          allDay,
          status: 'APPROVED',
          externalSource: 'GOOGLE',
          externalEventId: event.id,
          createdById: userId,
        });
        created++;
      }
    }

    // Remove bloqueios que não existem mais no Google
    for (const block of existingBlocks) {
      if (block.externalEventId && !processedIds.has(block.externalEventId)) {
        await db.delete(professionalBlocks).where(eq(professionalBlocks.id, block.id));
        deleted++;
      }
    }

    // Atualiza lastSyncAt
    await db.update(googleCalendarTokens)
      .set({ lastSyncAt: new Date(), updatedAt: new Date() })
      .where(and(
        eq(googleCalendarTokens.userId, userId),
        eq(googleCalendarTokens.salonId, salonId),
      ));

    this.logger.log(`Google import: ${created} created, ${updated} updated, ${deleted} deleted`);
    return { created, updated, deleted };
  }

  private parseEventDates(event: calendar_v3.Schema$Event): {
    startDate: string;
    endDate: string;
    startTime: string | null;
    endTime: string | null;
    allDay: boolean;
  } {
    if (event.start?.date) {
      return {
        startDate: event.start.date,
        endDate: event.end?.date || event.start.date,
        startTime: null,
        endTime: null,
        allDay: true,
      };
    }

    // Extract local date/time directly from the ISO string to preserve timezone
    // Google returns format like "2026-02-04T09:00:00-03:00"
    const startDateTime = event.start!.dateTime!;
    const endDateTime = event.end!.dateTime!;

    // Extract date and time from ISO string (YYYY-MM-DDTHH:MM:SS)
    const startMatch = startDateTime.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
    const endMatch = endDateTime.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);

    if (!startMatch || !endMatch) {
      // Fallback to Date parsing if regex fails
      const startDt = new Date(startDateTime);
      const endDt = new Date(endDateTime);
      return {
        startDate: startDt.toISOString().split('T')[0],
        endDate: endDt.toISOString().split('T')[0],
        startTime: startDt.toTimeString().slice(0, 5),
        endTime: endDt.toTimeString().slice(0, 5),
        allDay: false,
      };
    }

    return {
      startDate: startMatch[1],
      endDate: endMatch[1],
      startTime: startMatch[2],
      endTime: endMatch[2],
      allDay: false,
    };
  }
}
