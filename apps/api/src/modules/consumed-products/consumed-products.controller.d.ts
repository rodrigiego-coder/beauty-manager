import { ConsumedProductsService } from './consumed-products.service';
import { JwtPayload } from '../auth/jwt.strategy';
export declare class ConsumedProductsController {
    private readonly consumedProductsService;
    constructor(consumedProductsService: ConsumedProductsService);
    /**
     * GET /consumed-products
     * Lista todos os produtos consumidos
     */
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        appointmentId: string;
        productId: number;
        quantityUsed: string;
        costAtTime: string;
    }[]>;
    /**
     * GET /consumed-products/appointment/:appointmentId
     * Lista produtos consumidos por agendamento
     */
    findByAppointment(appointmentId: string): Promise<{
        id: number;
        createdAt: Date;
        appointmentId: string;
        productId: number;
        quantityUsed: string;
        costAtTime: string;
    }[]>;
    /**
     * GET /consumed-products/appointment/:appointmentId/cost
     * Calcula o custo total de produtos de um atendimento
     */
    calculateCost(appointmentId: string): Promise<{
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
     * GET /consumed-products/appointment/:appointmentId/profit
     * Calcula o lucro real de um atendimento
     */
    calculateProfit(appointmentId: string): Promise<{
        revenue: number;
        productCost: number;
        profit: number;
        profitMargin: number;
    }>;
    /**
     * POST /consumed-products
     * Registra consumo de produto em atendimento
     */
    register(user: JwtPayload, data: {
        appointmentId: string;
        productId: number;
        quantityUsed: number;
    }): Promise<{
        id: number;
        createdAt: Date;
        appointmentId: string;
        productId: number;
        quantityUsed: string;
        costAtTime: string;
    }>;
    /**
     * DELETE /consumed-products/:id
     * Remove um consumo (estorna o estoque)
     */
    remove(user: JwtPayload, id: number): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=consumed-products.controller.d.ts.map