import { SMSSendResult } from './dto';
/**
 * SMSService
 * Handles SMS message sending via Twilio, Zenvia, or AWS SNS
 */
export declare class SMSService {
    private readonly logger;
    /**
     * Envia SMS
     */
    sendSMS(salonId: string, phoneNumber: string, message: string): Promise<SMSSendResult>;
    /**
     * Verifica saldo disponível (Twilio)
     */
    getBalance(salonId: string): Promise<{
        balance: number;
        currency: string;
    } | null>;
    /**
     * Testa conexão com provedor SMS
     */
    testConnection(salonId: string): Promise<{
        connected: boolean;
        error?: string;
    }>;
    private getSettings;
    private formatPhoneNumber;
    private sendViaTwilio;
    private sendViaZenvia;
    private sendViaAWS;
}
//# sourceMappingURL=sms.service.d.ts.map