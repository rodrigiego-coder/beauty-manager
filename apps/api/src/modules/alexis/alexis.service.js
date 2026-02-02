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
exports.AlexisService = void 0;
const common_1 = require("@nestjs/common");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
const gemini_service_1 = require("./gemini.service");
const forbidden_terms_1 = require("./constants/forbidden-terms");
const schedule_continuation_1 = require("./schedule-continuation");
const conversation_state_1 = require("./conversation-state");
const scheduling_skill_1 = require("./scheduling-skill");
const lexicon_resolver_1 = require("./lexicon/lexicon-resolver");
const lexicon_feature_flag_1 = require("./lexicon/lexicon-feature-flag");
const lexicon_telemetry_1 = require("./lexicon/lexicon-telemetry");
const service_price_resolver_1 = require("./lexicon/service-price-resolver");
const relative_date_resolver_1 = require("./relative-date-resolver");
let AlexisService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AlexisService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AlexisService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        gemini;
        contentFilter;
        intentClassifier;
        scheduler;
        dataCollector;
        catalog;
        productInfo;
        composer;
        stateStore;
        appointmentsService;
        onlineBookingSettings;
        logger = new common_1.Logger(AlexisService.name);
        /** Debounce in-memory: agrupa mensagens rápidas por conversa */
        debounceMap = new Map();
        constructor(gemini, contentFilter, intentClassifier, scheduler, dataCollector, catalog, productInfo, composer, stateStore, appointmentsService, onlineBookingSettings) {
            this.gemini = gemini;
            this.contentFilter = contentFilter;
            this.intentClassifier = intentClassifier;
            this.scheduler = scheduler;
            this.dataCollector = dataCollector;
            this.catalog = catalog;
            this.productInfo = productInfo;
            this.composer = composer;
            this.stateStore = stateStore;
            this.appointmentsService = appointmentsService;
            this.onlineBookingSettings = onlineBookingSettings;
        }
        /**
         * =====================================================
         * PROCESSAMENTO DE MENSAGEM WHATSAPP
         * Entrada principal para mensagens
         * =====================================================
         */
        async processWhatsAppMessage(salonId, clientPhone, message, clientName, senderId, senderType = 'client') {
            const startTime = Date.now();
            // Busca ou cria conversa
            const conversation = await this.getOrCreateConversation(salonId, clientPhone, clientName);
            // ========== VERIFICA SE É COMANDO DO ATENDENTE ==========
            if (senderType === 'agent') {
                const commandCheck = this.contentFilter.isCommand(message);
                if (commandCheck.isCommand) {
                    if (commandCheck.command === 'HUMAN_TAKEOVER') {
                        // #eu - Atendente assume (NÃO envia o comando ao cliente)
                        await this.handleHumanTakeover(conversation.id, senderId || '');
                        // Salva comando como system (isCommand=true)
                        await this.saveMessage(conversation.id, 'system', message, 'HUMAN_TAKEOVER', false, true);
                        // Busca mensagem personalizada
                        const settings = await this.getSettings(salonId);
                        const takeoverMessage = settings?.humanTakeoverMessage || forbidden_terms_1.COMMAND_RESPONSES.HUMAN_TAKEOVER;
                        return {
                            response: takeoverMessage,
                            intent: 'HUMAN_TAKEOVER',
                            blocked: false,
                            shouldSend: true, // Envia a RESPOSTA ao cliente, não o comando
                            statusChanged: true,
                            newStatus: 'HUMAN_ACTIVE',
                        };
                    }
                    if (commandCheck.command === 'AI_RESUME') {
                        // #ia - Alexis volta (NÃO envia o comando ao cliente)
                        await this.handleAIResume(conversation.id);
                        // Salva comando como system (isCommand=true)
                        await this.saveMessage(conversation.id, 'system', message, 'AI_RESUME', false, true);
                        // Busca mensagem personalizada
                        const settings = await this.getSettings(salonId);
                        const resumeMessage = settings?.aiResumeMessage || forbidden_terms_1.COMMAND_RESPONSES.AI_RESUME;
                        return {
                            response: resumeMessage,
                            intent: 'AI_RESUME',
                            blocked: false,
                            shouldSend: true, // Envia a RESPOSTA ao cliente, não o comando
                            statusChanged: true,
                            newStatus: 'AI_ACTIVE',
                        };
                    }
                }
                // Mensagem normal do atendente (não é comando)
                await this.saveMessage(conversation.id, 'human', message, 'HUMAN_MESSAGE', false, false);
                return {
                    response: null,
                    intent: 'HUMAN_MESSAGE',
                    blocked: false,
                    shouldSend: false, // Atendente já enviou direto pelo WhatsApp
                    statusChanged: false,
                };
            }
            // ========== MENSAGEM DO CLIENTE ==========
            // Se humano está ativo, não responde (atendente vai responder)
            if (conversation.status === 'HUMAN_ACTIVE') {
                await this.saveMessage(conversation.id, 'client', message, 'GENERAL', false, false);
                return {
                    response: null,
                    intent: 'HUMAN_ACTIVE',
                    blocked: false,
                    shouldSend: false,
                    statusChanged: false,
                };
            }
            // ========== DEBOUNCE: anti-atropelo (2.5s) ==========
            const debounceResult = await this.handleDebounce(conversation.id, message);
            if (debounceResult.deferred) {
                return {
                    response: null,
                    intent: 'DEBOUNCED',
                    blocked: false,
                    shouldSend: false,
                    statusChanged: false,
                };
            }
            const mergedText = debounceResult.mergedText;
            // ========== P0: CARREGA FSM STATE LOGO APÓS DEBOUNCE ==========
            const state = await this.stateStore.getState(conversation.id);
            // ========== P0: FSM ATIVA TEM PRIORIDADE ABSOLUTA ==========
            // Se SCHEDULING com step !== 'NONE', vai direto para FSM (NÃO cai em IA/fallback)
            if (state.activeSkill === 'SCHEDULING' && state.step !== 'NONE') {
                this.logger.debug(`[Router] FSM_ACTIVE: step=${state.step}, conversationId=${conversation.id}`);
                return this.handleFSMTurn(conversation.id, salonId, clientPhone, clientName, mergedText, state, startTime);
            }
            // ========== CONTINUAÇÃO TRANSACIONAL: SCHEDULE (fallback se FSM state perdido) ==========
            // Roda ANTES de resolveRelativeDate para capturar respostas de agendamento
            const scheduleContinuation = await this.checkScheduleContinuation(conversation.id, salonId, clientPhone, mergedText, startTime);
            if (scheduleContinuation) {
                this.logger.debug(`[Router] SCHEDULE_CONTINUATION: conversationId=${conversation.id}`);
                return scheduleContinuation;
            }
            // ========== NON-FSM: Pipeline normal ==========
            this.logger.debug(`[Router] NON_FSM: conversationId=${conversation.id}`);
            // ========== RELATIVE DATE: resposta determinística (P0.5) ==========
            const dateResult = (0, relative_date_resolver_1.resolveRelativeDate)(mergedText);
            if (dateResult.matched && dateResult.response) {
                await this.saveMessage(conversation.id, 'client', mergedText, 'DATE_INFO', false, false);
                await this.saveMessage(conversation.id, 'ai', dateResult.response, 'DATE_INFO', false, false);
                await this.logInteraction(salonId, conversation.id, clientPhone, mergedText, dateResult.response, 'DATE_INFO', false, undefined, Date.now() - startTime);
                return {
                    response: dateResult.response,
                    intent: 'DATE_INFO',
                    blocked: false,
                    shouldSend: true,
                    statusChanged: false,
                };
            }
            // ========== LEXICON: dialeto de salão → preço de serviço (antes de ProductInfo) ==========
            if ((0, lexicon_feature_flag_1.getLexiconEnabled)()) {
                const lexiconServicePrice = await this.tryLexiconServicePrice(conversation.id, salonId, clientPhone, mergedText, startTime);
                if (lexiconServicePrice)
                    return lexiconServicePrice;
            }
            // ========== CHARLIE: DETECÇÃO DETERMINÍSTICA DE PRODUTO ==========
            const productInfoResponse = await this.productInfo.tryAnswerProductInfo(salonId, mergedText);
            if (productInfoResponse) {
                this.logger.log(`ProductInfo respondeu deterministicamente para: "${mergedText}"`);
                await this.saveMessage(conversation.id, 'client', mergedText, 'PRODUCT_INFO', false, false);
                await this.saveMessage(conversation.id, 'ai', productInfoResponse, 'PRODUCT_INFO', false, false);
                await this.logInteraction(salonId, conversation.id, clientPhone, mergedText, productInfoResponse, 'PRODUCT_INFO', false, undefined, Date.now() - startTime);
                return {
                    response: productInfoResponse,
                    intent: 'PRODUCT_INFO',
                    blocked: false,
                    shouldSend: true,
                    statusChanged: false,
                };
            }
            // Classifica intenção
            const intent = this.intentClassifier.classify(mergedText);
            // ========== SCHEDULE via FSM (novo fluxo) ==========
            if (intent === 'SCHEDULE') {
                return this.handleFSMStart(conversation.id, salonId, clientPhone, clientName, mergedText, state, startTime);
            }
            // ========== CONFIRMAÇÃO/RECUSA DE AGENDAMENTO ==========
            if (intent === 'APPOINTMENT_CONFIRM' || intent === 'APPOINTMENT_DECLINE') {
                const confirmResult = await this.handleAppointmentConfirmation(salonId, clientPhone, intent === 'APPOINTMENT_CONFIRM');
                if (confirmResult.handled) {
                    await this.saveMessage(conversation.id, 'client', mergedText, intent, false, false);
                    await this.saveMessage(conversation.id, 'ai', confirmResult.response, intent, false, false);
                    await this.logInteraction(salonId, conversation.id, clientPhone, mergedText, confirmResult.response, intent, false, undefined, Date.now() - startTime);
                    return {
                        response: confirmResult.response,
                        intent,
                        blocked: false,
                        shouldSend: true,
                        statusChanged: false,
                    };
                }
            }
            // ========== LIST_SERVICES: listagem DB-backed (P0.5) ==========
            if (intent === 'LIST_SERVICES') {
                return this.handleListServices(conversation.id, salonId, clientPhone, clientName, mergedText, state, startTime);
            }
            // ========== CAMADA 1: FILTRO DE ENTRADA ==========
            const inputFilter = this.contentFilter.filterInput(mergedText);
            if (!inputFilter.allowed) {
                await connection_1.db.insert(schema_1.aiBlockedTermsLog).values({
                    salonId,
                    conversationId: conversation.id,
                    originalMessage: mergedText,
                    blockedTerms: inputFilter.blockedTerms,
                    layer: 'INPUT',
                });
                const blockedResponse = this.contentFilter.getBlockedResponse();
                await this.saveMessage(conversation.id, 'client', mergedText, intent, true, false, 'INPUT_BLOCKED');
                await this.saveMessage(conversation.id, 'ai', blockedResponse, intent, false, false);
                await this.logInteraction(salonId, conversation.id, clientPhone, mergedText, blockedResponse, intent, true, 'INPUT', Date.now() - startTime);
                return {
                    response: blockedResponse,
                    intent,
                    blocked: true,
                    shouldSend: true,
                    statusChanged: false,
                };
            }
            // ========== CAMADA 2: GERAÇÃO COM IA ==========
            const context = await this.dataCollector.collectContext(salonId, clientPhone);
            const history = await this.getRecentHistory(conversation.id, gemini_service_1.CONVERSATION_HISTORY_LIMIT);
            let aiResponse;
            try {
                if (intent === 'PRODUCT_INFO' || intent === 'PRICE_INFO') {
                    aiResponse = await this.handleProductIntent(salonId, mergedText);
                }
                else {
                    aiResponse = await this.gemini.generateResponse(context.salon?.name || 'Salão', mergedText, context, history);
                }
            }
            catch (error) {
                this.logger.error('[P0.4-FALLBACK] Gemini falhou, usando fallback premium:', error?.message || error);
                aiResponse = this.gemini.getFallbackResponse();
            }
            // ========== CAMADA 3: FILTRO DE SAÍDA ==========
            const outputFilter = this.contentFilter.filterOutput(aiResponse);
            if (!outputFilter.safe && outputFilter.blockedTerms.length > 0) {
                await connection_1.db.insert(schema_1.aiBlockedTermsLog).values({
                    salonId,
                    conversationId: conversation.id,
                    originalMessage: aiResponse,
                    blockedTerms: outputFilter.blockedTerms,
                    layer: 'OUTPUT',
                });
            }
            const filteredResponse = outputFilter.filtered;
            // DELTA: Compoe resposta humanizada — anti-greeting se já saudou
            const finalResponse = await this.composer.compose({
                salonId,
                phone: clientPhone,
                clientName,
                intent,
                baseText: filteredResponse,
                skipGreeting: state.userAlreadyGreeted,
            });
            // Atualiza greeting state
            if (!state.userAlreadyGreeted) {
                await this.stateStore.updateState(conversation.id, {
                    userAlreadyGreeted: true,
                    lastGreetingAt: (0, conversation_state_1.nowIso)(),
                });
            }
            // ========== ANTI-DUPLICAÇÃO ATÔMICA: ReplyDedupGate via state_json ==========
            const canSend = await this.stateStore.tryRegisterReply(conversation.id, finalResponse);
            if (!canSend) {
                this.logger.debug(`DedupGate: resposta idêntica suprimida para ${clientPhone}`);
                await this.saveMessage(conversation.id, 'client', mergedText, intent, false, false);
                return {
                    response: null,
                    intent,
                    blocked: false,
                    shouldSend: false,
                    statusChanged: false,
                };
            }
            // Salva mensagens
            await this.saveMessage(conversation.id, 'client', mergedText, intent, false, false);
            await this.saveMessage(conversation.id, 'ai', finalResponse, intent, !outputFilter.safe, false, !outputFilter.safe ? 'OUTPUT_BLOCKED' : undefined);
            await this.logInteraction(salonId, conversation.id, clientPhone, mergedText, finalResponse, intent, !inputFilter.allowed || !outputFilter.safe, !outputFilter.safe ? 'OUTPUT' : undefined, Date.now() - startTime);
            return {
                response: finalResponse,
                intent,
                blocked: !outputFilter.safe,
                shouldSend: true,
                statusChanged: false,
            };
        }
        /**
         * =====================================================
         * HANDLERS DE COMANDOS
         * =====================================================
         */
        async handleHumanTakeover(conversationId, agentId) {
            await connection_1.db
                .update(schema_1.aiConversations)
                .set({
                status: 'HUMAN_ACTIVE',
                humanAgentId: agentId || null,
                humanTakeoverAt: new Date(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.aiConversations.id, conversationId));
            this.logger.log(`Conversa ${conversationId} assumida por humano`);
        }
        async handleAIResume(conversationId) {
            await connection_1.db
                .update(schema_1.aiConversations)
                .set({
                status: 'AI_ACTIVE',
                humanAgentId: null,
                aiResumedAt: new Date(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.aiConversations.id, conversationId));
            this.logger.log(`Conversa ${conversationId} retomada pela IA`);
        }
        /**
         * =====================================================
         * DEBOUNCE — anti-atropelo (in-memory por conversa)
         * Se lock ativo: append no buffer e retorna DEFER
         * Se lock livre: OWNER, espera debounceMs, consolida
         * =====================================================
         */
        handleDebounce(conversationId, text) {
            return new Promise((resolve) => {
                const existing = this.debounceMap.get(conversationId);
                if (existing) {
                    // Já tem owner — append e defer
                    existing.buffer.push(text);
                    clearTimeout(existing.timer);
                    existing.timer = setTimeout(() => existing.resolveOwner(), conversation_state_1.DEBOUNCE_MS);
                    resolve({ deferred: true });
                    return;
                }
                // Novo owner
                const entry = {
                    buffer: [text],
                    timer: null,
                    resolveOwner: null,
                };
                const ownerReady = new Promise((resolveOwner) => {
                    entry.resolveOwner = resolveOwner;
                });
                entry.timer = setTimeout(() => entry.resolveOwner(), conversation_state_1.DEBOUNCE_MS);
                this.debounceMap.set(conversationId, entry);
                ownerReady.then(() => {
                    const final = this.debounceMap.get(conversationId);
                    const merged = (0, conversation_state_1.mergeBufferTexts)(final?.buffer || [text]);
                    this.debounceMap.delete(conversationId);
                    resolve({ deferred: false, mergedText: merged });
                });
            });
        }
        /**
         * =====================================================
         * FSM TURN — Processa turno dentro de skill ativa
         * =====================================================
         */
        async handleFSMTurn(conversationId, salonId, clientPhone, clientName, text, state, startTime) {
            const context = await this.dataCollector.collectContext(salonId, clientPhone);
            const skillCtx = await this.buildSkillContext(salonId, context);
            const result = (0, scheduling_skill_1.handleSchedulingTurn)(state, text, skillCtx);
            // ========== INTERRUPTION: info question durante scheduling ==========
            // Se interruptionQuery=true, responder a pergunta via pipeline normal e anexar resume prompt
            let finalResponse = result.replyText;
            if (result.interruptionQuery) {
                const infoAnswer = await this.resolveInfoInterruption(salonId, text, context);
                const resumePrompt = result.replyText; // "Voltando ao seu agendamento: ..."
                finalResponse = resumePrompt
                    ? `${infoAnswer}\n\n${resumePrompt}`
                    : infoAnswer;
            }
            // ========== P0: COMMIT TRANSACIONAL quando handover=true ==========
            if (result.handover && state.slots.serviceId && state.slots.dateISO && state.slots.time) {
                const commitResult = await this.commitSchedulingTransaction(conversationId, salonId, clientPhone, clientName, state, skillCtx);
                if (commitResult.success) {
                    finalResponse = commitResult.response;
                    // Atualiza nextState com marcador de commit
                    result.nextState.schedulingCommittedAt = (0, conversation_state_1.nowIso)();
                    result.nextState.schedulingAppointmentId = commitResult.appointmentId;
                }
                else {
                    // Fallback: erro no commit, mantém resposta original (handover para recepção)
                    this.logger.error(`[CommitScheduling] Falha: ${commitResult.error}`);
                }
            }
            // ========== DEDUP GATE (FSM path — principal fonte de race condition) ==========
            const canSend = await this.stateStore.tryRegisterReply(conversationId, finalResponse);
            if (!canSend) {
                this.logger.debug(`DedupGate FSM: resposta idêntica suprimida para ${clientPhone}`);
                await this.saveMessage(conversationId, 'client', text, 'SCHEDULE', false, false);
                return {
                    response: null,
                    intent: 'SCHEDULE',
                    blocked: false,
                    shouldSend: false,
                    statusChanged: false,
                };
            }
            // Persiste state
            await this.stateStore.updateState(conversationId, {
                ...result.nextState,
                userAlreadyGreeted: true,
            });
            await this.saveMessage(conversationId, 'client', text, 'SCHEDULE', false, false);
            await this.saveMessage(conversationId, 'ai', finalResponse, 'SCHEDULE', false, false);
            await this.logInteraction(salonId, conversationId, clientPhone, text, finalResponse, 'SCHEDULE', false, undefined, Date.now() - startTime);
            return {
                response: finalResponse,
                intent: 'SCHEDULE',
                blocked: false,
                shouldSend: true,
                statusChanged: false,
            };
        }
        /**
         * =====================================================
         * COMMIT SCHEDULING TRANSACTION (P0)
         * Cria appointment real no banco usando AppointmentsService
         * =====================================================
         */
        async commitSchedulingTransaction(conversationId, salonId, clientPhone, clientName, state, context) {
            try {
                // ========== IDEMPOTÊNCIA: verifica se já foi commitado ==========
                const currentState = await this.stateStore.getState(conversationId);
                if (currentState.schedulingCommittedAt && currentState.schedulingAppointmentId) {
                    this.logger.log(`[CommitScheduling] Idempotente: já commitado em ${currentState.schedulingCommittedAt}, ` +
                        `appointmentId=${currentState.schedulingAppointmentId}`);
                    // Retorna mensagem de confirmação sem criar novamente
                    return {
                        success: true,
                        appointmentId: currentState.schedulingAppointmentId,
                        response: 'Seu agendamento já está confirmado! ✅',
                    };
                }
                // ========== BUSCA DADOS DO SERVIÇO (duration, price) ==========
                const serviceId = state.slots.serviceId;
                const serviceMatch = context.services.find((s) => s.id === serviceId);
                const serviceName = state.slots.serviceLabel || serviceMatch?.name || 'Serviço';
                // Busca duração do serviço no DB
                let duration = 60; // fallback 60 min
                let price = '0';
                if (serviceId) {
                    const [svc] = await connection_1.db
                        .select({ durationMinutes: schema_1.services.durationMinutes, basePrice: schema_1.services.basePrice })
                        .from(schema_1.services)
                        .where((0, drizzle_orm_1.eq)(schema_1.services.id, parseInt(serviceId, 10)))
                        .limit(1);
                    if (svc) {
                        duration = svc.durationMinutes || 60;
                        price = svc.basePrice || '0';
                    }
                }
                // ========== RESOLVE PROFISSIONAL (se não especificado, pega primeiro disponível) ==========
                let professionalId = state.slots.professionalId;
                let professionalName = state.slots.professionalLabel;
                if (!professionalId && context.professionals && context.professionals.length > 0) {
                    const firstPro = context.professionals[0];
                    professionalId = firstPro.id;
                    professionalName = firstPro.name;
                    this.logger.debug(`[CommitScheduling] Auto-selecionou profissional: ${professionalName}`);
                }
                if (!professionalId) {
                    return { success: false, error: 'Nenhum profissional disponível' };
                }
                // ========== CRIA APPOINTMENT via AppointmentsService ==========
                this.logger.log(`[CommitScheduling] Criando appointment: salonId=${salonId}, service=${serviceName}, ` +
                    `date=${state.slots.dateISO}, time=${state.slots.time}, professional=${professionalName}`);
                const appointment = await this.appointmentsService.create(salonId, {
                    professionalId,
                    service: serviceName,
                    serviceId: serviceId ? parseInt(serviceId, 10) : undefined,
                    date: state.slots.dateISO,
                    time: state.slots.time,
                    duration,
                    price,
                    clientName: clientName || 'Cliente WhatsApp',
                    clientPhone,
                    source: 'WHATSAPP',
                    notes: 'Agendado via Alexis (WhatsApp)',
                }, professionalId);
                this.logger.log(`[CommitScheduling] Appointment criado: id=${appointment.id}, salonId=${salonId}, ` +
                    `conversationId=${conversationId}`);
                // ========== BUSCA DADOS DO SALÃO PARA RESPOSTA (endereço, maps) ==========
                const salonInfo = await this.getSalonInfoForConfirmation(salonId);
                // ========== MONTA RESPOSTA DE CONFIRMAÇÃO ==========
                const dateDisplay = new Date(state.slots.dateISO).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                });
                let confirmationMsg = `Agendamento confirmado! ✅

📅 *${dateDisplay}* às *${state.slots.time}*
✂️ ${serviceName}`;
                if (professionalName) {
                    confirmationMsg += `\n💇 ${professionalName}`;
                }
                // Adiciona endereço se disponível
                if (salonInfo.address) {
                    confirmationMsg += `\n\n📍 *Endereço:*\n${salonInfo.address}`;
                }
                // Adiciona links de navegação
                if (salonInfo.locationUrl) {
                    confirmationMsg += `\n\n🗺️ Google Maps:\n${salonInfo.locationUrl}`;
                }
                if (salonInfo.wazeUrl) {
                    confirmationMsg += `\n\n🚗 Waze:\n${salonInfo.wazeUrl}`;
                }
                confirmationMsg += '\n\nAguardamos você! 💜';
                return {
                    success: true,
                    appointmentId: appointment.id,
                    response: confirmationMsg,
                };
            }
            catch (error) {
                this.logger.error(`[CommitScheduling] Erro: ${error?.message || error}`);
                return { success: false, error: error?.message || 'Erro desconhecido' };
            }
        }
        /**
         * Busca informações do salão para mensagem de confirmação
         */
        async getSalonInfoForConfirmation(salonId) {
            try {
                const [salon] = await connection_1.db
                    .select({
                    address: schema_1.salons.address,
                    locationUrl: schema_1.salons.locationUrl,
                    wazeUrl: schema_1.salons.wazeUrl,
                })
                    .from(schema_1.salons)
                    .where((0, drizzle_orm_1.eq)(schema_1.salons.id, salonId))
                    .limit(1);
                if (!salon)
                    return {};
                return {
                    address: salon.address || undefined,
                    locationUrl: salon.locationUrl || undefined,
                    wazeUrl: salon.wazeUrl || undefined,
                };
            }
            catch (error) {
                this.logger.warn(`Erro ao buscar dados do salão ${salonId}: ${error}`);
                return {};
            }
        }
        /**
         * Constrói SkillContext com profissionais + assignments para o salonId.
         */
        async buildSkillContext(salonId, context) {
            const base = { services: (context.services || []) };
            try {
                const pros = await connection_1.db
                    .select({ id: schema_1.users.id, name: schema_1.users.name, active: schema_1.users.active })
                    .from(schema_1.users)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.users.active, true)));
                base.professionals = pros;
                const assignments = await connection_1.db
                    .select({
                    professionalId: schema_1.professionalServices.professionalId,
                    serviceId: schema_1.professionalServices.serviceId,
                    enabled: schema_1.professionalServices.enabled,
                })
                    .from(schema_1.professionalServices)
                    .where((0, drizzle_orm_1.eq)(schema_1.professionalServices.enabled, true));
                // Filter only for professionals in this salon
                const proIds = new Set(pros.map((p) => p.id));
                base.professionalAssignments = assignments.filter((a) => proIds.has(a.professionalId));
            }
            catch (error) {
                this.logger.debug(`buildSkillContext professionals fallback: ${error?.message?.slice(0, 80)}`);
            }
            return base;
        }
        /**
         * =====================================================
         * LEXICON SERVICE PRICE — Detecta dialeto de salão em perguntas de preço
         * Ex: "quanto custa a progressiva?" → preço de Alisamento (serviço)
         * =====================================================
         */
        async tryLexiconServicePrice(conversationId, salonId, clientPhone, text, startTime) {
            try {
                // Só ativa se parece pergunta de preço
                const normalized = text.toLowerCase();
                const isPriceQ = /\b(quanto\s+custa|qual\s+(o\s+)?pre[cç]o|valor\s+d|pre[cç]o\s+d)/.test(normalized);
                if (!isPriceQ)
                    return null;
                const lexMatch = (0, lexicon_resolver_1.matchLexicon)(text);
                // Telemetria: registra decisão do lexicon
                const telemetry = (0, lexicon_telemetry_1.buildLexiconTelemetry)(lexMatch, true);
                this.logLexiconTelemetry(telemetry);
                if (!lexMatch || !lexMatch.entry.suggestedServiceKey)
                    return null;
                if (lexMatch.entry.entityType !== 'SERVICE' && lexMatch.entry.entityType !== 'TECHNIQUE')
                    return null;
                // Busca serviço no catálogo via ServicePriceResolver
                const context = await this.dataCollector.collectContext(salonId, clientPhone);
                const services = context.services || [];
                const priceResult = (0, service_price_resolver_1.resolveServicePrice)(lexMatch.entry.canonical, services);
                // Resposta premium: com preço se existir, consultiva se não
                const response = (0, service_price_resolver_1.formatServicePriceResponse)(lexMatch.matchedTrigger, lexMatch.entry.canonical, priceResult);
                await this.saveMessage(conversationId, 'client', text, 'PRICE_INFO', false, false);
                await this.saveMessage(conversationId, 'ai', response, 'PRICE_INFO', false, false);
                await this.logInteraction(salonId, conversationId, clientPhone, text, response, 'PRICE_INFO', false, undefined, Date.now() - startTime);
                return {
                    response,
                    intent: 'PRICE_INFO',
                    blocked: false,
                    shouldSend: true,
                    statusChanged: false,
                };
            }
            catch (error) {
                this.logger.debug(`Lexicon price fallback: ${error?.message?.slice(0, 80)}`);
                return null;
            }
        }
        /**
         * Registra telemetria do lexicon (1 evento por turno, sem texto do usuário).
         */
        logLexiconTelemetry(event) {
            this.logger.debug(`Lexicon: enabled=${event.lexiconEnabled} entry=${event.entryId || '-'} ` +
                `trigger="${event.matchedTrigger || '-'}" conf=${event.confidence ?? '-'} ` +
                `decision=${event.decision} reason=${event.reason}`);
        }
        /**
         * =====================================================
         * INFO INTERRUPTION — Responde pergunta de info durante scheduling
         * Usa ProductInfo determinístico ou Gemini como fallback
         * =====================================================
         */
        async resolveInfoInterruption(salonId, text, context) {
            try {
                // Tenta ProductInfo determinístico primeiro
                const productAnswer = await this.productInfo.tryAnswerProductInfo(salonId, text);
                if (productAnswer)
                    return productAnswer;
                // Fallback: Gemini para perguntas genéricas (horário de funcionamento, etc.)
                return await this.gemini.generateResponse(context.salon?.name || 'Salão', text, context);
            }
            catch {
                return 'No momento não consegui buscar essa informação, mas posso tentar depois 😊';
            }
        }
        /**
         * =====================================================
         * FSM START — Envia link de agendamento online
         * (Antes: iniciava scheduling skill via FSM)
         * =====================================================
         */
        async handleFSMStart(conversationId, salonId, clientPhone, _clientName, text, _state, startTime) {
            const context = await this.dataCollector.collectContext(salonId, clientPhone);
            const services = context.services || [];
            // Tenta identificar serviço mencionado na mensagem
            const matched = (0, schedule_continuation_1.fuzzyMatchService)(text, services);
            // Gera link de agendamento assistido
            const replyText = await this.generateBookingLinkResponse(salonId, clientPhone, matched?.id, matched?.name);
            await this.stateStore.updateState(conversationId, {
                userAlreadyGreeted: true,
            });
            await this.saveMessage(conversationId, 'client', text, 'SCHEDULE', false, false);
            await this.saveMessage(conversationId, 'ai', replyText, 'SCHEDULE', false, false);
            await this.logInteraction(salonId, conversationId, clientPhone, text, replyText, 'SCHEDULE', false, undefined, Date.now() - startTime);
            return {
                response: replyText,
                intent: 'SCHEDULE',
                blocked: false,
                shouldSend: true,
                statusChanged: false,
            };
            /* ========== CÓDIGO ANTIGO: FSM SCHEDULING (comentado para referência) ==========
            // Se o texto já contém um serviço, pular AWAITING_SERVICE e ir direto
            const skillCtx = await this.buildSkillContext(salonId, context);
            const result = startScheduling();
        
            // Tenta já resolver serviço na mesma mensagem (ex.: "quero agendar alisamento")
            if (matched) {
              const turnResult = handleSchedulingTurn(
                { ...state, ...result.nextState } as ConversationState,
                text,
                skillCtx,
              );
        
              await this.stateStore.updateState(conversationId, {
                ...turnResult.nextState,
                userAlreadyGreeted: true,
              });
        
              await this.saveMessage(conversationId, 'client', text, 'SCHEDULE', false, false);
              await this.saveMessage(conversationId, 'ai', turnResult.replyText, 'SCHEDULE', false, false);
        
              await this.logInteraction(
                salonId, conversationId, clientPhone,
                text, turnResult.replyText, 'SCHEDULE',
                false, undefined, Date.now() - startTime,
              );
        
              return {
                response: turnResult.replyText,
                intent: 'SCHEDULE',
                blocked: false,
                shouldSend: true,
                statusChanged: false,
              };
            }
        
            // Sem serviço na mensagem — pergunta
            await this.stateStore.updateState(conversationId, {
              ...result.nextState,
              userAlreadyGreeted: true,
            });
        
            // Lista serviços na primeira pergunta
            const serviceList = services
              .slice(0, 8)
              .map((s: any) => `• ${s.name} - R$ ${s.price}`)
              .join('\n');
        
            const replyText = serviceList
              ? `Claro, vou te ajudar a agendar! 😊\n\nQual serviço você gostaria?\n\n${serviceList}\n\nÉ só me dizer o serviço e sua preferência de dia/horário!`
              : result.replyText;
        
            await this.saveMessage(conversationId, 'client', text, 'SCHEDULE', false, false);
            await this.saveMessage(conversationId, 'ai', replyText, 'SCHEDULE', false, false);
        
            await this.logInteraction(
              salonId, conversationId, clientPhone,
              text, replyText, 'SCHEDULE',
              false, undefined, Date.now() - startTime,
            );
        
            return {
              response: replyText,
              intent: 'SCHEDULE',
              blocked: false,
              shouldSend: true,
              statusChanged: false,
            };
            ========== FIM CÓDIGO ANTIGO ========== */
        }
        /**
         * =====================================================
         * GERA RESPOSTA COM LINK DE AGENDAMENTO ONLINE
         * =====================================================
         */
        async generateBookingLinkResponse(salonId, clientPhone, serviceId, serviceName) {
            try {
                const result = await this.onlineBookingSettings.generateAssistedLink({
                    salonId,
                    serviceId,
                    clientPhone: clientPhone?.replace(/\D/g, ''),
                });
                const serviceText = serviceName ? `*${serviceName}*` : 'o serviço desejado';
                return `Entendi! Você quer agendar ${serviceText} 💇‍♀️

Clique no link abaixo para escolher o melhor horário:
🔗 ${result.url}

⏰ Link válido por 24 horas.`;
            }
            catch (error) {
                this.logger.error('Erro ao gerar link de agendamento:', error);
                return 'Desculpe, tive um problema ao gerar o link de agendamento. Por favor, entre em contato pelo telefone do salão.';
            }
        }
        /**
         * =====================================================
         * CONTINUAÇÃO TRANSACIONAL DE AGENDAMENTO
         * Se a última mensagem do assistant foi um prompt de serviço,
         * interpreta a resposta do usuário como seleção de serviço.
         * =====================================================
         */
        async checkScheduleContinuation(conversationId, salonId, clientPhone, message, startTime) {
            try {
                // Busca última mensagem do assistant
                const [lastAi] = await connection_1.db
                    .select({ content: schema_1.aiMessages.content })
                    .from(schema_1.aiMessages)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiMessages.conversationId, conversationId), (0, drizzle_orm_1.eq)(schema_1.aiMessages.role, 'ai')))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.aiMessages.createdAt))
                    .limit(1);
                if (!lastAi || !(0, schedule_continuation_1.isSchedulePrompt)(lastAi.content))
                    return null;
                this.logger.log(`Schedule continuation detectado para: "${message}"`);
                // Carrega serviços
                const context = await this.dataCollector.collectContext(salonId, clientPhone);
                const services = context.services || [];
                if (services.length === 0)
                    return null;
                const matched = (0, schedule_continuation_1.fuzzyMatchService)(message, services);
                if (matched) {
                    // Serviço encontrado — prossegue com agendamento (busca horários)
                    const aiResponse = await this.handleSchedulingIntent(salonId, clientPhone, message, context);
                    await this.saveMessage(conversationId, 'client', message, 'SCHEDULE', false, false);
                    await this.saveMessage(conversationId, 'ai', aiResponse, 'SCHEDULE', false, false);
                    await this.logInteraction(salonId, conversationId, clientPhone, message, aiResponse, 'SCHEDULE', false, undefined, Date.now() - startTime);
                    return {
                        response: aiResponse,
                        intent: 'SCHEDULE',
                        blocked: false,
                        shouldSend: true,
                        statusChanged: false,
                    };
                }
                // Não conseguiu mapear — pede esclarecimento sem re-listar tudo
                const clarification = 'Não encontrei esse serviço. Pode repetir o nome? Por exemplo: corte, mechas, alisamento… 😊';
                await this.saveMessage(conversationId, 'client', message, 'SCHEDULE', false, false);
                await this.saveMessage(conversationId, 'ai', clarification, 'SCHEDULE', false, false);
                await this.logInteraction(salonId, conversationId, clientPhone, message, clarification, 'SCHEDULE', false, undefined, Date.now() - startTime);
                return {
                    response: clarification,
                    intent: 'SCHEDULE',
                    blocked: false,
                    shouldSend: true,
                    statusChanged: false,
                };
            }
            catch (error) {
                this.logger.warn('Erro no schedule continuation guard:', error?.message);
                return null; // Fallback para fluxo normal
            }
        }
        /**
         * =====================================================
         * AGENDAMENTO VIA WHATSAPP
         * =====================================================
         */
        async handleSchedulingIntent(salonId, _clientPhone, message, context) {
            const services = context.services || [];
            if (services.length === 0) {
                return 'No momento não consigo verificar os serviços disponíveis. Por favor, entre em contato com o salão diretamente! 😊';
            }
            // Verifica se o cliente mencionou algum serviço (fuzzy match com normalização)
            const mentionedService = (0, schedule_continuation_1.fuzzyMatchService)(message, services);
            if (!mentionedService) {
                const serviceList = services
                    .slice(0, 8)
                    .map((s) => `• ${s.name} - R$ ${s.price}`)
                    .join('\n');
                return `Claro, vou te ajudar a agendar! 😊\n\nQual serviço você gostaria?\n\n${serviceList}\n\nÉ só me dizer o serviço e sua preferência de dia/horário!`;
            }
            // Busca horários disponíveis para amanhã
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const slots = await this.scheduler.getAvailableSlots(salonId, mentionedService.id, tomorrow);
            if (slots.length === 0) {
                return `Poxa, não temos horários disponíveis amanhã para ${mentionedService.name}. 😔\n\nQuer que eu verifique outra data?`;
            }
            const slotList = this.scheduler.formatAvailableSlots(slots, 6);
            return `Ótimo! Para ${mentionedService.name}, temos esses horários amanhã:\n\n${slotList}\n\nQual fica melhor pra você? 😊`;
        }
        /**
         * =====================================================
         * PRODUTOS VIA WHATSAPP (ALFA.2)
         * =====================================================
         */
        async handleProductIntent(salonId, message) {
            // CAN_RESERVE_PRODUCTS seria uma flag de configuração do salão
            // Por ora, assumimos false (não pode reservar automaticamente)
            const canReserve = false;
            try {
                return await this.catalog.handleProductIntent(salonId, message, canReserve);
            }
            catch (error) {
                this.logger.error('Erro ao buscar produto:', error?.message || error);
                return 'Desculpe, não consegui verificar os produtos no momento. Quer que eu chame a recepção pra te ajudar? 😊';
            }
        }
        /**
         * =====================================================
         * CONFIRMAÇÃO DE AGENDAMENTO VIA WHATSAPP
         * =====================================================
         */
        async handleAppointmentConfirmation(salonId, clientPhone, isConfirm) {
            // Formata variações do telefone para busca
            const phoneClean = clientPhone.replace(/\D/g, '');
            const phoneVariants = [phoneClean, phoneClean.replace(/^55/, ''), `55${phoneClean.replace(/^55/, '')}`];
            // Busca agendamento pendente de confirmação para este telefone
            const pendingAppointments = await connection_1.db
                .select()
                .from(schema_1.appointments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointments.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.appointments.status, 'PENDING_CONFIRMATION')))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.appointments.createdAt))
                .limit(20);
            // Encontra agendamento que corresponde ao telefone
            const appointment = pendingAppointments.find((apt) => {
                const aptPhone = apt.clientPhone?.replace(/\D/g, '') || '';
                return phoneVariants.some((p) => aptPhone.includes(p) || p.includes(aptPhone) || aptPhone === p || p === aptPhone);
            });
            if (!appointment) {
                // Não encontrou agendamento pendente - não manipula
                return { handled: false, response: '' };
            }
            if (isConfirm) {
                // ========== CONFIRMA AGENDAMENTO ==========
                await connection_1.db
                    .update(schema_1.appointments)
                    .set({
                    status: 'CONFIRMED',
                    confirmationStatus: 'CONFIRMED',
                    confirmedAt: new Date(),
                    confirmedVia: 'WHATSAPP',
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.appointments.id, appointment.id));
                // Registra resposta na notificação
                await connection_1.db
                    .update(schema_1.appointmentNotifications)
                    .set({
                    clientResponse: 'CONFIRMED',
                    clientRespondedAt: new Date(),
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointmentNotifications.appointmentId, appointment.id), (0, drizzle_orm_1.eq)(schema_1.appointmentNotifications.notificationType, 'APPOINTMENT_CONFIRMATION')));
                this.logger.log(`Agendamento ${appointment.id} CONFIRMADO via WhatsApp por ${clientPhone}`);
                const dateFormatted = new Date(appointment.date).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                });
                return {
                    handled: true,
                    response: `Ótimo! Seu agendamento está *confirmado*! ✅

📅 ${dateFormatted}
🕐 ${appointment.time}
✂️ ${appointment.service}

Aguardamos você! 💜`,
                };
            }
            // ========== CANCELA AGENDAMENTO ==========
            await connection_1.db
                .update(schema_1.appointments)
                .set({
                status: 'CANCELLED',
                cancellationReason: 'Cancelado pelo cliente via WhatsApp',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.appointments.id, appointment.id));
            // Registra resposta na notificação
            await connection_1.db
                .update(schema_1.appointmentNotifications)
                .set({
                clientResponse: 'CANCELLED',
                clientRespondedAt: new Date(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointmentNotifications.appointmentId, appointment.id), (0, drizzle_orm_1.eq)(schema_1.appointmentNotifications.notificationType, 'APPOINTMENT_CONFIRMATION')));
            // Cancela lembretes futuros
            await connection_1.db
                .update(schema_1.appointmentNotifications)
                .set({
                status: 'CANCELLED',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointmentNotifications.appointmentId, appointment.id), (0, drizzle_orm_1.eq)(schema_1.appointmentNotifications.status, 'SCHEDULED')));
            this.logger.log(`Agendamento ${appointment.id} CANCELADO via WhatsApp por ${clientPhone}`);
            return {
                handled: true,
                response: `Agendamento *cancelado* com sucesso. 😔

Quando quiser, agende novamente! Estamos à disposição. 💜`,
            };
        }
        /**
         * =====================================================
         * LIST_SERVICES — Lista serviços do salão via DB (P0.5)
         * =====================================================
         */
        async handleListServices(conversationId, salonId, clientPhone, clientName, text, state, startTime) {
            const context = await this.dataCollector.collectContext(salonId, clientPhone);
            const services = (context.services || []);
            let responseText;
            if (services.length === 0) {
                responseText = 'No momento não consegui carregar a lista de serviços. Entre em contato diretamente com o salão!';
            }
            else {
                const list = services
                    .filter((s) => s.active !== false)
                    .slice(0, 10)
                    .map((s, i) => {
                    const price = s.price ? ` - R$ ${s.price}` : '';
                    const duration = s.durationMinutes ? ` (${s.durationMinutes}min)` : '';
                    return `${i + 1}. ${s.name}${price}${duration}`;
                })
                    .join('\n');
                responseText = `Nossos serviços:\n\n${list}\n\nQuer agendar algum deles? É só me dizer! 😊`;
            }
            // Compose com greeting policy
            const finalResponse = await this.composer.compose({
                salonId,
                phone: clientPhone,
                clientName,
                intent: 'LIST_SERVICES',
                baseText: responseText,
                skipGreeting: state.userAlreadyGreeted,
            });
            if (!state.userAlreadyGreeted) {
                await this.stateStore.updateState(conversationId, {
                    userAlreadyGreeted: true,
                    lastGreetingAt: (0, conversation_state_1.nowIso)(),
                });
            }
            // Dedup gate
            const canSend = await this.stateStore.tryRegisterReply(conversationId, finalResponse);
            if (!canSend) {
                this.logger.debug(`DedupGate LIST_SERVICES: suprimido para ${clientPhone}`);
                await this.saveMessage(conversationId, 'client', text, 'LIST_SERVICES', false, false);
                return { response: null, intent: 'LIST_SERVICES', blocked: false, shouldSend: false, statusChanged: false };
            }
            await this.saveMessage(conversationId, 'client', text, 'LIST_SERVICES', false, false);
            await this.saveMessage(conversationId, 'ai', finalResponse, 'LIST_SERVICES', false, false);
            await this.logInteraction(salonId, conversationId, clientPhone, text, finalResponse, 'LIST_SERVICES', false, undefined, Date.now() - startTime);
            return { response: finalResponse, intent: 'LIST_SERVICES', blocked: false, shouldSend: true, statusChanged: false };
        }
        /**
         * =====================================================
         * GESTÃO DE CONVERSAS
         * =====================================================
         */
        /**
         * Carrega os últimos N turnos da conversa (client + ai) em ordem cronológica.
         * Reutiliza padrão Belle (ai-assistant.service.ts) adaptado para aiMessages.
         */
        async getRecentHistory(conversationId, limit) {
            try {
                const rows = await connection_1.db
                    .select({ role: schema_1.aiMessages.role, content: schema_1.aiMessages.content })
                    .from(schema_1.aiMessages)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiMessages.conversationId, conversationId), (0, drizzle_orm_1.sql) `${schema_1.aiMessages.role} IN ('client', 'ai')`, (0, drizzle_orm_1.sql) `${schema_1.aiMessages.isCommand} = false`))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.aiMessages.createdAt))
                    .limit(limit);
                // Reverse para ordem cronológica (oldest first)
                return rows.reverse().map((r) => ({
                    role: r.role,
                    content: r.content,
                }));
            }
            catch (error) {
                this.logger.warn('Falha ao carregar histórico de conversa:', error?.message);
                return [];
            }
        }
        async getOrCreateConversation(salonId, clientPhone, clientName) {
            // Busca conversa ativa
            const [existing] = await connection_1.db
                .select()
                .from(schema_1.aiConversations)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiConversations.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.aiConversations.clientPhone, clientPhone), (0, drizzle_orm_1.sql) `${schema_1.aiConversations.status} != 'CLOSED'`))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.aiConversations.createdAt))
                .limit(1);
            if (existing)
                return existing;
            // Cria nova conversa
            const [newConversation] = await connection_1.db
                .insert(schema_1.aiConversations)
                .values({
                salonId,
                clientPhone,
                clientName,
                status: 'AI_ACTIVE',
                lastMessageAt: new Date(),
            })
                .returning();
            return newConversation;
        }
        async saveMessage(conversationId, role, content, intent, wasBlocked, isCommand, blockReason) {
            await connection_1.db.insert(schema_1.aiMessages).values({
                conversationId,
                role,
                content,
                intent,
                wasBlocked,
                isCommand,
                blockReason,
            });
            await connection_1.db
                .update(schema_1.aiConversations)
                .set({
                lastMessageAt: new Date(),
                messagesCount: (0, drizzle_orm_1.sql) `${schema_1.aiConversations.messagesCount} + 1`,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.aiConversations.id, conversationId));
        }
        async logInteraction(salonId, conversationId, clientPhone, messageIn, messageOut, intent, wasBlocked, blockReason, responseTimeMs) {
            await connection_1.db.insert(schema_1.aiInteractionLogs).values({
                salonId,
                conversationId,
                clientPhone,
                messageIn,
                messageOut,
                intent,
                wasBlocked,
                blockReason,
                responseTimeMs,
            });
        }
        /**
         * =====================================================
         * CONFIGURAÇÕES
         * =====================================================
         */
        async getSettings(salonId) {
            const [settings] = await connection_1.db.select().from(schema_1.aiSettings).where((0, drizzle_orm_1.eq)(schema_1.aiSettings.salonId, salonId)).limit(1);
            if (!settings) {
                // Cria configurações padrão
                const [newSettings] = await connection_1.db.insert(schema_1.aiSettings).values({ salonId }).returning();
                return newSettings;
            }
            return settings;
        }
        async updateSettings(salonId, updates) {
            const [existing] = await connection_1.db.select().from(schema_1.aiSettings).where((0, drizzle_orm_1.eq)(schema_1.aiSettings.salonId, salonId)).limit(1);
            if (!existing) {
                return connection_1.db.insert(schema_1.aiSettings).values({ salonId, ...updates }).returning();
            }
            return connection_1.db
                .update(schema_1.aiSettings)
                .set({ ...updates, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.aiSettings.salonId, salonId))
                .returning();
        }
        /**
         * =====================================================
         * LISTAGEM DE CONVERSAS E MENSAGENS
         * =====================================================
         */
        async getConversations(salonId, status) {
            const whereCondition = status
                ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiConversations.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.aiConversations.status, status))
                : (0, drizzle_orm_1.eq)(schema_1.aiConversations.salonId, salonId);
            return connection_1.db.select().from(schema_1.aiConversations).where(whereCondition).orderBy((0, drizzle_orm_1.desc)(schema_1.aiConversations.lastMessageAt)).limit(50);
        }
        async getMessages(conversationId) {
            return connection_1.db.select().from(schema_1.aiMessages).where((0, drizzle_orm_1.eq)(schema_1.aiMessages.conversationId, conversationId)).orderBy(schema_1.aiMessages.createdAt);
        }
        /**
         * =====================================================
         * BRIEFING DO DASHBOARD
         * =====================================================
         */
        async generateBriefing(salonId, userId, userRole, userName) {
            const data = await this.dataCollector.collectDashboardData(salonId, userId, userRole);
            const briefing = await this.gemini.generateBriefing(userName, userRole, data);
            // Salva o briefing
            await connection_1.db.insert(schema_1.aiBriefings).values({
                salonId,
                userId,
                userRole,
                content: briefing,
                data,
            });
            return briefing;
        }
        /**
         * =====================================================
         * LOGS E AUDITORIA
         * =====================================================
         */
        async getInteractionLogs(salonId, limit = 100) {
            return connection_1.db.select().from(schema_1.aiInteractionLogs).where((0, drizzle_orm_1.eq)(schema_1.aiInteractionLogs.salonId, salonId)).orderBy((0, drizzle_orm_1.desc)(schema_1.aiInteractionLogs.createdAt)).limit(limit);
        }
        async getBlockedTermsLogs(salonId, limit = 100) {
            return connection_1.db.select().from(schema_1.aiBlockedTermsLog).where((0, drizzle_orm_1.eq)(schema_1.aiBlockedTermsLog.salonId, salonId)).orderBy((0, drizzle_orm_1.desc)(schema_1.aiBlockedTermsLog.createdAt)).limit(limit);
        }
        /**
         * Verifica se o serviço está operacional
         */
        isEnabled() {
            return this.gemini.isAvailable();
        }
        /**
         * =====================================================
         * SESSIONS (Dashboard)
         * =====================================================
         */
        async getSessions(salonId) {
            return connection_1.db.select().from(schema_1.aiConversations).where((0, drizzle_orm_1.eq)(schema_1.aiConversations.salonId, salonId)).orderBy((0, drizzle_orm_1.desc)(schema_1.aiConversations.updatedAt)).limit(100);
        }
        async getSessionMessages(salonId, sessionId) {
            // Verifica se a sessão pertence ao salão
            const session = await connection_1.db
                .select()
                .from(schema_1.aiConversations)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiConversations.id, sessionId), (0, drizzle_orm_1.eq)(schema_1.aiConversations.salonId, salonId)))
                .limit(1);
            if (!session.length)
                return [];
            return connection_1.db.select().from(schema_1.aiMessages).where((0, drizzle_orm_1.eq)(schema_1.aiMessages.conversationId, sessionId)).orderBy(schema_1.aiMessages.createdAt);
        }
        async endSession(salonId, sessionId) {
            await connection_1.db
                .update(schema_1.aiConversations)
                .set({ status: 'ENDED', updatedAt: new Date() })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiConversations.id, sessionId), (0, drizzle_orm_1.eq)(schema_1.aiConversations.salonId, salonId)));
            return { success: true, message: 'Sessão encerrada' };
        }
        /**
         * =====================================================
         * COMPLIANCE & METRICS
         * =====================================================
         */
        async getComplianceStats(salonId) {
            // Total de mensagens bloqueadas
            const blocked = await connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema_1.aiBlockedTermsLog)
                .where((0, drizzle_orm_1.eq)(schema_1.aiBlockedTermsLog.salonId, salonId));
            // Total de interações
            const interactions = await connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema_1.aiInteractionLogs)
                .where((0, drizzle_orm_1.eq)(schema_1.aiInteractionLogs.salonId, salonId));
            // Sessões com takeover humano
            const humanTakeovers = await connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema_1.aiConversations)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiConversations.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.aiConversations.status, 'HUMAN_ACTIVE')));
            return {
                totalBlocked: blocked[0]?.count || 0,
                totalInteractions: interactions[0]?.count || 0,
                humanTakeovers: humanTakeovers[0]?.count || 0,
                complianceRate: interactions[0]?.count
                    ? Math.round(((interactions[0].count - (blocked[0]?.count || 0)) / interactions[0].count) * 100)
                    : 100,
            };
        }
        async getMetrics(salonId) {
            // Total de conversas
            const conversations = await connection_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.aiConversations).where((0, drizzle_orm_1.eq)(schema_1.aiConversations.salonId, salonId));
            // Conversas ativas
            const activeConversations = await connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema_1.aiConversations)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiConversations.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.aiConversations.status, 'AI_ACTIVE')));
            // Total de mensagens
            const messagesResult = await connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema_1.aiMessages)
                .innerJoin(schema_1.aiConversations, (0, drizzle_orm_1.eq)(schema_1.aiMessages.conversationId, schema_1.aiConversations.id))
                .where((0, drizzle_orm_1.eq)(schema_1.aiConversations.salonId, salonId));
            return {
                totalConversations: conversations[0]?.count || 0,
                activeConversations: activeConversations[0]?.count || 0,
                totalMessages: messagesResult[0]?.count || 0,
                avgMessagesPerConversation: conversations[0]?.count
                    ? Math.round((messagesResult[0]?.count || 0) / conversations[0].count)
                    : 0,
            };
        }
        /**
         * =====================================================
         * TAKEOVER & RESUME
         * =====================================================
         */
        async humanTakeover(salonId, sessionId, userId) {
            await connection_1.db
                .update(schema_1.aiConversations)
                .set({
                status: 'HUMAN_ACTIVE',
                humanAgentId: userId,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiConversations.id, sessionId), (0, drizzle_orm_1.eq)(schema_1.aiConversations.salonId, salonId)));
            return { success: true, message: 'Atendimento assumido' };
        }
        async aiResume(salonId, sessionId) {
            await connection_1.db
                .update(schema_1.aiConversations)
                .set({
                status: 'AI_ACTIVE',
                humanAgentId: null,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiConversations.id, sessionId), (0, drizzle_orm_1.eq)(schema_1.aiConversations.salonId, salonId)));
            return { success: true, message: 'Alexis retomou o atendimento' };
        }
        async sendHumanMessage(salonId, sessionId, message, _userId) {
            // Verifica se a sessão pertence ao salão
            const session = await connection_1.db
                .select()
                .from(schema_1.aiConversations)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.aiConversations.id, sessionId), (0, drizzle_orm_1.eq)(schema_1.aiConversations.salonId, salonId)))
                .limit(1);
            if (!session.length) {
                return { success: false, message: 'Sessão não encontrada' };
            }
            // Salva a mensagem
            await connection_1.db.insert(schema_1.aiMessages).values({
                conversationId: sessionId,
                role: 'human', // Mensagem do atendente humano
                content: message,
                intent: 'HUMAN_MESSAGE',
            });
            // Atualiza timestamp da conversa
            await connection_1.db.update(schema_1.aiConversations).set({ updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.aiConversations.id, sessionId));
            return { success: true, message: 'Mensagem enviada' };
        }
        /**
         * Deleta histórico do chat do dashboard
         */
        async deleteDashboardChatHistory(userId) {
            // Busca conversas do dashboard deste usuário
            const conversations = await connection_1.db.select().from(schema_1.aiConversations).where((0, drizzle_orm_1.eq)(schema_1.aiConversations.clientPhone, `dashboard-${userId}`));
            // Deleta mensagens das conversas
            for (const conv of conversations) {
                await connection_1.db.delete(schema_1.aiMessages).where((0, drizzle_orm_1.eq)(schema_1.aiMessages.conversationId, conv.id));
            }
            // Deleta as conversas
            await connection_1.db.delete(schema_1.aiConversations).where((0, drizzle_orm_1.eq)(schema_1.aiConversations.clientPhone, `dashboard-${userId}`));
            return { success: true, message: 'Histórico deletado' };
        }
    };
    return AlexisService = _classThis;
})();
exports.AlexisService = AlexisService;
//# sourceMappingURL=alexis.service.js.map