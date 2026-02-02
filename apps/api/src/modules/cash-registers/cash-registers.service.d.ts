import { Database, CashRegister, CashMovement } from '../../database';
import { OpenCashRegisterDto, CloseCashRegisterDto, CashMovementDto } from './dto';
interface CurrentUser {
    id: string;
    salonId: string;
    role: string;
}
export declare class CashRegistersService {
    private db;
    constructor(db: Database);
    /**
     * Busca caixa aberto atual do salão
     */
    getCurrent(salonId: string): Promise<CashRegister | null>;
    /**
     * Abre um novo caixa
     */
    open(salonId: string, data: OpenCashRegisterDto, currentUser: CurrentUser): Promise<CashRegister>;
    /**
     * Fecha o caixa atual
     */
    close(salonId: string, data: CloseCashRegisterDto, currentUser: CurrentUser): Promise<CashRegister>;
    /**
     * Registra sangria (retirada)
     */
    withdrawal(cashRegisterId: string, data: CashMovementDto, currentUser: CurrentUser): Promise<CashMovement>;
    /**
     * Registra suprimento (entrada)
     */
    deposit(cashRegisterId: string, data: CashMovementDto, currentUser: CurrentUser): Promise<CashMovement>;
    /**
     * Lista movimentos de um caixa
     */
    getMovements(cashRegisterId: string): Promise<CashMovement[]>;
    /**
     * Histórico de caixas fechados
     */
    getHistory(salonId: string, limit?: number): Promise<CashRegister[]>;
    /**
     * Busca caixa por ID
     */
    findById(id: string): Promise<CashRegister | null>;
    /**
     * Atualiza totais do caixa ao receber pagamento
     * Chamado pelo CommandsService ao fechar comanda
     */
    addSale(salonId: string, paymentMethod: string, amount: number): Promise<void>;
}
export {};
//# sourceMappingURL=cash-registers.service.d.ts.map