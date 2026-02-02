import { OnModuleInit } from '@nestjs/common';
export declare class GeminiService implements OnModuleInit {
    private genAI;
    private model;
    onModuleInit(): void;
    isEnabled(): boolean;
    generateContent(prompt: string): Promise<string>;
    chat(history: Array<{
        role: string;
        content: string;
    }>, message: string): Promise<string>;
}
//# sourceMappingURL=gemini.service.d.ts.map