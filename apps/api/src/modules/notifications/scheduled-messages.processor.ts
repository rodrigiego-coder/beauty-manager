import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { WhatsAppService } from '../automation/whatsapp.service';
import { AuditService } from '../audit/audit.service';

// Constantes de configuração
const MAX_RETRY_ATTEMPTS = 3;
const BATCH_SIZE = 20;

@Injectable()
export class ScheduledMessagesProcessor {
  private readonly logger = new Logger(ScheduledMessagesProcessor.name);
  private isProcessing = false;

  constructor(
    private readonly scheduledMessagesService: ScheduledMessagesService,
    private readonly whatsappService: WhatsAppService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Processa mensagens pendentes a cada minuto
   * CONCORRÊNCIA SEGURA: Usa SKIP LOCKED para evitar processamento duplicado
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledMessages(): Promise<void> {
    // Lock local para evitar overlap no mesmo processo
    if (this.isProcessing) {
      this.logger.debug('Processamento já em andamento, pulando...');
      return;
    }

    this.isProcessing = true;

    try {
      // Usa método com SKIP LOCKED para concorrência segura
      const messages = await this.scheduledMessagesService.getPendingMessagesWithLock(BATCH_SIZE);

      // Defensive check: messages pode ser undefined se a query falhar
      if (!messages || messages.length === 0) {
        return;
      }

      this.logger.log(`Processando ${messages.length} mensagens pendentes`);

      // Processa em paralelo com limite de concorrência
      const results = await Promise.allSettled(
        messages.map((message) => this.processMessageWithFaultTolerance(message)),
      );

      // Log de resultados
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      this.logger.log(`Processamento concluído: ${succeeded} sucesso, ${failed} falhas`);
    } catch (error) {
      this.logger.error('Erro no processamento de mensagens:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Processa uma mensagem individual com tolerância a falhas
   * DEGRADAÇÃO GRACIOSA: Nunca propaga erro para não parar o loop
   */
  private async processMessageWithFaultTolerance(message: any): Promise<void> {
    try {
      // Verifica se excedeu tentativas
      if (message.attempts >= MAX_RETRY_ATTEMPTS) {
        await this.handleMaxAttemptsReached(message);
        return;
      }

      // Monta a mensagem
      const messageText = this.buildMessageText(message);

      // Tenta enviar via configuração do salão primeiro, se falhar usa Z-API direto
      let result = await Promise.race([
        this.whatsappService.sendMessage(
          message.salon_id,
          message.recipient_phone,
          messageText,
        ),
        this.createTimeout(30000), // 30s timeout
      ]);

      // Se falhou por configuração do salão, tenta Z-API direto
      if (!result?.success && result?.error?.includes('não está habilitado')) {
        this.logger.debug(`Fallback para Z-API direto para ${message.recipient_phone}`);
        result = await this.whatsappService.sendDirectMessage(
          message.recipient_phone,
          messageText,
        );
      }

      // Processa resultado
      if (result?.success) {
        await this.handleSendSuccess(message, result);
      } else {
        await this.handleSendFailure(message, result?.error || 'Resposta inválida do provider');
      }
    } catch (error: any) {
      // DEGRADAÇÃO GRACIOSA: Registra erro e agenda retry
      await this.handleSendFailure(message, error.message || 'Erro desconhecido');
    }
  }

  /**
   * Trata sucesso no envio
   */
  private async handleSendSuccess(message: any, result: any): Promise<void> {
    await this.scheduledMessagesService.updateMessageStatus(
      message.id,
      'SENT',
      result.messageId,
    );

    // Audit log
    await this.auditService.logWhatsAppSent({
      salonId: message.salon_id,
      notificationId: message.id,
      appointmentId: message.appointment_id,
      recipientPhone: message.recipient_phone,
      notificationType: message.notification_type,
      providerId: result.messageId,
      success: true,
    });

    this.logger.log(`Mensagem ${message.id} enviada para ${this.maskPhone(message.recipient_phone)}`);
  }

  /**
   * Trata falha no envio - agenda retry ou marca como falha
   */
  private async handleSendFailure(message: any, errorMessage: string): Promise<void> {
    this.logger.error(`Erro ao enviar mensagem ${message.id}: ${errorMessage}`);

    // Audit log de falha
    await this.auditService.logWhatsAppSent({
      salonId: message.salon_id,
      notificationId: message.id,
      appointmentId: message.appointment_id,
      recipientPhone: message.recipient_phone,
      notificationType: message.notification_type,
      success: false,
      error: errorMessage,
    });

    // Se ainda tem tentativas, agenda retry
    if (message.attempts < MAX_RETRY_ATTEMPTS - 1) {
      await this.scheduledMessagesService.scheduleRetry(
        message.id,
        message.attempts,
        errorMessage,
      );
    } else {
      // Última tentativa falhou
      await this.scheduledMessagesService.updateMessageStatus(
        message.id,
        'FAILED',
        undefined,
        errorMessage,
      );
    }
  }

  /**
   * Trata quando atingiu máximo de tentativas
   */
  private async handleMaxAttemptsReached(message: any): Promise<void> {
    await this.scheduledMessagesService.updateMessageStatus(
      message.id,
      'FAILED',
      undefined,
      'Máximo de tentativas excedido',
    );

    this.logger.warn(`Mensagem ${message.id} falhou após ${MAX_RETRY_ATTEMPTS} tentativas`);
  }

  /**
   * Cria timeout para evitar hang infinito
   */
  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout após ${ms}ms`)), ms),
    );
  }

  /**
   * Mascara telefone para logs
   */
  private maskPhone(phone: string): string {
    if (!phone || phone.length < 8) return '***';
    return `${phone.substring(0, 4)}****${phone.substring(phone.length - 2)}`;
  }

  /**
   * Monta texto da mensagem baseado no template
   */
  private buildMessageText(message: any): string {
    const vars = message.template_variables || {};

    switch (message.notification_type) {
      case 'APPOINTMENT_CONFIRMATION': {
        let confirmationText = `Olá ${vars.nome}! 👋

Seu agendamento foi registrado:

📅 *${vars.data}* às *${vars.horario}*
✂️ ${vars.servico}
💇 ${vars.profissional}`;

        if (vars.triageLink) {
          confirmationText += `

📋 *IMPORTANTE - Pré-Avaliação Obrigatória:*
Para sua segurança, preencha o formulário antes do atendimento:
👉 ${vars.triageLink}

⚠️ _Sem a pré-avaliação, o procedimento pode ser recusado._`;
        }

        confirmationText += `

Por favor, confirme sua presença:
👉 Responda *SIM* para confirmar
👉 Responda *NÃO* para cancelar

Obrigado! 💜`;

        return confirmationText;
      }

      case 'APPOINTMENT_REMINDER_24H': {
        let reminder24Text = `Oi ${vars.nome}! 🕐

Lembrete: *Amanhã* você tem horário!

📅 ${vars.data} às ${vars.horario}
✂️ ${vars.servico}
💇 ${vars.profissional}`;

        if (vars.triagePending && vars.triageLink) {
          reminder24Text += `

⚠️ *Atenção:* Você ainda não preencheu a pré-avaliação!
👉 ${vars.triageLink}
_Preencha antes do seu horário._`;
        }

        reminder24Text += `

Podemos contar com você?
👉 *SIM* - Confirmado!
👉 *NÃO* - Preciso reagendar

Até lá! 💜`;

        return reminder24Text;
      }

      case 'APPOINTMENT_REMINDER_1H':
      case 'APPOINTMENT_REMINDER_1H30':
        return `Oi ${vars.nome}! ⏰

Seu horário é *daqui a 1 hora e meia*!

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

      case 'TRIAGE_COMPLETED': {
        let triageText = `${vars.nome}, recebemos sua pré-avaliação! ✅

`;
        if (vars.hasRisks === 'true') {
          triageText += `⚠️ *Identificamos alguns pontos de atenção.*
Nossa equipe vai analisar e, se necessário, entraremos em contato antes do seu horário.

`;
        } else {
          triageText += `✅ *Tudo certo!* Nenhuma restrição identificada.

`;
        }

        triageText += `📅 Seu agendamento: ${vars.data} às ${vars.horario}

Até lá! 💜`;

        return triageText;
      }

      case 'CUSTOM':
        return message.custom_message || '';

      default:
        return message.custom_message || 'Mensagem do salão';
    }
  }
}
