import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IS_JEST } from '../../common/is-jest';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { WhatsAppService } from '../automation/whatsapp.service';
import { AuditService } from '../audit/audit.service';
import { AddonsService } from '../subscriptions/addons.service';

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
    private readonly addonsService: AddonsService,
  ) {
    this.logger.log('ScheduledMessagesProcessor inicializado - processando appointment_notifications a cada 1 minuto');
  }

  /**
   * Processa mensagens pendentes a cada minuto
   * CONCORRÊNCIA SEGURA: Usa SKIP LOCKED para evitar processamento duplicado
   */
  @Cron(CronExpression.EVERY_MINUTE, { disabled: IS_JEST })
  async processScheduledMessages(): Promise<void> {
    // Lock local para evitar overlap no mesmo processo
    if (this.isProcessing) {
      this.logger.debug('Processamento já em andamento, pulando...');
      return;
    }

    this.isProcessing = true;

    try {
      this.logger.debug('Verificando mensagens pendentes em appointment_notifications...');

      // Usa método com SKIP LOCKED para concorrência segura
      const messages = await this.scheduledMessagesService.getPendingMessagesWithLock(BATCH_SIZE);

      // Defensive check: messages pode ser undefined se a query falhar
      if (!messages || messages.length === 0) {
        this.logger.debug('Nenhuma mensagem pendente encontrada');
        return;
      }

      this.logger.log(`[appointment_notifications] Processando ${messages.length} mensagens pendentes`);

      // Processa em paralelo com limite de concorrência
      const results = await Promise.allSettled(
        messages.map((message) => this.processMessageWithFaultTolerance(message)),
      );

      // Log de resultados
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      this.logger.log(`[appointment_notifications] Processamento concluído: ${succeeded} sucesso, ${failed} falhas`);
    } catch (error) {
      this.logger.error('Erro no processamento de mensagens:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Processa uma mensagem individual com tolerância a falhas
   * DEGRADAÇÃO GRACIOSA: Nunca propaga erro para não parar o loop
   * HARD-BLOCK: Verifica quota ANTES de enviar para APPOINTMENT_CONFIRMATION
   */
  private async processMessageWithFaultTolerance(message: any): Promise<void> {
    try {
      // Verifica se excedeu tentativas
      if (message.attempts >= MAX_RETRY_ATTEMPTS) {
        await this.handleMaxAttemptsReached(message);
        return;
      }

      // HARD-BLOCK: Para APPOINTMENT_CONFIRMATION, verificar/consumir quota ANTES de enviar
      if (message.notification_type === 'APPOINTMENT_CONFIRMATION' && message.appointment_id) {
        const quotaCheck = await this.checkAndConsumeQuotaBeforeSend(message);
        if (!quotaCheck.allowed) {
          // Quota excedida: NÃO enviar, marcar como bloqueado
          await this.handleQuotaBlocked(message, quotaCheck.error);
          return;
        }
        // Quota OK: log e continua para envio
        this.logger.log(
          `[Quota] PERMITIDO: salonId=${message.salon_id}, appointmentId=${message.appointment_id}, remaining=${quotaCheck.remaining}`,
        );
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

      // Se falhou por configuração do salão, tenta Z-API direto como fallback
      if (!result?.success) {
        const errorLower = (result?.error || '').toLowerCase();
        const shouldFallback =
          errorLower.includes('não está habilitado') ||
          errorLower.includes('credenciais') ||
          errorLower.includes('não configurad') ||
          errorLower.includes('provedor não suportado');

        if (shouldFallback) {
          this.logger.debug(`Fallback para Z-API direto para ${message.recipient_phone} (erro: ${result?.error})`);
          result = await this.whatsappService.sendDirectMessage(
            message.recipient_phone,
            messageText,
          );
        }
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
   * NOTA: Consumo de quota agora ocorre ANTES do envio em checkAndConsumeQuotaBeforeSend
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
   * HARD-BLOCK: Verifica e consome quota ANTES de enviar mensagem
   * Retorna { allowed: true, remaining } se pode enviar
   * Retorna { allowed: false, error } se quota excedida
   */
  private async checkAndConsumeQuotaBeforeSend(
    message: any,
  ): Promise<{ allowed: true; remaining: number } | { allowed: false; error: string }> {
    try {
      const quotaResult = await this.addonsService.consumeWhatsAppQuota(
        message.salon_id,
        message.appointment_id,
        'APPOINTMENT_CONFIRMATION',
      );

      return {
        allowed: true,
        remaining: quotaResult.remaining.total,
      };
    } catch (error: any) {
      // Se for erro 402 (quota excedida), retorna bloqueio
      if (error.status === 402 || error.response?.code === 'QUOTA_EXCEEDED') {
        const errorPayload = error.response || error.getResponse?.() || {};
        return {
          allowed: false,
          error: `QUOTA_EXCEEDED: ${errorPayload.message || 'Quota de WhatsApp excedida'}`,
        };
      }

      // Outros erros: log e permite envio (degradação graciosa)
      this.logger.error(
        `[Quota] Erro ao verificar quota para appointment ${message.appointment_id}: ${error.message}`,
      );
      // Em caso de erro técnico, permite envio para não bloquear operação
      return { allowed: true, remaining: -1 };
    }
  }

  /**
   * ALFA.1: Trata mensagem bloqueada por quota excedida
   * Se ainda há tentativas: reagenda com backoff longo (30 min)
   * Se não há mais tentativas: marca como FAILED
   */
  private async handleQuotaBlocked(message: any, errorMessage: string): Promise<void> {
    // Usa max_attempts do registro se existir, senão fallback para constante
    const effectiveMaxAttempts = message.max_attempts ?? MAX_RETRY_ATTEMPTS;
    const currentAttempts = message.attempts ?? 0;

    // Log estruturado
    this.logger.warn(
      `[Quota] BLOQUEADO: salonId=${message.salon_id}, appointmentId=${message.appointment_id}, ` +
        `notificationId=${message.id}, attempts=${currentAttempts}/${effectiveMaxAttempts}, motivo=${errorMessage}`,
    );

    // Se ainda há tentativas restantes, reagenda com backoff longo
    if (currentAttempts < effectiveMaxAttempts - 1) {
      const nextScheduledFor = await this.scheduledMessagesService.scheduleQuotaRetry(
        message.id,
        currentAttempts,
        errorMessage,
      );

      this.logger.log(
        `[Quota] REAGENDADO: notificationId=${message.id}, salonId=${message.salon_id}, ` +
          `attempts=${currentAttempts + 1}/${effectiveMaxAttempts}, nextScheduledFor=${nextScheduledFor.toISOString()}`,
      );

      // Audit log de retry
      await this.auditService.logWhatsAppSent({
        salonId: message.salon_id,
        notificationId: message.id,
        appointmentId: message.appointment_id,
        recipientPhone: message.recipient_phone,
        notificationType: message.notification_type,
        success: false,
        error: `${errorMessage} (retry scheduled)`,
      });
      return;
    }

    // Sem tentativas restantes: marca como FAILED
    await this.scheduledMessagesService.updateMessageStatus(
      message.id,
      'FAILED',
      undefined,
      errorMessage,
    );

    // Audit log de falha final
    await this.auditService.logWhatsAppSent({
      salonId: message.salon_id,
      notificationId: message.id,
      appointmentId: message.appointment_id,
      recipientPhone: message.recipient_phone,
      notificationType: message.notification_type,
      success: false,
      error: `${errorMessage} (max attempts reached)`,
    });
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

        // Adiciona endereço se disponível
        if (vars.endereco) {
          confirmationText += `

📍 *Endereço:*
${vars.endereco}`;
        }

        // Adiciona links de navegação
        if (vars.localizacao) {
          confirmationText += `

🗺️ Google Maps:
${vars.localizacao}`;
        }

        if (vars.waze) {
          confirmationText += `

🚗 Waze:
${vars.waze}`;
        }

        // Link de triagem se necessário
        if (vars.triageLink) {
          confirmationText += `

📋 *IMPORTANTE - Pré-Avaliação Obrigatória:*
Para sua segurança, preencha o formulário antes do atendimento:
👉 ${vars.triageLink}

⚠️ _Sem a pré-avaliação, o procedimento pode ser recusado._`;
        }

        // Pedido de confirmação
        confirmationText += `

Por favor, confirme sua presença:
👉 Responda *SIM* para confirmar
👉 Responda *NÃO* para cancelar

Obrigado! 💜`;

        return confirmationText;
      }

      case 'APPOINTMENT_REMINDER_24H': {
        let reminder24Text = `Lembrete: *Amanhã* você tem horário!

📅 ${vars.data} às ${vars.horario}
✂️ ${vars.servico}
💇 ${vars.profissional}

Sua confirmação é indispensável.
Esse horário foi reservado exclusivamente para você e a equipe se organiza com antecedência para garantir o atendimento.
Se precisar cancelar ou reagendar, avise com no mínimo 24h de antecedência.
A falta de confirmação ou ausência sem aviso compromete a agenda e impede que outra cliente utilize esse horário.

Podemos contar com você?

👉 *SIM* — Confirmado!
👉 *NÃO* — Preciso reagendar

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

      // ========== PACKAGE NOTIFICATIONS ==========
      case 'PACKAGE_SESSION_COMPLETED':
        // Usa custom_message se disponível (gerada pelo PackageIntelligenceService)
        if (message.custom_message) {
          return message.custom_message;
        }
        // Fallback template
        return `Sessão concluída! ✅

📦 *${vars.pacote || 'Seu Pacote'}*
🔢 Você ainda tem *${vars.sessoes_restantes || '?'} sessões restantes*

Quer agendar a próxima? Responda *AGENDAR*! 😊`;

      case 'PACKAGE_PENDING_SESSIONS':
        // Usa custom_message se disponível
        if (message.custom_message) {
          return message.custom_message;
        }
        // Fallback template
        return `Oi ${vars.nome}! 👋

Lembrete do seu pacote *${vars.pacote || 'Pacote'}*:
📦 Você ainda tem *${vars.sessoes_pendentes || '?'} sessões* disponíveis!
⏰ Validade: ${vars.validade || 'consulte a recepção'}

Vamos agendar? Responda *AGENDAR* 😊`;

      case 'PACKAGE_EXPIRATION_WARNING':
        // Usa custom_message se disponível
        if (message.custom_message) {
          return message.custom_message;
        }
        // Fallback template
        return `Oi ${vars.nome}! ⚠️

Seu pacote *${vars.pacote || 'Pacote'}* expira em breve!
📆 Validade: ${vars.validade || 'em breve'}
📦 Sessões restantes: ${vars.sessoes_restantes || '?'}

Agende suas sessões para não perder! Responda *AGENDAR* 😊`;

      default:
        return message.custom_message || 'Mensagem do salão';
    }
  }
}
