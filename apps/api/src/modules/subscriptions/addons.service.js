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
exports.AddonsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../../database/schema"));
let AddonsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AddonsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AddonsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        logger = new common_1.Logger(AddonsService.name);
        constructor(db) {
            this.db = db;
        }
        /**
         * Retorna o período atual no formato YYYYMM
         */
        getCurrentPeriod() {
            const now = new Date();
            return now.getFullYear() * 100 + (now.getMonth() + 1);
        }
        /**
         * GET /subscriptions/addons/catalog
         * Retorna o catálogo de add-ons e pacotes de crédito disponíveis
         */
        async getCatalog() {
            const addons = await this.db
                .select()
                .from(schema.addonCatalog)
                .where((0, drizzle_orm_1.eq)(schema.addonCatalog.isActive, true));
            const creditPkgs = await this.db
                .select()
                .from(schema.creditPackages)
                .where((0, drizzle_orm_1.eq)(schema.creditPackages.isActive, true));
            return {
                addons: addons.map(a => ({
                    code: a.code,
                    family: a.family,
                    tier: a.tier,
                    quotaType: a.quotaType,
                    quotaAmount: a.quotaAmount,
                    priceCents: a.priceCents,
                    priceFormatted: `R$ ${(a.priceCents / 100).toFixed(2).replace('.', ',')}`,
                })),
                creditPackages: creditPkgs.map(p => ({
                    code: p.code,
                    quotaType: p.quotaType,
                    qty: p.qty,
                    priceCents: p.priceCents,
                    priceFormatted: `R$ ${(p.priceCents / 100).toFixed(2).replace('.', ',')}`,
                })),
            };
        }
        /**
         * GET /subscriptions/addons/status
         * Retorna os add-ons ativos do salão e as quotas do mês atual
         */
        async getStatus(salonId) {
            const periodYyyymm = this.getCurrentPeriod();
            // Buscar add-ons ativos do salão
            const activeAddons = await this.db
                .select({
                id: schema.salonAddons.id,
                addonCode: schema.salonAddons.addonCode,
                status: schema.salonAddons.status,
                currentPeriodStart: schema.salonAddons.currentPeriodStart,
                currentPeriodEnd: schema.salonAddons.currentPeriodEnd,
                family: schema.addonCatalog.family,
                tier: schema.addonCatalog.tier,
                quotaAmount: schema.addonCatalog.quotaAmount,
                priceCents: schema.addonCatalog.priceCents,
            })
                .from(schema.salonAddons)
                .innerJoin(schema.addonCatalog, (0, drizzle_orm_1.eq)(schema.salonAddons.addonCode, schema.addonCatalog.code))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.salonAddons.salonId, salonId), (0, drizzle_orm_1.eq)(schema.salonAddons.status, 'ACTIVE')));
            // Garantir que existe registro de quota para o mês atual (upsert)
            let quotaRecord = await this.db
                .select()
                .from(schema.salonQuotas)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.salonQuotas.salonId, salonId), (0, drizzle_orm_1.eq)(schema.salonQuotas.periodYyyymm, periodYyyymm)))
                .limit(1);
            if (quotaRecord.length === 0) {
                // Criar registro de quota para o mês
                const inserted = await this.db
                    .insert(schema.salonQuotas)
                    .values({
                    salonId,
                    periodYyyymm,
                    whatsappIncluded: 0,
                    whatsappUsed: 0,
                    whatsappExtraPurchased: 0,
                    whatsappExtraUsed: 0,
                })
                    .returning();
                quotaRecord = inserted;
            }
            const quota = quotaRecord[0];
            // Calcular remaining
            const includedRemaining = Math.max(0, quota.whatsappIncluded - quota.whatsappUsed);
            const extraRemaining = Math.max(0, quota.whatsappExtraPurchased - quota.whatsappExtraUsed);
            const totalRemaining = includedRemaining + extraRemaining;
            return {
                periodYyyymm,
                addons: activeAddons.map(a => ({
                    id: a.id,
                    addonCode: a.addonCode,
                    status: a.status,
                    family: a.family,
                    tier: a.tier,
                    quotaAmount: a.quotaAmount,
                    priceCents: a.priceCents,
                    currentPeriodStart: a.currentPeriodStart,
                    currentPeriodEnd: a.currentPeriodEnd,
                })),
                quotas: {
                    whatsapp: {
                        included: quota.whatsappIncluded,
                        used: quota.whatsappUsed,
                        includedRemaining,
                        extraPurchased: quota.whatsappExtraPurchased,
                        extraUsed: quota.whatsappExtraUsed,
                        extraRemaining,
                        totalRemaining,
                    },
                },
            };
        }
        /**
         * POST /subscriptions/addons/activate
         * Ativa um add-on para o salão e adiciona quota do mês
         */
        async activateAddon(salonId, addonCode, userId) {
            // Validar se o add-on existe e está ativo
            const addon = await this.db
                .select()
                .from(schema.addonCatalog)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.addonCatalog.code, addonCode), (0, drizzle_orm_1.eq)(schema.addonCatalog.isActive, true)))
                .limit(1);
            if (addon.length === 0) {
                throw new common_1.NotFoundException(`Add-on ${addonCode} não encontrado ou inativo`);
            }
            const addonData = addon[0];
            const now = new Date();
            const periodYyyymm = this.getCurrentPeriod();
            // Calcular período (início do mês atual até fim do mês)
            const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            // Verificar se já existe add-on ativo desta família
            const existing = await this.db
                .select()
                .from(schema.salonAddons)
                .innerJoin(schema.addonCatalog, (0, drizzle_orm_1.eq)(schema.salonAddons.addonCode, schema.addonCatalog.code))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.salonAddons.salonId, salonId), (0, drizzle_orm_1.eq)(schema.addonCatalog.family, addonData.family), (0, drizzle_orm_1.eq)(schema.salonAddons.status, 'ACTIVE')))
                .limit(1);
            if (existing.length > 0) {
                throw new common_1.BadRequestException(`Já existe um add-on ${addonData.family} ativo. Cancele o atual antes de ativar outro.`);
            }
            // Criar registro de salon_addon
            const [salonAddon] = await this.db
                .insert(schema.salonAddons)
                .values({
                salonId,
                addonCode,
                status: 'ACTIVE',
                currentPeriodStart: periodStart,
                currentPeriodEnd: periodEnd,
            })
                .returning();
            // Upsert quota do mês e adicionar quota incluída
            let quotaRecord = await this.db
                .select()
                .from(schema.salonQuotas)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.salonQuotas.salonId, salonId), (0, drizzle_orm_1.eq)(schema.salonQuotas.periodYyyymm, periodYyyymm)))
                .limit(1);
            if (quotaRecord.length === 0) {
                await this.db.insert(schema.salonQuotas).values({
                    salonId,
                    periodYyyymm,
                    whatsappIncluded: addonData.quotaAmount,
                    whatsappUsed: 0,
                    whatsappExtraPurchased: 0,
                    whatsappExtraUsed: 0,
                });
            }
            else {
                await this.db
                    .update(schema.salonQuotas)
                    .set({
                    whatsappIncluded: quotaRecord[0].whatsappIncluded + addonData.quotaAmount,
                    updatedAt: now,
                })
                    .where((0, drizzle_orm_1.eq)(schema.salonQuotas.id, quotaRecord[0].id));
            }
            // Registrar no ledger
            await this.db.insert(schema.quotaLedger).values({
                salonId,
                periodYyyymm,
                eventType: 'GRANT',
                quotaType: addonData.quotaType,
                qty: addonData.quotaAmount,
                refType: 'ADDON_ACTIVATION',
                refId: salonAddon.id,
                metadata: {
                    addonCode,
                    activatedBy: userId,
                    periodStart: periodStart.toISOString(),
                    periodEnd: periodEnd.toISOString(),
                },
            });
            return {
                success: true,
                message: `Add-on ${addonCode} ativado com sucesso`,
                addon: salonAddon,
                quotaAdded: addonData.quotaAmount,
            };
        }
        /**
         * POST /subscriptions/credits/grant
         * Concede créditos extras ao salão (simulação de compra)
         */
        async grantCredits(salonId, packageCode, qtyPackages, userId) {
            if (qtyPackages < 1 || qtyPackages > 100) {
                throw new common_1.BadRequestException('Quantidade de pacotes deve ser entre 1 e 100');
            }
            // Validar se o pacote existe e está ativo
            const pkg = await this.db
                .select()
                .from(schema.creditPackages)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.creditPackages.code, packageCode), (0, drizzle_orm_1.eq)(schema.creditPackages.isActive, true)))
                .limit(1);
            if (pkg.length === 0) {
                throw new common_1.NotFoundException(`Pacote de crédito ${packageCode} não encontrado ou inativo`);
            }
            const pkgData = pkg[0];
            const totalQty = pkgData.qty * qtyPackages;
            const totalCents = pkgData.priceCents * qtyPackages;
            const periodYyyymm = this.getCurrentPeriod();
            const now = new Date();
            // Upsert quota do mês e adicionar extra purchased
            let quotaRecord = await this.db
                .select()
                .from(schema.salonQuotas)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.salonQuotas.salonId, salonId), (0, drizzle_orm_1.eq)(schema.salonQuotas.periodYyyymm, periodYyyymm)))
                .limit(1);
            if (quotaRecord.length === 0) {
                await this.db.insert(schema.salonQuotas).values({
                    salonId,
                    periodYyyymm,
                    whatsappIncluded: 0,
                    whatsappUsed: 0,
                    whatsappExtraPurchased: totalQty,
                    whatsappExtraUsed: 0,
                });
            }
            else {
                await this.db
                    .update(schema.salonQuotas)
                    .set({
                    whatsappExtraPurchased: quotaRecord[0].whatsappExtraPurchased + totalQty,
                    updatedAt: now,
                })
                    .where((0, drizzle_orm_1.eq)(schema.salonQuotas.id, quotaRecord[0].id));
            }
            // Registrar no ledger
            const [ledgerEntry] = await this.db
                .insert(schema.quotaLedger)
                .values({
                salonId,
                periodYyyymm,
                eventType: 'GRANT',
                quotaType: pkgData.quotaType,
                qty: totalQty,
                refType: 'MANUAL',
                refId: null,
                metadata: {
                    packageCode,
                    qtyPackages,
                    totalCents,
                    grantedBy: userId,
                    simulation: true,
                },
            })
                .returning();
            return {
                success: true,
                message: `${totalQty} créditos adicionados com sucesso`,
                packageCode,
                qtyPackages,
                totalQty,
                totalCents,
                totalFormatted: `R$ ${(totalCents / 100).toFixed(2).replace('.', ',')}`,
                ledgerId: ledgerEntry.id,
            };
        }
        /**
         * Consome 1 unidade de quota WhatsApp para um agendamento
         * IDEMPOTENTE: Se já foi consumido para este appointment no período, retorna sucesso sem consumir novamente
         *
         * Ordem de consumo:
         * 1. Primeiro tenta usar quota INCLUDED (do plano)
         * 2. Se não houver, tenta usar quota EXTRA (créditos comprados)
         * 3. Se não houver nenhuma, lança erro HTTP 402 (Payment Required)
         *
         * @param salonId - ID do salão
         * @param appointmentId - ID do agendamento (chave de idempotência)
         * @param reason - Motivo do consumo (para auditoria)
         * @returns ConsumeQuotaResult ou lança HttpException
         */
        async consumeWhatsAppQuota(salonId, appointmentId, reason = 'APPOINTMENT_CONFIRMATION') {
            const periodYyyymm = this.getCurrentPeriod();
            const quotaType = 'WHATSAPP_APPOINTMENT';
            this.logger.debug(`[consumeQuota] salonId=${salonId}, appointmentId=${appointmentId}, period=${periodYyyymm}`);
            // 1. Verificar se já existe consumo para este appointment no período (idempotência)
            const existingConsume = await this.db
                .select()
                .from(schema.quotaLedger)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.quotaLedger.salonId, salonId), (0, drizzle_orm_1.eq)(schema.quotaLedger.periodYyyymm, periodYyyymm), (0, drizzle_orm_1.eq)(schema.quotaLedger.eventType, 'CONSUME'), (0, drizzle_orm_1.eq)(schema.quotaLedger.refType, 'APPOINTMENT'), (0, drizzle_orm_1.eq)(schema.quotaLedger.refId, appointmentId)))
                .limit(1);
            if (existingConsume.length > 0) {
                this.logger.debug(`[consumeQuota] Já consumido anteriormente (idempotente): ledgerId=${existingConsume[0].id}`);
                // Buscar saldos atuais para retornar
                const quota = await this.getOrCreateQuotaRecord(salonId, periodYyyymm);
                const includedRemaining = Math.max(0, quota.whatsappIncluded - quota.whatsappUsed);
                const extraRemaining = Math.max(0, quota.whatsappExtraPurchased - quota.whatsappExtraUsed);
                return {
                    success: true,
                    source: existingConsume[0].metadata?.source || 'INCLUDED',
                    periodYyyymm,
                    ledgerId: existingConsume[0].id,
                    remaining: {
                        included: includedRemaining,
                        extra: extraRemaining,
                        total: includedRemaining + extraRemaining,
                    },
                };
            }
            // 2. Buscar ou criar registro de quota do mês
            const quota = await this.getOrCreateQuotaRecord(salonId, periodYyyymm);
            // 3. Calcular saldos disponíveis
            const includedRemaining = Math.max(0, quota.whatsappIncluded - quota.whatsappUsed);
            const extraRemaining = Math.max(0, quota.whatsappExtraPurchased - quota.whatsappExtraUsed);
            const totalRemaining = includedRemaining + extraRemaining;
            this.logger.debug(`[consumeQuota] Saldos: included=${includedRemaining}, extra=${extraRemaining}, total=${totalRemaining}`);
            // 4. Se não houver saldo, lançar erro
            if (totalRemaining <= 0) {
                const errorPayload = {
                    code: 'QUOTA_EXCEEDED',
                    message: 'Quota de WhatsApp excedida. Adquira créditos extras ou faça upgrade do plano.',
                    needed: 1,
                    remaining: 0,
                    suggestedAction: 'buy_credit_or_upgrade',
                    packageCode: 'WHATSAPP_EXTRA_20',
                };
                this.logger.warn(`[consumeQuota] Quota excedida para salão ${salonId}`);
                throw new common_1.HttpException(errorPayload, common_1.HttpStatus.PAYMENT_REQUIRED);
            }
            // 5. Determinar fonte do consumo (INCLUDED primeiro, depois EXTRA)
            const source = includedRemaining > 0 ? 'INCLUDED' : 'EXTRA';
            const now = new Date();
            // 6. Usar transação para garantir atomicidade
            try {
                const result = await this.db.transaction(async (tx) => {
                    // 6a. Atualizar contadores em salon_quotas
                    if (source === 'INCLUDED') {
                        await tx
                            .update(schema.salonQuotas)
                            .set({
                            whatsappUsed: (0, drizzle_orm_1.sql) `${schema.salonQuotas.whatsappUsed} + 1`,
                            updatedAt: now,
                        })
                            .where((0, drizzle_orm_1.eq)(schema.salonQuotas.id, quota.id));
                    }
                    else {
                        await tx
                            .update(schema.salonQuotas)
                            .set({
                            whatsappExtraUsed: (0, drizzle_orm_1.sql) `${schema.salonQuotas.whatsappExtraUsed} + 1`,
                            updatedAt: now,
                        })
                            .where((0, drizzle_orm_1.eq)(schema.salonQuotas.id, quota.id));
                    }
                    // 6b. Registrar no ledger (com constraint de idempotência no banco)
                    const [ledgerEntry] = await tx
                        .insert(schema.quotaLedger)
                        .values({
                        salonId,
                        periodYyyymm,
                        eventType: 'CONSUME',
                        quotaType,
                        qty: -1, // Negativo = consumo
                        refType: 'APPOINTMENT',
                        refId: appointmentId,
                        metadata: {
                            source,
                            reason,
                            consumedAt: now.toISOString(),
                        },
                    })
                        .returning();
                    return ledgerEntry;
                });
                // 7. Calcular saldos após consumo
                const newIncludedRemaining = source === 'INCLUDED' ? includedRemaining - 1 : includedRemaining;
                const newExtraRemaining = source === 'EXTRA' ? extraRemaining - 1 : extraRemaining;
                this.logger.log(`[consumeQuota] Consumido 1 quota ${source} para appointment ${appointmentId}. Novo saldo: ${newIncludedRemaining + newExtraRemaining}`);
                return {
                    success: true,
                    source,
                    periodYyyymm,
                    ledgerId: result.id,
                    remaining: {
                        included: newIncludedRemaining,
                        extra: newExtraRemaining,
                        total: newIncludedRemaining + newExtraRemaining,
                    },
                };
            }
            catch (error) {
                // Se for violação de constraint única (idempotência), não é erro real
                if (error.code === '23505') {
                    this.logger.debug(`[consumeQuota] Consumo duplicado detectado pelo banco (idempotente)`);
                    // Buscar o registro existente
                    const existing = await this.db
                        .select()
                        .from(schema.quotaLedger)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.quotaLedger.salonId, salonId), (0, drizzle_orm_1.eq)(schema.quotaLedger.periodYyyymm, periodYyyymm), (0, drizzle_orm_1.eq)(schema.quotaLedger.eventType, 'CONSUME'), (0, drizzle_orm_1.eq)(schema.quotaLedger.refType, 'APPOINTMENT'), (0, drizzle_orm_1.eq)(schema.quotaLedger.refId, appointmentId)))
                        .limit(1);
                    if (existing.length > 0) {
                        const updatedQuota = await this.getOrCreateQuotaRecord(salonId, periodYyyymm);
                        return {
                            success: true,
                            source: existing[0].metadata?.source || 'INCLUDED',
                            periodYyyymm,
                            ledgerId: existing[0].id,
                            remaining: {
                                included: Math.max(0, updatedQuota.whatsappIncluded - updatedQuota.whatsappUsed),
                                extra: Math.max(0, updatedQuota.whatsappExtraPurchased - updatedQuota.whatsappExtraUsed),
                                total: Math.max(0, updatedQuota.whatsappIncluded - updatedQuota.whatsappUsed) +
                                    Math.max(0, updatedQuota.whatsappExtraPurchased - updatedQuota.whatsappExtraUsed),
                            },
                        };
                    }
                }
                this.logger.error(`[consumeQuota] Erro ao consumir quota: ${error.message}`);
                throw error;
            }
        }
        /**
         * Busca ou cria registro de quota para o salão/período
         */
        async getOrCreateQuotaRecord(salonId, periodYyyymm) {
            let quotaRecord = await this.db
                .select()
                .from(schema.salonQuotas)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.salonQuotas.salonId, salonId), (0, drizzle_orm_1.eq)(schema.salonQuotas.periodYyyymm, periodYyyymm)))
                .limit(1);
            if (quotaRecord.length === 0) {
                const inserted = await this.db
                    .insert(schema.salonQuotas)
                    .values({
                    salonId,
                    periodYyyymm,
                    whatsappIncluded: 0,
                    whatsappUsed: 0,
                    whatsappExtraPurchased: 0,
                    whatsappExtraUsed: 0,
                })
                    .returning();
                quotaRecord = inserted;
            }
            return quotaRecord[0];
        }
    };
    return AddonsService = _classThis;
})();
exports.AddonsService = AddonsService;
//# sourceMappingURL=addons.service.js.map