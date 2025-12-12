import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  UseGuards,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { GoogleCalendarService } from './google-calendar.service';
import { CalendarSyncService } from './calendar-sync.service';
import {
  ConnectGoogleCalendarDto,
  UpdateIntegrationSettingsDto,
  ManualSyncDto,
  ResolveConflictDto,
  BulkResolveConflictsDto,
} from './dto';

@Controller('calendar')
@UseGuards(AuthGuard, RolesGuard)
export class CalendarController {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly calendarSyncService: CalendarSyncService,
  ) {}

  // ==================== CONEXÃO GOOGLE ====================

  /**
   * Verifica se Google Calendar está configurado
   */
  @Get('google/configured')
  isConfigured(): { configured: boolean } {
    return { configured: this.googleCalendarService.isConfigured() };
  }

  /**
   * Gera URL de autenticação OAuth
   */
  @Get('google/connect-url')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  getConnectUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ConnectGoogleCalendarDto,
  ): { url: string } {
    const professionalId = query.professionalId || user.id;

    // Estado contém informações para o callback
    const state = Buffer.from(
      JSON.stringify({
        salonId: user.salonId,
        professionalId,
        calendarId: query.calendarId || 'primary',
        syncDirection: query.syncDirection || 'GOOGLE_TO_APP',
        userId: user.id,
      }),
    ).toString('base64');

    const url = this.googleCalendarService.getAuthUrl(state);
    return { url };
  }

  /**
   * Callback OAuth - Processa retorno do Google
   */
  @Get('google/callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (error) {
      res.redirect(`${frontendUrl}/integracoes?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!code || !state) {
      res.redirect(`${frontendUrl}/integracoes?error=missing_params`);
      return;
    }

    try {
      // Decodifica state
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      const { salonId, professionalId, calendarId, syncDirection } = stateData;

      // Troca código por tokens
      const tokens = await this.googleCalendarService.exchangeCodeForTokens(code);

      // Obtém email do Google
      const userInfo = await this.googleCalendarService.getUserInfo(tokens.access_token);

      // Salva integração
      await this.googleCalendarService.saveIntegration(
        salonId,
        professionalId,
        userInfo.email,
        tokens,
        calendarId,
        syncDirection,
      );

      res.redirect(`${frontendUrl}/integracoes?success=true&email=${encodeURIComponent(userInfo.email)}`);
    } catch (err) {
      console.error('OAuth callback error:', err);
      const message = err instanceof Error ? err.message : 'unknown_error';
      res.redirect(`${frontendUrl}/integracoes?error=${encodeURIComponent(message)}`);
    }
  }

  /**
   * Desconecta integração Google
   */
  @Post('google/disconnect')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  async disconnect(
    @CurrentUser() user: AuthenticatedUser,
    @Body('professionalId') professionalId?: string,
  ): Promise<{ success: boolean }> {
    const targetProfessionalId = professionalId || user.id;

    // Verifica permissão (owner/manager podem desconectar qualquer um, stylist só si mesmo)
    if (user.role === 'STYLIST' && targetProfessionalId !== user.id) {
      throw new BadRequestException('Você só pode desconectar sua própria conta.');
    }

    await this.googleCalendarService.disconnectIntegration(user.salonId!, targetProfessionalId);
    return { success: true };
  }

  // ==================== STATUS ====================

  /**
   * Status da integração do usuário atual ou profissional específico
   */
  @Get('google/status')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  async getStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Query('professionalId') professionalId?: string,
  ) {
    const targetProfessionalId = professionalId || user.id;
    return this.calendarSyncService.getIntegrationStatus(user.salonId!, targetProfessionalId);
  }

  /**
   * Status de todas as integrações do salão
   */
  @Get('google/status/all')
  @Roles('OWNER', 'MANAGER')
  async getAllStatuses(@CurrentUser() user: AuthenticatedUser) {
    return this.calendarSyncService.getAllIntegrationStatuses(user.salonId!);
  }

  // ==================== CONFIGURAÇÕES ====================

  /**
   * Atualiza configurações da integração
   */
  @Patch('google/settings')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  async updateSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateIntegrationSettingsDto,
    @Body('professionalId') professionalId?: string,
  ) {
    const targetProfessionalId = professionalId || user.id;

    // Verifica permissão
    if (user.role === 'STYLIST' && targetProfessionalId !== user.id) {
      throw new BadRequestException('Você só pode alterar suas próprias configurações.');
    }

    const integration = await this.googleCalendarService.getIntegration(
      user.salonId!,
      targetProfessionalId,
    );

    if (!integration) {
      throw new BadRequestException('Integração não encontrada.');
    }

    return this.googleCalendarService.updateSettings(integration.id, dto);
  }

  /**
   * Lista calendários disponíveis na conta Google
   */
  @Get('google/calendars')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  async listCalendars(
    @CurrentUser() user: AuthenticatedUser,
    @Query('professionalId') professionalId?: string,
  ) {
    const targetProfessionalId = professionalId || user.id;

    const integration = await this.googleCalendarService.getIntegration(
      user.salonId!,
      targetProfessionalId,
    );

    if (!integration) {
      throw new BadRequestException('Integração não encontrada.');
    }

    const accessToken = await this.googleCalendarService.getValidAccessToken(integration);
    return this.googleCalendarService.listCalendars(accessToken);
  }

  // ==================== SINCRONIZAÇÃO ====================

  /**
   * Executa sincronização manual
   */
  @Post('google/sync')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  async sync(@CurrentUser() user: AuthenticatedUser, @Body() dto: ManualSyncDto) {
    const professionalId = dto.professionalId || user.id;

    // Verifica permissão
    if (user.role === 'STYLIST' && professionalId !== user.id) {
      throw new BadRequestException('Você só pode sincronizar sua própria agenda.');
    }

    return this.calendarSyncService.manualSync(user.salonId!, professionalId, dto.fullSync);
  }

  /**
   * Logs de sincronização
   */
  @Get('google/sync-logs')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  async getSyncLogs(
    @CurrentUser() user: AuthenticatedUser,
    @Query('professionalId') professionalId?: string,
    @Query('limit') limit?: string,
  ) {
    const targetProfessionalId =
      user.role === 'STYLIST' ? user.id : professionalId || undefined;

    return this.calendarSyncService.getSyncLogs(
      user.salonId!,
      targetProfessionalId,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  // ==================== CONFLITOS ====================

  /**
   * Lista conflitos pendentes
   */
  @Get('google/conflicts')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  async getConflicts(
    @CurrentUser() user: AuthenticatedUser,
    @Query('professionalId') professionalId?: string,
  ) {
    const targetProfessionalId =
      user.role === 'STYLIST' ? user.id : professionalId || undefined;

    return this.calendarSyncService.getConflicts(user.salonId!, targetProfessionalId);
  }

  /**
   * Resolve um conflito
   */
  @Post('google/conflicts/resolve')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  async resolveConflict(@CurrentUser() user: AuthenticatedUser, @Body() dto: ResolveConflictDto) {
    await this.calendarSyncService.resolveConflict(dto.conflictId, dto.resolution, user.id);
    return { success: true };
  }

  /**
   * Resolve múltiplos conflitos
   */
  @Post('google/conflicts/resolve-bulk')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  async resolveConflictsBulk(@CurrentUser() user: AuthenticatedUser, @Body() dto: BulkResolveConflictsDto) {
    for (const conflictId of dto.conflictIds) {
      await this.calendarSyncService.resolveConflict(conflictId, dto.resolution, user.id);
    }
    return { success: true, resolved: dto.conflictIds.length };
  }
}
