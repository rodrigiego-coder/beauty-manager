/**
 * =====================================================
 * AUDIO TRANSCRIPTION SERVICE
 * Transcreve áudios do WhatsApp usando Gemini 2.5 Flash
 * 100% Google - Capacidade Multimodal Nativa
 * Otimizado para baixa latência e português brasileiro
 * =====================================================
 */

import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export interface TranscriptionResult {
  success: boolean;
  text?: string;
  error?: string;
  duration?: number;
  inputTokens?: number;
  costBRL?: number;
}

/**
 * Modelo para transcrição de áudio - Gemini 2.5 Flash (Pago)
 * - Capacidade multimodal nativa para áudio
 * - Baixa latência (~1-2s para áudios curtos)
 * - Excelente compreensão de português brasileiro
 */
const TRANSCRIPTION_MODEL = 'gemini-2.5-flash';

/**
 * Preços Gemini 2.5 Flash (por 1M tokens)
 * Áudio é cobrado como input multimodal
 */
const PRICING = {
  inputPer1M: 0.15,  // $0.15 per 1M input tokens
  audioPer1M: 0.70,  // $0.70 per 1M audio tokens
};

const USD_TO_BRL = 5.80;

@Injectable()
export class AudioTranscriptionService {
  private readonly logger = new Logger(AudioTranscriptionService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  constructor() {
    this.initializeModel();
  }

  /**
   * Inicializa o modelo Gemini 2.5 Flash para transcrição
   */
  private initializeModel(): void {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY não configurada - transcrição de áudio desabilitada');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Usa o modelo do .env se disponível, senão usa o default
      const modelName = process.env.GEMINI_MODEL || TRANSCRIPTION_MODEL;
      this.model = this.genAI.getGenerativeModel({
        model: modelName,
      });
      this.logger.log(`✅ Transcrição de áudio inicializada: modelo=${modelName} (multimodal nativo)`);
    } catch (error: any) {
      this.logger.error('❌ Erro ao inicializar modelo de transcrição:', error?.message);
    }
  }

  /**
   * Transcreve áudio de uma URL usando Gemini 2.5 Flash
   * Otimizado para baixa latência com capacidade multimodal nativa
   * @param audioUrl URL do arquivo de áudio (MP3, OGG, etc.)
   * @returns Resultado da transcrição com custo em Reais
   */
  async transcribeFromUrl(audioUrl: string): Promise<TranscriptionResult> {
    const startTime = Date.now();

    try {
      if (!this.model) {
        this.logger.warn('Modelo de transcrição não disponível');
        return {
          success: false,
          error: 'Transcrição não configurada',
        };
      }

      // 1. Baixa o áudio da URL
      this.logger.debug(`📥 Baixando áudio de: ${audioUrl.substring(0, 50)}...`);

      const audioResponse = await fetch(audioUrl);
      if (!audioResponse.ok) {
        this.logger.error(`❌ Erro ao baixar áudio: HTTP ${audioResponse.status}`);
        return {
          success: false,
          error: 'Erro ao baixar áudio',
        };
      }

      const audioBuffer = await audioResponse.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      const audioSizeKB = Math.round(audioBuffer.byteLength / 1024);

      // Detecta o mimeType pela URL ou usa padrão OGG (WhatsApp)
      let mimeType = 'audio/ogg';
      if (audioUrl.includes('.mp3')) mimeType = 'audio/mp3';
      else if (audioUrl.includes('.wav')) mimeType = 'audio/wav';
      else if (audioUrl.includes('.m4a')) mimeType = 'audio/mp4';
      else if (audioUrl.includes('.opus')) mimeType = 'audio/ogg';

      // 2. Envia para Gemini 2.5 Flash com instrução otimizada
      this.logger.debug(`🎤 Transcrevendo áudio via Gemini 2.5 Flash (${mimeType}, ${audioSizeKB}KB)...`);

      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType,
            data: audioBase64,
          },
        },
        {
          text: `Você é um transcritor de áudio especializado em português brasileiro.
Transcreva EXATAMENTE o que é dito neste áudio.

REGRAS:
- Retorne APENAS o texto transcrito, sem explicações
- Preserve gírias e expressões informais como "oi", "e aí", "beleza"
- Se a pessoa falar nome de serviço de salão (corte, escova, progressiva), mantenha exatamente
- Se não conseguir entender uma palavra, use [...]
- Se o áudio estiver vazio ou inaudível, retorne: [áudio não compreendido]

TRANSCRIÇÃO:`,
        },
      ]);

      const response = result.response;
      const transcribedText = response.text().trim();
      const duration = Date.now() - startTime;

      // Extrai uso de tokens
      const usageMetadata = response.usageMetadata;
      const inputTokens = usageMetadata?.promptTokenCount || 0;
      const outputTokens = usageMetadata?.candidatesTokenCount || 0;

      // Calcula custo (áudio é cobrado como multimodal)
      const costUSD = (inputTokens / 1_000_000) * PRICING.audioPer1M +
                      (outputTokens / 1_000_000) * PRICING.inputPer1M;
      const costBRL = costUSD * USD_TO_BRL;

      // Verifica se a transcrição falhou
      if (transcribedText === '[áudio não compreendido]' || !transcribedText) {
        this.logger.warn(`⚠️ Áudio não compreendido após ${duration}ms`);
        return {
          success: false,
          error: 'Áudio não compreendido',
          duration,
          inputTokens,
          costBRL,
        };
      }

      // Log de sucesso com custo em Reais
      this.logger.log(
        `[TOKEN_USAGE_REPORT] type=audio input=${inputTokens} output=${outputTokens} ` +
        `cost=$${costUSD.toFixed(6)} (R$${costBRL.toFixed(4)}) latency=${duration}ms ` +
        `size=${audioSizeKB}KB`
      );

      this.logger.log(`✅ Áudio transcrito em ${duration}ms: "${transcribedText.substring(0, 50)}..."`);

      return {
        success: true,
        text: transcribedText,
        duration,
        inputTokens,
        costBRL,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ Erro ao transcrever áudio (${duration}ms): ${error?.message || error}`);
      return {
        success: false,
        error: error?.message || 'Erro desconhecido',
        duration,
      };
    }
  }

  /**
   * Transcreve áudio de um buffer (bytes)
   * @param audioBuffer Buffer do arquivo de áudio
   * @param mimeType Tipo MIME do áudio (audio/ogg, audio/mp3, etc.)
   */
  async transcribeFromBuffer(
    audioBuffer: ArrayBuffer,
    mimeType: string = 'audio/ogg',
  ): Promise<TranscriptionResult> {
    const startTime = Date.now();

    try {
      if (!this.model) {
        this.logger.warn('Modelo de transcrição não disponível');
        return {
          success: false,
          error: 'Transcrição não configurada',
        };
      }

      const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      const audioSizeKB = Math.round(audioBuffer.byteLength / 1024);

      this.logger.debug(`🎤 Transcrevendo áudio de buffer (${mimeType}, ${audioSizeKB}KB)...`);

      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType,
            data: audioBase64,
          },
        },
        {
          text: `Você é um transcritor de áudio especializado em português brasileiro.
Transcreva EXATAMENTE o que é dito neste áudio.

REGRAS:
- Retorne APENAS o texto transcrito, sem explicações
- Preserve gírias e expressões informais
- Se não conseguir entender uma palavra, use [...]
- Se o áudio estiver vazio ou inaudível, retorne: [áudio não compreendido]

TRANSCRIÇÃO:`,
        },
      ]);

      const response = result.response;
      const transcribedText = response.text().trim();
      const duration = Date.now() - startTime;

      // Extrai uso de tokens
      const usageMetadata = response.usageMetadata;
      const inputTokens = usageMetadata?.promptTokenCount || 0;
      const outputTokens = usageMetadata?.candidatesTokenCount || 0;

      // Calcula custo
      const costUSD = (inputTokens / 1_000_000) * PRICING.audioPer1M +
                      (outputTokens / 1_000_000) * PRICING.inputPer1M;
      const costBRL = costUSD * USD_TO_BRL;

      if (transcribedText === '[áudio não compreendido]' || !transcribedText) {
        this.logger.warn(`⚠️ Áudio de buffer não compreendido após ${duration}ms`);
        return {
          success: false,
          error: 'Áudio não compreendido',
          duration,
          inputTokens,
          costBRL,
        };
      }

      this.logger.log(
        `[TOKEN_USAGE_REPORT] type=audio input=${inputTokens} output=${outputTokens} ` +
        `cost=$${costUSD.toFixed(6)} (R$${costBRL.toFixed(4)}) latency=${duration}ms`
      );

      return {
        success: true,
        text: transcribedText,
        duration,
        inputTokens,
        costBRL,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ Erro ao transcrever áudio de buffer (${duration}ms): ${error?.message || error}`);
      return {
        success: false,
        error: error?.message || 'Erro desconhecido',
        duration,
      };
    }
  }

  /**
   * Verifica se o serviço de transcrição está disponível
   */
  isAvailable(): boolean {
    return !!this.model;
  }

  /**
   * Mensagem de fallback quando não consegue transcrever
   */
  getAudioErrorResponse(): string {
    return 'Poxa, não consegui ouvir seu áudio agora, consegue escrever para mim? 😊';
  }
}
