import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, ilike, or, desc, inArray } from 'drizzle-orm';
import { services } from '../../database/schema';
import type { Service } from '../../database/schema';
import { DATABASE_CONNECTION } from '../../database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { CreateServiceDto, UpdateServiceDto } from './dto';

@Injectable()
export class ServicesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Lista todos os serviços do salão
   */
  async findAll(salonId: string, includeInactive = false): Promise<Service[]> {
    if (includeInactive) {
      return this.db
        .select()
        .from(services)
        .where(eq(services.salonId, salonId))
        .orderBy(desc(services.createdAt));
    }
    return this.db
      .select()
      .from(services)
      .where(and(eq(services.salonId, salonId), eq(services.active, true)))
      .orderBy(desc(services.createdAt));
  }

  /**
   * Busca serviços por nome/descrição
   */
  async search(salonId: string, query: string, includeInactive = false): Promise<Service[]> {
    const conditions = [
      eq(services.salonId, salonId),
      or(
        ilike(services.name, `%${query}%`),
        ilike(services.description, `%${query}%`),
      ),
    ];

    if (!includeInactive) {
      conditions.push(eq(services.active, true));
    }

    return this.db
      .select()
      .from(services)
      .where(and(...conditions))
      .orderBy(desc(services.createdAt));
  }

  /**
   * Busca serviço por ID
   */
  async findById(id: number): Promise<Service | null> {
    const result = await this.db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);
    return result[0] || null;
  }

  /**
   * Cria um novo serviço
   */
  async create(salonId: string, data: CreateServiceDto): Promise<Service> {
    const [service] = await this.db
      .insert(services)
      .values({
        salonId,
        name: data.name,
        description: data.description || null,
        category: data.category || 'HAIR',
        durationMinutes: data.durationMinutes || 60,
        basePrice: data.basePrice.toString(),
        commissionPercentage: (data.commissionPercentage || 0).toString(),
        active: true,
      })
      .returning();

    return service;
  }

  /**
   * Atualiza um serviço existente
   */
  async update(id: number, salonId: string, data: UpdateServiceDto): Promise<Service> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException('Servico nao encontrado');
    }

    if (existing.salonId !== salonId) {
      throw new NotFoundException('Servico nao encontrado');
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.category !== undefined) {
      updateData.category = data.category;
    }
    if (data.durationMinutes !== undefined) {
      updateData.durationMinutes = data.durationMinutes;
    }
    if (data.basePrice !== undefined) {
      updateData.basePrice = data.basePrice.toString();
    }
    if (data.commissionPercentage !== undefined) {
      updateData.commissionPercentage = data.commissionPercentage.toString();
    }

    const [updated] = await this.db
      .update(services)
      .set(updateData)
      .where(eq(services.id, id))
      .returning();

    return updated;
  }

  /**
   * Desativa um serviço (soft delete)
   */
  async delete(id: number, salonId: string): Promise<Service> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException('Servico nao encontrado');
    }

    if (existing.salonId !== salonId) {
      throw new NotFoundException('Servico nao encontrado');
    }

    const [deactivated] = await this.db
      .update(services)
      .set({
        active: false,
        updatedAt: new Date(),
      })
      .where(eq(services.id, id))
      .returning();

    return deactivated;
  }

  /**
   * Reativa um serviço
   */
  async reactivate(id: number, salonId: string): Promise<Service> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException('Servico nao encontrado');
    }

    if (existing.salonId !== salonId) {
      throw new NotFoundException('Servico nao encontrado');
    }

    const [reactivated] = await this.db
      .update(services)
      .set({
        active: true,
        updatedAt: new Date(),
      })
      .where(eq(services.id, id))
      .returning();

    return reactivated;
  }

  /**
   * Lista serviços por categoria
   */
  async findByCategory(salonId: string, category: string): Promise<Service[]> {
    return this.db
      .select()
      .from(services)
      .where(
        and(
          eq(services.salonId, salonId),
          eq(services.category, category as 'HAIR' | 'BARBER' | 'NAILS' | 'SKIN' | 'MAKEUP' | 'OTHER'),
          eq(services.active, true),
        ),
      )
      .orderBy(desc(services.createdAt));
  }

  /**
   * Ativa/desativa múltiplos serviços de uma vez
   */
  async bulkUpdateStatus(
    ids: number[],
    active: boolean,
    salonId: string,
  ): Promise<{ updated: number }> {
    if (!ids || ids.length === 0) {
      return { updated: 0 };
    }

    const result = await this.db
      .update(services)
      .set({
        active,
        updatedAt: new Date(),
      })
      .where(
        and(
          inArray(services.id, ids),
          eq(services.salonId, salonId),
        ),
      )
      .returning();

    return { updated: result.length };
  }
}
