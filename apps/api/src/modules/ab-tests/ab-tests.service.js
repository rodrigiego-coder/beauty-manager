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
exports.ABTestsService = void 0;
const common_1 = require("@nestjs/common");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
let ABTestsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ABTestsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ABTestsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        async getTests(salonId, options) {
            const page = options?.page || 1;
            const limit = options?.limit || 20;
            const offset = (page - 1) * limit;
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.abTests.salonId, salonId)];
            if (options?.status)
                conditions.push((0, drizzle_orm_1.eq)(schema_1.abTests.status, options.status));
            if (options?.testType)
                conditions.push((0, drizzle_orm_1.eq)(schema_1.abTests.type, options.testType));
            const [tests, totalResult] = await Promise.all([
                connection_1.db.select().from(schema_1.abTests).where((0, drizzle_orm_1.and)(...conditions)).orderBy((0, drizzle_orm_1.desc)(schema_1.abTests.createdAt)).limit(limit).offset(offset),
                connection_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.abTests).where((0, drizzle_orm_1.and)(...conditions)),
            ]);
            return {
                data: tests.map(t => this.formatTestResponse(t)),
                total: totalResult[0].count,
                page,
                limit,
            };
        }
        async getTestById(salonId, id) {
            const [test] = await connection_1.db.select().from(schema_1.abTests).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.abTests.id, id), (0, drizzle_orm_1.eq)(schema_1.abTests.salonId, salonId)));
            if (!test)
                throw new common_1.NotFoundException('Teste não encontrado');
            return this.formatTestResponse(test);
        }
        async createTest(salonId, dto) {
            const [test] = await connection_1.db.insert(schema_1.abTests).values({
                salonId,
                name: dto.name,
                type: dto.type,
                variantA: dto.variantA || {},
                variantB: dto.variantB || {},
            }).returning();
            return this.formatTestResponse(test);
        }
        async updateTest(salonId, id, dto) {
            const [existing] = await connection_1.db.select().from(schema_1.abTests).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.abTests.id, id), (0, drizzle_orm_1.eq)(schema_1.abTests.salonId, salonId)));
            if (!existing)
                throw new common_1.NotFoundException('Teste não encontrado');
            if (existing.status === 'COMPLETED')
                throw new common_1.BadRequestException('Testes finalizados não podem ser editados');
            const updateData = { updatedAt: new Date() };
            if (dto.name !== undefined)
                updateData.name = dto.name;
            if (dto.variantA !== undefined)
                updateData.variantA = dto.variantA;
            if (dto.variantB !== undefined)
                updateData.variantB = dto.variantB;
            const [updated] = await connection_1.db.update(schema_1.abTests).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.abTests.id, id)).returning();
            return this.formatTestResponse(updated);
        }
        async startTest(salonId, id) {
            const [existing] = await connection_1.db.select().from(schema_1.abTests).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.abTests.id, id), (0, drizzle_orm_1.eq)(schema_1.abTests.salonId, salonId)));
            if (!existing)
                throw new common_1.NotFoundException('Teste não encontrado');
            if (existing.status !== 'DRAFT' && existing.status !== 'PAUSED') {
                throw new common_1.BadRequestException('Apenas testes em rascunho ou pausados podem ser iniciados');
            }
            const [updated] = await connection_1.db.update(schema_1.abTests).set({
                status: 'RUNNING',
                startedAt: existing.startedAt || new Date(),
                updatedAt: new Date(),
            }).where((0, drizzle_orm_1.eq)(schema_1.abTests.id, id)).returning();
            return this.formatTestResponse(updated);
        }
        async pauseTest(salonId, id) {
            const [existing] = await connection_1.db.select().from(schema_1.abTests).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.abTests.id, id), (0, drizzle_orm_1.eq)(schema_1.abTests.salonId, salonId)));
            if (!existing)
                throw new common_1.NotFoundException('Teste não encontrado');
            if (existing.status !== 'RUNNING')
                throw new common_1.BadRequestException('Apenas testes em execução podem ser pausados');
            const [updated] = await connection_1.db.update(schema_1.abTests).set({ status: 'PAUSED', updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.abTests.id, id)).returning();
            return this.formatTestResponse(updated);
        }
        async completeTest(salonId, id) {
            const [existing] = await connection_1.db.select().from(schema_1.abTests).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.abTests.id, id), (0, drizzle_orm_1.eq)(schema_1.abTests.salonId, salonId)));
            if (!existing)
                throw new common_1.NotFoundException('Teste não encontrado');
            if (existing.status !== 'RUNNING' && existing.status !== 'PAUSED') {
                throw new common_1.BadRequestException('Apenas testes em execução ou pausados podem ser finalizados');
            }
            const rateA = (existing.variantAViews || 0) > 0 ? (existing.variantAConversions || 0) / (existing.variantAViews || 1) : 0;
            const rateB = (existing.variantBViews || 0) > 0 ? (existing.variantBConversions || 0) / (existing.variantBViews || 1) : 0;
            const winningVariant = rateA >= rateB ? 'A' : 'B';
            const [updated] = await connection_1.db.update(schema_1.abTests).set({
                status: 'COMPLETED',
                endedAt: new Date(),
                winningVariant,
                updatedAt: new Date(),
            }).where((0, drizzle_orm_1.eq)(schema_1.abTests.id, id)).returning();
            return this.formatTestResponse(updated);
        }
        async deleteTest(salonId, id) {
            const [existing] = await connection_1.db.select().from(schema_1.abTests).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.abTests.id, id), (0, drizzle_orm_1.eq)(schema_1.abTests.salonId, salonId)));
            if (!existing)
                throw new common_1.NotFoundException('Teste não encontrado');
            await connection_1.db.delete(schema_1.abTestAssignments).where((0, drizzle_orm_1.eq)(schema_1.abTestAssignments.testId, id));
            await connection_1.db.delete(schema_1.abTests).where((0, drizzle_orm_1.eq)(schema_1.abTests.id, id));
        }
        async assignVariant(salonId, testId, clientId, clientPhone) {
            const [test] = await connection_1.db.select().from(schema_1.abTests).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.abTests.id, testId), (0, drizzle_orm_1.eq)(schema_1.abTests.salonId, salonId)));
            if (!test)
                throw new common_1.NotFoundException('Teste não encontrado');
            if (test.status !== 'RUNNING')
                throw new common_1.BadRequestException('Teste não está em execução');
            // Check for existing assignment
            if (clientId) {
                const [existing] = await connection_1.db.select().from(schema_1.abTestAssignments).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.abTestAssignments.testId, testId), (0, drizzle_orm_1.eq)(schema_1.abTestAssignments.clientId, clientId)));
                if (existing)
                    return { variant: existing.variant, testId };
            }
            // Random assignment (50/50)
            const variant = Math.random() < 0.5 ? 'A' : 'B';
            await connection_1.db.insert(schema_1.abTestAssignments).values({ testId, clientId, clientPhone, variant });
            // Update view count
            if (variant === 'A') {
                await connection_1.db.update(schema_1.abTests).set({ variantAViews: (test.variantAViews || 0) + 1 }).where((0, drizzle_orm_1.eq)(schema_1.abTests.id, testId));
            }
            else {
                await connection_1.db.update(schema_1.abTests).set({ variantBViews: (test.variantBViews || 0) + 1 }).where((0, drizzle_orm_1.eq)(schema_1.abTests.id, testId));
            }
            return { variant, testId };
        }
        async recordConversion(salonId, dto) {
            const [test] = await connection_1.db.select().from(schema_1.abTests).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.abTests.id, dto.testId), (0, drizzle_orm_1.eq)(schema_1.abTests.salonId, salonId)));
            if (!test)
                throw new common_1.NotFoundException('Teste não encontrado');
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.abTestAssignments.testId, dto.testId)];
            if (dto.clientId)
                conditions.push((0, drizzle_orm_1.eq)(schema_1.abTestAssignments.clientId, dto.clientId));
            if (dto.clientPhone)
                conditions.push((0, drizzle_orm_1.eq)(schema_1.abTestAssignments.clientPhone, dto.clientPhone));
            const [assignment] = await connection_1.db.select().from(schema_1.abTestAssignments).where((0, drizzle_orm_1.and)(...conditions)).orderBy((0, drizzle_orm_1.desc)(schema_1.abTestAssignments.createdAt)).limit(1);
            if (!assignment)
                throw new common_1.BadRequestException('Atribuição não encontrada');
            if (assignment.converted)
                return;
            await connection_1.db.update(schema_1.abTestAssignments).set({ converted: true, convertedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.abTestAssignments.id, assignment.id));
            if (assignment.variant === 'A') {
                await connection_1.db.update(schema_1.abTests).set({ variantAConversions: (test.variantAConversions || 0) + 1 }).where((0, drizzle_orm_1.eq)(schema_1.abTests.id, dto.testId));
            }
            else {
                await connection_1.db.update(schema_1.abTests).set({ variantBConversions: (test.variantBConversions || 0) + 1 }).where((0, drizzle_orm_1.eq)(schema_1.abTests.id, dto.testId));
            }
        }
        async getAssignments(salonId, testId, options) {
            const [test] = await connection_1.db.select().from(schema_1.abTests).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.abTests.id, testId), (0, drizzle_orm_1.eq)(schema_1.abTests.salonId, salonId)));
            if (!test)
                throw new common_1.NotFoundException('Teste não encontrado');
            const page = options?.page || 1;
            const limit = options?.limit || 50;
            const offset = (page - 1) * limit;
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.abTestAssignments.testId, testId)];
            if (options?.converted !== undefined)
                conditions.push((0, drizzle_orm_1.eq)(schema_1.abTestAssignments.converted, options.converted));
            const [assignments, totalResult] = await Promise.all([
                connection_1.db.select().from(schema_1.abTestAssignments).where((0, drizzle_orm_1.and)(...conditions)).orderBy((0, drizzle_orm_1.desc)(schema_1.abTestAssignments.createdAt)).limit(limit).offset(offset),
                connection_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.abTestAssignments).where((0, drizzle_orm_1.and)(...conditions)),
            ]);
            return {
                data: assignments.map(a => ({
                    id: a.id,
                    testId: a.testId,
                    clientId: a.clientId,
                    clientPhone: a.clientPhone,
                    variant: a.variant,
                    converted: a.converted || false,
                    convertedAt: a.convertedAt,
                    createdAt: a.createdAt,
                })),
                total: totalResult[0].count,
            };
        }
        async getStats(salonId) {
            const tests = await connection_1.db.select().from(schema_1.abTests).where((0, drizzle_orm_1.eq)(schema_1.abTests.salonId, salonId));
            let totalViews = 0;
            let totalConversions = 0;
            for (const t of tests) {
                totalViews += (t.variantAViews || 0) + (t.variantBViews || 0);
                totalConversions += (t.variantAConversions || 0) + (t.variantBConversions || 0);
            }
            return {
                totalTests: tests.length,
                runningTests: tests.filter(t => t.status === 'RUNNING').length,
                completedTests: tests.filter(t => t.status === 'COMPLETED').length,
                pausedTests: tests.filter(t => t.status === 'PAUSED').length,
                draftTests: tests.filter(t => t.status === 'DRAFT').length,
                totalViews,
                totalConversions,
                overallConversionRate: totalViews > 0 ? (totalConversions / totalViews) * 100 : 0,
            };
        }
        formatTestResponse(test) {
            const variantAViews = test.variantAViews || 0;
            const variantBViews = test.variantBViews || 0;
            const variantAConversions = test.variantAConversions || 0;
            const variantBConversions = test.variantBConversions || 0;
            return {
                id: test.id,
                salonId: test.salonId,
                name: test.name,
                type: test.type,
                status: test.status,
                variantA: test.variantA || {},
                variantB: test.variantB || {},
                variantAViews,
                variantAConversions,
                variantBViews,
                variantBConversions,
                variantAConversionRate: variantAViews > 0 ? (variantAConversions / variantAViews) * 100 : 0,
                variantBConversionRate: variantBViews > 0 ? (variantBConversions / variantBViews) * 100 : 0,
                winningVariant: test.winningVariant,
                startedAt: test.startedAt,
                endedAt: test.endedAt,
                createdAt: test.createdAt,
                updatedAt: test.updatedAt,
            };
        }
    };
    return ABTestsService = _classThis;
})();
exports.ABTestsService = ABTestsService;
//# sourceMappingURL=ab-tests.service.js.map