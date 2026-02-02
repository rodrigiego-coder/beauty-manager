import { Database } from '../../database/database.module';
import { PaymentMethod } from '../../database/schema';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto';
export declare class PaymentMethodsService {
    private db;
    constructor(db: Database);
    /**
     * Lista todas as formas de pagamento do salão
     */
    findAll(salonId: string, includeInactive?: boolean): Promise<PaymentMethod[]>;
    /**
     * Busca forma de pagamento por ID
     */
    findById(id: string): Promise<PaymentMethod | null>;
    /**
     * Cria uma nova forma de pagamento
     */
    create(salonId: string, data: CreatePaymentMethodDto): Promise<PaymentMethod>;
    /**
     * Atualiza uma forma de pagamento existente
     */
    update(id: string, data: UpdatePaymentMethodDto): Promise<PaymentMethod>;
    /**
     * Desativa (soft delete) uma forma de pagamento
     */
    delete(id: string): Promise<PaymentMethod>;
    /**
     * Reativa uma forma de pagamento
     */
    reactivate(id: string): Promise<PaymentMethod>;
    /**
     * Cria formas de pagamento padrão para um salão
     */
    seedDefaultMethods(salonId: string): Promise<void>;
}
//# sourceMappingURL=payment-methods.service.d.ts.map