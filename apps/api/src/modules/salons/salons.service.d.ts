import { Database, Salon, NewSalon } from '../../database';
export declare class SalonsService {
    private db;
    private readonly logger;
    private readonly TEMPLATE_SALON_ID;
    constructor(db: Database);
    /**
     * Lista todos os salões ativos
     */
    findAll(): Promise<Salon[]>;
    /**
     * Busca salão por ID
     */
    findById(id: string): Promise<Salon | null>;
    /**
     * Busca salão por CNPJ
     */
    findByTaxId(taxId: string): Promise<Salon | null>;
    /**
     * Cria um novo salão e copia serviços/produtos do template
     */
    create(data: NewSalon): Promise<Salon>;
    /**
     * Atualiza um salão
     */
    update(id: string, data: Partial<NewSalon>): Promise<Salon | null>;
    /**
     * Desativa um salão (soft delete)
     */
    deactivate(id: string): Promise<Salon | null>;
    /**
     * Copia serviços e produtos do salão template para um novo salão
     * Os itens são criados como INATIVOS para o salão ativar conforme necessidade
     */
    copyTemplateData(newSalonId: string): Promise<{
        services: number;
        products: number;
    }>;
}
//# sourceMappingURL=salons.service.d.ts.map