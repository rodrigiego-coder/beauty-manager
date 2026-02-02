import * as schema from '../../database/schema';
import { WhatsAppService } from './whatsapp.service';
import { SMSService } from './sms.service';
import { UpdateAutomationSettingsDto, CreateTemplateDto, UpdateTemplateDto, SendMessageDto, MessageLogFiltersDto, AutomationSettingsResponse, MessageStats, MessageChannel } from './dto';
/**
 * AutomationService
 * Main service for automation settings and template management
 */
export declare class AutomationService {
    private readonly whatsappService;
    private readonly smsService;
    private readonly logger;
    constructor(whatsappService: WhatsAppService, smsService: SMSService);
    /**
     * Retorna configurações de automação do salão
     */
    getSettings(salonId: string): Promise<AutomationSettingsResponse>;
    /**
     * Atualiza configurações de automação
     */
    updateSettings(salonId: string, dto: UpdateAutomationSettingsDto): Promise<AutomationSettingsResponse>;
    /**
     * Lista templates do salão
     */
    getTemplates(salonId: string): Promise<schema.MessageTemplate[]>;
    /**
     * Busca template por ID
     */
    getTemplateById(id: string, salonId: string): Promise<schema.MessageTemplate>;
    /**
     * Cria novo template
     */
    createTemplate(salonId: string, dto: CreateTemplateDto): Promise<schema.MessageTemplate>;
    /**
     * Atualiza template
     */
    updateTemplate(id: string, salonId: string, dto: UpdateTemplateDto): Promise<schema.MessageTemplate>;
    /**
     * Remove template
     */
    deleteTemplate(id: string, salonId: string): Promise<void>;
    /**
     * Cria templates padrão para o salão
     */
    createDefaultTemplates(salonId: string): Promise<void>;
    /**
     * Envia mensagem manual
     */
    sendMessage(salonId: string, dto: SendMessageDto): Promise<schema.MessageLog>;
    /**
     * Envia mensagem de teste
     */
    sendTestMessage(salonId: string, channel: MessageChannel, phoneNumber: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Lista histórico de mensagens
     */
    getMessageLogs(salonId: string, filters: MessageLogFiltersDto): Promise<{
        logs: schema.MessageLog[];
        total: number;
    }>;
    /**
     * Retorna estatísticas de mensagens
     */
    getStats(salonId: string, days?: number): Promise<MessageStats>;
    /**
     * Processa webhook do WhatsApp
     */
    processWhatsAppWebhook(body: {
        entry?: Array<{
            changes?: Array<{
                value?: {
                    statuses?: Array<{
                        id: string;
                        status: string;
                        timestamp: string;
                    }>;
                };
            }>;
        }>;
    }): Promise<void>;
    /**
     * Processa webhook do Twilio
     */
    processTwilioWebhook(body: {
        MessageSid?: string;
        MessageStatus?: string;
    }): Promise<void>;
}
//# sourceMappingURL=automation.service.d.ts.map