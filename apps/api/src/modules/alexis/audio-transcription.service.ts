/**
 * =====================================================
 * AUDIO TRANSCRIPTION SERVICE
 * Transcreve áudios do WhatsApp usando Gemini 2.0 Flash
 * (Migrado de OpenAI Whisper para simplificar dependências)
 * =====================================================
 */

import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export interface TranscriptionResult {
  success: boolean;
  text?: string;
  error?: string;
  duration?: number;
}

/** Modelo para transcrição de áudio - Gemini 2.0 Flash suporta áudio nativo */
const TRANSCRIPTION_MODEL = 'gemini-2.0-flash';

@Injectable()
export class AudioTranscriptionService {
  private readonly logger = new Logger(AudioTranscriptionService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  constructor() {
    this.initializeModel();
  }

  /**
   * Inicializa o modelo Gemini para transcrição
   */
  private initializeModel(): void {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY não configurada - transcrição de áudio desabilitada');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: TRANSCRIPTION_MODEL,
      });
      this.logger.log(`✅ Transcrição de áudio inicializada: modelo=${TRANSCRIPTION_MODEL}`);
    } catch (error: any) {
      this.logger.error('❌ Erro ao inicializar modelo de transcrição:', error?.message);
    }
  }

  /**
   * Transcreve áudio de uma URL usando Gemini 2.0 Flash
   * @param audioUrl URL do arquivo de áudio (MP3, OGG, etc.)
   * @returns Resultado da transcrição
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
      this.logger.debug(`Baixando áudio de: ${audioUrl.substring(0, 50)}...`);

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

      // Detecta o mimeType pela URL ou usa padrão OGG (WhatsApp)
      let mimeType = 'audio/ogg';
      if (audioUrl.includes('.mp3')) mimeType = 'audio/mp3';
      else if (audioUrl.includes('.wav')) mimeType = 'audio/wav';
      else if (audioUrl.includes('.m4a')) mimeType = 'audio/mp4';

      // 2. Envia para Gemini com instrução de transcrição
      this.logger.debug(`Transcrevendo áudio via Gemini (${mimeType})...`);

      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType,
            data: audioBase64,
          },
        },
        {
          text: `Transcreva EXATAMENTE o que é dito neste áudio em português brasileiro.
Retorne APENAS o texto transcrito, sem comentários, formatação ou explicações.
Se não conseguir entender algo, use [...] para indicar.
Se o áudio estiver vazio ou inaudível, retorne: [áudio não compreendido]`,
        },
      ]);

      const response = result.response;
      const transcribedText = response.text().trim();
      const duration = Date.now() - startTime;

      // Verifica se a transcrição falhou
      if (transcribedText === '[áudio não compreendido]' || !transcribedText) {
        this.logger.warn(`Áudio não compreendido após ${duration}ms`);
        return {
          success: false,
          error: 'Áudio não compreendido',
          duration,
        };
      }

      this.logger.log(`✅ Áudio transcrito em ${duration}ms: "${transcribedText.substring(0, 50)}..."`);

      return {
        success: true,
        text: transcribedText,
        duration,
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

      this.logger.debug(`Transcrevendo áudio de buffer (${mimeType})...`);

      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType,
            data: audioBase64,
          },
        },
        {
          text: `Transcreva EXATAMENTE o que é dito neste áudio em português brasileiro.
Retorne APENAS o texto transcrito, sem comentários, formatação ou explicações.
Se não conseguir entender algo, use [...] para indicar.
Se o áudio estiver vazio ou inaudível, retorne: [áudio não compreendido]`,
        },
      ]);

      const response = result.response;
      const transcribedText = response.text().trim();
      const duration = Date.now() - startTime;

      if (transcribedText === '[áudio não compreendido]' || !transcribedText) {
        this.logger.warn(`Áudio de buffer não compreendido após ${duration}ms`);
        return {
          success: false,
          error: 'Áudio não compreendido',
          duration,
        };
      }

      this.logger.log(`✅ Áudio de buffer transcrito em ${duration}ms`);

      return {
        success: true,
        text: transcribedText,
        duration,
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
