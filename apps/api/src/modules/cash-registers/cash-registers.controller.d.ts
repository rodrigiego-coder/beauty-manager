import { CashRegistersService } from './cash-registers.service';
import { OpenCashRegisterDto, CloseCashRegisterDto, CashMovementDto } from './dto';
export declare class CashRegistersController {
    private readonly cashRegistersService;
    constructor(cashRegistersService: CashRegistersService);
    /**
     * GET /cash-registers/current
     * Retorna o caixa aberto atual ou null
     */
    getCurrent(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        status: string;
        notes: string | null;
        openedAt: Date;
        openedById: string;
        openingBalance: string;
        closingBalance: string | null;
        expectedBalance: string | null;
        difference: string | null;
        totalSales: string;
        totalCash: string;
        totalCard: string;
        totalPix: string;
        totalWithdrawals: string;
        totalDeposits: string;
        closedAt: Date | null;
        closedById: string | null;
    } | null>;
    /**
     * POST /cash-registers/open
     * Abre um novo caixa
     */
    open(req: any, dto: OpenCashRegisterDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        status: string;
        notes: string | null;
        openedAt: Date;
        openedById: string;
        openingBalance: string;
        closingBalance: string | null;
        expectedBalance: string | null;
        difference: string | null;
        totalSales: string;
        totalCash: string;
        totalCard: string;
        totalPix: string;
        totalWithdrawals: string;
        totalDeposits: string;
        closedAt: Date | null;
        closedById: string | null;
    }>;
    /**
     * POST /cash-registers/close
     * Fecha o caixa atual
     */
    close(req: any, dto: CloseCashRegisterDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        status: string;
        notes: string | null;
        openedAt: Date;
        openedById: string;
        openingBalance: string;
        closingBalance: string | null;
        expectedBalance: string | null;
        difference: string | null;
        totalSales: string;
        totalCash: string;
        totalCard: string;
        totalPix: string;
        totalWithdrawals: string;
        totalDeposits: string;
        closedAt: Date | null;
        closedById: string | null;
    }>;
    /**
     * POST /cash-registers/:id/withdrawal
     * Registra sangria
     */
    withdrawal(id: string, req: any, dto: CashMovementDto): Promise<{
        id: string;
        createdAt: Date;
        amount: string;
        type: string;
        performedById: string;
        reason: string;
        cashRegisterId: string;
        performedAt: Date;
    }>;
    /**
     * POST /cash-registers/:id/deposit
     * Registra suprimento
     */
    deposit(id: string, req: any, dto: CashMovementDto): Promise<{
        id: string;
        createdAt: Date;
        amount: string;
        type: string;
        performedById: string;
        reason: string;
        cashRegisterId: string;
        performedAt: Date;
    }>;
    /**
     * GET /cash-registers/:id/movements
     * Lista movimentos de um caixa
     */
    getMovements(id: string): Promise<{
        id: string;
        createdAt: Date;
        amount: string;
        type: string;
        performedById: string;
        reason: string;
        cashRegisterId: string;
        performedAt: Date;
    }[]>;
    /**
     * GET /cash-registers/history
     * Histórico de caixas fechados
     */
    getHistory(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        status: string;
        notes: string | null;
        openedAt: Date;
        openedById: string;
        openingBalance: string;
        closingBalance: string | null;
        expectedBalance: string | null;
        difference: string | null;
        totalSales: string;
        totalCash: string;
        totalCard: string;
        totalPix: string;
        totalWithdrawals: string;
        totalDeposits: string;
        closedAt: Date | null;
        closedById: string | null;
    }[]>;
    /**
     * GET /cash-registers/:id
     * Busca caixa por ID
     */
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        status: string;
        notes: string | null;
        openedAt: Date;
        openedById: string;
        openingBalance: string;
        closingBalance: string | null;
        expectedBalance: string | null;
        difference: string | null;
        totalSales: string;
        totalCash: string;
        totalCard: string;
        totalPix: string;
        totalWithdrawals: string;
        totalDeposits: string;
        closedAt: Date | null;
        closedById: string | null;
    } | null>;
}
//# sourceMappingURL=cash-registers.controller.d.ts.map