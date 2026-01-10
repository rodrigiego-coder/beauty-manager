import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  Database,
  packages,
  Package,
  NewPackage,
  packageServices,
  PackageService,
  NewPackageService,
  services,
} from '../../database';

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
  packageServices: (PackageService & { serviceName?: string })[];
}

@Injectable()
export class PackagesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * List all active packages for a salon
   */
  async findAll(salonId: string): Promise<PackageWithServices[]> {
    const pkgs = await this.db
      .select()
      .from(packages)
      .where(and(eq(packages.salonId, salonId), eq(packages.active, true)));

    // Load services for each package
    const result: PackageWithServices[] = [];
    for (const pkg of pkgs) {
      const pkgServices = await this.getPackageServices(pkg.id);
      result.push({ ...pkg, packageServices: pkgServices });
    }

    return result;
  }

  /**
   * Find package by ID with its services
   */
  async findById(id: number): Promise<PackageWithServices | null> {
    const result = await this.db
      .select()
      .from(packages)
      .where(eq(packages.id, id))
      .limit(1);

    if (!result[0]) {
      return null;
    }

    const pkgServices = await this.getPackageServices(id);
    return { ...result[0], packageServices: pkgServices };
  }

  /**
   * Get services included in a package
   */
  async getPackageServices(packageId: number): Promise<(PackageService & { serviceName?: string })[]> {
    const pkgServices = await this.db
      .select()
      .from(packageServices)
      .where(eq(packageServices.packageId, packageId));

    // Enrich with service names
    const enriched = [];
    for (const ps of pkgServices) {
      const svc = await this.db
        .select()
        .from(services)
        .where(eq(services.id, ps.serviceId))
        .limit(1);

      enriched.push({
        ...ps,
        serviceName: svc[0]?.name,
      });
    }

    return enriched;
  }

  /**
   * Create a new package with its services
   */
  async create(data: CreatePackageDto): Promise<PackageWithServices> {
    // Validate services exist
    for (const svc of data.services) {
      const serviceResult = await this.db
        .select()
        .from(services)
        .where(eq(services.id, svc.serviceId))
        .limit(1);

      if (!serviceResult[0]) {
        throw new BadRequestException(`Service with ID ${svc.serviceId} not found`);
      }
    }

    // Calculate total sessions
    const totalSessions = data.services.reduce((sum, s) => sum + s.sessionsIncluded, 0);

    // Create package (keeping servicesIncluded for backward compatibility)
    const servicesIncluded = {
      services: data.services.map(s => ({
        name: '', // Will be filled below
        quantity: s.sessionsIncluded,
      })),
    };

    const [pkg] = await this.db
      .insert(packages)
      .values({
        salonId: data.salonId,
        name: data.name,
        description: data.description,
        price: data.price,
        totalSessions,
        expirationDays: data.expirationDays,
        servicesIncluded,
        active: true,
      })
      .returning();

    // Create package services
    const pkgServicesData: NewPackageService[] = data.services.map(s => ({
      salonId: data.salonId,
      packageId: pkg.id,
      serviceId: s.serviceId,
      sessionsIncluded: s.sessionsIncluded,
    }));

    await this.db.insert(packageServices).values(pkgServicesData);

    return this.findById(pkg.id) as Promise<PackageWithServices>;
  }

  /**
   * Update a package
   */
  async update(
    id: number,
    data: Partial<Omit<CreatePackageDto, 'salonId'>>,
  ): Promise<PackageWithServices | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    // Update package fields
    const updateData: Partial<NewPackage> = {
      updatedAt: new Date(),
    };

    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price) updateData.price = data.price;
    if (data.expirationDays) updateData.expirationDays = data.expirationDays;

    // If services changed, update them
    if (data.services) {
      // Delete existing package services
      await this.db
        .delete(packageServices)
        .where(eq(packageServices.packageId, id));

      // Calculate new total sessions
      const totalSessions = data.services.reduce((sum, s) => sum + s.sessionsIncluded, 0);
      updateData.totalSessions = totalSessions;

      // Create new package services
      const pkgServicesData: NewPackageService[] = data.services.map(s => ({
        salonId: existing.salonId!,
        packageId: id,
        serviceId: s.serviceId,
        sessionsIncluded: s.sessionsIncluded,
      }));

      await this.db.insert(packageServices).values(pkgServicesData);
    }

    await this.db
      .update(packages)
      .set(updateData)
      .where(eq(packages.id, id));

    return this.findById(id);
  }

  /**
   * Deactivate a package (soft delete)
   */
  async deactivate(id: number): Promise<Package | null> {
    const result = await this.db
      .update(packages)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(packages.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Validate if a service is included in a package
   */
  async isServiceIncluded(packageId: number, serviceId: number): Promise<boolean> {
    const result = await this.db
      .select()
      .from(packageServices)
      .where(
        and(
          eq(packageServices.packageId, packageId),
          eq(packageServices.serviceId, serviceId),
        ),
      )
      .limit(1);

    return !!result[0];
  }

  /**
   * Get sessions included for a specific service in a package
   */
  async getSessionsForService(packageId: number, serviceId: number): Promise<number> {
    const result = await this.db
      .select()
      .from(packageServices)
      .where(
        and(
          eq(packageServices.packageId, packageId),
          eq(packageServices.serviceId, serviceId),
        ),
      )
      .limit(1);

    return result[0]?.sessionsIncluded || 0;
  }
}
