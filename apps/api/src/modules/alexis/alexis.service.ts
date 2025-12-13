import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../database/connection';
import {
  aiSettings,
  aiConversations,
  aiMessages,
  aiInteractionLogs,
  aiBlockedTermsLog,
  aiBriefings,
} from '../../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { GeminiService } from './gemini.service';
import { ContentFilterService } from './content-filter.service';
import { IntentClassifierService } from './intent-classifier.service';
import { AlexisSchedulerService } from './scheduler.service';
import { DataCollectorService } from './data-collector.service';
import { COMMAND_RESPONSES } from './constants/forbidden-terms';

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

  constructor(
    private readonly gemini: GeminiService,
    private readonly contentFilter: ContentFilterService,
    private readonly intentClassifier: IntentClassifierService,
    private readonly scheduler: AlexisSchedulerService,
    private readonly dataCollector: DataCollectorService,
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
    let conversation = await this.getOrCreateConversation(salonId, clientPhone, clientName);

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

    // Classifica intenção
    const intent = this.intentClassifier.classify(message);

    // ========== CAMADA 1: FILTRO DE ENTRADA ==========
    const inputFilter = this.contentFilter.filterInput(message);

    if (!inputFilter.allowed) {
      // Log de termos bloqueados
      await db.insert(aiBlockedTermsLog).values({
        salonId,
        conversationId: conversation.id,
        originalMessage: message,
        blockedTerms: inputFilter.blockedTerms,
        layer: 'INPUT',
      });

      const blockedResponse = this.contentFilter.getBlockedResponse();

      await this.saveMessage(conversation.id, 'client', message, intent, true, false, 'INPUT_BLOCKED');
      await this.saveMessage(conversation.id, 'ai', blockedResponse, intent, false, false);

      await this.logInteraction(
        salonId,
        conversation.id,
        clientPhone,
        message,
        blockedResponse,
        intent,
        true,
        'INPUT',
        Date.now() - startTime,
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
    let aiResponse: string;

    try {
      // Tratamento especial para agendamento
      if (intent === 'SCHEDULE') {
        aiResponse = await this.handleSchedulingIntent(salonId, clientPhone, message, context);
      } else {
        aiResponse = await this.gemini.generateResponse(
          context.salon?.name || 'Salão',
          message,
          context,
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

    const finalResponse = outputFilter.filtered;

    // Salva mensagens
    await this.saveMessage(conversation.id, 'client', message, intent, false, false);
    await this.saveMessage(
      conversation.id,
      'ai',
      finalResponse,
      intent,
      !outputFilter.safe,
      false,
      !outputFilter.safe ? 'OUTPUT_BLOCKED' : undefined,
    );

    await this.logInteraction(
      salonId,
      conversation.id,
      clientPhone,
      message,
      finalResponse,
      intent,
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

    // Verifica se o cliente mencionou algum serviço
    const mentionedService = services.find((s: any) =>
      message.toLowerCase().includes(s.name.toLowerCase()),
    );

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
   * GESTÃO DE CONVERSAS
   * =====================================================
   */

  private async getOrCreateConversation(
    salonId: string,
    clientPhone: string,
    clientName?: string,
  ) {
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

    if (existing) {
      return existing;
    }

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
    const [settings] = await db
      .select()
      .from(aiSettings)
      .where(eq(aiSettings.salonId, salonId))
      .limit(1);

    if (!settings) {
      // Cria configurações padrão
      const [newSettings] = await db.insert(aiSettings).values({ salonId }).returning();
      return newSettings;
    }

    return settings;
  }

  async updateSettings(salonId: string, updates: Partial<typeof aiSettings.$inferInsert>) {
    const [existing] = await db
      .select()
      .from(aiSettings)
      .where(eq(aiSettings.salonId, salonId))
      .limit(1);

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

    return db
      .select()
      .from(aiConversations)
      .where(whereCondition)
      .orderBy(desc(aiConversations.lastMessageAt))
      .limit(50);
  }

  async getMessages(conversationId: string) {
    return db
      .select()
      .from(aiMessages)
      .where(eq(aiMessages.conversationId, conversationId))
      .orderBy(aiMessages.createdAt);
  }

  /**
   * =====================================================
   * BRIEFING DO DASHBOARD
   * =====================================================
   */

  async generateBriefing(
    salonId: string,
    userId: string,
    userRole: string,
    userName: string,
  ): Promise<string> {
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
    return db
      .select()
      .from(aiInteractionLogs)
      .where(eq(aiInteractionLogs.salonId, salonId))
      .orderBy(desc(aiInteractionLogs.createdAt))
      .limit(limit);
  }

  async getBlockedTermsLogs(salonId: string, limit = 100) {
    return db
      .select()
      .from(aiBlockedTermsLog)
      .where(eq(aiBlockedTermsLog.salonId, salonId))
      .orderBy(desc(aiBlockedTermsLog.createdAt))
      .limit(limit);
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

  /**
   * Lista sessões de conversa do salão
   */
  async getSessions(salonId: string) {
    return db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.salonId, salonId))
      .orderBy(desc(aiConversations.updatedAt))
      .limit(100);
  }

  /**
   * Obtém mensagens de uma sessão
   */
  async getSessionMessages(salonId: string, sessionId: string) {
    // Verifica se a sessão pertence ao salão
    const session = await db
      .select()
      .from(aiConversations)
      .where(and(eq(aiConversations.id, sessionId), eq(aiConversations.salonId, salonId)))
      .limit(1);

    if (!session.length) {
      return [];
    }

    return db
      .select()
      .from(aiMessages)
      .where(eq(aiMessages.conversationId, sessionId))
      .orderBy(aiMessages.createdAt);
  }

  /**
   * Encerra uma sessão de conversa
   */
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

  /**
   * Estatísticas de compliance ANVISA
   */
  async getComplianceStats(salonId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

  /**
   * Métricas de uso da Alexis
   */
  async getMetrics(salonId: string) {
    // Total de conversas
    const conversations = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(aiConversations)
      .where(eq(aiConversations.salonId, salonId));

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

  /**
   * Atendente assume controle da conversa
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

  /**
   * Alexis retoma controle da conversa
   */
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

  /**
   * Envia mensagem como humano
   */
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
    await db
      .update(aiConversations)
      .set({ updatedAt: new Date() })
      .where(eq(aiConversations.id, sessionId));

    return { success: true, message: 'Mensagem enviada' };
  }

  /**
   * Deleta histórico do chat do dashboard
   */
  async deleteDashboardChatHistory(userId: string) {
    // Busca conversas do dashboard deste usuário
    const conversations = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.clientPhone, `dashboard-${userId}`));

    // Deleta mensagens das conversas
    for (const conv of conversations) {
      await db.delete(aiMessages).where(eq(aiMessages.conversationId, conv.id));
    }

    // Deleta as conversas
    await db.delete(aiConversations).where(eq(aiConversations.clientPhone, `dashboard-${userId}`));

    return { success: true, message: 'Histórico deletado' };
  }
}
