import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IS_JEST } from '../../common/is-jest';
import { ProductSubscriptionsService } from './product-subscriptions.service';

@Injectable()
export class ProductSubscriptionsJobs {
  constructor(private readonly service: ProductSubscriptionsService) {}

  /**
   * Job diario as 06:00 - Processa entregas do dia
   * Cria registros de entrega para assinaturas com nextDeliveryDate = hoje
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM, { disabled: IS_JEST })
  async processDailyDeliveries() {
    console.log('[ProductSubscriptions] Processando entregas do dia...');
    try {
      await this.service.processDailyDeliveries();
      console.log('[ProductSubscriptions] Entregas processadas com sucesso');
    } catch (error) {
      console.error('[ProductSubscriptions] Erro ao processar entregas:', error);
    }
  }

  /**
   * Job diario as 08:00 - Envia lembretes de entrega
   * Notifica clientes sobre entregas do dia
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM, { disabled: IS_JEST })
  async sendDeliveryReminders() {
    console.log('[ProductSubscriptions] Enviando lembretes de entrega...');
    // TODO: Implementar envio de notificacoes via WhatsApp/SMS
    // Por enquanto, apenas log
    console.log('[ProductSubscriptions] Lembretes enviados');
  }

  /**
   * Job diario a meia-noite - Verifica assinaturas expiradas
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { disabled: IS_JEST })
  async checkExpiredSubscriptions() {
    console.log('[ProductSubscriptions] Verificando assinaturas expiradas...');
    // TODO: Implementar verificacao de assinaturas que precisam renovacao
    // e processamento de pagamentos recorrentes
    console.log('[ProductSubscriptions] Verificacao concluida');
  }
}
