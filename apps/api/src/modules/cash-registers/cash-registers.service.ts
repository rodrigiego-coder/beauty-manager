import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  Database,
  cashRegisters,
  cashMovements,
  CashRegister,
  CashMovement,
} from '../../database';
import { OpenCashRegisterDto, CloseCashRegisterDto, CashMovementDto } from './dto';

interface CurrentUser {
  id: string;
  salonId: string;
  role: string;
}

@Injectable()
export class CashRegistersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Busca caixa aberto atual do salão
   */
  async getCurrent(salonId: string): Promise<CashRegister | null> {
    const result = await this.db
      .select()
      .from(cashRegisters)
      .where(
        and(
          eq(cashRegisters.salonId, salonId),
          eq(cashRegisters.status, 'OPEN')
        )
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * Abre um novo caixa
   */
  async open(salonId: string, data: OpenCashRegisterDto, currentUser: CurrentUser): Promise<CashRegister> {
    // Verifica se já existe caixa aberto
    const existingOpen = await this.getCurrent(salonId);
    if (existingOpen) {
      throw new BadRequestException('Ja existe um caixa aberto. Feche o caixa atual antes de abrir um novo.');
    }

    const [cashRegister] = await this.db
      .insert(cashRegisters)
      .values({
        salonId,
        openingBalance: data.openingBalance.toString(),
        openedById: currentUser.id,
        status: 'OPEN',
      })
      .returning();

    return cashRegister;
  }

  /**
   * Fecha o caixa atual
   */
  async close(salonId: string, data: CloseCashRegisterDto, currentUser: CurrentUser): Promise<CashRegister> {
    const cashRegister = await this.getCurrent(salonId);
    if (!cashRegister) {
      throw new BadRequestException('Nao existe caixa aberto para fechar.');
    }

    // Calcula saldo esperado
    const openingBalance = parseFloat(cashRegister.openingBalance);
    const totalCash = parseFloat(cashRegister.totalCash || '0');
    const totalDeposits = parseFloat(cashRegister.totalDeposits || '0');
    const totalWithdrawals = parseFloat(cashRegister.totalWithdrawals || '0');

    // Saldo esperado = abertura + vendas em dinheiro + suprimentos - sangrias
    const expectedBalance = openingBalance + totalCash + totalDeposits - totalWithdrawals;
    const difference = data.closingBalance - expectedBalance;

    const [closedRegister] = await this.db
      .update(cashRegisters)
      .set({
        status: 'CLOSED',
        closingBalance: data.closingBalance.toString(),
        expectedBalance: expectedBalance.toString(),
        difference: difference.toString(),
        closedAt: new Date(),
        closedById: currentUser.id,
        notes: data.notes || null,
        updatedAt: new Date(),
      })
      .where(eq(cashRegisters.id, cashRegister.id))
      .returning();

    return closedRegister;
  }

  /**
   * Registra sangria (retirada)
   */
  async withdrawal(
    cashRegisterId: string,
    data: CashMovementDto,
    currentUser: CurrentUser,
  ): Promise<CashMovement> {
    const cashRegister = await this.findById(cashRegisterId);
    if (!cashRegister) {
      throw new NotFoundException('Caixa nao encontrado');
    }

    if (cashRegister.status !== 'OPEN') {
      throw new BadRequestException('Caixa ja esta fechado');
    }

    // Cria movimento
    const [movement] = await this.db
      .insert(cashMovements)
      .values({
        cashRegisterId,
        type: 'WITHDRAWAL',
        amount: data.amount.toString(),
        reason: data.reason,
        performedById: currentUser.id,
      })
      .returning();

    // Atualiza total de sangrias
    const currentWithdrawals = parseFloat(cashRegister.totalWithdrawals || '0');
    await this.db
      .update(cashRegisters)
      .set({
        totalWithdrawals: (currentWithdrawals + data.amount).toString(),
        updatedAt: new Date(),
      })
      .where(eq(cashRegisters.id, cashRegisterId));

    return movement;
  }

  /**
   * Registra suprimento (entrada)
   */
  async deposit(
    cashRegisterId: string,
    data: CashMovementDto,
    currentUser: CurrentUser,
  ): Promise<CashMovement> {
    const cashRegister = await this.findById(cashRegisterId);
    if (!cashRegister) {
      throw new NotFoundException('Caixa nao encontrado');
    }

    if (cashRegister.status !== 'OPEN') {
      throw new BadRequestException('Caixa ja esta fechado');
    }

    // Cria movimento
    const [movement] = await this.db
      .insert(cashMovements)
      .values({
        cashRegisterId,
        type: 'DEPOSIT',
        amount: data.amount.toString(),
        reason: data.reason,
        performedById: currentUser.id,
      })
      .returning();

    // Atualiza total de suprimentos
    const currentDeposits = parseFloat(cashRegister.totalDeposits || '0');
    await this.db
      .update(cashRegisters)
      .set({
        totalDeposits: (currentDeposits + data.amount).toString(),
        updatedAt: new Date(),
      })
      .where(eq(cashRegisters.id, cashRegisterId));

    return movement;
  }

  /**
   * Lista movimentos de um caixa
   */
  async getMovements(cashRegisterId: string): Promise<CashMovement[]> {
    return this.db
      .select()
      .from(cashMovements)
      .where(eq(cashMovements.cashRegisterId, cashRegisterId))
      .orderBy(desc(cashMovements.performedAt));
  }

  /**
   * Histórico de caixas fechados
   */
  async getHistory(salonId: string, limit = 30): Promise<CashRegister[]> {
    return this.db
      .select()
      .from(cashRegisters)
      .where(
        and(
          eq(cashRegisters.salonId, salonId),
          eq(cashRegisters.status, 'CLOSED')
        )
      )
      .orderBy(desc(cashRegisters.closedAt))
      .limit(limit);
  }

  /**
   * Busca caixa por ID
   */
  async findById(id: string): Promise<CashRegister | null> {
    const result = await this.db
      .select()
      .from(cashRegisters)
      .where(eq(cashRegisters.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Atualiza totais do caixa ao receber pagamento
   * Chamado pelo CommandsService ao fechar comanda
   * ========== PROTEGIDO - AUDITORIA FINANCEIRA ==========
   * Se não existe caixa aberto, auto-abre um com saldo 0
   * para nunca perder o registro da venda.
   * ======================================================
   */
  async addSale(
    salonId: string,
    paymentMethod: string,
    amount: number,
    userId?: string,
  ): Promise<void> {
    let cashRegister = await this.getCurrent(salonId);
    if (!cashRegister) {
      if (!userId) {
        // Sem userId, não pode auto-abrir (openedById é NOT NULL)
        console.warn(`[addSale] Sem caixa aberto e sem userId para auto-abrir (salon=${salonId})`);
        return;
      }
      // Auto-abrir caixa para não perder a venda
      const [newRegister] = await this.db
        .insert(cashRegisters)
        .values({
          salonId,
          openingBalance: '0',
          openedById: userId,
          status: 'OPEN',
        })
        .returning();
      cashRegister = newRegister;
    }

    const currentSales = parseFloat(cashRegister.totalSales || '0');
    const currentCash = parseFloat(cashRegister.totalCash || '0');
    const currentCard = parseFloat(cashRegister.totalCard || '0');
    const currentPix = parseFloat(cashRegister.totalPix || '0');

    const updates: Record<string, string> = {
      totalSales: (currentSales + amount).toString(),
      updatedAt: new Date().toISOString(),
    };

    // Atualiza totais por método de pagamento
    if (paymentMethod === 'CASH') {
      updates.totalCash = (currentCash + amount).toString();
    } else if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD' || paymentMethod === 'CARD_CREDIT' || paymentMethod === 'CARD_DEBIT') {
      updates.totalCard = (currentCard + amount).toString();
    } else if (paymentMethod === 'PIX') {
      updates.totalPix = (currentPix + amount).toString();
    }

    await this.db
      .update(cashRegisters)
      .set(updates)
      .where(eq(cashRegisters.id, cashRegister.id));
  }
}
