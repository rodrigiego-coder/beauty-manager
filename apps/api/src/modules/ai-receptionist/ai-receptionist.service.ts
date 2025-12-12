import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  ChatSession,
  FunctionCallingMode,
} from '@google/generative-ai';
import { ClientsService } from '../clients';
import { AppointmentsService } from '../appointments';
import { GEMINI_TOOLS, MOCK_DATA } from './ai-receptionist.tools';

// Comandos de controle Human Handoff
const COMMANDS = {
  PAUSE: '#pare',
  RESUME: '#voltar',
} as const;

interface ProcessMessageResult {
  response: string | null;
  aiActive: boolean;
  toolCalls?: unknown[];
}

@Injectable()
export class AiReceptionistService {
  private genAI: GoogleGenerativeAI;
  private chatSessions: Map<string, ChatSession> = new Map();

  private readonly SYSTEM_PROMPT = `Voce e a Sofia, recepcionista virtual do salao de beleza "Beauty Manager".

Sua personalidade:
- Simpatica, educada e profissional
- Responde sempre em Portugues do Brasil
- Usa emojis ocasionalmente para ser mais amigavel
- E objetiva mas acolhedora

Suas responsabilidades:
- Informar horarios disponiveis
- Agendar horarios para clientes
- Informar sobre servicos e precos
- Tirar duvidas sobre o salao

Regras importantes:
- Sempre use as ferramentas disponiveis para consultar informacoes reais
- Nunca invente horarios ou precos sem consultar as ferramentas
- Se o cliente disser "amanha", calcule a data correta baseado na data atual
- Sempre confirme os dados antes de finalizar um agendamento
- Data de hoje: ${new Date().toLocaleDateString('pt-BR')}`;

  constructor(
    private configService: ConfigService,
    private clientsService: ClientsService,
    private appointmentsService: AppointmentsService,
  ) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get<string>('GEMINI_API_KEY') || '',
    );
  }

  /**
   * Processa uma mensagem com logica de Human Handoff
   * @param phone Telefone do cliente
   * @param text Mensagem recebida
   */
  async processMessage(
    phone: string,
    text: string,
  ): Promise<ProcessMessageResult> {
    const normalizedText = text.trim().toLowerCase();

    // 1. Verifica comando #pare (pausa IA)
    if (normalizedText === COMMANDS.PAUSE) {
      await this.clientsService.setAiActive(phone, false);
      this.clearHistory(phone); // Limpa sessao ao pausar
      return {
        response: '🛑 IA Pausada. Um atendente humano ira continuar a conversa.',
        aiActive: false,
      };
    }

    // 2. Verifica comando #voltar (reativa IA)
    if (normalizedText === COMMANDS.RESUME) {
      await this.clientsService.setAiActive(phone, true);
      return {
        response: '🤖 IA Ativa. Ola! Sou a Sofia, como posso ajudar?',
        aiActive: true,
      };
    }

    // 3. Verifica se IA esta ativa para este cliente
    const isActive = await this.clientsService.isAiActive(phone);
    if (!isActive) {
      // IA pausada - nao responde (humano assume)
      return {
        response: null,
        aiActive: false,
      };
    }

    // 4. IA ativa - processa com Gemini
    const result = await this.chat(text, phone);

    return {
      response: result.response,
      aiActive: true,
      toolCalls: result.toolCalls,
    };
  }

  /**
   * Obtem ou cria uma sessao de chat
   */
  private getChatSession(sessionId: string): ChatSession {
    if (!this.chatSessions.has(sessionId)) {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: this.SYSTEM_PROMPT,
        tools: [{ functionDeclarations: GEMINI_TOOLS }],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingMode.AUTO,
          },
        },
      });

      const chat = model.startChat({
        history: [],
      });

      this.chatSessions.set(sessionId, chat);
    }

    return this.chatSessions.get(sessionId)!;
  }

  /**
   * Processa a mensagem do usuario e retorna a resposta da IA
   */
  async chat(
    message: string,
    sessionId: string = 'default',
  ): Promise<{ response: string; toolCalls?: unknown[] }> {
    const chat = this.getChatSession(sessionId);
    const toolCallsExecuted: unknown[] = [];

    // Envia a mensagem do usuario
    let result = await chat.sendMessage(message);
    let response = result.response;

    // Loop para processar function calls
    while (response.functionCalls() && response.functionCalls()!.length > 0) {
      const functionCalls = response.functionCalls()!;
      const functionResponses: { name: string; response: unknown }[] = [];

      // Processa cada function call
      for (const call of functionCalls) {
        const functionResult = await this.executeFunction(
          call.name,
          call.args as Record<string, unknown>,
        );

        toolCallsExecuted.push({
          function: call.name,
          arguments: call.args,
          result: functionResult,
        });

        functionResponses.push({
          name: call.name,
          response: functionResult,
        });
      }

      // Envia os resultados das funcoes de volta para o Gemini
      const functionResponseParts = functionResponses.map((fr) => ({
        functionResponse: {
          name: fr.name,
          response: fr.response as object,
        },
      }));

      result = await chat.sendMessage(functionResponseParts);
      response = result.response;
    }

    return {
      response: response.text() || 'Desculpe, nao consegui processar.',
      toolCalls: toolCallsExecuted.length > 0 ? toolCallsExecuted : undefined,
    };
  }

  /**
   * Executa uma funcao baseada no nome e argumentos
   */
  private async executeFunction(
    name: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    switch (name) {
      case 'check_availability':
        return this.checkAvailability(
          args.date as string,
          args.service as string,
        );

      case 'book_appointment':
        return this.bookAppointment(
          args.date as string,
          args.time as string,
          args.clientName as string,
          args.clientPhone as string,
          args.service as string,
        );

      case 'get_services':
        return this.getServices();

      case 'check_low_stock':
        return this.checkLowStock();

      case 'calculate_kpis':
        return this.calculateKPIs(
          args.startDate as string | undefined,
          args.endDate as string | undefined,
        );

      case 'get_client_history':
        return this.getClientHistory(args.phone as string);

      default:
        return { error: `Funcao ${name} nao encontrada` };
    }
  }

  /**
   * Mock: Verifica disponibilidade de horarios
   */
  private async checkAvailability(
    date: string,
    service?: string,
  ): Promise<{ date: string; availableSlots: string[]; service?: string }> {
    const slots = MOCK_DATA.availableSlots;
    const available = slots.filter(() => Math.random() > 0.3);

    return {
      date,
      availableSlots: available.length > 0 ? available : ['14:00', '16:00'],
      service,
    };
  }

  /**
   * Mock: Agenda um horario
   */
  private async bookAppointment(
    date: string,
    time: string,
    clientName: string,
    clientPhone: string | undefined,
    service: string,
  ): Promise<{
    success: boolean;
    appointment?: Record<string, unknown>;
    message: string;
  }> {
    return {
      success: true,
      appointment: {
        id: `apt_${Date.now()}`,
        date,
        time,
        clientName,
        clientPhone,
        service,
        status: 'confirmed',
      },
      message: 'Agendamento realizado com sucesso!',
    };
  }

  /**
   * Mock: Retorna lista de servicos
   */
  private async getServices() {
    return {
      services: MOCK_DATA.services,
    };
  }

  /**
   * Verifica produtos com estoque baixo
   */
  private async checkLowStock(): Promise<{
    products: { id: number; name: string; currentStock: number; minStock: number; unit: string }[];
    count: number;
    message: string;
  }> {
    // Dados mockados para o AI Receptionist (sem contexto de salonId)
    const mockLowStockProducts = [
      { id: 1, name: 'Shampoo Profissional', currentStock: 3, minStock: 10, unit: 'UN' },
      { id: 2, name: 'Tinta Loiro', currentStock: 2, minStock: 5, unit: 'UN' },
    ];

    return {
      products: mockLowStockProducts,
      count: mockLowStockProducts.length,
      message:
        mockLowStockProducts.length > 0
          ? `Existem ${mockLowStockProducts.length} produto(s) com estoque baixo que precisam ser repostos.`
          : 'Todos os produtos estao com estoque adequado.',
    };
  }

  /**
   * Calcula KPIs do negócio
   */
  private async calculateKPIs(startDate?: string, endDate?: string): Promise<{
    ticketMedio: number;
    taxaRetorno: number;
    totalFaturamento: number;
    totalClientes: number;
    clientesRecorrentes: number;
    top3Servicos: { service: string; count: number; revenue: number }[];
    periodo: string;
  }> {
    const kpis = await this.appointmentsService.calculateKPIs(startDate || '', endDate || '');

    return {
      ...kpis,
      periodo: startDate && endDate
        ? `${startDate} a ${endDate}`
        : 'Todo o período',
    };
  }

  /**
   * Busca histórico completo do cliente
   */
  private async getClientHistory(phone: string): Promise<{
    client: {
      name: string | null;
      phone: string;
      technicalNotes: string | null;
      preferences: string | null;
    } | null;
    lastAppointments: { date: string; service: string; price: number }[];
    totalVisits: number;
    message: string;
  }> {
    const client = await this.clientsService.findByPhone(phone);

    if (!client) {
      return {
        client: null,
        lastAppointments: [],
        totalVisits: 0,
        message: 'Cliente não encontrado no sistema.',
      };
    }

    // Busca últimos agendamentos
    const appointmentsList = client.salonId
      ? await this.appointmentsService.findByClient(client.id, client.salonId)
      : [];
    const lastAppointments = appointmentsList.slice(0, 5).map(apt => ({
      date: apt.date,
      service: apt.service,
      price: Number(apt.price || 0) / 100,
    }));

    return {
      client: {
        name: client.name,
        phone: client.phone,
        technicalNotes: client.technicalNotes,
        preferences: client.preferences,
      },
      lastAppointments,
      totalVisits: appointmentsList.length,
      message: client.technicalNotes || client.preferences
        ? 'Cliente possui informacoes importantes no historico.'
        : 'Cliente cadastrado sem notas especiais.',
    };
  }

  /**
   * Limpa o historico de conversa de uma sessao
   */
  clearHistory(sessionId: string = 'default'): void {
    this.chatSessions.delete(sessionId);
  }
}
