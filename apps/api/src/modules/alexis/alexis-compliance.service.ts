import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../database/connection';
import {
  alexisBlockedKeywords,
  alexisComplianceLogs,
} from '../../database/schema';
import { eq, and, or, isNull } from 'drizzle-orm';

/**
 * =====================================================
 * ALEXIS COMPLIANCE SERVICE
 * 3 Camadas de Proteção: PRE, DURING, POST
 * Compliance: ANVISA + LGPD
 * =====================================================
 */

export interface ComplianceCheckResult {
  passed: boolean;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED';
  violations: ComplianceViolation[];
  sanitizedContent?: string;
  timestamp: string;
}

export interface ComplianceViolation {
  type: string;
  category: 'ANVISA' | 'LGPD' | 'PROFANITY' | 'CUSTOM';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  matchedKeyword?: string;
  action: 'BLOCK' | 'WARN' | 'FLAG' | 'SANITIZE';
  message?: string;
  details?: {
    anvisaCode?: string;
    lgpdArticle?: string;
    recommendation?: string;
  };
}

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
const WARNING_MESSAGES: Record<string, Record<string, string>> = {
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

@Injectable()
export class AlexisComplianceService {
  private readonly logger = new Logger(AlexisComplianceService.name);

  /**
   * =====================================================
   * CAMADA 1: PRE-PROCESSING CHECK
   * Executada ANTES da mensagem ir para a IA
   * =====================================================
   */
  async preProcessingCheck(
    salonId: string,
    content: string,
    hasLgpdConsent: boolean,
  ): Promise<ComplianceCheckResult> {
    const timestamp = new Date().toISOString();
    const violations: ComplianceViolation[] = [];
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
        const violation: ComplianceViolation = {
          type: kw.violationType,
          category: kw.category as 'ANVISA' | 'LGPD' | 'PROFANITY' | 'CUSTOM',
          severity: kw.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
          matchedKeyword: kw.keyword,
          action: kw.action as 'BLOCK' | 'WARN' | 'FLAG' | 'SANITIZE',
          message: kw.warningMessage || this.getDefaultWarning(kw.category, kw.violationType),
        };

        violations.push(violation);

        // Aplicar sanitização se necessário
        if (kw.action === 'SANITIZE' && kw.replacement) {
          sanitizedContent = sanitizedContent.replace(
            new RegExp(kw.keyword, 'gi'),
            kw.replacement,
          );
        }
      }
    }

    // 4. Verificar padrões de dados sensíveis (LGPD)
    const lgpdViolations = this.checkLgpdPatterns(content);
    violations.push(...lgpdViolations);

    // 5. Determinar nível de risco
    const riskLevel = this.calculateRiskLevel(violations);

    // 6. Verificar se deve bloquear
    const passed = !violations.some(
      (v) => v.action === 'BLOCK' || v.severity === 'CRITICAL',
    );

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
  async aiProcessingCheck(
    salonId: string,
    aiResponse: string,
    _userQuery: string,
    confidenceScore?: number,
  ): Promise<ComplianceCheckResult> {
    const timestamp = new Date().toISOString();
    const violations: ComplianceViolation[] = [];

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
          category: kw.category as 'ANVISA' | 'LGPD' | 'PROFANITY' | 'CUSTOM',
          severity: kw.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
          matchedKeyword: kw.keyword,
          action: kw.action as 'BLOCK' | 'WARN' | 'FLAG' | 'SANITIZE',
        });
      }
    }

    const riskLevel = this.calculateRiskLevel(violations);
    const passed = !violations.some(
      (v) => v.action === 'BLOCK' || v.severity === 'CRITICAL',
    );

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
  async postProcessingCheck(
    salonId: string,
    finalResponse: string,
    sessionId: string,
  ): Promise<ComplianceCheckResult> {
    const timestamp = new Date().toISOString();
    const violations: ComplianceViolation[] = [];
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

  private async loadBlockedKeywords(salonId: string) {
    // Carregar keywords globais e do salão
    const keywords = await db
      .select()
      .from(alexisBlockedKeywords)
      .where(
        and(
          eq(alexisBlockedKeywords.isActive, true),
          or(
            isNull(alexisBlockedKeywords.salonId),
            eq(alexisBlockedKeywords.salonId, salonId),
          ),
        ),
      );

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

  private checkLgpdPatterns(content: string): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

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

  private sanitizePersonalData(content: string): string {
    let sanitized = content;

    // Mascarar CPF
    sanitized = sanitized.replace(
      /(\d{3})\.?(\d{3})\.?(\d{3})-?(\d{2})/g,
      '$1.***.***-**',
    );

    // Mascarar cartão
    sanitized = sanitized.replace(
      /(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})/g,
      '$1 **** **** ****',
    );

    // Mascarar telefone
    sanitized = sanitized.replace(
      /(\d{2})[\s-]?(\d{4,5})[\s-]?(\d{4})/g,
      '($1) *****-$3',
    );

    return sanitized;
  }

  private checkProfanity(content: string): { hasProfanity: boolean; matched?: string; sanitized: string } {
    // Lista básica de termos impróprios (pode ser expandida)
    const profanityList = [
      'merda', 'porra', 'caralho', 'foda', 'puta', 'viado', 'buceta',
    ];

    let sanitized = content;
    let matched: string | undefined;

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

  private calculateRiskLevel(
    violations: ComplianceViolation[],
  ): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED' {
    if (violations.length === 0) return 'NONE';

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

  private getDefaultWarning(category: string, type: string): string {
    if (category === 'ANVISA') {
      return WARNING_MESSAGES.ANVISA[type] || WARNING_MESSAGES.ANVISA.MEDICAL_ADVICE;
    }
    if (category === 'LGPD') {
      return WARNING_MESSAGES.LGPD[type] || WARNING_MESSAGES.LGPD.PERSONAL_DATA;
    }
    return 'Conteúdo bloqueado por motivos de segurança.';
  }

  async logComplianceEvent(
    salonId: string,
    sessionId: string | null,
    messageId: string | null,
    violations: ComplianceViolation[],
    originalContent: string,
    sanitizedContent?: string,
  ) {
    for (const violation of violations) {
      await db.insert(alexisComplianceLogs).values({
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
    const existingCount = await db.select().from(alexisBlockedKeywords).limit(1);

    if (existingCount.length === 0) {
      const allDefaults = [
        ...DEFAULT_ANVISA_KEYWORDS.map((k) => ({
          keyword: k.keyword,
          category: k.category,
          violationType: k.type,
          severity: k.severity,
          action: 'WARN' as const,
          isActive: true,
        })),
        ...DEFAULT_LGPD_KEYWORDS.map((k) => ({
          keyword: k.keyword,
          category: k.category,
          violationType: k.type,
          severity: k.severity,
          action: 'FLAG' as const,
          isActive: true,
        })),
      ];

      await db.insert(alexisBlockedKeywords).values(allDefaults);
      this.logger.log('Keywords padrão ANVISA/LGPD inseridas com sucesso');
    }
  }
}
