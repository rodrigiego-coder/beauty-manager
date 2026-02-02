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
exports.PackagesService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../../database");
let PackagesService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PackagesService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PackagesService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * List all active packages for a salon
         */
        async findAll(salonId) {
            const pkgs = await this.db
                .select()
                .from(database_1.packages)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.packages.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.packages.active, true)));
            // Load services for each package
            const result = [];
            for (const pkg of pkgs) {
                const pkgServices = await this.getPackageServices(pkg.id);
                result.push({ ...pkg, packageServices: pkgServices });
            }
            return result;
        }
        /**
         * Find package by ID with its services
         */
        async findById(id) {
            const result = await this.db
                .select()
                .from(database_1.packages)
                .where((0, drizzle_orm_1.eq)(database_1.packages.id, id))
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
        async getPackageServices(packageId) {
            const pkgServices = await this.db
                .select()
                .from(database_1.packageServices)
                .where((0, drizzle_orm_1.eq)(database_1.packageServices.packageId, packageId));
            // Enrich with service names
            const enriched = [];
            for (const ps of pkgServices) {
                const svc = await this.db
                    .select()
                    .from(database_1.services)
                    .where((0, drizzle_orm_1.eq)(database_1.services.id, ps.serviceId))
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
        async create(data) {
            // Validate services exist
            for (const svc of data.services) {
                const serviceResult = await this.db
                    .select()
                    .from(database_1.services)
                    .where((0, drizzle_orm_1.eq)(database_1.services.id, svc.serviceId))
                    .limit(1);
                if (!serviceResult[0]) {
                    throw new common_1.BadRequestException(`Service with ID ${svc.serviceId} not found`);
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
                .insert(database_1.packages)
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
            const pkgServicesData = data.services.map(s => ({
                salonId: data.salonId,
                packageId: pkg.id,
                serviceId: s.serviceId,
                sessionsIncluded: s.sessionsIncluded,
            }));
            await this.db.insert(database_1.packageServices).values(pkgServicesData);
            return this.findById(pkg.id);
        }
        /**
         * Update a package
         */
        async update(id, data) {
            const existing = await this.findById(id);
            if (!existing) {
                return null;
            }
            // Update package fields
            const updateData = {
                updatedAt: new Date(),
            };
            if (data.name)
                updateData.name = data.name;
            if (data.description !== undefined)
                updateData.description = data.description;
            if (data.price)
                updateData.price = data.price;
            if (data.expirationDays)
                updateData.expirationDays = data.expirationDays;
            // If services changed, update them
            if (data.services) {
                // Delete existing package services
                await this.db
                    .delete(database_1.packageServices)
                    .where((0, drizzle_orm_1.eq)(database_1.packageServices.packageId, id));
                // Calculate new total sessions
                const totalSessions = data.services.reduce((sum, s) => sum + s.sessionsIncluded, 0);
                updateData.totalSessions = totalSessions;
                // Create new package services
                const pkgServicesData = data.services.map(s => ({
                    salonId: existing.salonId,
                    packageId: id,
                    serviceId: s.serviceId,
                    sessionsIncluded: s.sessionsIncluded,
                }));
                await this.db.insert(database_1.packageServices).values(pkgServicesData);
            }
            await this.db
                .update(database_1.packages)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(database_1.packages.id, id));
            return this.findById(id);
        }
        /**
         * Deactivate a package (soft delete)
         */
        async deactivate(id) {
            const result = await this.db
                .update(database_1.packages)
                .set({ active: false, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(database_1.packages.id, id))
                .returning();
            return result[0] || null;
        }
        /**
         * Validate if a service is included in a package
         */
        async isServiceIncluded(packageId, serviceId) {
            const result = await this.db
                .select()
                .from(database_1.packageServices)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.packageServices.packageId, packageId), (0, drizzle_orm_1.eq)(database_1.packageServices.serviceId, serviceId)))
                .limit(1);
            return !!result[0];
        }
        /**
         * Get sessions included for a specific service in a package
         */
        async getSessionsForService(packageId, serviceId) {
            const result = await this.db
                .select()
                .from(database_1.packageServices)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.packageServices.packageId, packageId), (0, drizzle_orm_1.eq)(database_1.packageServices.serviceId, serviceId)))
                .limit(1);
            return result[0]?.sessionsIncluded || 0;
        }
    };
    return PackagesService = _classThis;
})();
exports.PackagesService = PackagesService;
//# sourceMappingURL=packages.service.js.map