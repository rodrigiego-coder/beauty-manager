"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltyService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema = __importStar(require("../../database/schema"));
let LoyaltyService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var LoyaltyService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LoyaltyService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        // ==================== PROGRAM METHODS ====================
        async getProgram(salonId) {
            const [program] = await connection_1.db
                .select()
                .from(schema.loyaltyPrograms)
                .where((0, drizzle_orm_1.eq)(schema.loyaltyPrograms.salonId, salonId));
            return program || null;
        }
        async createProgram(salonId, dto) {
            const existing = await this.getProgram(salonId);
            if (existing) {
                throw new common_1.BadRequestException('Programa de fidelidade já existe para este salão');
            }
            const [program] = await connection_1.db
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
        async updateProgram(salonId, dto) {
            const existing = await this.getProgram(salonId);
            if (!existing) {
                throw new common_1.NotFoundException('Programa de fidelidade não encontrado');
            }
            const updateData = { updatedAt: new Date() };
            if (dto.name !== undefined)
                updateData.name = dto.name;
            if (dto.isActive !== undefined)
                updateData.isActive = dto.isActive;
            if (dto.pointsPerRealService !== undefined)
                updateData.pointsPerRealService = dto.pointsPerRealService.toString();
            if (dto.pointsPerRealProduct !== undefined)
                updateData.pointsPerRealProduct = dto.pointsPerRealProduct.toString();
            if (dto.pointsExpireDays !== undefined)
                updateData.pointsExpireDays = dto.pointsExpireDays;
            if (dto.minimumRedeemPoints !== undefined)
                updateData.minimumRedeemPoints = dto.minimumRedeemPoints;
            if (dto.welcomePoints !== undefined)
                updateData.welcomePoints = dto.welcomePoints;
            if (dto.birthdayPoints !== undefined)
                updateData.birthdayPoints = dto.birthdayPoints;
            if (dto.referralPoints !== undefined)
                updateData.referralPoints = dto.referralPoints;
            const [program] = await connection_1.db
                .update(schema.loyaltyPrograms)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema.loyaltyPrograms.salonId, salonId))
                .returning();
            return program;
        }
        async createDefaultTiers(programId) {
            const defaultTiers = [
                { name: 'Basic', code: 'BASIC', minPoints: 0, color: '#6B7280', pointsMultiplier: '1', sortOrder: 0, benefits: {} },
                { name: 'Silver', code: 'SILVER', minPoints: 500, color: '#9CA3AF', pointsMultiplier: '1.2', sortOrder: 1, benefits: { discountPercent: 5 } },
                { name: 'Gold', code: 'GOLD', minPoints: 2000, color: '#F59E0B', pointsMultiplier: '1.5', sortOrder: 2, benefits: { discountPercent: 10 } },
                { name: 'VIP', code: 'VIP', minPoints: 5000, color: '#8B5CF6', pointsMultiplier: '2', sortOrder: 3, benefits: { discountPercent: 15, priorityBooking: true } },
            ];
            for (const tier of defaultTiers) {
                await connection_1.db.insert(schema.loyaltyTiers).values({
                    programId,
                    ...tier,
                });
            }
        }
        // ==================== TIER METHODS ====================
        async listTiers(salonId) {
            const program = await this.getProgram(salonId);
            if (!program)
                return [];
            return connection_1.db
                .select()
                .from(schema.loyaltyTiers)
                .where((0, drizzle_orm_1.eq)(schema.loyaltyTiers.programId, program.id))
                .orderBy((0, drizzle_orm_1.asc)(schema.loyaltyTiers.sortOrder));
        }
        async createTier(salonId, dto) {
            const program = await this.getProgram(salonId);
            if (!program) {
                throw new common_1.NotFoundException('Programa de fidelidade não encontrado');
            }
            const [tier] = await connection_1.db
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
        async updateTier(salonId, tierId, dto) {
            const program = await this.getProgram(salonId);
            if (!program) {
                throw new common_1.NotFoundException('Programa de fidelidade não encontrado');
            }
            const updateData = { updatedAt: new Date() };
            if (dto.name !== undefined)
                updateData.name = dto.name;
            if (dto.minPoints !== undefined)
                updateData.minPoints = dto.minPoints;
            if (dto.color !== undefined)
                updateData.color = dto.color;
            if (dto.icon !== undefined)
                updateData.icon = dto.icon;
            if (dto.benefits !== undefined)
                updateData.benefits = dto.benefits;
            if (dto.pointsMultiplier !== undefined)
                updateData.pointsMultiplier = dto.pointsMultiplier.toString();
            if (dto.sortOrder !== undefined)
                updateData.sortOrder = dto.sortOrder;
            const [tier] = await connection_1.db
                .update(schema.loyaltyTiers)
                .set(updateData)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.loyaltyTiers.id, tierId), (0, drizzle_orm_1.eq)(schema.loyaltyTiers.programId, program.id)))
                .returning();
            if (!tier) {
                throw new common_1.NotFoundException('Nível não encontrado');
            }
            return tier;
        }
        async deleteTier(salonId, tierId) {
            const program = await this.getProgram(salonId);
            if (!program) {
                throw new common_1.NotFoundException('Programa de fidelidade não encontrado');
            }
            await connection_1.db
                .delete(schema.loyaltyTiers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.loyaltyTiers.id, tierId), (0, drizzle_orm_1.eq)(schema.loyaltyTiers.programId, program.id)));
        }
        // ==================== REWARD METHODS ====================
        async listRewards(salonId) {
            const program = await this.getProgram(salonId);
            if (!program)
                return [];
            const rewards = await connection_1.db
                .select({
                reward: schema.loyaltyRewards,
                productName: schema.products.name,
                serviceName: schema.services.name,
            })
                .from(schema.loyaltyRewards)
                .leftJoin(schema.products, (0, drizzle_orm_1.eq)(schema.loyaltyRewards.productId, schema.products.id))
                .leftJoin(schema.services, (0, drizzle_orm_1.eq)(schema.loyaltyRewards.serviceId, schema.services.id))
                .where((0, drizzle_orm_1.eq)(schema.loyaltyRewards.programId, program.id))
                .orderBy((0, drizzle_orm_1.asc)(schema.loyaltyRewards.pointsCost));
            return rewards.map(r => ({
                ...r.reward,
                productName: r.productName || undefined,
                serviceName: r.serviceName || undefined,
            }));
        }
        async createReward(salonId, dto) {
            const program = await this.getProgram(salonId);
            if (!program) {
                throw new common_1.NotFoundException('Programa de fidelidade não encontrado');
            }
            const [reward] = await connection_1.db
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
        async updateReward(salonId, rewardId, dto) {
            const updateData = { updatedAt: new Date() };
            if (dto.name !== undefined)
                updateData.name = dto.name;
            if (dto.description !== undefined)
                updateData.description = dto.description;
            if (dto.type !== undefined)
                updateData.type = dto.type;
            if (dto.pointsCost !== undefined)
                updateData.pointsCost = dto.pointsCost;
            if (dto.value !== undefined)
                updateData.value = dto.value.toString();
            if (dto.productId !== undefined)
                updateData.productId = dto.productId;
            if (dto.serviceId !== undefined)
                updateData.serviceId = dto.serviceId;
            if (dto.minTier !== undefined)
                updateData.minTier = dto.minTier;
            if (dto.maxRedemptionsPerClient !== undefined)
                updateData.maxRedemptionsPerClient = dto.maxRedemptionsPerClient;
            if (dto.totalAvailable !== undefined)
                updateData.totalAvailable = dto.totalAvailable;
            if (dto.validDays !== undefined)
                updateData.validDays = dto.validDays;
            if (dto.isActive !== undefined)
                updateData.isActive = dto.isActive;
            if (dto.imageUrl !== undefined)
                updateData.imageUrl = dto.imageUrl;
            const [reward] = await connection_1.db
                .update(schema.loyaltyRewards)
                .set(updateData)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.loyaltyRewards.id, rewardId), (0, drizzle_orm_1.eq)(schema.loyaltyRewards.salonId, salonId)))
                .returning();
            if (!reward) {
                throw new common_1.NotFoundException('Recompensa não encontrada');
            }
            return reward;
        }
        async deleteReward(salonId, rewardId) {
            await connection_1.db
                .update(schema.loyaltyRewards)
                .set({ isActive: false, updatedAt: new Date() })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.loyaltyRewards.id, rewardId), (0, drizzle_orm_1.eq)(schema.loyaltyRewards.salonId, salonId)));
        }
        // ==================== ACCOUNT METHODS ====================
        async getAccount(salonId, clientId) {
            const [result] = await connection_1.db
                .select({
                account: schema.clientLoyaltyAccounts,
                clientName: schema.clients.name,
                currentTier: schema.loyaltyTiers,
            })
                .from(schema.clientLoyaltyAccounts)
                .leftJoin(schema.clients, (0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.clientId, schema.clients.id))
                .leftJoin(schema.loyaltyTiers, (0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.currentTierId, schema.loyaltyTiers.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.salonId, salonId), (0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.clientId, clientId)));
            if (!result)
                return null;
            // Get next tier
            let nextTier = null;
            if (result.currentTier) {
                const [next] = await connection_1.db
                    .select()
                    .from(schema.loyaltyTiers)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.loyaltyTiers.programId, result.account.programId), (0, drizzle_orm_1.sql) `${schema.loyaltyTiers.minPoints} > ${result.currentTier.minPoints}`))
                    .orderBy((0, drizzle_orm_1.asc)(schema.loyaltyTiers.minPoints))
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
        async enrollClient(salonId, clientId, referralCode, userId) {
            const program = await this.getProgram(salonId);
            if (!program) {
                throw new common_1.NotFoundException('Programa de fidelidade não encontrado');
            }
            const existing = await this.getAccount(salonId, clientId);
            if (existing) {
                throw new common_1.BadRequestException('Cliente já está inscrito no programa');
            }
            // Get basic tier
            const [basicTier] = await connection_1.db
                .select()
                .from(schema.loyaltyTiers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.loyaltyTiers.programId, program.id), (0, drizzle_orm_1.eq)(schema.loyaltyTiers.code, 'BASIC')));
            // Generate referral code
            const code = this.generateReferralCode();
            // Check referral
            let referredById;
            if (referralCode) {
                const [referrer] = await connection_1.db
                    .select()
                    .from(schema.clientLoyaltyAccounts)
                    .where((0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.referralCode, referralCode));
                if (referrer) {
                    referredById = referrer.clientId;
                }
            }
            const [account] = await connection_1.db
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
                await this.addPoints(account.id, salonId, program.welcomePoints, 'WELCOME', 'Bônus de boas-vindas', userId, program.pointsExpireDays);
            }
            // Process referral bonus
            if (referredById && program.referralPoints > 0) {
                const [referrerAccount] = await connection_1.db
                    .select()
                    .from(schema.clientLoyaltyAccounts)
                    .where((0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.clientId, referredById));
                if (referrerAccount) {
                    await this.addPoints(referrerAccount.id, salonId, program.referralPoints, 'REFERRAL', 'Bônus por indicação', userId, program.pointsExpireDays);
                    // Log marketing event
                    await this.logMarketingEvent(salonId, referredById, 'REFERRAL_CONVERTED', {
                        newClientId: clientId,
                        points: program.referralPoints,
                    });
                }
            }
            return this.getAccount(salonId, clientId);
        }
        async getTransactions(salonId, clientId, limit = 50) {
            const account = await this.getAccount(salonId, clientId);
            if (!account) {
                throw new common_1.NotFoundException('Conta de fidelidade não encontrada');
            }
            return connection_1.db
                .select()
                .from(schema.loyaltyTransactions)
                .where((0, drizzle_orm_1.eq)(schema.loyaltyTransactions.accountId, account.id))
                .orderBy((0, drizzle_orm_1.desc)(schema.loyaltyTransactions.createdAt))
                .limit(limit);
        }
        async getAvailableRewards(salonId, clientId) {
            const account = await this.getAccount(salonId, clientId);
            if (!account) {
                throw new common_1.NotFoundException('Conta de fidelidade não encontrada');
            }
            const rewards = await this.listRewards(salonId);
            // Filter by active, available points, and tier
            return rewards.filter(reward => {
                if (!reward.isActive)
                    return false;
                if (reward.pointsCost > account.currentPoints)
                    return false;
                if (reward.minTier && account.currentTier) {
                    // Simple tier check - could be improved
                    const tierOrder = ['BASIC', 'SILVER', 'GOLD', 'VIP'];
                    const minTierIndex = tierOrder.indexOf(reward.minTier);
                    const currentTierIndex = tierOrder.indexOf(account.currentTier.code);
                    if (currentTierIndex < minTierIndex)
                        return false;
                }
                return true;
            });
        }
        async redeemReward(salonId, clientId, rewardId, userId) {
            const account = await this.getAccount(salonId, clientId);
            if (!account) {
                throw new common_1.NotFoundException('Conta de fidelidade não encontrada');
            }
            const [reward] = await connection_1.db
                .select()
                .from(schema.loyaltyRewards)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.loyaltyRewards.id, rewardId), (0, drizzle_orm_1.eq)(schema.loyaltyRewards.salonId, salonId)));
            if (!reward) {
                throw new common_1.NotFoundException('Recompensa não encontrada');
            }
            if (!reward.isActive) {
                throw new common_1.BadRequestException('Recompensa não está ativa');
            }
            if (account.currentPoints < reward.pointsCost) {
                throw new common_1.BadRequestException('Pontos insuficientes para resgatar esta recompensa');
            }
            // Check tier
            if (reward.minTier && account.currentTier) {
                const tierOrder = ['BASIC', 'SILVER', 'GOLD', 'VIP'];
                const minTierIndex = tierOrder.indexOf(reward.minTier);
                const currentTierIndex = tierOrder.indexOf(account.currentTier.code);
                if (currentTierIndex < minTierIndex) {
                    throw new common_1.BadRequestException('Nível insuficiente para resgatar esta recompensa');
                }
            }
            // Check redemption limit
            if (reward.maxRedemptionsPerClient) {
                const redemptionCount = await connection_1.db
                    .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                    .from(schema.loyaltyRedemptions)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.loyaltyRedemptions.accountId, account.id), (0, drizzle_orm_1.eq)(schema.loyaltyRedemptions.rewardId, rewardId)));
                if (redemptionCount[0].count >= reward.maxRedemptionsPerClient) {
                    throw new common_1.BadRequestException('Limite de resgates por cliente atingido');
                }
            }
            // Check availability
            if (reward.totalAvailable !== null && reward.totalAvailable <= 0) {
                throw new common_1.BadRequestException('Recompensa esgotada');
            }
            // Deduct points
            const transaction = await this.addPoints(account.id, salonId, -reward.pointsCost, 'REDEEM', `Resgate: ${reward.name}`, userId, null, rewardId);
            // Calculate expiration
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + reward.validDays);
            // Create redemption
            const voucherCode = this.generateVoucherCode();
            const [redemption] = await connection_1.db
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
                await connection_1.db
                    .update(schema.loyaltyRewards)
                    .set({ totalAvailable: reward.totalAvailable - 1 })
                    .where((0, drizzle_orm_1.eq)(schema.loyaltyRewards.id, rewardId));
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
        async adjustPoints(salonId, clientId, dto, userId) {
            const account = await this.getAccount(salonId, clientId);
            if (!account) {
                throw new common_1.NotFoundException('Conta de fidelidade não encontrada');
            }
            await this.addPoints(account.id, salonId, dto.points, 'ADJUST', dto.description, userId);
            return this.getAccount(salonId, clientId);
        }
        // ==================== VOUCHER METHODS ====================
        async validateVoucher(salonId, code) {
            const [redemption] = await connection_1.db
                .select({
                redemption: schema.loyaltyRedemptions,
                reward: schema.loyaltyRewards,
                account: schema.clientLoyaltyAccounts,
            })
                .from(schema.loyaltyRedemptions)
                .innerJoin(schema.loyaltyRewards, (0, drizzle_orm_1.eq)(schema.loyaltyRedemptions.rewardId, schema.loyaltyRewards.id))
                .innerJoin(schema.clientLoyaltyAccounts, (0, drizzle_orm_1.eq)(schema.loyaltyRedemptions.accountId, schema.clientLoyaltyAccounts.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.loyaltyRedemptions.code, code), (0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.salonId, salonId)));
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
        async useVoucher(salonId, code, commandId) {
            const validation = await this.validateVoucher(salonId, code);
            if (!validation.valid) {
                throw new common_1.BadRequestException(validation.error);
            }
            await connection_1.db
                .update(schema.loyaltyRedemptions)
                .set({
                status: 'USED',
                usedAt: new Date(),
                usedInCommandId: commandId,
            })
                .where((0, drizzle_orm_1.eq)(schema.loyaltyRedemptions.code, code));
        }
        // ==================== POINTS METHODS ====================
        async addPoints(accountId, salonId, points, type, description, userId, expireDays, rewardId, commandId, appointmentId) {
            // Get current balance
            const [account] = await connection_1.db
                .select()
                .from(schema.clientLoyaltyAccounts)
                .where((0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.id, accountId));
            if (!account) {
                throw new common_1.NotFoundException('Conta não encontrada');
            }
            const newBalance = account.currentPoints + points;
            const newTotalEarned = points > 0 ? account.totalPointsEarned + points : account.totalPointsEarned;
            const newTotalRedeemed = points < 0 ? account.totalPointsRedeemed + Math.abs(points) : account.totalPointsRedeemed;
            // Calculate expiration
            let expiresAt;
            if (expireDays && points > 0) {
                expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + expireDays);
            }
            // Create transaction
            const [transaction] = await connection_1.db
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
            await connection_1.db
                .update(schema.clientLoyaltyAccounts)
                .set({
                currentPoints: newBalance,
                totalPointsEarned: newTotalEarned,
                totalPointsRedeemed: newTotalRedeemed,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.id, accountId));
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
            }
            else if (type === 'REDEEM') {
                await this.logMarketingEvent(salonId, account.clientId, 'POINTS_REDEEMED', {
                    points: Math.abs(points),
                    rewardId,
                });
            }
            return transaction;
        }
        async calculatePointsForCommand(salonId, commandId) {
            const program = await this.getProgram(salonId);
            if (!program || !program.isActive) {
                return { servicePoints: 0, productPoints: 0, bonusPoints: 0, total: 0, multiplier: 1 };
            }
            // Get command with items
            const [command] = await connection_1.db
                .select()
                .from(schema.commands)
                .where((0, drizzle_orm_1.eq)(schema.commands.id, commandId));
            if (!command || !command.clientId) {
                return { servicePoints: 0, productPoints: 0, bonusPoints: 0, total: 0, multiplier: 1 };
            }
            // Get client account for multiplier
            const account = await this.getAccount(salonId, command.clientId);
            const multiplier = account?.currentTier ? parseFloat(account.currentTier.pointsMultiplier) : 1;
            // Get items
            const items = await connection_1.db
                .select()
                .from(schema.commandItems)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.commandItems.commandId, commandId), (0, drizzle_orm_1.sql) `${schema.commandItems.canceledAt} IS NULL`));
            let servicePoints = 0;
            let productPoints = 0;
            for (const item of items) {
                const itemValue = parseFloat(item.totalPrice);
                if (item.type === 'SERVICE') {
                    servicePoints += Math.floor(itemValue * parseFloat(program.pointsPerRealService));
                }
                else if (item.type === 'PRODUCT') {
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
        async processCommandPoints(salonId, commandId, clientId, userId) {
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
                await this.addPoints(account.id, salonId, pointsResult.total, 'EARN', description, userId, program.pointsExpireDays, undefined, commandId);
                // Get updated account to check tier
                const updatedAccount = await this.getAccount(salonId, clientId);
                const tierUpgraded = updatedAccount?.currentTier?.id !== oldTierId;
                return {
                    pointsEarned: pointsResult.total,
                    newTotal: updatedAccount?.currentPoints || 0,
                    tierUpgraded,
                    newTierName: tierUpgraded ? updatedAccount?.currentTier?.name : undefined,
                };
            }
            catch (error) {
                console.error('Error processing loyalty points:', error);
                return { pointsEarned: 0, newTotal: 0, tierUpgraded: false };
            }
        }
        async checkTierUpgrade(accountId, salonId, totalPoints) {
            const [account] = await connection_1.db
                .select()
                .from(schema.clientLoyaltyAccounts)
                .where((0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.id, accountId));
            if (!account)
                return;
            // Get all tiers ordered by minPoints desc
            const tiers = await connection_1.db
                .select()
                .from(schema.loyaltyTiers)
                .where((0, drizzle_orm_1.eq)(schema.loyaltyTiers.programId, account.programId))
                .orderBy((0, drizzle_orm_1.desc)(schema.loyaltyTiers.minPoints));
            // Find appropriate tier
            const newTier = tiers.find(t => totalPoints >= t.minPoints);
            if (!newTier || newTier.id === account.currentTierId)
                return;
            // Update account
            await connection_1.db
                .update(schema.clientLoyaltyAccounts)
                .set({
                currentTierId: newTier.id,
                tierAchievedAt: new Date(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.id, accountId));
            // Log marketing event
            await this.logMarketingEvent(salonId, account.clientId, 'TIER_UPGRADED', {
                newTierId: newTier.id,
                newTierName: newTier.name,
                totalPoints,
            });
        }
        // ==================== STATS METHODS ====================
        async getStats(salonId) {
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
            const [enrolledResult] = await connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema.clientLoyaltyAccounts)
                .where((0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.salonId, salonId));
            // Points in circulation
            const [pointsResult] = await connection_1.db
                .select({ total: (0, drizzle_orm_1.sql) `COALESCE(sum(current_points), 0)` })
                .from(schema.clientLoyaltyAccounts)
                .where((0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.salonId, salonId));
            // Points this month
            const [monthlyStats] = await connection_1.db
                .select({
                earned: (0, drizzle_orm_1.sql) `COALESCE(sum(case when points > 0 then points else 0 end), 0)`,
                redeemed: (0, drizzle_orm_1.sql) `COALESCE(sum(case when points < 0 then abs(points) else 0 end), 0)`,
            })
                .from(schema.loyaltyTransactions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.loyaltyTransactions.salonId, salonId), (0, drizzle_orm_1.gte)(schema.loyaltyTransactions.createdAt, startOfMonth)));
            // Redemptions this month
            const [redemptionsResult] = await connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema.loyaltyRedemptions)
                .innerJoin(schema.clientLoyaltyAccounts, (0, drizzle_orm_1.eq)(schema.loyaltyRedemptions.accountId, schema.clientLoyaltyAccounts.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.salonId, salonId), (0, drizzle_orm_1.gte)(schema.loyaltyRedemptions.createdAt, startOfMonth)));
            // Tier distribution
            const tierDistribution = await connection_1.db
                .select({
                tierId: schema.loyaltyTiers.id,
                tierName: schema.loyaltyTiers.name,
                tierColor: schema.loyaltyTiers.color,
                count: (0, drizzle_orm_1.sql) `count(${schema.clientLoyaltyAccounts.id})`,
            })
                .from(schema.clientLoyaltyAccounts)
                .leftJoin(schema.loyaltyTiers, (0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.currentTierId, schema.loyaltyTiers.id))
                .where((0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.salonId, salonId))
                .groupBy(schema.loyaltyTiers.id, schema.loyaltyTiers.name, schema.loyaltyTiers.color);
            // Top rewards
            const topRewards = await connection_1.db
                .select({
                rewardId: schema.loyaltyRewards.id,
                rewardName: schema.loyaltyRewards.name,
                redemptionCount: (0, drizzle_orm_1.sql) `count(${schema.loyaltyRedemptions.id})`,
            })
                .from(schema.loyaltyRedemptions)
                .innerJoin(schema.loyaltyRewards, (0, drizzle_orm_1.eq)(schema.loyaltyRedemptions.rewardId, schema.loyaltyRewards.id))
                .where((0, drizzle_orm_1.eq)(schema.loyaltyRewards.salonId, salonId))
                .groupBy(schema.loyaltyRewards.id, schema.loyaltyRewards.name)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `count(${schema.loyaltyRedemptions.id})`))
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
        async getLeaderboard(salonId, limit = 10) {
            const results = await connection_1.db
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
                .leftJoin(schema.clients, (0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.clientId, schema.clients.id))
                .leftJoin(schema.loyaltyTiers, (0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.currentTierId, schema.loyaltyTiers.id))
                .where((0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.salonId, salonId))
                .orderBy((0, drizzle_orm_1.desc)(schema.clientLoyaltyAccounts.totalPointsEarned))
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
        generateReferralCode() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 8; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        }
        generateVoucherCode() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = 'V-';
            for (let i = 0; i < 8; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        }
        async logMarketingEvent(salonId, clientId, type, context, value) {
            await connection_1.db.insert(schema.marketingEvents).values({
                salonId,
                clientId,
                type,
                context,
                value: value?.toString(),
            });
        }
        // ==================== REFERRAL METHODS ====================
        async getReferralInfo(salonId, code) {
            const [result] = await connection_1.db
                .select({
                clientId: schema.clientLoyaltyAccounts.clientId,
                clientName: schema.clients.name,
            })
                .from(schema.clientLoyaltyAccounts)
                .leftJoin(schema.clients, (0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.clientId, schema.clients.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.salonId, salonId), (0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.referralCode, code)));
            if (!result)
                return null;
            return { clientId: result.clientId, clientName: result.clientName || 'Cliente' };
        }
        // ==================== EXPIRATION JOB ====================
        async processExpiredPoints(salonId) {
            const now = new Date();
            // Find transactions with expired points
            const expiredTransactions = await connection_1.db
                .select({
                transaction: schema.loyaltyTransactions,
                account: schema.clientLoyaltyAccounts,
            })
                .from(schema.loyaltyTransactions)
                .innerJoin(schema.clientLoyaltyAccounts, (0, drizzle_orm_1.eq)(schema.loyaltyTransactions.accountId, schema.clientLoyaltyAccounts.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.loyaltyTransactions.salonId, salonId), (0, drizzle_orm_1.eq)(schema.loyaltyTransactions.type, 'EARN'), (0, drizzle_orm_1.lt)(schema.loyaltyTransactions.expiresAt, now), (0, drizzle_orm_1.sql) `NOT EXISTS (
          SELECT 1 FROM loyalty_transactions lt2
          WHERE lt2.account_id = ${schema.loyaltyTransactions.accountId}
          AND lt2.type = 'EXPIRE'
          AND lt2.description LIKE '%' || ${schema.loyaltyTransactions.id}::text || '%'
        )`));
            let expiredCount = 0;
            for (const { transaction, account } of expiredTransactions) {
                // Only expire points that haven't been used yet
                const pointsToExpire = Math.min(transaction.points, account.currentPoints);
                if (pointsToExpire > 0) {
                    await this.addPoints(account.id, salonId, -pointsToExpire, 'EXPIRE', `Pontos expirados (ref: ${transaction.id})`);
                    expiredCount++;
                }
            }
            return expiredCount;
        }
        // ==================== BIRTHDAY JOB ====================
        async processBirthdayPoints(salonId) {
            const program = await this.getProgram(salonId);
            if (!program || !program.isActive || program.birthdayPoints <= 0) {
                return 0;
            }
            const today = new Date();
            const monthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            // Find clients with birthday today who have loyalty accounts
            const birthdayClients = await connection_1.db
                .select({
                account: schema.clientLoyaltyAccounts,
                client: schema.clients,
            })
                .from(schema.clientLoyaltyAccounts)
                .innerJoin(schema.clients, (0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.clientId, schema.clients.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientLoyaltyAccounts.salonId, salonId), (0, drizzle_orm_1.sql) `to_char(${schema.clients.birthDate}::date, 'MM-DD') = ${monthDay}`));
            let processedCount = 0;
            for (const { account } of birthdayClients) {
                // Check if birthday points already given this year
                const thisYear = today.getFullYear();
                const [existing] = await connection_1.db
                    .select()
                    .from(schema.loyaltyTransactions)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.loyaltyTransactions.accountId, account.id), (0, drizzle_orm_1.eq)(schema.loyaltyTransactions.type, 'BIRTHDAY'), (0, drizzle_orm_1.sql) `extract(year from ${schema.loyaltyTransactions.createdAt}) = ${thisYear}`));
                if (!existing) {
                    await this.addPoints(account.id, salonId, program.birthdayPoints, 'BIRTHDAY', 'Parabéns pelo seu aniversário!', undefined, program.pointsExpireDays);
                    processedCount++;
                }
            }
            return processedCount;
        }
    };
    return LoyaltyService = _classThis;
})();
exports.LoyaltyService = LoyaltyService;
//# sourceMappingURL=loyalty.service.js.map