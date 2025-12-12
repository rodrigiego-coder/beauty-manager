import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService, DashboardPeriod } from './dashboard.service';
import { CurrentUser } from '../../common/decorators';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/stats
   * Retorna estatisticas do dashboard para o salao do usuario logado
   *
   * @param period - Periodo de consulta: today, week, month, year (default: today)
   */
  @Get('stats')
  async getStats(
    @CurrentUser() user: { salonId: string },
    @Query('period') period?: DashboardPeriod,
  ) {
    const validPeriod = this.validatePeriod(period);
    return this.dashboardService.getStats(user.salonId, validPeriod);
  }

  private validatePeriod(period?: string): DashboardPeriod {
    const validPeriods: DashboardPeriod[] = ['today', 'week', 'month', 'year'];
    if (period && validPeriods.includes(period as DashboardPeriod)) {
      return period as DashboardPeriod;
    }
    return 'today';
  }
}
