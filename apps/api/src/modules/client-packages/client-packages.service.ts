import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  Database,
  clientPackages,
  ClientPackage,
  NewClientPackage,
  packages,
  clients,
} from '../../database';

@Injectable()
export class ClientPackagesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todos os pacotes de um cliente
   */
  async findByClient(clientId: string): Promise<ClientPackage[]> {
    return this.db
      .select()
      .from(clientPackages)
      .where(eq(clientPackages.clientId, clientId));
  }

  /**
   * Lista pacotes ativos de um cliente (com sessões restantes e não expirados)
   */
  async findActiveByClient(clientId: string): Promise<ClientPackage[]> {
    const today = new Date().toISOString().split('T')[0];

    const all = await this.db
      .select()
      .from(clientPackages)
      .where(
        and(
          eq(clientPackages.clientId, clientId),
          eq(clientPackages.active, true),
        ),
      );

    // Filtra pacotes não expirados e com sessões restantes
    return all.filter(
      cp => cp.remainingSessions > 0 && cp.expirationDate >= today,
    );
  }

  /**
   * Busca pacote do cliente por ID
   */
  async findById(id: number): Promise<ClientPackage | null> {
    const result = await this.db
      .select()
      .from(clientPackages)
      .where(eq(clientPackages.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Compra de pacote pelo cliente
   */
  async purchasePackage(clientId: string, packageId: number): Promise<ClientPackage> {
    // Verifica se o cliente existe
    const clientResult = await this.db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (!clientResult[0]) {
      throw new BadRequestException('Cliente nao encontrado');
    }

    // Busca o pacote
    const packageResult = await this.db
      .select()
      .from(packages)
      .where(eq(packages.id, packageId))
      .limit(1);

    const pkg = packageResult[0];

    if (!pkg) {
      throw new BadRequestException('Pacote nao encontrado');
    }

    if (!pkg.active) {
      throw new BadRequestException('Pacote nao esta disponivel para venda');
    }

    // Calcula a data de expiração
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + pkg.expirationDays);

    // Cria o pacote do cliente
    const newClientPackage: NewClientPackage = {
      clientId,
      packageId,
      remainingSessions: pkg.totalSessions,
      expirationDate: expirationDate.toISOString().split('T')[0],
      active: true,
    };

    const result = await this.db
      .insert(clientPackages)
      .values(newClientPackage)
      .returning();

    return result[0];
  }

  /**
   * Usa uma sessão do pacote (decrementa remaining_sessions)
   */
  async useSession(clientPackageId: number): Promise<{
    clientPackage: ClientPackage;
    message: string;
  }> {
    const clientPkg = await this.findById(clientPackageId);

    if (!clientPkg) {
      throw new BadRequestException('Pacote do cliente nao encontrado');
    }

    if (!clientPkg.active) {
      throw new BadRequestException('Pacote esta inativo');
    }

    // Verifica expiração
    const today = new Date().toISOString().split('T')[0];
    if (clientPkg.expirationDate < today) {
      // Marca como inativo
      await this.db
        .update(clientPackages)
        .set({ active: false, updatedAt: new Date() })
        .where(eq(clientPackages.id, clientPackageId));

      throw new BadRequestException('Pacote expirado');
    }

    if (clientPkg.remainingSessions <= 0) {
      throw new BadRequestException('Pacote sem sessoes restantes');
    }

    // Decrementa sessões restantes
    const newRemainingSessions = clientPkg.remainingSessions - 1;

    const result = await this.db
      .update(clientPackages)
      .set({
        remainingSessions: newRemainingSessions,
        updatedAt: new Date(),
        // Desativa se acabaram as sessões
        active: newRemainingSessions > 0,
      })
      .where(eq(clientPackages.id, clientPackageId))
      .returning();

    const message = newRemainingSessions > 0
      ? `Sessao utilizada. Restam ${newRemainingSessions} sessao(oes).`
      : 'Ultima sessao utilizada. Pacote finalizado.';

    return {
      clientPackage: result[0],
      message,
    };
  }

  /**
   * Verifica se o cliente tem pacote válido para um serviço
   */
  async hasValidPackageForService(
    clientId: string,
    serviceName: string,
  ): Promise<{ hasPackage: boolean; clientPackage?: ClientPackage }> {
    const activePackages = await this.findActiveByClient(clientId);

    for (const clientPkg of activePackages) {
      // Busca o pacote original para ver os serviços incluídos
      const pkgResult = await this.db
        .select()
        .from(packages)
        .where(eq(packages.id, clientPkg.packageId))
        .limit(1);

      const pkg = pkgResult[0];

      if (pkg && pkg.servicesIncluded) {
        const services = pkg.servicesIncluded.services || [];
        const serviceIncluded = services.some(
          s => s.name.toLowerCase() === serviceName.toLowerCase(),
        );

        if (serviceIncluded) {
          return { hasPackage: true, clientPackage: clientPkg };
        }
      }
    }

    return { hasPackage: false };
  }

  /**
   * Cancela um pacote do cliente
   */
  async cancel(id: number): Promise<ClientPackage | null> {
    const result = await this.db
      .update(clientPackages)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(clientPackages.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Retorna estatísticas dos pacotes do cliente
   */
  async getClientStats(clientId: string): Promise<{
    totalPackages: number;
    activePackages: number;
    totalSessionsUsed: number;
    totalSessionsRemaining: number;
  }> {
    const allPackages = await this.findByClient(clientId);
    const activePackages = await this.findActiveByClient(clientId);

    let totalSessionsUsed = 0;
    let totalSessionsRemaining = 0;

    for (const clientPkg of allPackages) {
      const pkgResult = await this.db
        .select()
        .from(packages)
        .where(eq(packages.id, clientPkg.packageId))
        .limit(1);

      const pkg = pkgResult[0];
      if (pkg) {
        totalSessionsUsed += pkg.totalSessions - clientPkg.remainingSessions;
        totalSessionsRemaining += clientPkg.remainingSessions;
      }
    }

    return {
      totalPackages: allPackages.length,
      activePackages: activePackages.length,
      totalSessionsUsed,
      totalSessionsRemaining,
    };
  }
}
