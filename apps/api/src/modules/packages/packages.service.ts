import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { Database, packages, Package, NewPackage } from '../../database';

@Injectable()
export class PackagesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todos os pacotes ativos
   */
  async findAll(salonId?: string): Promise<Package[]> {
    if (salonId) {
      const all = await this.db
        .select()
        .from(packages)
        .where(eq(packages.active, true));
      return all.filter(p => p.salonId === salonId);
    }

    return this.db
      .select()
      .from(packages)
      .where(eq(packages.active, true));
  }

  /**
   * Busca pacote por ID
   */
  async findById(id: number): Promise<Package | null> {
    const result = await this.db
      .select()
      .from(packages)
      .where(eq(packages.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Cria um novo pacote
   */
  async create(data: NewPackage): Promise<Package> {
    const result = await this.db
      .insert(packages)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Atualiza um pacote
   */
  async update(id: number, data: Partial<NewPackage>): Promise<Package | null> {
    const result = await this.db
      .update(packages)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(packages.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Desativa um pacote (soft delete)
   */
  async deactivate(id: number): Promise<Package | null> {
    return this.update(id, { active: false });
  }
}
