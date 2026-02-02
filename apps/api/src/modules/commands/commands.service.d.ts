import { Database, Command, CommandItem, CommandPayment } from '../../database';
import { OpenCommandDto, AddItemDto, UpdateItemDto, AddPaymentDto, ApplyDiscountDto, AddNoteDto, LinkClientDto, ReopenCommandDto } from './dto';
import { CashRegistersService } from '../cash-registers';
import { ClientPackagesService } from '../client-packages';
import { ClientsService } from '../clients';
import { CommissionsService } from '../commissions';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { ProductsService } from '../products';
import { RecipesService } from '../recipes';
import { ServiceConsumptionsService } from '../service-consumptions';
export interface AddPaymentResult {
    payment: CommandPayment;
    command: Command;
    autoClosed: boolean;
    message: string;
    loyaltyPointsEarned?: number;
    tierUpgraded?: boolean;
    newTierName?: string;
}
interface CurrentUser {
    id: string;
    salonId: string;
    role: string;
}
export declare class CommandsService {
    private db;
    private cashRegistersService;
    private clientPackagesService;
    private clientsService;
    private commissionsService;
    private loyaltyService;
    private productsService;
    private recipesService;
    private serviceConsumptionsService;
    private readonly logger;
    constructor(db: Database, cashRegistersService: CashRegistersService, clientPackagesService: ClientPackagesService, clientsService: ClientsService, commissionsService: CommissionsService, loyaltyService: LoyaltyService, productsService: ProductsService, recipesService: RecipesService, serviceConsumptionsService: ServiceConsumptionsService);
    /**
     * Lista comandas do salão com filtros
     */
    findAll(salonId: string, status?: string): Promise<{
        id: string;
        salonId: string;
        clientId: string | null;
        appointmentId: string | null;
        cardNumber: string;
        code: string | null;
        status: string;
        openedAt: Date;
        openedById: string;
        serviceClosedAt: Date | null;
        serviceClosedById: string | null;
        cashierClosedAt: Date | null;
        cashierClosedById: string | null;
        totalGross: string | null;
        totalDiscounts: string | null;
        totalNet: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        clientName: string | null;
        clientPhone: string | null;
    }[]>;
    /**
     * Lista comandas abertas (não fechadas/canceladas)
     */
    findOpen(salonId: string): Promise<Command[]>;
    /**
     * Lista clientes do salão para seleção em comandas
     */
    getClients(salonId: string): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        phone: string;
        email: string | null;
        salonId: string | null;
        birthDate: string | null;
        aiActive: boolean;
        technicalNotes: string | null;
        preferences: string | null;
        lastVisitDate: string | null;
        totalVisits: number;
        churnRisk: boolean;
    }[]>;
    /**
     * Busca comanda por ID
     */
    findById(id: string): Promise<Command | null>;
    /**
     * Busca comanda por número do cartão
     */
    findByCardNumber(salonId: string, cardNumber: string): Promise<Command | null>;
    /**
       * Acesso rápido: busca ou cria comanda automaticamente
       */
    quickAccess(salonId: string, code: string, currentUser: CurrentUser): Promise<{
        status: string;
        action: string;
        commandId: string;
        currentStatus: string;
        command: {
            id: string;
            code: string | null;
            createdAt: Date;
            updatedAt: Date;
            salonId: string;
            status: string;
            notes: string | null;
            clientId: string | null;
            appointmentId: string | null;
            cardNumber: string;
            openedAt: Date;
            openedById: string;
            serviceClosedAt: Date | null;
            serviceClosedById: string | null;
            cashierClosedAt: Date | null;
            cashierClosedById: string | null;
            totalGross: string | null;
            totalDiscounts: string | null;
            totalNet: string | null;
        };
        message?: never;
    } | {
        status: string;
        action: string;
        commandId: string;
        currentStatus: string;
        command: {
            id: string;
            code: string | null;
            createdAt: Date;
            updatedAt: Date;
            salonId: string;
            status: string;
            notes: string | null;
            clientId: string | null;
            appointmentId: string | null;
            cardNumber: string;
            openedAt: Date;
            openedById: string;
            serviceClosedAt: Date | null;
            serviceClosedById: string | null;
            cashierClosedAt: Date | null;
            cashierClosedById: string | null;
            totalGross: string | null;
            totalDiscounts: string | null;
            totalNet: string | null;
        };
        message: string;
    }>;
    /**
     * Abre uma nova comanda
     */
    open(salonId: string, data: OpenCommandDto, currentUser: CurrentUser, skipCashCheck?: boolean): Promise<Command>;
    /**
     * Adiciona item à comanda
     */
    addItem(commandId: string, data: AddItemDto, currentUser: CurrentUser): Promise<CommandItem>;
    /**
     * Atualiza item da comanda
     */
    updateItem(commandId: string, itemId: string, data: UpdateItemDto, currentUser: CurrentUser): Promise<CommandItem>;
    /**
     * Remove (cancela) item da comanda
     */
    removeItem(commandId: string, itemId: string, reason: string | undefined, currentUser: CurrentUser): Promise<CommandItem>;
    /**
     * Aplica desconto geral na comanda
     */
    applyDiscount(commandId: string, data: ApplyDiscountDto, currentUser: CurrentUser): Promise<Command>;
    /**
     * Encerra os serviços da comanda
     * Consome automaticamente os produtos do BOM (receita versionada) de cada serviço
     */
    closeService(commandId: string, currentUser: CurrentUser): Promise<Command>;
    /**
     * Calcula valores de taxa/desconto para um pagamento
     */
    private calculatePaymentFee;
    /**
     * Adiciona pagamento à comanda (com auto-close se quitado)
     */
    addPayment(commandId: string, data: AddPaymentDto, currentUser: CurrentUser): Promise<AddPaymentResult>;
    /**
     * Calcula total pago (usando netAmount quando disponível)
     */
    private getTotalPaid;
    /**
     * Auto-close interno (chamado quando pagamento quita a comanda)
     *
     * IMPORTANTE: Operações não-críticas (caixa, comissões, fidelidade) são
     * envolvidas em try/catch para garantir que o pagamento retorne 200
     * mesmo se alguma operação secundária falhar.
     */
    private autoCloseCashier;
    /**
     * Reabre comanda fechada (apenas OWNER/MANAGER)
     */
    reopenCommand(commandId: string, data: ReopenCommandDto, currentUser: CurrentUser): Promise<Command>;
    /**
     * Fecha comanda no caixa (chamada manual)
     *
     * IMPORTANTE: Operações não-críticas (caixa, comissões, fidelidade) são
     * envolvidas em try/catch para garantir que o fechamento retorne 200
     * mesmo se alguma operação secundária falhar.
     */
    closeCashier(commandId: string, currentUser: CurrentUser): Promise<Command>;
    /**
     * Cria comissoes para itens de servico da comanda
     */
    private createCommissionsForCommand;
    /**
     * Cancela comanda
     */
    cancel(commandId: string, reason: string | undefined, currentUser: CurrentUser): Promise<Command>;
    /**
     * Vincula cliente à comanda
     */
    linkClient(commandId: string, data: LinkClientDto, currentUser: CurrentUser): Promise<Command>;
    /**
     * Remove vínculo do cliente com a comanda
     */
    unlinkClient(commandId: string, currentUser: CurrentUser): Promise<Command>;
    /**
     * Adiciona nota à comanda
     */
    addNote(commandId: string, data: AddNoteDto, currentUser: CurrentUser): Promise<Command>;
    /**
     * Busca itens da comanda
     */
    getItems(commandId: string): Promise<CommandItem[]>;
    /**
     * Busca pagamentos da comanda
     */
    getPayments(commandId: string): Promise<CommandPayment[]>;
    /**
     * Busca eventos/timeline da comanda com nome do usuário
     */
    getEvents(commandId: string): Promise<{
        id: string;
        commandId: string;
        actorId: string;
        actorName: string | null;
        eventType: string;
        metadata: Record<string, unknown> | null;
        createdAt: Date;
    }[]>;
    /**
     * Busca detalhes completos da comanda
     */
    getDetails(commandId: string): Promise<{
        items: {
            id: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            canceledAt: Date | null;
            type: string;
            commandId: string;
            clientPackageId: number | null;
            quantity: string;
            referenceId: string | null;
            unitPrice: string;
            discount: string | null;
            totalPrice: string;
            performerId: string | null;
            addedById: string;
            addedAt: Date;
            variantId: string | null;
            clientPackageUsageId: number | null;
            paidByPackage: boolean | null;
            canceledById: string | null;
            cancelReason: string | null;
        }[];
        payments: {
            method: string | null;
            id: string;
            createdAt: Date;
            notes: string | null;
            paidAt: Date;
            amount: string;
            commandId: string;
            paymentMethodId: string | null;
            paymentDestinationId: string | null;
            grossAmount: string | null;
            feeAmount: string | null;
            netAmount: string | null;
            receivedById: string;
        }[];
        events: {
            id: string;
            commandId: string;
            actorId: string;
            actorName: string | null;
            eventType: string;
            metadata: Record<string, unknown> | null;
            createdAt: Date;
        }[];
        id: string;
        code: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        status: string;
        notes: string | null;
        clientId: string | null;
        appointmentId: string | null;
        cardNumber: string;
        openedAt: Date;
        openedById: string;
        serviceClosedAt: Date | null;
        serviceClosedById: string | null;
        cashierClosedAt: Date | null;
        cashierClosedById: string | null;
        totalGross: string | null;
        totalDiscounts: string | null;
        totalNet: string | null;
    }>;
    /**
     * Gera código sequencial da comanda
     */
    private generateCode;
    /**
     * Gera próximo número sequencial da comanda (1-999)
     * Pula números que já estão em uso (comandas não fechadas/canceladas)
     */
    private generateNextNumber;
    /**
     * Valida se número de comanda está no range 1-999
     */
    private validateCommandNumber;
    /**
     * Recalcula totais da comanda
     */
    private recalculateTotals;
    /**
     * Processa consumo automático de produtos da receita (BOM versionado)
     * Chamado ao fechar serviço na comanda - cria snapshots imutáveis para auditoria
     */
    private processRecipeConsumption;
    /**
     * Adiciona evento de auditoria
     */
    private addEvent;
}
export {};
//# sourceMappingURL=commands.service.d.ts.map