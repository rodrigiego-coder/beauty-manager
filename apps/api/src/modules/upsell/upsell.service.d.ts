import { CreateUpsellRuleDto, UpdateUpsellRuleDto, UpsellRuleResponse, UpsellOfferResponse, UpsellStatsResponse } from './dto';
export declare class UpsellService {
    getRules(salonId: string, options?: {
        page?: number;
        limit?: number;
        triggerType?: string;
        isActive?: boolean;
    }): Promise<{
        data: UpsellRuleResponse[];
        total: number;
        page: number;
        limit: number;
    }>;
    getRuleById(salonId: string, id: string): Promise<UpsellRuleResponse>;
    createRule(salonId: string, dto: CreateUpsellRuleDto): Promise<UpsellRuleResponse>;
    updateRule(salonId: string, id: string, dto: UpdateUpsellRuleDto): Promise<UpsellRuleResponse>;
    deleteRule(salonId: string, id: string): Promise<void>;
    getOffersForAppointment(salonId: string, appointmentId: string): Promise<UpsellOfferResponse[]>;
    getOffersForService(salonId: string, serviceId: number): Promise<UpsellRuleResponse[]>;
    getPersonalizedOffers(salonId: string, clientId: string): Promise<UpsellOfferResponse[]>;
    getOffers(salonId: string, options?: {
        page?: number;
        limit?: number;
        status?: string;
        clientId?: string;
        ruleId?: string;
    }): Promise<{
        data: UpsellOfferResponse[];
        total: number;
    }>;
    acceptOffer(salonId: string, offerId: string, commandId?: string): Promise<UpsellOfferResponse>;
    declineOffer(salonId: string, offerId: string): Promise<UpsellOfferResponse>;
    getStats(salonId: string, startDate?: string, endDate?: string): Promise<UpsellStatsResponse>;
    private formatRuleResponse;
    private formatOfferResponse;
}
//# sourceMappingURL=upsell.service.d.ts.map