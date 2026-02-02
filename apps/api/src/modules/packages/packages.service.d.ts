import { Database, Package, PackageService } from '../../database';
/**
 * DTO for creating a package with its services
 */
export interface CreatePackageDto {
    salonId: string;
    name: string;
    description?: string;
    price: string;
    expirationDays: number;
    services: {
        serviceId: number;
        sessionsIncluded: number;
    }[];
}
/**
 * Package with its included services
 */
export interface PackageWithServices extends Package {
    packageServices: (PackageService & {
        serviceName?: string;
    })[];
}
export declare class PackagesService {
    private db;
    constructor(db: Database);
    /**
     * List all active packages for a salon
     */
    findAll(salonId: string): Promise<PackageWithServices[]>;
    /**
     * Find package by ID with its services
     */
    findById(id: number): Promise<PackageWithServices | null>;
    /**
     * Get services included in a package
     */
    getPackageServices(packageId: number): Promise<(PackageService & {
        serviceName?: string;
    })[]>;
    /**
     * Create a new package with its services
     */
    create(data: CreatePackageDto): Promise<PackageWithServices>;
    /**
     * Update a package
     */
    update(id: number, data: Partial<Omit<CreatePackageDto, 'salonId'>>): Promise<PackageWithServices | null>;
    /**
     * Deactivate a package (soft delete)
     */
    deactivate(id: number): Promise<Package | null>;
    /**
     * Validate if a service is included in a package
     */
    isServiceIncluded(packageId: number, serviceId: number): Promise<boolean>;
    /**
     * Get sessions included for a specific service in a package
     */
    getSessionsForService(packageId: number, serviceId: number): Promise<number>;
}
//# sourceMappingURL=packages.service.d.ts.map