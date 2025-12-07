import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { Database, clients, Client, NewClient } from '../../database';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Busca cliente pelo telefone
   */
  async findByPhone(phone: string): Promise<Client | null> {
    const result = await this.db
      .select()
      .from(clients)
      .where(eq(clients.phone, phone))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Cria ou retorna cliente existente pelo telefone
   */
  async findOrCreate(phone: string, name?: string): Promise<Client> {
    let client = await this.findByPhone(phone);

    if (!client) {
      const newClient: NewClient = {
        phone,
        name,
        aiActive: true,
      };

      const result = await this.db
        .insert(clients)
        .values(newClient)
        .returning();

      client = result[0];
    }

    return client;
  }

  /**
   * Atualiza o status da IA para um cliente
   */
  async setAiActive(phone: string, active: boolean): Promise<Client> {
    // Garante que o cliente existe
    await this.findOrCreate(phone);

    const result = await this.db
      .update(clients)
      .set({
        aiActive: active,
        updatedAt: new Date(),
      })
      .where(eq(clients.phone, phone))
      .returning();

    return result[0];
  }

  /**
   * Verifica se a IA esta ativa para um cliente
   */
  async isAiActive(phone: string): Promise<boolean> {
    const client = await this.findByPhone(phone);
    return client?.aiActive ?? true; // Se cliente nao existe, IA esta ativa por padrao
  }

  /**
   * Atualiza dados do cliente
   */
  async update(
    phone: string,
    data: Partial<Pick<Client, 'name' | 'email'>>,
  ): Promise<Client | null> {
    const result = await this.db
      .update(clients)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(clients.phone, phone))
      .returning();

    return result[0] || null;
  }
}
