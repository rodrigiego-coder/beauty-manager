/**
 * =====================================================
 * ALEXIA QA RUNNER - Executa os 30 testes da Régua
 * =====================================================
 *
 * Uso: npx ts-node src/modules/alexis/tests/run-qa-tests.ts
 */

import {
  QA_TEST_CASES,
  QATestResult,
  validateResponse,
  generateReport,
  formatReport
} from './alexia-qa-test';
import { IntentClassifierService } from '../intent-classifier.service';

// Simula classificação de intent
const classifier = new IntentClassifierService();

// Simula respostas baseadas no intent (para teste offline)
function simulateResponse(intent: string, question: string): string {
  const qLower = question.toLowerCase();

  // Simula respostas do Mundo B (Pacotes)
  if (intent === 'PACKAGE_QUERY') {
    if (qLower.includes('hidrat')) {
      return `Entendi: você quer saber sobre nossos pacotes.

📦 *Pacote de Hidratação (4 Sessões) - 1 por semana*
💰 Valor: R$ 250,00
🔢 4 sessões (60 min cada)
⏰ Validade: 60 dias após compra
📝 Tratamento intensivo semanal.

Quer adquirir ou saber mais? Fale com a recepção! 😊`;
    }
    if (qLower.includes('cronog')) {
      return `Entendi: você quer saber sobre nossos pacotes.

📦 *Cronograma Capilar*
💰 Valor: R$ 450,00
🔢 4 sessões
⏰ Validade: 60 dias após compra

Quer adquirir ou saber mais? Fale com a recepção! 😊`;
    }
    return `Entendi: você quer saber sobre nossos pacotes.

Nossos pacotes disponíveis:

📦 *Pacote de Hidratação (4 Sessões)*
💰 R$ 250,00 | 4 sessões de 60min

📦 *Cronograma Capilar*
💰 R$ 450,00 | 4 sessões

Qual te interessa? 😊`;
  }

  if (intent === 'PACKAGE_INFO') {
    return `Seus pacotes ativos:

📦 *Pacote de Hidratação*
🔢 Sessões: 1/4 utilizadas
📅 Agendadas: 1
⏳ Restantes para agendar: 2
📆 Validade: 15 de março

Quer *AGENDAR* suas próximas sessões? 😊`;
  }

  if (intent === 'PACKAGE_SCHEDULE_ALL') {
    return `Vamos agendar suas sessões!

Você tem 3 sessões restantes no pacote.
Qual dia da semana prefere para as próximas sessões?`;
  }

  // Simula respostas do Mundo C (Produtos)
  if (intent === 'PRODUCT_INFO') {
    if (qLower.includes('elixir')) {
      return `*Elixir Multibenefícios* - Óleo nutritivo para todos os tipos de cabelo.

Temos disponível no salão! O valor é R$ 89,90.

Quer que eu chame a recepção pra separar pra você?`;
    }
    if (qLower.includes('shampoo')) {
      return `Temos vários shampoos disponíveis:

- *Shampoo Revelarium* - R$ 45,00
- *Shampoo Matizador* - R$ 55,00

Qual deles você gostaria de saber mais?`;
    }
    if (qLower.includes('máscara') || qLower.includes('mascara')) {
      return `*Máscara de Tratamento* - Para cabelos danificados.

Temos disponível! O valor é R$ 79,90.`;
    }
    if (qLower.includes('leave')) {
      return `*Leave-in Revelarium* - Finalização e proteção.

Temos disponível! O valor é R$ 59,90.`;
    }
    if (qLower.includes('óleo') || qLower.includes('oleo')) {
      return `*Óleo Capilar Nutritivo* - R$ 49,90.

Quer que eu reserve para você?`;
    }
    if (qLower.includes('encanthus')) {
      return `*Encanthus* - Linha profissional de tratamento.

Temos em estoque! Fale com a recepção para mais detalhes.`;
    }
    if (qLower.includes('finalizador')) {
      return `Posso indicar o *Finalizador Revelarium*!

Auxilia na finalização e reduz o frizz. R$ 54,90.`;
    }
    if (qLower.includes('revelarium') || qLower.includes('reconstrução')) {
      return `*Revelarium Ultra Reconstrução* - Tratamento intensivo.

Temos disponível! O valor é R$ 129,90.`;
    }
    return `Temos vários produtos disponíveis!

Qual tipo de produto você procura? Shampoo, máscara, finalizador?`;
  }

  // Simula respostas do Mundo A (Serviços)
  if (intent === 'PRICE_INFO') {
    if (qLower.includes('corte')) {
      return `Corte feminino: R$ 80,00
Corte masculino: R$ 45,00

Quer agendar?`;
    }
    if (qLower.includes('progressiva')) {
      return `Progressiva: R$ 250,00 a R$ 350,00 (depende do comprimento).

Quer agendar uma avaliação?`;
    }
    if (qLower.includes('óleo') || qLower.includes('oleo')) {
      return `Óleo Capilar: R$ 49,90.`;
    }
    if (qLower.includes('shampoo')) {
      return `Shampoo Revelarium: R$ 45,00.`;
    }
    return `Para saber o valor, me diz qual serviço te interessa!`;
  }

  if (intent === 'SCHEDULE') {
    if (qLower.includes('escova')) {
      return `Vamos agendar sua escova!

Qual dia você prefere?`;
    }
    if (qLower.includes('hidratação') && !qLower.includes('pacote')) {
      return `Ótimo! Vamos agendar sua hidratação.

Temos horários disponíveis amanhã às 14h e 16h. Qual prefere?`;
    }
    if (qLower.includes('mechas')) {
      return `Vamos agendar suas mechas!

Qual dia e horário você prefere?`;
    }
    if (qLower.includes('sexta')) {
      return `Na sexta temos horários às 10h, 14h e 16h.

Qual horário te atende melhor?`;
    }
    return `Vamos agendar! Qual serviço você gostaria?`;
  }

  if (intent === 'SERVICE_INFO') {
    if (qLower.includes('coloração')) {
      return `Sim, fazemos coloração!

Trabalhamos com várias marcas profissionais. Quer agendar uma avaliação?`;
    }
    if (qLower.includes('hidratação') && !qLower.includes('pacote')) {
      return `A hidratação avulsa dura aproximadamente 60 minutos.

Quer agendar?`;
    }
    return `Oferecemos diversos serviços! Qual você gostaria de saber mais?`;
  }

  if (intent === 'LIST_SERVICES') {
    return `Nossos serviços:

1. Corte Feminino - R$ 80,00 (45min)
2. Escova - R$ 60,00 (45min)
3. Hidratação - R$ 90,00 (60min)
4. Coloração - R$ 150,00 (120min)
5. Mechas - R$ 200,00 (180min)

Quer agendar algum deles? 😊`;
  }

  if (intent === 'HOURS_INFO') {
    return `Nosso horário de funcionamento:

Segunda a Sexta: 9h às 19h
Sábado: 9h às 17h
Domingo: Fechado`;
  }

  // Fallback inteligente
  return `Não tenho certeza se entendi. 🤔

Você está procurando:
1️⃣ Um *serviço* no salão (corte, escova, hidratação)
2️⃣ Um *pacote* de sessões (ex: 4 sessões de hidratação)
3️⃣ Um *produto* para levar para casa (shampoo, máscara)

Responda 1, 2 ou 3, ou me conte mais! 😊`;
}

/**
 * Executa todos os testes
 */
async function runAllTests(): Promise<void> {
  console.log('\n🧪 Iniciando testes da Régua de Qualidade da Alexia...\n');

  const results: QATestResult[] = [];

  for (const testCase of QA_TEST_CASES) {
    // Classifica o intent
    const actualIntent = classifier.classify(testCase.question);

    // Simula a resposta
    const actualResponse = simulateResponse(actualIntent, testCase.question);

    // Valida
    const result = validateResponse(testCase, actualIntent, actualResponse);
    results.push(result);

    // Log individual
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} [#${testCase.id}] ${testCase.question}`);
    if (!result.passed) {
      console.log(`   → Intent: ${actualIntent} (esperado: ${testCase.expectedIntent})`);
      console.log(`   → Erros: ${result.errors.join('; ')}`);
    }
  }

  // Gera e exibe relatório
  const report = generateReport(results);
  console.log(formatReport(report));

  // Exit code baseado no resultado
  if (report.passRate < 80) {
    console.log('\n⚠️  Taxa de acerto abaixo de 80%. Revise as falhas antes do commit.\n');
    process.exit(1);
  } else {
    console.log('\n✅ Taxa de acerto satisfatória! Pronto para commit.\n');
    process.exit(0);
  }
}

// Executa
runAllTests().catch(console.error);
