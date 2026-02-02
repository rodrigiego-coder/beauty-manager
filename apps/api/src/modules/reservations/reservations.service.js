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
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
let ReservationsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ReservationsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ReservationsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        async getReservations(salonId, options) {
            const page = options?.page || 1;
            const limit = options?.limit || 20;
            const offset = (page - 1) * limit;
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.productReservations.salonId, salonId)];
            if (options?.status)
                conditions.push((0, drizzle_orm_1.eq)(schema_1.productReservations.status, options.status));
            if (options?.clientId)
                conditions.push((0, drizzle_orm_1.eq)(schema_1.productReservations.clientId, options.clientId));
            if (options?.deliveryType)
                conditions.push((0, drizzle_orm_1.eq)(schema_1.productReservations.deliveryType, options.deliveryType));
            if (options?.startDate)
                conditions.push((0, drizzle_orm_1.gte)(schema_1.productReservations.createdAt, new Date(options.startDate)));
            if (options?.endDate)
                conditions.push((0, drizzle_orm_1.lte)(schema_1.productReservations.createdAt, new Date(options.endDate)));
            const [reservations, totalResult] = await Promise.all([
                connection_1.db.select().from(schema_1.productReservations).where((0, drizzle_orm_1.and)(...conditions)).orderBy((0, drizzle_orm_1.desc)(schema_1.productReservations.createdAt)).limit(limit).offset(offset),
                connection_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.productReservations).where((0, drizzle_orm_1.and)(...conditions)),
            ]);
            const data = await Promise.all(reservations.map(r => this.formatReservationResponse(r)));
            return { data, total: totalResult[0].count, page, limit };
        }
        async getReservationById(salonId, id) {
            const [reservation] = await connection_1.db.select().from(schema_1.productReservations).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.productReservations.id, id), (0, drizzle_orm_1.eq)(schema_1.productReservations.salonId, salonId)));
            if (!reservation)
                throw new common_1.NotFoundException('Reserva não encontrada');
            return this.formatReservationResponse(reservation);
        }
        async createReservation(salonId, dto) {
            const [client] = await connection_1.db.select().from(schema_1.clients).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.clients.id, dto.clientId), (0, drizzle_orm_1.eq)(schema_1.clients.salonId, salonId)));
            if (!client)
                throw new common_1.NotFoundException('Cliente não encontrado');
            const items = dto.items.map(item => ({ productId: item.productId, name: 'Produto', quantity: item.quantity || 1, price: 0 }));
            const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
            const [reservation] = await connection_1.db.insert(schema_1.productReservations).values({
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
        async updateReservation(salonId, id, dto) {
            const [existing] = await connection_1.db.select().from(schema_1.productReservations).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.productReservations.id, id), (0, drizzle_orm_1.eq)(schema_1.productReservations.salonId, salonId)));
            if (!existing)
                throw new common_1.NotFoundException('Reserva não encontrada');
            const updateData = { updatedAt: new Date() };
            if (dto.deliveryType !== undefined)
                updateData.deliveryType = dto.deliveryType;
            if (dto.deliveryAddress !== undefined)
                updateData.deliveryAddress = dto.deliveryAddress;
            if (dto.scheduledDate !== undefined)
                updateData.scheduledPickupDate = dto.scheduledDate;
            if (dto.notes !== undefined)
                updateData.notes = dto.notes;
            const [updated] = await connection_1.db.update(schema_1.productReservations).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.productReservations.id, id)).returning();
            return this.formatReservationResponse(updated);
        }
        async updateStatus(salonId, id, dto, userId) {
            const [existing] = await connection_1.db.select().from(schema_1.productReservations).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.productReservations.id, id), (0, drizzle_orm_1.eq)(schema_1.productReservations.salonId, salonId)));
            if (!existing)
                throw new common_1.NotFoundException('Reserva não encontrada');
            const updateData = { status: dto.status, updatedAt: new Date() };
            switch (dto.status) {
                case 'CONFIRMED':
                    updateData.confirmedAt = new Date();
                    updateData.confirmedById = userId;
                    break;
                case 'READY':
                    updateData.readyAt = new Date();
                    break;
                case 'DELIVERED':
                    updateData.deliveredAt = new Date();
                    break;
                case 'CANCELLED':
                    updateData.cancelledAt = new Date();
                    updateData.cancellationReason = dto.notes;
                    break;
            }
            const [updated] = await connection_1.db.update(schema_1.productReservations).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.productReservations.id, id)).returning();
            return this.formatReservationResponse(updated);
        }
        async deleteReservation(salonId, id) {
            const [existing] = await connection_1.db.select().from(schema_1.productReservations).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.productReservations.id, id), (0, drizzle_orm_1.eq)(schema_1.productReservations.salonId, salonId)));
            if (!existing)
                throw new common_1.NotFoundException('Reserva não encontrada');
            if (existing.status !== 'PENDING')
                throw new common_1.BadRequestException('Apenas reservas pendentes podem ser excluídas');
            await connection_1.db.delete(schema_1.productReservations).where((0, drizzle_orm_1.eq)(schema_1.productReservations.id, id));
        }
        async getStats(salonId, startDate, endDate) {
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.productReservations.salonId, salonId)];
            if (startDate)
                conditions.push((0, drizzle_orm_1.gte)(schema_1.productReservations.createdAt, new Date(startDate)));
            if (endDate)
                conditions.push((0, drizzle_orm_1.lte)(schema_1.productReservations.createdAt, new Date(endDate)));
            const reservations = await connection_1.db.select().from(schema_1.productReservations).where((0, drizzle_orm_1.and)(...conditions));
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
        async formatReservationResponse(reservation) {
            const [client] = reservation.clientId
                ? await connection_1.db.select({ id: schema_1.clients.id, name: schema_1.clients.name, phone: schema_1.clients.phone }).from(schema_1.clients).where((0, drizzle_orm_1.eq)(schema_1.clients.id, reservation.clientId))
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
    };
    return ReservationsService = _classThis;
})();
exports.ReservationsService = ReservationsService;
//# sourceMappingURL=reservations.service.js.map