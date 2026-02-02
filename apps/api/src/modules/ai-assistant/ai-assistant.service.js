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
exports.AIAssistantService = void 0;
const common_1 = require("@nestjs/common");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
let AIAssistantService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AIAssistantService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AIAssistantService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        geminiService;
        dataCollector;
        constructor(geminiService, dataCollector) {
            this.geminiService = geminiService;
            this.dataCollector = dataCollector;
        }
        // ==================== BRIEFING ====================
        async generateBriefing(salonId, userId, userRole, userName) {
            if (!this.geminiService.isEnabled()) {
                return {
                    message: '⚠️ IA não configurada. Configure GEMINI_API_KEY no arquivo .env para ativar a Belle.',
                    alerts: [],
                    tips: ['Configure a chave da API do Gemini para ativar a assistente de IA.'],
                };
            }
            try {
                let data;
                switch (userRole) {
                    case 'OWNER':
                        data = await this.dataCollector.collectOwnerData(salonId);
                        break;
                    case 'MANAGER':
                        data = await this.dataCollector.collectManagerData(salonId);
                        break;
                    case 'RECEPTIONIST':
                        data = await this.dataCollector.collectReceptionistData(salonId);
                        break;
                    case 'STYLIST':
                        data = await this.dataCollector.collectStylistData(salonId, userId);
                        break;
                    default:
                        data = await this.dataCollector.collectOwnerData(salonId);
                }
                const prompt = this.buildBriefingPrompt(userRole, userName, data);
                const response = await this.geminiService.generateContent(prompt);
                // Salvar insight
                await this.saveInsight(salonId, userId, 'DAILY_BRIEFING', 'Briefing Diário', response);
                return {
                    message: response,
                    alerts: this.extractAlerts(data, userRole),
                    tips: [],
                };
            }
            catch (error) {
                console.error('Erro ao gerar briefing:', error);
                return {
                    message: `Olá ${userName}! 👋\n\nDesculpe, não consegui gerar seu briefing completo no momento. Por favor, tente novamente em alguns instantes.`,
                    alerts: [],
                    tips: [],
                };
            }
        }
        buildBriefingPrompt(userRole, userName, data) {
            const hour = new Date().getHours();
            const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
            const dateStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
            const basePrompt = `
Você é Belle, uma assistente virtual inteligente e amigável para salões de beleza.
Você está conversando com ${userName} (${greeting}).
Use português brasileiro, seja concisa, use emojis moderadamente (máximo 5 por mensagem).
Data: ${dateStr}
Hora: ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}

IMPORTANTE: Seja DIRETA e PRÁTICA. Máximo 250 palavras.
`;
            if (userRole === 'OWNER') {
                return `${basePrompt}

${userName} é DONO(A) do salão. Foque em visão estratégica e números.

📊 DADOS REAIS DO SALÃO:

💰 FINANCEIRO:
- Faturamento hoje: R$ ${data.todayRevenue?.toFixed(2) || '0,00'}
- Faturamento da semana: R$ ${data.weekRevenue?.toFixed(2) || '0,00'}
- Faturamento do mês: R$ ${data.monthRevenue?.toFixed(2) || '0,00'}
- Mês anterior: R$ ${data.lastMonthRevenue?.toFixed(2) || '0,00'}
- Crescimento: ${data.revenueGrowthPercent?.toFixed(1) || '0'}%
- Ticket médio: R$ ${data.averageTicket?.toFixed(2) || '0,00'}

👥 CLIENTES:
- Total cadastrados: ${data.totalClients || 0}
- Novos este mês: ${data.newClientsThisMonth || 0}
- Em risco (30+ dias sem voltar): ${data.atRiskClients?.length || 0}
${data.atRiskClients?.slice(0, 3).map((c) => `  • ${c.name} (${c.lastVisitDays} dias)`).join('\n') || '  Nenhum'}

🏆 TOP 5 SERVIÇOS DO MÊS:
${data.bestSellingServices?.slice(0, 5).map((s, i) => `${i + 1}. ${s.name} (${s.quantity}x)`).join('\n') || 'Sem dados'}

📦 ESTOQUE BAIXO:
${data.lowStockProducts?.length > 0
                    ? data.lowStockProducts.slice(0, 3).map((p) => `⚠️ ${p.name}: ${p.currentStock} un (mín: ${p.minStock})`).join('\n')
                    : '✅ Estoque OK'}

👨‍💼 RANKING DA EQUIPE (MÊS):
${data.teamRanking?.slice(0, 5).map((t, i) => `${i + 1}. ${t.name} - R$ ${t.revenue?.toFixed(2)}`).join('\n') || 'Sem dados'}

💵 COMISSÕES PENDENTES: R$ ${data.pendingCommissions?.toFixed(2) || '0,00'}
📅 AGENDAMENTOS HOJE: ${data.todayAppointments || 0}
💰 CAIXA: ${data.cashRegisterOpen ? `Aberto (R$ ${data.cashRegisterBalance?.toFixed(2)})` : '⚠️ FECHADO'}

---

Gere uma mensagem estruturada com:
1. Saudação personalizada (1 linha)
2. Resumo executivo dos números (2-3 linhas)
3. ALERTAS IMPORTANTES (se houver: estoque baixo, caixa fechado, clientes em risco)
4. 2 dicas práticas e acionáveis baseadas nos dados
5. Frase motivacional curta

Formato: texto corrido com quebras de linha, sem usar markdown (sem ** ou ##).`;
            }
            if (userRole === 'MANAGER') {
                return `${basePrompt}

${userName} é GERENTE do salão. Foque em operações e tarefas.

📊 DADOS OPERACIONAIS:
- Agendamentos hoje: ${data.todayAppointments || 0}
- Confirmações pendentes: ${data.pendingConfirmations || 0}
- Comandas abertas: ${data.openCommands || 0}
- Faturamento hoje: R$ ${data.todayRevenue?.toFixed(2) || '0,00'}
- Comissões pendentes: R$ ${data.pendingCommissions?.toFixed(2) || '0,00'}

📦 ESTOQUE BAIXO:
${data.lowStockProducts?.length > 0
                    ? data.lowStockProducts.slice(0, 3).map((p) => `⚠️ ${p.name}: ${p.currentStock} un`).join('\n')
                    : '✅ Estoque OK'}

Gere uma mensagem focada em:
1. Saudação
2. Resumo das tarefas do dia
3. Alertas operacionais
4. Prioridades

Formato: texto corrido, sem markdown.`;
            }
            if (userRole === 'RECEPTIONIST') {
                return `${basePrompt}

${userName} é RECEPCIONISTA. Foque na agenda e atendimento.

📅 AGENDA DE HOJE:
${data.todayAppointments?.slice(0, 8).map((a) => `• ${a.time} - ${a.clientName} (${a.serviceName}) com ${a.professionalName}`).join('\n') || 'Nenhum agendamento'}

⏳ Confirmações pendentes: ${data.pendingConfirmations || 0}
📝 Comandas abertas: ${data.openCommands || 0}

🎂 ANIVERSARIANTES DE HOJE:
${data.birthdayClients?.length > 0
                    ? data.birthdayClients.map((c) => `🎉 ${c.name}`).join('\n')
                    : 'Nenhum aniversariante'}

Gere uma mensagem focada em:
1. Saudação
2. Visão geral da agenda
3. Aniversariantes (se houver)
4. Dica de atendimento

Formato: texto corrido, sem markdown.`;
            }
            if (userRole === 'STYLIST') {
                return `${basePrompt}

${userName} é PROFISSIONAL/CABELEIREIRO(A). Foque na agenda pessoal.

📅 MINHA AGENDA HOJE:
${data.myTodayAppointments?.map((a) => `• ${a.time} - ${a.clientName} (${a.serviceName})`).join('\n') || 'Nenhum agendamento'}

💰 MEU MÊS:
- Faturamento: R$ ${data.myMonthRevenue?.toFixed(2) || '0,00'}
- Comissão a receber: R$ ${data.myCommission?.toFixed(2) || '0,00'}
- Ranking: ${data.myRanking}º de ${data.totalProfessionals} profissionais

Gere uma mensagem focada em:
1. Saudação motivadora
2. Resumo da agenda do dia
3. Suas métricas
4. Dica para melhorar atendimento

Formato: texto corrido, sem markdown.`;
            }
            return basePrompt + '\nGere uma saudação genérica amigável.';
        }
        extractAlerts(data, userRole) {
            const alerts = [];
            if (userRole === 'OWNER' || userRole === 'MANAGER') {
                if (!data.cashRegisterOpen) {
                    alerts.push({
                        type: 'warning',
                        title: 'Caixa Fechado',
                        description: 'O caixa ainda não foi aberto hoje.',
                    });
                }
                if (data.lowStockProducts?.length > 0) {
                    alerts.push({
                        type: 'warning',
                        title: 'Estoque Baixo',
                        description: `${data.lowStockProducts.length} produto(s) com estoque baixo.`,
                    });
                }
                if (data.atRiskClients?.length > 5) {
                    alerts.push({
                        type: 'info',
                        title: 'Clientes em Risco',
                        description: `${data.atRiskClients.length} clientes não voltam há mais de 30 dias.`,
                    });
                }
                if (data.pendingCommissions > 1000) {
                    alerts.push({
                        type: 'info',
                        title: 'Comissões Pendentes',
                        description: `R$ ${data.pendingCommissions.toFixed(2)} em comissões a pagar.`,
                    });
                }
            }
            return alerts;
        }
        // ==================== CHAT ====================
        async chat(salonId, userId, userRole, message) {
            if (!this.geminiService.isEnabled()) {
                return 'IA não configurada. Configure GEMINI_API_KEY no arquivo .env.';
            }
            try {
                // Carregar histórico recente
                const history = await this.getRecentHistory(salonId, userId, 10);
                // Carregar contexto atual baseado no role
                let context = {};
                try {
                    switch (userRole) {
                        case 'OWNER':
                            context = await this.dataCollector.collectOwnerData(salonId);
                            break;
                        case 'MANAGER':
                            context = await this.dataCollector.collectManagerData(salonId);
                            break;
                        case 'RECEPTIONIST':
                            context = await this.dataCollector.collectReceptionistData(salonId);
                            break;
                        case 'STYLIST':
                            context = await this.dataCollector.collectStylistData(salonId, userId);
                            break;
                    }
                }
                catch (e) {
                    console.warn('Erro ao coletar contexto:', e);
                }
                const systemPrompt = `Você é Belle, assistente IA do Beauty Manager.
Responda de forma útil, concisa e amigável em português brasileiro.
Use emojis moderadamente.
Você tem acesso aos dados atuais do salão para responder perguntas.

DADOS ATUAIS:
${JSON.stringify(context, null, 2)}

Se o usuário perguntar algo que você não sabe, diga que não tem essa informação disponível.
Não invente dados. Use apenas os dados fornecidos acima.`;
                // Construir histórico para o chat
                const chatHistory = [
                    { role: 'user', content: systemPrompt },
                    { role: 'assistant', content: 'Entendido! Estou pronta para ajudar com as informações do salão.' },
                    ...history,
                ];
                const response = await this.geminiService.chat(chatHistory, message);
                // Salvar conversa
                await this.saveConversation(salonId, userId, 'user', message);
                await this.saveConversation(salonId, userId, 'assistant', response);
                return response;
            }
            catch (error) {
                console.error('Erro no chat:', error);
                return 'Desculpe, ocorreu um erro. Por favor, tente novamente.';
            }
        }
        async getRecentHistory(salonId, userId, limit) {
            const result = await connection_1.db
                .select({ role: schema_1.dashboardConversations.role, content: schema_1.dashboardConversations.content })
                .from(schema_1.dashboardConversations)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.dashboardConversations.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.dashboardConversations.userId, userId)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.dashboardConversations.createdAt))
                .limit(limit);
            return result.reverse();
        }
        async saveConversation(salonId, userId, role, content) {
            await connection_1.db.insert(schema_1.dashboardConversations).values({
                salonId,
                userId,
                role,
                content,
            });
        }
        // ==================== CLIENT INSIGHT ====================
        async getClientInsight(salonId, clientId) {
            if (!this.geminiService.isEnabled()) {
                return 'IA não configurada. Configure GEMINI_API_KEY no arquivo .env.';
            }
            try {
                const clientData = await this.dataCollector.collectClientInfo(salonId, clientId);
                const prompt = `
Você é Belle, assistente de um salão de beleza.
Analise os dados deste cliente e gere um resumo CURTO e ÚTIL para o atendente.

CLIENTE: ${clientData.client.name}
Telefone: ${clientData.client.phone || 'Não informado'}
Email: ${clientData.client.email || 'Não informado'}

📅 HISTÓRICO:
- Última visita: ${clientData.lastVisit ? new Date(clientData.lastVisit).toLocaleDateString('pt-BR') : 'Primeira vez'}
- Total de visitas: ${clientData.totalVisits}
- Ticket médio: R$ ${clientData.averageTicket?.toFixed(2) || '0,00'}

💇 PERFIL CAPILAR:
- Tipo de cabelo: ${clientData.hairProfile?.hairType || 'Não informado'}
- Textura: ${clientData.hairProfile?.hairTexture || 'Não informada'}
- Densidade: ${clientData.hairProfile?.hairDensity || 'Não informada'}
- Porosidade: ${clientData.hairProfile?.porosity || 'Não informada'}
- Couro cabeludo: ${clientData.hairProfile?.scalpCondition || 'Não informado'}
- Química anterior: ${clientData.hairProfile?.chemicalHistory?.join(', ') || 'Nenhuma'}
- Queixas: ${clientData.hairProfile?.mainConcerns?.join(', ') || 'Nenhuma'}

📝 NOTAS:
- Preferências: ${clientData.preferences?.join(', ') || 'Nenhuma registrada'}
- Alergias: ${clientData.allergies?.join(', ') || 'Nenhuma'}
- Observações: ${clientData.notes?.join('. ') || 'Nenhuma'}

---

Gere um resumo em MÁXIMO 80 palavras com:
1. Perfil resumido do cliente (1 linha)
2. ⚠️ ALERTAS DE CUIDADO (alergias, sensibilidades) - SE HOUVER
3. 💡 Sugestão de produto ou serviço baseado no perfil
4. Dica de atendimento personalizado

Formato: texto corrido, sem markdown.`;
                return await this.geminiService.generateContent(prompt);
            }
            catch (error) {
                console.error('Erro ao gerar insight do cliente:', error);
                if (error.message === 'Cliente não encontrado') {
                    throw new common_1.NotFoundException('Cliente não encontrado');
                }
                return 'Não foi possível gerar insights para este cliente.';
            }
        }
        // ==================== INSIGHTS ====================
        async getInsights(salonId, userId) {
            const result = await connection_1.db
                .select()
                .from(schema_1.aiInsights)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiInsights.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.aiInsights.userId, userId), (0, drizzle_orm_1.eq)(schema_1.aiInsights.isDismissed, false)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.aiInsights.createdAt))
                .limit(10);
            return result;
        }
        async dismissInsight(id) {
            await connection_1.db.update(schema_1.aiInsights).set({ isDismissed: true }).where((0, drizzle_orm_1.eq)(schema_1.aiInsights.id, id));
        }
        async saveInsight(salonId, userId, type, title, content) {
            await connection_1.db.insert(schema_1.aiInsights).values({
                salonId,
                userId,
                type,
                title,
                content,
                priority: 'MEDIUM',
                category: 'GENERAL',
            });
        }
        // ==================== SETTINGS ====================
        async getSettings(salonId) {
            const [settings] = await connection_1.db
                .select()
                .from(schema_1.dashboardSettings)
                .where((0, drizzle_orm_1.eq)(schema_1.dashboardSettings.salonId, salonId));
            if (!settings) {
                // Criar configurações padrão
                const [newSettings] = await connection_1.db
                    .insert(schema_1.dashboardSettings)
                    .values({ salonId })
                    .returning();
                return newSettings;
            }
            return settings;
        }
        async updateSettings(salonId, data) {
            const existing = await this.getSettings(salonId);
            const [updated] = await connection_1.db
                .update(schema_1.dashboardSettings)
                .set({
                ...data,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.dashboardSettings.id, existing.id))
                .returning();
            return updated;
        }
        // ==================== CHAT HISTORY ====================
        async getChatHistory(salonId, userId) {
            return await connection_1.db
                .select({
                id: schema_1.dashboardConversations.id,
                role: schema_1.dashboardConversations.role,
                content: schema_1.dashboardConversations.content,
                createdAt: schema_1.dashboardConversations.createdAt,
            })
                .from(schema_1.dashboardConversations)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.dashboardConversations.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.dashboardConversations.userId, userId)))
                .orderBy(schema_1.dashboardConversations.createdAt)
                .limit(50);
        }
        async clearChatHistory(salonId, userId) {
            await connection_1.db
                .delete(schema_1.dashboardConversations)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.dashboardConversations.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.dashboardConversations.userId, userId)));
        }
    };
    return AIAssistantService = _classThis;
})();
exports.AIAssistantService = AIAssistantService;
//# sourceMappingURL=ai-assistant.service.js.map