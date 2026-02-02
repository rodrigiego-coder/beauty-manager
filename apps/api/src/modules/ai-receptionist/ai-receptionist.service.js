"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiReceptionistService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const ai_receptionist_tools_1 = require("./ai-receptionist.tools");
// Comandos de controle Human Handoff
const COMMANDS = {
    PAUSE: '#pare',
    RESUME: '#voltar',
};
let AiReceptionistService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AiReceptionistService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AiReceptionistService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService;
        clientsService;
        appointmentsService;
        genAI;
        chatSessions = new Map();
        SYSTEM_PROMPT = `Voce e a Sofia, recepcionista virtual do salao de beleza "Beauty Manager".

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
        constructor(configService, clientsService, appointmentsService) {
            this.configService = configService;
            this.clientsService = clientsService;
            this.appointmentsService = appointmentsService;
            this.genAI = new generative_ai_1.GoogleGenerativeAI(this.configService.get('GEMINI_API_KEY') || '');
        }
        /**
         * Processa uma mensagem com logica de Human Handoff
         * @param phone Telefone do cliente
         * @param text Mensagem recebida
         */
        async processMessage(phone, text) {
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
        getChatSession(sessionId) {
            if (!this.chatSessions.has(sessionId)) {
                const model = this.genAI.getGenerativeModel({
                    model: 'gemini-2.0-flash',
                    systemInstruction: this.SYSTEM_PROMPT,
                    tools: [{ functionDeclarations: ai_receptionist_tools_1.GEMINI_TOOLS }],
                    toolConfig: {
                        functionCallingConfig: {
                            mode: generative_ai_1.FunctionCallingMode.AUTO,
                        },
                    },
                });
                const chat = model.startChat({
                    history: [],
                });
                this.chatSessions.set(sessionId, chat);
            }
            return this.chatSessions.get(sessionId);
        }
        /**
         * Processa a mensagem do usuario e retorna a resposta da IA
         */
        async chat(message, sessionId = 'default') {
            const chat = this.getChatSession(sessionId);
            const toolCallsExecuted = [];
            // Envia a mensagem do usuario
            let result = await chat.sendMessage(message);
            let response = result.response;
            // Loop para processar function calls
            while (response.functionCalls() && response.functionCalls().length > 0) {
                const functionCalls = response.functionCalls();
                const functionResponses = [];
                // Processa cada function call
                for (const call of functionCalls) {
                    const functionResult = await this.executeFunction(call.name, call.args);
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
                        response: fr.response,
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
        async executeFunction(name, args) {
            switch (name) {
                case 'check_availability':
                    return this.checkAvailability(args.date, args.service);
                case 'book_appointment':
                    return this.bookAppointment(args.date, args.time, args.clientName, args.clientPhone, args.service);
                case 'get_services':
                    return this.getServices();
                case 'check_low_stock':
                    return this.checkLowStock();
                case 'calculate_kpis':
                    return this.calculateKPIs(args.startDate, args.endDate);
                case 'get_client_history':
                    return this.getClientHistory(args.phone);
                default:
                    return { error: `Funcao ${name} nao encontrada` };
            }
        }
        /**
         * Mock: Verifica disponibilidade de horarios
         */
        async checkAvailability(date, service) {
            const slots = ai_receptionist_tools_1.MOCK_DATA.availableSlots;
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
        async bookAppointment(date, time, clientName, clientPhone, service) {
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
        async getServices() {
            return {
                services: ai_receptionist_tools_1.MOCK_DATA.services,
            };
        }
        /**
         * Verifica produtos com estoque baixo
         */
        async checkLowStock() {
            // Dados mockados para o AI Receptionist (sem contexto de salonId)
            const mockLowStockProducts = [
                { id: 1, name: 'Shampoo Profissional', currentStock: 3, minStock: 10, unit: 'UN' },
                { id: 2, name: 'Tinta Loiro', currentStock: 2, minStock: 5, unit: 'UN' },
            ];
            return {
                products: mockLowStockProducts,
                count: mockLowStockProducts.length,
                message: mockLowStockProducts.length > 0
                    ? `Existem ${mockLowStockProducts.length} produto(s) com estoque baixo que precisam ser repostos.`
                    : 'Todos os produtos estao com estoque adequado.',
            };
        }
        /**
         * Calcula KPIs do negócio
         */
        async calculateKPIs(startDate, endDate) {
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
        async getClientHistory(phone) {
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
        clearHistory(sessionId = 'default') {
            this.chatSessions.delete(sessionId);
        }
    };
    return AiReceptionistService = _classThis;
})();
exports.AiReceptionistService = AiReceptionistService;
//# sourceMappingURL=ai-receptionist.service.js.map