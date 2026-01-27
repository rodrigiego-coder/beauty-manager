import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ALEXIS_SYSTEM_PROMPT } from './constants/forbidden-terms';

/**
 * =====================================================
 * GEMINI SERVICE
 * Integração com Google Gemini API
 * =====================================================
 */

/** Turno de conversa para memória contextual */
export interface ConversationTurn {
  role: 'client' | 'ai';
  content: string;
}

/** Limite de turnos carregados (configurável sem .env) */
export const CONVERSATION_HISTORY_LIMIT = 8;

/** Tamanho máximo por mensagem no histórico (chars) */
export const MESSAGE_TRUNCATE_LENGTH = 600;

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  async onModuleInit() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY não configurada - Alexis operará em modo limitado');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      });
      this.logger.log('Gemini API inicializada com sucesso');
    } catch (error) {
      this.logger.error('Erro ao inicializar Gemini API:', error);
    }
  }

  /**
   * Verifica se o serviço está disponível
   */
  isAvailable(): boolean {
    return !!this.model;
  }

  /**
   * Gera resposta usando o Gemini
   * @param salonName Nome do salão para personalização
   * @param userMessage Mensagem do usuário
   * @param context Contexto do salão (serviços, produtos, etc)
   * @param history Turnos recentes da conversa (opcional)
   */
  async generateResponse(
    salonName: string,
    userMessage: string,
    context: Record<string, any>,
    history: ConversationTurn[] = [],
  ): Promise<string> {
    if (!this.model) {
      return this.getFallbackResponse();
    }

    try {
      const systemPrompt = ALEXIS_SYSTEM_PROMPT(salonName);
      const historyBlock = this.formatHistory(history);

      const fullPrompt = `${systemPrompt}

CONTEXTO DO SISTEMA (produtos, serviços e dados do salão):
${JSON.stringify(context, null, 2)}
${historyBlock}
MENSAGEM DO CLIENTE:
${userMessage}

Responda de forma educada, profissional e segura. Lembre-se:
- NUNCA use termos proibidos pela ANVISA
- NUNCA prometa resultados
- SOMENTE indique produtos/serviços que estão listados no CONTEXTO acima
- Mantenha a resposta curta e objetiva (máximo 3 parágrafos)
- Considere o HISTÓRICO RECENTE acima para manter coerência na conversa`;

      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      this.logger.error('Erro ao gerar resposta Gemini:', error?.message || error);
      return this.getFallbackResponse();
    }
  }

  /**
   * Formata histórico de conversa para inclusão no prompt
   */
  formatHistory(history: ConversationTurn[]): string {
    if (!history || history.length === 0) return '';

    const lines = history.map((turn) => {
      const label = turn.role === 'client' ? '[cliente]' : '[assistente]';
      const truncated = turn.content.length > MESSAGE_TRUNCATE_LENGTH
        ? turn.content.slice(0, MESSAGE_TRUNCATE_LENGTH) + '...'
        : turn.content;
      return `${label} ${truncated}`;
    });

    return `\nHISTÓRICO RECENTE (últimos ${history.length} turnos):\n${lines.join('\n')}\n`;
  }

  /**
   * Gera briefing para o dashboard
   */
  async generateBriefing(
    userName: string,
    userRole: string,
    data: Record<string, any>,
  ): Promise<string> {
    if (!this.model) {
      return this.getDefaultBriefing(userName, userRole);
    }

    try {
      let prompt = '';

      if (userRole === 'OWNER') {
        prompt = `Gere um briefing amigável e curto para ${userName}, dono do salão.
Dados do dia: Faturamento R$ ${data.todayRevenue || 0}, ${data.todayAppointments || 0} agendamentos, ${data.unconfirmedAppointments || 0} para confirmar, ${data.lowStockProducts?.length || 0} produtos com estoque baixo.
Inclua: saudação, resumo executivo, alertas importantes se houver, 1-2 dicas práticas.
Use emojis com moderação. Seja conciso (máximo 150 palavras).`;
      } else if (userRole === 'MANAGER') {
        prompt = `Gere um briefing de tarefas para ${userName}, gerente do salão.
${data.unconfirmedAppointments || 0} agendamentos para confirmar, ${data.lowStockProducts?.length || 0} produtos para repor.
Seja objetivo e liste as prioridades do dia.`;
      } else if (userRole === 'RECEPTIONIST') {
        prompt = `Gere um resumo do dia para ${userName}, recepcionista.
${data.todayAppointments?.length || 0} agendamentos hoje.
Liste os próximos clientes e horários de forma clara.`;
      } else {
        prompt = `Gere um resumo para ${userName}, profissional do salão.
${data.myAppointmentsToday?.length || 0} clientes agendados hoje.
Liste os horários e serviços de forma clara.`;
      }

      const fullPrompt = `Você é Alexis, assistente do salão. ${prompt}
Dados completos: ${JSON.stringify(data)}`;

      const result = await this.model.generateContent(fullPrompt);
      return result.response.text();
    } catch (error: any) {
      this.logger.error('Erro ao gerar briefing:', error?.message || error);
      return this.getDefaultBriefing(userName, userRole);
    }
  }

  /**
   * Resposta de fallback quando a IA não está disponível
   * CHARLIE: Atualizado para mencionar produtos/ativos/modo de uso (sem emojis)
   */
  private getFallbackResponse(): string {
    const fallbacks = [
      'Ola! Posso ajudar com informacoes sobre nossos servicos, agendamentos, precos ou produtos. Pode perguntar sobre ativos, beneficios ou modo de uso tambem.',
      'Estou aqui para ajudar! Voce pode perguntar sobre servicos, precos, agendamentos ou tirar duvidas sobre produtos e como usa-los.',
      'Desculpe, estou com uma instabilidade no momento. Por favor, tente novamente em alguns segundos!',
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /**
   * Briefing padrão quando a IA não está disponível
   */
  private getDefaultBriefing(userName: string, _userRole: string): string {
    const hour = new Date().getHours();
    let greeting = 'Bom dia';

    if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
    else if (hour >= 18) greeting = 'Boa noite';

    return `${greeting}, ${userName}! 😊\n\nSeu briefing do dia está sendo preparado. Verifique a agenda e as notificações para mais detalhes.`;
  }
}
