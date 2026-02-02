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
export declare class AlexisComplianceService {
    private readonly logger;
    /**
     * =====================================================
     * CAMADA 1: PRE-PROCESSING CHECK
     * Executada ANTES da mensagem ir para a IA
     * =====================================================
     */
    preProcessingCheck(salonId: string, content: string, hasLgpdConsent: boolean): Promise<ComplianceCheckResult>;
    /**
     * =====================================================
     * CAMADA 2: AI PROCESSING CHECK
     * Executada DURANTE o processamento da IA
     * Valida a resposta gerada pela IA
     * =====================================================
     */
    aiProcessingCheck(salonId: string, aiResponse: string, _userQuery: string, confidenceScore?: number): Promise<ComplianceCheckResult>;
    /**
     * =====================================================
     * CAMADA 3: POST-PROCESSING CHECK
     * Executada DEPOIS da resposta ser gerada
     * Última verificação antes de enviar ao cliente
     * =====================================================
     */
    postProcessingCheck(salonId: string, finalResponse: string, sessionId: string): Promise<ComplianceCheckResult>;
    /**
     * =====================================================
     * MÉTODOS AUXILIARES
     * =====================================================
     */
    private loadBlockedKeywords;
    private checkLgpdPatterns;
    private sanitizePersonalData;
    private checkProfanity;
    private calculateRiskLevel;
    private getDefaultWarning;
    logComplianceEvent(salonId: string, sessionId: string | null, messageId: string | null, violations: ComplianceViolation[], originalContent: string, sanitizedContent?: string): Promise<void>;
    /**
     * Seed de keywords bloqueadas padrão
     */
    seedDefaultKeywords(): Promise<void>;
}
//# sourceMappingURL=alexis-compliance.service.d.ts.map