import { Database, ServiceConsumption } from '../../database';
import { ConsumptionItemDto } from './dto';
export declare class ServiceConsumptionsService {
    private db;
    constructor(db: Database);
    /**
     * Lista todos os consumos de um serviço (BOM)
     */
    findByService(serviceId: number, salonId: string): Promise<ServiceConsumption[]>;
    /**
     * Substitui completamente o BOM de um serviço
     * - Insere novos itens
     * - Atualiza existentes
     * - Remove os que não estão na lista
     */
    replaceConsumptions(serviceId: number, salonId: string, items: ConsumptionItemDto[]): Promise<ServiceConsumption[]>;
    /**
     * Busca consumos para múltiplos serviços (útil para closeService)
     */
    findByServiceIds(serviceIds: number[], salonId: string): Promise<ServiceConsumption[]>;
}
//# sourceMappingURL=service-consumptions.service.d.ts.map