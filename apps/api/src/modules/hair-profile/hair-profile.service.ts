import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db } from '../../database/connection';
import * as schema from '../../database/schema';
import { CreateHairProfileDto, UpdateHairProfileDto, HairProfileResponse } from './dto';

/**
 * HairProfileService
 * Gerencia perfis capilares dos clientes
 */
@Injectable()
export class HairProfileService {
  /**
   * Obtém o perfil capilar de um cliente
   */
  async getByClientId(salonId: string, clientId: string): Promise<HairProfileResponse | null> {
    // Verifica se o cliente pertence ao salão
    const client = await db.query.clients.findFirst({
      where: and(
        eq(schema.clients.id, clientId),
        eq(schema.clients.salonId, salonId),
      ),
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const profile = await db.query.clientHairProfiles.findFirst({
      where: and(
        eq(schema.clientHairProfiles.clientId, clientId),
        eq(schema.clientHairProfiles.salonId, salonId),
      ),
    });

    if (!profile) {
      return null;
    }

    return this.mapToResponse(profile);
  }

  /**
   * Cria ou atualiza o perfil capilar de um cliente
   */
  async upsert(
    salonId: string,
    dto: CreateHairProfileDto,
    assessedById: string,
  ): Promise<HairProfileResponse> {
    // Verifica se o cliente pertence ao salão
    const client = await db.query.clients.findFirst({
      where: and(
        eq(schema.clients.id, dto.clientId),
        eq(schema.clients.salonId, salonId),
      ),
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const existing = await db.query.clientHairProfiles.findFirst({
      where: and(
        eq(schema.clientHairProfiles.clientId, dto.clientId),
        eq(schema.clientHairProfiles.salonId, salonId),
      ),
    });

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (existing) {
      // Atualiza perfil existente
      await db
        .update(schema.clientHairProfiles)
        .set({
          hairType: dto.hairType || existing.hairType,
          hairThickness: dto.hairThickness || existing.hairThickness,
          hairLength: dto.hairLength || existing.hairLength,
          hairPorosity: dto.hairPorosity || existing.hairPorosity,
          scalpType: dto.scalpType || existing.scalpType,
          chemicalHistory: dto.chemicalHistory || existing.chemicalHistory,
          mainConcerns: dto.mainConcerns || existing.mainConcerns,
          allergies: dto.allergies !== undefined ? dto.allergies : existing.allergies,
          currentProducts: dto.currentProducts !== undefined ? dto.currentProducts : existing.currentProducts,
          notes: dto.notes !== undefined ? dto.notes : existing.notes,
          lastAssessmentDate: today,
          lastAssessedById: assessedById,
          updatedAt: now,
        })
        .where(eq(schema.clientHairProfiles.id, existing.id));

      const updated = await db.query.clientHairProfiles.findFirst({
        where: eq(schema.clientHairProfiles.id, existing.id),
      });

      return this.mapToResponse(updated!);
    }

    // Cria novo perfil
    const [created] = await db
      .insert(schema.clientHairProfiles)
      .values({
        salonId,
        clientId: dto.clientId,
        hairType: dto.hairType,
        hairThickness: dto.hairThickness,
        hairLength: dto.hairLength,
        hairPorosity: dto.hairPorosity,
        scalpType: dto.scalpType,
        chemicalHistory: dto.chemicalHistory || [],
        mainConcerns: dto.mainConcerns || [],
        allergies: dto.allergies,
        currentProducts: dto.currentProducts,
        notes: dto.notes,
        lastAssessmentDate: today,
        lastAssessedById: assessedById,
      })
      .returning();

    return this.mapToResponse(created);
  }

  /**
   * Atualiza parcialmente o perfil capilar
   */
  async update(
    salonId: string,
    clientId: string,
    dto: UpdateHairProfileDto,
    assessedById: string,
  ): Promise<HairProfileResponse> {
    const existing = await db.query.clientHairProfiles.findFirst({
      where: and(
        eq(schema.clientHairProfiles.clientId, clientId),
        eq(schema.clientHairProfiles.salonId, salonId),
      ),
    });

    if (!existing) {
      throw new NotFoundException('Perfil capilar não encontrado');
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    await db
      .update(schema.clientHairProfiles)
      .set({
        ...dto,
        lastAssessmentDate: today,
        lastAssessedById: assessedById,
        updatedAt: now,
      })
      .where(eq(schema.clientHairProfiles.id, existing.id));

    const updated = await db.query.clientHairProfiles.findFirst({
      where: eq(schema.clientHairProfiles.id, existing.id),
    });

    return this.mapToResponse(updated!);
  }

  /**
   * Remove o perfil capilar
   */
  async delete(salonId: string, clientId: string): Promise<void> {
    const existing = await db.query.clientHairProfiles.findFirst({
      where: and(
        eq(schema.clientHairProfiles.clientId, clientId),
        eq(schema.clientHairProfiles.salonId, salonId),
      ),
    });

    if (!existing) {
      throw new NotFoundException('Perfil capilar não encontrado');
    }

    await db
      .delete(schema.clientHairProfiles)
      .where(eq(schema.clientHairProfiles.id, existing.id));
  }

  /**
   * Lista clientes com perfil capilar
   */
  async listClientsWithProfile(salonId: string): Promise<{ clientId: string; clientName: string; hasProfile: boolean }[]> {
    const clients = await db.query.clients.findMany({
      where: and(
        eq(schema.clients.salonId, salonId),
        eq(schema.clients.active, true),
      ),
    });

    const profiles = await db.query.clientHairProfiles.findMany({
      where: eq(schema.clientHairProfiles.salonId, salonId),
    });

    const profileClientIds = new Set(profiles.map(p => p.clientId));

    return clients.map(client => ({
      clientId: client.id,
      clientName: client.name || 'Sem nome',
      hasProfile: profileClientIds.has(client.id),
    }));
  }

  /**
   * Obtém estatísticas de perfis capilares
   */
  async getStats(salonId: string) {
    const profiles = await db.query.clientHairProfiles.findMany({
      where: eq(schema.clientHairProfiles.salonId, salonId),
    });

    const totalClients = await db.query.clients.findMany({
      where: and(
        eq(schema.clients.salonId, salonId),
        eq(schema.clients.active, true),
      ),
    });

    // Contagem por tipo de cabelo
    const hairTypeCount: Record<string, number> = {};
    // Contagem por problemas mais comuns
    const concernsCount: Record<string, number> = {};

    profiles.forEach(profile => {
      if (profile.hairType) {
        hairTypeCount[profile.hairType] = (hairTypeCount[profile.hairType] || 0) + 1;
      }
      if (profile.mainConcerns && Array.isArray(profile.mainConcerns)) {
        profile.mainConcerns.forEach(concern => {
          concernsCount[concern] = (concernsCount[concern] || 0) + 1;
        });
      }
    });

    return {
      totalClients: totalClients.length,
      profilesCreated: profiles.length,
      coveragePercentage: totalClients.length > 0
        ? Math.round((profiles.length / totalClients.length) * 100)
        : 0,
      hairTypeDistribution: hairTypeCount,
      topConcerns: Object.entries(concernsCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([concern, count]) => ({ concern, count })),
    };
  }

  // ==================== PRIVATE METHODS ====================

  private mapToResponse(profile: schema.ClientHairProfile): HairProfileResponse {
    return {
      id: profile.id,
      clientId: profile.clientId,
      hairType: profile.hairType as HairProfileResponse['hairType'],
      hairThickness: profile.hairThickness as HairProfileResponse['hairThickness'],
      hairLength: profile.hairLength as HairProfileResponse['hairLength'],
      hairPorosity: profile.hairPorosity as HairProfileResponse['hairPorosity'],
      scalpType: profile.scalpType as HairProfileResponse['scalpType'],
      chemicalHistory: (profile.chemicalHistory as string[]) || [],
      mainConcerns: (profile.mainConcerns as string[]) || [],
      allergies: profile.allergies,
      currentProducts: profile.currentProducts,
      notes: profile.notes,
      lastAssessmentDate: profile.lastAssessmentDate,
      lastAssessedById: profile.lastAssessedById,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
