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
export declare class AiReceptionistController {
    private readonly aiService;
    constructor(aiService: AiReceptionistService);
    /**
     * POST /ai/message
     * Processa mensagem com Human Handoff
     * Use este endpoint para integracao com WhatsApp
     */
    processMessage(body: MessageRequestDto): Promise<MessageResponseDto>;
    /**
     * POST /ai/chat
     * Envia uma mensagem para a recepcionista virtual (sem Human Handoff)
     */
    chat(body: ChatRequestDto): Promise<ChatResponseDto>;
    /**
     * DELETE /ai/session/:sessionId
     * Limpa o historico de uma conversa
     */
    clearSession(sessionId: string): {
        message: string;
    };
}
export {};
//# sourceMappingURL=ai-receptionist.controller.d.ts.map