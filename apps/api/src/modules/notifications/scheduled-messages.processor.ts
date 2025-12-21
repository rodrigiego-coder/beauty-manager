import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { WhatsAppService } from '../automation/whatsapp.service';

@Injectable()
export class ScheduledMessagesProcessor {
  private readonly logger = new Logger(ScheduledMessagesProcessor.name);
  private isProcessing = false;

  constructor(
    private readonly scheduledMessagesService: ScheduledMessagesService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  /**
   * Processa mensagens pendentes a cada minuto
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledMessages(): Promise<void> {
    // Evita processamento paralelo
    if (this.isProcessing) {
      this.logger.debug('Processamento já em andamento, pulando...');
      return;
    }

    this.isProcessing = true;

    try {
      const messages = await this.scheduledMessagesService.getPendingMessages(20);

      if (messages.length === 0) {
        return;
      }

      this.logger.log(`Processando ${messages.length} mensagens pendentes`);

      for (const message of messages) {
        await this.processMessage(message);
      }
    } catch (error) {
      this.logger.error('Erro no processamento de mensagens:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Processa uma mensagem individual
   */
  private async processMessage(message: any): Promise<void> {
    try {
      // Verifica se excedeu tentativas
      if (message.attempts >= message.maxAttempts) {
        await this.scheduledMessagesService.updateMessageStatus(
          message.id,
          'FAILED',
          undefined,
          'Máximo de tentativas excedido',
        );
        return;
      }

      // Atualiza para SENDING
      await this.scheduledMessagesService.updateMessageStatus(message.id, 'SENDING');

      // Monta a mensagem
      const messageText = this.buildMessageText(message);

      // Envia via WhatsApp
      const result = await this.whatsappService.sendMessage(
        message.salonId,
        message.recipientPhone,
        messageText,
      );

      // Atualiza status
      if (result?.success) {
        await this.scheduledMessagesService.updateMessageStatus(
          message.id,
          'SENT',
          result.messageId,
        );
        this.logger.log(`Mensagem ${message.id} enviada para ${message.recipientPhone}`);
      } else {
        throw new Error(result?.error || 'Falha no envio');
      }
    } catch (error: any) {
      this.logger.error(`Erro ao enviar mensagem ${message.id}:`, error.message);

      await this.scheduledMessagesService.updateMessageStatus(
        message.id,
        message.attempts + 1 >= message.maxAttempts ? 'FAILED' : 'PENDING',
        undefined,
        error.message,
      );
    }
  }

  /**
   * Monta texto da mensagem baseado no template
   */
  private buildMessageText(message: any): string {
    const vars = message.templateVariables || {};

    switch (message.notificationType) {
      case 'APPOINTMENT_CONFIRMATION':
        return `Olá ${vars.nome}! 👋

Seu agendamento foi registrado:

📅 *${vars.data}* às *${vars.horario}*
✂️ ${vars.servico}
💇 ${vars.profissional}

Por favor, confirme sua presença:
👉 Responda *SIM* para confirmar
👉 Responda *NÃO* para cancelar

Obrigado! 💜`;

      case 'APPOINTMENT_REMINDER_24H':
        return `Oi ${vars.nome}! 🕐

Lembrete: *Amanhã* você tem horário!

📅 ${vars.data} às ${vars.horario}
✂️ ${vars.servico}
💇 ${vars.profissional}

Confirme sua presença respondendo *SIM*.

Até lá! 💜`;

      case 'APPOINTMENT_REMINDER_1H':
        return `Oi ${vars.nome}! ⏰

Seu horário é *daqui a 1 hora*!

📅 Hoje às ${vars.horario}
✂️ ${vars.servico}
💇 ${vars.profissional}

Estamos te esperando! 💜`;

      case 'APPOINTMENT_CANCELLED':
        return `Oi ${vars.nome},

Seu agendamento foi *cancelado*:

📅 ${vars.data} às ${vars.horario}
✂️ ${vars.servico}

Se precisar reagendar, entre em contato conosco.

Atenciosamente 💜`;

      case 'APPOINTMENT_RESCHEDULED':
        return `Oi ${vars.nome}! 📅

Seu agendamento foi *remarcado*:

❌ Antes: ${vars.dataAnterior || 'N/A'} às ${vars.horarioAnterior || 'N/A'}
✅ Agora: ${vars.data} às ${vars.horario}
✂️ ${vars.servico}
💇 ${vars.profissional}

Confirme a nova data respondendo *SIM*.

Obrigado! 💜`;

      case 'APPOINTMENT_COMPLETED':
        return `Oi ${vars.nome}! ✨

Obrigado pela visita hoje!

Esperamos que você tenha gostado do seu ${vars.servico}.

Até a próxima! 💜`;

      case 'CUSTOM':
        return message.customMessage || '';

      default:
        return message.customMessage || 'Mensagem do salão';
    }
  }
}
