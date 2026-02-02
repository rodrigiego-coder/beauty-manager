import { CartLinksService } from './cart-links.service';
import { CreateCartLinkDto, UpdateCartLinkDto, ConvertCartLinkDto } from './dto';
export declare class CartLinksController {
    private readonly cartLinksService;
    constructor(cartLinksService: CartLinksService);
    getLinks(req: any, page?: string, limit?: string, status?: string, source?: string, clientId?: string): Promise<{
        data: import("./dto").CartLinkResponse[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStats(req: any, startDate?: string, endDate?: string): Promise<import("./dto").CartLinkStatsResponse>;
    getLinkById(req: any, id: string): Promise<import("./dto").CartLinkResponse>;
    createLink(req: any, dto: CreateCartLinkDto): Promise<import("./dto").CartLinkResponse>;
    updateLink(req: any, id: string, dto: UpdateCartLinkDto): Promise<import("./dto").CartLinkResponse>;
    deleteLink(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getPublicLink(code: string, ip: string, userAgent?: string, referrer?: string): Promise<import("./dto").CartLinkResponse>;
    convertPublicLink(code: string, dto: ConvertCartLinkDto): Promise<{
        link: import("./dto").CartLinkResponse;
        commandId: string;
    }>;
    convertLink(req: any, id: string, dto: ConvertCartLinkDto): Promise<{
        link: import("./dto").CartLinkResponse;
        commandId: string;
    }>;
}
//# sourceMappingURL=cart-links.controller.d.ts.map