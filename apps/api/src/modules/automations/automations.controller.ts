import { Controller, Post, Param } from '@nestjs/common';
import { AutomationsService } from './automations.service';

@Controller('automations')
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  /**
   * POST /automations/run
   * Executa todas as automações manualmente (para testes)
   */
  @Post('run')
  async runManually() {
    const result = await this.automationsService.runManually();
    return {
      message: 'Automacoes executadas com sucesso',
      notifications: result,
    };
  }

  /**
   * POST /automations/check-stock
   * Verifica estoque baixo manualmente
   */
  @Post('check-stock')
  async checkLowStock() {
    const count = await this.automationsService.checkLowStock();
    return { message: `${count} notificacoes de estoque baixo criadas` };
  }

  /**
   * POST /automations/check-bills
   * Verifica contas a vencer manualmente
   */
  @Post('check-bills')
  async checkDueBills() {
    const count = await this.automationsService.checkDueBills();
    return { message: `${count} notificacoes de contas a vencer criadas` };
  }

  /**
   * POST /automations/check-clients
   * Verifica clientes inativos manualmente
   */
  @Post('check-clients')
  async checkInactiveClients() {
    const count = await this.automationsService.checkInactiveClients();
    return { message: `${count} clientes marcados como risco de churn` };
  }

  /**
   * POST /automations/remove-churn/:clientId
   * Remove flag de churn risk de um cliente
   */
  @Post('remove-churn/:clientId')
  async removeChurnRisk(@Param('clientId') clientId: string) {
    await this.automationsService.removeChurnRisk(clientId);
    return { message: 'Flag de churn risk removida' };
  }
}
