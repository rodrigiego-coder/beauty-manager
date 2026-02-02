import { PackagesService, CreatePackageDto } from './packages.service';
export declare class PackagesController {
    private readonly packagesService;
    constructor(packagesService: PackagesService);
    /**
     * GET /packages
     * List all active packages for a salon
     */
    findAll(salonId: string): Promise<import("./packages.service").PackageWithServices[]>;
    /**
     * GET /packages/:id
     * Find package by ID with services
     */
    findById(id: number): Promise<import("./packages.service").PackageWithServices>;
    /**
     * GET /packages/:id/services
     * Get services included in a package
     */
    getPackageServices(id: number): Promise<({
        id: number;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        serviceId: number;
        packageId: number;
        sessionsIncluded: number;
    } & {
        serviceName?: string;
    })[]>;
    /**
     * POST /packages
     * Create a new package with services
     */
    create(data: CreatePackageDto): Promise<import("./packages.service").PackageWithServices>;
    /**
     * PATCH /packages/:id
     * Update a package
     */
    update(id: number, data: Partial<Omit<CreatePackageDto, 'salonId'>>): Promise<import("./packages.service").PackageWithServices>;
    /**
     * DELETE /packages/:id
     * Deactivate a package (soft delete)
     */
    deactivate(id: number): Promise<{
        message: string;
    }>;
    /**
     * POST /packages/:id/check-service/:serviceId
     * Check if a service is included in a package
     */
    isServiceIncluded(id: number, serviceId: number): Promise<{
        isIncluded: boolean;
        sessionsIncluded: number;
    }>;
}
//# sourceMappingURL=packages.controller.d.ts.map