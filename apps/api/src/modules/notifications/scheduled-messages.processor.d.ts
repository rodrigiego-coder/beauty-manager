import { ScheduledMessagesService } from './scheduled-messages.service';
import { WhatsAppService } from '../automation/whatsapp.service';
import { AuditService } from '../audit/audit.service';
import { AddonsService } from '../subscriptions/addons.service';
export declare class ScheduledMessagesProcessor {
    private readonly scheduledMessagesService;
    private readonly whatsappService;
    private readonly auditService;
    private readonly addonsService;
    private readonly logger;
    private isProcessing;
    constructor(scheduledMessagesService: ScheduledMessagesService, whatsappService: WhatsAppService, auditService: AuditService, addonsService: AddonsService);
    /**
     * Processa mensagens pendentes a cada minuto
     * CONCORRÊNCIA SEGURA: Usa SKIP LOCKED para evitar processamento duplicado
     */
    processScheduledMessages(): Promise<void>;
    /**
     * Processa uma mensagem individual com tolerância a falhas
     * DEGRADAÇÃO GRACIOSA: Nunca propaga erro para não parar o loop
     * HARD-BLOCK: Verifica quota ANTES de enviar para APPOINTMENT_CONFIRMATION
     */
    private processMessageWithFaultTolerance;
    /**
     * Trata sucesso no envio
     * NOTA: Consumo de quota agora ocorre ANTES do envio em checkAndConsumeQuotaBeforeSend
     */
    private handleSendSuccess;
    /**
     * Trata falha no envio - agenda retry ou marca como falha
     */
    private handleSendFailure;
    /**
     * Trata quando atingiu máximo de tentativas
     */
    private handleMaxAttemptsReached;
    /**
     * HARD-BLOCK: Verifica e consome quota ANTES de enviar mensagem
     * Retorna { allowed: true, remaining } se pode enviar
     * Retorna { allowed: false, error } se quota excedida
     */
    private checkAndConsumeQuotaBeforeSend;
    /**
     * ALFA.1: Trata mensagem bloqueada por quota excedida
     * Se ainda há tentativas: reagenda com backoff longo (30 min)
     * Se não há mais tentativas: marca como FAILED
     */
    private handleQuotaBlocked;
    /**
     * Cria timeout para evitar hang infinito
     */
    private createTimeout;
    /**
     * Mascara telefone para logs
     */
    private maskPhone;
    /**
     * Monta texto da mensagem baseado no template
     */
    private buildMessageText;
}
//# sourceMappingURL=scheduled-messages.processor.d.ts.map