import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../../database/connection';
import { cartLinks, cartLinkViews } from '../../database/schema';
import { eq, and, desc, gte, lte, count } from 'drizzle-orm';
import { CreateCartLinkDto, UpdateCartLinkDto, ConvertCartLinkDto, CartLinkResponse, CartLinkStatsResponse } from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class CartLinksService {
  async getLinks(
    salonId: string,
    options?: { page?: number; limit?: number; status?: string; source?: string; clientId?: string },
  ): Promise<{ data: CartLinkResponse[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(cartLinks.salonId, salonId)];
    if (options?.status) conditions.push(eq(cartLinks.status, options.status));
    if (options?.source) conditions.push(eq(cartLinks.source, options.source));
    if (options?.clientId) conditions.push(eq(cartLinks.clientId, options.clientId));

    const [links, totalResult] = await Promise.all([
      db.select().from(cartLinks).where(and(...conditions)).orderBy(desc(cartLinks.createdAt)).limit(limit).offset(offset),
      db.select({ count: count() }).from(cartLinks).where(and(...conditions)),
    ]);

    return {
      data: links.map(l => this.formatLinkResponse(l)),
      total: totalResult[0].count,
      page,
      limit,
    };
  }

  async getLinkById(salonId: string, id: string): Promise<CartLinkResponse> {
    const [link] = await db.select().from(cartLinks).where(and(eq(cartLinks.id, id), eq(cartLinks.salonId, salonId)));
    if (!link) throw new NotFoundException('Link não encontrado');
    return this.formatLinkResponse(link);
  }

  async getLinkByCode(code: string): Promise<CartLinkResponse> {
    const [link] = await db.select().from(cartLinks).where(eq(cartLinks.code, code));
    if (!link) throw new NotFoundException('Link não encontrado');
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      await db.update(cartLinks).set({ status: 'EXPIRED' }).where(eq(cartLinks.id, link.id));
      throw new BadRequestException('Este link expirou');
    }
    if (link.status !== 'ACTIVE') throw new BadRequestException('Este link não está mais ativo');
    return this.formatLinkResponse(link, true);
  }

  async createLink(salonId: string, dto: CreateCartLinkDto, userId: string): Promise<CartLinkResponse> {
    const items = dto.items.map(item => ({
      type: item.type as 'PRODUCT' | 'SERVICE',
      id: item.itemId,
      name: 'Item',
      quantity: item.quantity || 1,
      price: 0,
      discount: item.discount || 0,
    }));

    const code = randomBytes(6).toString('hex').toUpperCase();
    const [link] = await db.insert(cartLinks).values({
      salonId,
      code,
      clientId: dto.clientId,
      clientPhone: dto.clientPhone,
      clientName: dto.clientName,
      items,
      totalAmount: '0',
      finalAmount: '0',
      message: dto.message,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      source: dto.source || 'MANUAL',
      createdById: userId,
    }).returning();

    return this.formatLinkResponse(link);
  }

  async updateLink(salonId: string, id: string, dto: UpdateCartLinkDto): Promise<CartLinkResponse> {
    const [existing] = await db.select().from(cartLinks).where(and(eq(cartLinks.id, id), eq(cartLinks.salonId, salonId)));
    if (!existing) throw new NotFoundException('Link não encontrado');

    const updateData: any = { updatedAt: new Date() };
    if (dto.message !== undefined) updateData.message = dto.message;
    if (dto.expiresAt !== undefined) updateData.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    if (dto.isActive === false) updateData.status = 'CANCELLED';

    const [updated] = await db.update(cartLinks).set(updateData).where(eq(cartLinks.id, id)).returning();
    return this.formatLinkResponse(updated);
  }

  async deleteLink(salonId: string, id: string): Promise<void> {
    const [existing] = await db.select().from(cartLinks).where(and(eq(cartLinks.id, id), eq(cartLinks.salonId, salonId)));
    if (!existing) throw new NotFoundException('Link não encontrado');
    await db.delete(cartLinkViews).where(eq(cartLinkViews.cartLinkId, id));
    await db.delete(cartLinks).where(eq(cartLinks.id, id));
  }

  async recordView(code: string, viewData: { ipAddress?: string; userAgent?: string; referrer?: string }): Promise<void> {
    const [link] = await db.select().from(cartLinks).where(eq(cartLinks.code, code));
    if (!link || link.status !== 'ACTIVE') return;

    await Promise.all([
      db.insert(cartLinkViews).values({
        cartLinkId: link.id,
        ipAddress: viewData.ipAddress,
        userAgent: viewData.userAgent,
      }),
      db.update(cartLinks).set({ viewCount: (link.viewCount || 0) + 1, lastViewedAt: new Date() }).where(eq(cartLinks.id, link.id)),
    ]);
  }

  async convertLink(code: string, _dto: ConvertCartLinkDto, _userId?: string): Promise<{ link: CartLinkResponse; commandId: string }> {
    const [link] = await db.select().from(cartLinks).where(eq(cartLinks.code, code));
    if (!link) throw new NotFoundException('Link não encontrado');
    if (link.status !== 'ACTIVE') throw new BadRequestException('Link não está ativo');

    const [updated] = await db.update(cartLinks).set({ status: 'CONVERTED', convertedAt: new Date() }).where(eq(cartLinks.id, link.id)).returning();
    return { link: this.formatLinkResponse(updated), commandId: 'converted' };
  }

  async getStats(salonId: string, startDate?: string, endDate?: string): Promise<CartLinkStatsResponse> {
    const conditions: any[] = [eq(cartLinks.salonId, salonId)];
    if (startDate) conditions.push(gte(cartLinks.createdAt, new Date(startDate)));
    if (endDate) conditions.push(lte(cartLinks.createdAt, new Date(endDate)));

    const links = await db.select().from(cartLinks).where(and(...conditions));
    const totalLinks = links.length;
    const activeLinks = links.filter(l => l.status === 'ACTIVE').length;
    const convertedLinks = links.filter(l => l.status === 'CONVERTED').length;
    const expiredLinks = links.filter(l => l.status === 'EXPIRED').length;
    const totalViews = links.reduce((sum, l) => sum + (l.viewCount || 0), 0);
    const totalRevenue = links.filter(l => l.status === 'CONVERTED').reduce((sum, l) => sum + parseFloat(l.finalAmount || '0'), 0);

    return {
      totalLinks,
      activeLinks,
      convertedLinks,
      expiredLinks,
      conversionRate: totalLinks > 0 ? (convertedLinks / totalLinks) * 100 : 0,
      totalViews,
      totalRevenue,
      bySource: [],
    };
  }

  private formatLinkResponse(link: any, _includeSalon = false): CartLinkResponse {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return {
      id: link.id,
      salonId: link.salonId,
      code: link.code,
      clientId: link.clientId,
      clientPhone: link.clientPhone,
      clientName: link.clientName,
      source: link.source || 'MANUAL',
      status: link.status,
      items: (link.items || []).map((i: any) => ({
        type: i.type,
        itemId: i.id,
        name: i.name,
        originalPrice: i.price,
        discount: i.discount,
        finalPrice: i.price * (1 - i.discount / 100),
        quantity: i.quantity,
      })),
      message: link.message,
      totalOriginalPrice: link.totalAmount,
      totalDiscount: link.discountAmount || '0',
      totalFinalPrice: link.finalAmount,
      viewCount: link.viewCount || 0,
      lastViewedAt: link.lastViewedAt,
      convertedAt: link.convertedAt,
      commandId: link.convertedCommandId,
      expiresAt: link.expiresAt,
      publicUrl: `${baseUrl}/cart/${link.code}`,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    };
  }
}
