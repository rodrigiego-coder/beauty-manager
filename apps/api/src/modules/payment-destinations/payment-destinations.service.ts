import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, asc } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '../../database/database.module';
import { paymentDestinations, PaymentDestination } from '../../database/schema';
import { CreatePaymentDestinationDto, UpdatePaymentDestinationDto } from './dto';

@Injectable()
export class PaymentDestinationsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todos os destinos de pagamento do salão
   */
  async findAll(salonId: string, includeInactive = false): Promise<PaymentDestination[]> {
    const conditions = [eq(paymentDestinations.salonId, salonId)];

    if (!includeInactive) {
      conditions.push(eq(paymentDestinations.active, true));
    }

    return this.db
      .select()
      .from(paymentDestinations)
      .where(and(...conditions))
      .orderBy(asc(paymentDestinations.sortOrder), asc(paymentDestinations.name));
  }

  /**
   * Busca destino de pagamento por ID
   */
  async findById(id: string): Promise<PaymentDestination | null> {
    const result = await this.db
      .select()
      .from(paymentDestinations)
      .where(eq(paymentDestinations.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Cria um novo destino de pagamento
   */
  async create(salonId: string, data: CreatePaymentDestinationDto): Promise<PaymentDestination> {
    const [item] = await this.db
      .insert(paymentDestinations)
      .values({
        salonId,
        name: data.name,
        type: data.type,
        bankName: data.bankName || null,
        lastDigits: data.lastDigits || null,
        description: data.description || null,
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
   * Atualiza um destino de pagamento existente
   */
  async update(id: string, data: UpdatePaymentDestinationDto): Promise<PaymentDestination> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException('Destino de pagamento não encontrado');
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.bankName !== undefined) updateData.bankName = data.bankName;
    if (data.lastDigits !== undefined) updateData.lastDigits = data.lastDigits;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.feeType !== undefined) updateData.feeType = data.feeType;
    if (data.feeMode !== undefined) updateData.feeMode = data.feeMode;
    if (data.feeValue !== undefined) updateData.feeValue = data.feeValue.toString();
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.active !== undefined) updateData.active = data.active;

    const [updated] = await this.db
      .update(paymentDestinations)
      .set(updateData)
      .where(eq(paymentDestinations.id, id))
      .returning();

    return updated;
  }

  /**
   * Desativa (soft delete) um destino de pagamento
   */
  async delete(id: string): Promise<PaymentDestination> {
    return this.update(id, { active: false });
  }

  /**
   * Reativa um destino de pagamento
   */
  async reactivate(id: string): Promise<PaymentDestination> {
    return this.update(id, { active: true });
  }

  /**
   * Cria destinos de pagamento padrão para um salão
   */
  async seedDefaultDestinations(salonId: string): Promise<void> {
    const existing = await this.findAll(salonId, true);
    if (existing.length > 0) {
      return; // Já tem destinos cadastrados
    }

    const defaults = [
      { name: 'Caixa do Salão', type: 'CASH_DRAWER', sortOrder: 1 },
    ];

    for (const destination of defaults) {
      await this.db.insert(paymentDestinations).values({
        salonId,
        name: destination.name,
        type: destination.type,
        sortOrder: destination.sortOrder,
        active: true,
      });
    }
  }
}
