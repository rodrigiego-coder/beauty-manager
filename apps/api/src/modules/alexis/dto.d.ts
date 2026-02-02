/**
 * =====================================================
 * ALEXIS DTOs
 * =====================================================
 */
export declare class SendMessageDto {
    message: string;
    sessionId?: string;
    clientPhone?: string;
    clientName?: string;
}
export declare class HumanMessageDto {
    sessionId: string;
    message: string;
}
export declare class TakeoverDto {
    sessionId: string;
    reason?: string;
}
export declare class UpdateAlexisSettingsDto {
    isEnabled?: boolean;
    assistantName?: string;
    welcomeMessage?: string;
    personality?: 'PROFESSIONAL' | 'FRIENDLY' | 'CASUAL';
    language?: string;
    complianceLevel?: 'STRICT' | 'MODERATE' | 'RELAXED';
    anvisaWarningsEnabled?: boolean;
    lgpdConsentRequired?: boolean;
    dataRetentionDays?: number;
    autoResponseEnabled?: boolean;
    maxResponsesPerMinute?: number;
    humanTakeoverKeywords?: string[];
    aiResumeKeywords?: string[];
    operatingHoursEnabled?: boolean;
    operatingHoursStart?: string;
    operatingHoursEnd?: string;
    outOfHoursMessage?: string;
    whatsappIntegrationId?: string;
    webhookUrl?: string;
}
export declare class CreateBlockedKeywordDto {
    keyword: string;
    category: 'ANVISA' | 'LGPD' | 'PROFANITY' | 'CUSTOM';
    violationType: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    action?: 'BLOCK' | 'WARN' | 'FLAG' | 'SANITIZE';
    replacement?: string;
    warningMessage?: string;
}
export declare class CreateResponseTemplateDto {
    name: string;
    category: 'GREETING' | 'SCHEDULING' | 'SERVICES' | 'PRICES' | 'HOURS' | 'FAQ' | 'GOODBYE';
    triggerKeywords?: string[];
    content: string;
    variables?: string[];
}
export declare class UpdateResponseTemplateDto {
    name?: string;
    category?: string;
    triggerKeywords?: string[];
    content?: string;
    variables?: string[];
    isActive?: boolean;
}
export declare class EndSessionDto {
    sessionId: string;
    resolution?: string;
}
export declare class WhatsAppWebhookDto {
    object: string;
    entry: any[];
}
export interface AlexisStatusResponse {
    isEnabled: boolean;
    isConfigured: boolean;
    model: string;
    assistantName: string;
    complianceLevel: string;
    features: {
        whatsapp: boolean;
        autoResponse: boolean;
        lgpdConsent: boolean;
        anvisaWarnings: boolean;
    };
}
export interface SessionSummary {
    id: string;
    clientPhone: string;
    clientName: string | null;
    status: string;
    controlMode: string;
    messageCount: number;
    lastMessageAt: Date | null;
    startedAt: Date;
}
export interface ConversationMessage {
    id: string;
    direction: 'INBOUND' | 'OUTBOUND';
    content: string;
    respondedBy: 'AI' | 'HUMAN';
    complianceRisk: string;
    createdAt: Date;
}
export interface ComplianceStats {
    totalBlocks: number;
    totalFlags: number;
    byCategory: {
        ANVISA: number;
        LGPD: number;
        PROFANITY: number;
        CUSTOM: number;
    };
    recentViolations: {
        id: string;
        type: string;
        riskLevel: string;
        createdAt: Date;
    }[];
}
export interface MetricsSummary {
    period: string;
    totalSessions: number;
    totalMessages: number;
    aiResponses: number;
    humanResponses: number;
    humanTakeovers: number;
    avgResponseTime: number | null;
    complianceBlocks: number;
    appointmentsBooked: number;
}
//# sourceMappingURL=dto.d.ts.map