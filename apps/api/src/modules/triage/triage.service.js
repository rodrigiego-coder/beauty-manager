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
exports.TriageService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../database/schema");
const crypto_1 = require("crypto");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
// Máximo de tentativas de acesso por token
const MAX_ACCESS_ATTEMPTS = 10;
// Tempo de expiração padrão (72h) se agendamento não tiver data
const DEFAULT_EXPIRATION_HOURS = 72;
let TriageService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TriageService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TriageService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        auditService;
        logger = new common_1.Logger(TriageService.name);
        constructor(db, auditService) {
            this.db = db;
            this.auditService = auditService;
        }
        // ==================== UTILIDADES DE SEGURANÇA ====================
        /**
         * Gera hash SHA-256 do token
         * IMPORTANTE: Token raw NUNCA é armazenado
         */
        hashToken(rawToken) {
            return (0, crypto_1.createHash)('sha256').update(rawToken).digest('hex');
        }
        /**
         * Gera token criptograficamente seguro
         */
        generateSecureToken() {
            const raw = (0, crypto_1.randomBytes)(32).toString('hex'); // 64 chars
            const hash = this.hashToken(raw);
            return { raw, hash };
        }
        /**
         * Mascara token para logs (nunca expor token completo)
         */
        maskToken(token) {
            if (!token || token.length < 12)
                return '***';
            return `${token.substring(0, 8)}...${token.substring(token.length - 4)}`;
        }
        // ==================== FORMULÁRIOS ====================
        /**
         * Busca formulário ativo para um serviço
         */
        async getFormForService(salonId, serviceId) {
            const forms = await this.db
                .select()
                .from(schema_1.triageForms)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.triageForms.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.triageForms.isActive, true)));
            if (!forms.length)
                return null;
            if (serviceId) {
                const specificForm = forms.find((form) => {
                    if (!form.serviceIds)
                        return false;
                    return form.serviceIds.includes(serviceId);
                });
                if (specificForm)
                    return specificForm;
            }
            return forms.find((f) => f.serviceCategory === 'QUIMICA') || forms[0];
        }
        /**
         * Busca formulário com suas perguntas
         */
        async getFormWithQuestions(formId) {
            const [form] = await this.db
                .select()
                .from(schema_1.triageForms)
                .where((0, drizzle_orm_1.eq)(schema_1.triageForms.id, formId))
                .limit(1);
            if (!form) {
                throw new common_1.NotFoundException('Formulário não encontrado');
            }
            const questions = await this.db
                .select()
                .from(schema_1.triageQuestions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.triageQuestions.formId, formId), (0, drizzle_orm_1.eq)(schema_1.triageQuestions.isActive, true)))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.triageQuestions.sortOrder));
            const groupedQuestions = this.groupQuestionsByCategory(questions);
            return {
                ...form,
                questions,
                groupedQuestions,
            };
        }
        /**
         * Lista todos os formulários de um salão
         */
        async listForms(salonId) {
            return this.db
                .select()
                .from(schema_1.triageForms)
                .where((0, drizzle_orm_1.eq)(schema_1.triageForms.salonId, salonId))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.triageForms.name));
        }
        // ==================== CRIAÇÃO DE TRIAGEM ====================
        /**
         * Cria resposta de triagem para um agendamento
         * SEGURANÇA: Armazena apenas hash do token
         */
        async createTriageResponse(salonId, appointmentId, formId, clientId) {
            // Verifica se já existe resposta para este agendamento
            const [existing] = await this.db
                .select()
                .from(schema_1.triageResponses)
                .where((0, drizzle_orm_1.eq)(schema_1.triageResponses.appointmentId, appointmentId))
                .limit(1);
            if (existing) {
                // Se já existe e está pendente, regenerar token
                if (existing.status === 'PENDING' && !existing.usedAt) {
                    const { raw, hash } = this.generateSecureToken();
                    await this.db
                        .update(schema_1.triageResponses)
                        .set({
                        tokenHash: hash,
                        accessToken: null, // Remove token legado
                        accessAttempts: 0,
                        updatedAt: new Date(),
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.triageResponses.id, existing.id));
                    return {
                        id: existing.id,
                        publicLink: this.generatePublicLink(raw),
                        expiresAt: existing.expiresAt,
                        alreadyExists: true,
                    };
                }
                // Já foi usado ou completado
                return {
                    id: existing.id,
                    publicLink: '', // Não gerar novo link
                    expiresAt: existing.expiresAt,
                    alreadyExists: true,
                };
            }
            const [form] = await this.db
                .select()
                .from(schema_1.triageForms)
                .where((0, drizzle_orm_1.eq)(schema_1.triageForms.id, formId))
                .limit(1);
            if (!form) {
                throw new common_1.NotFoundException('Formulário não encontrado');
            }
            // Busca data do agendamento para calcular expiração
            const [appointment] = await this.db
                .select()
                .from(schema_1.appointments)
                .where((0, drizzle_orm_1.eq)(schema_1.appointments.id, appointmentId))
                .limit(1);
            const appointmentDate = appointment?.date
                ? new Date(`${appointment.date}T${appointment.time || appointment.startTime || '23:59'}:00`)
                : (0, date_fns_1.addHours)(new Date(), DEFAULT_EXPIRATION_HOURS);
            // Expiração: menor entre 72h ou data do agendamento
            const expiresAt = (0, date_fns_1.min)([
                (0, date_fns_1.addHours)(new Date(), DEFAULT_EXPIRATION_HOURS),
                appointmentDate,
            ]);
            // Gera token seguro
            const { raw, hash } = this.generateSecureToken();
            const [response] = await this.db
                .insert(schema_1.triageResponses)
                .values({
                salonId,
                appointmentId,
                formId,
                clientId: clientId || null,
                formVersion: form.version,
                status: 'PENDING',
                expiresAt,
                tokenHash: hash, // ← Armazena HASH
                accessToken: null, // ← Não armazena token raw
                accessAttempts: 0,
            })
                .returning();
            this.logger.log(`Triagem criada para agendamento ${appointmentId}, token: ${this.maskToken(raw)}`);
            return {
                id: response.id,
                publicLink: this.generatePublicLink(raw),
                expiresAt,
            };
        }
        // ==================== ACESSO PÚBLICO (COM SEGURANÇA) ====================
        /**
         * Busca resposta por token (acesso público)
         * SEGURANÇA: Valida hash, expiração, uso único, rate limit
         */
        async getResponseByToken(rawToken, ipAddress, userAgent) {
            const tokenHash = this.hashToken(rawToken);
            // Busca por hash (não por token raw)
            const [response] = await this.db
                .select()
                .from(schema_1.triageResponses)
                .where((0, drizzle_orm_1.eq)(schema_1.triageResponses.tokenHash, tokenHash))
                .limit(1);
            // Fallback: busca por token legado (migração)
            if (!response) {
                const [legacyResponse] = await this.db
                    .select()
                    .from(schema_1.triageResponses)
                    .where((0, drizzle_orm_1.eq)(schema_1.triageResponses.accessToken, rawToken))
                    .limit(1);
                if (legacyResponse) {
                    // Migra para hash
                    await this.db
                        .update(schema_1.triageResponses)
                        .set({
                        tokenHash,
                        accessToken: null,
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.triageResponses.id, legacyResponse.id));
                    return this.validateAndReturnResponse(legacyResponse, ipAddress, userAgent);
                }
                throw new common_1.NotFoundException('Triagem não encontrada');
            }
            return this.validateAndReturnResponse(response, ipAddress, userAgent);
        }
        /**
         * Valida resposta e retorna com formulário
         */
        async validateAndReturnResponse(response, ipAddress, userAgent) {
            // 1. Verifica rate limit (accessAttempts pode ser null em registros antigos)
            const attempts = response.accessAttempts ?? 0;
            if (attempts >= MAX_ACCESS_ATTEMPTS) {
                this.logger.warn(`Rate limit excedido para triagem ${response.id}`);
                throw new common_1.ForbiddenException('Muitas tentativas de acesso. Solicite novo link.');
            }
            // 2. Verifica expiração
            if (response.expiresAt && new Date() > new Date(response.expiresAt)) {
                await this.db
                    .update(schema_1.triageResponses)
                    .set({ status: 'EXPIRED' })
                    .where((0, drizzle_orm_1.eq)(schema_1.triageResponses.id, response.id));
                await this.auditService.log({
                    salonId: response.salonId,
                    entityType: 'triage',
                    entityId: response.id,
                    action: 'TOKEN_EXPIRED',
                    ipAddress,
                    userAgent,
                });
                throw new common_1.BadRequestException('Link expirado. Solicite novo link ao salão.');
            }
            // 3. Verifica uso único
            if (response.usedAt) {
                throw new common_1.BadRequestException('Este formulário já foi preenchido.');
            }
            // 4. Verifica se foi invalidado
            if (response.invalidatedAt) {
                throw new common_1.BadRequestException(`Link invalidado: ${response.invalidatedReason || 'Motivo não informado'}`);
            }
            // 5. Registra acesso
            await this.db
                .update(schema_1.triageResponses)
                .set({
                accessAttempts: (0, drizzle_orm_1.sql) `${schema_1.triageResponses.accessAttempts} + 1`,
                lastAccessIp: ipAddress,
                lastAccessUserAgent: userAgent,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.triageResponses.id, response.id));
            // 6. Audit log
            await this.auditService.logPublicAccess({
                salonId: response.salonId,
                entityType: 'triage',
                entityId: response.id,
                ipAddress,
                userAgent,
                metadata: { accessAttempts: attempts + 1 },
            });
            // 7. Busca formulário com perguntas
            const form = await this.getFormWithQuestions(response.formId);
            return { response, form };
        }
        // ==================== SUBMISSÃO DE RESPOSTAS ====================
        /**
         * Submete respostas do formulário
         * SEGURANÇA: Marca token como usado após submissão
         */
        async submitTriageAnswers(rawToken, answers, consentAccepted, ipAddress, userAgent) {
            const tokenHash = this.hashToken(rawToken);
            // Busca por hash
            let [response] = await this.db
                .select()
                .from(schema_1.triageResponses)
                .where((0, drizzle_orm_1.eq)(schema_1.triageResponses.tokenHash, tokenHash))
                .limit(1);
            // Fallback legado
            if (!response) {
                [response] = await this.db
                    .select()
                    .from(schema_1.triageResponses)
                    .where((0, drizzle_orm_1.eq)(schema_1.triageResponses.accessToken, rawToken))
                    .limit(1);
            }
            if (!response) {
                throw new common_1.NotFoundException('Triagem não encontrada');
            }
            // Validações de segurança
            if (response.status === 'COMPLETED') {
                throw new common_1.BadRequestException('Este formulário já foi preenchido');
            }
            if (response.usedAt) {
                throw new common_1.BadRequestException('Este link já foi utilizado');
            }
            if (response.expiresAt && new Date(response.expiresAt) < new Date()) {
                throw new common_1.BadRequestException('Este formulário expirou');
            }
            if (!consentAccepted) {
                throw new common_1.BadRequestException('É necessário aceitar o termo de responsabilidade');
            }
            // Busca perguntas para analisar riscos
            const questions = await this.db
                .select()
                .from(schema_1.triageQuestions)
                .where((0, drizzle_orm_1.eq)(schema_1.triageQuestions.formId, response.formId));
            const questionsMap = new Map(questions.map((q) => [q.id, q]));
            // Analisa riscos e salva respostas
            const riskSummary = { critical: [], high: [], medium: [], low: [] };
            let hasRisks = false;
            let overallRiskLevel = 'LOW';
            const blockers = [];
            for (const answer of answers) {
                const question = questionsMap.get(answer.questionId);
                if (!question)
                    continue;
                const triggeredRisk = this.checkRiskTrigger(question, answer.value);
                if (triggeredRisk) {
                    hasRisks = true;
                    const riskData = {
                        questionId: question.id,
                        question: question.questionText,
                        answer: answer.value,
                        message: question.riskMessage,
                        level: question.riskLevel,
                    };
                    const level = question.riskLevel.toLowerCase();
                    riskSummary[level].push(riskData);
                    if (question.blocksProcedure) {
                        blockers.push(question.riskMessage || question.questionText);
                    }
                    if (question.riskLevel === 'CRITICAL')
                        overallRiskLevel = 'CRITICAL';
                    else if (question.riskLevel === 'HIGH' && overallRiskLevel !== 'CRITICAL')
                        overallRiskLevel = 'HIGH';
                    else if (question.riskLevel === 'MEDIUM' && !['CRITICAL', 'HIGH'].includes(overallRiskLevel))
                        overallRiskLevel = 'MEDIUM';
                }
                await this.db.insert(schema_1.triageAnswers).values({
                    responseId: response.id,
                    questionId: answer.questionId,
                    answerValue: answer.value,
                    triggeredRisk,
                    riskLevel: triggeredRisk ? question.riskLevel : null,
                    riskMessage: triggeredRisk ? question.riskMessage : null,
                });
            }
            // Atualiza resposta principal - MARCA COMO USADO
            await this.db
                .update(schema_1.triageResponses)
                .set({
                status: 'COMPLETED',
                hasRisks,
                riskSummary,
                overallRiskLevel: hasRisks ? overallRiskLevel : null,
                consentAccepted,
                consentAcceptedAt: new Date(),
                consentIpAddress: ipAddress || null,
                completedAt: new Date(),
                completedVia: 'WEB',
                usedAt: new Date(), // ← MARCA TOKEN COMO USADO
                tokenHash: null, // ← INVALIDA HASH (opcional, extra segurança)
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.triageResponses.id, response.id));
            // Audit log
            await this.auditService.log({
                salonId: response.salonId,
                entityType: 'triage',
                entityId: response.id,
                action: 'TOKEN_USED',
                ipAddress,
                userAgent,
                metadata: {
                    hasRisks,
                    overallRiskLevel,
                    blockersCount: blockers.length,
                },
            });
            this.logger.log(`Triagem ${response.id} concluída. Riscos: ${hasRisks}, Nível: ${overallRiskLevel}`);
            // Notificar cliente
            await this.scheduleTriageCompletedNotification(response, hasRisks, overallRiskLevel);
            if (riskSummary.critical.length > 0) {
                this.logger.warn(`ALERTA: Triagem com risco CRÍTICO - Agendamento ${response.appointmentId}`);
            }
            return {
                success: true,
                hasRisks,
                overallRiskLevel: hasRisks ? overallRiskLevel : null,
                canProceed: blockers.length === 0,
                blockers,
                message: blockers.length > 0
                    ? 'Foram identificados riscos que impedem o procedimento. Entre em contato com o salão.'
                    : hasRisks
                        ? 'Triagem concluída. Alguns pontos de atenção foram identificados.'
                        : 'Triagem concluída com sucesso!',
            };
        }
        /**
         * Agenda notificação de triagem concluída
         */
        async scheduleTriageCompletedNotification(response, hasRisks, overallRiskLevel) {
            try {
                const [appointment] = await this.db
                    .select()
                    .from(schema_1.appointments)
                    .where((0, drizzle_orm_1.eq)(schema_1.appointments.id, response.appointmentId))
                    .limit(1);
                if (!appointment?.clientPhone)
                    return;
                const dateFormatted = (0, date_fns_1.format)(new Date(appointment.date), "EEEE, dd 'de' MMMM", {
                    locale: locale_1.ptBR,
                });
                // DedupeKey para idempotência
                const dedupeKey = `${response.appointmentId}:TRIAGE_COMPLETED`;
                await this.db.insert(schema_1.appointmentNotifications).values({
                    salonId: response.salonId,
                    appointmentId: response.appointmentId,
                    recipientPhone: this.formatPhone(appointment.clientPhone),
                    recipientName: appointment.clientName,
                    notificationType: 'TRIAGE_COMPLETED',
                    templateVariables: {
                        nome: appointment.clientName || 'Cliente',
                        data: dateFormatted,
                        horario: appointment.time || appointment.startTime,
                        hasRisks: hasRisks ? 'true' : 'false',
                        riskLevel: overallRiskLevel,
                    },
                    scheduledFor: new Date(),
                    status: 'PENDING',
                    dedupeKey,
                });
                this.logger.log(`Notificação TRIAGE_COMPLETED agendada para ${appointment.clientPhone}`);
            }
            catch (error) {
                // Ignora erro de duplicidade (idempotência)
                if (error.code === '23505') {
                    this.logger.debug('Notificação TRIAGE_COMPLETED já existe (idempotente)');
                    return;
                }
                this.logger.warn(`Erro ao notificar conclusão de triagem: ${error}`);
            }
        }
        // ==================== CONSULTAS ====================
        /**
         * Busca respostas de triagem de um agendamento
         */
        async getTriageForAppointment(appointmentId) {
            const [response] = await this.db
                .select()
                .from(schema_1.triageResponses)
                .where((0, drizzle_orm_1.eq)(schema_1.triageResponses.appointmentId, appointmentId))
                .limit(1);
            if (!response) {
                return null;
            }
            const answers = await this.db
                .select({
                id: schema_1.triageAnswers.id,
                answerValue: schema_1.triageAnswers.answerValue,
                triggeredRisk: schema_1.triageAnswers.triggeredRisk,
                riskLevel: schema_1.triageAnswers.riskLevel,
                riskMessage: schema_1.triageAnswers.riskMessage,
                questionText: schema_1.triageQuestions.questionText,
                category: schema_1.triageQuestions.category,
                categoryLabel: schema_1.triageQuestions.categoryLabel,
            })
                .from(schema_1.triageAnswers)
                .leftJoin(schema_1.triageQuestions, (0, drizzle_orm_1.eq)(schema_1.triageAnswers.questionId, schema_1.triageQuestions.id))
                .where((0, drizzle_orm_1.eq)(schema_1.triageAnswers.responseId, response.id));
            // Busca overrides se houver
            const overrides = await this.db
                .select()
                .from(schema_1.triageOverrides)
                .where((0, drizzle_orm_1.eq)(schema_1.triageOverrides.triageId, response.id));
            return {
                ...response,
                answers,
                overrides,
                hasOverride: overrides.length > 0,
            };
        }
        /**
         * Verifica se pode iniciar atendimento
         */
        async canStartAppointment(appointmentId) {
            const triage = await this.getTriageForAppointment(appointmentId);
            // Sem triagem = pode iniciar
            if (!triage) {
                return { canStart: true };
            }
            // Triagem pendente
            if (triage.status === 'PENDING') {
                return {
                    canStart: false,
                    reason: 'Aguardando preenchimento da pré-avaliação pelo cliente.',
                    triageStatus: 'PENDING',
                };
            }
            // Triagem com blockers (riscos críticos)
            if (triage.riskSummary?.critical?.length > 0 && !triage.hasOverride) {
                return {
                    canStart: false,
                    reason: 'Triagem com riscos críticos que impedem o procedimento.',
                    triageStatus: 'BLOCKED',
                    hasBlockers: true,
                };
            }
            // Triagem com override
            if (triage.hasOverride) {
                return {
                    canStart: true,
                    triageStatus: 'OVERRIDE',
                    hasOverride: true,
                };
            }
            return { canStart: true, triageStatus: 'OK' };
        }
        /**
         * Cria override de triagem (libera atendimento bloqueado)
         */
        async createTriageOverride(appointmentId, reason, userId, userName, userRole, ipAddress) {
            if (!reason || reason.length < 20) {
                throw new common_1.BadRequestException('Justificativa deve ter no mínimo 20 caracteres');
            }
            const triage = await this.getTriageForAppointment(appointmentId);
            if (!triage) {
                throw new common_1.NotFoundException('Triagem não encontrada para este agendamento');
            }
            if (triage.status !== 'COMPLETED') {
                throw new common_1.BadRequestException('Só é possível criar override para triagens completas');
            }
            // Cria override
            await this.db.insert(schema_1.triageOverrides).values({
                triageId: triage.id,
                appointmentId,
                userId,
                userName,
                userRole,
                reason,
                ipAddress,
            });
            // Audit log crítico
            await this.auditService.logCriticalOverride({
                salonId: triage.salonId,
                triageId: triage.id,
                appointmentId,
                userId,
                userName,
                userRole,
                ipAddress,
                reason,
                riskLevel: triage.overallRiskLevel,
                blockers: triage.riskSummary?.critical?.map((r) => r.message) || [],
            });
            this.logger.warn(`OVERRIDE CRÍTICO: Triagem ${triage.id} liberada por ${userName} (${userRole}). Motivo: ${reason}`);
        }
        // ==================== UTILITÁRIOS ====================
        /**
         * Gera link público para preenchimento
         */
        generatePublicLink(token) {
            const baseUrl = process.env.PUBLIC_URL || 'http://localhost:5173';
            return `${baseUrl}/pre-avaliacao/${token}`;
        }
        /**
         * Formata telefone para padrão internacional
         */
        formatPhone(phone) {
            let cleaned = phone.replace(/\D/g, '');
            if (cleaned.length <= 11) {
                cleaned = '55' + cleaned;
            }
            return cleaned;
        }
        /**
         * Monta resumo de riscos para mensagem WhatsApp
         */
        buildRiskSummaryForWhatsApp(response) {
            if (!response?.hasRisks) {
                return '✅ Pré-avaliação concluída. Nenhum risco identificado.';
            }
            let summary = '⚠️ *ALERTAS DA PRÉ-AVALIAÇÃO:*\n\n';
            if (response.riskSummary?.critical?.length > 0) {
                summary += '🔴 *CRÍTICOS (Impedem procedimento):*\n';
                response.riskSummary.critical.forEach((r) => {
                    summary += `• ${r.message}\n`;
                });
                summary += '\n';
            }
            if (response.riskSummary?.high?.length > 0) {
                summary += '🟠 *ALTOS (Atenção especial):*\n';
                response.riskSummary.high.forEach((r) => {
                    summary += `• ${r.message}\n`;
                });
                summary += '\n';
            }
            if (response.riskSummary?.medium?.length > 0) {
                summary += '🟡 *MÉDIOS (Cuidado):*\n';
                response.riskSummary.medium.forEach((r) => {
                    summary += `• ${r.message}\n`;
                });
            }
            return summary;
        }
        /**
         * Agrupa perguntas por categoria
         */
        groupQuestionsByCategory(questions) {
            const groups = {};
            for (const q of questions) {
                const cat = q.category || 'CUSTOM';
                if (!groups[cat]) {
                    groups[cat] = {
                        category: cat,
                        label: q.categoryLabel || cat,
                        questions: [],
                    };
                }
                groups[cat].questions.push(q);
            }
            return Object.values(groups);
        }
        /**
         * Verifica se resposta dispara risco
         */
        checkRiskTrigger(question, answerValue) {
            const triggerValue = question.riskTriggerValue || 'SIM';
            const normalizedAnswer = answerValue.toUpperCase().trim();
            const normalizedTrigger = triggerValue.toUpperCase().trim();
            if (question.answerType === 'BOOLEAN') {
                return normalizedAnswer === normalizedTrigger;
            }
            return normalizedAnswer.includes(normalizedTrigger);
        }
        // ==================== MANUTENÇÃO ====================
        /**
         * Invalida triagens expiradas (job de limpeza)
         */
        async invalidateExpiredTriages() {
            const result = await this.db
                .update(schema_1.triageResponses)
                .set({
                status: 'EXPIRED',
                invalidatedAt: new Date(),
                invalidatedReason: 'Expiração automática',
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.triageResponses.status, 'PENDING'), (0, drizzle_orm_1.lte)(schema_1.triageResponses.expiresAt, new Date())))
                .returning();
            if (result.length > 0) {
                this.logger.log(`${result.length} triagens expiradas invalidadas`);
            }
            return result.length;
        }
    };
    return TriageService = _classThis;
})();
exports.TriageService = TriageService;
//# sourceMappingURL=triage.service.js.map