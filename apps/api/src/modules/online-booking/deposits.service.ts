import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  Inject,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { CreateDepositDto } from './dto';
import { OnlineBookingSettingsService } from './online-booking-settings.service';

@Injectable()
export class DepositsService {
  private readonly logger = new Logger(DepositsService.name);
  private readonly DEPOSIT_EXPIRATION_HOURS = 24;

  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly settingsService: OnlineBookingSettingsService,
  ) {}

  /**
   * Calcula o valor do depósito para um serviço
   */
  async calculateDepositAmount(salonId: string, servicePrice: number): Promise<number> {
    const settings = await this.settingsService.getSettings(salonId);

    if (!settings.requireDeposit) {
      return 0;
    }

    // Verifica se o serviço atinge o valor mínimo para exigir depósito
    const minServices = parseFloat(settings.depositMinServices || '0');
    if (servicePrice < minServices) {
      return 0;
    }

    const depositValue = parseFloat(settings.depositValue || '0');

    if (settings.depositType === 'PERCENTAGE') {
      return Math.round(servicePrice * (depositValue / 100) * 100) / 100;
    }

    // FIXED
    return depositValue;
  }

  /**
   * Cria um depósito para um agendamento
   */
  async createDeposit(
    salonId: string,
    dto: CreateDepositDto,
  ): Promise<schema.AppointmentDeposit> {
    const { appointmentId, holdId, clientId, amount } = dto;

    if (!appointmentId && !holdId) {
      throw new BadRequestException('Deve informar appointmentId ou holdId');
    }

    const expiresAt = new Date(Date.now() + this.DEPOSIT_EXPIRATION_HOURS * 60 * 60 * 1000);

    const [deposit] = await this.db
      .insert(schema.appointmentDeposits)
      .values({
        salonId,
        appointmentId,
        holdId,
        clientId,
        amount: amount.toString(),
        status: 'PENDING',
        expiresAt,
      })
      .returning();

    this.logger.log(`Depósito criado: ${deposit.id} - R$ ${amount}`);

    return deposit;
  }

  /**
   * Obtém um depósito pelo ID
   */
  async getDeposit(salonId: string, depositId: string): Promise<schema.AppointmentDeposit | null> {
    const [deposit] = await this.db
      .select()
      .from(schema.appointmentDeposits)
      .where(
        and(
          eq(schema.appointmentDeposits.id, depositId),
          eq(schema.appointmentDeposits.salonId, salonId),
        ),
      )
      .limit(1);

    return deposit || null;
  }

  /**
   * Obtém depósito por agendamento
   */
  async getDepositByAppointment(
    salonId: string,
    appointmentId: string,
  ): Promise<schema.AppointmentDeposit | null> {
    const [deposit] = await this.db
      .select()
      .from(schema.appointmentDeposits)
      .where(
        and(
          eq(schema.appointmentDeposits.salonId, salonId),
          eq(schema.appointmentDeposits.appointmentId, appointmentId),
        ),
      )
      .limit(1);

    return deposit || null;
  }

  /**
   * Obtém depósito por hold
   */
  async getDepositByHold(
    salonId: string,
    holdId: string,
  ): Promise<schema.AppointmentDeposit | null> {
    const [deposit] = await this.db
      .select()
      .from(schema.appointmentDeposits)
      .where(
        and(
          eq(schema.appointmentDeposits.salonId, salonId),
          eq(schema.appointmentDeposits.holdId, holdId),
        ),
      )
      .limit(1);

    return deposit || null;
  }

  /**
   * Marca depósito como pago
   */
  async markAsPaid(
    salonId: string,
    depositId: string,
    paymentData: {
      paymentMethod: string;
      paymentReference?: string;
      mercadoPagoPaymentId?: string;
    },
  ): Promise<schema.AppointmentDeposit> {
    const deposit = await this.getDeposit(salonId, depositId);

    if (!deposit) {
      throw new NotFoundException('Depósito não encontrado');
    }

    if (deposit.status !== 'PENDING') {
      throw new BadRequestException('Depósito não está pendente');
    }

    const [updated] = await this.db
      .update(schema.appointmentDeposits)
      .set({
        status: 'PAID',
        paymentMethod: paymentData.paymentMethod as any,
        paymentReference: paymentData.paymentReference,
        mercadoPagoPaymentId: paymentData.mercadoPagoPaymentId,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.appointmentDeposits.id, depositId))
      .returning();

    this.logger.log(`Depósito ${depositId} marcado como pago`);

    return updated;
  }

  /**
   * Vincula depósito a um agendamento (quando criado a partir de hold)
   */
  async linkToAppointment(
    salonId: string,
    depositId: string,
    appointmentId: string,
  ): Promise<void> {
    await this.db
      .update(schema.appointmentDeposits)
      .set({
        appointmentId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.appointmentDeposits.id, depositId),
          eq(schema.appointmentDeposits.salonId, salonId),
        ),
      );
  }

  /**
   * Processa reembolso do depósito
   */
  async refundDeposit(
    salonId: string,
    depositId: string,
    reason?: string,
  ): Promise<schema.AppointmentDeposit> {
    const deposit = await this.getDeposit(salonId, depositId);

    if (!deposit) {
      throw new NotFoundException('Depósito não encontrado');
    }

    if (deposit.status !== 'PAID') {
      throw new BadRequestException('Apenas depósitos pagos podem ser reembolsados');
    }

    // TODO: Integrar com Mercado Pago para processar reembolso real
    // if (deposit.mercadoPagoPaymentId) {
    //   await this.mercadoPagoService.refund(deposit.mercadoPagoPaymentId);
    // }

    const [updated] = await this.db
      .update(schema.appointmentDeposits)
      .set({
        status: 'REFUNDED',
        refundedAt: new Date(),
        notes: reason,
        updatedAt: new Date(),
      })
      .where(eq(schema.appointmentDeposits.id, depositId))
      .returning();

    this.logger.log(`Depósito ${depositId} reembolsado`);

    return updated;
  }

  /**
   * Marca depósito como perdido (no-show ou cancelamento tardio)
   */
  async forfeitDeposit(
    salonId: string,
    depositId: string,
    reason?: string,
  ): Promise<schema.AppointmentDeposit> {
    const deposit = await this.getDeposit(salonId, depositId);

    if (!deposit) {
      throw new NotFoundException('Depósito não encontrado');
    }

    if (deposit.status !== 'PAID') {
      throw new BadRequestException('Apenas depósitos pagos podem ser perdidos');
    }

    const [updated] = await this.db
      .update(schema.appointmentDeposits)
      .set({
        status: 'FORFEITED',
        forfeitedAt: new Date(),
        notes: reason,
        updatedAt: new Date(),
      })
      .where(eq(schema.appointmentDeposits.id, depositId))
      .returning();

    this.logger.log(`Depósito ${depositId} perdido: ${reason}`);

    return updated;
  }

  /**
   * Gera dados do PIX para pagamento
   * Integração com Mercado Pago
   */
  async generatePixPayment(
    salonId: string,
    depositId: string,
  ): Promise<{ pixCode: string; qrCodeBase64: string; expiresAt: Date }> {
    const deposit = await this.getDeposit(salonId, depositId);

    if (!deposit) {
      throw new NotFoundException('Depósito não encontrado');
    }

    if (deposit.status !== 'PENDING') {
      throw new BadRequestException('Depósito não está pendente');
    }

    // TODO: Integrar com Mercado Pago para gerar PIX real
    // const pixData = await this.mercadoPagoService.createPixPayment({
    //   amount: parseFloat(deposit.amount),
    //   description: 'Sinal de agendamento',
    //   externalReference: depositId,
    // });

    // Mock para desenvolvimento
    const mockPixCode = `00020126580014br.gov.bcb.pix0136${depositId}5204000053039865802BR5925SALON${Date.now()}6009SAO PAULO62070503***6304`;
    const mockQrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    // Salva dados do PIX
    await this.db
      .update(schema.appointmentDeposits)
      .set({
        pixCode: mockPixCode,
        pixQrCodeBase64: mockQrCode,
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(schema.appointmentDeposits.id, depositId));

    return {
      pixCode: mockPixCode,
      qrCodeBase64: mockQrCode,
      expiresAt,
    };
  }

  /**
   * Verifica se o cancelamento é elegível para reembolso
   */
  async isEligibleForRefund(salonId: string, appointmentId: string): Promise<boolean> {
    const deposit = await this.getDepositByAppointment(salonId, appointmentId);

    if (!deposit || deposit.status !== 'PAID') {
      return false;
    }

    const settings = await this.settingsService.getSettings(salonId);

    // Busca agendamento para verificar data/hora
    const [appointment] = await this.db
      .select()
      .from(schema.appointments)
      .where(eq(schema.appointments.id, appointmentId))
      .limit(1);

    if (!appointment) {
      return false;
    }

    // Calcula quantas horas faltam para o agendamento
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}:00`);
    const hoursUntilAppointment = (appointmentDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    // Elegível se cancelar com antecedência mínima
    return hoursUntilAppointment >= settings.cancellationHours;
  }
}
