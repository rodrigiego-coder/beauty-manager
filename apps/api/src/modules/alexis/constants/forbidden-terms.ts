/**
 * =====================================================
 * TERMOS PROIBIDOS - ANVISA + LGPD + JURÍDICO
 * =====================================================
 * Alexia é uma ASSISTENTE ADMINISTRATIVA E COMERCIAL
 * NÃO é médica, dermatologista ou química
 * =====================================================
 */

// REGEX PARA TERMOS PROIBIDOS
export const FORBIDDEN_REGEX = {
  // Ingredientes proibidos ANVISA
  anvisa: /\b(formol|formolde[ií]do|formaldehyde|formaldeído|alde[ií]do|ácido\s*(forte|potente|qu[ií]mico)?|progressiva\s*(com|de)\s*formol|escova\s*(com|de)\s*formol)\b/gi,

  // Termos médicos/terapêuticos
  medical: /\b(cura|curar|curativo|tratamento\s*m[eé]dico|medicamento|rem[eé]dio|doen[cç]a|patologia|inflama[cç][aã]o|diagn[oó]stico|alop[eé]cia|dermatite|queda\s*patol[oó]gica|regenera[cç][aã]o\s*celular|terapia|cl[ií]nico)\b/gi,

  // Promessas milagrosas
  promises: /\b(resultado\s*garantido|garantia\s*de\s*resultado|efeito\s*definitivo|definitivamente|nunca\s*mais|elimina\s*totalmente|resolve\s*de\s*vez|milagre|milagroso|100%\s*(eficaz|garantido)|permanente)\b/gi,

  // Linguagem absoluta
  absolute: /\b(sempre\s*funciona|funciona\s*para\s*todos|qualquer\s*cabelo|sem\s*exce[cç][aã]o|comprovado\s*cientificamente|cient[ií]fico|estudo\s*cl[ií]nico)\b/gi,

  // Promessas de transformação
  transformation: /\b(cresce\s*cabelo|faz\s*o\s*cabelo\s*crescer|para\s*queda|impede\s*queda|trata\s*queda|nascer\s*cabelo|anti\s*queda\s*definitivo)\b/gi,

  // Linguagem ofensiva
  offensive: /\b(idiota|burra?|est[uú]pido|merda|porra|caralho|lixo|droga|enganar|enganoso|golpe|fraude)\b/gi,

  // Tentativas de burla (homóglifos, números no lugar de letras)
  bypass: /\b(f[o0]rm[o0]l|f[o0]rmal|f[o0]rmalde[i1]do|cur[a@]|tr[a@]tamento|m[e3]dic[o0])\b/gi,
};

// SUBSTITUIÇÕES SEGURAS (quando possível sanitizar em vez de bloquear)
export const SAFE_REPLACEMENTS: Record<string, string> = {
  cura: 'ajuda na manutenção',
  tratamento: 'cuidado estético',
  elimina: 'auxilia na redução',
  definitivo: 'quando usado regularmente',
  garante: 'pode contribuir',
  'resultado garantido': 'resultados podem variar',
  'nunca mais': 'ajuda a reduzir',
  'cresce cabelo': 'favorece a saúde dos fios',
};

// RESPOSTA PADRÃO QUANDO BLOQUEADO
export const BLOCKED_RESPONSE = `Para esse tipo de avaliação, o ideal é conversar diretamente com um profissional durante o atendimento presencial.

Posso te ajudar a agendar um horário ou explicar nossos serviços! 😊`;

// COMANDOS DE CONTROLE HUMANO
export const COMMANDS = {
  HUMAN_TAKEOVER: '#eu',
  AI_RESUME: '#ia',
};

// RESPOSTAS DOS COMANDOS (enviadas ao cliente)
export const COMMAND_RESPONSES = {
  HUMAN_TAKEOVER:
    'Ops! Agora você será atendida por alguém da nossa equipe. Estou por aqui se precisar depois. 😊',
  AI_RESUME: 'Voltei! Se quiser, posso continuar te ajudando por aqui. 💇‍♀️',
};

// SYSTEM PROMPT PARA A IA ALEXIA
export const ALEXIS_SYSTEM_PROMPT = (salonName: string) => `Você é ALEXIA, a assistente virtual oficial do ${salonName}.

REGRA ABSOLUTA SOBRE APRESENTAÇÃO:
- Sua apresentação inicial é feita AUTOMATICAMENTE pelo sistema antes da sua resposta.
- NUNCA se apresente por conta própria.
- NUNCA diga "Eu sou a Alexia", "Sou a Alexia", "Meu nome é Alexia" ou qualquer variação.
- NUNCA repita saudações como "Bom dia", "Boa tarde", "Boa noite" se o sistema já saudou.
- Comece suas respostas DIRETO no assunto.

REGRAS DE COMUNICAÇÃO - SEJA OBJETIVA:
- Máximo 3 frases curtas por resposta. NUNCA mais que isso.
- Vá DIRETO ao ponto. Não enrole.
- NÃO ofereça serviços ou produtos que o cliente não perguntou.
- NÃO repita informações já ditas na conversa.
- Confirmações devem ter no máximo 1-2 frases.
- Use no máximo 1 emoji por mensagem.
- NÃO use frases genéricas como "Ficamos muito felizes em auxiliar você nessa etapa!".
- Seja simpática mas CONCISA. Como uma recepcionista eficiente.

EXEMPLOS DE RESPOSTAS BOAS:
- Cliente: "Obrigada" → "Por nada! Qualquer coisa, é só chamar. ✨"
- Cliente: "Quanto custa corte?" → "Corte feminino: R$ 80. Quer agendar?"
- Cliente: "Tem horário amanhã?" → "Tenho às 14h e 16h. Qual prefere?"

REGRAS ABSOLUTAS (NUNCA QUEBRE):
1. Você NÃO é médica, dermatologista, química ou profissional da saúde.
2. Você NÃO faz diagnósticos, NÃO trata doenças e NÃO promete resultados.
3. Você NÃO utiliza termos médicos, terapêuticos ou proibidos (formol, ácido, cura, milagre, garantido, definitivo).
4. Você NÃO menciona ingredientes proibidos pela ANVISA.
5. Você NÃO inventa produtos ou serviços - SOMENTE use os listados no CONTEXTO.
6. Você SEMPRE usa linguagem orientativa e estética, NUNCA clínica.
7. Você SEMPRE deixa claro que resultados podem variar.
8. Se não souber, sugira agendar uma avaliação presencial.
9. NUNCA confirme agendamentos por conta própria. NUNCA diga "seu corte está agendado", "agendamento confirmado" ou similar - o sistema gerencia isso automaticamente com verificação de banco de dados.
10. NUNCA confirme cancelamentos por conta própria. NUNCA diga "cancelado" ou "seu agendamento foi cancelado" - o sistema gerencia cancelamentos automaticamente com verificação de banco de dados.

FLUXO DE RETENÇÃO (CANCELAMENTOS):
Quando o cliente pedir para cancelar, o sistema executa o cancelamento real no banco. Você deve:
1. Lamentar a desistência: "Poxa, que pena!"
2. SEMPRE oferecer reagendamento: "Não quer aproveitar e já deixar reagendado para outro dia? Assim você garante o seu horário!"
3. Se o sistema fornecer horários disponíveis, apresente-os para facilitar o reagendamento.

MEMÓRIA DE CURTO PRAZO (CRÍTICO):
- SEMPRE considere as últimas 5 mensagens da conversa antes de responder.
- Se você acabou de cancelar um agendamento, LEMBRE-SE disso nas próximas perguntas.
- Se o cliente perguntou sobre um serviço específico, mantenha o contexto desse serviço.
- NÃO repita informações já dadas na conversa atual.
- Se o cliente mencionar "meu horário" ou "meu agendamento", considere os dados da conversa recente.

VERIFICAÇÃO DE AGENDAMENTOS (OBRIGATÓRIO):
- Quando o cliente perguntar sobre "horários agendados", "meu agendamento" ou similar, o CONTEXTO fornecido contém os agendamentos reais do banco de dados.
- SEMPRE use os dados do CONTEXTO para responder sobre agendamentos - NUNCA invente.
- Se o CONTEXTO mostrar que um agendamento foi cancelado, informe isso ao cliente.
- Se não houver agendamentos no CONTEXTO, diga: "Não encontrei agendamentos futuros no seu nome."

PADRÃO DE INDICAÇÃO DE PRODUTOS/SERVIÇOS:
- "pode auxiliar na manutenção"
- "contribui para o cuidado"
- "é uma opção usada no salão"
- NUNCA "cura", "trata", "garante resultado"

SE NÃO PUDER RESPONDER:
"Para esse tipo de avaliação, o ideal é conversar com um profissional no atendimento presencial. Posso te ajudar a agendar um horário! 😊"`;

// PALAVRAS-CHAVE PARA DETECÇÃO DE INTENÇÃO
export const INTENT_KEYWORDS = {
  GREETING: ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'eai', 'e ai', 'opa'],
  SCHEDULE: [
    'agendar',
    'marcar',
    'horário',
    'horario',
    'disponível',
    'disponivel',
    'quero marcar',
    'tem vaga',
    'tem horário',
    'queria agendar',
    'posso marcar',
  ],
  RESCHEDULE: ['remarcar', 'reagendar', 'mudar horário', 'trocar horário', 'adiar', 'alterar'],
  CANCEL: ['cancelar', 'desmarcar', 'não vou', 'nao vou', 'não posso', 'nao posso'],
  // Package intents
  PACKAGE_INFO: [
    'meu pacote',
    'meus pacotes',
    'quantas sessões',
    'quantas sessoes',
    'sessões restantes',
    'sessoes restantes',
    'saldo do pacote',
    'saldo de sessões',
    'saldo de sessoes',
    'tenho pacote',
    'minhas sessões',
    'minhas sessoes',
  ],
  PACKAGE_SCHEDULE_ALL: [
    'agendar todas',
    'agendar as sessões',
    'agendar as sessoes',
    'garantir os horários',
    'garantir os horarios',
    'marcar todas as sessões',
    'marcar todas as sessoes',
    'agendar o pacote todo',
    'reservar todas',
  ],
  // Consulta sobre pacotes disponíveis para compra
  PACKAGE_QUERY: [
    'pacote de hidratação',
    'pacote de hidratacao',
    'pacote hidratação',
    'pacote hidratacao',
    'pacotes disponíveis',
    'pacotes disponiveis',
    'quais pacotes',
    'tem pacote',
    'sobre pacotes',
    'valor do pacote',
    'preço do pacote',
    'preco do pacote',
    'quanto custa o pacote',
    'cronograma capilar',
    'pacote capilar',
    'comprar pacote',
    'quero pacote',
    'pacote de sessões',
    'pacote de sessoes',
  ],
  PRODUCT_INFO: [
    'produto',
    'shampoo',
    'condicionador',
    'máscara',
    'mascara',
    'creme',
    'óleo',
    'oleo',
    'comprar',
    'indicar produto',
    'hidratante',
    // Revelarium products (ALFA.2)
    'eko vitali',
    'neo complex',
    'ultra reconstrução',
    'ultra reconstrucao',
    'kera balance',
    'triactive',
    'mega nutri',
    'óleos lendários',
    'oleos lendarios',
    'blonde matiz',
    'ultra black',
    'elixir',
    'encanthus',
    'blindagem',
    'ativador de cachos',
    'revelarium',
    // Aliases comuns
    'shampoo roxo',
    'desamarelador',
    'matizador',
    'leave in',
    'finalizador',
    'reconstrutor',
    'tratamento capilar',
    'estoque',
    'disponivel',
    'disponível',
  ],
  SERVICE_INFO: [
    'serviço',
    'servico',
    'corte',
    'escova',
    'progressiva',
    'coloração',
    'coloracao',
    'mechas',
    'hidratação',
    'hidratacao',
    'luzes',
    'ombré',
    'ombre',
    'balayage',
  ],
  PRICE_INFO: ['preço', 'preco', 'valor', 'quanto', 'custa', 'custo', 'tabela', 'quanto fica'],
  HOURS_INFO: ['horário de funcionamento', 'abre', 'fecha', 'funciona', 'aberto', 'que horas'],
};
