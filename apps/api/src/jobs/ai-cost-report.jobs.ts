import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { db } from '../database/connection';
import { aiUsageLogs, salons } from '../database/schema';
import { eq, gte, sql } from 'drizzle-orm';

/**
 * =====================================================
 * AI COST REPORT JOB
 * Gera relatório semanal de custos do Gemini
 * Roda toda segunda-feira às 8h
 * =====================================================
 */

interface WeeklyReport {
  salonId: string;
  salonName: string;
  period: { start: Date; end: Date };
  totalRequests: number;
  textRequests: number;
  audioRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUSD: number;
  totalCostBRL: number;
  avgLatencyMs: number;
}

@Injectable()
export class AiCostReportJobs {
  private readonly logger = new Logger(AiCostReportJobs.name);

  // Cotação aproximada USD/BRL (atualizar conforme necessário)
  private readonly USD_TO_BRL = 5.0;

  /**
   * Relatório semanal - Segunda às 8h
   */
  @Cron('0 8 * * 1') // Monday at 8am
  async generateWeeklyReport(): Promise<void> {
    this.logger.log('📊 Iniciando relatório semanal de custos da IA...');

    try {
      const report = await this.buildReport(7);

      if (report) {
        this.logReport(report, 'SEMANAL');
      } else {
        this.logger.log('📊 Nenhum uso de IA registrado na última semana.');
      }
    } catch (error: any) {
      this.logger.error(`Erro ao gerar relatório semanal: ${error?.message}`);
    }
  }

  /**
   * Relatório diário - Todo dia às 23h59
   */
  @Cron('59 23 * * *') // Every day at 23:59
  async generateDailyReport(): Promise<void> {
    this.logger.log('📊 Iniciando relatório diário de custos da IA...');

    try {
      const report = await this.buildReport(1);

      if (report) {
        this.logReport(report, 'DIÁRIO');
      }
    } catch (error: any) {
      this.logger.error(`Erro ao gerar relatório diário: ${error?.message}`);
    }
  }

  /**
   * Constrói o relatório de uso
   */
  private async buildReport(days: number): Promise<WeeklyReport | null> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Busca uso agregado
    const usageData = await db
      .select({
        salonId: aiUsageLogs.salonId,
        requestType: aiUsageLogs.requestType,
        totalRequests: sql<number>`COUNT(*)::int`,
        totalInputTokens: sql<number>`COALESCE(SUM(${aiUsageLogs.inputTokens}), 0)::int`,
        totalOutputTokens: sql<number>`COALESCE(SUM(${aiUsageLogs.outputTokens}), 0)::int`,
        totalCostUSD: sql<number>`COALESCE(SUM(${aiUsageLogs.costUsd}::numeric), 0)::float`,
        avgLatencyMs: sql<number>`COALESCE(AVG(${aiUsageLogs.latencyMs}), 0)::int`,
      })
      .from(aiUsageLogs)
      .where(gte(aiUsageLogs.createdAt, startDate))
      .groupBy(aiUsageLogs.salonId, aiUsageLogs.requestType);

    if (usageData.length === 0) {
      return null;
    }

    // Agrega por salão
    const salonStats = new Map<string, {
      textRequests: number;
      audioRequests: number;
      totalInputTokens: number;
      totalOutputTokens: number;
      totalCostUSD: number;
      avgLatencyMs: number;
    }>();

    for (const row of usageData) {
      const existing = salonStats.get(row.salonId) || {
        textRequests: 0,
        audioRequests: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCostUSD: 0,
        avgLatencyMs: 0,
      };

      if (row.requestType === 'text') {
        existing.textRequests = row.totalRequests;
      } else if (row.requestType === 'audio') {
        existing.audioRequests = row.totalRequests;
      }

      existing.totalInputTokens += row.totalInputTokens;
      existing.totalOutputTokens += row.totalOutputTokens;
      existing.totalCostUSD += row.totalCostUSD;
      existing.avgLatencyMs = Math.max(existing.avgLatencyMs, row.avgLatencyMs);

      salonStats.set(row.salonId, existing);
    }

    // Busca nome do salão (pega o primeiro)
    const firstSalonId = usageData[0]?.salonId;
    let salonName = 'Salão';

    if (firstSalonId) {
      const [salon] = await db
        .select({ name: salons.name })
        .from(salons)
        .where(eq(salons.id, firstSalonId))
        .limit(1);
      salonName = salon?.name || 'Salão';
    }

    // Totaliza
    let totalRequests = 0;
    let textRequests = 0;
    let audioRequests = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCostUSD = 0;

    for (const stats of salonStats.values()) {
      totalRequests += stats.textRequests + stats.audioRequests;
      textRequests += stats.textRequests;
      audioRequests += stats.audioRequests;
      totalInputTokens += stats.totalInputTokens;
      totalOutputTokens += stats.totalOutputTokens;
      totalCostUSD += stats.totalCostUSD;
    }

    return {
      salonId: firstSalonId,
      salonName,
      period: { start: startDate, end: endDate },
      totalRequests,
      textRequests,
      audioRequests,
      totalInputTokens,
      totalOutputTokens,
      totalCostUSD,
      totalCostBRL: totalCostUSD * this.USD_TO_BRL,
      avgLatencyMs: Math.round(totalRequests > 0 ? usageData[0].avgLatencyMs : 0),
    };
  }

  /**
   * Loga o relatório formatado
   */
  private logReport(report: WeeklyReport, tipo: string): void {
    const startStr = report.period.start.toLocaleDateString('pt-BR');
    const endStr = report.period.end.toLocaleDateString('pt-BR');

    this.logger.log(`
╔══════════════════════════════════════════════════════════════╗
║          📊 RELATÓRIO ${tipo} DE CUSTOS - ALEXIA IA          ║
╠══════════════════════════════════════════════════════════════╣
║  Salão: ${report.salonName.padEnd(47)}║
║  Período: ${startStr} a ${endStr}                           ║
╠══════════════════════════════════════════════════════════════╣
║  📨 REQUISIÇÕES                                              ║
║     Total: ${String(report.totalRequests).padEnd(44)}║
║     Texto: ${String(report.textRequests).padEnd(44)}║
║     Áudio: ${String(report.audioRequests).padEnd(44)}║
╠══════════════════════════════════════════════════════════════╣
║  🔢 TOKENS                                                   ║
║     Input:  ${String(report.totalInputTokens).padEnd(43)}║
║     Output: ${String(report.totalOutputTokens).padEnd(43)}║
╠══════════════════════════════════════════════════════════════╣
║  💰 CUSTO ESTIMADO                                           ║
║     USD: $${report.totalCostUSD.toFixed(4).padEnd(45)}║
║     BRL: R$${report.totalCostBRL.toFixed(2).padEnd(44)}║
╠══════════════════════════════════════════════════════════════╣
║  ⚡ PERFORMANCE                                              ║
║     Latência média: ${String(report.avgLatencyMs + 'ms').padEnd(35)}║
╚══════════════════════════════════════════════════════════════╝`);

    // Log simplificado para fácil grep
    this.logger.log(
      `[AI_COST_${tipo}] requests=${report.totalRequests} ` +
      `tokens=${report.totalInputTokens + report.totalOutputTokens} ` +
      `USD=$${report.totalCostUSD.toFixed(4)} ` +
      `BRL=R$${report.totalCostBRL.toFixed(2)}`
    );
  }

  /**
   * Gera relatório sob demanda (para testes)
   */
  async generateReportNow(days: number = 7): Promise<WeeklyReport | null> {
    const report = await this.buildReport(days);
    if (report) {
      this.logReport(report, 'SOB_DEMANDA');
    }
    return report;
  }
}
