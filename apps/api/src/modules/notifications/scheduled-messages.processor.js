"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledMessagesProcessor = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const is_jest_1 = require("../../common/is-jest");
// Constantes de configuração
const MAX_RETRY_ATTEMPTS = 3;
const BATCH_SIZE = 20;
let ScheduledMessagesProcessor = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _processScheduledMessages_decorators;
    var ScheduledMessagesProcessor = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _processScheduledMessages_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE, { disabled: is_jest_1.IS_JEST })];
            __esDecorate(this, null, _processScheduledMessages_decorators, { kind: "method", name: "processScheduledMessages", static: false, private: false, access: { has: obj => "processScheduledMessages" in obj, get: obj => obj.processScheduledMessages }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ScheduledMessagesProcessor = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        scheduledMessagesService = __runInitializers(this, _instanceExtraInitializers);
        whatsappService;
        auditService;
        addonsService;
        logger = new common_1.Logger(ScheduledMessagesProcessor.name);
        isProcessing = false;
        constructor(scheduledMessagesService, whatsappService, auditService, addonsService) {
            this.scheduledMessagesService = scheduledMessagesService;
            this.whatsappService = whatsappService;
            this.auditService = auditService;
            this.addonsService = addonsService;
            this.logger.log('ScheduledMessagesProcessor inicializado - processando appointment_notifications a cada 1 minuto');
        }
        /**
         * Processa mensagens pendentes a cada minuto
         * CONCORRÊNCIA SEGURA: Usa SKIP LOCKED para evitar processamento duplicado
         */
        async processScheduledMessages() {
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
                const results = await Promise.allSettled(messages.map((message) => this.processMessageWithFaultTolerance(message)));
                // Log de resultados
                const succeeded = results.filter((r) => r.status === 'fulfilled').length;
                const failed = results.filter((r) => r.status === 'rejected').length;
                this.logger.log(`[appointment_notifications] Processamento concluído: ${succeeded} sucesso, ${failed} falhas`);
            }
            catch (error) {
                this.logger.error('Erro no processamento de mensagens:', error);
            }
            finally {
                this.isProcessing = false;
            }
        }
        /**
         * Processa uma mensagem individual com tolerância a falhas
         * DEGRADAÇÃO GRACIOSA: Nunca propaga erro para não parar o loop
         * HARD-BLOCK: Verifica quota ANTES de enviar para APPOINTMENT_CONFIRMATION
         */
        async processMessageWithFaultTolerance(message) {
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
                    this.logger.log(`[Quota] PERMITIDO: salonId=${message.salon_id}, appointmentId=${message.appointment_id}, remaining=${quotaCheck.remaining}`);
                }
                // Monta a mensagem
                const messageText = this.buildMessageText(message);
                // Tenta enviar via configuração do salão primeiro, se falhar usa Z-API direto
                let result = await Promise.race([
                    this.whatsappService.sendMessage(message.salon_id, message.recipient_phone, messageText),
                    this.createTimeout(30000), // 30s timeout
                ]);
                // Se falhou por configuração do salão, tenta Z-API direto como fallback
                if (!result?.success) {
                    const errorLower = (result?.error || '').toLowerCase();
                    const shouldFallback = errorLower.includes('não está habilitado') ||
                        errorLower.includes('credenciais') ||
                        errorLower.includes('não configurad') ||
                        errorLower.includes('provedor não suportado');
                    if (shouldFallback) {
                        this.logger.debug(`Fallback para Z-API direto para ${message.recipient_phone} (erro: ${result?.error})`);
                        result = await this.whatsappService.sendDirectMessage(message.recipient_phone, messageText);
                    }
                }
                // Processa resultado
                if (result?.success) {
                    await this.handleSendSuccess(message, result);
                }
                else {
                    await this.handleSendFailure(message, result?.error || 'Resposta inválida do provider');
                }
            }
            catch (error) {
                // DEGRADAÇÃO GRACIOSA: Registra erro e agenda retry
                await this.handleSendFailure(message, error.message || 'Erro desconhecido');
            }
        }
        /**
         * Trata sucesso no envio
         * NOTA: Consumo de quota agora ocorre ANTES do envio em checkAndConsumeQuotaBeforeSend
         */
        async handleSendSuccess(message, result) {
            await this.scheduledMessagesService.updateMessageStatus(message.id, 'SENT', result.messageId);
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
        async handleSendFailure(message, errorMessage) {
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
                await this.scheduledMessagesService.scheduleRetry(message.id, message.attempts, errorMessage);
            }
            else {
                // Última tentativa falhou
                await this.scheduledMessagesService.updateMessageStatus(message.id, 'FAILED', undefined, errorMessage);
            }
        }
        /**
         * Trata quando atingiu máximo de tentativas
         */
        async handleMaxAttemptsReached(message) {
            await this.scheduledMessagesService.updateMessageStatus(message.id, 'FAILED', undefined, 'Máximo de tentativas excedido');
            this.logger.warn(`Mensagem ${message.id} falhou após ${MAX_RETRY_ATTEMPTS} tentativas`);
        }
        /**
         * HARD-BLOCK: Verifica e consome quota ANTES de enviar mensagem
         * Retorna { allowed: true, remaining } se pode enviar
         * Retorna { allowed: false, error } se quota excedida
         */
        async checkAndConsumeQuotaBeforeSend(message) {
            try {
                const quotaResult = await this.addonsService.consumeWhatsAppQuota(message.salon_id, message.appointment_id, 'APPOINTMENT_CONFIRMATION');
                return {
                    allowed: true,
                    remaining: quotaResult.remaining.total,
                };
            }
            catch (error) {
                // Se for erro 402 (quota excedida), retorna bloqueio
                if (error.status === 402 || error.response?.code === 'QUOTA_EXCEEDED') {
                    const errorPayload = error.response || error.getResponse?.() || {};
                    return {
                        allowed: false,
                        error: `QUOTA_EXCEEDED: ${errorPayload.message || 'Quota de WhatsApp excedida'}`,
                    };
                }
                // Outros erros: log e permite envio (degradação graciosa)
                this.logger.error(`[Quota] Erro ao verificar quota para appointment ${message.appointment_id}: ${error.message}`);
                // Em caso de erro técnico, permite envio para não bloquear operação
                return { allowed: true, remaining: -1 };
            }
        }
        /**
         * ALFA.1: Trata mensagem bloqueada por quota excedida
         * Se ainda há tentativas: reagenda com backoff longo (30 min)
         * Se não há mais tentativas: marca como FAILED
         */
        async handleQuotaBlocked(message, errorMessage) {
            // Usa max_attempts do registro se existir, senão fallback para constante
            const effectiveMaxAttempts = message.max_attempts ?? MAX_RETRY_ATTEMPTS;
            const currentAttempts = message.attempts ?? 0;
            // Log estruturado
            this.logger.warn(`[Quota] BLOQUEADO: salonId=${message.salon_id}, appointmentId=${message.appointment_id}, ` +
                `notificationId=${message.id}, attempts=${currentAttempts}/${effectiveMaxAttempts}, motivo=${errorMessage}`);
            // Se ainda há tentativas restantes, reagenda com backoff longo
            if (currentAttempts < effectiveMaxAttempts - 1) {
                const nextScheduledFor = await this.scheduledMessagesService.scheduleQuotaRetry(message.id, currentAttempts, errorMessage);
                this.logger.log(`[Quota] REAGENDADO: notificationId=${message.id}, salonId=${message.salon_id}, ` +
                    `attempts=${currentAttempts + 1}/${effectiveMaxAttempts}, nextScheduledFor=${nextScheduledFor.toISOString()}`);
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
            await this.scheduledMessagesService.updateMessageStatus(message.id, 'FAILED', undefined, errorMessage);
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
        createTimeout(ms) {
            return new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout após ${ms}ms`)), ms));
        }
        /**
         * Mascara telefone para logs
         */
        maskPhone(phone) {
            if (!phone || phone.length < 8)
                return '***';
            return `${phone.substring(0, 4)}****${phone.substring(phone.length - 2)}`;
        }
        /**
         * Monta texto da mensagem baseado no template
         */
        buildMessageText(message) {
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
                    }
                    else {
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
    };
    return ScheduledMessagesProcessor = _classThis;
})();
exports.ScheduledMessagesProcessor = ScheduledMessagesProcessor;
//# sourceMappingURL=scheduled-messages.processor.js.map