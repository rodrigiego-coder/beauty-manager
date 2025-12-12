import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  Database,
  products,
  clients,
  accountsPayable,
  appointments,
} from '../../database';
import { NotificationsService } from '../notifications';

@Injectable()
export class AutomationsService {
  private readonly logger = new Logger(AutomationsService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Cron Job: Roda todo dia às 08:00
   * - Verifica estoque baixo
   * - Verifica contas a vencer
   * - Identifica clientes inativos (churn risk)
   */
  @Cron('0 8 * * *') // Todo dia às 08:00
  async runDailyAutomations() {
    this.logger.log('Iniciando automacoes diarias...');

    try {
      await this.checkLowStock();
      await this.checkDueBills();
      await this.checkInactiveClients();

      this.logger.log('Automacoes diarias concluidas com sucesso');
    } catch (error) {
      this.logger.error('Erro nas automacoes diarias:', error);
    }
  }

  /**
   * Verifica produtos com estoque baixo
   */
  async checkLowStock(): Promise<number> {
    this.logger.log('Verificando estoque baixo...');

    const allProducts = await this.db
      .select()
      .from(products)
      .where(eq(products.active, true));

    const lowStockProducts = allProducts.filter(p => p.currentStock <= p.minStock);
    let notificationsCreated = 0;

    for (const product of lowStockProducts) {
      await this.notificationsService.createStockLowNotification(
        product.id,
        product.name,
        product.currentStock,
        product.minStock,
      );
      notificationsCreated++;
    }

    this.logger.log(`${notificationsCreated} notificacoes de estoque baixo criadas`);
    return notificationsCreated;
  }

  /**
   * Verifica contas a pagar vencendo nos próximos 3 dias
   */
  async checkDueBills(): Promise<number> {
    this.logger.log('Verificando contas a vencer...');

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0];

    const pendingBills = await this.db
      .select()
      .from(accountsPayable)
      .where(eq(accountsPayable.status, 'PENDING'));

    const dueBills = pendingBills.filter(bill => bill.dueDate <= threeDaysStr);
    let notificationsCreated = 0;

    for (const bill of dueBills) {
      await this.notificationsService.createBillDueNotification(
        bill.id,
        bill.supplierName,
        bill.amount,
        bill.dueDate,
      );
      notificationsCreated++;
    }

    this.logger.log(`${notificationsCreated} notificacoes de contas a vencer criadas`);
    return notificationsCreated;
  }

  /**
   * Identifica clientes sem visita há mais de 60 dias e marca como churn risk
   */
  async checkInactiveClients(): Promise<number> {
    this.logger.log('Verificando clientes inativos...');

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const sixtyDaysStr = sixtyDaysAgo.toISOString().split('T')[0];

    // Busca todos os clientes
    const allClients = await this.db.select().from(clients);

    // Busca todos os agendamentos
    const allAppointments = await this.db.select().from(appointments);

    let churnRiskCount = 0;

    for (const client of allClients) {
      // Busca o último agendamento do cliente
      const clientAppointments = allAppointments
        .filter(apt => apt.clientId === client.id && apt.status === 'CONFIRMED')
        .sort((a, b) => b.date.localeCompare(a.date));

      const lastAppointment = clientAppointments[0];

      if (!lastAppointment) {
        // Cliente nunca agendou - verifica se foi criado há mais de 60 dias
        const createdAt = new Date(client.createdAt).toISOString().split('T')[0];
        if (createdAt < sixtyDaysStr && !client.churnRisk) {
          await this.markAsChurnRisk(client.id, client.name, 60);
          churnRiskCount++;
        }
        continue;
      }

      const lastVisitDate = lastAppointment.date;

      // Atualiza lastVisitDate do cliente
      await this.db
        .update(clients)
        .set({ lastVisitDate, updatedAt: new Date() })
        .where(eq(clients.id, client.id));

      // Verifica se a última visita foi há mais de 60 dias
      if (lastVisitDate < sixtyDaysStr && !client.churnRisk) {
        const daysSinceVisit = Math.floor(
          (new Date().getTime() - new Date(lastVisitDate).getTime()) / (1000 * 60 * 60 * 24),
        );
        await this.markAsChurnRisk(client.id, client.name, daysSinceVisit);
        churnRiskCount++;
      }
    }

    this.logger.log(`${churnRiskCount} clientes marcados como risco de churn`);
    return churnRiskCount;
  }

  /**
   * Marca cliente como risco de churn e cria notificação
   */
  private async markAsChurnRisk(
    clientId: string,
    clientName: string | null,
    daysSinceVisit: number,
  ): Promise<void> {
    // Marca o cliente como churn risk
    await this.db
      .update(clients)
      .set({ churnRisk: true, updatedAt: new Date() })
      .where(eq(clients.id, clientId));

    // Cria notificação de cliente inativo
    await this.notificationsService.createClientInactiveNotification(
      clientId,
      clientName || 'Sem nome',
      daysSinceVisit,
    );

    // Cria notificação de churn risk
    await this.notificationsService.createChurnRiskNotification(clientId, clientName || 'Sem nome');
  }

  /**
   * Endpoint para rodar automações manualmente (para testes)
   */
  async runManually(): Promise<{
    lowStock: number;
    dueBills: number;
    churnRisk: number;
  }> {
    const lowStock = await this.checkLowStock();
    const dueBills = await this.checkDueBills();
    const churnRisk = await this.checkInactiveClients();

    return { lowStock, dueBills, churnRisk };
  }

  /**
   * Remove flag de churn risk de um cliente (quando ele volta)
   */
  async removeChurnRisk(clientId: string): Promise<void> {
    await this.db
      .update(clients)
      .set({ churnRisk: false, updatedAt: new Date() })
      .where(eq(clients.id, clientId));
  }
}
