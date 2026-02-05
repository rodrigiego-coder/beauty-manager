/**
 * =====================================================
 * ALEXIA QA TEST - RÉGUA DE QUALIDADE
 * 30 perguntas reais para validação de respostas
 * =====================================================
 */

export interface QATestCase {
  id: number;
  category: 'PACKAGE' | 'PRODUCT' | 'SERVICE' | 'SCHEDULE' | 'PRICE' | 'GENERAL';
  question: string;
  expectedWorld: 'A' | 'B' | 'C'; // A=Serviços, B=Pacotes, C=Produtos
  expectedKeywords: string[]; // Palavras que DEVEM aparecer na resposta
  forbiddenKeywords: string[]; // Palavras que NÃO PODEM aparecer na resposta
  expectedIntent: string;
}

/**
 * RÉGUA DE QUALIDADE - 30 PERGUNTAS MAPEADAS
 */
export const QA_TEST_CASES: QATestCase[] = [
  // ========== MUNDO B: PACOTES (10 perguntas) ==========
  {
    id: 1,
    category: 'PACKAGE',
    question: 'Quanto custa o pacote de hidratação?',
    expectedWorld: 'B',
    expectedKeywords: ['250', 'hidratação', 'sessões'],
    forbiddenKeywords: ['elixir', 'shampoo', 'produto'],
    expectedIntent: 'PACKAGE_QUERY',
  },
  {
    id: 2,
    category: 'PACKAGE',
    question: 'Pacote de hidratação',
    expectedWorld: 'B',
    expectedKeywords: ['250', 'hidratação'],
    forbiddenKeywords: ['elixir', 'multibenefícios'],
    expectedIntent: 'PACKAGE_QUERY',
  },
  {
    id: 3,
    category: 'PACKAGE',
    question: 'Qual o valor do cronograma capilar?',
    expectedWorld: 'B',
    expectedKeywords: ['450', 'cronograma'],
    forbiddenKeywords: ['elixir', 'shampoo'],
    expectedIntent: 'PACKAGE_QUERY',
  },
  {
    id: 4,
    category: 'PACKAGE',
    question: 'Quais pacotes vocês tem?',
    expectedWorld: 'B',
    expectedKeywords: ['pacote', 'hidratação', 'cronograma'],
    forbiddenKeywords: ['elixir', 'produto'],
    expectedIntent: 'PACKAGE_QUERY',
  },
  {
    id: 5,
    category: 'PACKAGE',
    question: 'Tem pacote de tratamento?',
    expectedWorld: 'B',
    expectedKeywords: ['pacote'],
    forbiddenKeywords: ['elixir', 'shampoo', 'óleo'],
    expectedIntent: 'PACKAGE_QUERY',
  },
  {
    id: 6,
    category: 'PACKAGE',
    question: 'Quero saber sobre o pacote',
    expectedWorld: 'B',
    expectedKeywords: ['pacote'],
    forbiddenKeywords: ['produto', 'elixir'],
    expectedIntent: 'PACKAGE_QUERY',
  },
  {
    id: 7,
    category: 'PACKAGE',
    question: 'Preço do pacote de 4 sessões',
    expectedWorld: 'B',
    expectedKeywords: ['sessões', '250'],
    forbiddenKeywords: ['elixir', 'multibenefícios'],
    expectedIntent: 'PACKAGE_QUERY',
  },
  {
    id: 8,
    category: 'PACKAGE',
    question: 'Meu pacote tem quantas sessões restantes?',
    expectedWorld: 'B',
    expectedKeywords: ['sessões', 'restantes'],
    forbiddenKeywords: ['elixir', 'produto'],
    expectedIntent: 'PACKAGE_INFO',
  },
  {
    id: 9,
    category: 'PACKAGE',
    question: 'Quero agendar as sessões do meu pacote',
    expectedWorld: 'B',
    expectedKeywords: ['sessões', 'agendar'],
    forbiddenKeywords: ['elixir', 'comprar'],
    expectedIntent: 'PACKAGE_SCHEDULE_ALL',
  },
  {
    id: 10,
    category: 'PACKAGE',
    question: 'Saldo do meu pacote',
    expectedWorld: 'B',
    expectedKeywords: ['pacote', 'sessões'],
    forbiddenKeywords: ['produto', 'elixir'],
    expectedIntent: 'PACKAGE_INFO',
  },

  // ========== MUNDO C: PRODUTOS (10 perguntas) ==========
  {
    id: 11,
    category: 'PRODUCT',
    question: 'Tem elixir multibenefícios?',
    expectedWorld: 'C',
    expectedKeywords: ['elixir'],
    forbiddenKeywords: ['pacote', 'sessões', 'agendar'],
    expectedIntent: 'PRODUCT_INFO',
  },
  {
    id: 12,
    category: 'PRODUCT',
    question: 'Qual o preço do shampoo?',
    expectedWorld: 'C',
    expectedKeywords: ['shampoo', 'R$'],
    forbiddenKeywords: ['pacote', 'sessões'],
    expectedIntent: 'PRICE_INFO',
  },
  {
    id: 13,
    category: 'PRODUCT',
    question: 'Vocês vendem máscara de hidratação?',
    expectedWorld: 'C',
    expectedKeywords: ['máscara'],
    forbiddenKeywords: ['pacote de hidratação'],
    expectedIntent: 'PRODUCT_INFO',
  },
  {
    id: 14,
    category: 'PRODUCT',
    question: 'Tem algum produto para cabelo ressecado?',
    expectedWorld: 'C',
    expectedKeywords: ['produto'],
    forbiddenKeywords: ['pacote', 'sessões', 'agendar'],
    expectedIntent: 'PRODUCT_INFO',
  },
  {
    id: 15,
    category: 'PRODUCT',
    question: 'Quero comprar um leave-in',
    expectedWorld: 'C',
    expectedKeywords: ['leave'],
    forbiddenKeywords: ['pacote', 'agendar'],
    expectedIntent: 'PRODUCT_INFO',
  },
  {
    id: 16,
    category: 'PRODUCT',
    question: 'Quanto custa o óleo capilar?',
    expectedWorld: 'C',
    expectedKeywords: ['óleo', 'R$'],
    forbiddenKeywords: ['pacote', 'sessões'],
    expectedIntent: 'PRICE_INFO',
  },
  {
    id: 17,
    category: 'PRODUCT',
    question: 'Tem encanthus em estoque?',
    expectedWorld: 'C',
    expectedKeywords: ['encanthus'],
    forbiddenKeywords: ['pacote', 'agendar'],
    expectedIntent: 'PRODUCT_INFO',
  },
  {
    id: 18,
    category: 'PRODUCT',
    question: 'Me indica um finalizador bom',
    expectedWorld: 'C',
    expectedKeywords: ['finalizador'],
    forbiddenKeywords: ['pacote', 'sessões'],
    expectedIntent: 'PRODUCT_INFO',
  },
  {
    id: 19,
    category: 'PRODUCT',
    question: 'Produtos para levar pra casa',
    expectedWorld: 'C',
    expectedKeywords: ['produto'],
    forbiddenKeywords: ['pacote', 'agendar'],
    expectedIntent: 'PRODUCT_INFO',
  },
  {
    id: 20,
    category: 'PRODUCT',
    question: 'Revelarium ultra reconstrução tem?',
    expectedWorld: 'C',
    expectedKeywords: ['revelarium', 'reconstrução'],
    forbiddenKeywords: ['pacote', 'sessões'],
    expectedIntent: 'PRODUCT_INFO',
  },

  // ========== MUNDO A: SERVIÇOS (10 perguntas) ==========
  {
    id: 21,
    category: 'SERVICE',
    question: 'Quanto custa o corte feminino?',
    expectedWorld: 'A',
    expectedKeywords: ['corte', 'R$'],
    forbiddenKeywords: ['pacote', 'elixir'],
    expectedIntent: 'PRICE_INFO',
  },
  {
    id: 22,
    category: 'SERVICE',
    question: 'Quero agendar uma escova',
    expectedWorld: 'A',
    expectedKeywords: ['escova', 'agendar'],
    forbiddenKeywords: ['pacote', 'produto'],
    expectedIntent: 'SCHEDULE',
  },
  {
    id: 23,
    category: 'SERVICE',
    question: 'Tem horário para hidratação amanhã?',
    expectedWorld: 'A',
    expectedKeywords: ['horário', 'hidratação'],
    forbiddenKeywords: ['pacote de hidratação', 'elixir'],
    expectedIntent: 'SCHEDULE',
  },
  {
    id: 24,
    category: 'SERVICE',
    question: 'Preço da progressiva',
    expectedWorld: 'A',
    expectedKeywords: ['progressiva', 'R$'],
    forbiddenKeywords: ['pacote', 'produto'],
    expectedIntent: 'PRICE_INFO',
  },
  {
    id: 25,
    category: 'SERVICE',
    question: 'Fazem coloração?',
    expectedWorld: 'A',
    expectedKeywords: ['coloração'],
    forbiddenKeywords: ['pacote', 'produto'],
    expectedIntent: 'SERVICE_INFO',
  },
  {
    id: 26,
    category: 'SERVICE',
    question: 'Quais serviços vocês oferecem?',
    expectedWorld: 'A',
    expectedKeywords: ['serviço'],
    forbiddenKeywords: ['pacote', 'produto'],
    expectedIntent: 'LIST_SERVICES',
  },
  {
    id: 27,
    category: 'SERVICE',
    question: 'Quero marcar horário para mechas',
    expectedWorld: 'A',
    expectedKeywords: ['mechas', 'horário'],
    forbiddenKeywords: ['pacote', 'produto'],
    expectedIntent: 'SCHEDULE',
  },
  {
    id: 28,
    category: 'SERVICE',
    question: 'Quanto tempo dura a hidratação avulsa?',
    expectedWorld: 'A',
    expectedKeywords: ['hidratação', 'minutos'],
    forbiddenKeywords: ['pacote', 'produto'],
    expectedIntent: 'SERVICE_INFO',
  },
  {
    id: 29,
    category: 'SCHEDULE',
    question: 'Tem vaga na sexta?',
    expectedWorld: 'A',
    expectedKeywords: ['sexta', 'horário'],
    forbiddenKeywords: ['pacote', 'produto'],
    expectedIntent: 'SCHEDULE',
  },
  {
    id: 30,
    category: 'GENERAL',
    question: 'Que horas vocês fecham?',
    expectedWorld: 'A',
    expectedKeywords: ['horário', 'funcionamento'],
    forbiddenKeywords: ['pacote', 'produto'],
    expectedIntent: 'HOURS_INFO',
  },
];

/**
 * Resultado de um teste individual
 */
export interface QATestResult {
  testCase: QATestCase;
  actualIntent: string;
  actualResponse: string;
  intentMatch: boolean;
  hasExpectedKeywords: boolean;
  hasForbiddenKeywords: boolean;
  passed: boolean;
  errors: string[];
}

/**
 * Relatório completo de QA
 */
export interface QAReport {
  totalTests: number;
  passed: number;
  failed: number;
  passRate: number;
  byCategory: Record<string, { passed: number; total: number }>;
  byWorld: Record<string, { passed: number; total: number }>;
  failures: QATestResult[];
  timestamp: Date;
}

/**
 * Valida uma resposta contra um caso de teste
 */
export function validateResponse(
  testCase: QATestCase,
  actualIntent: string,
  actualResponse: string,
): QATestResult {
  const errors: string[] = [];
  const responseLower = actualResponse.toLowerCase();

  // Verifica intent
  const intentMatch = actualIntent === testCase.expectedIntent;
  if (!intentMatch) {
    errors.push(`Intent esperado: ${testCase.expectedIntent}, recebido: ${actualIntent}`);
  }

  // Verifica keywords esperadas
  const missingKeywords = testCase.expectedKeywords.filter(
    kw => !responseLower.includes(kw.toLowerCase())
  );
  const hasExpectedKeywords = missingKeywords.length === 0;
  if (!hasExpectedKeywords) {
    errors.push(`Keywords faltando: ${missingKeywords.join(', ')}`);
  }

  // Verifica keywords proibidas
  const foundForbidden = testCase.forbiddenKeywords.filter(
    kw => responseLower.includes(kw.toLowerCase())
  );
  const hasForbiddenKeywords = foundForbidden.length > 0;
  if (hasForbiddenKeywords) {
    errors.push(`Keywords proibidas encontradas: ${foundForbidden.join(', ')}`);
  }

  const passed = intentMatch && hasExpectedKeywords && !hasForbiddenKeywords;

  return {
    testCase,
    actualIntent,
    actualResponse,
    intentMatch,
    hasExpectedKeywords,
    hasForbiddenKeywords,
    passed,
    errors,
  };
}

/**
 * Gera relatório de QA
 */
export function generateReport(results: QATestResult[]): QAReport {
  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;

  const byCategory: Record<string, { passed: number; total: number }> = {};
  const byWorld: Record<string, { passed: number; total: number }> = {};

  for (const result of results) {
    const cat = result.testCase.category;
    const world = result.testCase.expectedWorld;

    if (!byCategory[cat]) byCategory[cat] = { passed: 0, total: 0 };
    if (!byWorld[world]) byWorld[world] = { passed: 0, total: 0 };

    byCategory[cat].total++;
    byWorld[world].total++;

    if (result.passed) {
      byCategory[cat].passed++;
      byWorld[world].passed++;
    }
  }

  return {
    totalTests: results.length,
    passed,
    failed,
    passRate: Math.round((passed / results.length) * 100),
    byCategory,
    byWorld,
    failures: results.filter(r => !r.passed),
    timestamp: new Date(),
  };
}

/**
 * Formata relatório para exibição
 */
export function formatReport(report: QAReport): string {
  let output = `
╔══════════════════════════════════════════════════════════════╗
║           ALEXIA QA REPORT - RÉGUA DE QUALIDADE              ║
╠══════════════════════════════════════════════════════════════╣
║  Total de Testes: ${String(report.totalTests).padEnd(3)}                                      ║
║  ✅ Passou: ${String(report.passed).padEnd(3)}                                             ║
║  ❌ Falhou: ${String(report.failed).padEnd(3)}                                             ║
║  📊 Taxa de Acerto: ${String(report.passRate).padEnd(3)}%                                    ║
╠══════════════════════════════════════════════════════════════╣
║  POR MUNDO:                                                  ║
║    🅰️  Mundo A (Serviços): ${String(report.byWorld['A']?.passed || 0).padEnd(2)}/${String(report.byWorld['A']?.total || 0).padEnd(2)}                            ║
║    🅱️  Mundo B (Pacotes):  ${String(report.byWorld['B']?.passed || 0).padEnd(2)}/${String(report.byWorld['B']?.total || 0).padEnd(2)}                            ║
║    ©️  Mundo C (Produtos): ${String(report.byWorld['C']?.passed || 0).padEnd(2)}/${String(report.byWorld['C']?.total || 0).padEnd(2)}                            ║
╠══════════════════════════════════════════════════════════════╣
║  POR CATEGORIA:                                              ║`;

  for (const [cat, stats] of Object.entries(report.byCategory)) {
    output += `\n║    ${cat.padEnd(12)}: ${String(stats.passed).padEnd(2)}/${String(stats.total).padEnd(2)}                                      ║`;
  }

  output += `
╚══════════════════════════════════════════════════════════════╝`;

  if (report.failures.length > 0) {
    output += `\n\n❌ FALHAS DETALHADAS:\n`;
    for (const failure of report.failures) {
      output += `\n[#${failure.testCase.id}] "${failure.testCase.question}"`;
      output += `\n   Mundo: ${failure.testCase.expectedWorld} | Intent esperado: ${failure.testCase.expectedIntent}`;
      output += `\n   Erros: ${failure.errors.join('; ')}`;
      output += `\n   Resposta: "${failure.actualResponse.substring(0, 100)}..."`;
      output += `\n`;
    }
  }

  return output;
}
