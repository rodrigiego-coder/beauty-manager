import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  UpdateOnlineBookingSettingsDto,
  CreateClientBookingRuleDto,
  UpdateClientBookingRuleDto,
  GenerateAssistedLinkDto,
} from './dto';
import { OnlineBookingSettingsService } from './online-booking-settings.service';
import { ClientBookingRulesService } from './client-booking-rules.service';
import { AppointmentHoldsService } from './appointment-holds.service';
import { DepositsService } from './deposits.service';
import { ApiTags } from '@nestjs/swagger';

/**
 * Controller administrativo para gerenciar agendamento online
 * Requer autenticação e permissões de OWNER/MANAGER
 */
@ApiTags('OnlineBooking')
@Controller('online-booking')
@UseGuards(AuthGuard, RolesGuard)
export class AdminBookingController {

  constructor(
    private readonly settingsService: OnlineBookingSettingsService,
    private readonly rulesService: ClientBookingRulesService,
    private readonly holdsService: AppointmentHoldsService,
    private readonly depositsService: DepositsService,
  ) {}

  // ==================== CONFIGURAÇÕES ====================

  /**
   * Obtém configurações de booking online do salão
   */
  @Get('settings')
  @Roles('OWNER', 'MANAGER')
  async getSettings(@Request() req: any) {
    return this.settingsService.getSettings(req.user.salonId);
  }

  /**
   * Atualiza configurações de booking online
   */
  @Put('settings')
  @Roles('OWNER', 'MANAGER')
  async updateSettings(
    @Request() req: any,
    @Body() dto: UpdateOnlineBookingSettingsDto,
  ) {
    return this.settingsService.updateSettings(req.user.salonId, dto);
  }

  /**
   * Habilita/desabilita booking online
   */
  @Patch('settings/toggle')
  @Roles('OWNER', 'MANAGER')
  async toggleBooking(
    @Request() req: any,
    @Body() body: { enabled: boolean },
  ) {
    return this.settingsService.toggleEnabled(req.user.salonId, body.enabled);
  }

  /**
   * Gera link assistido para Alexis enviar ao cliente
   * Usado quando Alexis precisa enviar um link de agendamento pré-preenchido
   */
  @Post('generate-assisted-link')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async generateAssistedLink(
    @Request() req: any,
    @Body() dto: Omit<GenerateAssistedLinkDto, 'salonId'>,
  ) {
    return this.settingsService.generateAssistedLink({
      ...dto,
      salonId: req.user.salonId,
    });
  }

  // ==================== REGRAS DE CLIENTES ====================

  /**
   * Lista todas as regras de clientes
   */
  @Get('rules')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async listRules(
    @Request() req: any,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.rulesService.listRules(
      req.user.salonId,
      includeInactive === 'true',
    );
  }

  /**
   * Cria uma nova regra para cliente
   */
  @Post('rules')
  @Roles('OWNER', 'MANAGER')
  async createRule(
    @Request() req: any,
    @Body() dto: CreateClientBookingRuleDto,
  ) {
    return this.rulesService.createRule(
      req.user.salonId,
      dto,
      req.user.id,
    );
  }

  /**
   * Atualiza uma regra
   */
  @Patch('rules/:ruleId')
  @Roles('OWNER', 'MANAGER')
  async updateRule(
    @Request() req: any,
    @Param('ruleId') ruleId: string,
    @Body() dto: UpdateClientBookingRuleDto,
  ) {
    return this.rulesService.updateRule(req.user.salonId, ruleId, dto);
  }

  /**
   * Remove uma regra
   */
  @Delete('rules/:ruleId')
  @Roles('OWNER', 'MANAGER')
  async deleteRule(
    @Request() req: any,
    @Param('ruleId') ruleId: string,
  ) {
    await this.rulesService.deleteRule(req.user.salonId, ruleId);
    return { message: 'Regra removida com sucesso' };
  }

  /**
   * Lista clientes bloqueados
   */
  @Get('blocked-clients')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async listBlockedClients(@Request() req: any) {
    return this.rulesService.listBlockedClients(req.user.salonId);
  }

  /**
   * Bloqueia um cliente
   */
  @Post('block-client')
  @Roles('OWNER', 'MANAGER')
  async blockClient(
    @Request() req: any,
    @Body() body: {
      phone?: string;
      clientId?: string;
      reason: string;
      expiresAt?: string;
    },
  ) {
    return this.rulesService.blockClient(
      req.user.salonId,
      { phone: body.phone, clientId: body.clientId },
      body.reason,
      req.user.id,
      body.expiresAt,
    );
  }

  /**
   * Desbloqueia um cliente
   */
  @Post('unblock-client')
  @Roles('OWNER', 'MANAGER')
  async unblockClient(
    @Request() req: any,
    @Body() body: { phone?: string; clientId?: string },
  ) {
    await this.rulesService.unblockClient(req.user.salonId, {
      phone: body.phone,
      clientId: body.clientId,
    });
    return { message: 'Cliente desbloqueado com sucesso' };
  }

  // ==================== HOLDS (RESERVAS TEMPORÁRIAS) ====================

  /**
   * Lista holds ativos
   */
  @Get('holds')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async listActiveHolds(
    @Request() _req: any,
    @Query('date') _date?: string,
  ) {
    // TODO: Implementar listagem de holds ativos
    return { message: 'Em desenvolvimento' };
  }

  /**
   * Libera um hold manualmente
   */
  @Post('holds/:holdId/release')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async releaseHold(
    @Request() req: any,
    @Param('holdId') holdId: string,
  ) {
    await this.holdsService.releaseHold(req.user.salonId, holdId);
    return { message: 'Reserva liberada com sucesso' };
  }

  /**
   * Limpa holds expirados manualmente
   */
  @Post('holds/cleanup')
  @Roles('OWNER', 'MANAGER')
  async cleanupHolds() {
    await this.holdsService.cleanupExpiredHolds();
    return { message: 'Limpeza de reservas expiradas concluída' };
  }

  // ==================== DEPÓSITOS ====================

  /**
   * Lista depósitos pendentes
   */
  @Get('deposits/pending')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async listPendingDeposits(@Request() _req: any) {
    // TODO: Implementar listagem de depósitos pendentes
    return { message: 'Em desenvolvimento' };
  }

  /**
   * Confirma pagamento de depósito manualmente
   */
  @Post('deposits/:depositId/confirm')
  @Roles('OWNER', 'MANAGER')
  async confirmDeposit(
    @Request() req: any,
    @Param('depositId') depositId: string,
    @Body() body: {
      paymentMethod: string;
      paymentReference?: string;
    },
  ) {
    return this.depositsService.markAsPaid(req.user.salonId, depositId, {
      paymentMethod: body.paymentMethod,
      paymentReference: body.paymentReference,
    });
  }

  /**
   * Reembolsa um depósito
   */
  @Post('deposits/:depositId/refund')
  @Roles('OWNER', 'MANAGER')
  async refundDeposit(
    @Request() req: any,
    @Param('depositId') depositId: string,
    @Body() body: { reason?: string },
  ) {
    return this.depositsService.refundDeposit(
      req.user.salonId,
      depositId,
      body.reason,
    );
  }

  // ==================== ESTATÍSTICAS ====================

  /**
   * Obtém estatísticas de agendamento online
   */
  @Get('stats')
  @Roles('OWNER', 'MANAGER')
  async getStats(
    @Request() _req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // TODO: Implementar estatísticas
    return {
      message: 'Em desenvolvimento',
      period: { startDate, endDate },
    };
  }
}
