import { ServiceConsumptionsService } from './service-consumptions.service';
import { UpdateServiceConsumptionsDto } from './dto';
interface CurrentUserPayload {
    id: string;
    salonId: string;
    role: string;
}
export declare class ServiceConsumptionsController {
    private readonly serviceConsumptionsService;
    constructor(serviceConsumptionsService: ServiceConsumptionsService);
    /**
     * GET /services/:serviceId/consumptions
     * Lista BOM (Bill of Materials) do serviço
     */
    findByService(serviceId: number, user: CurrentUserPayload): Promise<{
        unit: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        serviceId: number;
        productId: number;
        quantity: string;
    }[]>;
    /**
     * PUT /services/:serviceId/consumptions
     * Substitui completamente o BOM do serviço
     */
    replaceConsumptions(serviceId: number, user: CurrentUserPayload, data: UpdateServiceConsumptionsDto): Promise<{
        unit: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        serviceId: number;
        productId: number;
        quantity: string;
    }[]>;
}
export {};
//# sourceMappingURL=service-consumptions.controller.d.ts.map