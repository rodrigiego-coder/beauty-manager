import { Controller, Get, Query, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { GoogleCalendarService } from './google-calendar.service';

@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  /**
   * GET /google-calendar/auth
   * Retorna a URL de autorizacao do Google
   */
  @Get('auth')
  getAuthUrl() {
    const url = this.googleCalendarService.getAuthUrl();
    return { url };
  }

  /**
   * GET /google-calendar/auth/redirect
   * Redireciona o usuario para autorizar no Google
   */
  @Get('auth/redirect')
  redirectToGoogle(@Res() reply: FastifyReply) {
    const url = this.googleCalendarService.getAuthUrl();
    return reply.redirect(url);
  }

  /**
   * GET /google-calendar/callback
   * Callback chamado pelo Google apos autorizacao
   * Recebe o codigo e troca por tokens
   */
  @Get('callback')
  async handleCallback(@Query('code') code: string) {
    if (!code) {
      return { error: 'Codigo de autorizacao nao fornecido' };
    }

    const tokens = await this.googleCalendarService.getTokensFromCode(code);

    // Em producao, salve esses tokens no banco de dados
    // associados ao usuario/cabeleireiro
    return {
      message: 'Autorizacao concedida com sucesso!',
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
      },
    };
  }
}
