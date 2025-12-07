import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { Database, salons, Salon, NewSalon } from '../../database';

@Injectable()
export class SalonsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todos os salões ativos
   */
  async findAll(): Promise<Salon[]> {
    return this.db
      .select()
      .from(salons)
      .where(eq(salons.active, true));
  }

  /**
   * Busca salão por ID
   */
  async findById(id: string): Promise<Salon | null> {
    const result = await this.db
      .select()
      .from(salons)
      .where(eq(salons.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Busca salão por CNPJ
   */
  async findByTaxId(taxId: string): Promise<Salon | null> {
    const result = await this.db
      .select()
      .from(salons)
      .where(eq(salons.taxId, taxId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Cria um novo salão
   */
  async create(data: NewSalon): Promise<Salon> {
    const result = await this.db
      .insert(salons)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Atualiza um salão
   */
  async update(id: string, data: Partial<NewSalon>): Promise<Salon | null> {
    const result = await this.db
      .update(salons)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(salons.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Desativa um salão (soft delete)
   */
  async deactivate(id: string): Promise<Salon | null> {
    return this.update(id, { active: false });
  }
}
