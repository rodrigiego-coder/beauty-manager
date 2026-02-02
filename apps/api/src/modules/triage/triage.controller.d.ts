import { TriageService } from './triage.service';
interface CreateTriageDto {
    appointmentId: string;
    formId: string;
    clientId?: string;
}
interface SubmitTriageDto {
    answers: Array<{
        questionId: string;
        value: string;
    }>;
    consentAccepted: boolean;
}
interface OverrideTriageDto {
    reason: string;
}
export declare class TriageController {
    private readonly triageService;
    constructor(triageService: TriageService);
    /**
     * Lista todos os formulários do salão
     */
    listForms(req: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        createdById: string | null;
        version: number;
        serviceCategory: string | null;
        serviceIds: number[] | null;
        consentTitle: string | null;
        consentText: string;
        requiresConsent: boolean;
    }[]>;
    /**
     * Busca formulário com perguntas
     */
    getForm(formId: string): Promise<any>;
    /**
     * Busca formulário para um serviço específico
     */
    getFormForService(req: any, serviceId: string): Promise<any>;
    /**
     * Busca triagem de um agendamento
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
     * Cria resposta de triagem para agendamento
     */
    createTriageResponse(req: any, body: CreateTriageDto): Promise<{
        id: string;
        publicLink: string;
        expiresAt: Date;
        alreadyExists?: boolean;
    }>;
    /**
     * Cria override de triagem (libera bloqueio)
     * CRÍTICO: Requer justificativa mínima de 20 caracteres
     */
    createTriageOverride(appointmentId: string, body: OverrideTriageDto, req: any, ip: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Busca formulário por token público
     * RATE LIMIT: 5 requests por minuto por IP
     */
    getPublicForm(token: string, ip: string, userAgent: string): Promise<{
        error: boolean;
        message: string;
        completed?: never;
        completedAt?: never;
        response?: never;
        form?: never;
    } | {
        completed: boolean;
        message: string;
        completedAt: Date | null;
        error?: never;
        response?: never;
        form?: never;
    } | {
        response: {
            id: string;
            status: string;
            expiresAt: Date | null;
        };
        form: any;
        error?: never;
        message?: never;
        completed?: never;
        completedAt?: never;
    }>;
    /**
     * Submete respostas via token público
     * RATE LIMIT: 3 requests por minuto por IP
     */
    submitPublicForm(token: string, body: SubmitTriageDto, ip: string, userAgent: string): Promise<{
        success: any;
        hasRisks: any;
        overallRiskLevel: any;
        canProceed: any;
        blockers: any;
        message: any;
    }>;
}
export {};
//# sourceMappingURL=triage.controller.d.ts.map