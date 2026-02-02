export declare enum MessageTemplateType {
    APPOINTMENT_REMINDER = "APPOINTMENT_REMINDER",
    APPOINTMENT_CONFIRMATION = "APPOINTMENT_CONFIRMATION",
    BIRTHDAY = "BIRTHDAY",
    WELCOME = "WELCOME",
    REVIEW_REQUEST = "REVIEW_REQUEST",
    CUSTOM = "CUSTOM"
}
export declare enum MessageChannel {
    WHATSAPP = "WHATSAPP",
    SMS = "SMS",
    BOTH = "BOTH"
}
export declare enum MessageStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    READ = "READ",
    FAILED = "FAILED"
}
export declare enum WhatsAppProvider {
    META = "META",
    TWILIO = "TWILIO",
    ZENVIA = "ZENVIA"
}
export declare enum SMSProvider {
    TWILIO = "TWILIO",
    ZENVIA = "ZENVIA",
    AWS_SNS = "AWS_SNS"
}
export declare class UpdateAutomationSettingsDto {
    whatsappEnabled?: boolean;
    whatsappProvider?: WhatsAppProvider;
    whatsappApiKey?: string;
    whatsappPhoneNumberId?: string;
    whatsappBusinessAccountId?: string;
    smsEnabled?: boolean;
    smsProvider?: SMSProvider;
    smsApiKey?: string;
    smsAccountSid?: string;
    smsPhoneNumber?: string;
    reminderEnabled?: boolean;
    reminderHoursBefore?: number;
    confirmationEnabled?: boolean;
    confirmationHoursBefore?: number;
    birthdayEnabled?: boolean;
    birthdayTime?: string;
    birthdayDiscountPercent?: number;
    reviewRequestEnabled?: boolean;
    reviewRequestHoursAfter?: number;
}
export declare class CreateTemplateDto {
    name: string;
    type: MessageTemplateType;
    channel?: MessageChannel;
    subject?: string;
    content: string;
    isActive?: boolean;
    isDefault?: boolean;
    triggerHoursBefore?: number;
}
export declare class UpdateTemplateDto {
    name?: string;
    type?: MessageTemplateType;
    channel?: MessageChannel;
    subject?: string;
    content?: string;
    isActive?: boolean;
    isDefault?: boolean;
    triggerHoursBefore?: number;
}
export declare class SendMessageDto {
    clientId?: string;
    phoneNumber: string;
    channel: MessageChannel;
    content: string;
    templateId?: string;
    appointmentId?: string;
}
export declare class SendTestMessageDto {
    channel: MessageChannel;
    phoneNumber: string;
}
export declare class MessageLogFiltersDto {
    status?: MessageStatus;
    channel?: MessageChannel;
    clientId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}
export interface AutomationSettingsResponse {
    id: string;
    salonId: string;
    whatsappEnabled: boolean;
    whatsappProvider: WhatsAppProvider;
    whatsappConnected: boolean;
    smsEnabled: boolean;
    smsProvider: SMSProvider;
    smsConnected: boolean;
    smsBalance?: number;
    reminderEnabled: boolean;
    reminderHoursBefore: number;
    confirmationEnabled: boolean;
    confirmationHoursBefore: number;
    birthdayEnabled: boolean;
    birthdayTime: string;
    birthdayDiscountPercent?: number;
    reviewRequestEnabled: boolean;
    reviewRequestHoursAfter: number;
}
export interface MessageStats {
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalFailed: number;
    deliveryRate: number;
    readRate: number;
    totalCost: number;
    byChannel: {
        whatsapp: {
            sent: number;
            delivered: number;
            read: number;
            failed: number;
        };
        sms: {
            sent: number;
            delivered: number;
            cost: number;
            failed: number;
        };
    };
    byType: {
        reminder: number;
        confirmation: number;
        birthday: number;
        custom: number;
    };
}
export interface WhatsAppSendResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
export interface SMSSendResult {
    success: boolean;
    messageId?: string;
    cost?: number;
    error?: string;
}
export interface TemplateVariables {
    nome?: string;
    data?: string;
    horario?: string;
    servico?: string;
    profissional?: string;
    salonNome?: string;
    salonTelefone?: string;
    linkConfirmacao?: string;
    cupomDesconto?: string;
}
//# sourceMappingURL=dto.d.ts.map