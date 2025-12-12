import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db } from '../../database/connection';
import * as schema from '../../database/schema';
import {
  GoogleCalendarEvent,
  GoogleTokens,
  GoogleUserInfo,
  SyncDirection,
  IntegrationStatus,
} from './dto';

/**
 * GoogleCalendarService
 * Handles OAuth flow and Google Calendar API interactions
 */
@Injectable()
export class GoogleCalendarService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/calendar/google/callback';
  }

  /**
   * Verifica se a integração está configurada
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  /**
   * Gera URL de autenticação OAuth
   */
  getAuthUrl(state: string): string {
    if (!this.isConfigured()) {
      throw new BadRequestException('Google Calendar não configurado. Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET.');
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Troca código de autorização por tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    if (!this.isConfigured()) {
      throw new BadRequestException('Google Calendar não configurado.');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google OAuth error:', error);
      throw new BadRequestException('Falha ao autenticar com Google. Tente novamente.');
    }

    return (await response.json()) as GoogleTokens;
  }

  /**
   * Renova access token usando refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
    if (!this.isConfigured()) {
      throw new BadRequestException('Google Calendar não configurado.');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Sessão expirada. Reconecte sua conta Google.');
    }

    return (await response.json()) as GoogleTokens;
  }

  /**
   * Obtém informações do usuário Google
   */
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Falha ao obter informações do usuário Google.');
    }

    return (await response.json()) as GoogleUserInfo;
  }

  /**
   * Lista eventos do calendário
   */
  async listEvents(
    accessToken: string,
    calendarId: string = 'primary',
    timeMin?: Date,
    timeMax?: Date,
    pageToken?: string,
  ): Promise<{ events: GoogleCalendarEvent[]; nextPageToken?: string }> {
    const params = new URLSearchParams({
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
    });

    if (timeMin) params.append('timeMin', timeMin.toISOString());
    if (timeMax) params.append('timeMax', timeMax.toISOString());
    if (pageToken) params.append('pageToken', pageToken);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Calendar API error:', error);
      throw new BadRequestException('Falha ao listar eventos do Google Calendar.');
    }

    const data = (await response.json()) as { items: GoogleCalendarEvent[]; nextPageToken?: string };
    return {
      events: data.items || [],
      nextPageToken: data.nextPageToken,
    };
  }

  /**
   * Obtém um evento específico
   */
  async getEvent(accessToken: string, calendarId: string, eventId: string): Promise<GoogleCalendarEvent | null> {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (response.status === 404) return null;

    if (!response.ok) {
      throw new BadRequestException('Falha ao obter evento do Google Calendar.');
    }

    return (await response.json()) as GoogleCalendarEvent;
  }

  /**
   * Cria um evento no calendário
   */
  async createEvent(
    accessToken: string,
    calendarId: string,
    event: Partial<GoogleCalendarEvent>,
  ): Promise<GoogleCalendarEvent> {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Calendar create error:', error);
      throw new BadRequestException('Falha ao criar evento no Google Calendar.');
    }

    return (await response.json()) as GoogleCalendarEvent;
  }

  /**
   * Atualiza um evento no calendário
   */
  async updateEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    event: Partial<GoogleCalendarEvent>,
  ): Promise<GoogleCalendarEvent> {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      },
    );

    if (!response.ok) {
      throw new BadRequestException('Falha ao atualizar evento no Google Calendar.');
    }

    return (await response.json()) as GoogleCalendarEvent;
  }

  /**
   * Remove um evento do calendário
   */
  async deleteEvent(accessToken: string, calendarId: string, eventId: string): Promise<void> {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok && response.status !== 404) {
      throw new BadRequestException('Falha ao remover evento do Google Calendar.');
    }
  }

  /**
   * Lista calendários disponíveis
   */
  async listCalendars(accessToken: string): Promise<Array<{ id: string; summary: string; primary?: boolean }>> {
    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new BadRequestException('Falha ao listar calendários.');
    }

    const data = (await response.json()) as { items: Array<{ id: string; summary: string; primary?: boolean }> };
    return data.items || [];
  }

  // ==================== INTEGRAÇÃO DATABASE ====================

  /**
   * Salva ou atualiza integração no banco
   */
  async saveIntegration(
    salonId: string,
    professionalId: string,
    googleEmail: string,
    tokens: GoogleTokens,
    calendarId: string = 'primary',
    syncDirection: SyncDirection = SyncDirection.GOOGLE_TO_APP,
  ): Promise<schema.GoogleIntegration> {
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Verifica se já existe integração
    const existing = await db.query.googleIntegrations.findFirst({
      where: and(
        eq(schema.googleIntegrations.salonId, salonId),
        eq(schema.googleIntegrations.professionalId, professionalId),
      ),
    });

    if (existing) {
      // Atualiza integração existente
      const [updated] = await db
        .update(schema.googleIntegrations)
        .set({
          googleAccountEmail: googleEmail,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || existing.refreshToken,
          tokenExpiresAt,
          calendarId,
          syncDirection,
          status: 'ACTIVE',
          errorMessage: null,
          updatedAt: new Date(),
        })
        .where(eq(schema.googleIntegrations.id, existing.id))
        .returning();

      return updated;
    }

    // Cria nova integração
    const [integration] = await db
      .insert(schema.googleIntegrations)
      .values({
        salonId,
        professionalId,
        googleAccountEmail: googleEmail,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || '',
        tokenExpiresAt,
        calendarId,
        syncDirection,
      })
      .returning();

    return integration;
  }

  /**
   * Obtém integração ativa para profissional
   */
  async getIntegration(salonId: string, professionalId: string): Promise<schema.GoogleIntegration | null> {
    const integration = await db.query.googleIntegrations.findFirst({
      where: and(
        eq(schema.googleIntegrations.salonId, salonId),
        eq(schema.googleIntegrations.professionalId, professionalId),
      ),
    });

    return integration || null;
  }

  /**
   * Obtém access token válido, renovando se necessário
   */
  async getValidAccessToken(integration: schema.GoogleIntegration): Promise<string> {
    // Verifica se token ainda é válido (com margem de 5 minutos)
    const now = new Date();
    const expiresAt = new Date(integration.tokenExpiresAt);
    expiresAt.setMinutes(expiresAt.getMinutes() - 5);

    if (now < expiresAt) {
      return integration.accessToken;
    }

    // Token expirado, renova
    try {
      const tokens = await this.refreshAccessToken(integration.refreshToken);
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
    } catch (error) {
      // Marca integração com erro
      await db
        .update(schema.googleIntegrations)
        .set({
          status: 'TOKEN_EXPIRED',
          errorMessage: 'Token expirado. Reconecte sua conta Google.',
          updatedAt: new Date(),
        })
        .where(eq(schema.googleIntegrations.id, integration.id));

      throw new UnauthorizedException('Sessão Google expirada. Reconecte sua conta.');
    }
  }

  /**
   * Desconecta integração
   */
  async disconnectIntegration(salonId: string, professionalId: string): Promise<void> {
    // Revoga token no Google
    const integration = await this.getIntegration(salonId, professionalId);
    if (integration) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${integration.accessToken}`, {
          method: 'POST',
        });
      } catch {
        // Ignora erros de revogação
      }

      // Atualiza status no banco
      await db
        .update(schema.googleIntegrations)
        .set({
          status: 'DISCONNECTED',
          syncEnabled: false,
          updatedAt: new Date(),
        })
        .where(eq(schema.googleIntegrations.id, integration.id));
    }
  }

  /**
   * Atualiza configurações da integração
   */
  async updateSettings(
    integrationId: string,
    settings: { calendarId?: string; syncDirection?: SyncDirection; syncEnabled?: boolean },
  ): Promise<schema.GoogleIntegration> {
    const [updated] = await db
      .update(schema.googleIntegrations)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(schema.googleIntegrations.id, integrationId))
      .returning();

    return updated;
  }

  /**
   * Marca erro na integração
   */
  async markError(integrationId: string, errorMessage: string): Promise<void> {
    await db
      .update(schema.googleIntegrations)
      .set({
        status: 'ERROR',
        errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(schema.googleIntegrations.id, integrationId));
  }

  /**
   * Atualiza timestamp de última sincronização
   */
  async updateLastSync(integrationId: string, status: IntegrationStatus): Promise<void> {
    await db
      .update(schema.googleIntegrations)
      .set({
        lastSyncAt: new Date(),
        lastSyncStatus: status,
        status: status === IntegrationStatus.ERROR ? 'ERROR' : 'ACTIVE',
        updatedAt: new Date(),
      })
      .where(eq(schema.googleIntegrations.id, integrationId));
  }

  /**
   * Lista todas as integrações ativas para sincronização
   */
  async getActiveIntegrations(): Promise<schema.GoogleIntegration[]> {
    return db.query.googleIntegrations.findMany({
      where: and(
        eq(schema.googleIntegrations.syncEnabled, true),
        eq(schema.googleIntegrations.status, 'ACTIVE'),
      ),
    });
  }
}
