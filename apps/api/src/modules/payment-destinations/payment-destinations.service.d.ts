import { Database } from '../../database/database.module';
import { PaymentDestination } from '../../database/schema';
import { CreatePaymentDestinationDto, UpdatePaymentDestinationDto } from './dto';
export declare class PaymentDestinationsService {
    private db;
    constructor(db: Database);
    /**
     * Lista todos os destinos de pagamento do salão
     */
    findAll(salonId: string, includeInactive?: boolean): Promise<PaymentDestination[]>;
    /**
     * Busca destino de pagamento por ID
     */
    findById(id: string): Promise<PaymentDestination | null>;
    /**
     * Cria um novo destino de pagamento
     */
    create(salonId: string, data: CreatePaymentDestinationDto): Promise<PaymentDestination>;
    /**
     * Atualiza um destino de pagamento existente
     */
    update(id: string, data: UpdatePaymentDestinationDto): Promise<PaymentDestination>;
    /**
     * Desativa (soft delete) um destino de pagamento
     */
    delete(id: string): Promise<PaymentDestination>;
    /**
     * Reativa um destino de pagamento
     */
    reactivate(id: string): Promise<PaymentDestination>;
    /**
     * Cria destinos de pagamento padrão para um salão
     */
    seedDefaultDestinations(salonId: string): Promise<void>;
}
//# sourceMappingURL=payment-destinations.service.d.ts.map