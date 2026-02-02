"use strict";
/**
 * Seed para formulário padrão de triagem química
 * Executar: npx ts-node src/modules/triage/triage.seed.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const schema_1 = require("../../database/schema");
const CONSENT_TEXT = `Declaro que todas as informações fornecidas neste formulário são verdadeiras e completas.
Entendo que a omissão ou falsidade de qualquer informação pode resultar em danos à minha saúde capilar e/ou física.

Autorizo o profissional a realizar uma avaliação prévia e seguir as recomendações técnicas baseadas nas minhas respostas.

Estou ciente de que:
• Procedimentos químicos envolvem riscos quando há histórico não informado
• O profissional pode recusar o procedimento por questões de segurança
• Sou responsável por informar qualquer alteração de saúde antes do procedimento`;
const DEFAULT_QUESTIONS = [
    // ===== HISTÓRICO QUÍMICO =====
    {
        category: 'CHEMICAL_HISTORY',
        categoryLabel: 'Histórico Químico',
        questionText: 'Realizou alisamento, progressiva ou relaxamento nos últimos 6 meses?',
        helpText: 'Inclui qualquer procedimento de redução de volume',
        answerType: 'BOOLEAN',
        riskLevel: 'HIGH',
        riskTriggerValue: 'SIM',
        riskMessage: 'Histórico recente de química - avaliar compatibilidade',
        blocksProcedure: false,
        requiresNote: true,
        sortOrder: 1,
        isRequired: true,
    },
    {
        category: 'CHEMICAL_HISTORY',
        categoryLabel: 'Histórico Químico',
        questionText: 'Fez coloração, descoloração ou mechas recentemente?',
        helpText: 'Nos últimos 30 dias',
        answerType: 'BOOLEAN',
        riskLevel: 'MEDIUM',
        riskTriggerValue: 'SIM',
        riskMessage: 'Coloração recente - verificar integridade',
        blocksProcedure: false,
        requiresNote: true,
        sortOrder: 2,
        isRequired: true,
    },
    {
        category: 'CHEMICAL_HISTORY',
        categoryLabel: 'Histórico Químico',
        questionText: 'Usou henê ou produtos à base de chumbo no cabelo?',
        helpText: 'Mesmo que há muito tempo',
        answerType: 'BOOLEAN',
        riskLevel: 'CRITICAL',
        riskTriggerValue: 'SIM',
        riskMessage: 'HENÊ DETECTADO - NÃO aplicar química! Risco de corte químico',
        blocksProcedure: true,
        requiresNote: false,
        sortOrder: 3,
        isRequired: true,
    },
    {
        category: 'CHEMICAL_HISTORY',
        categoryLabel: 'Histórico Químico',
        questionText: 'Qual produto foi usado no último procedimento?',
        helpText: 'Nome do produto ou marca, se souber',
        answerType: 'TEXT',
        riskLevel: 'LOW',
        riskTriggerValue: '',
        riskMessage: '',
        blocksProcedure: false,
        requiresNote: false,
        sortOrder: 4,
        isRequired: false,
    },
    // ===== CONDIÇÕES DE SAÚDE =====
    {
        category: 'HEALTH_CONDITION',
        categoryLabel: 'Condições de Saúde',
        questionText: 'Está grávida ou amamentando?',
        answerType: 'BOOLEAN',
        riskLevel: 'CRITICAL',
        riskTriggerValue: 'SIM',
        riskMessage: 'GESTANTE/LACTANTE - Procedimentos químicos contraindicados',
        blocksProcedure: true,
        requiresNote: false,
        sortOrder: 10,
        isRequired: true,
    },
    {
        category: 'HEALTH_CONDITION',
        categoryLabel: 'Condições de Saúde',
        questionText: 'Está fazendo tratamento com medicamentos fortes?',
        helpText: 'Quimioterapia, antibióticos, corticoides, etc.',
        answerType: 'BOOLEAN',
        riskLevel: 'HIGH',
        riskTriggerValue: 'SIM',
        riskMessage: 'Tratamento medicamentoso - avaliar com cuidado',
        blocksProcedure: false,
        requiresNote: true,
        sortOrder: 11,
        isRequired: true,
    },
    {
        category: 'HEALTH_CONDITION',
        categoryLabel: 'Condições de Saúde',
        questionText: 'Tem alguma condição de pele no couro cabeludo?',
        helpText: 'Dermatite, psoríase, feridas, etc.',
        answerType: 'BOOLEAN',
        riskLevel: 'HIGH',
        riskTriggerValue: 'SIM',
        riskMessage: 'Condição de pele - verificar área afetada',
        blocksProcedure: false,
        requiresNote: true,
        sortOrder: 12,
        isRequired: true,
    },
    // ===== INTEGRIDADE CAPILAR =====
    {
        category: 'HAIR_INTEGRITY',
        categoryLabel: 'Integridade Capilar',
        questionText: 'O cabelo está quebrando ou com elasticidade alterada?',
        helpText: 'Cabelo que estica e não volta ou quebra com facilidade',
        answerType: 'BOOLEAN',
        riskLevel: 'HIGH',
        riskTriggerValue: 'SIM',
        riskMessage: 'Cabelo fragilizado - necessita reconstrução prévia',
        blocksProcedure: false,
        requiresNote: true,
        sortOrder: 20,
        isRequired: true,
    },
    {
        category: 'HAIR_INTEGRITY',
        categoryLabel: 'Integridade Capilar',
        questionText: 'Já teve corte químico ou quebra severa antes?',
        answerType: 'BOOLEAN',
        riskLevel: 'CRITICAL',
        riskTriggerValue: 'SIM',
        riskMessage: 'HISTÓRICO DE CORTE QUÍMICO - Procedimento com risco elevado',
        blocksProcedure: false,
        requiresNote: true,
        sortOrder: 21,
        isRequired: true,
    },
    {
        category: 'HAIR_INTEGRITY',
        categoryLabel: 'Integridade Capilar',
        questionText: 'Usa chapinha ou secador com frequência?',
        helpText: 'Mais de 3x por semana',
        answerType: 'BOOLEAN',
        riskLevel: 'MEDIUM',
        riskTriggerValue: 'SIM',
        riskMessage: 'Uso frequente de calor - verificar danos térmicos',
        blocksProcedure: false,
        requiresNote: false,
        sortOrder: 22,
        isRequired: true,
    },
    // ===== ALERGIAS =====
    {
        category: 'ALLERGY',
        categoryLabel: 'Alergias',
        questionText: 'Tem alergia conhecida a produtos químicos capilares?',
        helpText: 'Já teve reação a tinturas, alisantes, etc.',
        answerType: 'BOOLEAN',
        riskLevel: 'CRITICAL',
        riskTriggerValue: 'SIM',
        riskMessage: 'ALERGIA A QUÍMICOS - Necessário teste de mecha',
        blocksProcedure: false,
        requiresNote: true,
        sortOrder: 30,
        isRequired: true,
    },
    {
        category: 'ALLERGY',
        categoryLabel: 'Alergias',
        questionText: 'Já fez teste de alergia (patch test) antes?',
        answerType: 'BOOLEAN',
        riskLevel: 'LOW',
        riskTriggerValue: 'NÃO',
        riskMessage: 'Nunca fez patch test - recomendar para primeira aplicação',
        blocksProcedure: false,
        requiresNote: false,
        sortOrder: 31,
        isRequired: true,
    },
];
async function seed() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL não definida');
        process.exit(1);
    }
    const pool = new pg_1.Pool({ connectionString });
    const db = (0, node_postgres_1.drizzle)(pool);
    // Busca o primeiro salão para criar o formulário padrão
    const salonResult = await pool.query('SELECT id FROM salons LIMIT 1');
    if (salonResult.rows.length === 0) {
        console.error('Nenhum salão encontrado. Crie um salão primeiro.');
        await pool.end();
        process.exit(1);
    }
    const salonId = salonResult.rows[0].id;
    console.log(`Criando formulário para salão: ${salonId}`);
    // Cria o formulário
    const [form] = await db
        .insert(schema_1.triageForms)
        .values({
        salonId,
        name: 'Pré-Avaliação - Serviços Químicos',
        description: 'Formulário padrão para avaliação de riscos antes de procedimentos químicos',
        serviceCategory: 'QUIMICA',
        consentText: CONSENT_TEXT,
        requiresConsent: true,
        isActive: true,
        version: 1,
    })
        .returning();
    console.log(`Formulário criado: ${form.id}`);
    // Cria as perguntas
    for (const question of DEFAULT_QUESTIONS) {
        await db.insert(schema_1.triageQuestions).values({
            formId: form.id,
            category: question.category,
            categoryLabel: question.categoryLabel,
            questionText: question.questionText,
            helpText: question.helpText || null,
            answerType: question.answerType,
            options: question.options || null,
            riskLevel: question.riskLevel,
            riskTriggerValue: question.riskTriggerValue,
            riskMessage: question.riskMessage,
            blocksProcedure: question.blocksProcedure,
            requiresNote: question.requiresNote,
            sortOrder: question.sortOrder,
            isRequired: question.isRequired,
            isActive: true,
        });
    }
    console.log(`${DEFAULT_QUESTIONS.length} perguntas criadas`);
    console.log('Seed concluído com sucesso!');
    await pool.end();
}
// Execução direta
seed().catch(console.error);
//# sourceMappingURL=triage.seed.js.map