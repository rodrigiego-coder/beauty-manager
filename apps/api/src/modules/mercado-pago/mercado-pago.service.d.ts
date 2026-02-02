import { ConfigService } from '@nestjs/config';
import { SalonSubscriptionsService } from '../subscriptions/salon-subscriptions.service';
interface MercadoPagoCustomer {
    id: string;
    email: string;
}
export declare class MercadoPagoService {
    private readonly configService;
    private readonly subscriptionsService;
    private readonly logger;
    private readonly accessToken;
    private readonly publicKey;
    private readonly webhookSecret;
    private readonly baseUrl;
    private readonly sandboxMode;
    constructor(configService: ConfigService, subscriptionsService: SalonSubscriptionsService);
    /**
     * Get public key for frontend SDK
     */
    getPublicKey(): string;
    /**
     * Create or get customer in MercadoPago
     */
    createCustomer(salonId: string): Promise<MercadoPagoCustomer | null>;
    /**
     * Create PIX payment
     */
    createPixPayment(invoiceId: string): Promise<{
        paymentId: string;
        qrCode: string;
        qrCodeBase64: string;
        expiresAt: Date;
        ticketUrl?: string;
    }>;
    /**
     * Create checkout preference for card payments
     */
    createPreference(invoiceId: string, urls?: {
        success?: string;
        failure?: string;
        pending?: string;
    }): Promise<{
        preferenceId: string;
        initPoint: string;
    }>;
    /**
     * Get payment status
     */
    getPaymentStatus(paymentId: string): Promise<{
        status: string;
        statusDetail: string;
        amount: number;
        paidAt: Date | null;
    }>;
    /**
     * Handle webhook notification
     */
    handleWebhook(type: string, data: {
        id: string;
    }): Promise<void>;
    /**
     * Verify webhook signature (for production)
     */
    verifyWebhookSignature(_signature: string, _requestId: string, _dataId: string, _timestamp: string): boolean;
    /**
     * Simulate payment (for testing/development)
     */
    simulatePayment(invoiceId: string): Promise<void>;
}
export {};
//# sourceMappingURL=mercado-pago.service.d.ts.map