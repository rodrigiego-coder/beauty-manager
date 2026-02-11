import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
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
  users,
  professionalServices,
  salons,
  services,
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
import { PackageIntelligenceService } from './package-intelligence.service';
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
  // startScheduling, // Comentado: não usado após mudança para link de agendamento
  SkillContext,
} from './scheduling-skill';
import { matchLexicon } from './lexicon/lexicon-resolver';
import { getLexiconEnabled } from './lexicon/lexicon-feature-flag';
import { buildLexiconTelemetry, LexiconTelemetryEvent } from './lexicon/lexicon-telemetry';
import { resolveServicePrice, formatServicePriceResponse } from './lexicon/service-price-resolver';
import { resolveRelativeDate } from './relative-date-resolver';
import { AppointmentsService } from '../appointments/appointments.service';
import { OnlineBookingSettingsService } from '../online-booking/online-booking-settings.service';

/**
 * =====================================================
 * ALEXIS SERVICE - PRINCIPAL
 * IA Assistente para WhatsApp & Dashboard
 * =====================================================
 */

/**
 * REGRA DOS 3 MUNDOS - Separação de contexto
 * A = Serviços (agendamentos avulsos)
 * B = Pacotes (Pacote de Hidratação, Cronograma)
 * C = Produtos (itens de prateleira: Elixir, shampoos, etc.)
 *
 * REGRA: Se a pergunta tiver "Pacote", proibir sugestões do Mundo C
 */
export type AlexiaWorld = 'A' | 'B' | 'C' | 'UNKNOWN';

export interface WorldClassification {
  world: AlexiaWorld;
  description: string;
  allowedWorlds: AlexiaWorld[];
  forbiddenWorlds: AlexiaWorld[];
}

/**
 * Classifica o "mundo" baseado no intent e na mensagem
 */
export function classifyWorld(intent: string, message: string): WorldClassification {
  const msgLower = message.toLowerCase();

  // Mundo B: Pacotes (PRIORIDADE MÁXIMA se mencionar "pacote")
  if (
    msgLower.includes('pacote') ||
    intent === 'PACKAGE_QUERY' ||
    intent === 'PACKAGE_INFO' ||
    intent === 'PACKAGE_SCHEDULE_ALL'
  ) {
    return {
      world: 'B',
      description: 'Pacotes',
      allowedWorlds: ['B', 'A'], // Pode falar de serviços se necessário
      forbiddenWorlds: ['C'], // NUNCA falar de produtos
    };
  }

  // Mundo C: Produtos
  if (
    intent === 'PRODUCT_INFO' ||
    msgLower.includes('produto') ||
    msgLower.includes('comprar') ||
    msgLower.includes('elixir') ||
    msgLower.includes('shampoo') ||
    msgLower.includes('máscara') ||
    msgLower.includes('levar pra casa')
  ) {
    return {
      world: 'C',
      description: 'Produtos',
      allowedWorlds: ['C'],
      forbiddenWorlds: ['B'], // Não confundir com pacotes
    };
  }

  // Mundo A: Serviços (default para agendamentos)
  if (
    intent === 'SCHEDULE' ||
    intent === 'SERVICE_INFO' ||
    intent === 'LIST_SERVICES' ||
    intent === 'PRICE_INFO' ||
    intent === 'RESCHEDULE' ||
    intent === 'CANCEL'
  ) {
    return {
      world: 'A',
      description: 'Serviços',
      allowedWorlds: ['A', 'B'], // Pode mencionar pacotes se relevante
      forbiddenWorlds: [],
    };
  }

  // Mundo desconhecido
  return {
    world: 'UNKNOWN',
    description: 'Indefinido',
    allowedWorlds: ['A', 'B', 'C'],
    forbiddenWorlds: [],
  };
}

/**
 * Gera prefixo de confirmação para a resposta
 */
export function getConfirmationPrefix(intent: string, _world: AlexiaWorld): string {
  const confirmations: Record<string, string> = {
    PACKAGE_QUERY: 'Entendi: você quer saber sobre nossos pacotes.',
    PACKAGE_INFO: 'Entendi: você quer saber sobre seu pacote.',
    PRODUCT_INFO: 'Entendi: você quer saber sobre um produto.',
    PRICE_INFO: 'Entendi: você quer saber o valor.',
    SCHEDULE: 'Entendi: você quer agendar um horário.',
    SERVICE_INFO: 'Entendi: você quer saber sobre um serviço.',
  };

  return confirmations[intent] || '';
}

/**
 * Fallback inteligente quando não há certeza
 */
export const SMART_FALLBACK = `Não tenho certeza se entendi. 🤔

Você está procurando:
1️⃣ Um *serviço* no salão (corte, escova, hidratação)
2️⃣ Um *pacote* de sessões (ex: 4 sessões de hidratação)
3️⃣ Um *produto* para levar para casa (shampoo, máscara)

Responda 1, 2 ou 3, ou me conte mais! 😊`;

export interface ProcessMessageResult {
  response: string | null;
  intent: string;
  blocked: boolean;
  shouldSend: boolean;
  statusChanged: boolean;
  newStatus?: string;
  world?: AlexiaWorld;
}

@Injectable()
export class AlexisService {
  private readonly logger = new Logger(AlexisService.name);

  /** Debounce in-memory: agrupa mensagens rápidas por conversa */
  private debounceMap = new Map<
    string,
    { buffer: string[]; timer: NodeJS.Timeout; resolveOwner: () => void }
  >();

  /** Fallback counter: tracks consecutive fallbacks per conversation to auto-handoff */
  private fallbackCount = new Map<string, number>();

  /** Last fallback timestamp: prevents sending same fallback within 60s */
  private lastFallbackAt = new Map<string, number>();

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
    private readonly packageIntelligence: PackageIntelligenceService,
    @Inject(forwardRef(() => AppointmentsService))
    private readonly appointmentsService: AppointmentsService,
    private readonly onlineBookingSettings: OnlineBookingSettingsService,
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

    // ========== VERIFICA SE É COMANDO DO ATENDENTE (antes do check isEnabled) ==========
    // Comandos #eu/#ia são de controle e devem funcionar mesmo com Alexia desabilitada
    if (senderType === 'agent') {
      const conversation = await this.getOrCreateConversation(salonId, clientPhone, clientName);
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
          // #ia - Alexia volta (NÃO envia o comando ao cliente)
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

    // ========== CONFIRMAÇÃO DE AGENDAMENTO FUNCIONA MESMO COM ALEXIA DESLIGADA ==========
    // É funcionalidade crítica do salão (não é chat IA)

    // Primeiro: verifica se há um fluxo de retenção ativo (cliente respondendo 1/2 após "não")
    {
      const conversation = await this.getOrCreateConversation(salonId, clientPhone, clientName);
      const state = await this.stateStore.getState(conversation.id);

      if (state.activeSkill === 'CANCELLATION' && state.cancellationStep === 'AWAITING_CANCEL_CONFIRM') {
        const choice = message.trim().toLowerCase();
        const appointmentId = state.cancellationSlots?.appointmentId;

        if (choice === '1' || choice.includes('reagendar')) {
          // ========== REAGENDAR: cancela o antigo + envia link ==========
          if (appointmentId) {
            await this.executeCancellation(appointmentId, clientPhone);
          }
          const bookingUrl = await this.getBookingUrl(salonId, clientPhone);
          const reagendarMsg = bookingUrl
            ? `Sem problemas! O agendamento anterior foi cancelado.\n\nPara reagendar, acesse:\n🔗 ${bookingUrl}\n\nOu me diga o dia e horário que prefere! 😊`
            : `Sem problemas! O agendamento anterior foi cancelado.\n\nMe diga o dia e horário que prefere para reagendar! 😊`;

          await this.saveMessage(conversation.id, 'client', message, 'APPOINTMENT_RESCHEDULE', false, false);
          await this.saveMessage(conversation.id, 'ai', reagendarMsg, 'APPOINTMENT_RESCHEDULE', false, false);
          await this.stateStore.updateState(conversation.id, {
            activeSkill: 'NONE',
            cancellationStep: 'NONE',
            cancellationSlots: {},
          });

          return {
            response: reagendarMsg,
            intent: 'APPOINTMENT_RESCHEDULE',
            blocked: false,
            shouldSend: true,
            statusChanged: false,
          };
        }

        if (choice === '2' || choice.includes('cancelar') || choice.includes('cancela')) {
          // ========== CANCELAR DE FATO ==========
          if (appointmentId) {
            await this.executeCancellation(appointmentId, clientPhone);
          }
          const cancelMsg = `Agendamento *cancelado* com sucesso. 😔\n\nQuando quiser, agende novamente! Estamos à disposição. 💜`;

          await this.saveMessage(conversation.id, 'client', message, 'APPOINTMENT_DECLINE', false, false);
          await this.saveMessage(conversation.id, 'ai', cancelMsg, 'APPOINTMENT_DECLINE', false, false);
          await this.stateStore.updateState(conversation.id, {
            activeSkill: 'NONE',
            cancellationStep: 'NONE',
            cancellationSlots: {},
          });

          return {
            response: cancelMsg,
            intent: 'APPOINTMENT_DECLINE',
            blocked: false,
            shouldSend: true,
            statusChanged: false,
          };
        }

        // Qualquer outra resposta: trata como cancelamento (mais seguro) e segue pipeline
        await this.stateStore.updateState(conversation.id, {
          activeSkill: 'NONE',
          cancellationStep: 'NONE',
          cancellationSlots: {},
        });
      }
    }

    const confirmIntent = this.intentClassifier.classify(message);
    if (confirmIntent === 'APPOINTMENT_CONFIRM' || confirmIntent === 'APPOINTMENT_DECLINE') {
      const confirmResult = await this.handleAppointmentConfirmation(
        salonId, clientPhone, confirmIntent === 'APPOINTMENT_CONFIRM',
      );
      if (confirmResult.handled) {
        const conversation = await this.getOrCreateConversation(salonId, clientPhone, clientName);
        await this.saveMessage(conversation.id, 'client', message, confirmIntent, false, false);
        await this.saveMessage(conversation.id, 'ai', confirmResult.response, confirmIntent, false, false);

        // Se é DECLINE, salvar state de retenção (handleAppointmentConfirmation agora retorna appointmentId)
        if (confirmIntent === 'APPOINTMENT_DECLINE' && confirmResult.appointmentId) {
          await this.stateStore.updateState(conversation.id, {
            activeSkill: 'CANCELLATION',
            cancellationStep: 'AWAITING_CANCEL_CONFIRM',
            cancellationSlots: { appointmentId: confirmResult.appointmentId },
          });
        }

        return {
          response: confirmResult.response,
          intent: confirmIntent,
          blocked: false,
          shouldSend: true,
          statusChanged: false,
        };
      }
    }

    // ========== VERIFICA SE ALEXIA ESTÁ HABILITADA GLOBALMENTE ==========
    const settings = await this.getSettings(salonId);
    if (settings?.isEnabled === false) {
      this.logger.log(`Alexia desabilitada para salão ${salonId} - mensagem de cliente ignorada`);
      // Salva a mensagem mas não responde
      const conversation = await this.getOrCreateConversation(salonId, clientPhone, clientName);
      if (senderType === 'client') {
        await this.saveMessage(conversation.id, 'client', message, 'DISABLED', false, false);
      }
      return {
        response: null,
        intent: 'DISABLED',
        blocked: false,
        shouldSend: false,
        statusChanged: false,
      };
    }

    // ========== MENSAGEM DO CLIENTE ==========

    // Busca ou cria conversa (para mensagens de clientes)
    const conversation = await this.getOrCreateConversation(salonId, clientPhone, clientName);

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

    // ========== P0: CARREGA FSM STATE LOGO APÓS DEBOUNCE ==========
    const state = await this.stateStore.getState(conversation.id);

    // ========== FLUXO DE BOAS-VINDAS COM ESCOLHA DE CANAL ==========
    if (!state.userAlreadyGreeted && state.activeSkill === 'NONE') {
      const bookingUrl = await this.getBookingUrl(salonId, clientPhone);
      const ctxForName = await this.dataCollector.collectContext(salonId, clientPhone);
      const salonName = ctxForName?.salon?.name || 'Salão';
      const hour = new Date().getHours();
      const greeting = hour >= 5 && hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
      const firstName = clientName?.split(' ')[0] || '';
      const nameGreeting = firstName ? `${greeting}, ${firstName}!` : `${greeting}!`;

      const bookingLine = bookingUrl
        ? `\nSe quiser agendar um horário, acesse:\n🔗 ${bookingUrl}\n`
        : '';

      // Usa a mensagem de boas-vindas configurada nas settings, ou fallback padrão
      const greetingSettings = await this.getSettings(salonId);
      const customGreeting = greetingSettings?.greetingMessage?.trim();
      const greetingBody = customGreeting
        ? customGreeting
            .replace(/\{nome\}/gi, firstName || 'cliente')
            .replace(/\{saudacao\}/gi, greeting)
            .replace(/\{salao\}/gi, salonName)
        : `${nameGreeting} Eu sou a Alexia, assistente do ${salonName}.`;

      const channelOptions = `\n*1* - Falar com atendente\n      📅 Seg a Sex e Sábado, das 08:00 às 18:00\n*2* - Continuar com a Alexia (IA) 🤖\n      ⏰ Disponível 24h`;

      const welcomeMessage = `${greetingBody}${bookingLine}${channelOptions}`;

      await this.saveMessage(conversation.id, 'client', mergedText, 'GREETING', false, false);
      await this.saveMessage(conversation.id, 'ai', welcomeMessage, 'GREETING', false, false);
      await this.stateStore.updateState(conversation.id, {
        activeSkill: 'CHANNEL_CHOICE',
        channelChoiceStep: 'AWAITING_CHOICE',
        userAlreadyGreeted: true,
        lastGreetingAt: nowIso(),
      });

      await this.logInteraction(
        salonId, conversation.id, clientPhone,
        mergedText, welcomeMessage, 'GREETING',
        false, undefined, Date.now() - startTime,
      );

      return {
        response: welcomeMessage,
        intent: 'GREETING',
        blocked: false,
        shouldSend: true,
        statusChanged: false,
      };
    }

    // ========== HANDLE CHANNEL CHOICE RESPONSE ==========
    if (state.activeSkill === 'CHANNEL_CHOICE' && state.channelChoiceStep === 'AWAITING_CHOICE') {
      const choice = mergedText.trim().toLowerCase();

      if (choice === '1' || choice.includes('atendente') || choice.includes('humano')) {
        // Opção 1: Atendimento humano
        await this.handleHumanTakeover(conversation.id, '');
        await this.saveMessage(conversation.id, 'client', mergedText, 'HUMAN_TAKEOVER', false, false);
        const chSettings = await this.getSettings(salonId);
        const msg = chSettings?.humanTakeoverMessage || 'Pronto! Nossa equipe já foi notificada e logo irá te atender. 😊';
        await this.saveMessage(conversation.id, 'ai', msg, 'HUMAN_TAKEOVER', false, false);
        await this.stateStore.updateState(conversation.id, {
          activeSkill: 'NONE',
          channelChoiceStep: 'NONE',
        });

        return {
          response: msg,
          intent: 'HUMAN_TAKEOVER',
          blocked: false,
          shouldSend: true,
          statusChanged: true,
          newStatus: 'HUMAN_ACTIVE',
        };
      }

      // Limpa state de escolha de canal
      await this.stateStore.updateState(conversation.id, {
        activeSkill: 'NONE',
        channelChoiceStep: 'NONE',
      });

      if (choice === '2' || choice.includes('ia') || choice.includes('alexia')) {
        // Opção 2: Continuar com IA
        const confirmMsg = 'Perfeito! Estou aqui para te ajudar. O que você precisa? 😊';
        await this.saveMessage(conversation.id, 'client', mergedText, 'AI_CONFIRMED', false, false);
        await this.saveMessage(conversation.id, 'ai', confirmMsg, 'AI_CONFIRMED', false, false);
        return {
          response: confirmMsg,
          intent: 'GENERAL',
          blocked: false,
          shouldSend: true,
          statusChanged: false,
        };
      }

      // Qualquer outra coisa (pergunta direta): cai no pipeline normal abaixo
    }

    // ========== P0: FSM ATIVA TEM PRIORIDADE ABSOLUTA ==========
    // Se SCHEDULING com step !== 'NONE', vai direto para FSM (NÃO cai em IA/fallback)
    if (state.activeSkill === 'SCHEDULING' && state.step !== 'NONE') {
      this.logger.debug(`[Router] FSM_ACTIVE: step=${state.step}, conversationId=${conversation.id}`);
      return this.handleFSMTurn(
        conversation.id, salonId, clientPhone, clientName, mergedText, state, startTime,
      );
    }

    // ========== CONTINUAÇÃO TRANSACIONAL: SCHEDULE (fallback se FSM state perdido) ==========
    // Roda ANTES de resolveRelativeDate para capturar respostas de agendamento
    const scheduleContinuation = await this.checkScheduleContinuation(
      conversation.id, salonId, clientPhone, mergedText, startTime,
    );
    if (scheduleContinuation) {
      this.logger.debug(`[Router] SCHEDULE_CONTINUATION: conversationId=${conversation.id}`);
      return scheduleContinuation;
    }

    // ========== NON-FSM: Pipeline normal ==========
    this.logger.debug(`[Router] NON_FSM: conversationId=${conversation.id}`);

    // ========== RELATIVE DATE: resposta determinística (P0.5) ==========
    const dateResult = resolveRelativeDate(mergedText);
    if (dateResult.matched && dateResult.response) {
      await this.saveMessage(conversation.id, 'client', mergedText, 'DATE_INFO', false, false);
      await this.saveMessage(conversation.id, 'ai', dateResult.response, 'DATE_INFO', false, false);
      await this.logInteraction(
        salonId, conversation.id, clientPhone,
        mergedText, dateResult.response, 'DATE_INFO',
        false, undefined, Date.now() - startTime,
      );
      return {
        response: dateResult.response,
        intent: 'DATE_INFO',
        blocked: false,
        shouldSend: true,
        statusChanged: false,
      };
    }

    // ========== LEXICON: dialeto de salão → preço de serviço (antes de ProductInfo) ==========
    if (getLexiconEnabled()) {
      const lexiconServicePrice = await this.tryLexiconServicePrice(
        conversation.id, salonId, clientPhone, mergedText, startTime,
      );
      if (lexiconServicePrice) return lexiconServicePrice;
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

    // Classifica intenção
    const intent = this.intentClassifier.classify(mergedText);

    // ========== PACKAGE INTENTS (Package Intelligence) ==========
    // Consulta sobre pacotes disponíveis para compra
    if (intent === 'PACKAGE_QUERY') {
      return this.handlePackageQuery(
        conversation.id, salonId, clientPhone, mergedText, startTime,
      );
    }

    // Informações sobre pacote do cliente (meus pacotes, sessões restantes)
    if (intent === 'PACKAGE_INFO') {
      return this.handlePackageInfo(
        conversation.id, salonId, clientPhone, clientName, mergedText, startTime,
      );
    }

    if (intent === 'PACKAGE_SCHEDULE_ALL') {
      return this.handlePackageScheduleAll(
        conversation.id, salonId, clientPhone, clientName, mergedText, startTime,
      );
    }

    // ========== SCHEDULE via FSM (novo fluxo) ==========
    if (intent === 'SCHEDULE') {
      return this.handleFSMStart(
        conversation.id, salonId, clientPhone, clientName, mergedText, state, startTime,
      );
    }

    // ========== CANCEL: Cancelamento com fluxo de retenção ==========
    if (intent === 'CANCEL') {
      return this.handleCancelIntent(
        conversation.id, salonId, clientPhone, clientName, mergedText, state, startTime,
      );
    }

    // ========== CANCELLATION FSM ATIVA ==========
    if (state.activeSkill === 'CANCELLATION' && state.cancellationStep !== 'NONE') {
      return this.handleCancellationTurn(
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

      // P0.6: Se APPOINTMENT_CONFIRM mas não há agendamento pendente,
      // cliente provavelmente está respondendo "Sim" a "Quer agendar?"
      // Inicia fluxo de scheduling FSM
      if (intent === 'APPOINTMENT_CONFIRM') {
        this.logger.debug(`[Router] APPOINTMENT_CONFIRM sem agendamento pendente, iniciando FSM`);
        return this.handleFSMStart(
          conversation.id, salonId, clientPhone, clientName, mergedText, state, startTime,
        );
      }
    }

    // ========== LIST_SERVICES: listagem DB-backed (P0.5) ==========
    if (intent === 'LIST_SERVICES') {
      return this.handleListServices(
        conversation.id, salonId, clientPhone, clientName, mergedText, state, startTime,
      );
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
    const kbSettings = await this.getSettings(salonId);
    let aiResponse: string;

    // Check if Gemini is available before trying
    const geminiAvailable = this.gemini.isAvailable();

    try {
      if (!geminiAvailable) {
        throw new Error('Gemini API não disponível');
      }
      if (intent === 'PRODUCT_INFO' || intent === 'PRICE_INFO') {
        aiResponse = await this.handleProductIntent(salonId, mergedText);
      } else {
        aiResponse = await this.gemini.generateResponse(
          context.salon?.name || 'Salão', mergedText, context, history,
          kbSettings?.knowledgeBase,
        );
      }
      // Reset fallback counter on success
      this.fallbackCount.delete(conversation.id);
    } catch (error: any) {
      this.logger.error('[P0.4-FALLBACK] Gemini falhou, usando fallback premium:', error?.message || error);

      // ========== ANTI-LOOP: Fallback counter + auto-handoff ==========
      const failures = (this.fallbackCount.get(conversation.id) || 0) + 1;
      this.fallbackCount.set(conversation.id, failures);

      // Check if we sent fallback recently (within 60s)
      const lastFallback = this.lastFallbackAt.get(conversation.id) || 0;
      const now = Date.now();
      const FALLBACK_COOLDOWN_MS = 60_000;

      if (now - lastFallback < FALLBACK_COOLDOWN_MS) {
        this.logger.warn(`[ANTI-LOOP] Fallback suprimido para ${clientPhone} (cooldown ativo)`);
        await this.saveMessage(conversation.id, 'client', mergedText, intent, false, false);
        return {
          response: null,
          intent,
          blocked: false,
          shouldSend: false,
          statusChanged: false,
        };
      }

      // After 2 consecutive fallbacks, auto-handoff to human
      if (failures >= 2) {
        this.logger.warn(`[AUTO-HANDOFF] ${failures} fallbacks consecutivos para ${clientPhone}, escalando para humano`);
        await this.handleHumanTakeover(conversation.id, '');
        this.fallbackCount.delete(conversation.id);
        this.lastFallbackAt.delete(conversation.id);

        const handoffMessage = 'Um momento, vou te transferir para nossa equipe. 😊';
        await this.saveMessage(conversation.id, 'client', mergedText, 'AUTO_HANDOFF', false, false);
        await this.saveMessage(conversation.id, 'ai', handoffMessage, 'AUTO_HANDOFF', false, false);

        return {
          response: handoffMessage,
          intent: 'AUTO_HANDOFF',
          blocked: false,
          shouldSend: true,
          statusChanged: true,
          newStatus: 'HUMAN_ACTIVE',
        };
      }

      this.lastFallbackAt.set(conversation.id, now);
      aiResponse = this.gemini.getFallbackResponse();
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
    clientName: string | undefined,
    text: string,
    state: ConversationState,
    startTime: number,
  ): Promise<ProcessMessageResult> {
    const context = await this.dataCollector.collectContext(salonId, clientPhone);
    const skillCtx = await this.buildSkillContext(salonId, context);

    const result = handleSchedulingTurn(state, text, skillCtx);

    // ========== INTERRUPTION: info question durante scheduling ==========
    // Se interruptionQuery=true, responder a pergunta via pipeline normal e anexar resume prompt
    let finalResponse = result.replyText;
    if (result.interruptionQuery) {
      const infoAnswer = await this.resolveInfoInterruption(salonId, text, context);
      const resumePrompt = result.replyText; // "Voltando ao seu agendamento: ..."
      finalResponse = resumePrompt
        ? `${infoAnswer}\n\n${resumePrompt}`
        : infoAnswer;
    }

    // ========== P0: COMMIT TRANSACIONAL quando handover=true ==========
    if (result.handover && state.slots.serviceId && state.slots.dateISO && state.slots.time) {
      const commitResult = await this.commitSchedulingTransaction(
        conversationId,
        salonId,
        clientPhone,
        clientName,
        state,
        skillCtx,
      );

      if (commitResult.success) {
        // SUCESSO: Só confirma APÓS ter appointment.id válido
        finalResponse = commitResult.response;
        // Atualiza nextState com marcador de commit
        result.nextState.schedulingCommittedAt = nowIso();
        result.nextState.schedulingAppointmentId = commitResult.appointmentId;
        this.logger.log(`[CommitScheduling] Sucesso: appointmentId=${commitResult.appointmentId}`);
      } else {
        // ERRO: Usa mensagem de aguardo ao invés de confirmar algo que não foi gravado
        this.logger.error(`[CommitScheduling] Falha: ${commitResult.error}`);

        // Se temos uma pendingResponse (mensagem de aguardo), usa ela
        if ('pendingResponse' in commitResult && commitResult.pendingResponse) {
          finalResponse = commitResult.pendingResponse;
        } else {
          // Fallback: mensagem genérica de aguardo
          finalResponse = 'Estou finalizando o registro do seu agendamento, um momento... 😊\n\nNossa equipe vai confirmar seu horário em breve.';
        }

        // NÃO marca como commitado - mantém estado para retry ou handover humano
        result.nextState.handoverSummary = `Erro ao registrar agendamento: ${commitResult.error}. Serviço: ${state.slots.serviceLabel}, Data: ${state.slots.dateISO}, Hora: ${state.slots.time}`;
        result.nextState.handoverAt = nowIso();
      }
    }

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
   * COMMIT SCHEDULING TRANSACTION (P0)
   * Cria appointment real no banco usando AppointmentsService
   *
   * REGRA CRÍTICA: A confirmação SÓ pode ser enviada APÓS
   * receber o appointment.id de sucesso da API.
   * OBRIGATÓRIO: Incluir link de confirmação em toda finalização.
   * =====================================================
   */
  private async commitSchedulingTransaction(
    conversationId: string,
    salonId: string,
    clientPhone: string,
    clientName: string | undefined,
    state: ConversationState,
    context: SkillContext,
  ): Promise<{ success: true; appointmentId: string; response: string } | { success: false; error: string; pendingResponse?: string }> {
    try {
      // ========== IDEMPOTÊNCIA: verifica se já foi commitado ==========
      const currentState = await this.stateStore.getState(conversationId);
      if (currentState.schedulingCommittedAt && currentState.schedulingAppointmentId) {
        this.logger.log(
          `[CommitScheduling] Idempotente: já commitado em ${currentState.schedulingCommittedAt}, ` +
            `appointmentId=${currentState.schedulingAppointmentId}`,
        );

        // Gera link de confirmação obrigatório mesmo para idempotente
        const confirmLink = await this.generateConfirmationLink(salonId, clientPhone);

        return {
          success: true,
          appointmentId: currentState.schedulingAppointmentId,
          response: `Seu agendamento já está registrado! ✅\n\n🔗 Confirme aqui: ${confirmLink}`,
        };
      }

      // ========== BUSCA DADOS DO SERVIÇO (duration, price) ==========
      const serviceId = state.slots.serviceId;
      const serviceMatch = context.services.find((s) => s.id === serviceId);
      const serviceName = state.slots.serviceLabel || serviceMatch?.name || 'Serviço';

      // Busca duração do serviço no DB
      let duration = 60; // fallback 60 min
      let price = '0';
      if (serviceId) {
        const [svc] = await db
          .select({ durationMinutes: services.durationMinutes, basePrice: services.basePrice })
          .from(services)
          .where(eq(services.id, parseInt(serviceId, 10)))
          .limit(1);
        if (svc) {
          duration = svc.durationMinutes || 60;
          price = svc.basePrice || '0';
        }
      }

      // ========== RESOLVE PROFISSIONAL (se não especificado, pega primeiro disponível) ==========
      let professionalId = state.slots.professionalId;
      let professionalName = state.slots.professionalLabel;

      if (!professionalId && context.professionals && context.professionals.length > 0) {
        const firstPro = context.professionals[0];
        professionalId = firstPro.id;
        professionalName = firstPro.name;
        this.logger.debug(`[CommitScheduling] Auto-selecionou profissional: ${professionalName}`);
      }

      if (!professionalId) {
        return {
          success: false,
          error: 'Nenhum profissional disponível',
          pendingResponse: 'Estou verificando a disponibilidade dos profissionais, um momento... 😊',
        };
      }

      // ========== CRIA APPOINTMENT via AppointmentsService ==========
      this.logger.log(
        `[CommitScheduling] Criando appointment: salonId=${salonId}, service=${serviceName}, ` +
          `date=${state.slots.dateISO}, time=${state.slots.time}, professional=${professionalName}`,
      );

      let appointment;
      try {
        appointment = await this.appointmentsService.create(
          salonId,
          {
            professionalId,
            service: serviceName,
            serviceId: serviceId ? parseInt(serviceId, 10) : undefined,
            date: state.slots.dateISO!,
            time: state.slots.time!,
            duration,
            price,
            clientName: clientName || 'Cliente WhatsApp',
            clientPhone,
            source: 'WHATSAPP',
            notes: 'Agendado via Alexia (WhatsApp)',
          },
          professionalId, // createdById = professional (auto-atribuído)
        );
      } catch (createError: any) {
        this.logger.error(`[CommitScheduling] Erro ao criar appointment: ${createError?.message}`);
        return {
          success: false,
          error: createError?.message || 'Erro ao criar agendamento',
          pendingResponse: 'Estou finalizando o registro do seu horário, um momento... 😊\n\nSe demorar, nossa equipe entrará em contato para confirmar.',
        };
      }

      // ========== VERIFICAÇÃO CRÍTICA: appointment.id DEVE existir ==========
      if (!appointment || !appointment.id) {
        this.logger.error(`[CommitScheduling] Appointment criado sem ID válido`);
        return {
          success: false,
          error: 'Agendamento não retornou ID válido',
          pendingResponse: 'Estou registrando seu agendamento, aguarde um momento... 😊\n\nVou te enviar a confirmação em instantes.',
        };
      }

      this.logger.log(
        `[CommitScheduling] Appointment criado COM SUCESSO: id=${appointment.id}, salonId=${salonId}, ` +
          `conversationId=${conversationId}`,
      );

      // ========== GERA LINK DE CONFIRMAÇÃO OBRIGATÓRIO ==========
      const confirmLink = await this.generateConfirmationLink(salonId, clientPhone, serviceId ? parseInt(serviceId, 10) : undefined);

      // ========== BUSCA DADOS DO SALÃO PARA RESPOSTA (endereço, maps) ==========
      const salonInfo = await this.getSalonInfoForConfirmation(salonId);

      // ========== MONTA RESPOSTA DE CONFIRMAÇÃO (SÓ APÓS TER appointment.id) ==========
      const dateDisplay = new Date(state.slots.dateISO!).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });

      // REGRA: Confirmação só aparece APÓS sucesso da API
      let confirmationMsg = `Agendamento registrado com sucesso! ✅

📅 *${dateDisplay}* às *${state.slots.time}*
✂️ ${serviceName}`;

      if (professionalName) {
        confirmationMsg += `\n💇 ${professionalName}`;
      }

      // OBRIGATÓRIO: Link de confirmação/pagamento
      confirmationMsg += `\n\n🔗 *Confirme seu horário:*\n${confirmLink}`;

      // Adiciona endereço se disponível
      if (salonInfo.address) {
        confirmationMsg += `\n\n📍 *Endereço:*\n${salonInfo.address}`;
      }

      // Adiciona links de navegação
      if (salonInfo.locationUrl) {
        confirmationMsg += `\n\n🗺️ Google Maps:\n${salonInfo.locationUrl}`;
      }
      if (salonInfo.wazeUrl) {
        confirmationMsg += `\n\n🚗 Waze:\n${salonInfo.wazeUrl}`;
      }

      confirmationMsg += '\n\nAguardamos você! 💜';

      return {
        success: true,
        appointmentId: appointment.id,
        response: confirmationMsg,
      };
    } catch (error: any) {
      this.logger.error(`[CommitScheduling] Erro inesperado: ${error?.message || error}`);
      return {
        success: false,
        error: error?.message || 'Erro desconhecido',
        pendingResponse: 'Estou finalizando o registro, um momento... 😊\n\nAguarde o link de confirmação.',
      };
    }
  }

  /**
   * Gera link de confirmação/pagamento obrigatório para agendamentos
   */
  private async generateConfirmationLink(
    salonId: string,
    clientPhone: string,
    serviceId?: number,
  ): Promise<string> {
    try {
      const result = await this.onlineBookingSettings.generateAssistedLink({
        salonId,
        serviceId,
        clientPhone: clientPhone?.replace(/\D/g, ''),
      });
      return result.url;
    } catch (error) {
      this.logger.warn(`Erro ao gerar link de confirmação: ${error}`);
      // Fallback: retorna link genérico do salão
      const baseUrl = process.env.FRONTEND_URL || 'https://app.beautymanager.com.br';
      return `${baseUrl}/agendar?phone=${clientPhone?.replace(/\D/g, '')}`;
    }
  }

  /**
   * Busca informações do salão para mensagem de confirmação
   */
  private async getSalonInfoForConfirmation(
    salonId: string,
  ): Promise<{ address?: string; locationUrl?: string; wazeUrl?: string }> {
    try {
      const [salon] = await db
        .select({
          address: salons.address,
          locationUrl: salons.locationUrl,
          wazeUrl: salons.wazeUrl,
        })
        .from(salons)
        .where(eq(salons.id, salonId))
        .limit(1);

      if (!salon) return {};

      return {
        address: salon.address || undefined,
        locationUrl: salon.locationUrl || undefined,
        wazeUrl: salon.wazeUrl || undefined,
      };
    } catch (error) {
      this.logger.warn(`Erro ao buscar dados do salão ${salonId}: ${error}`);
      return {};
    }
  }

  /**
   * Constrói SkillContext com profissionais + assignments para o salonId.
   */
  private async buildSkillContext(salonId: string, context: any): Promise<SkillContext> {
    const base: SkillContext = { services: (context.services || []) as any };
    try {
      const pros = await db
        .select({ id: users.id, name: users.name, active: users.active })
        .from(users)
        .where(and(eq(users.salonId, salonId), eq(users.active, true)));
      base.professionals = pros;

      const assignments = await db
        .select({
          professionalId: professionalServices.professionalId,
          serviceId: professionalServices.serviceId,
          enabled: professionalServices.enabled,
        })
        .from(professionalServices)
        .where(eq(professionalServices.enabled, true));
      // Filter only for professionals in this salon
      const proIds = new Set(pros.map((p) => p.id));
      base.professionalAssignments = assignments.filter((a) => proIds.has(a.professionalId));
    } catch (error: any) {
      this.logger.debug(`buildSkillContext professionals fallback: ${error?.message?.slice(0, 80)}`);
    }
    return base;
  }

  /**
   * =====================================================
   * LEXICON SERVICE PRICE — Detecta dialeto de salão em perguntas de preço
   * Ex: "quanto custa a progressiva?" → preço de Alisamento (serviço)
   * =====================================================
   */
  private async tryLexiconServicePrice(
    conversationId: string,
    salonId: string,
    clientPhone: string,
    text: string,
    startTime: number,
  ): Promise<ProcessMessageResult | null> {
    try {
      // Só ativa se parece pergunta de preço
      const normalized = text.toLowerCase();
      const isPriceQ = /\b(quanto\s+custa|qual\s+(o\s+)?pre[cç]o|valor\s+d|pre[cç]o\s+d)/.test(normalized);
      if (!isPriceQ) return null;

      const lexMatch = matchLexicon(text);

      // Telemetria: registra decisão do lexicon
      const telemetry = buildLexiconTelemetry(lexMatch, true);
      this.logLexiconTelemetry(telemetry);

      if (!lexMatch || !lexMatch.entry.suggestedServiceKey) return null;
      if (lexMatch.entry.entityType !== 'SERVICE' && lexMatch.entry.entityType !== 'TECHNIQUE') return null;

      // Busca serviço no catálogo via ServicePriceResolver
      const context = await this.dataCollector.collectContext(salonId, clientPhone);
      const services = context.services || [];
      const priceResult = resolveServicePrice(lexMatch.entry.canonical, services as any);

      // Resposta premium: com preço se existir, consultiva se não
      const response = formatServicePriceResponse(
        lexMatch.matchedTrigger,
        lexMatch.entry.canonical,
        priceResult,
      );

      await this.saveMessage(conversationId, 'client', text, 'PRICE_INFO', false, false);
      await this.saveMessage(conversationId, 'ai', response, 'PRICE_INFO', false, false);

      await this.logInteraction(
        salonId, conversationId, clientPhone,
        text, response, 'PRICE_INFO',
        false, undefined, Date.now() - startTime,
      );

      return {
        response,
        intent: 'PRICE_INFO',
        blocked: false,
        shouldSend: true,
        statusChanged: false,
      };
    } catch (error: any) {
      this.logger.debug(`Lexicon price fallback: ${error?.message?.slice(0, 80)}`);
      return null;
    }
  }

  /**
   * Registra telemetria do lexicon (1 evento por turno, sem texto do usuário).
   */
  private logLexiconTelemetry(event: LexiconTelemetryEvent): void {
    this.logger.debug(
      `Lexicon: enabled=${event.lexiconEnabled} entry=${event.entryId || '-'} ` +
      `trigger="${event.matchedTrigger || '-'}" conf=${event.confidence ?? '-'} ` +
      `decision=${event.decision} reason=${event.reason}`,
    );
  }

  /**
   * =====================================================
   * INFO INTERRUPTION — Responde pergunta de info durante scheduling
   * Usa ProductInfo determinístico ou Gemini como fallback
   * =====================================================
   */
  private async resolveInfoInterruption(
    salonId: string,
    text: string,
    context: any,
  ): Promise<string> {
    try {
      // Tenta ProductInfo determinístico primeiro
      const productAnswer = await this.productInfo.tryAnswerProductInfo(salonId, text);
      if (productAnswer) return productAnswer;

      // Fallback: Gemini para perguntas genéricas (horário de funcionamento, etc.)
      return await this.gemini.generateResponse(
        context.salon?.name || 'Salão', text, context,
      );
    } catch {
      return 'No momento não consegui buscar essa informação, mas posso tentar depois 😊';
    }
  }

  /**
   * =====================================================
   * FSM START — Envia link de agendamento online
   * (Antes: iniciava scheduling skill via FSM)
   * =====================================================
   */
  private async handleFSMStart(
    conversationId: string,
    salonId: string,
    clientPhone: string,
    _clientName: string | undefined,
    text: string,
    _state: ConversationState,
    startTime: number,
  ): Promise<ProcessMessageResult> {
    const context = await this.dataCollector.collectContext(salonId, clientPhone);
    const services = context.services || [];

    // Tenta identificar serviço mencionado na mensagem
    const matched = fuzzyMatchService(text, services) as any;

    // Gera link de agendamento assistido
    const replyText = await this.generateBookingLinkResponse(
      salonId,
      clientPhone,
      matched?.id,
      matched?.name,
    );

    await this.stateStore.updateState(conversationId, {
      userAlreadyGreeted: true,
    });

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

    /* ========== CÓDIGO ANTIGO: FSM SCHEDULING (comentado para referência) ==========
    // Se o texto já contém um serviço, pular AWAITING_SERVICE e ir direto
    const skillCtx = await this.buildSkillContext(salonId, context);
    const result = startScheduling();

    // Tenta já resolver serviço na mesma mensagem (ex.: "quero agendar alisamento")
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
    ========== FIM CÓDIGO ANTIGO ========== */
  }

  /**
   * =====================================================
   * GERA RESPOSTA COM LINK DE AGENDAMENTO ONLINE
   * =====================================================
   */
  private async getBookingUrl(salonId: string, clientPhone: string): Promise<string> {
    try {
      const result = await this.onlineBookingSettings.generateAssistedLink({
        salonId,
        clientPhone: clientPhone?.replace(/\D/g, ''),
      });
      return result.url;
    } catch {
      return '';
    }
  }

  private async generateBookingLinkResponse(
    salonId: string,
    clientPhone: string,
    serviceId?: number,
    serviceName?: string,
  ): Promise<string> {
    try {
      const result = await this.onlineBookingSettings.generateAssistedLink({
        salonId,
        serviceId,
        clientPhone: clientPhone?.replace(/\D/g, ''),
      });

      // Tom de assistente de luxo: direto, eficiente, discreto
      const serviceText = serviceName ? ` para *${serviceName}*` : '';

      return `Perfeito! Confira os horários disponíveis${serviceText} e agende pelo link:

🔗 ${result.url}`;
    } catch (error) {
      this.logger.error('Erro ao gerar link de agendamento:', error);
      return 'Desculpe, tive um problema ao gerar o link de agendamento. Por favor, entre em contato pelo telefone do salão.';
    }
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
  ): Promise<{ handled: boolean; response: string; appointmentId?: string }> {
    // Formata variações do telefone para busca
    const phoneClean = clientPhone.replace(/\D/g, '');
    const phoneVariants = [phoneClean, phoneClean.replace(/^55/, ''), `55${phoneClean.replace(/^55/, '')}`];

    // Busca agendamento pendente de confirmação para este telefone
    // Busca por confirmationStatus='PENDING' com status SCHEDULED (padrão do sistema)
    const pendingAppointments = await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.salonId, salonId),
        eq(appointments.confirmationStatus, 'PENDING'),
        eq(appointments.status, 'SCHEDULED'),
      ))
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

    // ========== RETENÇÃO: PERGUNTA ANTES DE CANCELAR ==========
    const dateFormatted2 = new Date(appointment.date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    this.logger.log(`Agendamento ${appointment.id} — cliente disse NÃO, iniciando retenção para ${clientPhone}`);

    return {
      handled: true,
      appointmentId: appointment.id,
      response: `Entendi! Antes de cancelar o agendamento de *${dateFormatted2}* às *${appointment.time}*, gostaria de reagendar para outro dia/horário?\n\n*1* - Sim, quero reagendar\n*2* - Não, pode cancelar`,
    };
  }

  /**
   * Executa o cancelamento efetivo de um agendamento
   * Usado pelo fluxo de retenção após confirmação do cliente
   */
  private async executeCancellation(appointmentId: string, clientPhone: string): Promise<void> {
    await db
      .update(appointments)
      .set({
        status: 'CANCELLED',
        cancellationReason: 'Cancelado pelo cliente via WhatsApp',
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentId));

    await db
      .update(appointmentNotifications)
      .set({
        clientResponse: 'CANCELLED',
        clientRespondedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(appointmentNotifications.appointmentId, appointmentId),
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
        and(eq(appointmentNotifications.appointmentId, appointmentId), eq(appointmentNotifications.status, 'SCHEDULED')),
      );

    this.logger.log(`Agendamento ${appointmentId} CANCELADO via WhatsApp por ${clientPhone}`);
  }

  /**
   * =====================================================
   * CANCEL INTENT — Cancelamento com fluxo de retenção
   *
   * FLUXO OBRIGATÓRIO:
   * 1. Busca agendamento(s) do cliente
   * 2. Mostra detalhes e pede confirmação
   * 3. EXECUTA cancelamento via appointmentsService.cancel()
   * 4. SÓ confirma APÓS sucesso da API
   * 5. Oferece reagendamento com horários disponíveis
   * =====================================================
   */
  private async handleCancelIntent(
    conversationId: string,
    salonId: string,
    clientPhone: string,
    _clientName: string | undefined,
    text: string,
    _state: ConversationState,
    startTime: number,
  ): Promise<ProcessMessageResult> {
    try {
      // Busca agendamentos futuros do cliente
      const upcomingAppointments = await this.findUpcomingAppointmentsByPhone(salonId, clientPhone);

      if (upcomingAppointments.length === 0) {
        const response = 'Não encontrei agendamentos futuros no seu nome. Se você tem um agendamento recente, pode me dar mais detalhes? 😊';

        await this.saveMessage(conversationId, 'client', text, 'CANCEL', false, false);
        await this.saveMessage(conversationId, 'ai', response, 'CANCEL', false, false);

        await this.logInteraction(
          salonId, conversationId, clientPhone,
          text, response, 'CANCEL',
          false, undefined, Date.now() - startTime,
        );

        return {
          response,
          intent: 'CANCEL',
          blocked: false,
          shouldSend: true,
          statusChanged: false,
        };
      }

      // Se tem apenas 1 agendamento, vai direto para confirmação
      if (upcomingAppointments.length === 1) {
        const apt = upcomingAppointments[0];
        const dateDisplay = new Date(apt.date).toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        });

        // Busca horários disponíveis para oferecer reagendamento
        const rescheduleSlots = await this.getNextAvailableSlots(salonId, apt.serviceId, 2);

        // Atualiza state para FSM de cancelamento
        await this.stateStore.updateState(conversationId, {
          activeSkill: 'CANCELLATION',
          cancellationStep: 'AWAITING_CANCEL_CONFIRM',
          cancellationSlots: {
            appointmentId: apt.id,
            serviceLabel: apt.service,
            dateISO: apt.date,
            time: apt.time,
            professionalLabel: apt.professionalName,
            rescheduleSlots,
          },
          userAlreadyGreeted: true,
        });

        const response = `Encontrei seu agendamento:

📅 *${dateDisplay}* às *${apt.time}*
✂️ ${apt.service}${apt.professionalName ? `\n💇 ${apt.professionalName}` : ''}

Tem certeza que deseja cancelar? (sim/não)`;

        await this.saveMessage(conversationId, 'client', text, 'CANCEL', false, false);
        await this.saveMessage(conversationId, 'ai', response, 'CANCEL', false, false);

        await this.logInteraction(
          salonId, conversationId, clientPhone,
          text, response, 'CANCEL',
          false, undefined, Date.now() - startTime,
        );

        return {
          response,
          intent: 'CANCEL',
          blocked: false,
          shouldSend: true,
          statusChanged: false,
        };
      }

      // Múltiplos agendamentos - lista para o cliente escolher
      const list = upcomingAppointments.slice(0, 5).map((apt, i) => {
        const dateDisplay = new Date(apt.date).toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'short',
        });
        return `${i + 1}. ${apt.service} - ${dateDisplay} às ${apt.time}`;
      }).join('\n');

      const response = `Encontrei ${upcomingAppointments.length} agendamentos futuros:

${list}

Qual você deseja cancelar? (Digite o número)`;

      // Salva lista no state para referência
      await this.stateStore.updateState(conversationId, {
        activeSkill: 'CANCELLATION',
        cancellationStep: 'AWAITING_CANCEL_CONFIRM',
        cancellationSlots: {
          // Guarda o primeiro como default se cliente responder "sim" direto
          appointmentId: upcomingAppointments[0].id,
          serviceLabel: upcomingAppointments[0].service,
          dateISO: upcomingAppointments[0].date,
          time: upcomingAppointments[0].time,
          professionalLabel: upcomingAppointments[0].professionalName,
        },
        userAlreadyGreeted: true,
      });

      await this.saveMessage(conversationId, 'client', text, 'CANCEL', false, false);
      await this.saveMessage(conversationId, 'ai', response, 'CANCEL', false, false);

      await this.logInteraction(
        salonId, conversationId, clientPhone,
        text, response, 'CANCEL',
        false, undefined, Date.now() - startTime,
      );

      return {
        response,
        intent: 'CANCEL',
        blocked: false,
        shouldSend: true,
        statusChanged: false,
      };
    } catch (error: any) {
      // LOGGING AGRESSIVO: Captura erro completo
      this.logger.error(`[ALEXIA_CANCEL_INTENT_ERROR] phone=${clientPhone} salonId=${salonId} error=${error?.message} stack=${error?.stack}`);

      const response = 'Desculpe, tive um problema ao verificar seus agendamentos. Entre em contato com a recepção! 😊';

      await this.saveMessage(conversationId, 'client', text, 'CANCEL', false, false);
      await this.saveMessage(conversationId, 'ai', response, 'CANCEL', false, false);

      return {
        response,
        intent: 'CANCEL',
        blocked: false,
        shouldSend: true,
        statusChanged: false,
      };
    }
  }

  /**
   * =====================================================
   * CANCELLATION FSM TURN — Processa turno de cancelamento
   * =====================================================
   */
  private async handleCancellationTurn(
    conversationId: string,
    salonId: string,
    clientPhone: string,
    _clientName: string | undefined,
    text: string,
    state: ConversationState,
    startTime: number,
  ): Promise<ProcessMessageResult> {
    const normalized = text.toLowerCase().trim();
    const slots = state.cancellationSlots || {};

    // ========== AWAITING_CANCEL_CONFIRM ==========
    if (state.cancellationStep === 'AWAITING_CANCEL_CONFIRM') {
      const positives = ['sim', 's', 'confirmo', 'pode', 'ok', 'beleza', 'certo', 'isso', 'quero'];
      const negatives = ['nao', 'não', 'n', 'desisto', 'deixa', 'esquece', 'mudei de ideia'];

      const isConfirm = positives.some(w => normalized === w || normalized.startsWith(w + ' '));
      const isDecline = negatives.some(w => normalized === w || normalized.startsWith(w + ' '));

      if (isConfirm && slots.appointmentId) {
        // ========== EXECUTA CANCELAMENTO VIA appointmentsService ==========
        // LOGGING AGRESSIVO: Rodrigo pediu para rastrear problemas de persistência
        const cancelStartTime = Date.now();
        this.logger.log(`[ALEXIA_CANCEL_START] appointmentId=${slots.appointmentId} phone=${clientPhone} service=${slots.serviceLabel}`);

        try {
          const cancelled = await this.appointmentsService.cancel(
            slots.appointmentId,
            salonId,
            'ALEXIA_WHATSAPP', // cancelledById
            'Cancelado pelo cliente via WhatsApp (Alexia)',
          );

          const cancelElapsed = Date.now() - cancelStartTime;

          if (!cancelled) {
            // Falha no cancelamento - LOG AGRESSIVO + informa instabilidade
            this.logger.error(`[ALEXIA_CANCEL_FAILED] appointmentId=${slots.appointmentId} phone=${clientPhone} elapsed=${cancelElapsed}ms - appointmentsService.cancel retornou null!`);

            const errorResponse = 'Houve uma instabilidade no sistema. Nossa secretária entrará em contato para confirmar o cancelamento. 😊';

            await this.stateStore.updateState(conversationId, {
              activeSkill: 'NONE',
              cancellationStep: 'NONE',
              cancellationSlots: {},
            });

            await this.saveMessage(conversationId, 'client', text, 'CANCEL', false, false);
            await this.saveMessage(conversationId, 'ai', errorResponse, 'CANCEL', false, false);

            await this.logInteraction(
              salonId, conversationId, clientPhone,
              text, errorResponse, 'CANCEL',
              false, undefined, Date.now() - startTime,
            );

            return {
              response: errorResponse,
              intent: 'CANCEL',
              blocked: false,
              shouldSend: true,
              statusChanged: false,
            };
          }

          this.logger.log(`[ALEXIA_CANCEL_SUCCESS] appointmentId=${slots.appointmentId} newStatus=${cancelled.status} phone=${clientPhone} elapsed=${cancelElapsed}ms`);

          // ========== FLUXO DE RETENÇÃO: Oferece reagendamento ==========
          let response = `Poxa, que pena! 😔 Cancelado com sucesso.

Não quer aproveitar e já deixar reagendado para outro dia? Assim você garante o seu horário!`;

          // Adiciona horários disponíveis se tiver
          if (slots.rescheduleSlots && slots.rescheduleSlots.length > 0) {
            const slotList = slots.rescheduleSlots.map((s, i) => `${i + 1}. ${s.display}`).join('\n');
            response += `

Próximos horários disponíveis para *${slots.serviceLabel}*:
${slotList}

Quer agendar? (sim/não ou digite o número)`;
          } else {
            response += '\n\n(sim/não)';
          }

          // Transiciona para AWAITING_RESCHEDULE
          await this.stateStore.updateState(conversationId, {
            cancellationStep: 'AWAITING_RESCHEDULE',
            cancellationCommittedAt: nowIso(),
          });

          await this.saveMessage(conversationId, 'client', text, 'CANCEL', false, false);
          await this.saveMessage(conversationId, 'ai', response, 'CANCEL', false, false);

          await this.logInteraction(
            salonId, conversationId, clientPhone,
            text, response, 'CANCEL',
            false, undefined, Date.now() - startTime,
          );

          return {
            response,
            intent: 'CANCEL',
            blocked: false,
            shouldSend: true,
            statusChanged: false,
          };
        } catch (error: any) {
          // LOGGING AGRESSIVO: Captura erro completo para diagnóstico
          this.logger.error(`[ALEXIA_CANCEL_EXCEPTION] appointmentId=${slots.appointmentId} phone=${clientPhone} error=${error?.message} stack=${error?.stack}`);

          const errorResponse = 'Houve uma instabilidade no sistema. Nossa secretária entrará em contato para confirmar o cancelamento. 😊';

          await this.stateStore.updateState(conversationId, {
            activeSkill: 'NONE',
            cancellationStep: 'NONE',
            cancellationSlots: {},
          });

          await this.saveMessage(conversationId, 'client', text, 'CANCEL', false, false);
          await this.saveMessage(conversationId, 'ai', errorResponse, 'CANCEL', false, false);

          return {
            response: errorResponse,
            intent: 'CANCEL',
            blocked: false,
            shouldSend: true,
            statusChanged: false,
          };
        }
      }

      if (isDecline) {
        // Cliente desistiu de cancelar
        const response = 'Ótimo! Seu agendamento continua mantido. Até lá! 😊';

        await this.stateStore.updateState(conversationId, {
          activeSkill: 'NONE',
          cancellationStep: 'NONE',
          cancellationSlots: {},
        });

        await this.saveMessage(conversationId, 'client', text, 'CANCEL', false, false);
        await this.saveMessage(conversationId, 'ai', response, 'CANCEL', false, false);

        await this.logInteraction(
          salonId, conversationId, clientPhone,
          text, response, 'CANCEL',
          false, undefined, Date.now() - startTime,
        );

        return {
          response,
          intent: 'CANCEL',
          blocked: false,
          shouldSend: true,
          statusChanged: false,
        };
      }

      // Não entendeu
      const response = 'Desculpa, não entendi. Você quer cancelar o agendamento? (sim/não)';

      await this.saveMessage(conversationId, 'client', text, 'CANCEL', false, false);
      await this.saveMessage(conversationId, 'ai', response, 'CANCEL', false, false);

      return {
        response,
        intent: 'CANCEL',
        blocked: false,
        shouldSend: true,
        statusChanged: false,
      };
    }

    // ========== AWAITING_RESCHEDULE ==========
    if (state.cancellationStep === 'AWAITING_RESCHEDULE') {
      const positives = ['sim', 's', 'quero', 'pode', 'ok', 'beleza', '1', '2'];
      const negatives = ['nao', 'não', 'n', 'depois', 'agora não', 'deixa'];

      const isAccept = positives.some(w => normalized === w || normalized.startsWith(w + ' '));
      const isDecline = negatives.some(w => normalized === w || normalized.startsWith(w + ' '));

      if (isAccept) {
        // Cliente quer reagendar - redireciona para o link de agendamento
        await this.stateStore.updateState(conversationId, {
          activeSkill: 'NONE',
          cancellationStep: 'NONE',
          cancellationSlots: {},
        });

        const response = await this.generateBookingLinkResponse(
          salonId,
          clientPhone,
          slots.serviceLabel ? undefined : undefined, // TODO: passar serviceId se disponível
          slots.serviceLabel,
        );

        await this.saveMessage(conversationId, 'client', text, 'CANCEL', false, false);
        await this.saveMessage(conversationId, 'ai', response, 'CANCEL', false, false);

        await this.logInteraction(
          salonId, conversationId, clientPhone,
          text, response, 'CANCEL',
          false, undefined, Date.now() - startTime,
        );

        return {
          response,
          intent: 'CANCEL',
          blocked: false,
          shouldSend: true,
          statusChanged: false,
        };
      }

      if (isDecline) {
        // Cliente não quer reagendar
        const response = 'Tudo bem! Quando quiser agendar novamente, é só me chamar. 😊';

        await this.stateStore.updateState(conversationId, {
          activeSkill: 'NONE',
          cancellationStep: 'NONE',
          cancellationSlots: {},
        });

        await this.saveMessage(conversationId, 'client', text, 'CANCEL', false, false);
        await this.saveMessage(conversationId, 'ai', response, 'CANCEL', false, false);

        await this.logInteraction(
          salonId, conversationId, clientPhone,
          text, response, 'CANCEL',
          false, undefined, Date.now() - startTime,
        );

        return {
          response,
          intent: 'CANCEL',
          blocked: false,
          shouldSend: true,
          statusChanged: false,
        };
      }

      // Não entendeu - repete
      const response = 'Quer aproveitar e reagendar para outro dia? (sim/não)';

      await this.saveMessage(conversationId, 'client', text, 'CANCEL', false, false);
      await this.saveMessage(conversationId, 'ai', response, 'CANCEL', false, false);

      return {
        response,
        intent: 'CANCEL',
        blocked: false,
        shouldSend: true,
        statusChanged: false,
      };
    }

    // Fallback - reseta state
    await this.stateStore.updateState(conversationId, {
      activeSkill: 'NONE',
      cancellationStep: 'NONE',
      cancellationSlots: {},
    });

    const response = 'Desculpe, perdi o contexto. Como posso ajudar? 😊';

    await this.saveMessage(conversationId, 'client', text, 'CANCEL', false, false);
    await this.saveMessage(conversationId, 'ai', response, 'CANCEL', false, false);

    return {
      response,
      intent: 'CANCEL',
      blocked: false,
      shouldSend: true,
      statusChanged: false,
    };
  }

  /**
   * Busca agendamentos futuros do cliente pelo telefone
   */
  private async findUpcomingAppointmentsByPhone(
    salonId: string,
    clientPhone: string,
  ): Promise<Array<{
    id: string;
    service: string;
    serviceId?: number;
    date: string;
    time: string;
    professionalName?: string;
  }>> {
    const phoneClean = clientPhone.replace(/\D/g, '');
    const phoneVariants = [phoneClean, phoneClean.replace(/^55/, ''), `55${phoneClean.replace(/^55/, '')}`];

    const today = new Date().toISOString().split('T')[0];

    const results = await db
      .select({
        id: appointments.id,
        service: appointments.service,
        serviceId: appointments.serviceId,
        date: appointments.date,
        time: appointments.time,
        clientPhone: appointments.clientPhone,
        professionalId: appointments.professionalId,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.salonId, salonId),
          sql`${appointments.date} >= ${today}`,
          sql`${appointments.status} NOT IN ('CANCELLED', 'COMPLETED', 'NO_SHOW')`,
        ),
      )
      .orderBy(appointments.date, appointments.time)
      .limit(20);

    // Filtra por telefone (variantes)
    const matched = results.filter(apt => {
      const aptPhone = apt.clientPhone?.replace(/\D/g, '') || '';
      return phoneVariants.some(p => aptPhone.includes(p) || p.includes(aptPhone));
    });

    // Busca nomes dos profissionais
    const professionalIds = [...new Set(matched.map(apt => apt.professionalId).filter(Boolean))];
    let professionalMap: Record<string, string> = {};

    if (professionalIds.length > 0) {
      const pros = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(sql`${users.id} IN ${professionalIds}`);
      professionalMap = Object.fromEntries(pros.map(p => [p.id, p.name]));
    }

    return matched.map(apt => ({
      id: apt.id,
      service: apt.service || 'Serviço',
      serviceId: apt.serviceId ?? undefined,
      date: apt.date,
      time: apt.time || '00:00',
      professionalName: apt.professionalId ? professionalMap[apt.professionalId] : undefined,
    }));
  }

  /**
   * Busca próximos N horários disponíveis para um serviço
   */
  private async getNextAvailableSlots(
    salonId: string,
    serviceId: number | undefined,
    count: number,
  ): Promise<Array<{ dateISO: string; time: string; display: string }>> {
    try {
      // Por simplicidade, retorna slots fictícios para amanhã/depois
      // Em produção, integraria com scheduler.getAvailableSlots
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      const slots: Array<{ dateISO: string; time: string; display: string }> = [];

      // Tenta buscar slots reais se tiver serviceId
      if (serviceId) {
        try {
          const realSlots = await this.scheduler.getAvailableSlots(salonId, serviceId, tomorrow);
          if (realSlots.length > 0) {
            const tomorrowDisplay = tomorrow.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            });

            for (let i = 0; i < Math.min(count, realSlots.length); i++) {
              slots.push({
                dateISO: tomorrow.toISOString().split('T')[0],
                time: realSlots[i].time,
                display: `${tomorrowDisplay} às ${realSlots[i].time}`,
              });
            }
            return slots;
          }
        } catch {
          // Ignora erro e usa fallback
        }
      }

      // Fallback: slots genéricos
      const tomorrowDisplay = tomorrow.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      const dayAfterDisplay = dayAfter.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });

      return [
        {
          dateISO: tomorrow.toISOString().split('T')[0],
          time: '14:00',
          display: `${tomorrowDisplay} às 14h`,
        },
        {
          dateISO: dayAfter.toISOString().split('T')[0],
          time: '10:00',
          display: `${dayAfterDisplay} às 10h`,
        },
      ].slice(0, count);
    } catch (error) {
      this.logger.warn(`Erro ao buscar slots disponíveis: ${error}`);
      return [];
    }
  }

  /**
   * =====================================================
   * LIST_SERVICES — Lista serviços do salão via DB (P0.5)
   * =====================================================
   */
  private async handleListServices(
    conversationId: string,
    salonId: string,
    clientPhone: string,
    clientName: string | undefined,
    text: string,
    state: ConversationState,
    startTime: number,
  ): Promise<ProcessMessageResult> {
    const context = await this.dataCollector.collectContext(salonId, clientPhone);
    const services = (context.services || []) as any[];

    let responseText: string;

    if (services.length === 0) {
      responseText = 'No momento não consegui carregar a lista de serviços. Entre em contato diretamente com o salão!';
    } else {
      const list = services
        .filter((s: any) => s.active !== false)
        .slice(0, 10)
        .map((s: any, i: number) => {
          const price = s.price ? ` - R$ ${s.price}` : '';
          const duration = s.durationMinutes ? ` (${s.durationMinutes}min)` : '';
          return `${i + 1}. ${s.name}${price}${duration}`;
        })
        .join('\n');

      responseText = `Nossos serviços:\n\n${list}\n\nQuer agendar algum deles? É só me dizer! 😊`;
    }

    // Compose com greeting policy
    const finalResponse = await this.composer.compose({
      salonId,
      phone: clientPhone,
      clientName,
      intent: 'LIST_SERVICES',
      baseText: responseText,
      skipGreeting: state.userAlreadyGreeted,
    });

    if (!state.userAlreadyGreeted) {
      await this.stateStore.updateState(conversationId, {
        userAlreadyGreeted: true,
        lastGreetingAt: nowIso(),
      });
    }

    // Dedup gate
    const canSend = await this.stateStore.tryRegisterReply(conversationId, finalResponse);
    if (!canSend) {
      this.logger.debug(`DedupGate LIST_SERVICES: suprimido para ${clientPhone}`);
      await this.saveMessage(conversationId, 'client', text, 'LIST_SERVICES', false, false);
      return { response: null, intent: 'LIST_SERVICES', blocked: false, shouldSend: false, statusChanged: false };
    }

    await this.saveMessage(conversationId, 'client', text, 'LIST_SERVICES', false, false);
    await this.saveMessage(conversationId, 'ai', finalResponse, 'LIST_SERVICES', false, false);

    await this.logInteraction(
      salonId, conversationId, clientPhone,
      text, finalResponse, 'LIST_SERVICES',
      false, undefined, Date.now() - startTime,
    );

    return { response: finalResponse, intent: 'LIST_SERVICES', blocked: false, shouldSend: true, statusChanged: false };
  }

  /**
   * =====================================================
   * PACKAGE_QUERY — Consulta sobre pacotes disponíveis
   * MUNDO B: Nunca sugerir produtos (Mundo C)
   * =====================================================
   */
  private async handlePackageQuery(
    conversationId: string,
    salonId: string,
    clientPhone: string,
    text: string,
    startTime: number,
  ): Promise<ProcessMessageResult> {
    try {
      // Classifica o mundo - PACOTES = Mundo B
      const worldClass = classifyWorld('PACKAGE_QUERY', text);
      this.logger.debug(`[PACKAGE_QUERY] Mundo: ${worldClass.world}, Proibidos: ${worldClass.forbiddenWorlds}`);

      // Usa o método do PackageIntelligenceService para buscar e formatar pacotes
      const packageResponse = await this.packageIntelligence.handlePackageQuery(salonId, text);

      // Adiciona confirmação de entendimento
      const confirmation = getConfirmationPrefix('PACKAGE_QUERY', worldClass.world);
      const responseText = confirmation ? `${confirmation}\n\n${packageResponse}` : packageResponse;

      await this.saveMessage(conversationId, 'client', text, 'PACKAGE_QUERY', false, false);
      await this.saveMessage(conversationId, 'ai', responseText, 'PACKAGE_QUERY', false, false);

      await this.logInteraction(
        salonId, conversationId, clientPhone,
        text, responseText, 'PACKAGE_QUERY',
        false, undefined, Date.now() - startTime,
      );

      return {
        response: responseText,
        intent: 'PACKAGE_QUERY',
        blocked: false,
        shouldSend: true,
        statusChanged: false,
        world: 'B',
      };
    } catch (error: any) {
      this.logger.error(`Error in handlePackageQuery: ${error.message}`);

      const fallbackResponse = 'Desculpe, não consegui verificar nossos pacotes no momento. Entre em contato com a recepção! 😊';

      await this.saveMessage(conversationId, 'client', text, 'PACKAGE_QUERY', false, false);
      await this.saveMessage(conversationId, 'ai', fallbackResponse, 'PACKAGE_QUERY', false, false);

      return {
        response: fallbackResponse,
        intent: 'PACKAGE_QUERY',
        blocked: false,
        shouldSend: true,
        statusChanged: false,
        world: 'B',
      };
    }
  }

  /**
   * =====================================================
   * PACKAGE_INFO — Informações sobre pacotes do cliente
   * =====================================================
   */
  private async handlePackageInfo(
    conversationId: string,
    salonId: string,
    clientPhone: string,
    _clientName: string | undefined,
    text: string,
    startTime: number,
  ): Promise<ProcessMessageResult> {
    try {
      // Busca pacotes ativos do cliente pelo telefone
      const activePackages = await this.packageIntelligence.getActivePackagesByPhone(
        salonId,
        clientPhone,
      );

      // Formata resposta
      const responseText = this.packageIntelligence.formatPackageInfoResponse(activePackages);

      await this.saveMessage(conversationId, 'client', text, 'PACKAGE_INFO', false, false);
      await this.saveMessage(conversationId, 'ai', responseText, 'PACKAGE_INFO', false, false);

      await this.logInteraction(
        salonId, conversationId, clientPhone,
        text, responseText, 'PACKAGE_INFO',
        false, undefined, Date.now() - startTime,
      );

      return {
        response: responseText,
        intent: 'PACKAGE_INFO',
        blocked: false,
        shouldSend: true,
        statusChanged: false,
      };
    } catch (error: any) {
      this.logger.error(`Error in handlePackageInfo: ${error.message}`);

      const fallbackResponse = 'Desculpe, não consegui verificar seus pacotes no momento. Entre em contato com a recepção! 😊';

      await this.saveMessage(conversationId, 'client', text, 'PACKAGE_INFO', false, false);
      await this.saveMessage(conversationId, 'ai', fallbackResponse, 'PACKAGE_INFO', false, false);

      return {
        response: fallbackResponse,
        intent: 'PACKAGE_INFO',
        blocked: false,
        shouldSend: true,
        statusChanged: false,
      };
    }
  }

  /**
   * =====================================================
   * PACKAGE_SCHEDULE_ALL — Agendamento em lote de pacote
   * =====================================================
   */
  private async handlePackageScheduleAll(
    conversationId: string,
    salonId: string,
    clientPhone: string,
    _clientName: string | undefined,
    text: string,
    startTime: number,
  ): Promise<ProcessMessageResult> {
    try {
      // Busca pacotes ativos do cliente
      const activePackages = await this.packageIntelligence.getActivePackagesByPhone(
        salonId,
        clientPhone,
      );

      // Filtra pacotes com sessões pendentes para agendar
      const packagesWithPending = activePackages.filter(
        (pkg: { remainingSessions: number; scheduledSessions: number }) => pkg.remainingSessions - pkg.scheduledSessions > 0,
      );

      let responseText: string;

      if (packagesWithPending.length === 0) {
        // Sem pacotes ou sem sessões pendentes
        if (activePackages.length === 0) {
          responseText = `Não encontrei pacotes ativos no seu nome.

Se você adquiriu um pacote recentemente, confirme com a recepção! 😊`;
        } else {
          responseText = `Ótimo! Todas as sessões dos seus pacotes já estão agendadas. ✅

Para verificar suas próximas datas, pergunte "meus agendamentos". 😊`;
        }
      } else {
        // Tem sessões para agendar - por enquanto, direciona para o link de agendamento
        const pkg = packagesWithPending[0];
        const pendingSessions = pkg.remainingSessions - pkg.scheduledSessions;
        const plural = pendingSessions > 1 ? 'sessões' : 'sessão';

        responseText = `Encontrei seu pacote *${pkg.packageName}* com *${pendingSessions} ${plural}* para agendar! 📦

Para agendar suas sessões de forma rápida, acesse nosso sistema de agendamento online.`;

        // Gera link de agendamento
        try {
          const linkResult = await this.onlineBookingSettings.generateAssistedLink({
            salonId,
            clientPhone: clientPhone?.replace(/\D/g, ''),
          });

          responseText += `

🔗 ${linkResult.url}

Você pode agendar uma sessão por vez ou entrar em contato com a recepção para agendar todas de uma vez! 😊`;
        } catch {
          responseText += `

Entre em contato com a recepção para agendar todas as sessões de uma vez! 😊`;
        }
      }

      await this.saveMessage(conversationId, 'client', text, 'PACKAGE_SCHEDULE_ALL', false, false);
      await this.saveMessage(conversationId, 'ai', responseText, 'PACKAGE_SCHEDULE_ALL', false, false);

      await this.logInteraction(
        salonId, conversationId, clientPhone,
        text, responseText, 'PACKAGE_SCHEDULE_ALL',
        false, undefined, Date.now() - startTime,
      );

      return {
        response: responseText,
        intent: 'PACKAGE_SCHEDULE_ALL',
        blocked: false,
        shouldSend: true,
        statusChanged: false,
      };
    } catch (error: any) {
      this.logger.error(`Error in handlePackageScheduleAll: ${error.message}`);

      const fallbackResponse = 'Desculpe, não consegui processar seu pedido de agendamento em lote. Entre em contato com a recepção! 😊';

      await this.saveMessage(conversationId, 'client', text, 'PACKAGE_SCHEDULE_ALL', false, false);
      await this.saveMessage(conversationId, 'ai', fallbackResponse, 'PACKAGE_SCHEDULE_ALL', false, false);

      return {
        response: fallbackResponse,
        intent: 'PACKAGE_SCHEDULE_ALL',
        blocked: false,
        shouldSend: true,
        statusChanged: false,
      };
    }
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

    return { success: true, message: 'Alexia retomou o atendimento' };
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
