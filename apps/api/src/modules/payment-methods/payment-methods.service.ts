import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, asc } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '../../database/database.module';
import { paymentMethods, PaymentMethod } from '../../database/schema';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todas as formas de pagamento do salão
   */
  async findAll(salonId: string, includeInactive = false): Promise<PaymentMethod[]> {
    const conditions = [eq(paymentMethods.salonId, salonId)];

    if (!includeInactive) {
      conditions.push(eq(paymentMethods.active, true));
    }

    return this.db
      .select()
      .from(paymentMethods)
      .where(and(...conditions))
      .orderBy(asc(paymentMethods.sortOrder), asc(paymentMethods.name));
  }

  /**
   * Busca forma de pagamento por ID
   */
  async findById(id: string): Promise<PaymentMethod | null> {
    const result = await this.db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Cria uma nova forma de pagamento
   */
  async create(salonId: string, data: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const [item] = await this.db
      .insert(paymentMethods)
      .values({
        salonId,
        name: data.name,
        type: data.type,
        feeType: data.feeType || null,
        feeMode: data.feeMode || null,
        feeValue: data.feeValue?.toString() || '0',
        sortOrder: data.sortOrder || 0,
        active: true,
      })
      .returning();

    return item;
  }

  /**
   * Atualiza uma forma de pagamento existente
   */
  async update(id: string, data: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException('Forma de pagamento não encontrada');
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.feeType !== undefined) updateData.feeType = data.feeType;
    if (data.feeMode !== undefined) updateData.feeMode = data.feeMode;
    if (data.feeValue !== undefined) updateData.feeValue = data.feeValue.toString();
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.active !== undefined) updateData.active = data.active;

    const [updated] = await this.db
      .update(paymentMethods)
      .set(updateData)
      .where(eq(paymentMethods.id, id))
      .returning();

    return updated;
  }

  /**
   * Desativa (soft delete) uma forma de pagamento
   */
  async delete(id: string): Promise<PaymentMethod> {
    return this.update(id, { active: false });
  }

  /**
   * Reativa uma forma de pagamento
   */
  async reactivate(id: string): Promise<PaymentMethod> {
    return this.update(id, { active: true });
  }

  /**
   * Cria formas de pagamento padrão para um salão
   */
  async seedDefaultMethods(salonId: string): Promise<void> {
    const existing = await this.findAll(salonId, true);
    if (existing.length > 0) {
      return; // Já tem formas cadastradas
    }

    const defaults = [
      { name: 'Dinheiro', type: 'CASH', sortOrder: 1 },
      { name: 'PIX', type: 'PIX', sortOrder: 2 },
      { name: 'Cartão de Crédito', type: 'CARD_CREDIT', sortOrder: 3 },
      { name: 'Cartão de Débito', type: 'CARD_DEBIT', sortOrder: 4 },
      { name: 'Transferência', type: 'TRANSFER', sortOrder: 5 },
      { name: 'Vale/Voucher', type: 'VOUCHER', sortOrder: 6 },
    ];

    for (const method of defaults) {
      await this.db.insert(paymentMethods).values({
        salonId,
        name: method.name,
        type: method.type,
        sortOrder: method.sortOrder,
        active: true,
      });
    }
  }
}
