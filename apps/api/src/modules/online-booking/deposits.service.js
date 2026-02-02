"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../../database/schema"));
let DepositsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DepositsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DepositsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        settingsService;
        logger = new common_1.Logger(DepositsService.name);
        DEPOSIT_EXPIRATION_HOURS = 24;
        constructor(db, settingsService) {
            this.db = db;
            this.settingsService = settingsService;
        }
        /**
         * Calcula o valor do depósito para um serviço
         */
        async calculateDepositAmount(salonId, servicePrice) {
            const settings = await this.settingsService.getSettings(salonId);
            if (!settings.requireDeposit) {
                return 0;
            }
            // Verifica se o serviço atinge o valor mínimo para exigir depósito
            const minServices = parseFloat(settings.depositMinServices || '0');
            if (servicePrice < minServices) {
                return 0;
            }
            const depositValue = parseFloat(settings.depositValue || '0');
            if (settings.depositType === 'PERCENTAGE') {
                return Math.round(servicePrice * (depositValue / 100) * 100) / 100;
            }
            // FIXED
            return depositValue;
        }
        /**
         * Cria um depósito para um agendamento
         */
        async createDeposit(salonId, dto) {
            const { appointmentId, holdId, clientId, amount } = dto;
            if (!appointmentId && !holdId) {
                throw new common_1.BadRequestException('Deve informar appointmentId ou holdId');
            }
            const expiresAt = new Date(Date.now() + this.DEPOSIT_EXPIRATION_HOURS * 60 * 60 * 1000);
            const [deposit] = await this.db
                .insert(schema.appointmentDeposits)
                .values({
                salonId,
                appointmentId,
                holdId,
                clientId,
                amount: amount.toString(),
                status: 'PENDING',
                expiresAt,
            })
                .returning();
            this.logger.log(`Depósito criado: ${deposit.id} - R$ ${amount}`);
            return deposit;
        }
        /**
         * Obtém um depósito pelo ID
         */
        async getDeposit(salonId, depositId) {
            const [deposit] = await this.db
                .select()
                .from(schema.appointmentDeposits)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.appointmentDeposits.id, depositId), (0, drizzle_orm_1.eq)(schema.appointmentDeposits.salonId, salonId)))
                .limit(1);
            return deposit || null;
        }
        /**
         * Obtém depósito por agendamento
         */
        async getDepositByAppointment(salonId, appointmentId) {
            const [deposit] = await this.db
                .select()
                .from(schema.appointmentDeposits)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.appointmentDeposits.salonId, salonId), (0, drizzle_orm_1.eq)(schema.appointmentDeposits.appointmentId, appointmentId)))
                .limit(1);
            return deposit || null;
        }
        /**
         * Obtém depósito por hold
         */
        async getDepositByHold(salonId, holdId) {
            const [deposit] = await this.db
                .select()
                .from(schema.appointmentDeposits)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.appointmentDeposits.salonId, salonId), (0, drizzle_orm_1.eq)(schema.appointmentDeposits.holdId, holdId)))
                .limit(1);
            return deposit || null;
        }
        /**
         * Marca depósito como pago
         */
        async markAsPaid(salonId, depositId, paymentData) {
            const deposit = await this.getDeposit(salonId, depositId);
            if (!deposit) {
                throw new common_1.NotFoundException('Depósito não encontrado');
            }
            if (deposit.status !== 'PENDING') {
                throw new common_1.BadRequestException('Depósito não está pendente');
            }
            const [updated] = await this.db
                .update(schema.appointmentDeposits)
                .set({
                status: 'PAID',
                paymentMethod: paymentData.paymentMethod,
                paymentReference: paymentData.paymentReference,
                mercadoPagoPaymentId: paymentData.mercadoPagoPaymentId,
                paidAt: new Date(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.appointmentDeposits.id, depositId))
                .returning();
            this.logger.log(`Depósito ${depositId} marcado como pago`);
            return updated;
        }
        /**
         * Vincula depósito a um agendamento (quando criado a partir de hold)
         */
        async linkToAppointment(salonId, depositId, appointmentId) {
            await this.db
                .update(schema.appointmentDeposits)
                .set({
                appointmentId,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.appointmentDeposits.id, depositId), (0, drizzle_orm_1.eq)(schema.appointmentDeposits.salonId, salonId)));
        }
        /**
         * Processa reembolso do depósito
         */
        async refundDeposit(salonId, depositId, reason) {
            const deposit = await this.getDeposit(salonId, depositId);
            if (!deposit) {
                throw new common_1.NotFoundException('Depósito não encontrado');
            }
            if (deposit.status !== 'PAID') {
                throw new common_1.BadRequestException('Apenas depósitos pagos podem ser reembolsados');
            }
            // TODO: Integrar com Mercado Pago para processar reembolso real
            // if (deposit.mercadoPagoPaymentId) {
            //   await this.mercadoPagoService.refund(deposit.mercadoPagoPaymentId);
            // }
            const [updated] = await this.db
                .update(schema.appointmentDeposits)
                .set({
                status: 'REFUNDED',
                refundedAt: new Date(),
                notes: reason,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.appointmentDeposits.id, depositId))
                .returning();
            this.logger.log(`Depósito ${depositId} reembolsado`);
            return updated;
        }
        /**
         * Marca depósito como perdido (no-show ou cancelamento tardio)
         */
        async forfeitDeposit(salonId, depositId, reason) {
            const deposit = await this.getDeposit(salonId, depositId);
            if (!deposit) {
                throw new common_1.NotFoundException('Depósito não encontrado');
            }
            if (deposit.status !== 'PAID') {
                throw new common_1.BadRequestException('Apenas depósitos pagos podem ser perdidos');
            }
            const [updated] = await this.db
                .update(schema.appointmentDeposits)
                .set({
                status: 'FORFEITED',
                forfeitedAt: new Date(),
                notes: reason,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.appointmentDeposits.id, depositId))
                .returning();
            this.logger.log(`Depósito ${depositId} perdido: ${reason}`);
            return updated;
        }
        /**
         * Gera dados do PIX para pagamento
         * Integração com Mercado Pago
         */
        async generatePixPayment(salonId, depositId) {
            const deposit = await this.getDeposit(salonId, depositId);
            if (!deposit) {
                throw new common_1.NotFoundException('Depósito não encontrado');
            }
            if (deposit.status !== 'PENDING') {
                throw new common_1.BadRequestException('Depósito não está pendente');
            }
            // TODO: Integrar com Mercado Pago para gerar PIX real
            // const pixData = await this.mercadoPagoService.createPixPayment({
            //   amount: parseFloat(deposit.amount),
            //   description: 'Sinal de agendamento',
            //   externalReference: depositId,
            // });
            // Mock para desenvolvimento
            const mockPixCode = `00020126580014br.gov.bcb.pix0136${depositId}5204000053039865802BR5925SALON${Date.now()}6009SAO PAULO62070503***6304`;
            const mockQrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
            // Salva dados do PIX
            await this.db
                .update(schema.appointmentDeposits)
                .set({
                pixCode: mockPixCode,
                pixQrCodeBase64: mockQrCode,
                expiresAt,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.appointmentDeposits.id, depositId));
            return {
                pixCode: mockPixCode,
                qrCodeBase64: mockQrCode,
                expiresAt,
            };
        }
        /**
         * Verifica se o cancelamento é elegível para reembolso
         */
        async isEligibleForRefund(salonId, appointmentId) {
            const deposit = await this.getDepositByAppointment(salonId, appointmentId);
            if (!deposit || deposit.status !== 'PAID') {
                return false;
            }
            const settings = await this.settingsService.getSettings(salonId);
            // Busca agendamento para verificar data/hora
            const [appointment] = await this.db
                .select()
                .from(schema.appointments)
                .where((0, drizzle_orm_1.eq)(schema.appointments.id, appointmentId))
                .limit(1);
            if (!appointment) {
                return false;
            }
            // Calcula quantas horas faltam para o agendamento
            const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}:00`);
            const hoursUntilAppointment = (appointmentDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
            // Elegível se cancelar com antecedência mínima
            return hoursUntilAppointment >= settings.cancellationHours;
        }
    };
    return DepositsService = _classThis;
})();
exports.DepositsService = DepositsService;
//# sourceMappingURL=deposits.service.js.map