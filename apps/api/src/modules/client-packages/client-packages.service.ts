import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  Database,
  clientPackages,
  ClientPackage,
  packages,
  clients,
  packageServices,
  clientPackageBalances,
  ClientPackageBalance,
  NewClientPackageBalance,
  clientPackageUsages,
  ClientPackageUsage,
  NewClientPackageUsage,
  services,
} from '../../database';

/**
 * Balance with service details
 */
export interface BalanceWithService extends ClientPackageBalance {
  serviceName: string;
  servicePrice: string;
}

/**
 * Usage record with details
 */
export interface UsageWithDetails extends ClientPackageUsage {
  serviceName?: string;
  professionalName?: string;
}

/**
 * Client package with balances
 */
export interface ClientPackageWithBalances extends ClientPackage {
  packageName: string;
  balances: BalanceWithService[];
}

/**
 * DTO for consuming a session
 */
export interface ConsumeSessionDto {
  salonId: string;
  clientPackageId: number;
  serviceId: number;
  commandId?: string;
  commandItemId?: string;
  professionalId?: string;
  notes?: string;
}

/**
 * DTO for manual session balance adjustment
 */
export interface AdjustBalanceDto {
  serviceId: number;
  sessionsAlreadyDone: number;
  adjustedBy: string;
  notes?: string;
}

@Injectable()
export class ClientPackagesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * List all packages for a client
   */
  async findByClient(clientId: string): Promise<ClientPackage[]> {
    return this.db
      .select()
      .from(clientPackages)
      .where(eq(clientPackages.clientId, clientId));
  }

  /**
   * List active packages with balances for a client
   */
  async findActiveByClientWithBalances(clientId: string): Promise<ClientPackageWithBalances[]> {
    const today = new Date().toISOString().split('T')[0];

    const allPackages = await this.db
      .select()
      .from(clientPackages)
      .where(
        and(
          eq(clientPackages.clientId, clientId),
          eq(clientPackages.active, true),
        ),
      );

    // Filter non-expired packages with remaining sessions
    const activePackages = allPackages.filter(
      cp => cp.remainingSessions > 0 && cp.expirationDate >= today,
    );

    const result: ClientPackageWithBalances[] = [];

    for (const cp of activePackages) {
      // Get package name
      const [pkg] = await this.db
        .select()
        .from(packages)
        .where(eq(packages.id, cp.packageId))
        .limit(1);

      // Get balances with service details
      const balances = await this.getBalancesWithServices(cp.id);

      result.push({
        ...cp,
        packageName: pkg?.name || 'Unknown',
        balances,
      });
    }

    return result;
  }

  /**
   * Get balances for a client package with service details
   */
  async getBalancesWithServices(clientPackageId: number): Promise<BalanceWithService[]> {
    const balances = await this.db
      .select()
      .from(clientPackageBalances)
      .where(eq(clientPackageBalances.clientPackageId, clientPackageId));

    const result: BalanceWithService[] = [];

    for (const balance of balances) {
      const [svc] = await this.db
        .select()
        .from(services)
        .where(eq(services.id, balance.serviceId))
        .limit(1);

      result.push({
        ...balance,
        serviceName: svc?.name || 'Unknown',
        servicePrice: svc?.basePrice || '0',
      });
    }

    return result;
  }

  /**
   * Find client package by ID
   */
  async findById(id: number): Promise<ClientPackage | null> {
    const result = await this.db
      .select()
      .from(clientPackages)
      .where(eq(clientPackages.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find client package by ID with balances
   */
  async findByIdWithBalances(id: number): Promise<ClientPackageWithBalances | null> {
    const cp = await this.findById(id);
    if (!cp) return null;

    const [pkg] = await this.db
      .select()
      .from(packages)
      .where(eq(packages.id, cp.packageId))
      .limit(1);

    const balances = await this.getBalancesWithServices(id);

    return {
      ...cp,
      packageName: pkg?.name || 'Unknown',
      balances,
    };
  }

  /**
   * Purchase a package for a client (creates balances for each service)
   */
  async purchasePackage(
    clientId: string,
    packageId: number,
    salonId: string,
  ): Promise<ClientPackageWithBalances> {
    // Validate client exists
    const [client] = await this.db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (!client) {
      throw new BadRequestException('Client not found');
    }

    // Get package
    const [pkg] = await this.db
      .select()
      .from(packages)
      .where(eq(packages.id, packageId))
      .limit(1);

    if (!pkg) {
      throw new BadRequestException('Package not found');
    }

    if (!pkg.active) {
      throw new BadRequestException('Package is not available for sale');
    }

    // Calculate expiration date
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + pkg.expirationDays);

    // Create client package
    const [clientPkg] = await this.db
      .insert(clientPackages)
      .values({
        clientId,
        packageId,
        remainingSessions: pkg.totalSessions,
        expirationDate: expirationDate.toISOString().split('T')[0],
        active: true,
      })
      .returning();

    // Get package services and create balances
    const pkgServices = await this.db
      .select()
      .from(packageServices)
      .where(eq(packageServices.packageId, packageId));

    for (const ps of pkgServices) {
      const balanceData: NewClientPackageBalance = {
        salonId,
        clientPackageId: clientPkg.id,
        serviceId: ps.serviceId,
        totalSessions: ps.sessionsIncluded,
        remainingSessions: ps.sessionsIncluded,
      };

      await this.db.insert(clientPackageBalances).values(balanceData);
    }

    return this.findByIdWithBalances(clientPkg.id) as Promise<ClientPackageWithBalances>;
  }

  /**
   * Consume a session from a package (decrements balance, creates usage record)
   */
  async consumeSession(data: ConsumeSessionDto): Promise<{
    balance: ClientPackageBalance;
    usage: ClientPackageUsage;
    message: string;
  }> {
    const clientPkg = await this.findById(data.clientPackageId);

    if (!clientPkg) {
      throw new BadRequestException('Client package not found');
    }

    if (!clientPkg.active) {
      throw new BadRequestException('Package is inactive');
    }

    // Check expiration
    const today = new Date().toISOString().split('T')[0];
    if (clientPkg.expirationDate < today) {
      await this.db
        .update(clientPackages)
        .set({ active: false, updatedAt: new Date() })
        .where(eq(clientPackages.id, data.clientPackageId));

      throw new BadRequestException('Package has expired');
    }

    // Get balance for this service
    const [balance] = await this.db
      .select()
      .from(clientPackageBalances)
      .where(
        and(
          eq(clientPackageBalances.clientPackageId, data.clientPackageId),
          eq(clientPackageBalances.serviceId, data.serviceId),
        ),
      )
      .limit(1);

    if (!balance) {
      throw new BadRequestException('This service is not included in the package');
    }

    if (balance.remainingSessions <= 0) {
      throw new BadRequestException('No remaining sessions for this service');
    }

    // Decrement balance
    const newRemainingSessions = balance.remainingSessions - 1;

    const [updatedBalance] = await this.db
      .update(clientPackageBalances)
      .set({
        remainingSessions: newRemainingSessions,
        updatedAt: new Date(),
      })
      .where(eq(clientPackageBalances.id, balance.id))
      .returning();

    // Create usage record
    const usageData: NewClientPackageUsage = {
      salonId: data.salonId,
      clientPackageId: data.clientPackageId,
      serviceId: data.serviceId,
      commandId: data.commandId,
      commandItemId: data.commandItemId,
      professionalId: data.professionalId,
      status: 'CONSUMED',
      notes: data.notes,
    };

    const [usage] = await this.db
      .insert(clientPackageUsages)
      .values(usageData)
      .returning();

    // Update total remaining sessions in client package
    const allBalances = await this.db
      .select()
      .from(clientPackageBalances)
      .where(eq(clientPackageBalances.clientPackageId, data.clientPackageId));

    const totalRemaining = allBalances.reduce((sum, b) => sum + b.remainingSessions, 0);

    await this.db
      .update(clientPackages)
      .set({
        remainingSessions: totalRemaining,
        updatedAt: new Date(),
        active: totalRemaining > 0,
      })
      .where(eq(clientPackages.id, data.clientPackageId));

    const message = newRemainingSessions > 0
      ? `Session consumed. ${newRemainingSessions} session(s) remaining for this service.`
      : 'Last session for this service consumed.';

    return {
      balance: updatedBalance,
      usage,
      message,
    };
  }

  /**
   * Revert a consumed session (for cancellations/refunds)
   */
  async revertSession(usageId: number, notes?: string): Promise<{
    balance: ClientPackageBalance;
    usage: ClientPackageUsage;
    message: string;
  }> {
    const [usage] = await this.db
      .select()
      .from(clientPackageUsages)
      .where(eq(clientPackageUsages.id, usageId))
      .limit(1);

    if (!usage) {
      throw new BadRequestException('Usage record not found');
    }

    if (usage.status === 'REVERTED') {
      throw new BadRequestException('Session already reverted');
    }

    // Update usage status
    const [updatedUsage] = await this.db
      .update(clientPackageUsages)
      .set({
        status: 'REVERTED',
        revertedAt: new Date(),
        notes: notes || usage.notes,
        updatedAt: new Date(),
      })
      .where(eq(clientPackageUsages.id, usageId))
      .returning();

    // Increment balance
    const [balance] = await this.db
      .select()
      .from(clientPackageBalances)
      .where(
        and(
          eq(clientPackageBalances.clientPackageId, usage.clientPackageId),
          eq(clientPackageBalances.serviceId, usage.serviceId),
        ),
      )
      .limit(1);

    const [updatedBalance] = await this.db
      .update(clientPackageBalances)
      .set({
        remainingSessions: balance.remainingSessions + 1,
        updatedAt: new Date(),
      })
      .where(eq(clientPackageBalances.id, balance.id))
      .returning();

    // Update total remaining in client package
    const allBalances = await this.db
      .select()
      .from(clientPackageBalances)
      .where(eq(clientPackageBalances.clientPackageId, usage.clientPackageId));

    const totalRemaining = allBalances.reduce((sum, b) => sum + b.remainingSessions, 0);

    await this.db
      .update(clientPackages)
      .set({
        remainingSessions: totalRemaining,
        updatedAt: new Date(),
        active: true,
      })
      .where(eq(clientPackages.id, usage.clientPackageId));

    return {
      balance: updatedBalance,
      usage: updatedUsage,
      message: `Session reverted. ${updatedBalance.remainingSessions} session(s) available.`,
    };
  }

  /**
   * Check if client has valid package for a specific service.
   * Auto-provisions a package when the service has totalSessions > 1
   * and the client has no existing package for it.
   */
  async hasValidPackageForService(
    clientId: string,
    serviceId: number,
  ): Promise<{
    hasPackage: boolean;
    clientPackage?: ClientPackage;
    balance?: ClientPackageBalance;
    remainingSessions?: number;
    depletedPackage?: boolean;
    depletedPackageId?: number;
    previousBalance?: ClientPackageBalance;
    service?: { id: number; name: string; totalSessions: number };
  }> {
    const today = new Date().toISOString().split('T')[0];

    // Get ALL packages for client (active or not) to check existing and find usable
    const allClientPackages = await this.db
      .select()
      .from(clientPackages)
      .where(eq(clientPackages.clientId, clientId));

    // 1) Look for an active package with remaining sessions (existing behavior)
    for (const cp of allClientPackages) {
      if (!cp.active || cp.expirationDate < today) continue;

      const [balance] = await this.db
        .select()
        .from(clientPackageBalances)
        .where(
          and(
            eq(clientPackageBalances.clientPackageId, cp.id),
            eq(clientPackageBalances.serviceId, serviceId),
          ),
        )
        .limit(1);

      if (balance && balance.remainingSessions > 0) {
        return {
          hasPackage: true,
          clientPackage: cp,
          balance,
          remainingSessions: balance.remainingSessions,
        };
      }
    }

    // 2) No usable package found. Check if the service itself is multi-session.
    const [service] = await this.db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!service || service.totalSessions <= 1) {
      return { hasPackage: false };
    }

    // 3) Service has totalSessions > 1. Check if client already HAD a balance
    //    for this service (depleted/expired) to avoid re-creating.
    for (const cp of allClientPackages) {
      const [existingBalance] = await this.db
        .select()
        .from(clientPackageBalances)
        .where(
          and(
            eq(clientPackageBalances.clientPackageId, cp.id),
            eq(clientPackageBalances.serviceId, serviceId),
          ),
        )
        .limit(1);

      if (existingBalance) {
        // Client already had a package for this service (sessions depleted or expired)
        return {
          hasPackage: false,
          depletedPackage: true,
          depletedPackageId: cp.packageId,
          previousBalance: existingBalance,
          service: { id: service.id, name: service.name, totalSessions: service.totalSessions },
        };
      }
    }

    // 4) Auto-provision: create package infrastructure for this multi-session service
    const [client] = await this.db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (!client || !client.salonId) {
      return { hasPackage: false };
    }

    const salonId = client.salonId;

    // Find existing package definition that includes this service, or create one
    let pkg: any = null;

    const existingPkgSvc = await this.db
      .select()
      .from(packageServices)
      .where(
        and(
          eq(packageServices.serviceId, serviceId),
          eq(packageServices.salonId, salonId),
        ),
      );

    if (existingPkgSvc.length > 0) {
      [pkg] = await this.db
        .select()
        .from(packages)
        .where(
          and(
            eq(packages.id, existingPkgSvc[0].packageId),
            eq(packages.active, true),
          ),
        )
        .limit(1);
    }

    if (!pkg) {
      // Create auto-package definition
      [pkg] = await this.db
        .insert(packages)
        .values({
          salonId,
          name: service.name,
          description: `Pacote automático: ${service.name} (${service.totalSessions} sessões)`,
          price: service.basePrice,
          servicesIncluded: { services: [{ name: service.name, quantity: service.totalSessions }] },
          totalSessions: service.totalSessions,
          expirationDays: 365,
          active: true,
        })
        .returning();

      await this.db
        .insert(packageServices)
        .values({
          salonId,
          packageId: pkg.id,
          serviceId: service.id,
          sessionsIncluded: service.totalSessions,
        });
    }

    // Create clientPackage
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + (pkg.expirationDays || 365));

    const [clientPkg] = await this.db
      .insert(clientPackages)
      .values({
        clientId,
        packageId: pkg.id,
        remainingSessions: service.totalSessions,
        expirationDate: expirationDate.toISOString().split('T')[0],
        active: true,
      })
      .returning();

    // Create balance
    const [balance] = await this.db
      .insert(clientPackageBalances)
      .values({
        salonId,
        clientPackageId: clientPkg.id,
        serviceId: service.id,
        totalSessions: service.totalSessions,
        remainingSessions: service.totalSessions,
      })
      .returning();

    return {
      hasPackage: true,
      clientPackage: clientPkg,
      balance,
      remainingSessions: service.totalSessions,
    };
  }

  /**
   * Get usage history for a client package
   */
  async getUsageHistory(clientPackageId: number): Promise<UsageWithDetails[]> {
    const usages = await this.db
      .select()
      .from(clientPackageUsages)
      .where(eq(clientPackageUsages.clientPackageId, clientPackageId));

    const result: UsageWithDetails[] = [];

    for (const usage of usages) {
      const [svc] = await this.db
        .select()
        .from(services)
        .where(eq(services.id, usage.serviceId))
        .limit(1);

      result.push({
        ...usage,
        serviceName: svc?.name,
      });
    }

    return result;
  }

  /**
   * Cancel a client package
   */
  async cancel(id: number): Promise<ClientPackage | null> {
    const result = await this.db
      .update(clientPackages)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(clientPackages.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Get client statistics
   */
  async getClientStats(clientId: string): Promise<{
    totalPackages: number;
    activePackages: number;
    totalSessionsUsed: number;
    totalSessionsRemaining: number;
  }> {
    const allPackages = await this.findByClient(clientId);
    const activeWithBalances = await this.findActiveByClientWithBalances(clientId);

    let totalSessionsUsed = 0;
    let totalSessionsRemaining = 0;

    // Calculate from balances
    for (const pkg of allPackages) {
      const balances = await this.db
        .select()
        .from(clientPackageBalances)
        .where(eq(clientPackageBalances.clientPackageId, pkg.id));

      for (const balance of balances) {
        totalSessionsUsed += balance.totalSessions - balance.remainingSessions;
        totalSessionsRemaining += balance.remainingSessions;
      }
    }

    return {
      totalPackages: allPackages.length,
      activePackages: activeWithBalances.length,
      totalSessionsUsed,
      totalSessionsRemaining,
    };
  }

  /**
   * Manually adjust session balance for clients who started treatments before the system.
   * Creates a MANUAL_ADJUSTMENT audit record for traceability.
   */
  async adjustSessionBalance(
    clientPackageId: number,
    data: AdjustBalanceDto,
  ): Promise<{
    balance: ClientPackageBalance;
    usage: ClientPackageUsage;
    message: string;
  }> {
    const clientPkg = await this.findById(clientPackageId);

    if (!clientPkg) {
      throw new BadRequestException('Client package not found');
    }

    // Get balance for this service
    const [balance] = await this.db
      .select()
      .from(clientPackageBalances)
      .where(
        and(
          eq(clientPackageBalances.clientPackageId, clientPackageId),
          eq(clientPackageBalances.serviceId, data.serviceId),
        ),
      )
      .limit(1);

    if (!balance) {
      throw new BadRequestException('This service is not included in the package');
    }

    if (data.sessionsAlreadyDone < 0 || data.sessionsAlreadyDone >= balance.totalSessions) {
      throw new BadRequestException(
        `Sessions already done must be between 0 and ${balance.totalSessions - 1}`,
      );
    }

    const newRemaining = balance.totalSessions - data.sessionsAlreadyDone;

    // Update the per-service balance
    const [updatedBalance] = await this.db
      .update(clientPackageBalances)
      .set({
        remainingSessions: newRemaining,
        updatedAt: new Date(),
      })
      .where(eq(clientPackageBalances.id, balance.id))
      .returning();

    // Create audit record (use salonId from the balance row)
    const [usage] = await this.db
      .insert(clientPackageUsages)
      .values({
        salonId: balance.salonId,
        clientPackageId,
        serviceId: data.serviceId,
        status: 'MANUAL_ADJUSTMENT',
        notes: `Ajuste manual: ${data.sessionsAlreadyDone} sessões já realizadas (de ${balance.totalSessions} total). Restam ${newRemaining}. Ajustado por: ${data.adjustedBy}${data.notes ? '. Obs: ' + data.notes : ''}`,
      })
      .returning();

    // Recalculate aggregate remaining sessions on clientPackages
    const allBalances = await this.db
      .select()
      .from(clientPackageBalances)
      .where(eq(clientPackageBalances.clientPackageId, clientPackageId));

    const totalRemaining = allBalances.reduce((sum, b) => sum + b.remainingSessions, 0);

    await this.db
      .update(clientPackages)
      .set({
        remainingSessions: totalRemaining,
        updatedAt: new Date(),
        active: totalRemaining > 0,
      })
      .where(eq(clientPackages.id, clientPackageId));

    return {
      balance: updatedBalance,
      usage,
      message: `Saldo ajustado. ${newRemaining} sessão(ões) restante(s) para este serviço.`,
    };
  }

  // ==================== LEGACY METHODS (backward compatibility) ====================

  /**
   * @deprecated Use findActiveByClientWithBalances instead
   */
  async findActiveByClient(clientId: string): Promise<ClientPackage[]> {
    const today = new Date().toISOString().split('T')[0];

    const all = await this.db
      .select()
      .from(clientPackages)
      .where(
        and(
          eq(clientPackages.clientId, clientId),
          eq(clientPackages.active, true),
        ),
      );

    return all.filter(
      cp => cp.remainingSessions > 0 && cp.expirationDate >= today,
    );
  }

  /**
   * @deprecated Use consumeSession instead
   */
  async useSession(clientPackageId: number): Promise<{
    clientPackage: ClientPackage;
    message: string;
  }> {
    const clientPkg = await this.findById(clientPackageId);

    if (!clientPkg) {
      throw new BadRequestException('Client package not found');
    }

    if (!clientPkg.active) {
      throw new BadRequestException('Package is inactive');
    }

    const today = new Date().toISOString().split('T')[0];
    if (clientPkg.expirationDate < today) {
      await this.db
        .update(clientPackages)
        .set({ active: false, updatedAt: new Date() })
        .where(eq(clientPackages.id, clientPackageId));

      throw new BadRequestException('Package has expired');
    }

    if (clientPkg.remainingSessions <= 0) {
      throw new BadRequestException('No remaining sessions');
    }

    const newRemainingSessions = clientPkg.remainingSessions - 1;

    const result = await this.db
      .update(clientPackages)
      .set({
        remainingSessions: newRemainingSessions,
        updatedAt: new Date(),
        active: newRemainingSessions > 0,
      })
      .where(eq(clientPackages.id, clientPackageId))
      .returning();

    const message = newRemainingSessions > 0
      ? `Session used. ${newRemainingSessions} session(s) remaining.`
      : 'Last session used. Package completed.';

    return {
      clientPackage: result[0],
      message,
    };
  }
}
