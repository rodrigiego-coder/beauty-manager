import { CommandsService } from './commands.service';
import { OpenCommandDto, AddItemDto, UpdateItemDto, AddPaymentDto, ApplyDiscountDto, AddNoteDto, LinkClientDto, RemoveItemDto, ReopenCommandDto } from './dto';
import { JwtPayload } from '../auth/jwt.strategy';
export declare class CommandsController {
    private readonly commandsService;
    constructor(commandsService: CommandsService);
    /**
     * GET /commands
     * Lista comandas do salão
     */
    findAll(user: JwtPayload, status?: string): Promise<{
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
     * GET /commands/open
     * Lista comandas abertas
     */
    findOpen(user: JwtPayload): Promise<{
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
    }[]>;
    /**
     * GET /commands/clients
     * Lista clientes do salão para seleção em comandas
     */
    findClients(user: JwtPayload): Promise<{
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
     * GET /commands/card/:cardNumber
     * Busca comanda por número do cartão
     */
    findByCardNumber(user: JwtPayload, cardNumber: string): Promise<{
        found: boolean;
        message: string;
        command?: never;
    } | {
        found: boolean;
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
    }>;
    /**
       * GET /commands/quick-access/:code
       * Acesso rápido: busca ou cria comanda automaticamente
       */
    quickAccess(user: JwtPayload, code: string): Promise<{
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
     * GET /commands/:id
     * Busca comanda por ID com detalhes
     */
    findById(id: string): Promise<{
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
     * GET /commands/:id/items
     * Lista itens da comanda
     */
    getItems(id: string): Promise<{
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
    }[]>;
    /**
     * GET /commands/:id/payments
     * Lista pagamentos da comanda
     */
    getPayments(id: string): Promise<{
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
    }[]>;
    /**
     * GET /commands/:id/events
     * Lista eventos/timeline da comanda
     */
    getEvents(id: string): Promise<{
        id: string;
        commandId: string;
        actorId: string;
        actorName: string | null;
        eventType: string;
        metadata: Record<string, unknown> | null;
        createdAt: Date;
    }[]>;
    /**
     * POST /commands
     * Abre nova comanda
     */
    open(user: JwtPayload, data: OpenCommandDto): Promise<{
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
     * POST /commands/:id/items
     * Adiciona item à comanda
     */
    addItem(user: JwtPayload, id: string, data: AddItemDto): Promise<{
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
    }>;
    /**
     * PATCH /commands/:id/items/:itemId
     * Atualiza item da comanda
     */
    updateItem(user: JwtPayload, id: string, itemId: string, data: UpdateItemDto): Promise<{
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
    }>;
    /**
     * DELETE /commands/:id/items/:itemId
     * Remove item da comanda
     */
    removeItem(user: JwtPayload, id: string, itemId: string, data: RemoveItemDto): Promise<{
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
    }>;
    /**
     * POST /commands/:id/discount
     * Aplica desconto na comanda (apenas OWNER/MANAGER)
     */
    applyDiscount(user: JwtPayload, id: string, data: ApplyDiscountDto): Promise<{
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
     * POST /commands/:id/close-service
     * Encerra serviços da comanda
     */
    closeService(user: JwtPayload, id: string): Promise<{
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
     * POST /commands/:id/payments
     * Adiciona pagamento (apenas OWNER/MANAGER/RECEPTIONIST)
     */
    addPayment(user: JwtPayload, id: string, data: AddPaymentDto): Promise<import("./commands.service").AddPaymentResult>;
    /**
     * POST /commands/:id/close-cashier
     * Fecha comanda no caixa (apenas OWNER/MANAGER/RECEPTIONIST)
     */
    closeCashier(user: JwtPayload, id: string): Promise<{
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
     * POST /commands/:id/cancel
     * Cancela comanda (apenas OWNER/MANAGER)
     */
    cancel(user: JwtPayload, id: string, data: {
        reason?: string;
    }): Promise<{
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
     * POST /commands/:id/reopen
     * Reabre comanda fechada (apenas OWNER/MANAGER)
     */
    reopen(user: JwtPayload, id: string, data: ReopenCommandDto): Promise<{
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
     * POST /commands/:id/link-client
     * Vincula cliente à comanda
     */
    linkClient(user: JwtPayload, id: string, data: LinkClientDto): Promise<{
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
     * DELETE /commands/:id/client
     * Remove vínculo do cliente com a comanda
     */
    unlinkClient(user: JwtPayload, id: string): Promise<{
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
     * POST /commands/:id/notes
     * Adiciona nota à comanda
     */
    addNote(user: JwtPayload, id: string, data: AddNoteDto): Promise<{
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
}
//# sourceMappingURL=commands.controller.d.ts.map