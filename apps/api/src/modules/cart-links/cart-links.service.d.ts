import { CreateCartLinkDto, UpdateCartLinkDto, ConvertCartLinkDto, CartLinkResponse, CartLinkStatsResponse } from './dto';
export declare class CartLinksService {
    getLinks(salonId: string, options?: {
        page?: number;
        limit?: number;
        status?: string;
        source?: string;
        clientId?: string;
    }): Promise<{
        data: CartLinkResponse[];
        total: number;
        page: number;
        limit: number;
    }>;
    getLinkById(salonId: string, id: string): Promise<CartLinkResponse>;
    getLinkByCode(code: string): Promise<CartLinkResponse>;
    createLink(salonId: string, dto: CreateCartLinkDto, userId: string): Promise<CartLinkResponse>;
    updateLink(salonId: string, id: string, dto: UpdateCartLinkDto): Promise<CartLinkResponse>;
    deleteLink(salonId: string, id: string): Promise<void>;
    recordView(code: string, viewData: {
        ipAddress?: string;
        userAgent?: string;
        referrer?: string;
    }): Promise<void>;
    convertLink(code: string, _dto: ConvertCartLinkDto, _userId?: string): Promise<{
        link: CartLinkResponse;
        commandId: string;
    }>;
    getStats(salonId: string, startDate?: string, endDate?: string): Promise<CartLinkStatsResponse>;
    private formatLinkResponse;
}
//# sourceMappingURL=cart-links.service.d.ts.map