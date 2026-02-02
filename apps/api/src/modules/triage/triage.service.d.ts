import { TriageForm, TriageResponse } from '../../database/schema';
import { AuditService } from '../audit/audit.service';
interface TriageAnswerInput {
    questionId: string;
    value: string;
}
export declare class TriageService {
    private db;
    private readonly auditService;
    private readonly logger;
    constructor(db: any, auditService: AuditService);
    /**
     * Gera hash SHA-256 do token
     * IMPORTANTE: Token raw NUNCA é armazenado
     */
    private hashToken;
    /**
     * Gera token criptograficamente seguro
     */
    private generateSecureToken;
    /**
     * Mascara token para logs (nunca expor token completo)
     */
    private maskToken;
    /**
     * Busca formulário ativo para um serviço
     */
    getFormForService(salonId: string, serviceId?: number): Promise<TriageForm | null>;
    /**
     * Busca formulário com suas perguntas
     */
    getFormWithQuestions(formId: string): Promise<any>;
    /**
     * Lista todos os formulários de um salão
     */
    listForms(salonId: string): Promise<TriageForm[]>;
    /**
     * Cria resposta de triagem para um agendamento
     * SEGURANÇA: Armazena apenas hash do token
     */
    createTriageResponse(salonId: string, appointmentId: string, formId: string, clientId?: string): Promise<{
        id: string;
        publicLink: string;
        expiresAt: Date;
        alreadyExists?: boolean;
    }>;
    /**
     * Busca resposta por token (acesso público)
     * SEGURANÇA: Valida hash, expiração, uso único, rate limit
     */
    getResponseByToken(rawToken: string, ipAddress?: string, userAgent?: string): Promise<{
        response: TriageResponse;
        form: any;
    } | null>;
    /**
     * Valida resposta e retorna com formulário
     */
    private validateAndReturnResponse;
    /**
     * Submete respostas do formulário
     * SEGURANÇA: Marca token como usado após submissão
     */
    submitTriageAnswers(rawToken: string, answers: TriageAnswerInput[], consentAccepted: boolean, ipAddress?: string, userAgent?: string): Promise<any>;
    /**
     * Agenda notificação de triagem concluída
     */
    private scheduleTriageCompletedNotification;
    /**
     * Busca respostas de triagem de um agendamento
     */
    getTriageForAppointment(appointmentId: string): Promise<any>;
    /**
     * Verifica se pode iniciar atendimento
     */
    canStartAppointment(appointmentId: string): Promise<{
        canStart: boolean;
        reason?: string;
        triageStatus?: string;
        hasBlockers?: boolean;
        hasOverride?: boolean;
    }>;
    /**
     * Cria override de triagem (libera atendimento bloqueado)
     */
    createTriageOverride(appointmentId: string, reason: string, userId: string, userName: string, userRole: string, ipAddress?: string): Promise<void>;
    /**
     * Gera link público para preenchimento
     */
    generatePublicLink(token: string): string;
    /**
     * Formata telefone para padrão internacional
     */
    private formatPhone;
    /**
     * Monta resumo de riscos para mensagem WhatsApp
     */
    buildRiskSummaryForWhatsApp(response: any): string;
    /**
     * Agrupa perguntas por categoria
     */
    private groupQuestionsByCategory;
    /**
     * Verifica se resposta dispara risco
     */
    private checkRiskTrigger;
    /**
     * Invalida triagens expiradas (job de limpeza)
     */
    invalidateExpiredTriages(): Promise<number>;
}
export {};
//# sourceMappingURL=triage.service.d.ts.map