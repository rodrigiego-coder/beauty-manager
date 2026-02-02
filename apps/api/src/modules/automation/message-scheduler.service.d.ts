import { WhatsAppService } from './whatsapp.service';
import { SMSService } from './sms.service';
/**
 * MessageSchedulerService
 * Handles scheduling and processing of automated messages
 */
export declare class MessageSchedulerService {
    private readonly whatsappService;
    private readonly smsService;
    private readonly logger;
    constructor(whatsappService: WhatsAppService, smsService: SMSService);
    /**
     * Agenda lembretes para um agendamento
     */
    scheduleAppointmentReminders(appointmentId: string, salonId: string, clientId: string, scheduledDate: string, scheduledTime: string): Promise<void>;
    /**
     * Agenda pedido de confirmação
     */
    scheduleConfirmationRequest(appointmentId: string, salonId: string, clientId: string, scheduledDate: string, scheduledTime: string): Promise<void>;
    /**
     * Agenda mensagens de aniversário do dia
     */
    scheduleBirthdayMessages(): Promise<number>;
    /**
     * Processa mensagens agendadas pendentes
     */
    processScheduledMessages(): Promise<{
        processed: number;
        sent: number;
        failed: number;
    }>;
    /**
     * Cancela mensagens de um agendamento
     */
    cancelScheduledMessages(appointmentId: string, reason?: string): Promise<number>;
    /**
     * Envia mensagem de boas-vindas para novo cliente
     */
    sendWelcomeMessage(salonId: string, clientId: string): Promise<void>;
    private getSettings;
    private determineChannel;
    private sendMessage;
    private replaceVariables;
    private markAsFailed;
}
//# sourceMappingURL=message-scheduler.service.d.ts.map