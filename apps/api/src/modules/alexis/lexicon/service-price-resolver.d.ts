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
export declare function resolveServicePrice(canonical: string, services: CatalogService[]): ServicePriceResult | null;
/**
 * Formata resposta premium de preço de serviço.
 * Com preço → resposta concreta com CTA de agendamento.
 * Sem preço → resposta consultiva (sem inventar valores).
 */
export declare function formatServicePriceResponse(_matchedTrigger: string, canonical: string, priceResult: ServicePriceResult | null): string;
//# sourceMappingURL=service-price-resolver.d.ts.map