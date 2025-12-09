import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../../common/decorators';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/stats
   * Retorna estatísticas do dashboard para o salão do usuário logado
   */
  @Get('stats')
  async getStats(@CurrentUser() user: { salonId: string }) {
    return this.dashboardService.getStats(user.salonId);
  }
}