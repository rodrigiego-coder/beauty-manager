import { MercadoPagoService } from './mercado-pago.service';
import { CreatePreferenceDto, CreatePixDto, WebhookDto } from './dto';
export declare class MercadoPagoController {
    private readonly mercadoPagoService;
    constructor(mercadoPagoService: MercadoPagoService);
    /**
     * GET /mercado-pago/public-key - Get public key for frontend SDK
     */
    getPublicKey(): {
        publicKey: string;
    };
    /**
     * POST /mercado-pago/create-pix - Create PIX payment
     */
    createPix(dto: CreatePixDto): Promise<{
        paymentId: string;
        qrCode: string;
        qrCodeBase64: string;
        expiresAt: Date;
        ticketUrl?: string;
    }>;
    /**
     * POST /mercado-pago/create-preference - Create checkout preference
     */
    createPreference(dto: CreatePreferenceDto): Promise<{
        preferenceId: string;
        initPoint: string;
    }>;
    /**
     * POST /mercado-pago/webhook - Receive webhook notifications
     */
    handleWebhook(body: WebhookDto, _signature: string, _requestId: string): Promise<{
        received: boolean;
    }>;
    /**
     * GET /mercado-pago/payment/:id - Get payment status
     */
    getPaymentStatus(paymentId: string): Promise<{
        status: string;
        statusDetail: string;
        amount: number;
        paidAt: Date | null;
    }>;
    /**
     * POST /mercado-pago/simulate/:invoiceId - Simulate payment (dev only)
     */
    simulatePayment(invoiceId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=mercado-pago.controller.d.ts.map