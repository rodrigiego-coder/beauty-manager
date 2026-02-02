import { UpsellService } from './upsell.service';
import { CreateUpsellRuleDto, UpdateUpsellRuleDto, AcceptOfferDto } from './dto';
export declare class UpsellController {
    private readonly upsellService;
    constructor(upsellService: UpsellService);
    getRules(req: any, page?: string, limit?: string, triggerType?: string, isActive?: string): Promise<{
        data: import("./dto").UpsellRuleResponse[];
        total: number;
        page: number;
        limit: number;
    }>;
    getRule(req: any, id: string): Promise<import("./dto").UpsellRuleResponse>;
    createRule(req: any, dto: CreateUpsellRuleDto): Promise<import("./dto").UpsellRuleResponse>;
    updateRule(req: any, id: string, dto: UpdateUpsellRuleDto): Promise<import("./dto").UpsellRuleResponse>;
    deleteRule(req: any, id: string): Promise<void>;
    getOffersForAppointment(req: any, appointmentId: string): Promise<import("./dto").UpsellOfferResponse[]>;
    getOffersForService(req: any, serviceId: string): Promise<import("./dto").UpsellRuleResponse[]>;
    getPersonalizedOffers(req: any, clientId: string): Promise<import("./dto").UpsellOfferResponse[]>;
    getOffers(req: any, page?: string, limit?: string, status?: string, clientId?: string, ruleId?: string): Promise<{
        data: import("./dto").UpsellOfferResponse[];
        total: number;
    }>;
    acceptOffer(req: any, id: string, dto: AcceptOfferDto): Promise<import("./dto").UpsellOfferResponse>;
    declineOffer(req: any, id: string): Promise<import("./dto").UpsellOfferResponse>;
    getStats(req: any, startDate?: string, endDate?: string): Promise<import("./dto").UpsellStatsResponse>;
}
//# sourceMappingURL=upsell.controller.d.ts.map