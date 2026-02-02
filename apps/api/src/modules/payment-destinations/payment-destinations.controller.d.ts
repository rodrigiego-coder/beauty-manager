import { PaymentDestinationsService } from './payment-destinations.service';
import { CreatePaymentDestinationDto, UpdatePaymentDestinationDto } from './dto';
interface CurrentUserPayload {
    id: string;
    salonId: string;
    role: string;
}
export declare class PaymentDestinationsController {
    private readonly paymentDestinationsService;
    constructor(paymentDestinationsService: PaymentDestinationsService);
    /**
     * GET /payment-destinations
     * Lista todos os destinos de pagamento do salão
     */
    findAll(user: CurrentUserPayload, all?: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        sortOrder: number | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string;
        type: string;
        feeType: string | null;
        feeMode: string | null;
        feeValue: string | null;
        bankName: string | null;
        lastDigits: string | null;
    }[]>;
    /**
     * GET /payment-destinations/:id
     * Busca um destino de pagamento por ID
     */
    findById(id: string, user: CurrentUserPayload): Promise<{
        id: string;
        name: string;
        description: string | null;
        sortOrder: number | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string;
        type: string;
        feeType: string | null;
        feeMode: string | null;
        feeValue: string | null;
        bankName: string | null;
        lastDigits: string | null;
    }>;
    /**
     * POST /payment-destinations
     * Cria um novo destino de pagamento
     */
    create(user: CurrentUserPayload, data: CreatePaymentDestinationDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        sortOrder: number | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string;
        type: string;
        feeType: string | null;
        feeMode: string | null;
        feeValue: string | null;
        bankName: string | null;
        lastDigits: string | null;
    }>;
    /**
     * PATCH /payment-destinations/:id
     * Atualiza um destino de pagamento
     */
    update(id: string, user: CurrentUserPayload, data: UpdatePaymentDestinationDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        sortOrder: number | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string;
        type: string;
        feeType: string | null;
        feeMode: string | null;
        feeValue: string | null;
        bankName: string | null;
        lastDigits: string | null;
    }>;
    /**
     * DELETE /payment-destinations/:id
     * Desativa um destino de pagamento (soft delete)
     */
    delete(id: string, user: CurrentUserPayload): Promise<{
        message: string;
    }>;
    /**
     * PATCH /payment-destinations/:id/reactivate
     * Reativa um destino de pagamento
     */
    reactivate(id: string, user: CurrentUserPayload): Promise<{
        id: string;
        name: string;
        description: string | null;
        sortOrder: number | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string;
        type: string;
        feeType: string | null;
        feeMode: string | null;
        feeValue: string | null;
        bankName: string | null;
        lastDigits: string | null;
    }>;
}
export {};
//# sourceMappingURL=payment-destinations.controller.d.ts.map