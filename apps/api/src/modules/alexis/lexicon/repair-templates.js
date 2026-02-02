"use strict";
/**
 * =====================================================
 * REPAIR TEMPLATES — Respostas premium para o dialeto de salão
 * Normaliza termos coloquiais sem soar professoral.
 * Puro e testável (sem DB).
 * =====================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyRepairTemplate = applyRepairTemplate;
exports.composeRepairResponse = composeRepairResponse;
// ========== NEXT QUESTION MAP ==========
const NEXT_QUESTIONS = {
    ASK_HAIR_LENGTH_CHEMISTRY: 'Seu cabelo é curto, médio ou longo? E já fez alguma química recentemente?',
    ASK_BOTOX_INTENT: 'Quando você fala em botox, é pra alinhar os fios (tipo alisamento leve) ou pra tratamento de reconstrução?',
    ASK_MATIZ_TONE: 'Você prefere um tom mais pérola (frio) ou bege (quente)?',
    ASK_MECHAS_STYLE: 'Tem alguma referência de foto? Pode ser babylights (natural) ou balayage (mais marcado).',
    ASK_COLOR_INTENT: 'Você quer mudar completamente de cor ou retocar o que já tem?',
    ASK_CHEMISTRY_HISTORY: 'Me conta: seu cabelo tem alguma química (progressiva, coloração, descoloração)?',
    ASK_HAIR_LOSS_DURATION: 'Faz quanto tempo que notou a queda? E está usando algum produto específico?',
};
// ========== TEMPLATE FUNCTIONS ==========
/**
 * REPAIR_SERVICE_CANONICAL
 * Normaliza termo coloquial para serviço canônico sem soar professoral.
 */
function repairServiceCanonical(ctx) {
    const { entry, matchedTrigger, serviceName, hasPrice, price } = ctx;
    const displayService = serviceName || entry.canonical;
    let text;
    if (hasPrice && price) {
        text = `Aqui no salão, *${matchedTrigger}* é o nosso serviço de *${displayService}*. O valor é a partir de R$ ${price} 😊`;
    }
    else {
        text = `Aqui no salão, *${matchedTrigger}* é o nosso serviço de *${displayService}* 😊`;
    }
    if (entry.requiresPatchTest) {
        text += '\nPara esse procedimento, recomendamos um teste de mecha antes da aplicação.';
    }
    const followUpQuestion = entry.nextQuestionKey
        ? NEXT_QUESTIONS[entry.nextQuestionKey]
        : undefined;
    return { text, followUpQuestion };
}
/**
 * REPAIR_CONDITION_TO_PROTOCOL
 * Condição do cabelo -> protocolo de tratamento.
 */
function repairConditionToProtocol(ctx) {
    const { entry, matchedTrigger } = ctx;
    const text = `Entendi, "${matchedTrigger}" pode indicar necessidade de *${entry.canonical}*. Vou te orientar para o melhor protocolo 😊`;
    const followUpQuestion = entry.nextQuestionKey
        ? NEXT_QUESTIONS[entry.nextQuestionKey]
        : 'Me conta mais sobre o histórico do seu cabelo?';
    return { text, followUpQuestion };
}
/**
 * REPAIR_AMBIGUOUS_ASK_CONFIRM
 * Termo ambíguo -> pergunta de confirmação (1 passo).
 */
function repairAmbiguousAskConfirm(ctx) {
    const { entry } = ctx;
    const text = `Legal! Sobre *${entry.canonical}*, preciso entender o que você procura 😊`;
    const followUpQuestion = entry.nextQuestionKey
        ? NEXT_QUESTIONS[entry.nextQuestionKey]
        : 'Pode me contar mais sobre o resultado que espera?';
    return { text, followUpQuestion };
}
// ========== PUBLIC API ==========
const TEMPLATE_MAP = {
    REPAIR_SERVICE_CANONICAL: repairServiceCanonical,
    REPAIR_CONDITION_TO_PROTOCOL: repairConditionToProtocol,
    REPAIR_AMBIGUOUS_ASK_CONFIRM: repairAmbiguousAskConfirm,
};
/**
 * Aplica o template de reparo adequado para a entrada do lexicon.
 */
function applyRepairTemplate(ctx) {
    const fn = TEMPLATE_MAP[ctx.entry.repairTemplateKey];
    return fn(ctx);
}
/**
 * Compoe a resposta final de reparo: texto + follow-up question.
 */
function composeRepairResponse(result) {
    if (result.followUpQuestion) {
        return `${result.text}\n\n${result.followUpQuestion}`;
    }
    return result.text;
}
//# sourceMappingURL=repair-templates.js.map