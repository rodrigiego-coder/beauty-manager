import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  private oauth2Client;

  private readonly SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly',
  ];

  constructor(private configService: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  /**
   * Gera a URL de autorizacao OAuth2 do Google
   * O cabeleireiro acessa essa URL para permitir que o sistema leia sua agenda
   */
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
      prompt: 'consent',
    });
  }

  /**
   * Troca o codigo de autorizacao por tokens de acesso
   * @param code Codigo retornado pelo Google apos autorizacao
   */
  async getTokensFromCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * Configura os tokens no cliente OAuth2
   * @param tokens Tokens de acesso e refresh
   */
  setCredentials(tokens: {
    access_token?: string | null;
    refresh_token?: string | null;
  }) {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Lista os eventos do calendario do usuario
   * @param tokens Tokens de acesso do usuario
   * @param options Opcoes de busca (datas, quantidade)
   */
  async listEvents(
    tokens: { access_token?: string | null; refresh_token?: string | null },
    options?: {
      timeMin?: Date;
      timeMax?: Date;
      maxResults?: number;
    },
  ): Promise<calendar_v3.Schema$Event[]> {
    this.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: options?.timeMin?.toISOString() || new Date().toISOString(),
      timeMax: options?.timeMax?.toISOString(),
      maxResults: options?.maxResults || 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  }

  /**
   * Busca os horarios ocupados do calendario
   * @param tokens Tokens de acesso do usuario
   * @param timeMin Data inicial
   * @param timeMax Data final
   */
  async getBusySlots(
    tokens: { access_token?: string | null; refresh_token?: string | null },
    timeMin: Date,
    timeMax: Date,
  ) {
    this.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: [{ id: 'primary' }],
      },
    });

    return response.data.calendars?.primary?.busy || [];
  }
}
