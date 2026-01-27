import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../database/connection';
import {
  aiSettings,
  aiConversations,
  aiMessages,
  aiInteractionLogs,
  aiBlockedTermsLog,
  aiBriefings,
  appointments,
  appointmentNotifications,
} from '../../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { GeminiService } from './gemini.service';
import { ConversationTurn, CONVERSATION_HISTORY_LIMIT } from './gemini.service';
import { ContentFilterService } from './content-filter.service';
import { IntentClassifierService } from './intent-classifier.service';
import { AlexisSchedulerService } from './scheduler.service';
import { DataCollectorService } from './data-collector.service';
import { AlexisCatalogService } from './alexis-catalog.service';
import { ProductInfoService } from './product-info.service';
import { ResponseComposerService } from './response-composer.service';
import { COMMAND_RESPONSES } from './constants/forbidden-terms';
import { isSchedulePrompt, fuzzyMatchService } from './schedule-continuation';
import { ConversationStateStore } from './conversation-state.store';
import {
  ConversationState,
  DEBOUNCE_MS,
  mergeBufferTexts,
  nowIso,
} from './conversation-state';
import {
  handleSchedulingTurn,
  startScheduling,
  SkillContext,
} from './scheduling-skill';

/**
 * =====================================================
 * ALEXIS SERVICE - PRINCIPAL
 * IA Assistente para WhatsApp & Dashboard
 * =====================================================
 */

export interface ProcessMessageResult {
  response: string | null;
  intent: string;
  blocked: boolean;
  shouldSend: boolean;
  statusChanged: boolean;
  newStatus?: string;
}

@Injectable()
export class AlexisService {
  private readonly logger = new Logger(AlexisService.name);

  /** Debounce in-memory: agrupa mensagens rápidas por conversa */
  private debounceMap = new Map<
    string,
    { buffer: string[]; timer: NodeJS.Timeout; resolveOwner: () => void }
  >();

  constructor(
    private readonly gemini: GeminiService,
    private readonly contentFilter: ContentFilterService,
    private readonly intentClassifier: IntentClassifierService,
    private readonly scheduler: AlexisSchedulerService,
    private readonly dataCollector: DataCollectorService,
    private readonly catalog: AlexisCatalogService,
    private readonly productInfo: ProductInfoService,
    private readonly composer: ResponseComposerService,
    private readonly stateStore: ConversationStateStore,
  ) {}

  /**
   * =====================================================
   * PROCESSAMENTO DE MENSAGEM WHATSAPP
   * Entrada principal para mensagens
   * =====================================================
   */
  async processWhatsAppMessage(
    salonId: string,
    clientPhone: string,
    message: string,
    clientName?: string,
    senderId?: string,
    senderType: 'client' | 'agent' = 'client',
  ): Promise<ProcessMessageResult> {
    const startTime = Date.now();

    // Busca ou cria conversa
    const conversation = await this.getOrCreateConversation(salonId, clientPhone, clientName);

    // ========== VERIFICA SE É COMANDO DO ATENDENTE ==========
    if (senderType === 'agent') {
      const commandCheck = this.contentFilter.isCommand(message);

      if (commandCheck.isCommand) {
        if (commandCheck.command === 'HUMAN_TAKEOVER') {
          // #eu - Atendente assume (NÃO envia o comando ao cliente)
          await this.handleHumanTakeover(conversation.id, senderId || '');

          // Salva comando como system (isCommand=true)
          await this.saveMessage(conversation.id, 'system', message, 'HUMAN_TAKEOVER', false, true);

          // Busca mensagem personalizada
          const settings = await this.getSettings(salonId);
          const takeoverMessage = settings?.humanTakeoverMessage || COMMAND_RESPONSES.HUMAN_TAKEOVER;

          return {
            response: takeoverMessage,
            intent: 'HUMAN_TAKEOVER',
            blocked: false,
            shouldSend: true, // Envia a RESPOSTA ao cliente, não o comando
            statusChanged: true,
            newStatus: 'HUMAN_ACTIVE',
          };
        }

        if (commandCheck.command === 'AI_RESUME') {
          // #ia - Alexis volta (NÃO envia o comando ao cliente)
          await this.handleAIResume(conversation.id);

          // Salva comando como system (isCommand=true)
          await this.saveMessage(conversation.id, 'system', message, 'AI_RESUME', false, true);

          // Busca mensagem personalizada
          const settings = await this.getSettings(salonId);
          const resumeMessage = settings?.aiResumeMessage || COMMAND_RESPONSES.AI_RESUME;

          return {
            response: resumeMessage,
            intent: 'AI_RESUME',
            blocked: false,
            shouldSend: true, // Envia a RESPOSTA ao cliente, não o comando
            statusChanged: true,
            newStatus: 'AI_ACTIVE',
          };
        }
      }

      // Mensagem normal do atendente (não é comando)
      await this.saveMessage(conversation.id, 'human', message, 'HUMAN_MESSAGE', false, false);

      return {
        response: null,
        intent: 'HUMAN_MESSAGE',
        blocked: false,
        shouldSend: false, // Atendente já enviou direto pelo WhatsApp
        statusChanged: false,
      };
    }

    // ========== MENSAGEM DO CLIENTE ==========

    // Se humano está ativo, não responde (atendente vai responder)
    if (conversation.status === 'HUMAN_ACTIVE') {
      await this.saveMessage(conversation.id, 'client', message, 'GENERAL', false, false);

      return {
        response: null,
        intent: 'HUMAN_ACTIVE',
        blocked: false,
        shouldSend: false,
        statusChanged: false,
      };
    }

    // ========== DEBOUNCE: anti-atropelo (2.5s) ==========
    const debounceResult = await this.handleDebounce(conversation.id, message);
    if (debounceResult.deferred) {
      return {
        response: null,
        intent: 'DEBOUNCED',
        blocked: false,
        shouldSend: false,
        statusChanged: false,
      };
    }
    const mergedText = debounceResult.mergedText!;

    // Carrega FSM state
    const state = await this.stateStore.getState(conversation.id);

    // ========== FSM: STEP > INTENT (agendamento em andamento) ==========
    if (state.activeSkill === 'SCHEDULING' && state.step !== 'NONE') {
      return this.handleFSMTurn(
        conversation.id, salonId, clientPhone, clientName, mergedText, state, startTime,
      );
    }

    // ========== CHARLIE: DETECÇÃO DETERMINÍSTICA DE PRODUTO ==========
    const productInfoResponse = await this.productInfo.tryAnswerProductInfo(salonId, mergedText);
    if (productInfoResponse) {
      this.logger.log(`ProductInfo respondeu deterministicamente para: "${mergedText}"`);

      await this.saveMessage(conversation.id, 'client', mergedText, 'PRODUCT_INFO', false, false);
      await this.saveMessage(conversation.id, 'ai', productInfoResponse, 'PRODUCT_INFO', false, false);

      await this.logInteraction(
        salonId, conversation.id, clientPhone,
        mergedText, productInfoResponse, 'PRODUCT_INFO',
        false, undefined, Date.now() - startTime,
      );

      return {
        response: productInfoResponse,
        intent: 'PRODUCT_INFO',
        blocked: false,
        shouldSend: true,
        statusChanged: false,
      };
    }

    // ========== CONTINUAÇÃO TRANSACIONAL: SCHEDULE (fallback se FSM state perdido) ==========
    const scheduleContinuation = await this.checkScheduleContinuation(
      conversation.id, salonId, clientPhone, mergedText, startTime,
    );
    if (scheduleContinuation) return scheduleContinuation;

    // Classifica intenção
    const intent = this.intentClassifier.classify(mergedText);

    // ========== SCHEDULE via FSM (novo fluxo) ==========
    if (intent === 'SCHEDULE') {
      return this.handleFSMStart(
        conversation.id, salonId, clientPhone, clientName, mergedText, state, startTime,
      );
    }

    // ========== CONFIRMAÇÃO/RECUSA DE AGENDAMENTO ==========
    if (intent === 'APPOINTMENT_CONFIRM' || intent === 'APPOINTMENT_DECLINE') {
      const confirmResult = await this.handleAppointmentConfirmation(
        salonId, clientPhone, intent === 'APPOINTMENT_CONFIRM',
      );

      if (confirmResult.handled) {
        await this.saveMessage(conversation.id, 'client', mergedText, intent, false, false);
        await this.saveMessage(conversation.id, 'ai', confirmResult.response, intent, false, false);

        await this.logInteraction(
          salonId, conversation.id, clientPhone,
          mergedText, confirmResult.response, intent,
          false, undefined, Date.now() - startTime,
        );

        return {
          response: confirmResult.response,
          intent,
          blocked: false,
          shouldSend: true,
          statusChanged: false,
        };
      }
    }

    // ========== CAMADA 1: FILTRO DE ENTRADA ==========
    const inputFilter = this.contentFilter.filterInput(mergedText);

    if (!inputFilter.allowed) {
      await db.insert(aiBlockedTermsLog).values({
        salonId,
        conversationId: conversation.id,
        originalMessage: mergedText,
        blockedTerms: inputFilter.blockedTerms,
        layer: 'INPUT',
      });

      const blockedResponse = this.contentFilter.getBlockedResponse();

      await this.saveMessage(conversation.id, 'client', mergedText, intent, true, false, 'INPUT_BLOCKED');
      await this.saveMessage(conversation.id, 'ai', blockedResponse, intent, false, false);

      await this.logInteraction(
        salonId, conversation.id, clientPhone,
        mergedText, blockedResponse, intent,
        true, 'INPUT', Date.now() - startTime,
      );

      return {
        response: blockedResponse,
        intent,
        blocked: true,
        shouldSend: true,
        statusChanged: false,
      };
    }

    // ========== CAMADA 2: GERAÇÃO COM IA ==========
    const context = await this.dataCollector.collectContext(salonId, clientPhone);
    const history = await this.getRecentHistory(conversation.id, CONVERSATION_HISTORY_LIMIT);
    let aiResponse: string;

    try {
      if (intent === 'PRODUCT_INFO' || intent === 'PRICE_INFO') {
        aiResponse = await this.handleProductIntent(salonId, mergedText);
      } else {
        aiResponse = await this.gemini.generateResponse(
          context.salon?.name || 'Salão', mergedText, context, history,
        );
      }
    } catch (error: any) {
      this.logger.error('Erro na geração de resposta:', error?.message || error);
      aiResponse = 'Desculpe, estou com uma instabilidade no momento. Por favor, tente novamente! 😊';
    }

    // ========== CAMADA 3: FILTRO DE SAÍDA ==========
    const outputFilter = this.contentFilter.filterOutput(aiResponse);

    if (!outputFilter.safe && outputFilter.blockedTerms.length > 0) {
      await db.insert(aiBlockedTermsLog).values({
        salonId,
        conversationId: conversation.id,
        originalMessage: aiResponse,
        blockedTerms: outputFilter.blockedTerms,
        layer: 'OUTPUT',
      });
    }

    const filteredResponse = outputFilter.filtered;

    // DELTA: Compoe resposta humanizada — anti-greeting se já saudou
    const finalResponse = await this.composer.compose({
      salonId,
      phone: clientPhone,
      clientName,
      intent,
      baseText: filteredResponse,
      skipGreeting: state.userAlreadyGreeted,
    });

    // Atualiza greeting state
    if (!state.userAlreadyGreeted) {
      await this.stateStore.updateState(conversation.id, {
        userAlreadyGreeted: true,
        lastGreetingAt: nowIso(),
      });
    }

    // ========== ANTI-DUPLICAÇÃO ATÔMICA: ReplyDedupGate via state_json ==========
    const canSend = await this.stateStore.tryRegisterReply(conversation.id, finalResponse);
    if (!canSend) {
      this.logger.debug(`DedupGate: resposta idêntica suprimida para ${clientPhone}`);
      await this.saveMessage(conversation.id, 'client', mergedText, intent, false, false);
      return {
        response: null,
        intent,
        blocked: false,
        shouldSend: false,
        statusChanged: false,
      };
    }

    // Salva mensagens
    await this.saveMessage(conversation.id, 'client', mergedText, intent, false, false);
    await this.saveMessage(
      conversation.id, 'ai', finalResponse, intent,
      !outputFilter.safe, false,
      !outputFilter.safe ? 'OUTPUT_BLOCKED' : undefined,
    );

    await this.logInteraction(
      salonId, conversation.id, clientPhone,
      mergedText, finalResponse, intent,
      !inputFilter.allowed || !outputFilter.safe,
      !outputFilter.safe ? 'OUTPUT' : undefined,
      Date.now() - startTime,
    );

    return {
      response: finalResponse,
      intent,
      blocked: !outputFilter.safe,
      shouldSend: true,
      statusChanged: false,
    };
  }

  /**
   * =====================================================
   * HANDLERS DE COMANDOS
   * =====================================================
   */

  private async handleHumanTakeover(conversationId: string, agentId: string): Promise<void> {
    await db
      .update(aiConversations)
      .set({
        status: 'HUMAN_ACTIVE',
        humanAgentId: agentId || null,
        humanTakeoverAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(aiConversations.id, conversationId));

    this.logger.log(`Conversa ${conversationId} assumida por humano`);
  }

  private async handleAIResume(conversationId: string): Promise<void> {
    await db
      .update(aiConversations)
      .set({
        status: 'AI_ACTIVE',
        humanAgentId: null,
        aiResumedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(aiConversations.id, conversationId));

    this.logger.log(`Conversa ${conversationId} retomada pela IA`);
  }

  /**
   * =====================================================
   * DEBOUNCE — anti-atropelo (in-memory por conversa)
   * Se lock ativo: append no buffer e retorna DEFER
   * Se lock livre: OWNER, espera debounceMs, consolida
   * =====================================================
   */
  handleDebounce(
    conversationId: string,
    text: string,
  ): Promise<{ deferred: boolean; mergedText?: string }> {
    return new Promise((resolve) => {
      const existing = this.debounceMap.get(conversationId);

      if (existing) {
        // Já tem owner — append e defer
        existing.buffer.push(text);
        clearTimeout(existing.timer);
        existing.timer = setTimeout(() => existing.resolveOwner(), DEBOUNCE_MS);
        resolve({ deferred: true });
        return;
      }

      // Novo owner
      const entry: {
        buffer: string[];
        timer: NodeJS.Timeout;
        resolveOwner: () => void;
      } = {
        buffer: [text],
        timer: null as any,
        resolveOwner: null as any,
      };

      const ownerReady = new Promise<void>((resolveOwner) => {
        entry.resolveOwner = resolveOwner;
      });

      entry.timer = setTimeout(() => entry.resolveOwner(), DEBOUNCE_MS);
      this.debounceMap.set(conversationId, entry);

      ownerReady.then(() => {
        const final = this.debounceMap.get(conversationId);
        const merged = mergeBufferTexts(final?.buffer || [text]);
        this.debounceMap.delete(conversationId);
        resolve({ deferred: false, mergedText: merged });
      });
    });
  }

  /**
   * =====================================================
   * FSM TURN — Processa turno dentro de skill ativa
   * =====================================================
   */
  private async handleFSMTurn(
    conversationId: string,
    salonId: string,
    clientPhone: string,
    _clientName: string | undefined,
    text: string,
    state: ConversationState,
    startTime: number,
  ): Promise<ProcessMessageResult> {
    const context = await this.dataCollector.collectContext(salonId, clientPhone);
    const skillCtx: SkillContext = { services: (context.services || []) as any };

    const result = handleSchedulingTurn(state, text, skillCtx);

    // Compoe resposta — sempre skipGreeting em FSM (conversa em andamento)
    const finalResponse = result.replyText;

    // ========== DEDUP GATE (FSM path — principal fonte de race condition) ==========
    const canSend = await this.stateStore.tryRegisterReply(conversationId, finalResponse);
    if (!canSend) {
      this.logger.debug(`DedupGate FSM: resposta idêntica suprimida para ${clientPhone}`);
      await this.saveMessage(conversationId, 'client', text, 'SCHEDULE', false, false);
      return {
        response: null,
        intent: 'SCHEDULE',
        blocked: false,
        shouldSend: false,
        statusChanged: false,
      };
    }

    // Persiste state
    await this.stateStore.updateState(conversationId, {
      ...result.nextState,
      userAlreadyGreeted: true,
    });

    await this.saveMessage(conversationId, 'client', text, 'SCHEDULE', false, false);
    await this.saveMessage(conversationId, 'ai', finalResponse, 'SCHEDULE', false, false);

    await this.logInteraction(
      salonId, conversationId, clientPhone,
      text, finalResponse, 'SCHEDULE',
      false, undefined, Date.now() - startTime,
    );

    return {
      response: finalResponse,
      intent: 'SCHEDULE',
      blocked: false,
      shouldSend: true,
      statusChanged: false,
    };
  }

  /**
   * =====================================================
   * FSM START — Inicia scheduling skill
   * =====================================================
   */
  private async handleFSMStart(
    conversationId: string,
    salonId: string,
    clientPhone: string,
    _clientName: string | undefined,
    text: string,
    state: ConversationState,
    startTime: number,
  ): Promise<ProcessMessageResult> {
    const context = await this.dataCollector.collectContext(salonId, clientPhone);
    const services = context.services || [];

    // Se o texto já contém um serviço, pular AWAITING_SERVICE e ir direto
    const skillCtx: SkillContext = { services: services as any };
    const result = startScheduling();

    // Tenta já resolver serviço na mesma mensagem (ex.: "quero agendar alisamento")
    const matched = fuzzyMatchService(text, services) as any;
    if (matched) {
      const turnResult = handleSchedulingTurn(
        { ...state, ...result.nextState } as ConversationState,
        text,
        skillCtx,
      );

      await this.stateStore.updateState(conversationId, {
        ...turnResult.nextState,
        userAlreadyGreeted: true,
      });

      await this.saveMessage(conversationId, 'client', text, 'SCHEDULE', false, false);
      await this.saveMessage(conversationId, 'ai', turnResult.replyText, 'SCHEDULE', false, false);

      await this.logInteraction(
        salonId, conversationId, clientPhone,
        text, turnResult.replyText, 'SCHEDULE',
        false, undefined, Date.now() - startTime,
      );

      return {
        response: turnResult.replyText,
        intent: 'SCHEDULE',
        blocked: false,
        shouldSend: true,
        statusChanged: false,
      };
    }

    // Sem serviço na mensagem — pergunta
    await this.stateStore.updateState(conversationId, {
      ...result.nextState,
      userAlreadyGreeted: true,
    });

    // Lista serviços na primeira pergunta
    const serviceList = services
      .slice(0, 8)
      .map((s: any) => `• ${s.name} - R$ ${s.price}`)
      .join('\n');

    const replyText = serviceList
      ? `Claro, vou te ajudar a agendar! 😊\n\nQual serviço você gostaria?\n\n${serviceList}\n\nÉ só me dizer o serviço e sua preferência de dia/horário!`
      : result.replyText;

    await this.saveMessage(conversationId, 'client', text, 'SCHEDULE', false, false);
    await this.saveMessage(conversationId, 'ai', replyText, 'SCHEDULE', false, false);

    await this.logInteraction(
      salonId, conversationId, clientPhone,
      text, replyText, 'SCHEDULE',
      false, undefined, Date.now() - startTime,
    );

    return {
      response: replyText,
      intent: 'SCHEDULE',
      blocked: false,
      shouldSend: true,
      statusChanged: false,
    };
  }

  /**
   * =====================================================
   * CONTINUAÇÃO TRANSACIONAL DE AGENDAMENTO
   * Se a última mensagem do assistant foi um prompt de serviço,
   * interpreta a resposta do usuário como seleção de serviço.
   * =====================================================
   */
  private async checkScheduleContinuation(
    conversationId: string,
    salonId: string,
    clientPhone: string,
    message: string,
    startTime: number,
  ): Promise<ProcessMessageResult | null> {
    try {
      // Busca última mensagem do assistant
      const [lastAi] = await db
        .select({ content: aiMessages.content })
        .from(aiMessages)
        .where(
          and(
            eq(aiMessages.conversationId, conversationId),
            eq(aiMessages.role, 'ai'),
          ),
        )
        .orderBy(desc(aiMessages.createdAt))
        .limit(1);

      if (!lastAi || !isSchedulePrompt(lastAi.content)) return null;

      this.logger.log(`Schedule continuation detectado para: "${message}"`);

      // Carrega serviços
      const context = await this.dataCollector.collectContext(salonId, clientPhone);
      const services = context.services || [];
      if (services.length === 0) return null;

      const matched = fuzzyMatchService(message, services);

      if (matched) {
        // Serviço encontrado — prossegue com agendamento (busca horários)
        const aiResponse = await this.handleSchedulingIntent(salonId, clientPhone, message, context);

        await this.saveMessage(conversationId, 'client', message, 'SCHEDULE', false, false);
        await this.saveMessage(conversationId, 'ai', aiResponse, 'SCHEDULE', false, false);

        await this.logInteraction(
          salonId, conversationId, clientPhone,
          message, aiResponse, 'SCHEDULE',
          false, undefined, Date.now() - startTime,
        );

        return {
          response: aiResponse,
          intent: 'SCHEDULE',
          blocked: false,
          shouldSend: true,
          statusChanged: false,
        };
      }

      // Não conseguiu mapear — pede esclarecimento sem re-listar tudo
      const clarification = 'Não encontrei esse serviço. Pode repetir o nome? Por exemplo: corte, mechas, alisamento… 😊';

      await this.saveMessage(conversationId, 'client', message, 'SCHEDULE', false, false);
      await this.saveMessage(conversationId, 'ai', clarification, 'SCHEDULE', false, false);

      await this.logInteraction(
        salonId, conversationId, clientPhone,
        message, clarification, 'SCHEDULE',
        false, undefined, Date.now() - startTime,
      );

      return {
        response: clarification,
        intent: 'SCHEDULE',
        blocked: false,
        shouldSend: true,
        statusChanged: false,
      };
    } catch (error: any) {
      this.logger.warn('Erro no schedule continuation guard:', error?.message);
      return null; // Fallback para fluxo normal
    }
  }

  /**
   * =====================================================
   * AGENDAMENTO VIA WHATSAPP
   * =====================================================
   */

  private async handleSchedulingIntent(
    salonId: string,
    _clientPhone: string,
    message: string,
    context: any,
  ): Promise<string> {
    const services = context.services || [];

    if (services.length === 0) {
      return 'No momento não consigo verificar os serviços disponíveis. Por favor, entre em contato com o salão diretamente! 😊';
    }

    // Verifica se o cliente mencionou algum serviço (fuzzy match com normalização)
    const mentionedService = fuzzyMatchService(message, services) as any;

    if (!mentionedService) {
      const serviceList = services
        .slice(0, 8)
        .map((s: any) => `• ${s.name} - R$ ${s.price}`)
        .join('\n');

      return `Claro, vou te ajudar a agendar! 😊\n\nQual serviço você gostaria?\n\n${serviceList}\n\nÉ só me dizer o serviço e sua preferência de dia/horário!`;
    }

    // Busca horários disponíveis para amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const slots = await this.scheduler.getAvailableSlots(salonId, mentionedService.id, tomorrow);

    if (slots.length === 0) {
      return `Poxa, não temos horários disponíveis amanhã para ${mentionedService.name}. 😔\n\nQuer que eu verifique outra data?`;
    }

    const slotList = this.scheduler.formatAvailableSlots(slots, 6);

    return `Ótimo! Para ${mentionedService.name}, temos esses horários amanhã:\n\n${slotList}\n\nQual fica melhor pra você? 😊`;
  }

  /**
   * =====================================================
   * PRODUTOS VIA WHATSAPP (ALFA.2)
   * =====================================================
   */

  private async handleProductIntent(salonId: string, message: string): Promise<string> {
    // CAN_RESERVE_PRODUCTS seria uma flag de configuração do salão
    // Por ora, assumimos false (não pode reservar automaticamente)
    const canReserve = false;

    try {
      return await this.catalog.handleProductIntent(salonId, message, canReserve);
    } catch (error: any) {
      this.logger.error('Erro ao buscar produto:', error?.message || error);
      return 'Desculpe, não consegui verificar os produtos no momento. Quer que eu chame a recepção pra te ajudar? 😊';
    }
  }

  /**
   * =====================================================
   * CONFIRMAÇÃO DE AGENDAMENTO VIA WHATSAPP
   * =====================================================
   */

  private async handleAppointmentConfirmation(
    salonId: string,
    clientPhone: string,
    isConfirm: boolean,
  ): Promise<{ handled: boolean; response: string }> {
    // Formata variações do telefone para busca
    const phoneClean = clientPhone.replace(/\D/g, '');
    const phoneVariants = [phoneClean, phoneClean.replace(/^55/, ''), `55${phoneClean.replace(/^55/, '')}`];

    // Busca agendamento pendente de confirmação para este telefone
    const pendingAppointments = await db
      .select()
      .from(appointments)
      .where(and(eq(appointments.salonId, salonId), eq(appointments.status, 'PENDING_CONFIRMATION')))
      .orderBy(desc(appointments.createdAt))
      .limit(20);

    // Encontra agendamento que corresponde ao telefone
    const appointment = pendingAppointments.find((apt) => {
      const aptPhone = apt.clientPhone?.replace(/\D/g, '') || '';
      return phoneVariants.some((p) => aptPhone.includes(p) || p.includes(aptPhone) || aptPhone === p || p === aptPhone);
    });

    if (!appointment) {
      // Não encontrou agendamento pendente - não manipula
      return { handled: false, response: '' };
    }

    if (isConfirm) {
      // ========== CONFIRMA AGENDAMENTO ==========
      await db
        .update(appointments)
        .set({
          status: 'CONFIRMED',
          confirmationStatus: 'CONFIRMED',
          confirmedAt: new Date(),
          confirmedVia: 'WHATSAPP',
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, appointment.id));

      // Registra resposta na notificação
      await db
        .update(appointmentNotifications)
        .set({
          clientResponse: 'CONFIRMED',
          clientRespondedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(appointmentNotifications.appointmentId, appointment.id),
            eq(appointmentNotifications.notificationType, 'APPOINTMENT_CONFIRMATION'),
          ),
        );

      this.logger.log(`Agendamento ${appointment.id} CONFIRMADO via WhatsApp por ${clientPhone}`);

      const dateFormatted = new Date(appointment.date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });

      return {
        handled: true,
        response: `Ótimo! Seu agendamento está *confirmado*! ✅

📅 ${dateFormatted}
🕐 ${appointment.time}
✂️ ${appointment.service}

Aguardamos você! 💜`,
      };
    }

    // ========== CANCELA AGENDAMENTO ==========
    await db
      .update(appointments)
      .set({
        status: 'CANCELLED',
        cancellationReason: 'Cancelado pelo cliente via WhatsApp',
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointment.id));

    // Registra resposta na notificação
    await db
      .update(appointmentNotifications)
      .set({
        clientResponse: 'CANCELLED',
        clientRespondedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(appointmentNotifications.appointmentId, appointment.id),
          eq(appointmentNotifications.notificationType, 'APPOINTMENT_CONFIRMATION'),
        ),
      );

    // Cancela lembretes futuros
    await db
      .update(appointmentNotifications)
      .set({
        status: 'CANCELLED',
        updatedAt: new Date(),
      })
      .where(
        and(eq(appointmentNotifications.appointmentId, appointment.id), eq(appointmentNotifications.status, 'SCHEDULED')),
      );

    this.logger.log(`Agendamento ${appointment.id} CANCELADO via WhatsApp por ${clientPhone}`);

    return {
      handled: true,
      response: `Agendamento *cancelado* com sucesso. 😔

Quando quiser, agende novamente! Estamos à disposição. 💜`,
    };
  }

  /**
   * =====================================================
   * GESTÃO DE CONVERSAS
   * =====================================================
   */

  /**
   * Carrega os últimos N turnos da conversa (client + ai) em ordem cronológica.
   * Reutiliza padrão Belle (ai-assistant.service.ts) adaptado para aiMessages.
   */
  private async getRecentHistory(
    conversationId: string,
    limit: number,
  ): Promise<ConversationTurn[]> {
    try {
      const rows = await db
        .select({ role: aiMessages.role, content: aiMessages.content })
        .from(aiMessages)
        .where(
          and(
            eq(aiMessages.conversationId, conversationId),
            sql`${aiMessages.role} IN ('client', 'ai')`,
            sql`${aiMessages.isCommand} = false`,
          ),
        )
        .orderBy(desc(aiMessages.createdAt))
        .limit(limit);

      // Reverse para ordem cronológica (oldest first)
      return rows.reverse().map((r) => ({
        role: r.role as 'client' | 'ai',
        content: r.content,
      }));
    } catch (error: any) {
      this.logger.warn('Falha ao carregar histórico de conversa:', error?.message);
      return [];
    }
  }

  private async getOrCreateConversation(salonId: string, clientPhone: string, clientName?: string) {
    // Busca conversa ativa
    const [existing] = await db
      .select()
      .from(aiConversations)
      .where(
        and(
          eq(aiConversations.salonId, salonId),
          eq(aiConversations.clientPhone, clientPhone),
          sql`${aiConversations.status} != 'CLOSED'`,
        ),
      )
      .orderBy(desc(aiConversations.createdAt))
      .limit(1);

    if (existing) return existing;

    // Cria nova conversa
    const [newConversation] = await db
      .insert(aiConversations)
      .values({
        salonId,
        clientPhone,
        clientName,
        status: 'AI_ACTIVE',
        lastMessageAt: new Date(),
      })
      .returning();

    return newConversation;
  }

  private async saveMessage(
    conversationId: string,
    role: string,
    content: string,
    intent: string,
    wasBlocked: boolean,
    isCommand: boolean,
    blockReason?: string,
  ): Promise<void> {
    await db.insert(aiMessages).values({
      conversationId,
      role,
      content,
      intent,
      wasBlocked,
      isCommand,
      blockReason,
    });

    await db
      .update(aiConversations)
      .set({
        lastMessageAt: new Date(),
        messagesCount: sql`${aiConversations.messagesCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(aiConversations.id, conversationId));
  }

  private async logInteraction(
    salonId: string,
    conversationId: string,
    clientPhone: string,
    messageIn: string,
    messageOut: string,
    intent: string,
    wasBlocked: boolean,
    blockReason: string | undefined,
    responseTimeMs: number,
  ): Promise<void> {
    await db.insert(aiInteractionLogs).values({
      salonId,
      conversationId,
      clientPhone,
      messageIn,
      messageOut,
      intent,
      wasBlocked,
      blockReason,
      responseTimeMs,
    });
  }

  /**
   * =====================================================
   * CONFIGURAÇÕES
   * =====================================================
   */

  async getSettings(salonId: string) {
    const [settings] = await db.select().from(aiSettings).where(eq(aiSettings.salonId, salonId)).limit(1);

    if (!settings) {
      // Cria configurações padrão
      const [newSettings] = await db.insert(aiSettings).values({ salonId }).returning();
      return newSettings;
    }

    return settings;
  }

  async updateSettings(salonId: string, updates: Partial<typeof aiSettings.$inferInsert>) {
    const [existing] = await db.select().from(aiSettings).where(eq(aiSettings.salonId, salonId)).limit(1);

    if (!existing) {
      return db.insert(aiSettings).values({ salonId, ...updates }).returning();
    }

    return db
      .update(aiSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(aiSettings.salonId, salonId))
      .returning();
  }

  /**
   * =====================================================
   * LISTAGEM DE CONVERSAS E MENSAGENS
   * =====================================================
   */

  async getConversations(salonId: string, status?: string) {
    const whereCondition = status
      ? and(eq(aiConversations.salonId, salonId), eq(aiConversations.status, status))
      : eq(aiConversations.salonId, salonId);

    return db.select().from(aiConversations).where(whereCondition).orderBy(desc(aiConversations.lastMessageAt)).limit(50);
  }

  async getMessages(conversationId: string) {
    return db.select().from(aiMessages).where(eq(aiMessages.conversationId, conversationId)).orderBy(aiMessages.createdAt);
  }

  /**
   * =====================================================
   * BRIEFING DO DASHBOARD
   * =====================================================
   */

  async generateBriefing(salonId: string, userId: string, userRole: string, userName: string): Promise<string> {
    const data = await this.dataCollector.collectDashboardData(salonId, userId, userRole);
    const briefing = await this.gemini.generateBriefing(userName, userRole, data);

    // Salva o briefing
    await db.insert(aiBriefings).values({
      salonId,
      userId,
      userRole,
      content: briefing,
      data,
    });

    return briefing;
  }

  /**
   * =====================================================
   * LOGS E AUDITORIA
   * =====================================================
   */

  async getInteractionLogs(salonId: string, limit = 100) {
    return db.select().from(aiInteractionLogs).where(eq(aiInteractionLogs.salonId, salonId)).orderBy(desc(aiInteractionLogs.createdAt)).limit(limit);
  }

  async getBlockedTermsLogs(salonId: string, limit = 100) {
    return db.select().from(aiBlockedTermsLog).where(eq(aiBlockedTermsLog.salonId, salonId)).orderBy(desc(aiBlockedTermsLog.createdAt)).limit(limit);
  }

  /**
   * Verifica se o serviço está operacional
   */
  isEnabled(): boolean {
    return this.gemini.isAvailable();
  }

  /**
   * =====================================================
   * SESSIONS (Dashboard)
   * =====================================================
   */

  async getSessions(salonId: string) {
    return db.select().from(aiConversations).where(eq(aiConversations.salonId, salonId)).orderBy(desc(aiConversations.updatedAt)).limit(100);
  }

  async getSessionMessages(salonId: string, sessionId: string) {
    // Verifica se a sessão pertence ao salão
    const session = await db
      .select()
      .from(aiConversations)
      .where(and(eq(aiConversations.id, sessionId), eq(aiConversations.salonId, salonId)))
      .limit(1);

    if (!session.length) return [];

    return db.select().from(aiMessages).where(eq(aiMessages.conversationId, sessionId)).orderBy(aiMessages.createdAt);
  }

  async endSession(salonId: string, sessionId: string) {
    await db
      .update(aiConversations)
      .set({ status: 'ENDED', updatedAt: new Date() })
      .where(and(eq(aiConversations.id, sessionId), eq(aiConversations.salonId, salonId)));

    return { success: true, message: 'Sessão encerrada' };
  }

  /**
   * =====================================================
   * COMPLIANCE & METRICS
   * =====================================================
   */

  async getComplianceStats(salonId: string) {
    // Total de mensagens bloqueadas
    const blocked = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(aiBlockedTermsLog)
      .where(eq(aiBlockedTermsLog.salonId, salonId));

    // Total de interações
    const interactions = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(aiInteractionLogs)
      .where(eq(aiInteractionLogs.salonId, salonId));

    // Sessões com takeover humano
    const humanTakeovers = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(aiConversations)
      .where(and(eq(aiConversations.salonId, salonId), eq(aiConversations.status, 'HUMAN_ACTIVE')));

    return {
      totalBlocked: blocked[0]?.count || 0,
      totalInteractions: interactions[0]?.count || 0,
      humanTakeovers: humanTakeovers[0]?.count || 0,
      complianceRate: interactions[0]?.count
        ? Math.round(((interactions[0].count - (blocked[0]?.count || 0)) / interactions[0].count) * 100)
        : 100,
    };
  }

  async getMetrics(salonId: string) {
    // Total de conversas
    const conversations = await db.select({ count: sql<number>`count(*)::int` }).from(aiConversations).where(eq(aiConversations.salonId, salonId));

    // Conversas ativas
    const activeConversations = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(aiConversations)
      .where(and(eq(aiConversations.salonId, salonId), eq(aiConversations.status, 'AI_ACTIVE')));

    // Total de mensagens
    const messagesResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(aiMessages)
      .innerJoin(aiConversations, eq(aiMessages.conversationId, aiConversations.id))
      .where(eq(aiConversations.salonId, salonId));

    return {
      totalConversations: conversations[0]?.count || 0,
      activeConversations: activeConversations[0]?.count || 0,
      totalMessages: messagesResult[0]?.count || 0,
      avgMessagesPerConversation: conversations[0]?.count
        ? Math.round((messagesResult[0]?.count || 0) / conversations[0].count)
        : 0,
    };
  }

  /**
   * =====================================================
   * TAKEOVER & RESUME
   * =====================================================
   */

  async humanTakeover(salonId: string, sessionId: string, userId: string) {
    await db
      .update(aiConversations)
      .set({
        status: 'HUMAN_ACTIVE',
        humanAgentId: userId,
        updatedAt: new Date(),
      })
      .where(and(eq(aiConversations.id, sessionId), eq(aiConversations.salonId, salonId)));

    return { success: true, message: 'Atendimento assumido' };
  }

  async aiResume(salonId: string, sessionId: string) {
    await db
      .update(aiConversations)
      .set({
        status: 'AI_ACTIVE',
        humanAgentId: null,
        updatedAt: new Date(),
      })
      .where(and(eq(aiConversations.id, sessionId), eq(aiConversations.salonId, salonId)));

    return { success: true, message: 'Alexis retomou o atendimento' };
  }

  async sendHumanMessage(salonId: string, sessionId: string, message: string, _userId: string) {
    // Verifica se a sessão pertence ao salão
    const session = await db
      .select()
      .from(aiConversations)
      .where(and(eq(aiConversations.id, sessionId), eq(aiConversations.salonId, salonId)))
      .limit(1);

    if (!session.length) {
      return { success: false, message: 'Sessão não encontrada' };
    }

    // Salva a mensagem
    await db.insert(aiMessages).values({
      conversationId: sessionId,
      role: 'human', // Mensagem do atendente humano
      content: message,
      intent: 'HUMAN_MESSAGE',
    });

    // Atualiza timestamp da conversa
    await db.update(aiConversations).set({ updatedAt: new Date() }).where(eq(aiConversations.id, sessionId));

    return { success: true, message: 'Mensagem enviada' };
  }

  /**
   * Deleta histórico do chat do dashboard
   */
  async deleteDashboardChatHistory(userId: string) {
    // Busca conversas do dashboard deste usuário
    const conversations = await db.select().from(aiConversations).where(eq(aiConversations.clientPhone, `dashboard-${userId}`));

    // Deleta mensagens das conversas
    for (const conv of conversations) {
      await db.delete(aiMessages).where(eq(aiMessages.conversationId, conv.id));
    }

    // Deleta as conversas
    await db.delete(aiConversations).where(eq(aiConversations.clientPhone, `dashboard-${userId}`));

    return { success: true, message: 'Histórico deletado' };
  }
}
