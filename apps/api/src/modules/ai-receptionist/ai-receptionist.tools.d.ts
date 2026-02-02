import { FunctionDeclaration } from '@google/generative-ai';
/**
 * Definicao das ferramentas (Function Calling) para o Gemini
 * Formato conforme documentacao do Google AI
 */
export declare const GEMINI_TOOLS: FunctionDeclaration[];
/**
 * Dados mockados para testes
 */
export declare const MOCK_DATA: {
    availableSlots: string[];
    services: {
        name: string;
        price: number;
        duration: number;
    }[];
};
//# sourceMappingURL=ai-receptionist.tools.d.ts.map