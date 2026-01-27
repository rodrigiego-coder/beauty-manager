/**
 * =====================================================
 * SERVICE PRICE RESOLVER (P0.2.2 BRAVO)
 * Resolve canonical/serviceKey para preço do catálogo.
 * Puro e Lego (recebe lista de serviços, não faz DB).
 * =====================================================
 */

export interface CatalogService {
  id: number | string;
  name: string;
  price?: number | string | null;
  category?: string;
}

export interface ServicePriceResult {
  name: string;
  price: number;
  currency: string;
}

/**
 * Tenta achar o serviço no catálogo por canonical name.
 * Estratégia: ILIKE-style match (case-insensitive, includes).
 * Retorna { name, price, currency } ou null se não encontrado/sem preço.
 */
export function resolveServicePrice(
  canonical: string,
  services: CatalogService[],
): ServicePriceResult | null {
  if (!canonical || services.length === 0) return null;

  const normalizedCanonical = canonical.toLowerCase().trim();

  // 1. Exact match (case-insensitive)
  let match = services.find(
    (s) => s.name && s.name.toLowerCase().trim() === normalizedCanonical,
  );

  // 2. Includes match (canonical contém nome ou vice-versa)
  if (!match) {
    match = services.find(
      (s) =>
        s.name &&
        (s.name.toLowerCase().includes(normalizedCanonical) ||
          normalizedCanonical.includes(s.name.toLowerCase().trim())),
    );
  }

  if (!match) return null;

  const price = typeof match.price === 'string'
    ? parseFloat(match.price)
    : match.price;

  if (!price || isNaN(price) || price <= 0) return null;

  return {
    name: match.name,
    price,
    currency: 'BRL',
  };
}

/**
 * Formata resposta premium de preço de serviço.
 * Com preço → resposta concreta com CTA de agendamento.
 * Sem preço → resposta consultiva (sem inventar valores).
 */
export function formatServicePriceResponse(
  _matchedTrigger: string,
  canonical: string,
  priceResult: ServicePriceResult | null,
): string {
  if (priceResult) {
    return (
      `Perfeito 😊 Aqui chamamos de *${canonical}*. ` +
      `O valor do *${priceResult.name}* é a partir de R$ ${priceResult.price}. ` +
      `Quer agendar? Prefere amanhã de manhã ou à tarde?`
    );
  }

  // Sem preço → consultivo (NÃO inventa valor)
  return (
    `Perfeito 😊 Aqui chamamos de *${canonical}*. ` +
    `O valor pode variar conforme comprimento e histórico do cabelo. ` +
    `Posso te orientar melhor — você busca alinhar os fios ou tratar?`
  );
}
