import { Database, ConsumedProduct } from '../../database';
import { ProductsService } from '../products/products.service';
export declare class ConsumedProductsService {
    private db;
    private readonly productsService;
    constructor(db: Database, productsService: ProductsService);
    /**
     * Lista todos os produtos consumidos
     */
    findAll(): Promise<ConsumedProduct[]>;
    /**
     * Lista produtos consumidos por agendamento
     */
    findByAppointment(appointmentId: string): Promise<ConsumedProduct[]>;
    /**
     * Registra consumo de produto em atendimento
     * - Busca o custo atual do produto
     * - Desconta do estoque via ProductsService.adjustStock (auditoria em stock_adjustments)
     * - Registra o consumo com o custo no momento
     */
    register(data: {
        appointmentId: string;
        productId: number;
        quantityUsed: number;
        salonId: string;
        userId: string;
    }): Promise<ConsumedProduct>;
    /**
     * Calcula o custo total de produtos de um atendimento
     */
    calculateAppointmentCost(appointmentId: string): Promise<{
        items: {
            productId: number;
            productName: string;
            quantity: string;
            unitCost: string;
            totalCost: number;
        }[];
        totalCost: number;
    }>;
    /**
     * Calcula lucro real de um atendimento (preço - custos)
     */
    calculateAppointmentProfit(appointmentId: string): Promise<{
        revenue: number;
        productCost: number;
        profit: number;
        profitMargin: number;
    }>;
    /**
     * Remove um consumo (estorna o estoque via ProductsService.adjustStock)
     */
    remove(id: number, ctx: {
        salonId: string;
        userId: string;
    }): Promise<boolean>;
}
//# sourceMappingURL=consumed-products.service.d.ts.map