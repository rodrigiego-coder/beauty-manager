import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
/**
 * Resultado do consumo de quota
 */
export interface ConsumeQuotaResult {
    success: boolean;
    source: 'INCLUDED' | 'EXTRA';
    periodYyyymm: number;
    ledgerId: string;
    remaining: {
        included: number;
        extra: number;
        total: number;
    };
}
/**
 * Erro de quota excedida
 */
export interface QuotaExceededError {
    code: 'QUOTA_EXCEEDED';
    message: string;
    needed: number;
    remaining: number;
    suggestedAction: 'buy_credit_or_upgrade';
    packageCode: string;
}
export declare class AddonsService {
    private db;
    private readonly logger;
    constructor(db: NodePgDatabase<typeof schema>);
    /**
     * Retorna o período atual no formato YYYYMM
     */
    private getCurrentPeriod;
    /**
     * GET /subscriptions/addons/catalog
     * Retorna o catálogo de add-ons e pacotes de crédito disponíveis
     */
    getCatalog(): Promise<{
        addons: {
            code: string;
            family: string;
            tier: string;
            quotaType: string;
            quotaAmount: number;
            priceCents: number;
            priceFormatted: string;
        }[];
        creditPackages: {
            code: string;
            quotaType: string;
            qty: number;
            priceCents: number;
            priceFormatted: string;
        }[];
    }>;
    /**
     * GET /subscriptions/addons/status
     * Retorna os add-ons ativos do salão e as quotas do mês atual
     */
    getStatus(salonId: string): Promise<{
        periodYyyymm: number;
        addons: {
            id: string;
            addonCode: string;
            status: "ACTIVE" | "SUSPENDED" | "CANCELED";
            family: string;
            tier: string;
            quotaAmount: number;
            priceCents: number;
            currentPeriodStart: Date | null;
            currentPeriodEnd: Date | null;
        }[];
        quotas: {
            whatsapp: {
                included: number;
                used: number;
                includedRemaining: number;
                extraPurchased: number;
                extraUsed: number;
                extraRemaining: number;
                totalRemaining: number;
            };
        };
    }>;
    /**
     * POST /subscriptions/addons/activate
     * Ativa um add-on para o salão e adiciona quota do mês
     */
    activateAddon(salonId: string, addonCode: string, userId: string): Promise<{
        success: boolean;
        message: string;
        addon: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            salonId: string;
            status: "ACTIVE" | "SUSPENDED" | "CANCELED";
            currentPeriodStart: Date | null;
            currentPeriodEnd: Date | null;
            addonCode: string;
        } | undefined;
        quotaAdded: number;
    }>;
    /**
     * POST /subscriptions/credits/grant
     * Concede créditos extras ao salão (simulação de compra)
     */
    grantCredits(salonId: string, packageCode: string, qtyPackages: number, userId: string): Promise<{
        success: boolean;
        message: string;
        packageCode: string;
        qtyPackages: number;
        totalQty: number;
        totalCents: number;
        totalFormatted: string;
        ledgerId: string;
    }>;
    /**
     * Consome 1 unidade de quota WhatsApp para um agendamento
     * IDEMPOTENTE: Se já foi consumido para este appointment no período, retorna sucesso sem consumir novamente
     *
     * Ordem de consumo:
     * 1. Primeiro tenta usar quota INCLUDED (do plano)
     * 2. Se não houver, tenta usar quota EXTRA (créditos comprados)
     * 3. Se não houver nenhuma, lança erro HTTP 402 (Payment Required)
     *
     * @param salonId - ID do salão
     * @param appointmentId - ID do agendamento (chave de idempotência)
     * @param reason - Motivo do consumo (para auditoria)
     * @returns ConsumeQuotaResult ou lança HttpException
     */
    consumeWhatsAppQuota(salonId: string, appointmentId: string, reason?: string): Promise<ConsumeQuotaResult>;
    /**
     * Busca ou cria registro de quota para o salão/período
     */
    private getOrCreateQuotaRecord;
}
//# sourceMappingURL=addons.service.d.ts.map