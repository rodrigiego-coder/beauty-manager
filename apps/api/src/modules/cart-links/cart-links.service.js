"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartLinksService = void 0;
const common_1 = require("@nestjs/common");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
let CartLinksService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CartLinksService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CartLinksService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        async getLinks(salonId, options) {
            const page = options?.page || 1;
            const limit = options?.limit || 20;
            const offset = (page - 1) * limit;
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.cartLinks.salonId, salonId)];
            if (options?.status)
                conditions.push((0, drizzle_orm_1.eq)(schema_1.cartLinks.status, options.status));
            if (options?.source)
                conditions.push((0, drizzle_orm_1.eq)(schema_1.cartLinks.source, options.source));
            if (options?.clientId)
                conditions.push((0, drizzle_orm_1.eq)(schema_1.cartLinks.clientId, options.clientId));
            const [links, totalResult] = await Promise.all([
                connection_1.db.select().from(schema_1.cartLinks).where((0, drizzle_orm_1.and)(...conditions)).orderBy((0, drizzle_orm_1.desc)(schema_1.cartLinks.createdAt)).limit(limit).offset(offset),
                connection_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.cartLinks).where((0, drizzle_orm_1.and)(...conditions)),
            ]);
            return {
                data: links.map(l => this.formatLinkResponse(l)),
                total: totalResult[0].count,
                page,
                limit,
            };
        }
        async getLinkById(salonId, id) {
            const [link] = await connection_1.db.select().from(schema_1.cartLinks).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.cartLinks.id, id), (0, drizzle_orm_1.eq)(schema_1.cartLinks.salonId, salonId)));
            if (!link)
                throw new common_1.NotFoundException('Link não encontrado');
            return this.formatLinkResponse(link);
        }
        async getLinkByCode(code) {
            const [link] = await connection_1.db.select().from(schema_1.cartLinks).where((0, drizzle_orm_1.eq)(schema_1.cartLinks.code, code));
            if (!link)
                throw new common_1.NotFoundException('Link não encontrado');
            if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
                await connection_1.db.update(schema_1.cartLinks).set({ status: 'EXPIRED' }).where((0, drizzle_orm_1.eq)(schema_1.cartLinks.id, link.id));
                throw new common_1.BadRequestException('Este link expirou');
            }
            if (link.status !== 'ACTIVE')
                throw new common_1.BadRequestException('Este link não está mais ativo');
            return this.formatLinkResponse(link, true);
        }
        async createLink(salonId, dto, userId) {
            const items = dto.items.map(item => ({
                type: item.type,
                id: item.itemId,
                name: 'Item',
                quantity: item.quantity || 1,
                price: 0,
                discount: item.discount || 0,
            }));
            const code = (0, crypto_1.randomBytes)(6).toString('hex').toUpperCase();
            const [link] = await connection_1.db.insert(schema_1.cartLinks).values({
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
        async updateLink(salonId, id, dto) {
            const [existing] = await connection_1.db.select().from(schema_1.cartLinks).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.cartLinks.id, id), (0, drizzle_orm_1.eq)(schema_1.cartLinks.salonId, salonId)));
            if (!existing)
                throw new common_1.NotFoundException('Link não encontrado');
            const updateData = { updatedAt: new Date() };
            if (dto.message !== undefined)
                updateData.message = dto.message;
            if (dto.expiresAt !== undefined)
                updateData.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
            if (dto.isActive === false)
                updateData.status = 'CANCELLED';
            const [updated] = await connection_1.db.update(schema_1.cartLinks).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.cartLinks.id, id)).returning();
            return this.formatLinkResponse(updated);
        }
        async deleteLink(salonId, id) {
            const [existing] = await connection_1.db.select().from(schema_1.cartLinks).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.cartLinks.id, id), (0, drizzle_orm_1.eq)(schema_1.cartLinks.salonId, salonId)));
            if (!existing)
                throw new common_1.NotFoundException('Link não encontrado');
            await connection_1.db.delete(schema_1.cartLinkViews).where((0, drizzle_orm_1.eq)(schema_1.cartLinkViews.cartLinkId, id));
            await connection_1.db.delete(schema_1.cartLinks).where((0, drizzle_orm_1.eq)(schema_1.cartLinks.id, id));
        }
        async recordView(code, viewData) {
            const [link] = await connection_1.db.select().from(schema_1.cartLinks).where((0, drizzle_orm_1.eq)(schema_1.cartLinks.code, code));
            if (!link || link.status !== 'ACTIVE')
                return;
            await Promise.all([
                connection_1.db.insert(schema_1.cartLinkViews).values({
                    cartLinkId: link.id,
                    ipAddress: viewData.ipAddress,
                    userAgent: viewData.userAgent,
                }),
                connection_1.db.update(schema_1.cartLinks).set({ viewCount: (link.viewCount || 0) + 1, lastViewedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.cartLinks.id, link.id)),
            ]);
        }
        async convertLink(code, _dto, _userId) {
            const [link] = await connection_1.db.select().from(schema_1.cartLinks).where((0, drizzle_orm_1.eq)(schema_1.cartLinks.code, code));
            if (!link)
                throw new common_1.NotFoundException('Link não encontrado');
            if (link.status !== 'ACTIVE')
                throw new common_1.BadRequestException('Link não está ativo');
            const [updated] = await connection_1.db.update(schema_1.cartLinks).set({ status: 'CONVERTED', convertedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.cartLinks.id, link.id)).returning();
            return { link: this.formatLinkResponse(updated), commandId: 'converted' };
        }
        async getStats(salonId, startDate, endDate) {
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.cartLinks.salonId, salonId)];
            if (startDate)
                conditions.push((0, drizzle_orm_1.gte)(schema_1.cartLinks.createdAt, new Date(startDate)));
            if (endDate)
                conditions.push((0, drizzle_orm_1.lte)(schema_1.cartLinks.createdAt, new Date(endDate)));
            const links = await connection_1.db.select().from(schema_1.cartLinks).where((0, drizzle_orm_1.and)(...conditions));
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
        formatLinkResponse(link, _includeSalon = false) {
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
                items: (link.items || []).map((i) => ({
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
    };
    return CartLinksService = _classThis;
})();
exports.CartLinksService = CartLinksService;
//# sourceMappingURL=cart-links.service.js.map