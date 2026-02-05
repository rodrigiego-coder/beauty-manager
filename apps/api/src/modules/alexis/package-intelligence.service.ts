import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../database/connection';
import {
  clientPackages,
  packages,
  clients,
  appointments,
  appointmentNotifications,
  services,
  packageServices,
} from '../../database/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';
import { format, addDays, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * =====================================================
 * PACKAGE INTELLIGENCE SERVICE
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
   * Procura por palavras-chave: "Pacote", "Cronograma", "sessões", "(X sessões)"
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
   * Detecta se um serviço é do tipo "Pacote" usando o campo totalSessions
   * OU pelo nome (fallback para compatibilidade)
   *
   * REGRA: totalSessions > 1 = World B (Pacote)
   *        totalSessions = 1  = World A (Serviço Avulso)
   */
  isPackageByTotalSessions(service: { name: string; totalSessions?: number }): boolean {
    // Prioridade: se totalSessions > 1, é pacote (definido manualmente pelo salão)
    if (service.totalSessions && service.totalSessions > 1) {
      return true;
    }

    // Fallback: verifica pelo nome para serviços antigos sem totalSessions definido
    return this.isPackageService(service.name);
  }

  /**
   * Determina o "Mundo" de um serviço
   * @returns 'A' para serviço avulso, 'B' para pacote
   */
  getServiceWorld(service: { name: string; totalSessions?: number }): 'A' | 'B' {
    return this.isPackageByTotalSessions(service) ? 'B' : 'A';
  }

  /**
   * Busca pacotes ativos de um cliente pelo telefone
   */
  async getActivePackagesByPhone(
    salonId: string,
    phone: string,
  ): Promise<ActivePackage[]> {
    const phoneClean = phone.replace(/\D/g, '');
    const phoneVariants = [
      phoneClean,
      phoneClean.replace(/^55/, ''),
      `55${phoneClean.replace(/^55/, '')}`,
    ];

    try {
      // Busca cliente pelo telefone
      const clientResults = await db
        .select({
          id: clients.id,
          name: clients.name,
          phone: clients.phone,
        })
        .from(clients)
        .where(eq(clients.salonId, salonId));

      // Filtra clientes que correspondem ao telefone
      const matchingClients = clientResults.filter(c => {
        const clientPhone = c.phone?.replace(/\D/g, '') || '';
        return phoneVariants.some(p =>
          clientPhone.includes(p) ||
          p.includes(clientPhone) ||
          clientPhone === p
        );
      });

      if (matchingClients.length === 0) {
        return [];
      }

      const clientIds = matchingClients.map(c => c.id);
      const today = new Date().toISOString().split('T')[0];

      // Busca pacotes ativos
      const activePackages: ActivePackage[] = [];

      for (const clientId of clientIds) {
        const pkgs = await db
          .select({
            id: clientPackages.id,
            clientId: clientPackages.clientId,
            packageId: clientPackages.packageId,
            remainingSessions: clientPackages.remainingSessions,
            expirationDate: clientPackages.expirationDate,
            purchaseDate: clientPackages.purchaseDate,
            clientPhone: clientPackages.clientPhone,
            packageName: packages.name,
            totalSessions: packages.totalSessions,
          })
          .from(clientPackages)
          .innerJoin(packages, eq(clientPackages.packageId, packages.id))
          .where(
            and(
              eq(clientPackages.clientId, clientId),
              eq(clientPackages.active, true),
              gte(clientPackages.expirationDate, today),
            ),
          );

        for (const pkg of pkgs) {
          // Conta sessões já agendadas
          const scheduledCount = await this.countScheduledSessions(pkg.id);

          const client = matchingClients.find(c => c.id === clientId);

          activePackages.push({
            id: pkg.id,
            clientId,
            clientName: client?.name || 'Cliente',
            clientPhone: pkg.clientPhone || client?.phone || null,
            packageId: pkg.packageId,
            packageName: pkg.packageName,
            remainingSessions: pkg.remainingSessions,
            totalSessions: pkg.totalSessions,
            expirationDate: pkg.expirationDate,
            purchaseDate: pkg.purchaseDate,
            scheduledSessions: scheduledCount,
          });
        }
      }

      return activePackages;
    } catch (error: any) {
      this.logger.error(`Erro ao buscar pacotes: ${error.message}`);
      return [];
    }
  }

  /**
   * Conta sessões já agendadas para um pacote
   */
  private async countScheduledSessions(clientPackageId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(appointments)
      .where(
        and(
          eq(appointments.clientPackageId, clientPackageId),
          sql`${appointments.status} NOT IN ('CANCELLED', 'NO_SHOW')`,
        ),
      );

    return result[0]?.count || 0;
  }

  /**
   * Formata resposta sobre pacotes do cliente para WhatsApp
   */
  formatPackageInfoResponse(packages: ActivePackage[]): string {
    if (packages.length === 0) {
      return `Não encontrei pacotes ativos no seu nome.

Se você adquiriu um pacote recentemente, confirme com a recepção! 😊`;
    }

    let response = `Seus pacotes ativos:\n`;

    for (const pkg of packages) {
      const pendingSessions = pkg.remainingSessions - pkg.scheduledSessions;
      const expDate = new Date(pkg.expirationDate);
      const daysLeft = Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      response += `
📦 *${pkg.packageName}*
🔢 Sessões: ${pkg.totalSessions - pkg.remainingSessions}/${pkg.totalSessions} utilizadas
📅 Agendadas: ${pkg.scheduledSessions}
⏳ Restantes para agendar: ${pendingSessions}
📆 Validade: ${format(expDate, "dd 'de' MMMM", { locale: ptBR })}`;

      if (daysLeft <= 30) {
        response += ` ⚠️ (${daysLeft} dias)`;
      }

      response += '\n';
    }

    if (packages.some(p => p.remainingSessions - p.scheduledSessions > 0)) {
      response += `\nQuer *AGENDAR* suas próximas sessões? 😊`;
    }

    return response.trim();
  }

  /**
   * Formata mensagem de contagem regressiva após sessão completada
   */
  formatSessionCountdownMessage(
    packageName: string,
    remainingSessions: number,
    clientName?: string,
  ): string {
    const greeting = clientName ? `${clientName}, s` : 'S';

    if (remainingSessions === 0) {
      return `${greeting}essão concluída! ✅

📦 *${packageName}*
🎉 Parabéns! Você completou todas as sessões do seu pacote!

Esperamos que tenha gostado dos resultados. Até a próxima! 💜`;
    }

    const plural = remainingSessions > 1 ? 'sessões restantes' : 'sessão restante';

    return `${greeting}essão concluída! ✅

📦 *${packageName}*
🔢 Você ainda tem *${remainingSessions} ${plural}*

Quer agendar a próxima? Responda *AGENDAR*! 😊`;
  }

  /**
   * Formata mensagem de alerta semanal para sessões pendentes
   */
  formatPendingSessionsAlert(
    packageName: string,
    pendingSessions: number,
    expirationDate: string,
    clientName?: string,
  ): string {
    const greeting = clientName ? `Oi, ${clientName}! 👋` : 'Oi! 👋';
    const expDate = new Date(expirationDate);
    const formattedDate = format(expDate, "dd/MM/yyyy", { locale: ptBR });
    const plural = pendingSessions > 1 ? 'sessões' : 'sessão';

    return `${greeting}

Lembrete do seu pacote *${packageName}*:
📦 Você ainda tem *${pendingSessions} ${plural}* disponíveis!
⏰ Validade: ${formattedDate}

Vamos agendar? Responda *AGENDAR* 😊`;
  }

  /**
   * Agenda notificação de contagem regressiva após sessão
   */
  async scheduleSessionCountdown(
    salonId: string,
    clientPackageId: number,
    appointmentId: string,
    recipientPhone: string,
    recipientName: string | null,
    packageName: string,
    remainingSessions: number,
  ): Promise<void> {
    const message = this.formatSessionCountdownMessage(
      packageName,
      remainingSessions,
      recipientName || undefined,
    );

    // Agenda para 30 minutos após o término (dá tempo de pagar/sair)
    const scheduledFor = addMinutes(new Date(), 30);
    const dedupeKey = `${appointmentId}:PACKAGE_SESSION_COMPLETED`;

    try {
      await db.insert(appointmentNotifications).values({
        salonId,
        appointmentId,
        recipientPhone: this.formatPhone(recipientPhone),
        recipientName,
        notificationType: 'PACKAGE_SESSION_COMPLETED',
        templateKey: 'package_session_completed',
        templateVariables: {
          nome: recipientName || 'Cliente',
          pacote: packageName,
          sessoes_restantes: String(remainingSessions),
        },
        customMessage: message,
        scheduledFor,
        dedupeKey,
      });

      this.logger.log(
        `Contagem regressiva agendada: package=${clientPackageId}, remaining=${remainingSessions}`,
      );
    } catch (error: any) {
      // Ignora duplicação (idempotência)
      if (error.code === '23505') {
        this.logger.debug(`Notificação já existe: ${dedupeKey}`);
        return;
      }
      throw error;
    }
  }

  /**
   * Busca pacotes com sessões pendentes para alertas semanais
   * Retorna pacotes onde remainingSessions > scheduledSessions
   */
  async getPackagesWithPendingSessions(
    limit: number = 50,
  ): Promise<Array<ActivePackage & { salonId: string }>> {
    const today = new Date().toISOString().split('T')[0];
    const oneWeekAgo = addDays(new Date(), -7);

    try {
      const results = await db
        .select({
          id: clientPackages.id,
          clientId: clientPackages.clientId,
          packageId: clientPackages.packageId,
          remainingSessions: clientPackages.remainingSessions,
          expirationDate: clientPackages.expirationDate,
          purchaseDate: clientPackages.purchaseDate,
          clientPhone: clientPackages.clientPhone,
          lastPendingAlertAt: clientPackages.lastPendingAlertAt,
          pendingAlertCount: clientPackages.pendingAlertCount,
          packageName: packages.name,
          totalSessions: packages.totalSessions,
          salonId: packages.salonId,
          clientName: clients.name,
          clientPhoneFromClient: clients.phone,
        })
        .from(clientPackages)
        .innerJoin(packages, eq(clientPackages.packageId, packages.id))
        .innerJoin(clients, eq(clientPackages.clientId, clients.id))
        .where(
          and(
            eq(clientPackages.active, true),
            gte(clientPackages.expirationDate, today),
            sql`${clientPackages.remainingSessions} > 0`,
            sql`(${clientPackages.lastPendingAlertAt} IS NULL OR ${clientPackages.lastPendingAlertAt} < ${oneWeekAgo})`,
          ),
        )
        .orderBy(desc(clientPackages.expirationDate))
        .limit(limit);

      const packagesWithPending: Array<ActivePackage & { salonId: string }> = [];

      for (const pkg of results) {
        const scheduledCount = await this.countScheduledSessions(pkg.id);
        const pendingSessions = pkg.remainingSessions - scheduledCount;

        // Só inclui se tem sessões não agendadas
        if (pendingSessions > 0) {
          packagesWithPending.push({
            id: pkg.id,
            clientId: pkg.clientId,
            clientName: pkg.clientName || 'Cliente',
            clientPhone: pkg.clientPhone || pkg.clientPhoneFromClient || null,
            packageId: pkg.packageId,
            packageName: pkg.packageName,
            remainingSessions: pkg.remainingSessions,
            totalSessions: pkg.totalSessions,
            expirationDate: pkg.expirationDate,
            purchaseDate: pkg.purchaseDate,
            scheduledSessions: scheduledCount,
            salonId: pkg.salonId!,
          });
        }
      }

      return packagesWithPending;
    } catch (error: any) {
      this.logger.error(`Erro ao buscar pacotes pendentes: ${error.message}`);
      return [];
    }
  }

  /**
   * Atualiza timestamp do último alerta de sessões pendentes
   */
  async updatePendingAlertTimestamp(clientPackageId: number): Promise<void> {
    await db
      .update(clientPackages)
      .set({
        lastPendingAlertAt: new Date(),
        pendingAlertCount: sql`COALESCE(${clientPackages.pendingAlertCount}, 0) + 1`,
        updatedAt: new Date(),
      })
      .where(eq(clientPackages.id, clientPackageId));
  }

  /**
   * Agenda alerta de sessões pendentes
   */
  async schedulePendingSessionsAlert(
    salonId: string,
    clientPackageId: number,
    recipientPhone: string,
    recipientName: string | null,
    packageName: string,
    pendingSessions: number,
    expirationDate: string,
  ): Promise<void> {
    const message = this.formatPendingSessionsAlert(
      packageName,
      pendingSessions,
      expirationDate,
      recipientName || undefined,
    );

    const dedupeKey = `${clientPackageId}:PACKAGE_PENDING_SESSIONS:${new Date().toISOString().split('T')[0]}`;

    try {
      await db.insert(appointmentNotifications).values({
        salonId,
        recipientPhone: this.formatPhone(recipientPhone),
        recipientName,
        notificationType: 'PACKAGE_PENDING_SESSIONS',
        templateKey: 'package_pending_sessions',
        templateVariables: {
          nome: recipientName || 'Cliente',
          pacote: packageName,
          sessoes_pendentes: String(pendingSessions),
          validade: expirationDate,
        },
        customMessage: message,
        scheduledFor: new Date(),
        dedupeKey,
      });

      // Atualiza timestamp do alerta
      await this.updatePendingAlertTimestamp(clientPackageId);

      this.logger.log(
        `Alerta de sessões pendentes agendado: package=${clientPackageId}, pending=${pendingSessions}`,
      );
    } catch (error: any) {
      if (error.code === '23505') {
        this.logger.debug(`Alerta já enviado hoje: ${dedupeKey}`);
        return;
      }
      throw error;
    }
  }

  /**
   * Formata telefone para padrão internacional
   */
  private formatPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      cleaned = '55' + cleaned;
    }
    return cleaned;
  }

  /**
   * Busca informações do pacote vinculado a um appointment
   */
  async getPackageInfoByAppointment(
    appointmentId: string,
  ): Promise<PackageSessionInfo | null> {
    try {
      const [apt] = await db
        .select({
          clientPackageId: appointments.clientPackageId,
        })
        .from(appointments)
        .where(eq(appointments.id, appointmentId))
        .limit(1);

      if (!apt?.clientPackageId) return null;

      const [pkg] = await db
        .select({
          id: clientPackages.id,
          remainingSessions: clientPackages.remainingSessions,
          expirationDate: clientPackages.expirationDate,
          packageName: packages.name,
          totalSessions: packages.totalSessions,
        })
        .from(clientPackages)
        .innerJoin(packages, eq(clientPackages.packageId, packages.id))
        .where(eq(clientPackages.id, apt.clientPackageId))
        .limit(1);

      if (!pkg) return null;

      const scheduledSessions = await this.countScheduledSessions(pkg.id);
      const expDate = new Date(pkg.expirationDate);
      const daysUntilExpiration = Math.ceil(
        (expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );

      return {
        packageName: pkg.packageName,
        remainingSessions: pkg.remainingSessions,
        totalSessions: pkg.totalSessions,
        scheduledSessions,
        expirationDate: pkg.expirationDate,
        daysUntilExpiration,
      };
    } catch (error: any) {
      this.logger.error(`Erro ao buscar info do pacote: ${error.message}`);
      return null;
    }
  }

  /**
   * =====================================================
   * BUSCA DE PACOTES DISPONÍVEIS PARA COMPRA
   * =====================================================
   */

  /**
   * Busca todos os pacotes disponíveis para compra no salão
   */
  async getAvailablePackages(salonId: string): Promise<AvailablePackage[]> {
    try {
      const results = await db
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

      // Busca informações dos serviços vinculados
      const packagesWithServices: AvailablePackage[] = [];

      for (const pkg of results) {
        const pkgServices = await db
          .select({
            serviceName: services.name,
            serviceDuration: services.durationMinutes,
          })
          .from(packageServices)
          .innerJoin(services, eq(packageServices.serviceId, services.id))
          .where(eq(packageServices.packageId, pkg.id))
          .limit(1);

        packagesWithServices.push({
          ...pkg,
          serviceName: pkgServices[0]?.serviceName,
          serviceDuration: pkgServices[0]?.serviceDuration,
        });
      }

      return packagesWithServices;
    } catch (error: any) {
      this.logger.error(`Erro ao buscar pacotes disponíveis: ${error.message}`);
      return [];
    }
  }

  /**
   * Busca pacotes por termo de pesquisa (nome)
   * Prioriza matches exatos e parciais no nome
   */
  async searchPackagesByName(
    salonId: string,
    searchTerm: string,
  ): Promise<AvailablePackage[]> {
    const searchLower = searchTerm.toLowerCase().trim();

    try {
      // Busca todos os pacotes ativos
      const allPackages = await this.getAvailablePackages(salonId);

      // Score cada pacote baseado no match
      const scored = allPackages.map(pkg => {
        const nameLower = pkg.name.toLowerCase();
        let score = 0;

        // Match exato
        if (nameLower === searchLower) {
          score = 100;
        }
        // Nome começa com o termo
        else if (nameLower.startsWith(searchLower)) {
          score = 90;
        }
        // Termo está contido no nome
        else if (nameLower.includes(searchLower)) {
          score = 80;
        }
        // Palavras individuais do termo estão no nome
        else {
          const searchWords = searchLower.split(/\s+/).filter(w => w.length > 2);
          const matchedWords = searchWords.filter(w => nameLower.includes(w));
          if (matchedWords.length > 0) {
            score = 50 + (matchedWords.length / searchWords.length) * 30;
          }
        }

        // BOOST MÁXIMO para "hidratação" - prioridade absoluta quando mencionado
        if (searchLower.includes('hidrat') && nameLower.includes('hidrat')) {
          score += 100; // Prioridade máxima
        }

        // Boost para "cronograma" se busca contém "cronog"
        if (searchLower.includes('cronog') && nameLower.includes('cronog')) {
          score += 100; // Prioridade máxima
        }

        return { pkg, score };
      });

      // Filtra e ordena por score
      return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(s => s.pkg);
    } catch (error: any) {
      this.logger.error(`Erro ao buscar pacotes por nome: ${error.message}`);
      return [];
    }
  }

  /**
   * Formata resposta sobre pacotes disponíveis para compra
   */
  formatAvailablePackagesResponse(
    pkgs: AvailablePackage[],
    searchTerm?: string,
  ): string {
    if (pkgs.length === 0) {
      return `Não encontrei pacotes disponíveis no momento.

Entre em contato com a recepção para mais informações! 😊`;
    }

    // Se busca específica e encontrou um único resultado forte
    if (searchTerm && pkgs.length === 1) {
      const pkg = pkgs[0];
      const duration = pkg.serviceDuration ? ` (${pkg.serviceDuration} min cada)` : '';
      const validity = pkg.expirationDays ? `\n⏰ Validade: ${pkg.expirationDays} dias após compra` : '';

      return `📦 *${pkg.name}*
💰 Valor: R$ ${parseFloat(pkg.price).toFixed(2).replace('.', ',')}
🔢 ${pkg.totalSessions} sessões${duration}${validity}
${pkg.description ? `\n📝 ${pkg.description}` : ''}

Quer adquirir ou saber mais? Fale com a recepção! 😊`;
    }

    // Lista múltiplos pacotes
    let response = `Nossos pacotes disponíveis:\n`;

    for (const pkg of pkgs) {
      const priceFormatted = parseFloat(pkg.price).toFixed(2).replace('.', ',');
      const duration = pkg.serviceDuration ? ` de ${pkg.serviceDuration}min` : '';

      response += `
📦 *${pkg.name}*
💰 R$ ${priceFormatted} | ${pkg.totalSessions} sessões${duration}`;

      if (pkg.description) {
        response += `\n   _${pkg.description}_`;
      }
    }

    response += `\n\nQual te interessa? 😊`;

    return response.trim();
  }

  /**
   * Handler principal para consultas sobre pacotes disponíveis
   * Detecta se é busca específica ou listagem geral
   */
  async handlePackageQuery(
    salonId: string,
    message: string,
  ): Promise<string> {
    const msgLower = message.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove acentos para matching

    // Detecção direta de termos específicos (prioridade máxima)
    let searchTerm: string | undefined;

    // Detecção direta de "hidratação/hidratacao"
    if (msgLower.includes('hidrat')) {
      searchTerm = 'hidratação';
    }
    // Detecção direta de "cronograma"
    else if (msgLower.includes('cronog')) {
      searchTerm = 'cronograma';
    }
    // Tenta extrair termo de busca via regex
    else {
      const searchPatterns = [
        /pacote\s+(?:de\s+)?(\w+)/i,
        /(\w+)\s+pacote/i,
      ];

      const excludeWords = ['de', 'do', 'da', 'tem', 'quero', 'sobre', 'valor', 'preco', 'quanto', 'custa'];

      for (const pattern of searchPatterns) {
        const match = msgLower.match(pattern);
        if (match && match[1] && !excludeWords.includes(match[1])) {
          searchTerm = match[1];
          break;
        }
      }
    }

    this.logger.debug(`PackageQuery: message="${message}", searchTerm="${searchTerm}"`);

    // Busca específica ou listagem geral
    let pkgs: AvailablePackage[];

    if (searchTerm) {
      pkgs = await this.searchPackagesByName(salonId, searchTerm);

      // Se encontrou apenas um pacote com match forte, retorna ele diretamente
      if (pkgs.length >= 1) {
        // Verifica se o primeiro resultado é um match forte para hidratação
        if (searchTerm.includes('hidrat') && pkgs[0].name.toLowerCase().includes('hidrat')) {
          return this.formatAvailablePackagesResponse([pkgs[0]], searchTerm);
        }
        // Verifica se o primeiro resultado é um match forte para cronograma
        if (searchTerm.includes('cronog') && pkgs[0].name.toLowerCase().includes('cronog')) {
          return this.formatAvailablePackagesResponse([pkgs[0]], searchTerm);
        }
      }

      // Se não encontrou com o termo específico, lista todos
      if (pkgs.length === 0) {
        pkgs = await this.getAvailablePackages(salonId);
        if (pkgs.length > 0) {
          return `Não encontrei um pacote específico de "${searchTerm}", mas temos estas opções:\n\n` +
            this.formatAvailablePackagesResponse(pkgs);
        }
      }
    } else {
      pkgs = await this.getAvailablePackages(salonId);
    }

    return this.formatAvailablePackagesResponse(pkgs, searchTerm);
  }
}
