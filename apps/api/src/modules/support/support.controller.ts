import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateSupportSessionDto, ConsumeSupportTokenDto } from './dto';

/**
 * Controller para Suporte Delegado
 * Permite que SUPER_ADMIN acesse temporariamente um salão específico
 */
@Controller('support')
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  /**
   * POST /support/impersonate
   * Gera um token de suporte para acessar um salão específico
   *
   * @param body - { salonId: string, reason: string }
   * @returns { sessionId, token, expiresAt, salonName }
   */
  @Post('impersonate')
  async createSupportSession(
    @Body() body: CreateSupportSessionDto,
    @CurrentUser('id') adminUserId: string,
    @Req() request: any,
  ) {
    return this.supportService.createSession(
      adminUserId,
      body.salonId,
      body.reason,
      request.ip || request.connection?.remoteAddress,
      request.headers['user-agent'],
    );
  }

  /**
   * POST /support/consume-token
   * Consome o token e retorna JWT com actingAsSalonId
   *
   * @param body - { token: string }
   * @returns { accessToken, expiresIn, salonId, salonName }
   */
  @Post('consume-token')
  async consumeToken(
    @Body() body: ConsumeSupportTokenDto,
    @CurrentUser('id') adminUserId: string,
    @Req() request: any,
  ) {
    return this.supportService.consumeToken(
      body.token,
      adminUserId,
      request.ip || request.connection?.remoteAddress,
      request.headers['user-agent'],
    );
  }

  /**
   * GET /support/sessions
   * Lista sessões de suporte para auditoria
   *
   * @param status - Filtrar por status (PENDING, CONSUMED, EXPIRED, REVOKED)
   * @param limit - Limite de resultados (padrão: 50)
   */
  @Get('sessions')
  async listSessions(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    return this.supportService.listSessions({
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /**
   * DELETE /support/sessions/:id
   * Revoga uma sessão pendente
   */
  @Delete('sessions/:id')
  async revokeSession(
    @Param('id') sessionId: string,
    @CurrentUser('id') adminUserId: string,
    @Req() request: any,
  ) {
    await this.supportService.revokeSession(
      sessionId,
      adminUserId,
      request.ip || request.connection?.remoteAddress,
    );
    return { success: true, message: 'Sessão revogada com sucesso' };
  }
}
