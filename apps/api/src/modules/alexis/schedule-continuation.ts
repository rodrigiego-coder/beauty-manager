/**
 * =====================================================
 * SCHEDULE CONTINUATION — PURE UTILITIES
 * Detecta continuação transacional de agendamento
 * (sem dependência de DB — testável em isolamento)
 * =====================================================
 */

/** Frases que indicam que o assistant está aguardando seleção de serviço */
const AWAITING_SERVICE_PATTERNS = [
  'qual serviço você gostaria',
  'qual servico voce gostaria',
  'qual serviço deseja',
  'é só me dizer o serviço',
  'e so me dizer o servico',
];

/**
 * Verifica se a mensagem do assistant é um prompt de seleção de serviço.
 */
export function isSchedulePrompt(content: string): boolean {
  if (!content) return false;
  const normalized = normalizeText(content);
  return AWAITING_SERVICE_PATTERNS.some((p) => normalized.includes(p));
}

/**
 * Remove acentos, converte para lowercase e faz trim.
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Tenta encontrar um serviço na mensagem do usuário via fuzzy match.
 *
 * Estratégia (em ordem):
 * 1. Match exato (normalizado) do nome do serviço
 * 2. Nome do serviço contido na mensagem do usuário
 * 3. Mensagem do usuário contida no nome do serviço (para respostas curtas)
 *
 * Retorna o serviço encontrado ou null.
 */
export function fuzzyMatchService<T extends { name: string }>(
  userMessage: string,
  services: T[],
): T | null {
  if (!userMessage || !services || services.length === 0) return null;

  const normalizedMsg = normalizeText(userMessage);

  // Ignora mensagens muito curtas (1-2 chars) ou muito longas (provavelmente outra intenção)
  if (normalizedMsg.length < 3 || normalizedMsg.length > 120) return null;

  // 1. Match exato
  const exact = services.find((s) => normalizeText(s.name) === normalizedMsg);
  if (exact) return exact;

  // 2. Nome do serviço contido na mensagem
  const contained = services.find((s) => normalizedMsg.includes(normalizeText(s.name)));
  if (contained) return contained;

  // 3. Mensagem contida no nome do serviço (ex.: user diz "alisamento", serviço é "Alisamento Definitivo")
  const partial = services.find((s) => {
    const normalizedName = normalizeText(s.name);
    return normalizedName.includes(normalizedMsg) && normalizedMsg.length >= 4;
  });
  if (partial) return partial;

  return null;
}
