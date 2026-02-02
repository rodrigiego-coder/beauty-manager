"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOCK_DATA = exports.GEMINI_TOOLS = void 0;
const generative_ai_1 = require("@google/generative-ai");
/**
 * Definicao das ferramentas (Function Calling) para o Gemini
 * Formato conforme documentacao do Google AI
 */
exports.GEMINI_TOOLS = [
    {
        name: 'check_availability',
        description: 'Verifica os horarios disponiveis na agenda do salao para uma data especifica. Use quando o cliente perguntar sobre disponibilidade de horarios.',
        parameters: {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {
                date: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: 'Data para verificar disponibilidade no formato YYYY-MM-DD. Se o cliente disser "amanha", converta para a data correta.',
                },
                service: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: 'Tipo de servico desejado (ex: corte, coloracao, manicure). Opcional.',
                },
            },
            required: ['date'],
        },
    },
    {
        name: 'book_appointment',
        description: 'Agenda um horario para o cliente. Use apos confirmar disponibilidade e obter os dados do cliente.',
        parameters: {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {
                date: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: 'Data do agendamento no formato YYYY-MM-DD',
                },
                time: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: 'Horario do agendamento no formato HH:MM',
                },
                clientName: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: 'Nome do cliente',
                },
                clientPhone: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: 'Telefone do cliente',
                },
                service: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: 'Servico a ser realizado',
                },
            },
            required: ['date', 'time', 'clientName', 'service'],
        },
    },
    {
        name: 'get_services',
        description: 'Retorna a lista de servicos oferecidos pelo salao com precos e duracao.',
        parameters: {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {},
            required: [],
        },
    },
    {
        name: 'check_low_stock',
        description: 'Verifica produtos com estoque baixo (quantidade atual menor ou igual ao estoque minimo). Use para alertar sobre produtos que precisam ser repostos.',
        parameters: {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {},
            required: [],
        },
    },
    {
        name: 'calculate_kpis',
        description: 'Calcula indicadores de performance (KPIs) do salao: Ticket Medio, Taxa de Retorno de clientes, Top 3 servicos mais rentaveis. Use para relatorios gerenciais e analise de desempenho.',
        parameters: {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {
                startDate: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: 'Data inicial do periodo no formato YYYY-MM-DD. Opcional.',
                },
                endDate: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: 'Data final do periodo no formato YYYY-MM-DD. Opcional.',
                },
            },
            required: [],
        },
    },
    {
        name: 'get_client_history',
        description: 'Busca historico completo de um cliente: notas tecnicas (quimica, alergias), preferencias pessoais e ultimos agendamentos. Use para personalizar o atendimento.',
        parameters: {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {
                phone: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: 'Telefone do cliente para buscar historico.',
                },
            },
            required: ['phone'],
        },
    },
];
/**
 * Dados mockados para testes
 */
exports.MOCK_DATA = {
    availableSlots: ['09:00', '10:30', '14:00', '15:30', '16:00', '17:30'],
    services: [
        { name: 'Corte Feminino', price: 80, duration: 60 },
        { name: 'Corte Masculino', price: 50, duration: 30 },
        { name: 'Coloracao', price: 150, duration: 120 },
        { name: 'Escova', price: 60, duration: 45 },
        { name: 'Manicure', price: 40, duration: 40 },
        { name: 'Pedicure', price: 50, duration: 50 },
        { name: 'Sobrancelha', price: 30, duration: 20 },
    ],
};
//# sourceMappingURL=ai-receptionist.tools.js.map