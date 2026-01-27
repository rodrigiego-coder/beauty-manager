/**
 * =====================================================
 * PROFESSIONAL RESOLVER (P0.3)
 * Resolve profissionais aptos a realizar um serviço.
 * Puro e testável (recebe dados, não faz DB).
 * =====================================================
 */

export interface ProfessionalInfo {
  id: string;
  name: string;
  active: boolean;
}

export interface ProfessionalServiceAssignment {
  professionalId: string;
  serviceId: number;
  enabled: boolean;
}

/**
 * Resolve profissionais aptos ao serviço.
 *
 * REGRA DE COMPATIBILIDADE:
 * - Se NÃO existem registros na matriz para o salonId → modo "legacy":
 *   retorna TODOS os profissionais ativos (não bloqueia).
 * - Se existem registros → filtra apenas os habilitados para o serviceId.
 */
export function resolveAptProfessionals(
  serviceId: number | string,
  professionals: ProfessionalInfo[],
  assignments: ProfessionalServiceAssignment[],
): ProfessionalInfo[] {
  const sid = typeof serviceId === 'string' ? parseInt(serviceId, 10) : serviceId;
  const activePros = professionals.filter((p) => p.active);

  // Modo legacy: sem nenhum assignment → todos podem
  if (assignments.length === 0) {
    return activePros;
  }

  // Modo filtrado: apenas profissionais com assignment enabled para este serviço
  const aptIds = new Set(
    assignments
      .filter((a) => a.serviceId === sid && a.enabled)
      .map((a) => a.professionalId),
  );

  return activePros.filter((p) => aptIds.has(p.id));
}

/**
 * Formata lista de profissionais para exibição no WhatsApp.
 */
export function formatProfessionalList(professionals: ProfessionalInfo[]): string {
  if (professionals.length === 0) return '';
  return professionals
    .map((p, i) => `${i + 1}. ${p.name}`)
    .join('\n');
}

/**
 * Tenta match de profissional pelo nome (fuzzy, case-insensitive).
 */
export function fuzzyMatchProfessional(
  text: string,
  professionals: ProfessionalInfo[],
): ProfessionalInfo | null {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return null;

  // Match exato ou por número ("1", "2", etc.)
  const numMatch = normalized.match(/^\d+$/);
  if (numMatch) {
    const idx = parseInt(numMatch[0], 10) - 1;
    if (idx >= 0 && idx < professionals.length) {
      return professionals[idx];
    }
  }

  // Match por nome (includes, case-insensitive)
  for (const p of professionals) {
    const pName = p.name.toLowerCase();
    if (pName === normalized || pName.includes(normalized) || normalized.includes(pName)) {
      return p;
    }
  }

  // Match parcial: primeiro nome
  for (const p of professionals) {
    const firstName = p.name.toLowerCase().split(' ')[0];
    if (firstName === normalized) return p;
  }

  return null;
}
