export declare class ChatMessageDto {
    message: string;
}
export declare class UpdateAISettingsDto {
    isEnabled?: boolean;
    assistantName?: string;
    personality?: string;
    dailyBriefingEnabled?: boolean;
    dailyBriefingTime?: string;
    alertsEnabled?: boolean;
    tipsEnabled?: boolean;
}
export declare class CreateClientNoteDto {
    clientId: string;
    noteType: string;
    content: string;
}
export interface BriefingResponse {
    message: string;
    alerts: Array<{
        type: string;
        title: string;
        description: string;
    }>;
    tips: string[];
}
export interface ChatResponse {
    response: string;
}
export interface InsightResponse {
    insight: string;
}
export interface AISettingsResponse {
    id: string;
    salonId: string;
    isEnabled: boolean;
    assistantName: string;
    personality: string;
    dailyBriefingEnabled: boolean;
    dailyBriefingTime: string;
    alertsEnabled: boolean;
    tipsEnabled: boolean;
}
export interface ConversationMessage {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
}
//# sourceMappingURL=dto.d.ts.map