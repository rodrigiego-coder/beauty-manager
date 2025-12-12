import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, desc, gte, sql, asc, lt } from 'drizzle-orm';
import { db } from '../../database/connection';
import * as schema from '../../database/schema';
import {
  CreateProgramDto,
  UpdateProgramDto,
  CreateTierDto,
  UpdateTierDto,
  CreateRewardDto,
  UpdateRewardDto,
  AdjustPointsDto,
  ProgramResponse,
  TierResponse,
  RewardResponse,
  AccountResponse,
  TransactionResponse,
  RedemptionResponse,
  VoucherValidationResponse,
  LoyaltyStats,
  LeaderboardEntry,
} from './dto';

@Injectable()
export class LoyaltyService {
  // ==================== PROGRAM METHODS ====================

  async getProgram(salonId: string): Promise<ProgramResponse | null> {
    const [program] = await db
      .select()
      .from(schema.loyaltyPrograms)
      .where(eq(schema.loyaltyPrograms.salonId, salonId));
    return program || null;
  }

  async createProgram(salonId: string, dto: CreateProgramDto): Promise<ProgramResponse> {
    const existing = await this.getProgram(salonId);
    if (existing) {
      throw new BadRequestException('Programa de fidelidade já existe para este salão');
    }

    const [program] = await db
      .insert(schema.loyaltyPrograms)
      .values({
        salonId,
        name: dto.name || 'Programa de Fidelidade',
        pointsPerRealService: dto.pointsPerRealService?.toString() || '1',
        pointsPerRealProduct: dto.pointsPerRealProduct?.toString() || '1',
        pointsExpireDays: dto.pointsExpireDays,
        minimumRedeemPoints: dto.minimumRedeemPoints || 100,
        welcomePoints: dto.welcomePoints || 0,
        birthdayPoints: dto.birthdayPoints || 0,
        referralPoints: dto.referralPoints || 0,
      })
      .returning();

    // Create default tiers
    await this.createDefaultTiers(program.id);

    return program;
  }

  async updateProgram(salonId: string, dto: UpdateProgramDto): Promise<ProgramResponse> {
    const existing = await this.getProgram(salonId);
    if (!existing) {
      throw new NotFoundException('Programa de fidelidade não encontrado');
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.pointsPerRealService !== undefined) updateData.pointsPerRealService = dto.pointsPerRealService.toString();
    if (dto.pointsPerRealProduct !== undefined) updateData.pointsPerRealProduct = dto.pointsPerRealProduct.toString();
    if (dto.pointsExpireDays !== undefined) updateData.pointsExpireDays = dto.pointsExpireDays;
    if (dto.minimumRedeemPoints !== undefined) updateData.minimumRedeemPoints = dto.minimumRedeemPoints;
    if (dto.welcomePoints !== undefined) updateData.welcomePoints = dto.welcomePoints;
    if (dto.birthdayPoints !== undefined) updateData.birthdayPoints = dto.birthdayPoints;
    if (dto.referralPoints !== undefined) updateData.referralPoints = dto.referralPoints;

    const [program] = await db
      .update(schema.loyaltyPrograms)
      .set(updateData)
      .where(eq(schema.loyaltyPrograms.salonId, salonId))
      .returning();

    return program;
  }

  private async createDefaultTiers(programId: string): Promise<void> {
    const defaultTiers = [
      { name: 'Basic', code: 'BASIC', minPoints: 0, color: '#6B7280', pointsMultiplier: '1', sortOrder: 0, benefits: {} },
      { name: 'Silver', code: 'SILVER', minPoints: 500, color: '#9CA3AF', pointsMultiplier: '1.2', sortOrder: 1, benefits: { discountPercent: 5 } },
      { name: 'Gold', code: 'GOLD', minPoints: 2000, color: '#F59E0B', pointsMultiplier: '1.5', sortOrder: 2, benefits: { discountPercent: 10 } },
      { name: 'VIP', code: 'VIP', minPoints: 5000, color: '#8B5CF6', pointsMultiplier: '2', sortOrder: 3, benefits: { discountPercent: 15, priorityBooking: true } },
    ];

    for (const tier of defaultTiers) {
      await db.insert(schema.loyaltyTiers).values({
        programId,
        ...tier,
      });
    }
  }

  // ==================== TIER METHODS ====================

  async listTiers(salonId: string): Promise<TierResponse[]> {
    const program = await this.getProgram(salonId);
    if (!program) return [];

    return db
      .select()
      .from(schema.loyaltyTiers)
      .where(eq(schema.loyaltyTiers.programId, program.id))
      .orderBy(asc(schema.loyaltyTiers.sortOrder));
  }

  async createTier(salonId: string, dto: CreateTierDto): Promise<TierResponse> {
    const program = await this.getProgram(salonId);
    if (!program) {
      throw new NotFoundException('Programa de fidelidade não encontrado');
    }

    const [tier] = await db
      .insert(schema.loyaltyTiers)
      .values({
        programId: program.id,
        name: dto.name,
        code: dto.code,
        minPoints: dto.minPoints,
        color: dto.color || '#6B7280',
        icon: dto.icon,
        benefits: dto.benefits || {},
        pointsMultiplier: dto.pointsMultiplier?.toString() || '1',
        sortOrder: dto.sortOrder || 0,
      })
      .returning();

    return tier;
  }

  async updateTier(salonId: string, tierId: string, dto: UpdateTierDto): Promise<TierResponse> {
    const program = await this.getProgram(salonId);
    if (!program) {
      throw new NotFoundException('Programa de fidelidade não encontrado');
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.minPoints !== undefined) updateData.minPoints = dto.minPoints;
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.benefits !== undefined) updateData.benefits = dto.benefits;
    if (dto.pointsMultiplier !== undefined) updateData.pointsMultiplier = dto.pointsMultiplier.toString();
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;

    const [tier] = await db
      .update(schema.loyaltyTiers)
      .set(updateData)
      .where(and(
        eq(schema.loyaltyTiers.id, tierId),
        eq(schema.loyaltyTiers.programId, program.id)
      ))
      .returning();

    if (!tier) {
      throw new NotFoundException('Nível não encontrado');
    }

    return tier;
  }

  async deleteTier(salonId: string, tierId: string): Promise<void> {
    const program = await this.getProgram(salonId);
    if (!program) {
      throw new NotFoundException('Programa de fidelidade não encontrado');
    }

    await db
      .delete(schema.loyaltyTiers)
      .where(and(
        eq(schema.loyaltyTiers.id, tierId),
        eq(schema.loyaltyTiers.programId, program.id)
      ));
  }

  // ==================== REWARD METHODS ====================

  async listRewards(salonId: string): Promise<RewardResponse[]> {
    const program = await this.getProgram(salonId);
    if (!program) return [];

    const rewards = await db
      .select({
        reward: schema.loyaltyRewards,
        productName: schema.products.name,
        serviceName: schema.services.name,
      })
      .from(schema.loyaltyRewards)
      .leftJoin(schema.products, eq(schema.loyaltyRewards.productId, schema.products.id))
      .leftJoin(schema.services, eq(schema.loyaltyRewards.serviceId, schema.services.id))
      .where(eq(schema.loyaltyRewards.programId, program.id))
      .orderBy(asc(schema.loyaltyRewards.pointsCost));

    return rewards.map(r => ({
      ...r.reward,
      productName: r.productName || undefined,
      serviceName: r.serviceName || undefined,
    }));
  }

  async createReward(salonId: string, dto: CreateRewardDto): Promise<RewardResponse> {
    const program = await this.getProgram(salonId);
    if (!program) {
      throw new NotFoundException('Programa de fidelidade não encontrado');
    }

    const [reward] = await db
      .insert(schema.loyaltyRewards)
      .values({
        salonId,
        programId: program.id,
        name: dto.name,
        description: dto.description,
        type: dto.type,
        pointsCost: dto.pointsCost,
        value: dto.value?.toString(),
        productId: dto.productId,
        serviceId: dto.serviceId,
        minTier: dto.minTier,
        maxRedemptionsPerClient: dto.maxRedemptionsPerClient,
        totalAvailable: dto.totalAvailable,
        validDays: dto.validDays || 30,
        imageUrl: dto.imageUrl,
      })
      .returning();

    return reward;
  }

  async updateReward(salonId: string, rewardId: string, dto: UpdateRewardDto): Promise<RewardResponse> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.pointsCost !== undefined) updateData.pointsCost = dto.pointsCost;
    if (dto.value !== undefined) updateData.value = dto.value.toString();
    if (dto.productId !== undefined) updateData.productId = dto.productId;
    if (dto.serviceId !== undefined) updateData.serviceId = dto.serviceId;
    if (dto.minTier !== undefined) updateData.minTier = dto.minTier;
    if (dto.maxRedemptionsPerClient !== undefined) updateData.maxRedemptionsPerClient = dto.maxRedemptionsPerClient;
    if (dto.totalAvailable !== undefined) updateData.totalAvailable = dto.totalAvailable;
    if (dto.validDays !== undefined) updateData.validDays = dto.validDays;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;

    const [reward] = await db
      .update(schema.loyaltyRewards)
      .set(updateData)
      .where(and(
        eq(schema.loyaltyRewards.id, rewardId),
        eq(schema.loyaltyRewards.salonId, salonId)
      ))
      .returning();

    if (!reward) {
      throw new NotFoundException('Recompensa não encontrada');
    }

    return reward;
  }

  async deleteReward(salonId: string, rewardId: string): Promise<void> {
    await db
      .update(schema.loyaltyRewards)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(
        eq(schema.loyaltyRewards.id, rewardId),
        eq(schema.loyaltyRewards.salonId, salonId)
      ));
  }

  // ==================== ACCOUNT METHODS ====================

  async getAccount(salonId: string, clientId: string): Promise<AccountResponse | null> {
    const [result] = await db
      .select({
        account: schema.clientLoyaltyAccounts,
        clientName: schema.clients.name,
        currentTier: schema.loyaltyTiers,
      })
      .from(schema.clientLoyaltyAccounts)
      .leftJoin(schema.clients, eq(schema.clientLoyaltyAccounts.clientId, schema.clients.id))
      .leftJoin(schema.loyaltyTiers, eq(schema.clientLoyaltyAccounts.currentTierId, schema.loyaltyTiers.id))
      .where(and(
        eq(schema.clientLoyaltyAccounts.salonId, salonId),
        eq(schema.clientLoyaltyAccounts.clientId, clientId)
      ));

    if (!result) return null;

    // Get next tier
    let nextTier: TierResponse | null = null;
    if (result.currentTier) {
      const [next] = await db
        .select()
        .from(schema.loyaltyTiers)
        .where(and(
          eq(schema.loyaltyTiers.programId, result.account.programId),
          sql`${schema.loyaltyTiers.minPoints} > ${result.currentTier.minPoints}`
        ))
        .orderBy(asc(schema.loyaltyTiers.minPoints))
        .limit(1);
      nextTier = next || null;
    }

    return {
      ...result.account,
      clientName: result.clientName || undefined,
      currentTier: result.currentTier || undefined,
      nextTier,
    };
  }

  async enrollClient(salonId: string, clientId: string, referralCode?: string, userId?: string): Promise<AccountResponse> {
    const program = await this.getProgram(salonId);
    if (!program) {
      throw new NotFoundException('Programa de fidelidade não encontrado');
    }

    const existing = await this.getAccount(salonId, clientId);
    if (existing) {
      throw new BadRequestException('Cliente já está inscrito no programa');
    }

    // Get basic tier
    const [basicTier] = await db
      .select()
      .from(schema.loyaltyTiers)
      .where(and(
        eq(schema.loyaltyTiers.programId, program.id),
        eq(schema.loyaltyTiers.code, 'BASIC')
      ));

    // Generate referral code
    const code = this.generateReferralCode();

    // Check referral
    let referredById: string | undefined;
    if (referralCode) {
      const [referrer] = await db
        .select()
        .from(schema.clientLoyaltyAccounts)
        .where(eq(schema.clientLoyaltyAccounts.referralCode, referralCode));
      if (referrer) {
        referredById = referrer.clientId;
      }
    }

    const [account] = await db
      .insert(schema.clientLoyaltyAccounts)
      .values({
        salonId,
        clientId,
        programId: program.id,
        currentTierId: basicTier?.id,
        tierAchievedAt: new Date(),
        referralCode: code,
        referredById,
      })
      .returning();

    // Add welcome points
    if (program.welcomePoints > 0) {
      await this.addPoints(
        account.id,
        salonId,
        program.welcomePoints,
        'WELCOME',
        'Bônus de boas-vindas',
        userId,
        program.pointsExpireDays
      );
    }

    // Process referral bonus
    if (referredById && program.referralPoints > 0) {
      const [referrerAccount] = await db
        .select()
        .from(schema.clientLoyaltyAccounts)
        .where(eq(schema.clientLoyaltyAccounts.clientId, referredById));

      if (referrerAccount) {
        await this.addPoints(
          referrerAccount.id,
          salonId,
          program.referralPoints,
          'REFERRAL',
          'Bônus por indicação',
          userId,
          program.pointsExpireDays
        );

        // Log marketing event
        await this.logMarketingEvent(salonId, referredById, 'REFERRAL_CONVERTED', {
          newClientId: clientId,
          points: program.referralPoints,
        });
      }
    }

    return this.getAccount(salonId, clientId) as Promise<AccountResponse>;
  }

  async getTransactions(salonId: string, clientId: string, limit = 50): Promise<TransactionResponse[]> {
    const account = await this.getAccount(salonId, clientId);
    if (!account) {
      throw new NotFoundException('Conta de fidelidade não encontrada');
    }

    return db
      .select()
      .from(schema.loyaltyTransactions)
      .where(eq(schema.loyaltyTransactions.accountId, account.id))
      .orderBy(desc(schema.loyaltyTransactions.createdAt))
      .limit(limit);
  }

  async getAvailableRewards(salonId: string, clientId: string): Promise<RewardResponse[]> {
    const account = await this.getAccount(salonId, clientId);
    if (!account) {
      throw new NotFoundException('Conta de fidelidade não encontrada');
    }

    const rewards = await this.listRewards(salonId);

    // Filter by active, available points, and tier
    return rewards.filter(reward => {
      if (!reward.isActive) return false;
      if (reward.pointsCost > account.currentPoints) return false;
      if (reward.minTier && account.currentTier) {
        // Simple tier check - could be improved
        const tierOrder = ['BASIC', 'SILVER', 'GOLD', 'VIP'];
        const minTierIndex = tierOrder.indexOf(reward.minTier);
        const currentTierIndex = tierOrder.indexOf(account.currentTier.code);
        if (currentTierIndex < minTierIndex) return false;
      }
      return true;
    });
  }

  async redeemReward(salonId: string, clientId: string, rewardId: string, userId?: string): Promise<RedemptionResponse> {
    const account = await this.getAccount(salonId, clientId);
    if (!account) {
      throw new NotFoundException('Conta de fidelidade não encontrada');
    }

    const [reward] = await db
      .select()
      .from(schema.loyaltyRewards)
      .where(and(
        eq(schema.loyaltyRewards.id, rewardId),
        eq(schema.loyaltyRewards.salonId, salonId)
      ));

    if (!reward) {
      throw new NotFoundException('Recompensa não encontrada');
    }

    if (!reward.isActive) {
      throw new BadRequestException('Recompensa não está ativa');
    }

    if (account.currentPoints < reward.pointsCost) {
      throw new BadRequestException('Pontos insuficientes para resgatar esta recompensa');
    }

    // Check tier
    if (reward.minTier && account.currentTier) {
      const tierOrder = ['BASIC', 'SILVER', 'GOLD', 'VIP'];
      const minTierIndex = tierOrder.indexOf(reward.minTier);
      const currentTierIndex = tierOrder.indexOf(account.currentTier.code);
      if (currentTierIndex < minTierIndex) {
        throw new BadRequestException('Nível insuficiente para resgatar esta recompensa');
      }
    }

    // Check redemption limit
    if (reward.maxRedemptionsPerClient) {
      const redemptionCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.loyaltyRedemptions)
        .where(and(
          eq(schema.loyaltyRedemptions.accountId, account.id),
          eq(schema.loyaltyRedemptions.rewardId, rewardId)
        ));

      if (redemptionCount[0].count >= reward.maxRedemptionsPerClient) {
        throw new BadRequestException('Limite de resgates por cliente atingido');
      }
    }

    // Check availability
    if (reward.totalAvailable !== null && reward.totalAvailable <= 0) {
      throw new BadRequestException('Recompensa esgotada');
    }

    // Deduct points
    const transaction = await this.addPoints(
      account.id,
      salonId,
      -reward.pointsCost,
      'REDEEM',
      `Resgate: ${reward.name}`,
      userId,
      null,
      rewardId
    );

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + reward.validDays);

    // Create redemption
    const voucherCode = this.generateVoucherCode();
    const [redemption] = await db
      .insert(schema.loyaltyRedemptions)
      .values({
        accountId: account.id,
        rewardId,
        transactionId: transaction.id,
        pointsSpent: reward.pointsCost,
        code: voucherCode,
        expiresAt,
      })
      .returning();

    // Decrement availability
    if (reward.totalAvailable !== null) {
      await db
        .update(schema.loyaltyRewards)
        .set({ totalAvailable: reward.totalAvailable - 1 })
        .where(eq(schema.loyaltyRewards.id, rewardId));
    }

    // Log marketing event
    await this.logMarketingEvent(salonId, clientId, 'REWARD_CLAIMED', {
      rewardId,
      rewardName: reward.name,
      pointsSpent: reward.pointsCost,
    });

    return {
      ...redemption,
      rewardName: reward.name,
      rewardType: reward.type,
      rewardValue: reward.value,
    };
  }

  async adjustPoints(salonId: string, clientId: string, dto: AdjustPointsDto, userId: string): Promise<AccountResponse> {
    const account = await this.getAccount(salonId, clientId);
    if (!account) {
      throw new NotFoundException('Conta de fidelidade não encontrada');
    }

    await this.addPoints(
      account.id,
      salonId,
      dto.points,
      'ADJUST',
      dto.description,
      userId
    );

    return this.getAccount(salonId, clientId) as Promise<AccountResponse>;
  }

  // ==================== VOUCHER METHODS ====================

  async validateVoucher(salonId: string, code: string): Promise<VoucherValidationResponse> {
    const [redemption] = await db
      .select({
        redemption: schema.loyaltyRedemptions,
        reward: schema.loyaltyRewards,
        account: schema.clientLoyaltyAccounts,
      })
      .from(schema.loyaltyRedemptions)
      .innerJoin(schema.loyaltyRewards, eq(schema.loyaltyRedemptions.rewardId, schema.loyaltyRewards.id))
      .innerJoin(schema.clientLoyaltyAccounts, eq(schema.loyaltyRedemptions.accountId, schema.clientLoyaltyAccounts.id))
      .where(and(
        eq(schema.loyaltyRedemptions.code, code),
        eq(schema.clientLoyaltyAccounts.salonId, salonId)
      ));

    if (!redemption) {
      return { valid: false, error: 'Voucher não encontrado' };
    }

    if (redemption.redemption.status !== 'PENDING') {
      return { valid: false, error: `Voucher já foi ${redemption.redemption.status === 'USED' ? 'utilizado' : 'expirado ou cancelado'}` };
    }

    if (new Date() > redemption.redemption.expiresAt) {
      return { valid: false, error: 'Voucher expirado' };
    }

    return {
      valid: true,
      voucher: {
        ...redemption.redemption,
        reward: redemption.reward,
      },
    };
  }

  async useVoucher(salonId: string, code: string, commandId: string): Promise<void> {
    const validation = await this.validateVoucher(salonId, code);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    await db
      .update(schema.loyaltyRedemptions)
      .set({
        status: 'USED',
        usedAt: new Date(),
        usedInCommandId: commandId,
      })
      .where(eq(schema.loyaltyRedemptions.code, code));
  }

  // ==================== POINTS METHODS ====================

  async addPoints(
    accountId: string,
    salonId: string,
    points: number,
    type: string,
    description: string,
    userId?: string,
    expireDays?: number | null,
    rewardId?: string,
    commandId?: string,
    appointmentId?: string
  ): Promise<TransactionResponse> {
    // Get current balance
    const [account] = await db
      .select()
      .from(schema.clientLoyaltyAccounts)
      .where(eq(schema.clientLoyaltyAccounts.id, accountId));

    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    const newBalance = account.currentPoints + points;
    const newTotalEarned = points > 0 ? account.totalPointsEarned + points : account.totalPointsEarned;
    const newTotalRedeemed = points < 0 ? account.totalPointsRedeemed + Math.abs(points) : account.totalPointsRedeemed;

    // Calculate expiration
    let expiresAt: Date | undefined;
    if (expireDays && points > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expireDays);
    }

    // Create transaction
    const [transaction] = await db
      .insert(schema.loyaltyTransactions)
      .values({
        accountId,
        salonId,
        type,
        points,
        balance: newBalance,
        description,
        commandId,
        appointmentId,
        rewardId,
        expiresAt,
        createdById: userId,
      })
      .returning();

    // Update account
    await db
      .update(schema.clientLoyaltyAccounts)
      .set({
        currentPoints: newBalance,
        totalPointsEarned: newTotalEarned,
        totalPointsRedeemed: newTotalRedeemed,
        updatedAt: new Date(),
      })
      .where(eq(schema.clientLoyaltyAccounts.id, accountId));

    // Check tier upgrade if points earned
    if (points > 0) {
      await this.checkTierUpgrade(accountId, salonId, newTotalEarned);
    }

    // Log marketing event
    if (points > 0) {
      await this.logMarketingEvent(salonId, account.clientId, 'POINTS_EARNED', {
        points,
        type,
        description,
      });
    } else if (type === 'REDEEM') {
      await this.logMarketingEvent(salonId, account.clientId, 'POINTS_REDEEMED', {
        points: Math.abs(points),
        rewardId,
      });
    }

    return transaction;
  }

  async calculatePointsForCommand(salonId: string, commandId: string): Promise<{ servicePoints: number; productPoints: number; bonusPoints: number; total: number; multiplier: number }> {
    const program = await this.getProgram(salonId);
    if (!program || !program.isActive) {
      return { servicePoints: 0, productPoints: 0, bonusPoints: 0, total: 0, multiplier: 1 };
    }

    // Get command with items
    const [command] = await db
      .select()
      .from(schema.commands)
      .where(eq(schema.commands.id, commandId));

    if (!command || !command.clientId) {
      return { servicePoints: 0, productPoints: 0, bonusPoints: 0, total: 0, multiplier: 1 };
    }

    // Get client account for multiplier
    const account = await this.getAccount(salonId, command.clientId);
    const multiplier = account?.currentTier ? parseFloat(account.currentTier.pointsMultiplier) : 1;

    // Get items
    const items = await db
      .select()
      .from(schema.commandItems)
      .where(and(
        eq(schema.commandItems.commandId, commandId),
        sql`${schema.commandItems.canceledAt} IS NULL`
      ));

    let servicePoints = 0;
    let productPoints = 0;

    for (const item of items) {
      const itemValue = parseFloat(item.totalPrice);
      if (item.type === 'SERVICE') {
        servicePoints += Math.floor(itemValue * parseFloat(program.pointsPerRealService));
      } else if (item.type === 'PRODUCT') {
        productPoints += Math.floor(itemValue * parseFloat(program.pointsPerRealProduct));
      }
    }

    // Apply multiplier
    const basePoints = servicePoints + productPoints;
    const bonusPoints = Math.floor(basePoints * (multiplier - 1));
    const total = basePoints + bonusPoints;

    return { servicePoints, productPoints, bonusPoints, total, multiplier };
  }

  /**
   * Processa pontos de fidelidade ao fechar uma comanda
   * Retorna o total de pontos ganhos ou 0 se não aplicável
   */
  async processCommandPoints(
    salonId: string,
    commandId: string,
    clientId: string,
    userId?: string
  ): Promise<{ pointsEarned: number; newTotal: number; tierUpgraded: boolean; newTierName?: string }> {
    try {
      // Verify program is active
      const program = await this.getProgram(salonId);
      if (!program || !program.isActive) {
        return { pointsEarned: 0, newTotal: 0, tierUpgraded: false };
      }

      // Get client account
      const account = await this.getAccount(salonId, clientId);
      if (!account) {
        return { pointsEarned: 0, newTotal: 0, tierUpgraded: false };
      }

      // Calculate points
      const pointsResult = await this.calculatePointsForCommand(salonId, commandId);
      if (pointsResult.total === 0) {
        return { pointsEarned: 0, newTotal: account.currentPoints, tierUpgraded: false };
      }

      // Get current tier before adding points
      const oldTierId = account.currentTier?.id;

      // Add points
      const description = pointsResult.bonusPoints > 0
        ? `Compra: ${pointsResult.servicePoints + pointsResult.productPoints} pts + ${pointsResult.bonusPoints} bônus (${pointsResult.multiplier}x)`
        : `Compra: ${pointsResult.total} pts`;

      await this.addPoints(
        account.id,
        salonId,
        pointsResult.total,
        'EARN',
        description,
        userId,
        program.pointsExpireDays,
        undefined,
        commandId
      );

      // Get updated account to check tier
      const updatedAccount = await this.getAccount(salonId, clientId);
      const tierUpgraded = updatedAccount?.currentTier?.id !== oldTierId;

      return {
        pointsEarned: pointsResult.total,
        newTotal: updatedAccount?.currentPoints || 0,
        tierUpgraded,
        newTierName: tierUpgraded ? updatedAccount?.currentTier?.name : undefined,
      };
    } catch (error) {
      console.error('Error processing loyalty points:', error);
      return { pointsEarned: 0, newTotal: 0, tierUpgraded: false };
    }
  }

  async checkTierUpgrade(accountId: string, salonId: string, totalPoints: number): Promise<void> {
    const [account] = await db
      .select()
      .from(schema.clientLoyaltyAccounts)
      .where(eq(schema.clientLoyaltyAccounts.id, accountId));

    if (!account) return;

    // Get all tiers ordered by minPoints desc
    const tiers = await db
      .select()
      .from(schema.loyaltyTiers)
      .where(eq(schema.loyaltyTiers.programId, account.programId))
      .orderBy(desc(schema.loyaltyTiers.minPoints));

    // Find appropriate tier
    const newTier = tiers.find(t => totalPoints >= t.minPoints);
    if (!newTier || newTier.id === account.currentTierId) return;

    // Update account
    await db
      .update(schema.clientLoyaltyAccounts)
      .set({
        currentTierId: newTier.id,
        tierAchievedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.clientLoyaltyAccounts.id, accountId));

    // Log marketing event
    await this.logMarketingEvent(salonId, account.clientId, 'TIER_UPGRADED', {
      newTierId: newTier.id,
      newTierName: newTier.name,
      totalPoints,
    });
  }

  // ==================== STATS METHODS ====================

  async getStats(salonId: string): Promise<LoyaltyStats> {
    const program = await this.getProgram(salonId);
    if (!program) {
      return {
        totalEnrolledClients: 0,
        pointsInCirculation: 0,
        pointsEarnedThisMonth: 0,
        pointsRedeemedThisMonth: 0,
        redemptionsThisMonth: 0,
        revenueInfluenced: 0,
        tierDistribution: [],
        topRewards: [],
      };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total enrolled
    const [enrolledResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.clientLoyaltyAccounts)
      .where(eq(schema.clientLoyaltyAccounts.salonId, salonId));

    // Points in circulation
    const [pointsResult] = await db
      .select({ total: sql<number>`COALESCE(sum(current_points), 0)` })
      .from(schema.clientLoyaltyAccounts)
      .where(eq(schema.clientLoyaltyAccounts.salonId, salonId));

    // Points this month
    const [monthlyStats] = await db
      .select({
        earned: sql<number>`COALESCE(sum(case when points > 0 then points else 0 end), 0)`,
        redeemed: sql<number>`COALESCE(sum(case when points < 0 then abs(points) else 0 end), 0)`,
      })
      .from(schema.loyaltyTransactions)
      .where(and(
        eq(schema.loyaltyTransactions.salonId, salonId),
        gte(schema.loyaltyTransactions.createdAt, startOfMonth)
      ));

    // Redemptions this month
    const [redemptionsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.loyaltyRedemptions)
      .innerJoin(schema.clientLoyaltyAccounts, eq(schema.loyaltyRedemptions.accountId, schema.clientLoyaltyAccounts.id))
      .where(and(
        eq(schema.clientLoyaltyAccounts.salonId, salonId),
        gte(schema.loyaltyRedemptions.createdAt, startOfMonth)
      ));

    // Tier distribution
    const tierDistribution = await db
      .select({
        tierId: schema.loyaltyTiers.id,
        tierName: schema.loyaltyTiers.name,
        tierColor: schema.loyaltyTiers.color,
        count: sql<number>`count(${schema.clientLoyaltyAccounts.id})`,
      })
      .from(schema.clientLoyaltyAccounts)
      .leftJoin(schema.loyaltyTiers, eq(schema.clientLoyaltyAccounts.currentTierId, schema.loyaltyTiers.id))
      .where(eq(schema.clientLoyaltyAccounts.salonId, salonId))
      .groupBy(schema.loyaltyTiers.id, schema.loyaltyTiers.name, schema.loyaltyTiers.color);

    // Top rewards
    const topRewards = await db
      .select({
        rewardId: schema.loyaltyRewards.id,
        rewardName: schema.loyaltyRewards.name,
        redemptionCount: sql<number>`count(${schema.loyaltyRedemptions.id})`,
      })
      .from(schema.loyaltyRedemptions)
      .innerJoin(schema.loyaltyRewards, eq(schema.loyaltyRedemptions.rewardId, schema.loyaltyRewards.id))
      .where(eq(schema.loyaltyRewards.salonId, salonId))
      .groupBy(schema.loyaltyRewards.id, schema.loyaltyRewards.name)
      .orderBy(desc(sql`count(${schema.loyaltyRedemptions.id})`))
      .limit(5);

    return {
      totalEnrolledClients: Number(enrolledResult.count),
      pointsInCirculation: Number(pointsResult.total),
      pointsEarnedThisMonth: Number(monthlyStats.earned),
      pointsRedeemedThisMonth: Number(monthlyStats.redeemed),
      redemptionsThisMonth: Number(redemptionsResult.count),
      revenueInfluenced: 0, // Would need more complex calculation
      tierDistribution: tierDistribution.map(t => ({
        tierId: t.tierId || '',
        tierName: t.tierName || 'Sem nível',
        tierColor: t.tierColor || '#6B7280',
        count: Number(t.count),
      })),
      topRewards: topRewards.map(r => ({
        rewardId: r.rewardId,
        rewardName: r.rewardName,
        redemptionCount: Number(r.redemptionCount),
      })),
    };
  }

  async getLeaderboard(salonId: string, limit = 10): Promise<LeaderboardEntry[]> {
    const results = await db
      .select({
        clientId: schema.clientLoyaltyAccounts.clientId,
        clientName: schema.clients.name,
        currentPoints: schema.clientLoyaltyAccounts.currentPoints,
        totalPointsEarned: schema.clientLoyaltyAccounts.totalPointsEarned,
        tierId: schema.loyaltyTiers.id,
        tierName: schema.loyaltyTiers.name,
        tierColor: schema.loyaltyTiers.color,
      })
      .from(schema.clientLoyaltyAccounts)
      .leftJoin(schema.clients, eq(schema.clientLoyaltyAccounts.clientId, schema.clients.id))
      .leftJoin(schema.loyaltyTiers, eq(schema.clientLoyaltyAccounts.currentTierId, schema.loyaltyTiers.id))
      .where(eq(schema.clientLoyaltyAccounts.salonId, salonId))
      .orderBy(desc(schema.clientLoyaltyAccounts.totalPointsEarned))
      .limit(limit);

    return results.map((r, index) => ({
      clientId: r.clientId,
      clientName: r.clientName || 'Cliente',
      currentPoints: r.currentPoints,
      totalPointsEarned: r.totalPointsEarned,
      tierId: r.tierId,
      tierName: r.tierName,
      tierColor: r.tierColor,
      rank: index + 1,
    }));
  }

  // ==================== HELPER METHODS ====================

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private generateVoucherCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'V-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private async logMarketingEvent(
    salonId: string,
    clientId: string | null,
    type: string,
    context: Record<string, unknown>,
    value?: number
  ): Promise<void> {
    await db.insert(schema.marketingEvents).values({
      salonId,
      clientId,
      type,
      context,
      value: value?.toString(),
    });
  }

  // ==================== REFERRAL METHODS ====================

  async getReferralInfo(salonId: string, code: string): Promise<{ clientName: string; clientId: string } | null> {
    const [result] = await db
      .select({
        clientId: schema.clientLoyaltyAccounts.clientId,
        clientName: schema.clients.name,
      })
      .from(schema.clientLoyaltyAccounts)
      .leftJoin(schema.clients, eq(schema.clientLoyaltyAccounts.clientId, schema.clients.id))
      .where(and(
        eq(schema.clientLoyaltyAccounts.salonId, salonId),
        eq(schema.clientLoyaltyAccounts.referralCode, code)
      ));

    if (!result) return null;
    return { clientId: result.clientId, clientName: result.clientName || 'Cliente' };
  }

  // ==================== EXPIRATION JOB ====================

  async processExpiredPoints(salonId: string): Promise<number> {
    const now = new Date();

    // Find transactions with expired points
    const expiredTransactions = await db
      .select({
        transaction: schema.loyaltyTransactions,
        account: schema.clientLoyaltyAccounts,
      })
      .from(schema.loyaltyTransactions)
      .innerJoin(schema.clientLoyaltyAccounts, eq(schema.loyaltyTransactions.accountId, schema.clientLoyaltyAccounts.id))
      .where(and(
        eq(schema.loyaltyTransactions.salonId, salonId),
        eq(schema.loyaltyTransactions.type, 'EARN'),
        lt(schema.loyaltyTransactions.expiresAt, now),
        sql`NOT EXISTS (
          SELECT 1 FROM loyalty_transactions lt2
          WHERE lt2.account_id = ${schema.loyaltyTransactions.accountId}
          AND lt2.type = 'EXPIRE'
          AND lt2.description LIKE '%' || ${schema.loyaltyTransactions.id}::text || '%'
        )`
      ));

    let expiredCount = 0;
    for (const { transaction, account } of expiredTransactions) {
      // Only expire points that haven't been used yet
      const pointsToExpire = Math.min(transaction.points, account.currentPoints);
      if (pointsToExpire > 0) {
        await this.addPoints(
          account.id,
          salonId,
          -pointsToExpire,
          'EXPIRE',
          `Pontos expirados (ref: ${transaction.id})`
        );
        expiredCount++;
      }
    }

    return expiredCount;
  }

  // ==================== BIRTHDAY JOB ====================

  async processBirthdayPoints(salonId: string): Promise<number> {
    const program = await this.getProgram(salonId);
    if (!program || !program.isActive || program.birthdayPoints <= 0) {
      return 0;
    }

    const today = new Date();
    const monthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Find clients with birthday today who have loyalty accounts
    const birthdayClients = await db
      .select({
        account: schema.clientLoyaltyAccounts,
        client: schema.clients,
      })
      .from(schema.clientLoyaltyAccounts)
      .innerJoin(schema.clients, eq(schema.clientLoyaltyAccounts.clientId, schema.clients.id))
      .where(and(
        eq(schema.clientLoyaltyAccounts.salonId, salonId),
        sql`to_char(${schema.clients.birthDate}::date, 'MM-DD') = ${monthDay}`
      ));

    let processedCount = 0;
    for (const { account } of birthdayClients) {
      // Check if birthday points already given this year
      const thisYear = today.getFullYear();
      const [existing] = await db
        .select()
        .from(schema.loyaltyTransactions)
        .where(and(
          eq(schema.loyaltyTransactions.accountId, account.id),
          eq(schema.loyaltyTransactions.type, 'BIRTHDAY'),
          sql`extract(year from ${schema.loyaltyTransactions.createdAt}) = ${thisYear}`
        ));

      if (!existing) {
        await this.addPoints(
          account.id,
          salonId,
          program.birthdayPoints,
          'BIRTHDAY',
          'Parabéns pelo seu aniversário!',
          undefined,
          program.pointsExpireDays
        );
        processedCount++;
      }
    }

    return processedCount;
  }
}
