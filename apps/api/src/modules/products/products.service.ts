import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { Database, products, Product, NewProduct } from '../../database';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todos os produtos ativos
   */
  async findAll(): Promise<Product[]> {
    return this.db
      .select()
      .from(products)
      .where(eq(products.active, true));
  }

  /**
   * Busca produto por ID
   */
  async findById(id: number): Promise<Product | null> {
    const result = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Cria um novo produto
   */
  async create(data: NewProduct): Promise<Product> {
    const result = await this.db
      .insert(products)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Atualiza um produto
   */
  async update(id: number, data: Partial<NewProduct>): Promise<Product | null> {
    const result = await this.db
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Desativa um produto (soft delete)
   */
  async deactivate(id: number): Promise<Product | null> {
    return this.update(id, { active: false });
  }

  /**
   * Atualiza o estoque de um produto
   */
  async updateStock(id: number, quantity: number): Promise<Product | null> {
    const product = await this.findById(id);
    if (!product) return null;

    const newStock = product.currentStock + quantity;
    return this.update(id, { currentStock: newStock });
  }

  /**
   * Lista produtos com estoque baixo (current_stock <= min_stock)
   */
  async findLowStock(): Promise<Product[]> {
    const allProducts = await this.db
      .select()
      .from(products)
      .where(eq(products.active, true));

    // Filtra produtos onde currentStock <= minStock
    return allProducts.filter(p => p.currentStock <= p.minStock);
  }
}
