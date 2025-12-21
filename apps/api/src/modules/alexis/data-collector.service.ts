import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../database/connection';
import { salons, services, products, clients, appointments, users, commands } from '../../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

/**
 * =====================================================
 * DATA COLLECTOR SERVICE
 * Coleta dados do salão para contexto da IA
 * =====================================================
 */

export interface SalonContext {
  salon: {
    name: string | null;
    phone: string | null;
    address: string | null;
    workingHours: string;
  };
  services: {
    id: number;
    name: string;
    description: string | null;
    price: string;
    duration: number;
    category: string;
  }[];
  products: {
    id: number;
    name: string;
    description: string | null;
    price: string;
    category: string;
    inStock: boolean;
  }[];
  professionals: {
    id: string;
    name: string;
  }[];
  client: {
    name: string | null;
    isReturning: boolean;
    lastVisit: string | null;
  } | null;
}

export interface DashboardData {
  todayRevenue?: number;
  todayAppointments?: number;
  unconfirmedAppointments?: number;
  lowStockProducts?: { name: string; stock: number }[];
  myAppointmentsToday?: {
    time: string | null;
    client: string | null;
    service: string | null;
  }[];
  nextClient?: any;
}

@Injectable()
export class DataCollectorService {
  private readonly logger = new Logger(DataCollectorService.name);

  /**
   * Coleta contexto do salão para resposta do WhatsApp
   */
  async collectContext(salonId: string, clientPhone?: string): Promise<SalonContext> {
    try {
      // Dados do salão
      const [salon] = await db.select().from(salons).where(eq(salons.id, salonId)).limit(1);

      // Serviços ativos
      const activeServices = await db
        .select()
        .from(services)
        .where(and(eq(services.salonId, salonId), eq(services.active, true)));

      // Produtos ativos com estoque
      const activeProducts = await db
        .select()
        .from(products)
        .where(and(eq(products.salonId, salonId), eq(products.active, true)));

      // Profissionais ativos
      const professionals = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(and(eq(users.salonId, salonId), eq(users.role, 'STYLIST'), eq(users.active, true)));

      // Cliente (se existir)
      let clientData = null;

      if (clientPhone) {
        const [client] = await db
          .select()
          .from(clients)
          .where(and(eq(clients.salonId, salonId), eq(clients.phone, clientPhone)))
          .limit(1);

        if (client) {
          // Última visita
          const [lastAppointment] = await db
            .select()
            .from(appointments)
            .where(and(eq(appointments.clientId, client.id), eq(appointments.status, 'COMPLETED')))
            .orderBy(desc(appointments.date))
            .limit(1);

          clientData = {
            name: client.name,
            isReturning: true,
            lastVisit: lastAppointment?.date || null,
          };
        }
      }

      return {
        salon: {
          name: salon?.name || null,
          phone: salon?.phone || null,
          address: salon?.address || null,
          workingHours: '08:00 às 20:00, Segunda a Sábado',
        },
        services: activeServices.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: s.basePrice,
          duration: s.durationMinutes,
          category: s.category,
        })),
        products: activeProducts.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.salePrice,
          category: p.category || 'OUTROS',
          inStock: (p.stockRetail + p.stockInternal) > 0,
        })),
        professionals: professionals.map((p) => ({
          id: p.id,
          name: p.name || 'Profissional',
        })),
        client: clientData,
      };
    } catch (error: any) {
      this.logger.error('Erro ao coletar contexto:', error?.message || error);
      return {
        salon: { name: null, phone: null, address: null, workingHours: '' },
        services: [],
        products: [],
        professionals: [],
        client: null,
      };
    }
  }

  /**
   * Coleta dados para briefing do dashboard
   */
  async collectDashboardData(
    salonId: string,
    userId: string,
    userRole: string,
  ): Promise<DashboardData> {
    try {
      // Formato de data usado nas queries (YYYY-MM-DD)
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      if (userRole === 'OWNER' || userRole === 'MANAGER') {
        // Faturamento do dia (comandas fechadas hoje)
        const [revenueResult] = await db
          .select({
            total: sql<number>`COALESCE(SUM(CAST(${commands.totalNet} AS NUMERIC)), 0)`,
          })
          .from(commands)
          .where(
            and(
              eq(commands.salonId, salonId),
              eq(commands.status, 'CLOSED'),
              sql`DATE(${commands.cashierClosedAt}) = ${todayStr}`,
            ),
          );

        // Agendamentos do dia
        const todayAppointments = await db
          .select()
          .from(appointments)
          .where(
            and(
              eq(appointments.salonId, salonId),
              eq(appointments.date, todayStr),
            ),
          );

        // Produtos com estoque baixo (verificar ambos os estoques)
        const allProducts = await db
          .select()
          .from(products)
          .where(
            and(
              eq(products.salonId, salonId),
              eq(products.active, true),
            ),
          );

        const lowStock = allProducts.filter(p => {
          const retailLow = p.isRetail && p.stockRetail <= p.minStockRetail;
          const internalLow = p.isBackbar && p.stockInternal <= p.minStockInternal;
          return retailLow || internalLow;
        });

        return {
          todayRevenue: Number(revenueResult?.total || 0),
          todayAppointments: todayAppointments.length,
          unconfirmedAppointments: todayAppointments.filter((a) => a.status === 'SCHEDULED').length,
          lowStockProducts: lowStock.map((p) => ({
            name: p.name,
            stock: p.stockRetail + p.stockInternal,
          })),
        };
      }

      if (userRole === 'RECEPTIONIST') {
        const todayAppointments = await db
          .select({
            time: appointments.time,
            status: appointments.status,
            clientId: appointments.clientId,
            serviceId: appointments.serviceId,
            professionalId: appointments.professionalId,
          })
          .from(appointments)
          .where(
            and(
              eq(appointments.salonId, salonId),
              eq(appointments.date, todayStr),
            ),
          )
          .orderBy(appointments.time);

        return {
          todayAppointments: todayAppointments.length,
          unconfirmedAppointments: todayAppointments.filter((a) => a.status === 'SCHEDULED').length,
        };
      }

      // STYLIST (Profissional)
      const myAppointments = await db
        .select({
          time: appointments.time,
          clientId: appointments.clientId,
          serviceId: appointments.serviceId,
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.salonId, salonId),
            eq(appointments.professionalId, userId),
            eq(appointments.date, todayStr),
          ),
        )
        .orderBy(appointments.time);

      // Buscar nomes dos clientes e serviços
      const appointmentsWithDetails = await Promise.all(
        myAppointments.map(async (apt) => {
          const [client] = apt.clientId
            ? await db.select().from(clients).where(eq(clients.id, apt.clientId)).limit(1)
            : [null];
          const [service] = apt.serviceId
            ? await db.select().from(services).where(eq(services.id, apt.serviceId)).limit(1)
            : [null];

          return {
            time: apt.time,
            client: client?.name || null,
            service: service?.name || null,
          };
        }),
      );

      return {
        myAppointmentsToday: appointmentsWithDetails,
        nextClient: appointmentsWithDetails[0] || null,
      };
    } catch (error: any) {
      this.logger.error('Erro ao coletar dados do dashboard:', error?.message || error);
      return {};
    }
  }
}
