import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../../database/connection';
import { productReservations, clients } from '../../database/schema';
import { eq, and, desc, gte, lte, count } from 'drizzle-orm';
import { CreateReservationDto, UpdateReservationDto, UpdateReservationStatusDto, ReservationResponse, ReservationStatsResponse } from './dto';

@Injectable()
export class ReservationsService {
  async getReservations(
    salonId: string,
    options?: { page?: number; limit?: number; status?: string; clientId?: string; deliveryType?: string; startDate?: string; endDate?: string },
  ): Promise<{ data: ReservationResponse[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(productReservations.salonId, salonId)];
    if (options?.status) conditions.push(eq(productReservations.status, options.status));
    if (options?.clientId) conditions.push(eq(productReservations.clientId, options.clientId));
    if (options?.deliveryType) conditions.push(eq(productReservations.deliveryType, options.deliveryType));
    if (options?.startDate) conditions.push(gte(productReservations.createdAt, new Date(options.startDate)));
    if (options?.endDate) conditions.push(lte(productReservations.createdAt, new Date(options.endDate)));

    const [reservations, totalResult] = await Promise.all([
      db.select().from(productReservations).where(and(...conditions)).orderBy(desc(productReservations.createdAt)).limit(limit).offset(offset),
      db.select({ count: count() }).from(productReservations).where(and(...conditions)),
    ]);

    const data = await Promise.all(reservations.map(r => this.formatReservationResponse(r)));
    return { data, total: totalResult[0].count, page, limit };
  }

  async getReservationById(salonId: string, id: string): Promise<ReservationResponse> {
    const [reservation] = await db.select().from(productReservations).where(and(eq(productReservations.id, id), eq(productReservations.salonId, salonId)));
    if (!reservation) throw new NotFoundException('Reserva não encontrada');
    return this.formatReservationResponse(reservation);
  }

  async createReservation(salonId: string, dto: CreateReservationDto): Promise<ReservationResponse> {
    const [client] = await db.select().from(clients).where(and(eq(clients.id, dto.clientId), eq(clients.salonId, salonId)));
    if (!client) throw new NotFoundException('Cliente não encontrado');

    const items = dto.items.map(item => ({ productId: item.productId, name: 'Produto', quantity: item.quantity || 1, price: 0 }));
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const [reservation] = await db.insert(productReservations).values({
      salonId,
      clientId: dto.clientId,
      clientName: client.name || 'Cliente',
      clientPhone: client.phone,
      deliveryType: dto.deliveryType || 'PICKUP',
      deliveryAddress: dto.deliveryAddress,
      scheduledPickupDate: dto.scheduledDate,
      totalAmount: totalAmount.toFixed(2),
      items,
      notes: dto.notes,
    }).returning();

    return this.formatReservationResponse(reservation);
  }

  async updateReservation(salonId: string, id: string, dto: UpdateReservationDto): Promise<ReservationResponse> {
    const [existing] = await db.select().from(productReservations).where(and(eq(productReservations.id, id), eq(productReservations.salonId, salonId)));
    if (!existing) throw new NotFoundException('Reserva não encontrada');

    const updateData: any = { updatedAt: new Date() };
    if (dto.deliveryType !== undefined) updateData.deliveryType = dto.deliveryType;
    if (dto.deliveryAddress !== undefined) updateData.deliveryAddress = dto.deliveryAddress;
    if (dto.scheduledDate !== undefined) updateData.scheduledPickupDate = dto.scheduledDate;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const [updated] = await db.update(productReservations).set(updateData).where(eq(productReservations.id, id)).returning();
    return this.formatReservationResponse(updated);
  }

  async updateStatus(salonId: string, id: string, dto: UpdateReservationStatusDto, userId?: string): Promise<ReservationResponse> {
    const [existing] = await db.select().from(productReservations).where(and(eq(productReservations.id, id), eq(productReservations.salonId, salonId)));
    if (!existing) throw new NotFoundException('Reserva não encontrada');

    const updateData: any = { status: dto.status, updatedAt: new Date() };
    switch (dto.status) {
      case 'CONFIRMED': updateData.confirmedAt = new Date(); updateData.confirmedById = userId; break;
      case 'READY': updateData.readyAt = new Date(); break;
      case 'DELIVERED': updateData.deliveredAt = new Date(); break;
      case 'CANCELLED': updateData.cancelledAt = new Date(); updateData.cancellationReason = dto.notes; break;
    }

    const [updated] = await db.update(productReservations).set(updateData).where(eq(productReservations.id, id)).returning();
    return this.formatReservationResponse(updated);
  }

  async deleteReservation(salonId: string, id: string): Promise<void> {
    const [existing] = await db.select().from(productReservations).where(and(eq(productReservations.id, id), eq(productReservations.salonId, salonId)));
    if (!existing) throw new NotFoundException('Reserva não encontrada');
    if (existing.status !== 'PENDING') throw new BadRequestException('Apenas reservas pendentes podem ser excluídas');
    await db.delete(productReservations).where(eq(productReservations.id, id));
  }

  async getStats(salonId: string, startDate?: string, endDate?: string): Promise<ReservationStatsResponse> {
    const conditions: any[] = [eq(productReservations.salonId, salonId)];
    if (startDate) conditions.push(gte(productReservations.createdAt, new Date(startDate)));
    if (endDate) conditions.push(lte(productReservations.createdAt, new Date(endDate)));

    const reservations = await db.select().from(productReservations).where(and(...conditions));
    const delivered = reservations.filter(r => r.status === 'DELIVERED');
    const totalRevenue = delivered.reduce((sum, r) => sum + parseFloat(r.totalAmount || '0'), 0);

    return {
      totalReservations: reservations.length,
      pendingReservations: reservations.filter(r => r.status === 'PENDING').length,
      confirmedReservations: reservations.filter(r => r.status === 'CONFIRMED').length,
      readyReservations: reservations.filter(r => r.status === 'READY').length,
      deliveredReservations: delivered.length,
      cancelledReservations: reservations.filter(r => r.status === 'CANCELLED').length,
      totalRevenue,
      averageValue: delivered.length > 0 ? totalRevenue / delivered.length : 0,
      byDeliveryType: [],
    };
  }

  private async formatReservationResponse(reservation: any): Promise<ReservationResponse> {
    const [client] = reservation.clientId
      ? await db.select({ id: clients.id, name: clients.name, phone: clients.phone }).from(clients).where(eq(clients.id, reservation.clientId))
      : [null];

    return {
      id: reservation.id,
      salonId: reservation.salonId,
      clientId: reservation.clientId,
      status: reservation.status,
      deliveryType: reservation.deliveryType,
      deliveryAddress: reservation.deliveryAddress,
      scheduledDate: reservation.scheduledPickupDate,
      totalAmount: reservation.totalAmount,
      commandId: null,
      notes: reservation.notes,
      confirmedAt: reservation.confirmedAt,
      readyAt: reservation.readyAt,
      deliveredAt: reservation.deliveredAt,
      cancelledAt: reservation.cancelledAt,
      cancelReason: reservation.cancellationReason,
      client: client || undefined,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    };
  }
}
