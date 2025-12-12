import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreatePreferenceDto, CreatePixDto, WebhookDto } from './dto';

@Controller('mercado-pago')
export class MercadoPagoController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  /**
   * GET /mercado-pago/public-key - Get public key for frontend SDK
   */
  @Get('public-key')
  @Public()
  getPublicKey() {
    return {
      publicKey: this.mercadoPagoService.getPublicKey(),
    };
  }

  /**
   * POST /mercado-pago/create-pix - Create PIX payment
   */
  @Post('create-pix')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER')
  async createPix(@Body() dto: CreatePixDto) {
    return this.mercadoPagoService.createPixPayment(dto.invoiceId);
  }

  /**
   * POST /mercado-pago/create-preference - Create checkout preference
   */
  @Post('create-preference')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER')
  async createPreference(@Body() dto: CreatePreferenceDto) {
    return this.mercadoPagoService.createPreference(dto.invoiceId, {
      success: dto.successUrl,
      failure: dto.failureUrl,
      pending: dto.pendingUrl,
    });
  }

  /**
   * POST /mercado-pago/webhook - Receive webhook notifications
   */
  @Post('webhook')
  @Public()
  @HttpCode(200)
  async handleWebhook(
    @Body() body: WebhookDto,
    @Headers('x-signature') _signature: string,
    @Headers('x-request-id') _requestId: string,
  ) {
    // TODO: Verify signature in production
    // const isValid = this.mercadoPagoService.verifyWebhookSignature(
    //   _signature,
    //   _requestId,
    //   body.data.id,
    //   new Date().toISOString()
    // );

    await this.mercadoPagoService.handleWebhook(body.type, body.data);
    return { received: true };
  }

  /**
   * GET /mercado-pago/payment/:id - Get payment status
   */
  @Get('payment/:id')
  @UseGuards(AuthGuard, RolesGuard)
  async getPaymentStatus(@Param('id') paymentId: string) {
    return this.mercadoPagoService.getPaymentStatus(paymentId);
  }

  /**
   * POST /mercado-pago/simulate/:invoiceId - Simulate payment (dev only)
   */
  @Post('simulate/:invoiceId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'OWNER')
  async simulatePayment(@Param('invoiceId') invoiceId: string) {
    await this.mercadoPagoService.simulatePayment(invoiceId);
    return { success: true, message: 'Pagamento simulado com sucesso' };
  }
}
