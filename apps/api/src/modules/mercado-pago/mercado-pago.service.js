"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoPagoService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
let MercadoPagoService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MercadoPagoService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MercadoPagoService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService;
        subscriptionsService;
        logger = new common_1.Logger(MercadoPagoService.name);
        accessToken;
        publicKey;
        webhookSecret;
        baseUrl = 'https://api.mercadopago.com';
        sandboxMode;
        constructor(configService, subscriptionsService) {
            this.configService = configService;
            this.subscriptionsService = subscriptionsService;
            this.accessToken = this.configService.get('MERCADO_PAGO_ACCESS_TOKEN') || '';
            this.publicKey = this.configService.get('MERCADO_PAGO_PUBLIC_KEY') || '';
            this.webhookSecret = this.configService.get('MERCADO_PAGO_WEBHOOK_SECRET') || '';
            this.sandboxMode = this.configService.get('MERCADO_PAGO_SANDBOX') === 'true';
            if (!this.accessToken) {
                this.logger.warn('MERCADO_PAGO_ACCESS_TOKEN not configured - payments will be simulated');
            }
        }
        /**
         * Get public key for frontend SDK
         */
        getPublicKey() {
            return this.publicKey;
        }
        /**
         * Create or get customer in MercadoPago
         */
        async createCustomer(salonId) {
            if (!this.accessToken) {
                return null;
            }
            // Get salon data
            const salon = await connection_1.db
                .select()
                .from(schema_1.salons)
                .where((0, drizzle_orm_1.eq)(schema_1.salons.id, salonId))
                .limit(1);
            if (salon.length === 0) {
                throw new common_1.NotFoundException('Salão não encontrado');
            }
            const salonData = salon[0];
            // Check if customer already exists
            const subscription = await connection_1.db
                .select()
                .from(schema_1.salonSubscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.salonId, salonId))
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
                const customer = (await response.json());
                // Save customer ID to subscription
                if (subscription.length > 0) {
                    await connection_1.db
                        .update(schema_1.salonSubscriptions)
                        .set({ mercadoPagoCustomerId: customer.id })
                        .where((0, drizzle_orm_1.eq)(schema_1.salonSubscriptions.id, subscription[0].id));
                }
                return customer;
            }
            catch (error) {
                this.logger.error('Error creating MercadoPago customer:', error);
                return null;
            }
        }
        /**
         * Create PIX payment
         */
        async createPixPayment(invoiceId) {
            // Get invoice
            const invoice = await connection_1.db
                .select()
                .from(schema_1.subscriptionInvoices)
                .where((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.id, invoiceId))
                .limit(1);
            if (invoice.length === 0) {
                throw new common_1.NotFoundException('Fatura não encontrada');
            }
            const invoiceData = invoice[0];
            if (invoiceData.status === 'PAID') {
                throw new common_1.BadRequestException('Fatura já está paga');
            }
            // Get salon for payer info
            const salon = await connection_1.db
                .select()
                .from(schema_1.salons)
                .where((0, drizzle_orm_1.eq)(schema_1.salons.id, invoiceData.salonId))
                .limit(1);
            const salonData = salon[0];
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
            // If no access token, simulate payment
            if (!this.accessToken) {
                const mockPixCode = `00020126580014BR.GOV.BCB.PIX0136${invoiceData.id}5204000053039865406${parseFloat(invoiceData.totalAmount).toFixed(2)}5802BR`;
                const mockQrBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
                // Update invoice with mock pix data
                await connection_1.db
                    .update(schema_1.subscriptionInvoices)
                    .set({
                    paymentMethod: 'PIX',
                    pixQrCode: mockPixCode,
                    pixQrCodeBase64: mockQrBase64,
                    pixExpiresAt: expiresAt,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.id, invoiceId));
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
                    throw new common_1.BadRequestException('Erro ao criar pagamento PIX');
                }
                const payment = (await response.json());
                // Update invoice with pix data
                await connection_1.db
                    .update(schema_1.subscriptionInvoices)
                    .set({
                    paymentMethod: 'PIX',
                    mercadoPagoPaymentId: String(payment.id),
                    pixQrCode: payment.point_of_interaction.transaction_data.qr_code,
                    pixQrCodeBase64: payment.point_of_interaction.transaction_data.qr_code_base64,
                    pixExpiresAt: new Date(payment.date_of_expiration),
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.id, invoiceId));
                return {
                    paymentId: String(payment.id),
                    qrCode: payment.point_of_interaction.transaction_data.qr_code,
                    qrCodeBase64: payment.point_of_interaction.transaction_data.qr_code_base64,
                    expiresAt: new Date(payment.date_of_expiration),
                    ticketUrl: payment.point_of_interaction.transaction_data.ticket_url,
                };
            }
            catch (error) {
                this.logger.error('Error creating PIX payment:', error);
                throw new common_1.BadRequestException('Erro ao criar pagamento PIX');
            }
        }
        /**
         * Create checkout preference for card payments
         */
        async createPreference(invoiceId, urls) {
            // Get invoice
            const invoice = await connection_1.db
                .select()
                .from(schema_1.subscriptionInvoices)
                .where((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.id, invoiceId))
                .limit(1);
            if (invoice.length === 0) {
                throw new common_1.NotFoundException('Fatura não encontrada');
            }
            const invoiceData = invoice[0];
            if (invoiceData.status === 'PAID') {
                throw new common_1.BadRequestException('Fatura já está paga');
            }
            // Get salon
            const salon = await connection_1.db
                .select()
                .from(schema_1.salons)
                .where((0, drizzle_orm_1.eq)(schema_1.salons.id, invoiceData.salonId))
                .limit(1);
            const salonData = salon[0];
            const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
            // If no access token, return mock
            if (!this.accessToken) {
                const mockPreferenceId = `MOCK_PREF_${invoiceId}`;
                await connection_1.db
                    .update(schema_1.subscriptionInvoices)
                    .set({
                    paymentMethod: 'CARD',
                    mercadoPagoPreferenceId: mockPreferenceId,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.id, invoiceId));
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
                    throw new common_1.BadRequestException('Erro ao criar preferência de pagamento');
                }
                const preference = (await response.json());
                // Update invoice
                await connection_1.db
                    .update(schema_1.subscriptionInvoices)
                    .set({
                    paymentMethod: 'CARD',
                    mercadoPagoPreferenceId: preference.id,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.id, invoiceId));
                return {
                    preferenceId: preference.id,
                    initPoint: this.sandboxMode ? preference.sandbox_init_point : preference.init_point,
                };
            }
            catch (error) {
                this.logger.error('Error creating preference:', error);
                throw new common_1.BadRequestException('Erro ao criar preferência de pagamento');
            }
        }
        /**
         * Get payment status
         */
        async getPaymentStatus(paymentId) {
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
                const payment = (await response.json());
                return {
                    status: payment.status,
                    statusDetail: payment.status_detail,
                    amount: payment.transaction_amount,
                    paidAt: payment.date_approved ? new Date(payment.date_approved) : null,
                };
            }
            catch (error) {
                this.logger.error('Error getting payment status:', error);
                throw new common_1.BadRequestException('Erro ao consultar pagamento');
            }
        }
        /**
         * Handle webhook notification
         */
        async handleWebhook(type, data) {
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
            const invoice = await connection_1.db
                .select()
                .from(schema_1.subscriptionInvoices)
                .where((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.mercadoPagoPaymentId, paymentId))
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
        verifyWebhookSignature(_signature, _requestId, _dataId, _timestamp) {
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
        async simulatePayment(invoiceId) {
            if (this.accessToken && !this.sandboxMode) {
                throw new common_1.BadRequestException('Simulação não permitida em produção');
            }
            const invoice = await connection_1.db
                .select()
                .from(schema_1.subscriptionInvoices)
                .where((0, drizzle_orm_1.eq)(schema_1.subscriptionInvoices.id, invoiceId))
                .limit(1);
            if (invoice.length === 0) {
                throw new common_1.NotFoundException('Fatura não encontrada');
            }
            await this.subscriptionsService.markInvoiceAsPaid(invoiceId, {
                method: 'MANUAL',
                amount: parseFloat(invoice[0].totalAmount),
            });
        }
    };
    return MercadoPagoService = _classThis;
})();
exports.MercadoPagoService = MercadoPagoService;
//# sourceMappingURL=mercado-pago.service.js.map