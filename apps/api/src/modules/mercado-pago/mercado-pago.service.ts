import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { db } from '../../database/connection';
import {
  subscriptionInvoices,
  salonSubscriptions,
  salons,
} from '../../database/schema';
import { SalonSubscriptionsService } from '../subscriptions/salon-subscriptions.service';

interface MercadoPagoCustomer {
  id: string;
  email: string;
}

interface MercadoPagoPayment {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  date_approved: string | null;
  payment_method_id: string;
  payer: {
    email: string;
  };
}

interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

interface PixPaymentResponse {
  id: number;
  status: string;
  point_of_interaction: {
    transaction_data: {
      qr_code: string;
      qr_code_base64: string;
      ticket_url: string;
    };
  };
  date_of_expiration: string;
}

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly accessToken: string;
  private readonly publicKey: string;
  private readonly webhookSecret: string;
  private readonly baseUrl = 'https://api.mercadopago.com';
  private readonly sandboxMode: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly subscriptionsService: SalonSubscriptionsService,
  ) {
    this.accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN') || '';
    this.publicKey = this.configService.get<string>('MERCADO_PAGO_PUBLIC_KEY') || '';
    this.webhookSecret = this.configService.get<string>('MERCADO_PAGO_WEBHOOK_SECRET') || '';
    this.sandboxMode = this.configService.get<string>('MERCADO_PAGO_SANDBOX') === 'true';

    if (!this.accessToken) {
      this.logger.warn('MERCADO_PAGO_ACCESS_TOKEN not configured - payments will be simulated');
    }
  }

  /**
   * Get public key for frontend SDK
   */
  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Create or get customer in MercadoPago
   */
  async createCustomer(salonId: string): Promise<MercadoPagoCustomer | null> {
    if (!this.accessToken) {
      return null;
    }

    // Get salon data
    const salon = await db
      .select()
      .from(salons)
      .where(eq(salons.id, salonId))
      .limit(1);

    if (salon.length === 0) {
      throw new NotFoundException('Salão não encontrado');
    }

    const salonData = salon[0];

    // Check if customer already exists
    const subscription = await db
      .select()
      .from(salonSubscriptions)
      .where(eq(salonSubscriptions.salonId, salonId))
      .limit(1);

    if (subscription.length > 0 && subscription[0].mercadoPagoCustomerId) {
      return { id: subscription[0].mercadoPagoCustomerId, email: salonData.email || '' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: salonData.email,
          first_name: salonData.name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        this.logger.error('Error creating customer:', error);
        return null;
      }

      const customer = (await response.json()) as MercadoPagoCustomer;

      // Save customer ID to subscription
      if (subscription.length > 0) {
        await db
          .update(salonSubscriptions)
          .set({ mercadoPagoCustomerId: customer.id })
          .where(eq(salonSubscriptions.id, subscription[0].id));
      }

      return customer;
    } catch (error) {
      this.logger.error('Error creating MercadoPago customer:', error);
      return null;
    }
  }

  /**
   * Create PIX payment
   */
  async createPixPayment(invoiceId: string): Promise<{
    paymentId: string;
    qrCode: string;
    qrCodeBase64: string;
    expiresAt: Date;
    ticketUrl?: string;
  }> {
    // Get invoice
    const invoice = await db
      .select()
      .from(subscriptionInvoices)
      .where(eq(subscriptionInvoices.id, invoiceId))
      .limit(1);

    if (invoice.length === 0) {
      throw new NotFoundException('Fatura não encontrada');
    }

    const invoiceData = invoice[0];

    if (invoiceData.status === 'PAID') {
      throw new BadRequestException('Fatura já está paga');
    }

    // Get salon for payer info
    const salon = await db
      .select()
      .from(salons)
      .where(eq(salons.id, invoiceData.salonId))
      .limit(1);

    const salonData = salon[0];
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // If no access token, simulate payment
    if (!this.accessToken) {
      const mockPixCode = `00020126580014BR.GOV.BCB.PIX0136${invoiceData.id}5204000053039865406${parseFloat(invoiceData.totalAmount).toFixed(2)}5802BR`;
      const mockQrBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      // Update invoice with mock pix data
      await db
        .update(subscriptionInvoices)
        .set({
          paymentMethod: 'PIX',
          pixQrCode: mockPixCode,
          pixQrCodeBase64: mockQrBase64,
          pixExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionInvoices.id, invoiceId));

      return {
        paymentId: `MOCK_${invoiceId}`,
        qrCode: mockPixCode,
        qrCodeBase64: mockQrBase64,
        expiresAt,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': `PIX_${invoiceId}_${Date.now()}`,
        },
        body: JSON.stringify({
          transaction_amount: parseFloat(invoiceData.totalAmount),
          description: `Assinatura Beauty Manager - ${invoiceData.invoiceNumber}`,
          payment_method_id: 'pix',
          payer: {
            email: salonData?.email || 'cliente@beautymanager.com',
            first_name: salonData?.name || 'Cliente',
          },
          date_of_expiration: expiresAt.toISOString(),
          notification_url: `${this.configService.get('API_URL')}/mercado-pago/webhook`,
          external_reference: invoiceId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        this.logger.error('Error creating PIX payment:', error);
        throw new BadRequestException('Erro ao criar pagamento PIX');
      }

      const payment = (await response.json()) as PixPaymentResponse;

      // Update invoice with pix data
      await db
        .update(subscriptionInvoices)
        .set({
          paymentMethod: 'PIX',
          mercadoPagoPaymentId: String(payment.id),
          pixQrCode: payment.point_of_interaction.transaction_data.qr_code,
          pixQrCodeBase64: payment.point_of_interaction.transaction_data.qr_code_base64,
          pixExpiresAt: new Date(payment.date_of_expiration),
          updatedAt: new Date(),
        })
        .where(eq(subscriptionInvoices.id, invoiceId));

      return {
        paymentId: String(payment.id),
        qrCode: payment.point_of_interaction.transaction_data.qr_code,
        qrCodeBase64: payment.point_of_interaction.transaction_data.qr_code_base64,
        expiresAt: new Date(payment.date_of_expiration),
        ticketUrl: payment.point_of_interaction.transaction_data.ticket_url,
      };
    } catch (error) {
      this.logger.error('Error creating PIX payment:', error);
      throw new BadRequestException('Erro ao criar pagamento PIX');
    }
  }

  /**
   * Create checkout preference for card payments
   */
  async createPreference(
    invoiceId: string,
    urls?: { success?: string; failure?: string; pending?: string }
  ): Promise<{
    preferenceId: string;
    initPoint: string;
  }> {
    // Get invoice
    const invoice = await db
      .select()
      .from(subscriptionInvoices)
      .where(eq(subscriptionInvoices.id, invoiceId))
      .limit(1);

    if (invoice.length === 0) {
      throw new NotFoundException('Fatura não encontrada');
    }

    const invoiceData = invoice[0];

    if (invoiceData.status === 'PAID') {
      throw new BadRequestException('Fatura já está paga');
    }

    // Get salon
    const salon = await db
      .select()
      .from(salons)
      .where(eq(salons.id, invoiceData.salonId))
      .limit(1);

    const salonData = salon[0];
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';

    // If no access token, return mock
    if (!this.accessToken) {
      const mockPreferenceId = `MOCK_PREF_${invoiceId}`;

      await db
        .update(subscriptionInvoices)
        .set({
          paymentMethod: 'CARD',
          mercadoPagoPreferenceId: mockPreferenceId,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionInvoices.id, invoiceId));

      return {
        preferenceId: mockPreferenceId,
        initPoint: `${frontendUrl}/checkout-mock/${invoiceId}`,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/checkout/preferences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              id: invoiceData.invoiceNumber,
              title: 'Assinatura Beauty Manager',
              description: `Período: ${new Date(invoiceData.referencePeriodStart).toLocaleDateString('pt-BR')} - ${new Date(invoiceData.referencePeriodEnd).toLocaleDateString('pt-BR')}`,
              quantity: 1,
              currency_id: 'BRL',
              unit_price: parseFloat(invoiceData.totalAmount),
            },
          ],
          payer: {
            email: salonData?.email || 'cliente@beautymanager.com',
            name: salonData?.name || 'Cliente',
          },
          back_urls: {
            success: urls?.success || `${frontendUrl}/assinatura?status=success`,
            failure: urls?.failure || `${frontendUrl}/assinatura?status=failure`,
            pending: urls?.pending || `${frontendUrl}/assinatura?status=pending`,
          },
          auto_return: 'approved',
          notification_url: `${this.configService.get('API_URL')}/mercado-pago/webhook`,
          external_reference: invoiceId,
          expires: true,
          expiration_date_from: new Date().toISOString(),
          expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        this.logger.error('Error creating preference:', error);
        throw new BadRequestException('Erro ao criar preferência de pagamento');
      }

      const preference = (await response.json()) as MercadoPagoPreference;

      // Update invoice
      await db
        .update(subscriptionInvoices)
        .set({
          paymentMethod: 'CARD',
          mercadoPagoPreferenceId: preference.id,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionInvoices.id, invoiceId));

      return {
        preferenceId: preference.id,
        initPoint: this.sandboxMode ? preference.sandbox_init_point : preference.init_point,
      };
    } catch (error) {
      this.logger.error('Error creating preference:', error);
      throw new BadRequestException('Erro ao criar preferência de pagamento');
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<{
    status: string;
    statusDetail: string;
    amount: number;
    paidAt: Date | null;
  }> {
    if (!this.accessToken || paymentId.startsWith('MOCK_')) {
      return {
        status: 'pending',
        statusDetail: 'pending_waiting_payment',
        amount: 0,
        paidAt: null,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Payment not found');
      }

      const payment = (await response.json()) as MercadoPagoPayment;

      return {
        status: payment.status,
        statusDetail: payment.status_detail,
        amount: payment.transaction_amount,
        paidAt: payment.date_approved ? new Date(payment.date_approved) : null,
      };
    } catch (error) {
      this.logger.error('Error getting payment status:', error);
      throw new BadRequestException('Erro ao consultar pagamento');
    }
  }

  /**
   * Handle webhook notification
   */
  async handleWebhook(type: string, data: { id: string }): Promise<void> {
    this.logger.log(`Webhook received: ${type} - ${data.id}`);

    if (type !== 'payment') {
      return;
    }

    const paymentId = data.id;

    // Get payment status
    const paymentStatus = await this.getPaymentStatus(paymentId);

    if (paymentStatus.status !== 'approved') {
      return;
    }

    // Find invoice by payment ID
    const invoice = await db
      .select()
      .from(subscriptionInvoices)
      .where(eq(subscriptionInvoices.mercadoPagoPaymentId, paymentId))
      .limit(1);

    if (invoice.length === 0) {
      this.logger.warn(`Invoice not found for payment ${paymentId}`);
      return;
    }

    const invoiceData = invoice[0];

    if (invoiceData.status === 'PAID') {
      return; // Already paid
    }

    // Mark invoice as paid
    await this.subscriptionsService.markInvoiceAsPaid(invoiceData.id, {
      mercadoPagoPaymentId: paymentId,
      method: invoiceData.paymentMethod || 'PIX',
      amount: paymentStatus.amount,
    });

    this.logger.log(`Invoice ${invoiceData.invoiceNumber} marked as paid`);
  }

  /**
   * Verify webhook signature (for production)
   */
  verifyWebhookSignature(
    _signature: string,
    _requestId: string,
    _dataId: string,
    _timestamp: string
  ): boolean {
    if (!this.webhookSecret) {
      return true; // Skip verification if no secret configured
    }

    // TODO: In production, implement proper signature verification
    // See: https://www.mercadopago.com.br/developers/en/docs/your-integrations/notifications/webhooks
    return true;
  }

  /**
   * Simulate payment (for testing/development)
   */
  async simulatePayment(invoiceId: string): Promise<void> {
    if (this.accessToken && !this.sandboxMode) {
      throw new BadRequestException('Simulação não permitida em produção');
    }

    const invoice = await db
      .select()
      .from(subscriptionInvoices)
      .where(eq(subscriptionInvoices.id, invoiceId))
      .limit(1);

    if (invoice.length === 0) {
      throw new NotFoundException('Fatura não encontrada');
    }

    await this.subscriptionsService.markInvoiceAsPaid(invoiceId, {
      method: 'MANUAL',
      amount: parseFloat(invoice[0].totalAmount),
    });
  }
}
