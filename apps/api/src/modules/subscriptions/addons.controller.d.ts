import { AddonsService } from './addons.service';
import { ActivateAddonDto, GrantCreditsDto } from './addons.dto';
export declare class AddonsController {
    private readonly addonsService;
    constructor(addonsService: AddonsService);
    /**
     * GET /subscriptions/addons/catalog
     * Retorna o catálogo de add-ons e pacotes de crédito disponíveis
     * Acessível por: OWNER, MANAGER, RECEPTIONIST, STYLIST
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
     * Acessível por: OWNER, MANAGER, RECEPTIONIST, STYLIST
     */
    getStatus(user: any): Promise<{
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
     * Ativa um add-on para o salão (sem cobrança MP - somente simulação)
     * Acessível por: OWNER, MANAGER
     */
    activateAddon(user: any, dto: ActivateAddonDto): Promise<{
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
}
export declare class CreditsController {
    private readonly addonsService;
    constructor(addonsService: AddonsService);
    /**
     * POST /subscriptions/credits/grant
     * Concede créditos extras ao salão (simulação de compra)
     * Acessível por: OWNER, MANAGER
     */
    grantCredits(user: any, dto: GrantCreditsDto): Promise<{
        success: boolean;
        message: string;
        packageCode: string;
        qtyPackages: number;
        totalQty: number;
        totalCents: number;
        totalFormatted: string;
        ledgerId: string;
    }>;
}
//# sourceMappingURL=addons.controller.d.ts.map