export declare class ScheduledMessagesService {
    private db;
    private readonly logger;
    constructor(db: any);
    /**
     * Agenda mensagem de confirmação ao criar agendamento
     * IDEMPOTENTE: Usa dedupeKey para evitar duplicação
     */
    scheduleAppointmentConfirmation(appointment: any, triageLink?: string): Promise<void>;
    /**
     * Agenda lembrete 24h antes do agendamento
     */
    scheduleReminder24h(appointment: any, triageLink?: string): Promise<void>;
    /**
     * Agenda lembrete 1h30 antes do agendamento
     */
    scheduleReminder1h30(appointment: any): Promise<void>;
    /**
     * Agenda notificação de cancelamento
     */
    scheduleAppointmentCancellation(appointment: any): Promise<void>;
    /**
     * Agenda notificação de reagendamento
     */
    scheduleAppointmentRescheduled(appointment: any, oldDate: string, oldTime: string): Promise<void>;
    /**
     * Agenda todas as notificações de um agendamento
     */
    scheduleAllAppointmentNotifications(appointment: any, triageLink?: string): Promise<void>;
    /**
     * Cancela todas as notificações pendentes de um agendamento
     */
    cancelAppointmentNotifications(appointmentId: string): Promise<void>;
    /**
     * Busca mensagens pendentes para processamento usando SKIP LOCKED
     * CONCORRÊNCIA SEGURA: Evita que múltiplos workers processem a mesma mensagem
     */
    getPendingMessagesWithLock(limit?: number): Promise<any[]>;
    /**
     * Método legado para compatibilidade
     */
    getPendingMessages(limit?: number): Promise<any[]>;
    /**
     * Atualiza status da mensagem após envio
     * COM RETRY e backoff exponencial
     */
    updateMessageStatus(messageId: string, status: string, providerMessageId?: string, error?: string): Promise<void>;
    /**
     * Marca mensagem para retry com backoff exponencial
     */
    scheduleRetry(messageId: string, currentAttempts: number, error: string): Promise<void>;
    /**
     * ALFA.1: Agenda retry específico para QUOTA_EXCEEDED com backoff longo
     * Base 30 min + jitter ±10%, capped at 60 min
     */
    scheduleQuotaRetry(messageId: string, currentAttempts: number, error: string): Promise<Date>;
    /**
     * Registra resposta do cliente
     */
    registerClientResponse(appointmentId: string, response: string): Promise<void>;
    /**
     * Busca estatísticas de mensagens por salão
     */
    getMessageStats(salonId: string): Promise<any>;
    /**
     * Cria notificação com idempotência
     * SEGURO: Se dedupeKey já existe, ignora silenciosamente
     */
    private createNotificationIdempotent;
    /**
     * Busca informações do salão (endereço e localização)
     */
    private getSalonInfo;
    /**
     * Monta variáveis do template
     */
    private buildTemplateVariables;
    /**
     * Extrai coordenadas do Google Maps URL e gera Waze URL
     * Suporta formatos:
     * - https://maps.google.com/maps?q=-22.6641832,-50.4373021
     * - https://www.google.com/maps?q=-22.6641832,-50.4373021
     * - https://goo.gl/maps/... (não suportado, retorna vazio)
     */
    private generateWazeUrlFromGoogleMaps;
    /**
     * Converte data + hora do agendamento em Date
     */
    private parseAppointmentDateTime;
    /**
     * Formata telefone para padrão internacional
     */
    private formatPhone;
}
//# sourceMappingURL=scheduled-messages.service.d.ts.map