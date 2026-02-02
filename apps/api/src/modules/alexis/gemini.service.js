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
exports.GeminiService = exports.MESSAGE_TRUNCATE_LENGTH = exports.CONVERSATION_HISTORY_LIMIT = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const forbidden_terms_1 = require("./constants/forbidden-terms");
/** Limite de turnos carregados (configurável sem .env) */
exports.CONVERSATION_HISTORY_LIMIT = 8;
/** Tamanho máximo por mensagem no histórico (chars) */
exports.MESSAGE_TRUNCATE_LENGTH = 600;
let GeminiService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var GeminiService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            GeminiService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = new common_1.Logger(GeminiService.name);
        genAI = null;
        model = null;
        async onModuleInit() {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                this.logger.warn('GEMINI_API_KEY não configurada - Alexis operará em modo limitado');
                return;
            }
            try {
                this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
                this.model = this.genAI.getGenerativeModel({
                    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
                });
                this.logger.log('Gemini API inicializada com sucesso');
            }
            catch (error) {
                this.logger.error('Erro ao inicializar Gemini API:', error);
            }
        }
        /**
         * Verifica se o serviço está disponível
         */
        isAvailable() {
            return !!this.model;
        }
        /**
         * Gera resposta usando o Gemini
         * @param salonName Nome do salão para personalização
         * @param userMessage Mensagem do usuário
         * @param context Contexto do salão (serviços, produtos, etc)
         * @param history Turnos recentes da conversa (opcional)
         */
        async generateResponse(salonName, userMessage, context, history = []) {
            if (!this.model) {
                return this.getFallbackResponse();
            }
            try {
                const systemPrompt = (0, forbidden_terms_1.ALEXIS_SYSTEM_PROMPT)(salonName);
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
            }
            catch (error) {
                this.logger.error('Erro ao gerar resposta Gemini:', error?.message || error);
                return this.getFallbackResponse();
            }
        }
        /**
         * Formata histórico de conversa para inclusão no prompt
         */
        formatHistory(history) {
            if (!history || history.length === 0)
                return '';
            const lines = history.map((turn) => {
                const label = turn.role === 'client' ? '[cliente]' : '[assistente]';
                const truncated = turn.content.length > exports.MESSAGE_TRUNCATE_LENGTH
                    ? turn.content.slice(0, exports.MESSAGE_TRUNCATE_LENGTH) + '...'
                    : turn.content;
                return `${label} ${truncated}`;
            });
            return `\nHISTÓRICO RECENTE (últimos ${history.length} turnos):\n${lines.join('\n')}\n`;
        }
        /**
         * Gera briefing para o dashboard
         */
        async generateBriefing(userName, userRole, data) {
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
                }
                else if (userRole === 'MANAGER') {
                    prompt = `Gere um briefing de tarefas para ${userName}, gerente do salão.
${data.unconfirmedAppointments || 0} agendamentos para confirmar, ${data.lowStockProducts?.length || 0} produtos para repor.
Seja objetivo e liste as prioridades do dia.`;
                }
                else if (userRole === 'RECEPTIONIST') {
                    prompt = `Gere um resumo do dia para ${userName}, recepcionista.
${data.todayAppointments?.length || 0} agendamentos hoje.
Liste os próximos clientes e horários de forma clara.`;
                }
                else {
                    prompt = `Gere um resumo para ${userName}, profissional do salão.
${data.myAppointmentsToday?.length || 0} clientes agendados hoje.
Liste os horários e serviços de forma clara.`;
                }
                const fullPrompt = `Você é Alexis, assistente do salão. ${prompt}
Dados completos: ${JSON.stringify(data)}`;
                const result = await this.model.generateContent(fullPrompt);
                return result.response.text();
            }
            catch (error) {
                this.logger.error('Erro ao gerar briefing:', error?.message || error);
                return this.getDefaultBriefing(userName, userRole);
            }
        }
        /**
         * Resposta de fallback premium quando a IA não está disponível.
         * P0.4: Nunca expor "instabilidade" ao cliente — sempre oferecer ajuda concreta.
         */
        getFallbackResponse() {
            const fallbacks = [
                'Oi! Posso ajudar com agendamento, valores ou tirar dúvidas sobre nossos serviços. O que você precisa?',
                'Estou aqui para ajudar! Posso ver preços, agendar horários ou tirar dúvidas sobre serviços e produtos.',
            ];
            return fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }
        /**
         * Briefing padrão quando a IA não está disponível
         */
        getDefaultBriefing(userName, _userRole) {
            const hour = new Date().getHours();
            let greeting = 'Bom dia';
            if (hour >= 12 && hour < 18)
                greeting = 'Boa tarde';
            else if (hour >= 18)
                greeting = 'Boa noite';
            return `${greeting}, ${userName}! 😊\n\nSeu briefing do dia está sendo preparado. Verifique a agenda e as notificações para mais detalhes.`;
        }
    };
    return GeminiService = _classThis;
})();
exports.GeminiService = GeminiService;
//# sourceMappingURL=gemini.service.js.map