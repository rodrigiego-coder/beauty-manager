import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto } from './dto';
export declare class PlansController {
    private readonly plansService;
    constructor(plansService: PlansService);
    /**
     * GET /plans - List all active plans (public)
     */
    findAll(includeInactive?: string): Promise<{
        id: string;
        name: string;
        code: string;
        description: string | null;
        priceMonthly: string;
        priceYearly: string | null;
        currency: string;
        maxUsers: number;
        maxClients: number;
        maxSalons: number;
        features: string[] | null;
        hasFiscal: boolean;
        hasAutomation: boolean;
        hasReports: boolean;
        hasAI: boolean;
        trialDays: number | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    /**
     * GET /plans/:id - Get plan details
     */
    findById(id: string): Promise<{
        id: string;
        name: string;
        code: string;
        description: string | null;
        priceMonthly: string;
        priceYearly: string | null;
        currency: string;
        maxUsers: number;
        maxClients: number;
        maxSalons: number;
        features: string[] | null;
        hasFiscal: boolean;
        hasAutomation: boolean;
        hasReports: boolean;
        hasAI: boolean;
        trialDays: number | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * POST /plans - Create a new plan (SUPER_ADMIN only)
     */
    create(dto: CreatePlanDto): Promise<{
        id: string;
        name: string;
        code: string;
        description: string | null;
        priceMonthly: string;
        priceYearly: string | null;
        currency: string;
        maxUsers: number;
        maxClients: number;
        maxSalons: number;
        features: string[] | null;
        hasFiscal: boolean;
        hasAutomation: boolean;
        hasReports: boolean;
        hasAI: boolean;
        trialDays: number | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * PATCH /plans/:id - Update a plan (SUPER_ADMIN only)
     */
    update(id: string, dto: UpdatePlanDto): Promise<{
        id: string;
        name: string;
        code: string;
        description: string | null;
        priceMonthly: string;
        priceYearly: string | null;
        currency: string;
        maxUsers: number;
        maxClients: number;
        maxSalons: number;
        features: string[] | null;
        hasFiscal: boolean;
        hasAutomation: boolean;
        hasReports: boolean;
        hasAI: boolean;
        trialDays: number | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * DELETE /plans/:id - Deactivate a plan (SUPER_ADMIN only)
     */
    deactivate(id: string): Promise<{
        id: string;
        name: string;
        code: string;
        description: string | null;
        priceMonthly: string;
        priceYearly: string | null;
        currency: string;
        maxUsers: number;
        maxClients: number;
        maxSalons: number;
        features: string[] | null;
        hasFiscal: boolean;
        hasAutomation: boolean;
        hasReports: boolean;
        hasAI: boolean;
        trialDays: number | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * POST /plans/seed - Seed default plans (SUPER_ADMIN only)
     */
    seed(): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=plans.controller.d.ts.map