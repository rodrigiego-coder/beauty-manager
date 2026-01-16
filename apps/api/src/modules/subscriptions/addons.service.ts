import { Injectable, Inject, NotFoundException, BadRequestException, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';

/**
 * Resultado do consumo de quota
 */
export interface ConsumeQuotaResult {
  success: boolean;
  source: 'INCLUDED' | 'EXTRA';
  periodYyyymm: number;
  ledgerId: string;
  remaining: {
    included: number;
    extra: number;
    total: number;
  };
}

/**
 * Erro de quota excedida
 */
export interface QuotaExceededError {
  code: 'QUOTA_EXCEEDED';
  message: string;
  needed: number;
  remaining: number;
  suggestedAction: 'buy_credit_or_upgrade';
  packageCode: string;
}

@Injectable()
export class AddonsService {
  private readonly logger = new Logger(AddonsService.name);

  constructor(
    @Inject('DATABASE_CONNECTION') private db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Retorna o período atual no formato YYYYMM
   */
  private getCurrentPeriod(): number {
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
      .where(eq(schema.addonCatalog.isActive, true));

    const creditPkgs = await this.db
      .select()
      .from(schema.creditPackages)
      .where(eq(schema.creditPackages.isActive, true));

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
  async getStatus(salonId: string) {
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
      .innerJoin(schema.addonCatalog, eq(schema.salonAddons.addonCode, schema.addonCatalog.code))
      .where(
        and(
          eq(schema.salonAddons.salonId, salonId),
          eq(schema.salonAddons.status, 'ACTIVE'),
        ),
      );

    // Garantir que existe registro de quota para o mês atual (upsert)
    let quotaRecord = await this.db
      .select()
      .from(schema.salonQuotas)
      .where(
        and(
          eq(schema.salonQuotas.salonId, salonId),
          eq(schema.salonQuotas.periodYyyymm, periodYyyymm),
        ),
      )
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
  async activateAddon(salonId: string, addonCode: string, userId: string) {
    // Validar se o add-on existe e está ativo
    const addon = await this.db
      .select()
      .from(schema.addonCatalog)
      .where(
        and(
          eq(schema.addonCatalog.code, addonCode),
          eq(schema.addonCatalog.isActive, true),
        ),
      )
      .limit(1);

    if (addon.length === 0) {
      throw new NotFoundException(`Add-on ${addonCode} não encontrado ou inativo`);
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
      .innerJoin(schema.addonCatalog, eq(schema.salonAddons.addonCode, schema.addonCatalog.code))
      .where(
        and(
          eq(schema.salonAddons.salonId, salonId),
          eq(schema.addonCatalog.family, addonData.family),
          eq(schema.salonAddons.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException(
        `Já existe um add-on ${addonData.family} ativo. Cancele o atual antes de ativar outro.`,
      );
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
      .where(
        and(
          eq(schema.salonQuotas.salonId, salonId),
          eq(schema.salonQuotas.periodYyyymm, periodYyyymm),
        ),
      )
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
    } else {
      await this.db
        .update(schema.salonQuotas)
        .set({
          whatsappIncluded: quotaRecord[0].whatsappIncluded + addonData.quotaAmount,
          updatedAt: now,
        })
        .where(eq(schema.salonQuotas.id, quotaRecord[0].id));
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
  async grantCredits(
    salonId: string,
    packageCode: string,
    qtyPackages: number,
    userId: string,
  ) {
    if (qtyPackages < 1 || qtyPackages > 100) {
      throw new BadRequestException('Quantidade de pacotes deve ser entre 1 e 100');
    }

    // Validar se o pacote existe e está ativo
    const pkg = await this.db
      .select()
      .from(schema.creditPackages)
      .where(
        and(
          eq(schema.creditPackages.code, packageCode),
          eq(schema.creditPackages.isActive, true),
        ),
      )
      .limit(1);

    if (pkg.length === 0) {
      throw new NotFoundException(`Pacote de crédito ${packageCode} não encontrado ou inativo`);
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
      .where(
        and(
          eq(schema.salonQuotas.salonId, salonId),
          eq(schema.salonQuotas.periodYyyymm, periodYyyymm),
        ),
      )
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
    } else {
      await this.db
        .update(schema.salonQuotas)
        .set({
          whatsappExtraPurchased: quotaRecord[0].whatsappExtraPurchased + totalQty,
          updatedAt: now,
        })
        .where(eq(schema.salonQuotas.id, quotaRecord[0].id));
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
  async consumeWhatsAppQuota(
    salonId: string,
    appointmentId: string,
    reason: string = 'APPOINTMENT_CONFIRMATION',
  ): Promise<ConsumeQuotaResult> {
    const periodYyyymm = this.getCurrentPeriod();
    const quotaType = 'WHATSAPP_APPOINTMENT';

    this.logger.debug(`[consumeQuota] salonId=${salonId}, appointmentId=${appointmentId}, period=${periodYyyymm}`);

    // 1. Verificar se já existe consumo para este appointment no período (idempotência)
    const existingConsume = await this.db
      .select()
      .from(schema.quotaLedger)
      .where(
        and(
          eq(schema.quotaLedger.salonId, salonId),
          eq(schema.quotaLedger.periodYyyymm, periodYyyymm),
          eq(schema.quotaLedger.eventType, 'CONSUME'),
          eq(schema.quotaLedger.refType, 'APPOINTMENT'),
          eq(schema.quotaLedger.refId, appointmentId),
        ),
      )
      .limit(1);

    if (existingConsume.length > 0) {
      this.logger.debug(`[consumeQuota] Já consumido anteriormente (idempotente): ledgerId=${existingConsume[0].id}`);

      // Buscar saldos atuais para retornar
      const quota = await this.getOrCreateQuotaRecord(salonId, periodYyyymm);
      const includedRemaining = Math.max(0, quota.whatsappIncluded - quota.whatsappUsed);
      const extraRemaining = Math.max(0, quota.whatsappExtraPurchased - quota.whatsappExtraUsed);

      return {
        success: true,
        source: (existingConsume[0].metadata as any)?.source || 'INCLUDED',
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
      const errorPayload: QuotaExceededError = {
        code: 'QUOTA_EXCEEDED',
        message: 'Quota de WhatsApp excedida. Adquira créditos extras ou faça upgrade do plano.',
        needed: 1,
        remaining: 0,
        suggestedAction: 'buy_credit_or_upgrade',
        packageCode: 'WHATSAPP_EXTRA_20',
      };

      this.logger.warn(`[consumeQuota] Quota excedida para salão ${salonId}`);
      throw new HttpException(errorPayload, HttpStatus.PAYMENT_REQUIRED);
    }

    // 5. Determinar fonte do consumo (INCLUDED primeiro, depois EXTRA)
    const source: 'INCLUDED' | 'EXTRA' = includedRemaining > 0 ? 'INCLUDED' : 'EXTRA';
    const now = new Date();

    // 6. Usar transação para garantir atomicidade
    try {
      const result = await this.db.transaction(async (tx) => {
        // 6a. Atualizar contadores em salon_quotas
        if (source === 'INCLUDED') {
          await tx
            .update(schema.salonQuotas)
            .set({
              whatsappUsed: sql`${schema.salonQuotas.whatsappUsed} + 1`,
              updatedAt: now,
            })
            .where(eq(schema.salonQuotas.id, quota.id));
        } else {
          await tx
            .update(schema.salonQuotas)
            .set({
              whatsappExtraUsed: sql`${schema.salonQuotas.whatsappExtraUsed} + 1`,
              updatedAt: now,
            })
            .where(eq(schema.salonQuotas.id, quota.id));
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
    } catch (error: any) {
      // Se for violação de constraint única (idempotência), não é erro real
      if (error.code === '23505') {
        this.logger.debug(`[consumeQuota] Consumo duplicado detectado pelo banco (idempotente)`);

        // Buscar o registro existente
        const existing = await this.db
          .select()
          .from(schema.quotaLedger)
          .where(
            and(
              eq(schema.quotaLedger.salonId, salonId),
              eq(schema.quotaLedger.periodYyyymm, periodYyyymm),
              eq(schema.quotaLedger.eventType, 'CONSUME'),
              eq(schema.quotaLedger.refType, 'APPOINTMENT'),
              eq(schema.quotaLedger.refId, appointmentId),
            ),
          )
          .limit(1);

        if (existing.length > 0) {
          const updatedQuota = await this.getOrCreateQuotaRecord(salonId, periodYyyymm);
          return {
            success: true,
            source: (existing[0].metadata as any)?.source || 'INCLUDED',
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
  private async getOrCreateQuotaRecord(salonId: string, periodYyyymm: number) {
    let quotaRecord = await this.db
      .select()
      .from(schema.salonQuotas)
      .where(
        and(
          eq(schema.salonQuotas.salonId, salonId),
          eq(schema.salonQuotas.periodYyyymm, periodYyyymm),
        ),
      )
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
}
