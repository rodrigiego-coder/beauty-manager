import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService, DashboardPeriod } from './dashboard.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(AuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/stats
   * Retorna estatisticas do dashboard para o salao do usuario logado
   *
   * @param period - Periodo de consulta: today, week, month, year (default: today)
   */
  @Get('stats')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Dashboard geral do salão' })
  async getStats(
    @CurrentUser() user: { salonId: string },
    @Query('period') period?: DashboardPeriod,
  ) {
    const validPeriod = this.validatePeriod(period);
    return this.dashboardService.getStats(user.salonId, validPeriod);
  }

  /**
   * GET /dashboard/professional
   * Retorna dashboard do profissional logado
   * CRÍTICO: STYLIST só vê seus próprios dados
   */
  @Get('professional')
  @Roles('STYLIST', 'MANAGER', 'OWNER')
  @ApiOperation({ summary: 'Dashboard do profissional (isolado por usuário)' })
  async getProfessionalDashboard(
    @CurrentUser() user: { salonId: string; id: string },
  ) {
    // SEGURANÇA: Sempre usa o ID do usuário logado, nunca aceita parâmetro externo
    return this.dashboardService.getProfessionalDashboard(user.salonId, user.id);
  }

  private validatePeriod(period?: string): DashboardPeriod {
    const validPeriods: DashboardPeriod[] = ['today', 'week', 'month', 'year'];
    if (period && validPeriods.includes(period as DashboardPeriod)) {
      return period as DashboardPeriod;
    }
    return 'today';
  }
}
