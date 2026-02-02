"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientPackagesService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../../database");
let ClientPackagesService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ClientPackagesService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ClientPackagesService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * List all packages for a client
         */
        async findByClient(clientId) {
            return this.db
                .select()
                .from(database_1.clientPackages)
                .where((0, drizzle_orm_1.eq)(database_1.clientPackages.clientId, clientId));
        }
        /**
         * List active packages with balances for a client
         */
        async findActiveByClientWithBalances(clientId) {
            const today = new Date().toISOString().split('T')[0];
            const allPackages = await this.db
                .select()
                .from(database_1.clientPackages)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.clientPackages.clientId, clientId), (0, drizzle_orm_1.eq)(database_1.clientPackages.active, true)));
            // Filter non-expired packages with remaining sessions
            const activePackages = allPackages.filter(cp => cp.remainingSessions > 0 && cp.expirationDate >= today);
            const result = [];
            for (const cp of activePackages) {
                // Get package name
                const [pkg] = await this.db
                    .select()
                    .from(database_1.packages)
                    .where((0, drizzle_orm_1.eq)(database_1.packages.id, cp.packageId))
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
        async getBalancesWithServices(clientPackageId) {
            const balances = await this.db
                .select()
                .from(database_1.clientPackageBalances)
                .where((0, drizzle_orm_1.eq)(database_1.clientPackageBalances.clientPackageId, clientPackageId));
            const result = [];
            for (const balance of balances) {
                const [svc] = await this.db
                    .select()
                    .from(database_1.services)
                    .where((0, drizzle_orm_1.eq)(database_1.services.id, balance.serviceId))
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
        async findById(id) {
            const result = await this.db
                .select()
                .from(database_1.clientPackages)
                .where((0, drizzle_orm_1.eq)(database_1.clientPackages.id, id))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Find client package by ID with balances
         */
        async findByIdWithBalances(id) {
            const cp = await this.findById(id);
            if (!cp)
                return null;
            const [pkg] = await this.db
                .select()
                .from(database_1.packages)
                .where((0, drizzle_orm_1.eq)(database_1.packages.id, cp.packageId))
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
        async purchasePackage(clientId, packageId, salonId) {
            // Validate client exists
            const [client] = await this.db
                .select()
                .from(database_1.clients)
                .where((0, drizzle_orm_1.eq)(database_1.clients.id, clientId))
                .limit(1);
            if (!client) {
                throw new common_1.BadRequestException('Client not found');
            }
            // Get package
            const [pkg] = await this.db
                .select()
                .from(database_1.packages)
                .where((0, drizzle_orm_1.eq)(database_1.packages.id, packageId))
                .limit(1);
            if (!pkg) {
                throw new common_1.BadRequestException('Package not found');
            }
            if (!pkg.active) {
                throw new common_1.BadRequestException('Package is not available for sale');
            }
            // Calculate expiration date
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + pkg.expirationDays);
            // Create client package
            const [clientPkg] = await this.db
                .insert(database_1.clientPackages)
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
                .from(database_1.packageServices)
                .where((0, drizzle_orm_1.eq)(database_1.packageServices.packageId, packageId));
            for (const ps of pkgServices) {
                const balanceData = {
                    salonId,
                    clientPackageId: clientPkg.id,
                    serviceId: ps.serviceId,
                    totalSessions: ps.sessionsIncluded,
                    remainingSessions: ps.sessionsIncluded,
                };
                await this.db.insert(database_1.clientPackageBalances).values(balanceData);
            }
            return this.findByIdWithBalances(clientPkg.id);
        }
        /**
         * Consume a session from a package (decrements balance, creates usage record)
         */
        async consumeSession(data) {
            const clientPkg = await this.findById(data.clientPackageId);
            if (!clientPkg) {
                throw new common_1.BadRequestException('Client package not found');
            }
            if (!clientPkg.active) {
                throw new common_1.BadRequestException('Package is inactive');
            }
            // Check expiration
            const today = new Date().toISOString().split('T')[0];
            if (clientPkg.expirationDate < today) {
                await this.db
                    .update(database_1.clientPackages)
                    .set({ active: false, updatedAt: new Date() })
                    .where((0, drizzle_orm_1.eq)(database_1.clientPackages.id, data.clientPackageId));
                throw new common_1.BadRequestException('Package has expired');
            }
            // Get balance for this service
            const [balance] = await this.db
                .select()
                .from(database_1.clientPackageBalances)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.clientPackageBalances.clientPackageId, data.clientPackageId), (0, drizzle_orm_1.eq)(database_1.clientPackageBalances.serviceId, data.serviceId)))
                .limit(1);
            if (!balance) {
                throw new common_1.BadRequestException('This service is not included in the package');
            }
            if (balance.remainingSessions <= 0) {
                throw new common_1.BadRequestException('No remaining sessions for this service');
            }
            // Decrement balance
            const newRemainingSessions = balance.remainingSessions - 1;
            const [updatedBalance] = await this.db
                .update(database_1.clientPackageBalances)
                .set({
                remainingSessions: newRemainingSessions,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.clientPackageBalances.id, balance.id))
                .returning();
            // Create usage record
            const usageData = {
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
                .insert(database_1.clientPackageUsages)
                .values(usageData)
                .returning();
            // Update total remaining sessions in client package
            const allBalances = await this.db
                .select()
                .from(database_1.clientPackageBalances)
                .where((0, drizzle_orm_1.eq)(database_1.clientPackageBalances.clientPackageId, data.clientPackageId));
            const totalRemaining = allBalances.reduce((sum, b) => sum + b.remainingSessions, 0);
            await this.db
                .update(database_1.clientPackages)
                .set({
                remainingSessions: totalRemaining,
                updatedAt: new Date(),
                active: totalRemaining > 0,
            })
                .where((0, drizzle_orm_1.eq)(database_1.clientPackages.id, data.clientPackageId));
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
        async revertSession(usageId, notes) {
            const [usage] = await this.db
                .select()
                .from(database_1.clientPackageUsages)
                .where((0, drizzle_orm_1.eq)(database_1.clientPackageUsages.id, usageId))
                .limit(1);
            if (!usage) {
                throw new common_1.BadRequestException('Usage record not found');
            }
            if (usage.status === 'REVERTED') {
                throw new common_1.BadRequestException('Session already reverted');
            }
            // Update usage status
            const [updatedUsage] = await this.db
                .update(database_1.clientPackageUsages)
                .set({
                status: 'REVERTED',
                revertedAt: new Date(),
                notes: notes || usage.notes,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.clientPackageUsages.id, usageId))
                .returning();
            // Increment balance
            const [balance] = await this.db
                .select()
                .from(database_1.clientPackageBalances)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.clientPackageBalances.clientPackageId, usage.clientPackageId), (0, drizzle_orm_1.eq)(database_1.clientPackageBalances.serviceId, usage.serviceId)))
                .limit(1);
            const [updatedBalance] = await this.db
                .update(database_1.clientPackageBalances)
                .set({
                remainingSessions: balance.remainingSessions + 1,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.clientPackageBalances.id, balance.id))
                .returning();
            // Update total remaining in client package
            const allBalances = await this.db
                .select()
                .from(database_1.clientPackageBalances)
                .where((0, drizzle_orm_1.eq)(database_1.clientPackageBalances.clientPackageId, usage.clientPackageId));
            const totalRemaining = allBalances.reduce((sum, b) => sum + b.remainingSessions, 0);
            await this.db
                .update(database_1.clientPackages)
                .set({
                remainingSessions: totalRemaining,
                updatedAt: new Date(),
                active: true,
            })
                .where((0, drizzle_orm_1.eq)(database_1.clientPackages.id, usage.clientPackageId));
            return {
                balance: updatedBalance,
                usage: updatedUsage,
                message: `Session reverted. ${updatedBalance.remainingSessions} session(s) available.`,
            };
        }
        /**
         * Check if client has valid package for a specific service
         */
        async hasValidPackageForService(clientId, serviceId) {
            const today = new Date().toISOString().split('T')[0];
            // Get active packages for client
            const activePackages = await this.db
                .select()
                .from(database_1.clientPackages)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.clientPackages.clientId, clientId), (0, drizzle_orm_1.eq)(database_1.clientPackages.active, true)));
            for (const cp of activePackages) {
                // Skip expired packages
                if (cp.expirationDate < today)
                    continue;
                // Check if this package has balance for the service
                const [balance] = await this.db
                    .select()
                    .from(database_1.clientPackageBalances)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.clientPackageBalances.clientPackageId, cp.id), (0, drizzle_orm_1.eq)(database_1.clientPackageBalances.serviceId, serviceId)))
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
            return { hasPackage: false };
        }
        /**
         * Get usage history for a client package
         */
        async getUsageHistory(clientPackageId) {
            const usages = await this.db
                .select()
                .from(database_1.clientPackageUsages)
                .where((0, drizzle_orm_1.eq)(database_1.clientPackageUsages.clientPackageId, clientPackageId));
            const result = [];
            for (const usage of usages) {
                const [svc] = await this.db
                    .select()
                    .from(database_1.services)
                    .where((0, drizzle_orm_1.eq)(database_1.services.id, usage.serviceId))
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
        async cancel(id) {
            const result = await this.db
                .update(database_1.clientPackages)
                .set({ active: false, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(database_1.clientPackages.id, id))
                .returning();
            return result[0] || null;
        }
        /**
         * Get client statistics
         */
        async getClientStats(clientId) {
            const allPackages = await this.findByClient(clientId);
            const activeWithBalances = await this.findActiveByClientWithBalances(clientId);
            let totalSessionsUsed = 0;
            let totalSessionsRemaining = 0;
            // Calculate from balances
            for (const pkg of allPackages) {
                const balances = await this.db
                    .select()
                    .from(database_1.clientPackageBalances)
                    .where((0, drizzle_orm_1.eq)(database_1.clientPackageBalances.clientPackageId, pkg.id));
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
        // ==================== LEGACY METHODS (backward compatibility) ====================
        /**
         * @deprecated Use findActiveByClientWithBalances instead
         */
        async findActiveByClient(clientId) {
            const today = new Date().toISOString().split('T')[0];
            const all = await this.db
                .select()
                .from(database_1.clientPackages)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.clientPackages.clientId, clientId), (0, drizzle_orm_1.eq)(database_1.clientPackages.active, true)));
            return all.filter(cp => cp.remainingSessions > 0 && cp.expirationDate >= today);
        }
        /**
         * @deprecated Use consumeSession instead
         */
        async useSession(clientPackageId) {
            const clientPkg = await this.findById(clientPackageId);
            if (!clientPkg) {
                throw new common_1.BadRequestException('Client package not found');
            }
            if (!clientPkg.active) {
                throw new common_1.BadRequestException('Package is inactive');
            }
            const today = new Date().toISOString().split('T')[0];
            if (clientPkg.expirationDate < today) {
                await this.db
                    .update(database_1.clientPackages)
                    .set({ active: false, updatedAt: new Date() })
                    .where((0, drizzle_orm_1.eq)(database_1.clientPackages.id, clientPackageId));
                throw new common_1.BadRequestException('Package has expired');
            }
            if (clientPkg.remainingSessions <= 0) {
                throw new common_1.BadRequestException('No remaining sessions');
            }
            const newRemainingSessions = clientPkg.remainingSessions - 1;
            const result = await this.db
                .update(database_1.clientPackages)
                .set({
                remainingSessions: newRemainingSessions,
                updatedAt: new Date(),
                active: newRemainingSessions > 0,
            })
                .where((0, drizzle_orm_1.eq)(database_1.clientPackages.id, clientPackageId))
                .returning();
            const message = newRemainingSessions > 0
                ? `Session used. ${newRemainingSessions} session(s) remaining.`
                : 'Last session used. Package completed.';
            return {
                clientPackage: result[0],
                message,
            };
        }
    };
    return ClientPackagesService = _classThis;
})();
exports.ClientPackagesService = ClientPackagesService;
//# sourceMappingURL=client-packages.service.js.map