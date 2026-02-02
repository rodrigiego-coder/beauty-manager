import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto';
interface CurrentUserPayload {
    id: string;
    salonId: string;
    role: string;
}
export declare class PaymentMethodsController {
    private readonly paymentMethodsService;
    constructor(paymentMethodsService: PaymentMethodsService);
    /**
     * GET /payment-methods
     * Lista todas as formas de pagamento do salão
     */
    findAll(user: CurrentUserPayload, all?: string): Promise<{
        id: string;
        name: string;
        sortOrder: number | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string;
        type: string;
        feeType: string | null;
        feeMode: string | null;
        feeValue: string | null;
    }[]>;
    /**
     * GET /payment-methods/:id
     * Busca uma forma de pagamento por ID
     */
    findById(id: string, user: CurrentUserPayload): Promise<{
        id: string;
        name: string;
        sortOrder: number | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string;
        type: string;
        feeType: string | null;
        feeMode: string | null;
        feeValue: string | null;
    }>;
    /**
     * POST /payment-methods
     * Cria uma nova forma de pagamento
     */
    create(user: CurrentUserPayload, data: CreatePaymentMethodDto): Promise<{
        id: string;
        name: string;
        sortOrder: number | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string;
        type: string;
        feeType: string | null;
        feeMode: string | null;
        feeValue: string | null;
    }>;
    /**
     * PATCH /payment-methods/:id
     * Atualiza uma forma de pagamento
     */
    update(id: string, user: CurrentUserPayload, data: UpdatePaymentMethodDto): Promise<{
        id: string;
        name: string;
        sortOrder: number | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string;
        type: string;
        feeType: string | null;
        feeMode: string | null;
        feeValue: string | null;
    }>;
    /**
     * DELETE /payment-methods/:id
     * Desativa uma forma de pagamento (soft delete)
     */
    delete(id: string, user: CurrentUserPayload): Promise<{
        message: string;
    }>;
    /**
     * PATCH /payment-methods/:id/reactivate
     * Reativa uma forma de pagamento
     */
    reactivate(id: string, user: CurrentUserPayload): Promise<{
        id: string;
        name: string;
        sortOrder: number | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string;
        type: string;
        feeType: string | null;
        feeMode: string | null;
        feeValue: string | null;
    }>;
}
export {};
//# sourceMappingURL=payment-methods.controller.d.ts.map