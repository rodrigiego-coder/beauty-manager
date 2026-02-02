/**
 * =====================================================
 * ALEXIS WHATSAPP SERVICE
 * Integração com WhatsApp Business API
 * =====================================================
 */
export interface WhatsAppMessage {
    from: string;
    to: string;
    type: 'text' | 'audio' | 'image' | 'document' | 'location' | 'contact';
    text?: {
        body: string;
    };
    audio?: {
        id: string;
        link: string;
    };
    image?: {
        id: string;
        link: string;
        caption?: string;
    };
    document?: {
        id: string;
        link: string;
        filename: string;
    };
    location?: {
        latitude: number;
        longitude: number;
        name?: string;
    };
    contact?: {
        name: {
            formatted_name: string;
        };
        phones: {
            phone: string;
        }[];
    };
    timestamp: string;
    id: string;
}
export interface WhatsAppWebhookPayload {
    object: string;
    entry: {
        id: string;
        changes: {
            value: {
                messaging_product: string;
                metadata: {
                    display_phone_number: string;
                    phone_number_id: string;
                };
                contacts?: {
                    profile: {
                        name: string;
                    };
                    wa_id: string;
                }[];
                messages?: WhatsAppMessage[];
                statuses?: {
                    id: string;
                    status: 'sent' | 'delivered' | 'read';
                    timestamp: string;
                    recipient_id: string;
                }[];
            };
            field: string;
        }[];
    }[];
}
export declare class AlexisWhatsAppService {
    private readonly logger;
    /**
     * Processar webhook do WhatsApp
     */
    processWebhook(payload: WhatsAppWebhookPayload): Promise<{
        salonId: string;
        clientPhone: string;
        clientName?: string;
        message: string;
        messageType: string;
        whatsappMessageId: string;
    } | null>;
    /**
     * Enviar mensagem pelo WhatsApp
     */
    sendMessage(salonId: string, to: string, message: string, messageType?: 'text' | 'template'): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Atualizar status da mensagem
     */
    private handleStatusUpdate;
    /**
     * Verificar se está dentro do horário de atendimento
     */
    isWithinOperatingHours(salonId: string): Promise<boolean>;
    /**
     * Obter mensagem de fora do horário
     */
    getOutOfHoursMessage(salonId: string): Promise<string>;
    /**
     * Validar webhook do WhatsApp (verificação inicial)
     */
    verifyWebhook(mode: string, token: string, challenge: string): string | null;
}
//# sourceMappingURL=alexis-whatsapp.service.d.ts.map