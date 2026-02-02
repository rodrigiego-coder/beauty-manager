import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { Database, salons, Salon, NewSalon } from '../../database';

@Injectable()
export class SalonsService {
  private readonly logger = new Logger(SalonsService.name);
  private readonly TEMPLATE_SALON_ID = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

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
   * Cria um novo salão e copia serviços/produtos do template
   */
  async create(data: NewSalon): Promise<Salon> {
    const result = await this.db
      .insert(salons)
      .values(data)
      .returning();

    const newSalon = result[0];

    // Copia serviços e produtos do template
    try {
      await this.copyTemplateData(newSalon.id);
      this.logger.log(`Template data copied to new salon: ${newSalon.id}`);
    } catch (error) {
      this.logger.error(`Failed to copy template data to salon ${newSalon.id}:`, error);
      // Não falha a criação do salão se a cópia falhar
    }

    return newSalon;
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

  /**
   * Copia serviços e produtos do salão template para um novo salão
   * Os itens são criados como INATIVOS para o salão ativar conforme necessidade
   */
  async copyTemplateData(newSalonId: string): Promise<{ services: number; products: number }> {
    // Copiar serviços do template (inativos)
    const servicesResult = await this.db.execute(sql`
      INSERT INTO services (
        salon_id, name, description, category, duration_minutes, base_price,
        commission_percentage, buffer_before, buffer_after, allow_encaixe,
        requires_room, allow_home_service, home_service_fee,
        max_advance_booking_days, min_advance_booking_hours,
        allow_online_booking, active, created_at, updated_at
      )
      SELECT
        ${newSalonId}::uuid,
        name, description, category, duration_minutes, base_price,
        commission_percentage, buffer_before, buffer_after, allow_encaixe,
        requires_room, allow_home_service, home_service_fee,
        max_advance_booking_days, min_advance_booking_hours,
        allow_online_booking, false, NOW(), NOW()
      FROM services
      WHERE salon_id = ${this.TEMPLATE_SALON_ID}::uuid
    `);

    // Copiar produtos do template (inativos, estoque zerado)
    const productsResult = await this.db.execute(sql`
      INSERT INTO products (
        salon_id, name, description, cost_price, sale_price,
        stock_retail, stock_internal, min_stock_retail, min_stock_internal,
        unit, active, is_retail, is_backbar, hair_types, concerns,
        contraindications, ingredients, how_to_use, benefits,
        brand, category, created_at, updated_at, catalog_code,
        is_system_default, alexis_enabled
      )
      SELECT
        ${newSalonId}::uuid,
        name, description, cost_price, sale_price,
        0, 0, min_stock_retail, min_stock_internal,
        unit, false, is_retail, is_backbar, hair_types, concerns,
        contraindications, ingredients, how_to_use, benefits,
        brand, category, NOW(), NOW(), catalog_code,
        false, alexis_enabled
      FROM products
      WHERE salon_id = ${this.TEMPLATE_SALON_ID}::uuid
    `);

    const servicesCount = servicesResult.rowCount || 0;
    const productsCount = productsResult.rowCount || 0;

    this.logger.log(`Copied ${servicesCount} services and ${productsCount} products to salon ${newSalonId}`);

    return { services: servicesCount, products: productsCount };
  }
}
