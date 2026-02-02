import type { Service } from '../../database/schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { CreateServiceDto, UpdateServiceDto } from './dto';
export declare class ServicesService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    /**
     * Lista todos os serviços do salão
     */
    findAll(salonId: string, includeInactive?: boolean): Promise<Service[]>;
    /**
     * Busca serviços por nome/descrição
     */
    search(salonId: string, query: string, includeInactive?: boolean): Promise<Service[]>;
    /**
     * Busca serviço por ID
     */
    findById(id: number): Promise<Service | null>;
    /**
     * Cria um novo serviço
     */
    create(salonId: string, data: CreateServiceDto): Promise<Service>;
    /**
     * Atualiza um serviço existente
     */
    update(id: number, salonId: string, data: UpdateServiceDto): Promise<Service>;
    /**
     * Desativa um serviço (soft delete)
     */
    delete(id: number, salonId: string): Promise<Service>;
    /**
     * Reativa um serviço
     */
    reactivate(id: number, salonId: string): Promise<Service>;
    /**
     * Lista serviços por categoria
     */
    findByCategory(salonId: string, category: string): Promise<Service[]>;
    /**
     * Ativa/desativa múltiplos serviços de uma vez
     */
    bulkUpdateStatus(ids: number[], active: boolean, salonId: string): Promise<{
        updated: number;
    }>;
}
//# sourceMappingURL=services.service.d.ts.map