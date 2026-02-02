import { AutomationService } from './automation.service';
import { WhatsAppService } from './whatsapp.service';
import { UpdateAutomationSettingsDto, CreateTemplateDto, UpdateTemplateDto, SendMessageDto, SendTestMessageDto, MessageLogFiltersDto } from './dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
export declare class AutomationController {
    private readonly automationService;
    private readonly whatsAppService;
    constructor(automationService: AutomationService, whatsAppService: WhatsAppService);
    /**
     * GET /automation/settings
     * Retorna configurações de automação do salão
     */
    getSettings(user: AuthenticatedUser): Promise<import("./dto").AutomationSettingsResponse>;
    /**
     * PATCH /automation/settings
     * Atualiza configurações de automação
     */
    updateSettings(user: AuthenticatedUser, dto: UpdateAutomationSettingsDto): Promise<import("./dto").AutomationSettingsResponse>;
    /**
     * GET /automation/templates
     * Lista todos os templates do salão
     */
    getTemplates(user: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        type: "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMATION" | "BIRTHDAY" | "WELCOME" | "REVIEW_REQUEST" | "CUSTOM";
        content: string;
        channel: "WHATSAPP" | "SMS" | "BOTH";
        subject: string | null;
        isDefault: boolean;
        triggerHoursBefore: number | null;
    }[]>;
    /**
     * GET /automation/templates/:id
     * Busca template por ID
     */
    getTemplateById(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        type: "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMATION" | "BIRTHDAY" | "WELCOME" | "REVIEW_REQUEST" | "CUSTOM";
        content: string;
        channel: "WHATSAPP" | "SMS" | "BOTH";
        subject: string | null;
        isDefault: boolean;
        triggerHoursBefore: number | null;
    }>;
    /**
     * POST /automation/templates
     * Cria novo template
     */
    createTemplate(user: AuthenticatedUser, dto: CreateTemplateDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        type: "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMATION" | "BIRTHDAY" | "WELCOME" | "REVIEW_REQUEST" | "CUSTOM";
        content: string;
        channel: "WHATSAPP" | "SMS" | "BOTH";
        subject: string | null;
        isDefault: boolean;
        triggerHoursBefore: number | null;
    }>;
    /**
     * PATCH /automation/templates/:id
     * Atualiza template
     */
    updateTemplate(user: AuthenticatedUser, id: string, dto: UpdateTemplateDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        type: "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMATION" | "BIRTHDAY" | "WELCOME" | "REVIEW_REQUEST" | "CUSTOM";
        content: string;
        channel: "WHATSAPP" | "SMS" | "BOTH";
        subject: string | null;
        isDefault: boolean;
        triggerHoursBefore: number | null;
    }>;
    /**
     * DELETE /automation/templates/:id
     * Remove template
     */
    deleteTemplate(user: AuthenticatedUser, id: string): Promise<void>;
    /**
     * POST /automation/templates/defaults
     * Cria templates padrão
     */
    createDefaultTemplates(user: AuthenticatedUser): Promise<{
        message: string;
    }>;
    /**
     * POST /automation/send
     * Envia mensagem manual
     */
    sendMessage(user: AuthenticatedUser, dto: SendMessageDto): Promise<{
        id: string;
        createdAt: Date;
        salonId: string;
        status: "PENDING" | "FAILED" | "SENT" | "DELIVERED" | "READ";
        clientId: string | null;
        content: string;
        errorMessage: string | null;
        channel: "WHATSAPP" | "SMS" | "BOTH";
        templateId: string | null;
        appointmentId: string | null;
        phoneNumber: string;
        externalId: string | null;
        sentAt: Date | null;
        deliveredAt: Date | null;
        readAt: Date | null;
        cost: string | null;
    }>;
    /**
     * POST /automation/send-test
     * Envia mensagem de teste
     */
    sendTestMessage(user: AuthenticatedUser, dto: SendTestMessageDto): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * GET /automation/logs
     * Lista histórico de mensagens
     */
    getMessageLogs(user: AuthenticatedUser, filters: MessageLogFiltersDto): Promise<{
        logs: import("../../database").MessageLog[];
        total: number;
    }>;
    /**
     * GET /automation/stats
     * Retorna estatísticas de mensagens
     */
    getStats(user: AuthenticatedUser, days?: string): Promise<import("./dto").MessageStats>;
    /**
     * POST /automation/webhooks/whatsapp
     * Webhook para status do WhatsApp (Meta)
     */
    whatsappWebhook(body: {
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
    }): Promise<{
        success: boolean;
    }>;
    /**
     * GET /automation/webhooks/whatsapp
     * Verificação do webhook (Meta)
     */
    whatsappWebhookVerify(mode: string, token: string, challenge: string): string;
    /**
     * POST /automation/webhooks/twilio
     * Webhook para status do Twilio
     */
    twilioWebhook(body: {
        MessageSid?: string;
        MessageStatus?: string;
    }): Promise<{
        success: boolean;
    }>;
    /**
     * GET /automation/zapi/status
     * Verifica status da conexão Z-API
     */
    getZapiStatus(): Promise<{
        connected: boolean;
        error?: string;
    }>;
    /**
     * POST /automation/zapi/send-test
     * Envia mensagem de teste via Z-API (público para testes)
     */
    sendZapiTestMessage(body: {
        phone: string;
        message: string;
    }): Promise<import("./dto").WhatsAppSendResult>;
    /**
     * POST /automation/send-welcome-credentials
     * Envia credenciais de acesso via WhatsApp para novo profissional
     */
    sendWelcomeCredentials(body: {
        phone: string;
        name: string;
        email: string;
        password: string;
    }): Promise<import("./dto").WhatsAppSendResult>;
}
//# sourceMappingURL=automation.controller.d.ts.map