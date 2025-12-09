import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, ilike, or } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { Database, clients, Client, NewClient } from '../../database';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todos os clientes de um salão
   */
  async findAll(salonId: string): Promise<Client[]> {
    return this.db
      .select()
      .from(clients)
      .where(eq(clients.salonId, salonId))
      .orderBy(desc(clients.createdAt));
  }

  /**
   * Busca cliente por ID
   */
  async findById(id: string): Promise<Client | null> {
    const result = await this.db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Busca cliente pelo telefone
   */
  async findByPhone(phone: string, salonId?: string): Promise<Client | null> {
    const conditions = [eq(clients.phone, phone)];
    
    if (salonId) {
      conditions.push(eq(clients.salonId, salonId));
    }

    const result = await this.db
      .select()
      .from(clients)
      .where(and(...conditions))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Busca clientes por termo (nome, email ou telefone)
   */
  async search(salonId: string, term: string): Promise<Client[]> {
    const searchTerm = `%${term}%`;
    
    return this.db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.salonId, salonId),
          or(
            ilike(clients.name, searchTerm),
            ilike(clients.email, searchTerm),
            ilike(clients.phone, searchTerm),
          ),
        ),
      )
      .orderBy(clients.name);
  }

  /**
   * Cria um novo cliente
   */
  async create(data: NewClient): Promise<Client> {
    const result = await this.db
      .insert(clients)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Cria ou retorna cliente existente pelo telefone
   */
  async findOrCreate(phone: string, salonId: string, name?: string): Promise<Client> {
    let client = await this.findByPhone(phone, salonId);

    if (!client) {
      const newClient: NewClient = {
        phone,
        salonId,
        name,
        aiActive: true,
      };

      client = await this.create(newClient);
    }

    return client;
  }

  /**
   * Atualiza dados do cliente
   */
  async update(id: string, data: Partial<NewClient>): Promise<Client | null> {
    const result = await this.db
      .update(clients)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Remove cliente (hard delete)
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(clients)
      .where(eq(clients.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Atualiza o status da IA para um cliente
   */
  async setAiActive(id: string, active: boolean): Promise<Client | null> {
    return this.update(id, { aiActive: active });
  }

  /**
   * Verifica se a IA está ativa para um cliente
   */
  async isAiActive(phone: string, salonId?: string): Promise<boolean> {
    const client = await this.findByPhone(phone, salonId);
    return client?.aiActive ?? true;
  }

  /**
   * Atualiza a data da última visita
   */
  async updateLastVisit(id: string): Promise<Client | null> {
    const today = new Date().toISOString().split('T')[0];
    return this.update(id, { lastVisitDate: today });
  }
}