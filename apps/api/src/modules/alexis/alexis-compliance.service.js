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
exports.AlexisComplianceService = void 0;
const common_1 = require("@nestjs/common");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
// Keywords bloqueadas padrão ANVISA
const DEFAULT_ANVISA_KEYWORDS = [
    // Termos médicos proibidos para não-médicos
    { keyword: 'prescrevo', category: 'ANVISA', type: 'PRESCRIPTION', severity: 'CRITICAL' },
    { keyword: 'receita médica', category: 'ANVISA', type: 'PRESCRIPTION', severity: 'CRITICAL' },
    { keyword: 'tomar remédio', category: 'ANVISA', type: 'MEDICAL_ADVICE', severity: 'HIGH' },
    { keyword: 'medicamento', category: 'ANVISA', type: 'MEDICAL_ADVICE', severity: 'MEDIUM' },
    { keyword: 'tratamento médico', category: 'ANVISA', type: 'MEDICAL_ADVICE', severity: 'HIGH' },
    { keyword: 'cura', category: 'ANVISA', type: 'HEALTH_CLAIM', severity: 'HIGH' },
    { keyword: 'curar', category: 'ANVISA', type: 'HEALTH_CLAIM', severity: 'HIGH' },
    { keyword: 'doença', category: 'ANVISA', type: 'MEDICAL_ADVICE', severity: 'MEDIUM' },
    { keyword: 'diagnóstico', category: 'ANVISA', type: 'MEDICAL_ADVICE', severity: 'CRITICAL' },
    { keyword: 'dermatologista', category: 'ANVISA', type: 'MEDICAL_ADVICE', severity: 'LOW' },
    // Alegações de saúde não autorizadas
    { keyword: 'anti-envelhecimento garantido', category: 'ANVISA', type: 'HEALTH_CLAIM', severity: 'HIGH' },
    { keyword: 'rejuvenescimento garantido', category: 'ANVISA', type: 'HEALTH_CLAIM', severity: 'HIGH' },
    { keyword: 'resultado garantido', category: 'ANVISA', type: 'HEALTH_CLAIM', severity: 'MEDIUM' },
];
// Keywords bloqueadas padrão LGPD
const DEFAULT_LGPD_KEYWORDS = [
    { keyword: 'cpf', category: 'LGPD', type: 'PERSONAL_DATA', severity: 'HIGH' },
    { keyword: 'rg', category: 'LGPD', type: 'PERSONAL_DATA', severity: 'HIGH' },
    { keyword: 'senha', category: 'LGPD', type: 'PERSONAL_DATA', severity: 'CRITICAL' },
    { keyword: 'cartão de crédito', category: 'LGPD', type: 'PERSONAL_DATA', severity: 'CRITICAL' },
    { keyword: 'número do cartão', category: 'LGPD', type: 'PERSONAL_DATA', severity: 'CRITICAL' },
    { keyword: 'dados bancários', category: 'LGPD', type: 'PERSONAL_DATA', severity: 'CRITICAL' },
    { keyword: 'conta bancária', category: 'LGPD', type: 'PERSONAL_DATA', severity: 'HIGH' },
];
// Mensagens de advertência
const WARNING_MESSAGES = {
    ANVISA: {
        PRESCRIPTION: '⚠️ ALEXIS não pode fornecer prescrições médicas. Consulte um profissional de saúde.',
        MEDICAL_ADVICE: '⚠️ Para questões de saúde, recomendamos consultar um profissional médico.',
        HEALTH_CLAIM: '⚠️ Não podemos fazer alegações de resultados garantidos em tratamentos estéticos.',
    },
    LGPD: {
        PERSONAL_DATA: '🔒 Por segurança, não compartilhe dados pessoais sensíveis por este canal.',
        UNAUTHORIZED_SHARE: '🔒 Este dado está protegido pela LGPD. Não podemos compartilhá-lo.',
    },
};
let AlexisComplianceService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AlexisComplianceService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AlexisComplianceService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = new common_1.Logger(AlexisComplianceService.name);
        /**
         * =====================================================
         * CAMADA 1: PRE-PROCESSING CHECK
         * Executada ANTES da mensagem ir para a IA
         * =====================================================
         */
        async preProcessingCheck(salonId, content, hasLgpdConsent) {
            const timestamp = new Date().toISOString();
            const violations = [];
            let sanitizedContent = content;
            // 1. Verificar consentimento LGPD
            if (!hasLgpdConsent) {
                // Apenas flag, não bloqueia - mas registra
                this.logger.warn(`Sessão sem consentimento LGPD para salão ${salonId}`);
            }
            // 2. Carregar keywords bloqueadas (globais + do salão)
            const blockedKeywords = await this.loadBlockedKeywords(salonId);
            // 3. Verificar cada keyword
            const contentLower = content.toLowerCase();
            for (const kw of blockedKeywords) {
                if (contentLower.includes(kw.keyword.toLowerCase())) {
                    const violation = {
                        type: kw.violationType,
                        category: kw.category,
                        severity: kw.severity,
                        matchedKeyword: kw.keyword,
                        action: kw.action,
                        message: kw.warningMessage || this.getDefaultWarning(kw.category, kw.violationType),
                    };
                    violations.push(violation);
                    // Aplicar sanitização se necessário
                    if (kw.action === 'SANITIZE' && kw.replacement) {
                        sanitizedContent = sanitizedContent.replace(new RegExp(kw.keyword, 'gi'), kw.replacement);
                    }
                }
            }
            // 4. Verificar padrões de dados sensíveis (LGPD)
            const lgpdViolations = this.checkLgpdPatterns(content);
            violations.push(...lgpdViolations);
            // 5. Determinar nível de risco
            const riskLevel = this.calculateRiskLevel(violations);
            // 6. Verificar se deve bloquear
            const passed = !violations.some((v) => v.action === 'BLOCK' || v.severity === 'CRITICAL');
            return {
                passed,
                riskLevel,
                violations,
                sanitizedContent: sanitizedContent !== content ? sanitizedContent : undefined,
                timestamp,
            };
        }
        /**
         * =====================================================
         * CAMADA 2: AI PROCESSING CHECK
         * Executada DURANTE o processamento da IA
         * Valida a resposta gerada pela IA
         * =====================================================
         */
        async aiProcessingCheck(salonId, aiResponse, _userQuery, confidenceScore) {
            const timestamp = new Date().toISOString();
            const violations = [];
            // 1. Verificar se a IA está dando conselhos médicos
            const medicalAdvicePatterns = [
                /você (deve|precisa|tem que) (tomar|usar|aplicar)/i,
                /recomendo (medicamento|remédio|tratamento médico)/i,
                /vai curar/i,
                /garanto (resultado|que funciona)/i,
                /100% (garantido|eficaz)/i,
            ];
            for (const pattern of medicalAdvicePatterns) {
                if (pattern.test(aiResponse)) {
                    violations.push({
                        type: 'MEDICAL_ADVICE',
                        category: 'ANVISA',
                        severity: 'HIGH',
                        action: 'FLAG',
                        message: WARNING_MESSAGES.ANVISA.MEDICAL_ADVICE,
                        details: {
                            anvisaCode: 'RDC-96/2008',
                            recommendation: 'Remover alegações médicas não autorizadas',
                        },
                    });
                }
            }
            // 2. Verificar vazamento de dados pessoais
            const dataPatterns = [
                { pattern: /\d{3}\.\d{3}\.\d{3}-\d{2}/, type: 'CPF' },
                { pattern: /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/, type: 'CNPJ' },
                { pattern: /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/, type: 'CARD' },
            ];
            for (const dp of dataPatterns) {
                if (dp.pattern.test(aiResponse)) {
                    violations.push({
                        type: 'PERSONAL_DATA',
                        category: 'LGPD',
                        severity: 'CRITICAL',
                        action: 'BLOCK',
                        message: WARNING_MESSAGES.LGPD.PERSONAL_DATA,
                        details: {
                            lgpdArticle: 'Art. 5º, II - Dado pessoal sensível',
                        },
                    });
                }
            }
            // 3. Verificar score de confiança da IA
            if (confidenceScore !== undefined && confidenceScore < 0.3) {
                violations.push({
                    type: 'LOW_CONFIDENCE',
                    category: 'CUSTOM',
                    severity: 'MEDIUM',
                    action: 'FLAG',
                    message: 'Resposta com baixa confiança - requer revisão humana',
                });
            }
            // 4. Verificar keywords bloqueadas na resposta
            const blockedKeywords = await this.loadBlockedKeywords(salonId);
            const responseLower = aiResponse.toLowerCase();
            for (const kw of blockedKeywords) {
                if (responseLower.includes(kw.keyword.toLowerCase())) {
                    violations.push({
                        type: kw.violationType,
                        category: kw.category,
                        severity: kw.severity,
                        matchedKeyword: kw.keyword,
                        action: kw.action,
                    });
                }
            }
            const riskLevel = this.calculateRiskLevel(violations);
            const passed = !violations.some((v) => v.action === 'BLOCK' || v.severity === 'CRITICAL');
            return {
                passed,
                riskLevel,
                violations,
                timestamp,
            };
        }
        /**
         * =====================================================
         * CAMADA 3: POST-PROCESSING CHECK
         * Executada DEPOIS da resposta ser gerada
         * Última verificação antes de enviar ao cliente
         * =====================================================
         */
        async postProcessingCheck(salonId, finalResponse, sessionId) {
            const timestamp = new Date().toISOString();
            const violations = [];
            let sanitizedContent = finalResponse;
            // 1. Sanitização final - remover dados sensíveis
            sanitizedContent = this.sanitizePersonalData(sanitizedContent);
            // 2. Adicionar disclaimers se necessário
            const needsAnvisaDisclaimer = /tratamento|procedimento|resultado/i.test(finalResponse);
            if (needsAnvisaDisclaimer && !finalResponse.includes('resultados podem variar')) {
                sanitizedContent += '\n\n_Os resultados podem variar de acordo com cada pessoa._';
            }
            // 3. Verificar tamanho da resposta (limite WhatsApp)
            if (sanitizedContent.length > 4096) {
                sanitizedContent = sanitizedContent.substring(0, 4000) + '...\n\n_Mensagem truncada._';
                violations.push({
                    type: 'MESSAGE_TOO_LONG',
                    category: 'CUSTOM',
                    severity: 'LOW',
                    action: 'SANITIZE',
                    message: 'Mensagem truncada devido ao limite do WhatsApp',
                });
            }
            // 4. Verificar linguagem imprópria
            const profanityCheck = this.checkProfanity(sanitizedContent);
            if (profanityCheck.hasProfanity) {
                violations.push({
                    type: 'PROFANITY',
                    category: 'PROFANITY',
                    severity: 'HIGH',
                    action: 'SANITIZE',
                    matchedKeyword: profanityCheck.matched,
                });
                sanitizedContent = profanityCheck.sanitized;
            }
            const riskLevel = this.calculateRiskLevel(violations);
            const passed = !violations.some((v) => v.action === 'BLOCK');
            // 5. Registrar log de compliance se houver violações
            if (violations.length > 0) {
                await this.logComplianceEvent(salonId, sessionId, null, violations, finalResponse, sanitizedContent);
            }
            return {
                passed,
                riskLevel,
                violations,
                sanitizedContent: sanitizedContent !== finalResponse ? sanitizedContent : undefined,
                timestamp,
            };
        }
        /**
         * =====================================================
         * MÉTODOS AUXILIARES
         * =====================================================
         */
        async loadBlockedKeywords(salonId) {
            // Carregar keywords globais e do salão
            const keywords = await connection_1.db
                .select()
                .from(schema_1.alexisBlockedKeywords)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.alexisBlockedKeywords.isActive, true), (0, drizzle_orm_1.or)((0, drizzle_orm_1.isNull)(schema_1.alexisBlockedKeywords.salonId), (0, drizzle_orm_1.eq)(schema_1.alexisBlockedKeywords.salonId, salonId))));
            // Adicionar keywords padrão se não existirem no banco
            const existingKeywords = keywords.map((k) => k.keyword.toLowerCase());
            const defaultKeywords = [...DEFAULT_ANVISA_KEYWORDS, ...DEFAULT_LGPD_KEYWORDS];
            const allKeywords = keywords.map((k) => ({
                keyword: k.keyword,
                category: k.category,
                violationType: k.violationType,
                severity: k.severity,
                action: k.action,
                replacement: k.replacement,
                warningMessage: k.warningMessage,
            }));
            // Adicionar padrões que não estão no banco
            for (const dk of defaultKeywords) {
                if (!existingKeywords.includes(dk.keyword.toLowerCase())) {
                    allKeywords.push({
                        keyword: dk.keyword,
                        category: dk.category,
                        violationType: dk.type,
                        severity: dk.severity,
                        action: 'WARN',
                        replacement: null,
                        warningMessage: null,
                    });
                }
            }
            return allKeywords;
        }
        checkLgpdPatterns(content) {
            const violations = [];
            // Padrões de CPF
            if (/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/.test(content)) {
                violations.push({
                    type: 'PERSONAL_DATA',
                    category: 'LGPD',
                    severity: 'HIGH',
                    action: 'FLAG',
                    message: WARNING_MESSAGES.LGPD.PERSONAL_DATA,
                    details: { lgpdArticle: 'Art. 5º, I' },
                });
            }
            // Padrões de cartão
            if (/\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/.test(content)) {
                violations.push({
                    type: 'PERSONAL_DATA',
                    category: 'LGPD',
                    severity: 'CRITICAL',
                    action: 'BLOCK',
                    message: WARNING_MESSAGES.LGPD.PERSONAL_DATA,
                    details: { lgpdArticle: 'Art. 5º, II' },
                });
            }
            // Padrões de email (apenas flag)
            if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(content)) {
                violations.push({
                    type: 'PERSONAL_DATA',
                    category: 'LGPD',
                    severity: 'LOW',
                    action: 'FLAG',
                    details: { lgpdArticle: 'Art. 5º, I' },
                });
            }
            return violations;
        }
        sanitizePersonalData(content) {
            let sanitized = content;
            // Mascarar CPF
            sanitized = sanitized.replace(/(\d{3})\.?(\d{3})\.?(\d{3})-?(\d{2})/g, '$1.***.***-**');
            // Mascarar cartão
            sanitized = sanitized.replace(/(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})/g, '$1 **** **** ****');
            // Mascarar telefone
            sanitized = sanitized.replace(/(\d{2})[\s-]?(\d{4,5})[\s-]?(\d{4})/g, '($1) *****-$3');
            return sanitized;
        }
        checkProfanity(content) {
            // Lista básica de termos impróprios (pode ser expandida)
            const profanityList = [
                'merda', 'porra', 'caralho', 'foda', 'puta', 'viado', 'buceta',
            ];
            let sanitized = content;
            let matched;
            for (const word of profanityList) {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                if (regex.test(content)) {
                    matched = word;
                    sanitized = sanitized.replace(regex, '*'.repeat(word.length));
                }
            }
            return {
                hasProfanity: !!matched,
                matched,
                sanitized,
            };
        }
        calculateRiskLevel(violations) {
            if (violations.length === 0)
                return 'NONE';
            if (violations.some((v) => v.severity === 'CRITICAL' || v.action === 'BLOCK')) {
                return 'BLOCKED';
            }
            if (violations.some((v) => v.severity === 'HIGH')) {
                return 'HIGH';
            }
            if (violations.some((v) => v.severity === 'MEDIUM')) {
                return 'MEDIUM';
            }
            return 'LOW';
        }
        getDefaultWarning(category, type) {
            if (category === 'ANVISA') {
                return WARNING_MESSAGES.ANVISA[type] || WARNING_MESSAGES.ANVISA.MEDICAL_ADVICE;
            }
            if (category === 'LGPD') {
                return WARNING_MESSAGES.LGPD[type] || WARNING_MESSAGES.LGPD.PERSONAL_DATA;
            }
            return 'Conteúdo bloqueado por motivos de segurança.';
        }
        async logComplianceEvent(salonId, sessionId, messageId, violations, originalContent, sanitizedContent) {
            for (const violation of violations) {
                await connection_1.db.insert(schema_1.alexisComplianceLogs).values({
                    salonId,
                    sessionId,
                    messageId,
                    violationType: violation.type,
                    riskLevel: violation.severity,
                    originalContent,
                    sanitizedContent,
                    detectionLayer: 'POST', // Default, pode ser passado como parâmetro
                    action: violation.action,
                    details: violation.details,
                });
            }
        }
        /**
         * Seed de keywords bloqueadas padrão
         */
        async seedDefaultKeywords() {
            const existingCount = await connection_1.db.select().from(schema_1.alexisBlockedKeywords).limit(1);
            if (existingCount.length === 0) {
                const allDefaults = [
                    ...DEFAULT_ANVISA_KEYWORDS.map((k) => ({
                        keyword: k.keyword,
                        category: k.category,
                        violationType: k.type,
                        severity: k.severity,
                        action: 'WARN',
                        isActive: true,
                    })),
                    ...DEFAULT_LGPD_KEYWORDS.map((k) => ({
                        keyword: k.keyword,
                        category: k.category,
                        violationType: k.type,
                        severity: k.severity,
                        action: 'FLAG',
                        isActive: true,
                    })),
                ];
                await connection_1.db.insert(schema_1.alexisBlockedKeywords).values(allDefaults);
                this.logger.log('Keywords padrão ANVISA/LGPD inseridas com sucesso');
            }
        }
    };
    return AlexisComplianceService = _classThis;
})();
exports.AlexisComplianceService = AlexisComplianceService;
//# sourceMappingURL=alexis-compliance.service.js.map