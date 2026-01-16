import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';

@Injectable()
export class AddonsService {
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
}
