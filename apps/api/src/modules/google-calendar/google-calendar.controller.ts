import { Controller, Get, Post, Delete, Query, Res, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { GoogleCalendarService } from './google-calendar.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Google Calendar')
@ApiBearerAuth()
@Controller('integrations/google')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  /**
   * GET /integrations/google/status
   * Verifica status da conexão Google Calendar
   */
  @Get('status')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  @ApiOperation({ summary: 'Verificar status da conexão Google Calendar' })
  async getStatus(@CurrentUser() user: JwtPayload) {
    return this.googleCalendarService.getConnectionStatus(user.sub, user.salonId);
  }

  /**
   * GET /integrations/google/auth
   * Redireciona para autorização do Google
   */
  @Get('auth')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  @ApiOperation({ summary: 'Iniciar fluxo de autorização Google Calendar' })
  async redirectToGoogle(@CurrentUser() user: JwtPayload, @Res() reply: FastifyReply) {
    const url = this.googleCalendarService.getAuthUrl(user.sub, user.salonId);
    return reply.redirect(url);
  }

  /**
   * GET /integrations/google/auth-url
   * Retorna a URL de autorização (para uso em popup)
   */
  @Get('auth-url')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  @ApiOperation({ summary: 'Obter URL de autorização Google Calendar' })
  async getAuthUrl(@CurrentUser() user: JwtPayload) {
    const url = this.googleCalendarService.getAuthUrl(user.sub, user.salonId);
    return { url };
  }

  /**
   * GET /integrations/google/callback
   * Callback OAuth2 do Google - PÚBLICO (chamado pelo Google)
   */
  @Public()
  @Get('callback')
  @ApiOperation({ summary: 'Callback OAuth2 do Google' })
  @ApiQuery({ name: 'code', required: true })
  @ApiQuery({ name: 'state', required: true })
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error?: string,
    @Res() reply?: FastifyReply,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'https://app.agendasalaopro.com.br';

    if (error) {
      reply?.status(302).redirect(`${frontendUrl}/integracoes?google=error&message=${encodeURIComponent(error)}`);
      return;
    }

    if (!code || !state) {
      reply?.status(302).redirect(`${frontendUrl}/integracoes?google=error&message=missing_params`);
      return;
    }

    try {
      const result = await this.googleCalendarService.handleCallback(code, state);

      if (result.success) {
        reply?.status(302).redirect(
          `${frontendUrl}/integracoes?google=success&email=${encodeURIComponent(result.email || '')}`,
        );
      } else {
        reply?.status(302).redirect(`${frontendUrl}/integracoes?google=error&message=auth_failed`);
      }
    } catch (err: any) {
      reply?.status(302).redirect(
        `${frontendUrl}/integracoes?google=error&message=${encodeURIComponent(err?.message || 'unknown')}`,
      );
    }
  }

  /**
   * POST /integrations/google/sync
   * Sincroniza um agendamento específico com Google Calendar
   */
  @Post('sync')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sincronizar agendamento com Google Calendar' })
  async syncAppointment(
    @CurrentUser() user: JwtPayload,
    @Body() body: { appointmentId: string },
  ) {
    return this.googleCalendarService.syncAppointmentToGoogle(
      user.sub,
      user.salonId,
      body.appointmentId,
    );
  }

  /**
   * POST /integrations/google/sync-from-google
   * Importa eventos do Google Calendar (próximos 30 dias)
   */
  @Post('sync-from-google')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Importar eventos do Google Calendar' })
  async syncFromGoogle(@CurrentUser() user: JwtPayload) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    return this.googleCalendarService.syncGoogleToSystem(
      user.sub,
      user.salonId,
      startDate,
      endDate,
    );
  }

  /**
   * DELETE /integrations/google/event
   * Remove um evento do Google Calendar
   */
  @Delete('event')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover evento do Google Calendar' })
  async deleteEvent(
    @CurrentUser() user: JwtPayload,
    @Body() body: { eventId: string },
  ) {
    return this.googleCalendarService.deleteEventFromGoogle(
      user.sub,
      user.salonId,
      body.eventId,
    );
  }

  /**
   * POST /integrations/google/toggle-sync
   * Ativa/desativa sincronização automática
   */
  @Post('toggle-sync')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ativar/desativar sincronização automática' })
  async toggleSync(
    @CurrentUser() user: JwtPayload,
    @Body() body: { enabled: boolean },
  ) {
    await this.googleCalendarService.toggleSync(user.sub, user.salonId, body.enabled);
    return { success: true, syncEnabled: body.enabled };
  }

  /**
   * DELETE /integrations/google/disconnect
   * Desconecta o Google Calendar
   */
  @Delete('disconnect')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desconectar Google Calendar' })
  async disconnect(@CurrentUser() user: JwtPayload) {
    await this.googleCalendarService.disconnectGoogle(user.sub, user.salonId);
  }
}
