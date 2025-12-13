import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../../database/connection';
import { abTests, abTestAssignments } from '../../database/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { CreateABTestDto, UpdateABTestDto, RecordConversionDto, ABTestResponse, ABTestAssignmentResponse, ABTestStatsResponse } from './dto';

@Injectable()
export class ABTestsService {
  async getTests(
    salonId: string,
    options?: { page?: number; limit?: number; status?: string; testType?: string },
  ): Promise<{ data: ABTestResponse[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(abTests.salonId, salonId)];
    if (options?.status) conditions.push(eq(abTests.status, options.status));
    if (options?.testType) conditions.push(eq(abTests.type, options.testType));

    const [tests, totalResult] = await Promise.all([
      db.select().from(abTests).where(and(...conditions)).orderBy(desc(abTests.createdAt)).limit(limit).offset(offset),
      db.select({ count: count() }).from(abTests).where(and(...conditions)),
    ]);

    return {
      data: tests.map(t => this.formatTestResponse(t)),
      total: totalResult[0].count,
      page,
      limit,
    };
  }

  async getTestById(salonId: string, id: string): Promise<ABTestResponse> {
    const [test] = await db.select().from(abTests).where(and(eq(abTests.id, id), eq(abTests.salonId, salonId)));
    if (!test) throw new NotFoundException('Teste não encontrado');
    return this.formatTestResponse(test);
  }

  async createTest(salonId: string, dto: CreateABTestDto): Promise<ABTestResponse> {
    const [test] = await db.insert(abTests).values({
      salonId,
      name: dto.name,
      type: dto.type,
      variantA: dto.variantA || {},
      variantB: dto.variantB || {},
    }).returning();
    return this.formatTestResponse(test);
  }

  async updateTest(salonId: string, id: string, dto: UpdateABTestDto): Promise<ABTestResponse> {
    const [existing] = await db.select().from(abTests).where(and(eq(abTests.id, id), eq(abTests.salonId, salonId)));
    if (!existing) throw new NotFoundException('Teste não encontrado');
    if (existing.status === 'COMPLETED') throw new BadRequestException('Testes finalizados não podem ser editados');

    const updateData: any = { updatedAt: new Date() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.variantA !== undefined) updateData.variantA = dto.variantA;
    if (dto.variantB !== undefined) updateData.variantB = dto.variantB;

    const [updated] = await db.update(abTests).set(updateData).where(eq(abTests.id, id)).returning();
    return this.formatTestResponse(updated);
  }

  async startTest(salonId: string, id: string): Promise<ABTestResponse> {
    const [existing] = await db.select().from(abTests).where(and(eq(abTests.id, id), eq(abTests.salonId, salonId)));
    if (!existing) throw new NotFoundException('Teste não encontrado');
    if (existing.status !== 'DRAFT' && existing.status !== 'PAUSED') {
      throw new BadRequestException('Apenas testes em rascunho ou pausados podem ser iniciados');
    }

    const [updated] = await db.update(abTests).set({
      status: 'RUNNING',
      startedAt: existing.startedAt || new Date(),
      updatedAt: new Date(),
    }).where(eq(abTests.id, id)).returning();

    return this.formatTestResponse(updated);
  }

  async pauseTest(salonId: string, id: string): Promise<ABTestResponse> {
    const [existing] = await db.select().from(abTests).where(and(eq(abTests.id, id), eq(abTests.salonId, salonId)));
    if (!existing) throw new NotFoundException('Teste não encontrado');
    if (existing.status !== 'RUNNING') throw new BadRequestException('Apenas testes em execução podem ser pausados');

    const [updated] = await db.update(abTests).set({ status: 'PAUSED', updatedAt: new Date() }).where(eq(abTests.id, id)).returning();
    return this.formatTestResponse(updated);
  }

  async completeTest(salonId: string, id: string): Promise<ABTestResponse> {
    const [existing] = await db.select().from(abTests).where(and(eq(abTests.id, id), eq(abTests.salonId, salonId)));
    if (!existing) throw new NotFoundException('Teste não encontrado');
    if (existing.status !== 'RUNNING' && existing.status !== 'PAUSED') {
      throw new BadRequestException('Apenas testes em execução ou pausados podem ser finalizados');
    }

    const rateA = (existing.variantAViews || 0) > 0 ? (existing.variantAConversions || 0) / (existing.variantAViews || 1) : 0;
    const rateB = (existing.variantBViews || 0) > 0 ? (existing.variantBConversions || 0) / (existing.variantBViews || 1) : 0;
    const winningVariant = rateA >= rateB ? 'A' : 'B';

    const [updated] = await db.update(abTests).set({
      status: 'COMPLETED',
      endedAt: new Date(),
      winningVariant,
      updatedAt: new Date(),
    }).where(eq(abTests.id, id)).returning();

    return this.formatTestResponse(updated);
  }

  async deleteTest(salonId: string, id: string): Promise<void> {
    const [existing] = await db.select().from(abTests).where(and(eq(abTests.id, id), eq(abTests.salonId, salonId)));
    if (!existing) throw new NotFoundException('Teste não encontrado');
    await db.delete(abTestAssignments).where(eq(abTestAssignments.testId, id));
    await db.delete(abTests).where(eq(abTests.id, id));
  }

  async assignVariant(salonId: string, testId: string, clientId?: string, clientPhone?: string): Promise<{ variant: string; testId: string }> {
    const [test] = await db.select().from(abTests).where(and(eq(abTests.id, testId), eq(abTests.salonId, salonId)));
    if (!test) throw new NotFoundException('Teste não encontrado');
    if (test.status !== 'RUNNING') throw new BadRequestException('Teste não está em execução');

    // Check for existing assignment
    if (clientId) {
      const [existing] = await db.select().from(abTestAssignments).where(and(eq(abTestAssignments.testId, testId), eq(abTestAssignments.clientId, clientId)));
      if (existing) return { variant: existing.variant, testId };
    }

    // Random assignment (50/50)
    const variant = Math.random() < 0.5 ? 'A' : 'B';

    await db.insert(abTestAssignments).values({ testId, clientId, clientPhone, variant });

    // Update view count
    if (variant === 'A') {
      await db.update(abTests).set({ variantAViews: (test.variantAViews || 0) + 1 }).where(eq(abTests.id, testId));
    } else {
      await db.update(abTests).set({ variantBViews: (test.variantBViews || 0) + 1 }).where(eq(abTests.id, testId));
    }

    return { variant, testId };
  }

  async recordConversion(salonId: string, dto: RecordConversionDto): Promise<void> {
    const [test] = await db.select().from(abTests).where(and(eq(abTests.id, dto.testId), eq(abTests.salonId, salonId)));
    if (!test) throw new NotFoundException('Teste não encontrado');

    const conditions: any[] = [eq(abTestAssignments.testId, dto.testId)];
    if (dto.clientId) conditions.push(eq(abTestAssignments.clientId, dto.clientId));
    if (dto.clientPhone) conditions.push(eq(abTestAssignments.clientPhone, dto.clientPhone));

    const [assignment] = await db.select().from(abTestAssignments).where(and(...conditions)).orderBy(desc(abTestAssignments.createdAt)).limit(1);
    if (!assignment) throw new BadRequestException('Atribuição não encontrada');
    if (assignment.converted) return;

    await db.update(abTestAssignments).set({ converted: true, convertedAt: new Date() }).where(eq(abTestAssignments.id, assignment.id));

    if (assignment.variant === 'A') {
      await db.update(abTests).set({ variantAConversions: (test.variantAConversions || 0) + 1 }).where(eq(abTests.id, dto.testId));
    } else {
      await db.update(abTests).set({ variantBConversions: (test.variantBConversions || 0) + 1 }).where(eq(abTests.id, dto.testId));
    }
  }

  async getAssignments(
    salonId: string,
    testId: string,
    options?: { page?: number; limit?: number; converted?: boolean },
  ): Promise<{ data: ABTestAssignmentResponse[]; total: number }> {
    const [test] = await db.select().from(abTests).where(and(eq(abTests.id, testId), eq(abTests.salonId, salonId)));
    if (!test) throw new NotFoundException('Teste não encontrado');

    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(abTestAssignments.testId, testId)];
    if (options?.converted !== undefined) conditions.push(eq(abTestAssignments.converted, options.converted));

    const [assignments, totalResult] = await Promise.all([
      db.select().from(abTestAssignments).where(and(...conditions)).orderBy(desc(abTestAssignments.createdAt)).limit(limit).offset(offset),
      db.select({ count: count() }).from(abTestAssignments).where(and(...conditions)),
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

  async getStats(salonId: string): Promise<ABTestStatsResponse> {
    const tests = await db.select().from(abTests).where(eq(abTests.salonId, salonId));

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

  private formatTestResponse(test: any): ABTestResponse {
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
}
