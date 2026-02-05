import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ALEXIS_SYSTEM_PROMPT } from './constants/forbidden-terms';
import { db } from '../../database/connection';
import { aiUsageLogs } from '../../database/schema';

/**
 * =====================================================
 * GEMINI SERVICE
 * Integração com Google Gemini 2.5 Flash API
 * 100% Google - Sem OpenAI
 * Inclui tracking de tokens para relatório de custos
 * =====================================================
 */

/** Turno de conversa para memória contextual */
export interface ConversationTurn {
  role: 'client' | 'ai';
  content: string;
}

/** Resultado de transcrição de áudio nativa */
export interface AudioTranscriptionResult {
  success: boolean;
  text?: string;
  error?: string;
}

/** Estatísticas de uso de tokens */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/** Limite de turnos carregados (configurável sem .env) */
export const CONVERSATION_HISTORY_LIMIT = 8;

/** Tamanho máximo por mensagem no histórico (chars) */
export const MESSAGE_TRUNCATE_LENGTH = 600;

/**
 * Modelo padrão - Gemini 2.5 Flash (Pago - Pay-as-you-go)
 * Configurado para conta paga do Rodrigo
 * - Melhor compreensão de contexto
 * - Áudio multimodal nativo
 * - Sem limites de rate (apenas custo)
 */
const DEFAULT_MODEL = 'gemini-2.5-flash';

/**
 * Preços por 1M tokens (USD) - Gemini 2.5 Flash
 * Fonte: https://ai.google.dev/pricing
 */
const PRICING = {
  inputPer1M: 0.15,   // $0.15 per 1M input tokens
  outputPer1M: 0.60,  // $0.60 per 1M output tokens
  audioPer1M: 0.70,   // $0.70 per 1M audio tokens (estimativa)
};

/** Cotação USD/BRL para relatórios */
const USD_TO_BRL = 5.80;

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private modelName: string = DEFAULT_MODEL;

  // Contadores de uso (resetados semanalmente pelo job)
  private usageStats = {
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalAudioTokens: 0,
    requestCount: 0,
    audioRequestCount: 0,
    lastReset: new Date(),
  };

  async onModuleInit() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY não configurada - Alexia operará em modo limitado');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;
      this.model = this.genAI.getGenerativeModel({
        model: this.modelName,
      });
      this.logger.log(`✅ Gemini API inicializada: modelo=${this.modelName}`);
      this.logger.log(`💰 Preços: Input=$${PRICING.inputPer1M}/1M, Output=$${PRICING.outputPer1M}/1M tokens`);
    } catch (error) {
      this.logger.error('❌ Erro ao inicializar Gemini API:', error);
    }
  }

  /**
   * Verifica se o serviço está disponível
   */
  isAvailable(): boolean {
    return !!this.model;
  }

  /**
   * Retorna o nome do modelo atual
   */
  getModelName(): string {
    return this.modelName;
  }

  /**
   * Gera resposta usando o Gemini com tracking de tokens
   * @param salonName Nome do salão para personalização
   * @param userMessage Mensagem do usuário
   * @param context Contexto do salão (serviços, produtos, etc)
   * @param history Turnos recentes da conversa (opcional)
   * @param salonId ID do salão para logging
   */
  async generateResponse(
    salonName: string,
    userMessage: string,
    context: Record<string, any>,
    history: ConversationTurn[] = [],
    salonId?: string,
  ): Promise<string> {
    if (!this.model) {
      return this.getFallbackResponse();
    }

    const startTime = Date.now();

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
- Considere o HISTÓRICO RECENTE acima para manter coerência na conversa
- Se o cliente perguntar sobre agendamentos, use SOMENTE os dados de "clientAppointments" do CONTEXTO
- Se um agendamento aparece como "CANCELLED" no contexto, informe que foi cancelado
- NUNCA invente agendamentos - use apenas os dados do CONTEXTO`;

      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      const responseText = response.text();

      // Tracking de tokens
      const usage = this.extractTokenUsage(result);
      await this.logUsage(salonId, 'text', usage, Date.now() - startTime);

      return responseText;
    } catch (error: any) {
      this.logger.error('Erro ao gerar resposta Gemini:', error?.message || error);
      return this.getFallbackResponse();
    }
  }

  /**
   * Extrai informações de uso de tokens da resposta
   */
  private extractTokenUsage(result: any): TokenUsage {
    try {
      const usageMetadata = result.response?.usageMetadata;
      if (usageMetadata) {
        return {
          inputTokens: usageMetadata.promptTokenCount || 0,
          outputTokens: usageMetadata.candidatesTokenCount || 0,
          totalTokens: usageMetadata.totalTokenCount || 0,
        };
      }
    } catch {
      // Fallback: estimativa baseada em caracteres
    }

    // Estimativa: ~4 caracteres por token
    return {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    };
  }

  /**
   * Loga uso de tokens para relatório de custos
   */
  private async logUsage(
    salonId: string | undefined,
    type: 'text' | 'audio',
    usage: TokenUsage,
    latencyMs: number,
  ): Promise<void> {
    // Atualiza contadores em memória
    this.usageStats.totalInputTokens += usage.inputTokens;
    this.usageStats.totalOutputTokens += usage.outputTokens;
    this.usageStats.requestCount++;

    if (type === 'audio') {
      this.usageStats.audioRequestCount++;
      this.usageStats.totalAudioTokens += usage.inputTokens;
    }

    // Calcula custo estimado
    const costUSD = this.calculateCost(usage.inputTokens, usage.outputTokens);
    const costBRL = costUSD * USD_TO_BRL;

    // Log detalhado com custo em Reais
    this.logger.log(
      `[TOKEN_USAGE_REPORT] type=${type} input=${usage.inputTokens} output=${usage.outputTokens} ` +
      `cost=$${costUSD.toFixed(6)} (R$${costBRL.toFixed(4)}) latency=${latencyMs}ms`
    );

    // Persiste no banco se tiver salonId
    if (salonId) {
      try {
        await db.insert(aiUsageLogs).values({
          salonId,
          model: this.modelName,
          requestType: type,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          costUsd: costUSD.toFixed(8),
          latencyMs,
        });
      } catch (error: any) {
        // Não falha a requisição por erro de log
        this.logger.debug(`Erro ao persistir usage log: ${error?.message}`);
      }
    }
  }

  /**
   * Calcula custo em USD
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1_000_000) * PRICING.inputPer1M;
    const outputCost = (outputTokens / 1_000_000) * PRICING.outputPer1M;
    return inputCost + outputCost;
  }

  /**
   * Retorna estatísticas de uso atuais
   */
  getUsageStats(): typeof this.usageStats & { estimatedCostUSD: number } {
    const estimatedCostUSD = this.calculateCost(
      this.usageStats.totalInputTokens,
      this.usageStats.totalOutputTokens,
    );

    return {
      ...this.usageStats,
      estimatedCostUSD,
    };
  }

  /**
   * Reseta contadores de uso (chamado pelo job semanal)
   */
  resetUsageStats(): void {
    const oldStats = { ...this.usageStats };

    this.logger.log(
      `[GEMINI_WEEKLY_RESET] requests=${oldStats.requestCount} ` +
      `input=${oldStats.totalInputTokens} output=${oldStats.totalOutputTokens} ` +
      `cost=$${this.calculateCost(oldStats.totalInputTokens, oldStats.totalOutputTokens).toFixed(4)}`
    );

    this.usageStats = {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalAudioTokens: 0,
      requestCount: 0,
      audioRequestCount: 0,
      lastReset: new Date(),
    };
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
    salonId?: string,
  ): Promise<string> {
    if (!this.model) {
      return this.getDefaultBriefing(userName, userRole);
    }

    const startTime = Date.now();

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

      const fullPrompt = `Você é Alexia, assistente do salão. ${prompt}
Dados completos: ${JSON.stringify(data)}`;

      const result = await this.model.generateContent(fullPrompt);
      const responseText = result.response.text();

      // Tracking de tokens
      const usage = this.extractTokenUsage(result);
      await this.logUsage(salonId, 'text', usage, Date.now() - startTime);

      return responseText;
    } catch (error: any) {
      this.logger.error('Erro ao gerar briefing:', error?.message || error);
      return this.getDefaultBriefing(userName, userRole);
    }
  }

  /**
   * Resposta de fallback premium quando a IA não está disponível.
   * P0.4: Nunca expor "instabilidade" ao cliente — sempre oferecer ajuda concreta.
   */
  getFallbackResponse(): string {
    const fallbacks = [
      'Oi! Posso ajudar com agendamento, valores ou tirar dúvidas sobre nossos serviços. O que você precisa?',
      'Estou aqui para ajudar! Posso ver preços, agendar horários ou tirar dúvidas sobre serviços e produtos.',
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
