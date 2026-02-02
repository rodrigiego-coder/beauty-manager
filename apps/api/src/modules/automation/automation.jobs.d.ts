import { MessageSchedulerService } from './message-scheduler.service';
/**
 * AutomationJobs
 * CRON jobs para processamento de mensagens automáticas
 */
export declare class AutomationJobs {
    private readonly schedulerService;
    private readonly logger;
    constructor(schedulerService: MessageSchedulerService);
    /**
     * Processa mensagens agendadas a cada 5 minutos
     * NOTA: Este job processa a tabela scheduled_messages (sistema legado de templates)
     * Para notificações de agendamento, use ScheduledMessagesProcessor que processa appointment_notifications
     */
    processScheduledMessages(): Promise<void>;
    /**
     * Agenda mensagens de aniversário diariamente às 06:00
     */
    scheduleBirthdayMessages(): Promise<void>;
    /**
     * Limpa logs antigos mensalmente (primeiro dia às 03:00)
     */
    cleanupOldLogs(): Promise<void>;
    /**
     * Verifica e reagenda mensagens falhas às 09:00
     */
    retryFailedMessages(): Promise<void>;
    /**
     * Gera relatório semanal de automação (Segunda às 08:00)
     */
    generateWeeklyReport(): Promise<void>;
}
//# sourceMappingURL=automation.jobs.d.ts.map