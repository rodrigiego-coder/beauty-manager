import { ProductSubscriptionsService } from './product-subscriptions.service';
import { CreatePlanDto, UpdatePlanDto, AddPlanItemDto, SubscribeDto, UpdateSubscriptionDto, PauseSubscriptionDto, CancelSubscriptionDto, UpdateDeliveryStatusDto } from './dto';
interface AuthenticatedRequest extends Request {
    user: {
        sub: string;
        salonId: string;
        role: string;
    };
}
export declare class ProductSubscriptionsController {
    private readonly service;
    constructor(service: ProductSubscriptionsService);
    getPlans(req: AuthenticatedRequest, active?: string): Promise<import("./dto").PlanResponse[]>;
    getPlanById(id: string, req: AuthenticatedRequest): Promise<import("./dto").PlanResponse>;
    createPlan(dto: CreatePlanDto, req: AuthenticatedRequest): Promise<import("./dto").PlanResponse>;
    updatePlan(id: string, dto: UpdatePlanDto, req: AuthenticatedRequest): Promise<import("./dto").PlanResponse>;
    deletePlan(id: string, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    addPlanItem(id: string, dto: AddPlanItemDto, req: AuthenticatedRequest): Promise<import("./dto").PlanResponse>;
    removePlanItem(planId: string, itemId: string, req: AuthenticatedRequest): Promise<import("./dto").PlanResponse>;
    getAvailablePlans(req: AuthenticatedRequest): Promise<import("./dto").PlanResponse[]>;
    getSubscriptions(req: AuthenticatedRequest, clientId?: string): Promise<import("./dto").SubscriptionResponse[]>;
    getStats(req: AuthenticatedRequest): Promise<import("./dto").SubscriptionStats>;
    /**
     * GET /product-subscriptions/subscriptions/my
     * Retorna as assinaturas de produtos do salao do usuario logado
     * Usado pela pagina de Assinaturas do frontend
     */
    getMySubscriptions(req: AuthenticatedRequest): Promise<import("./dto").SubscriptionResponse[]>;
    getSubscriptionById(id: string, req: AuthenticatedRequest): Promise<import("./dto").SubscriptionResponse>;
    subscribe(planId: string, dto: SubscribeDto & {
        clientId: string;
    }, req: AuthenticatedRequest): Promise<import("./dto").SubscriptionResponse>;
    updateSubscription(id: string, dto: UpdateSubscriptionDto, req: AuthenticatedRequest): Promise<import("./dto").SubscriptionResponse>;
    pauseSubscription(id: string, dto: PauseSubscriptionDto, req: AuthenticatedRequest): Promise<import("./dto").SubscriptionResponse>;
    /**
     * POST /product-subscriptions/subscriptions/:id/pause
     * Rota alternativa para pausar assinatura (compatibilidade com frontend)
     */
    pauseSubscriptionAlt(id: string, dto: PauseSubscriptionDto, req: AuthenticatedRequest): Promise<import("./dto").SubscriptionResponse>;
    resumeSubscription(id: string, req: AuthenticatedRequest): Promise<import("./dto").SubscriptionResponse>;
    /**
     * POST /product-subscriptions/subscriptions/:id/resume
     * Rota alternativa para retomar assinatura (compatibilidade com frontend)
     */
    resumeSubscriptionAlt(id: string, req: AuthenticatedRequest): Promise<import("./dto").SubscriptionResponse>;
    cancelSubscription(id: string, dto: CancelSubscriptionDto, req: AuthenticatedRequest): Promise<import("./dto").SubscriptionResponse>;
    /**
     * POST /product-subscriptions/subscriptions/:id/cancel
     * Rota alternativa para cancelar assinatura (compatibilidade com frontend)
     */
    cancelSubscriptionAlt(id: string, dto: CancelSubscriptionDto, req: AuthenticatedRequest): Promise<import("./dto").SubscriptionResponse>;
    getDeliveries(req: AuthenticatedRequest, date?: string, status?: string): Promise<import("./dto").DeliveryResponse[]>;
    getPendingDeliveries(req: AuthenticatedRequest): Promise<import("./dto").DeliveryResponse[]>;
    getSubscriptionDeliveries(id: string, req: AuthenticatedRequest): Promise<import("./dto").DeliveryResponse[]>;
    updateDeliveryStatus(id: string, dto: UpdateDeliveryStatusDto, req: AuthenticatedRequest): Promise<import("./dto").DeliveryResponse>;
    generateCommand(id: string, req: AuthenticatedRequest): Promise<{
        commandId: string;
    }>;
}
export {};
//# sourceMappingURL=product-subscriptions.controller.d.ts.map