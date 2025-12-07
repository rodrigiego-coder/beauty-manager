import { Controller, Post, Body, Delete, Param } from '@nestjs/common';
import { AiReceptionistService } from './ai-receptionist.service';

interface ChatRequestDto {
  message: string;
  sessionId?: string;
}

interface MessageRequestDto {
  phone: string;
  message: string;
}

interface ChatResponseDto {
  response: string;
  sessionId: string;
  toolCalls?: unknown[];
}

interface MessageResponseDto {
  response: string | null;
  aiActive: boolean;
  toolCalls?: unknown[];
}

@Controller('ai')
export class AiReceptionistController {
  constructor(private readonly aiService: AiReceptionistService) {}

  /**
   * POST /ai/message
   * Processa mensagem com Human Handoff
   * Use este endpoint para integracao com WhatsApp
   */
  @Post('message')
  async processMessage(@Body() body: MessageRequestDto): Promise<MessageResponseDto> {
    const result = await this.aiService.processMessage(body.phone, body.message);

    return {
      response: result.response,
      aiActive: result.aiActive,
      toolCalls: result.toolCalls,
    };
  }

  /**
   * POST /ai/chat
   * Envia uma mensagem para a recepcionista virtual (sem Human Handoff)
   */
  @Post('chat')
  async chat(@Body() body: ChatRequestDto): Promise<ChatResponseDto> {
    const sessionId = body.sessionId || `session_${Date.now()}`;

    const result = await this.aiService.chat(body.message, sessionId);

    return {
      response: result.response,
      sessionId,
      toolCalls: result.toolCalls,
    };
  }

  /**
   * DELETE /ai/session/:sessionId
   * Limpa o historico de uma conversa
   */
  @Delete('session/:sessionId')
  clearSession(@Param('sessionId') sessionId: string) {
    this.aiService.clearHistory(sessionId);
    return { message: 'Sessao encerrada com sucesso' };
  }
}
