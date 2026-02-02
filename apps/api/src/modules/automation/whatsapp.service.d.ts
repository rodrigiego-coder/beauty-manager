import { WhatsAppSendResult, TemplateVariables } from './dto';
/**
 * WhatsAppService
 * Handles WhatsApp Business API message sending
 * Supports: META, TWILIO, ZENVIA, ZAPI
 */
export declare class WhatsAppService {
    private readonly logger;
    private readonly zapiInstanceId;
    private readonly zapiToken;
    private readonly zapiBaseUrl;
    private readonly zapiClientToken;
    /**
     * Envia mensagem de texto via WhatsApp
     */
    sendMessage(salonId: string, phoneNumber: string, message: string): Promise<WhatsAppSendResult>;
    /**
     * Envia mensagem diretamente via Z-API (sem precisar de configurações do salão)
     * Útil para OTP e testes
     */
    sendDirectMessage(phoneNumber: string, message: string): Promise<WhatsAppSendResult>;
    /**
     * Envia código OTP via WhatsApp
     */
    sendOtpCode(phoneNumber: string, code: string, expirationMinutes?: number): Promise<WhatsAppSendResult>;
    /**
     * Envia credenciais de acesso ao sistema para novo profissional
     */
    sendWelcomeCredentials(phoneNumber: string, name: string, email: string, password: string): Promise<WhatsAppSendResult>;
    /**
     * Retorna os headers necessários para chamadas Z-API
     */
    private getZapiHeaders;
    /**
     * Testa conexão com Z-API
     */
    testZapiConnection(): Promise<{
        connected: boolean;
        error?: string;
    }>;
    /**
     * Envia template pré-aprovado via WhatsApp (Meta)
     */
    sendTemplateMessage(salonId: string, phoneNumber: string, templateName: string, variables: TemplateVariables): Promise<WhatsAppSendResult>;
    /**
     * Verifica status de uma mensagem
     */
    getMessageStatus(salonId: string, messageId: string): Promise<{
        status: string;
        timestamp?: string;
    }>;
    /**
     * Testa conexão com WhatsApp
     */
    testConnection(salonId: string): Promise<{
        connected: boolean;
        error?: string;
    }>;
    private getSettings;
    private formatPhoneNumber;
    private sendViaMeta;
    private sendViaTwilio;
    private sendViaZenvia;
    /**
     * Envia mensagem via Z-API
     */
    private sendViaZapi;
    private buildTemplateComponents;
    private replaceVariables;
}
//# sourceMappingURL=whatsapp.service.d.ts.map