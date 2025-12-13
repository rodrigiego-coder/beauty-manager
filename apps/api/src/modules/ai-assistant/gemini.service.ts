import { Injectable, OnModuleInit } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class GeminiService implements OnModuleInit {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  onModuleInit() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY não configurada - IA desabilitada');
      return;
    }
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      });
      console.log('✅ Gemini AI inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar Gemini:', error);
    }
  }

  isEnabled(): boolean {
    return this.model !== null;
  }

  async generateContent(prompt: string): Promise<string> {
    if (!this.model) {
      throw new Error('IA não configurada. Verifique GEMINI_API_KEY no .env');
    }
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      console.error('Erro Gemini generateContent:', error);
      throw new Error(`Falha ao gerar conteúdo: ${error.message || 'Erro desconhecido'}`);
    }
  }

  async chat(
    history: Array<{ role: string; content: string }>,
    message: string,
  ): Promise<string> {
    if (!this.model) {
      throw new Error('IA não configurada. Verifique GEMINI_API_KEY no .env');
    }
    try {
      const chat = this.model.startChat({
        history: history.map((h) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        })),
      });
      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (error: any) {
      console.error('Erro Gemini chat:', error);
      throw new Error(`Falha no chat: ${error.message || 'Erro desconhecido'}`);
    }
  }
}
