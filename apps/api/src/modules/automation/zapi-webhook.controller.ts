import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../database/connection';
import * as schema from '../../database/schema';

/**
 * Webhook para receber mensagens do Z-API
 * Processa respostas de confirmação (SIM/NÃO)
 */
@Public()
@Controller('webhook/zapi')
export class ZapiWebhookController {
  private readonly logger = new Logger(ZapiWebhookController.name);

  /**
   * Recebe mensagens do Z-API
   * Documentação: https://developer.z-api.io/webhooks/on-message-received
   */
  @Post('messages')
  @HttpCode(HttpStatus.OK)
  async handleIncomingMessage(@Body() payload: any) {
    this.logger.log(`Webhook recebido: ${JSON.stringify(payload)}`);

    try {
      // Z-API envia diferentes tipos de eventos
      // Focamos em mensagens de texto recebidas
      if (!payload.text?.message) {
        this.logger.debug('Payload sem mensagem de texto, ignorando');
        return { received: true };
      }

      const phone = this.extractPhone(payload.phone || payload.from);
      const message = payload.text.message.trim().toUpperCase();

      this.logger.log(`Mensagem de ${phone}: "${message}"`);

      // Verifica se é uma resposta de confirmação
      if (message === 'SIM' || message === 'S' || message === 'CONFIRMO' || message === 'CONFIRMAR') {
        await this.handleConfirmation(phone, 'CONFIRMED');
      } else if (message === 'NAO' || message === 'NÃO' || message === 'N' || message === 'CANCELAR') {
        await this.handleConfirmation(phone, 'CANCELLED');
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Erro ao processar webhook:', error);
      return { received: true, error: 'Internal error' };
    }
  }

  /**
   * Webhook alternativo para status de mensagens
   */
  @Post('status')
  @HttpCode(HttpStatus.OK)
  async handleMessageStatus(@Body() payload: any) {
    this.logger.debug(`Status webhook: ${JSON.stringify(payload)}`);

    // Atualiza status da mensagem (DELIVERED, READ, etc)
    if (payload.messageId && payload.status) {
      try {
        const statusMap: Record<string, string> = {
          'DELIVERY_ACK': 'DELIVERED',
          'READ': 'READ',
          'PLAYED': 'READ',
        };

        const newStatus = statusMap[payload.status];
        if (newStatus) {
          await db
            .update(schema.appointmentNotifications)
            .set({
              status: newStatus as any,
              deliveredAt: newStatus === 'DELIVERED' ? new Date() : undefined,
              readAt: newStatus === 'READ' ? new Date() : undefined,
              updatedAt: new Date(),
            })
            .where(eq(schema.appointmentNotifications.providerMessageId, payload.messageId));
        }
      } catch (error) {
        this.logger.error('Erro ao atualizar status:', error);
      }
    }

    return { received: true };
  }

  /**
   * Processa confirmação/cancelamento
   */
  private async handleConfirmation(phone: string, action: 'CONFIRMED' | 'CANCELLED') {
    // Formata o telefone para busca
    const phoneVariants = [
      phone,
      phone.replace(/^55/, ''),
      `55${phone}`,
    ];

    // Filtra pelo telefone (pode ter variações de formato)
    const matchingAppointments = await db
      .select()
      .from(schema.appointments)
      .where(eq(schema.appointments.status, 'PENDING_CONFIRMATION'))
      .orderBy(desc(schema.appointments.createdAt))
      .limit(20);

    const foundAppointment = matchingAppointments.find(apt => {
      const aptPhone = apt.clientPhone?.replace(/\D/g, '') || '';
      return phoneVariants.some(p => aptPhone.includes(p.replace(/\D/g, '')) || p.replace(/\D/g, '').includes(aptPhone));
    });

    if (!foundAppointment) {
      this.logger.warn(`Nenhum agendamento pendente encontrado para ${phone}`);
      return;
    }

    // Atualiza o agendamento
    const newStatus = action === 'CONFIRMED' ? 'CONFIRMED' : 'CANCELLED';
    const confirmationStatus = action === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING';

    await db
      .update(schema.appointments)
      .set({
        status: newStatus,
        confirmationStatus: confirmationStatus,
        confirmedAt: action === 'CONFIRMED' ? new Date() : undefined,
        confirmedVia: 'WHATSAPP',
        updatedAt: new Date(),
      })
      .where(eq(schema.appointments.id, foundAppointment.id));

    this.logger.log(`Agendamento ${foundAppointment.id} ${action === 'CONFIRMED' ? 'CONFIRMADO' : 'CANCELADO'} via WhatsApp`);

    // Registra a resposta na notificação
    await db
      .update(schema.appointmentNotifications)
      .set({
        clientResponse: action,
        clientRespondedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.appointmentNotifications.appointmentId, foundAppointment.id),
          eq(schema.appointmentNotifications.notificationType, 'APPOINTMENT_CONFIRMATION'),
        )
      );

    // Se cancelado, cancela os lembretes futuros
    if (action === 'CANCELLED') {
      await db
        .update(schema.appointmentNotifications)
        .set({
          status: 'CANCELLED',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.appointmentNotifications.appointmentId, foundAppointment.id),
            eq(schema.appointmentNotifications.status, 'SCHEDULED'),
          )
        );
    }
  }

  /**
   * Extrai número de telefone do payload
   */
  private extractPhone(phone: string): string {
    if (!phone) return '';
    // Remove @c.us e outros sufixos do WhatsApp
    return phone.replace(/@.*$/, '').replace(/\D/g, '');
  }
}
