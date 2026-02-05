import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../database/connection';
import {
  clientPackages,
  packages,
  clients,
  appointments,
} from '../../database/schema';
import { eq, and, sql } from 'drizzle-orm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * =====================================================
 * PACKAGE INTELLIGENCE SERVICE (Stub Version)
 * Detecta e gerencia serviços tipo "Pacote" para Alexia
 * =====================================================
 */

export interface ActivePackage {
  id: number;
  clientId: string;
  clientName: string;
  clientPhone: string | null;
  packageId: number;
  packageName: string;
  remainingSessions: number;
  totalSessions: number;
  expirationDate: string;
  purchaseDate: Date;
  scheduledSessions: number;
}

export interface PackageSessionInfo {
  packageName: string;
  remainingSessions: number;
  totalSessions: number;
  scheduledSessions: number;
  expirationDate: string;
  daysUntilExpiration: number;
}

export interface AvailablePackage {
  id: number;
  name: string;
  description: string | null;
  price: string;
  totalSessions: number;
  expirationDays: number;
  serviceName?: string;
  serviceDuration?: number;
}

@Injectable()
export class PackageIntelligenceService {
  private readonly logger = new Logger(PackageIntelligenceService.name);

  /**
   * Detecta se um serviço é do tipo "Pacote" pelo nome
   */
  isPackageService(name: string): boolean {
    if (!name) return false;
    const lower = name.toLowerCase();

    const packagePatterns = [
      /pacote/,
      /cronograma/,
      /\d+\s*sess[oõ]es/,
      /\(\d+\s*sess[oõ]es?\)/,
      /combo/,
      /plano\s+de\s+tratamento/,
    ];

    return packagePatterns.some(pattern => pattern.test(lower));
  }

  /**
   * Busca pacotes disponíveis no salão
   */
  async getAvailablePackages(salonId: string): Promise<AvailablePackage[]> {
    try {
      const result = await db
        .select({
          id: packages.id,
          name: packages.name,
          description: packages.description,
          price: packages.price,
          totalSessions: packages.totalSessions,
          expirationDays: packages.expirationDays,
        })
        .from(packages)
        .where(
          and(
            eq(packages.salonId, salonId),
            eq(packages.active, true),
          ),
        )
        .orderBy(packages.name);

      return result.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price: s.price || '0',
        totalSessions: s.totalSessions || 1,
        expirationDays: s.expirationDays || 90,
      }));
    } catch (error: any) {
      this.logger.error(`Error fetching available packages: ${error.message}`);
      return [];
    }
  }

  /**
   * Busca pacotes ativos de um cliente pelo telefone
   */
  async getActivePackagesByPhone(
    salonId: string,
    clientPhone: string,
  ): Promise<ActivePackage[]> {
    try {
      const normalizedPhone = clientPhone.replace(/\D/g, '');

      // Busca cliente pelo telefone
      const [client] = await db
        .select({ id: clients.id, name: clients.name, phone: clients.phone })
        .from(clients)
        .where(
          and(
            eq(clients.salonId, salonId),
            sql`REPLACE(REPLACE(REPLACE(${clients.phone}, '-', ''), ' ', ''), '+', '') LIKE ${'%' + normalizedPhone.slice(-9)}`,
          ),
        )
        .limit(1);

      if (!client) {
        return [];
      }

      // Busca pacotes ativos do cliente com dados do pacote
      const activeClientPackages = await db
        .select({
          id: clientPackages.id,
          clientId: clientPackages.clientId,
          packageId: clientPackages.packageId,
          remainingSessions: clientPackages.remainingSessions,
          expirationDate: clientPackages.expirationDate,
          purchaseDate: clientPackages.purchaseDate,
          packageName: packages.name,
          totalSessions: packages.totalSessions,
        })
        .from(clientPackages)
        .innerJoin(packages, eq(packages.id, clientPackages.packageId))
        .where(
          and(
            eq(clientPackages.clientId, client.id),
            eq(clientPackages.active, true),
            sql`${clientPackages.remainingSessions} > 0`,
            sql`${clientPackages.expirationDate} >= CURRENT_DATE`,
          ),
        );

      // Enriquece com contagem de sessões agendadas
      const enrichedPackages: ActivePackage[] = [];

      for (const cp of activeClientPackages) {
        const scheduledCount = await this.countScheduledSessions(cp.id);

        enrichedPackages.push({
          id: cp.id,
          clientId: client.id,
          clientName: client.name || 'Cliente',
          clientPhone: client.phone,
          packageId: cp.packageId,
          packageName: cp.packageName || 'Pacote',
          remainingSessions: cp.remainingSessions,
          totalSessions: cp.totalSessions,
          expirationDate: cp.expirationDate,
          purchaseDate: cp.purchaseDate,
          scheduledSessions: scheduledCount,
        });
      }

      return enrichedPackages;
    } catch (error: any) {
      this.logger.error(`Error fetching active packages: ${error.message}`);
      return [];
    }
  }

  /**
   * Conta sessões já agendadas para um pacote do cliente
   */
  private async countScheduledSessions(clientPackageId: number): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(appointments)
        .where(
          and(
            eq(appointments.clientPackageId, clientPackageId),
            sql`${appointments.status} IN ('SCHEDULED', 'CONFIRMED')`,
          ),
        );

      return result[0]?.count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Formata resposta com informações dos pacotes do cliente
   */
  formatPackageInfoResponse(activePackages: ActivePackage[]): string {
    if (activePackages.length === 0) {
      return `Não encontrei pacotes ativos no seu nome. 📦

Se você adquiriu um pacote recentemente, confirme com a recepção! 😊`;
    }

    const packageLines = activePackages.map(pkg => {
      const expDate = new Date(pkg.expirationDate);
      const daysLeft = Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const pending = pkg.remainingSessions - pkg.scheduledSessions;

      return `📦 *${pkg.packageName}*
• Sessões restantes: ${pkg.remainingSessions}/${pkg.totalSessions}
• Sessões agendadas: ${pkg.scheduledSessions}
• Pendentes de agendar: ${pending}
• Válido até: ${format(expDate, "dd 'de' MMMM", { locale: ptBR })} (${daysLeft} dias)`;
    });

    return `Seus pacotes ativos:\n\n${packageLines.join('\n\n')}

Quer agendar uma sessão? Me diz qual pacote! 😊`;
  }

  /**
   * Processa consulta sobre pacotes disponíveis
   */
  async handlePackageQuery(salonId: string, _text: string): Promise<string> {
    try {
      const available = await this.getAvailablePackages(salonId);

      if (available.length === 0) {
        return `No momento não temos pacotes disponíveis para venda.

Mas temos ótimos serviços avulsos! Quer ver nossa lista de serviços? 😊`;
      }

      const packageLines = available.map(pkg => {
        const priceNum = parseFloat(pkg.price);
        const priceFormatted = priceNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        return `📦 *${pkg.name}*
• ${pkg.totalSessions} sessões
• Válido por ${pkg.expirationDays} dias
• ${priceFormatted}`;
      });

      return `Nossos pacotes disponíveis:\n\n${packageLines.join('\n\n')}

Interessou em algum? Fale com a recepção para adquirir! 😊`;
    } catch (error: any) {
      this.logger.error(`Error handling package query: ${error.message}`);
      return 'Desculpe, não consegui verificar nossos pacotes no momento. Entre em contato com a recepção! 😊';
    }
  }
}
