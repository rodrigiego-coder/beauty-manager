import { ConfigService } from '@nestjs/config';
import { ClientsService } from '../clients';
import { AppointmentsService } from '../appointments';
interface ProcessMessageResult {
    response: string | null;
    aiActive: boolean;
    toolCalls?: unknown[];
}
export declare class AiReceptionistService {
    private configService;
    private clientsService;
    private appointmentsService;
    private genAI;
    private chatSessions;
    private readonly SYSTEM_PROMPT;
    constructor(configService: ConfigService, clientsService: ClientsService, appointmentsService: AppointmentsService);
    /**
     * Processa uma mensagem com logica de Human Handoff
     * @param phone Telefone do cliente
     * @param text Mensagem recebida
     */
    processMessage(phone: string, text: string): Promise<ProcessMessageResult>;
    /**
     * Obtem ou cria uma sessao de chat
     */
    private getChatSession;
    /**
     * Processa a mensagem do usuario e retorna a resposta da IA
     */
    chat(message: string, sessionId?: string): Promise<{
        response: string;
        toolCalls?: unknown[];
    }>;
    /**
     * Executa uma funcao baseada no nome e argumentos
     */
    private executeFunction;
    /**
     * Mock: Verifica disponibilidade de horarios
     */
    private checkAvailability;
    /**
     * Mock: Agenda um horario
     */
    private bookAppointment;
    /**
     * Mock: Retorna lista de servicos
     */
    private getServices;
    /**
     * Verifica produtos com estoque baixo
     */
    private checkLowStock;
    /**
     * Calcula KPIs do negócio
     */
    private calculateKPIs;
    /**
     * Busca histórico completo do cliente
     */
    private getClientHistory;
    /**
     * Limpa o historico de conversa de uma sessao
     */
    clearHistory(sessionId?: string): void;
}
export {};
//# sourceMappingURL=ai-receptionist.service.d.ts.map