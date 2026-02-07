import { Injectable, Inject } from '@nestjs/common';
import { and, eq, gte, lt, ilike, sql, desc, SQL } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { parseQueryDate } from '../../common/date-range';

const { products, stockMovements, users } = schema;

export interface StockSummaryQuery {
  salonId: string;
  location?: 'RETAIL' | 'INTERNAL';
  search?: string;
  lowStock?: boolean;
}

export interface StockMovementsQuery {
  salonId: string;
  from?: string;
  to?: string;
  location?: 'RETAIL' | 'INTERNAL';
  productId?: number;
  search?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class StockService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * GET /stock/summary
   * Returns active products with stock info, filtered by location and search.
   */
  async getSummary(query: StockSummaryQuery) {
    const conditions: SQL[] = [
      eq(products.salonId, query.salonId),
      eq(products.active, true),
    ];

    if (query.search) {
      conditions.push(ilike(products.name, `%${query.search}%`));
    }

    if (query.location === 'RETAIL') {
      conditions.push(eq(products.isRetail, true));
    } else if (query.location === 'INTERNAL') {
      conditions.push(eq(products.isBackbar, true));
    }

    const rows = await this.db
      .select({
        id: products.id,
        name: products.name,
        unit: products.unit,
        kind: products.kind,
        isRetail: products.isRetail,
        isBackbar: products.isBackbar,
        stockRetail: products.stockRetail,
        stockInternal: products.stockInternal,
        minStockRetail: products.minStockRetail,
        minStockInternal: products.minStockInternal,
        costPrice: products.costPrice,
        salePrice: products.salePrice,
      })
      .from(products)
      .where(and(...conditions))
      .orderBy(products.name);

    const result = rows.map((p) => {
      const isLowRetail = p.isRetail && p.stockRetail <= p.minStockRetail;
      const isLowInternal = p.isBackbar && p.stockInternal <= p.minStockInternal;
      return {
        ...p,
        isLowRetail,
        isLowInternal,
        isLowStock: isLowRetail || isLowInternal,
      };
    });

    if (query.lowStock) {
      return result.filter((p) => p.isLowStock);
    }

    return result;
  }

  /**
   * GET /stock/movements
   * Returns paginated stock movements with product name and user info.
   * Dates interpreted as SP timezone via parseQueryDate.
   */
  async getMovements(query: StockMovementsQuery) {
    const limit = Math.min(query.limit || 50, 200);
    const offset = query.offset || 0;

    const conditions: SQL[] = [
      eq(stockMovements.salonId, query.salonId),
    ];

    // Date range (half-open: [from, to))
    if (query.from) {
      const fromDate = parseQueryDate(query.from, false);
      conditions.push(gte(stockMovements.createdAt, fromDate));
    }
    if (query.to) {
      const toDate = parseQueryDate(query.to, true);
      conditions.push(lt(stockMovements.createdAt, toDate));
    }

    if (query.location) {
      conditions.push(eq(stockMovements.locationType, query.location));
    }

    if (query.productId) {
      conditions.push(eq(stockMovements.productId, query.productId));
    }

    if (query.type) {
      conditions.push(eq(stockMovements.movementType, query.type as any));
    }

    // Search by product name requires a subquery
    if (query.search) {
      conditions.push(
        ilike(products.name, `%${query.search}%`),
      );
    }

    const rows = await this.db
      .select({
        id: stockMovements.id,
        productId: stockMovements.productId,
        productName: products.name,
        delta: stockMovements.delta,
        locationType: stockMovements.locationType,
        movementType: stockMovements.movementType,
        referenceType: stockMovements.referenceType,
        referenceId: stockMovements.referenceId,
        transferGroupId: stockMovements.transferGroupId,
        movementGroupId: stockMovements.movementGroupId,
        reason: stockMovements.reason,
        createdByUserId: stockMovements.createdByUserId,
        createdByName: users.name,
        createdAt: stockMovements.createdAt,
      })
      .from(stockMovements)
      .innerJoin(products, eq(products.id, stockMovements.productId))
      .leftJoin(users, eq(users.id, stockMovements.createdByUserId))
      .where(and(...conditions))
      .orderBy(desc(stockMovements.createdAt))
      .limit(limit)
      .offset(offset);

    // Total count for pagination
    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(stockMovements)
      .innerJoin(products, eq(products.id, stockMovements.productId))
      .where(and(...conditions));

    return {
      data: rows,
      total: countResult?.count ?? 0,
      limit,
      offset,
    };
  }
}
