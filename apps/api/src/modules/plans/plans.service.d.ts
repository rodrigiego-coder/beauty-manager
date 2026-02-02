import { Plan } from '../../database/schema';
import { CreatePlanDto, UpdatePlanDto } from './dto';
export declare class PlansService {
    /**
     * List all active plans (public)
     */
    findAll(includeInactive?: boolean): Promise<Plan[]>;
    /**
     * Get plan by ID
     */
    findById(id: string): Promise<Plan>;
    /**
     * Get plan by code
     */
    findByCode(code: string): Promise<Plan | null>;
    /**
     * Create a new plan (SUPER_ADMIN only)
     */
    create(dto: CreatePlanDto): Promise<Plan>;
    /**
     * Update a plan (SUPER_ADMIN only)
     */
    update(id: string, dto: UpdatePlanDto): Promise<Plan>;
    /**
     * Deactivate a plan (SUPER_ADMIN only)
     */
    deactivate(id: string): Promise<Plan>;
    /**
     * Get free plan (for new salon signups)
     */
    getFreePlan(): Promise<Plan | null>;
    /**
     * Seed default plans if they don't exist
     */
    seedPlans(): Promise<void>;
}
//# sourceMappingURL=plans.service.d.ts.map