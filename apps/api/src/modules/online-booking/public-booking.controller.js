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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
exports.PublicBookingController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../../database/schema"));
const dto_1 = require("./dto");
const crypto_1 = require("crypto");
const swagger_1 = require("@nestjs/swagger");
/**
 * Controller público para agendamento online
 * Não requer autenticação - acessível por clientes
 */
let PublicBookingController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('PublicBooking'), (0, public_decorator_1.Public)(), (0, common_1.Controller)('public/booking')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getSalonInfo_decorators;
    let _getAvailableServices_decorators;
    let _getAvailableProfessionals_decorators;
    let _getAvailableSlots_decorators;
    let _checkClientEligibility_decorators;
    let _createHold_decorators;
    let _extendHold_decorators;
    let _releaseHold_decorators;
    let _sendOtp_decorators;
    let _verifyOtp_decorators;
    let _confirmBooking_decorators;
    let _getAppointmentStatus_decorators;
    let _cancelBooking_decorators;
    var PublicBookingController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getSalonInfo_decorators = [(0, common_1.Get)(':salonSlug/info')];
            _getAvailableServices_decorators = [(0, common_1.Get)(':salonSlug/services')];
            _getAvailableProfessionals_decorators = [(0, common_1.Get)(':salonSlug/professionals')];
            _getAvailableSlots_decorators = [(0, common_1.Get)(':salonSlug/slots')];
            _checkClientEligibility_decorators = [(0, common_1.Post)(':salonSlug/check-eligibility')];
            _createHold_decorators = [(0, common_1.Post)(':salonSlug/hold')];
            _extendHold_decorators = [(0, common_1.Post)(':salonSlug/hold/:holdId/extend')];
            _releaseHold_decorators = [(0, common_1.Post)(':salonSlug/hold/:holdId/release')];
            _sendOtp_decorators = [(0, common_1.Post)(':salonSlug/otp/send')];
            _verifyOtp_decorators = [(0, common_1.Post)(':salonSlug/otp/verify')];
            _confirmBooking_decorators = [(0, common_1.Post)(':salonSlug/confirm')];
            _getAppointmentStatus_decorators = [(0, common_1.Get)(':salonSlug/appointment/:appointmentId')];
            _cancelBooking_decorators = [(0, common_1.Post)(':salonSlug/cancel')];
            __esDecorate(this, null, _getSalonInfo_decorators, { kind: "method", name: "getSalonInfo", static: false, private: false, access: { has: obj => "getSalonInfo" in obj, get: obj => obj.getSalonInfo }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAvailableServices_decorators, { kind: "method", name: "getAvailableServices", static: false, private: false, access: { has: obj => "getAvailableServices" in obj, get: obj => obj.getAvailableServices }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAvailableProfessionals_decorators, { kind: "method", name: "getAvailableProfessionals", static: false, private: false, access: { has: obj => "getAvailableProfessionals" in obj, get: obj => obj.getAvailableProfessionals }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAvailableSlots_decorators, { kind: "method", name: "getAvailableSlots", static: false, private: false, access: { has: obj => "getAvailableSlots" in obj, get: obj => obj.getAvailableSlots }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkClientEligibility_decorators, { kind: "method", name: "checkClientEligibility", static: false, private: false, access: { has: obj => "checkClientEligibility" in obj, get: obj => obj.checkClientEligibility }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createHold_decorators, { kind: "method", name: "createHold", static: false, private: false, access: { has: obj => "createHold" in obj, get: obj => obj.createHold }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _extendHold_decorators, { kind: "method", name: "extendHold", static: false, private: false, access: { has: obj => "extendHold" in obj, get: obj => obj.extendHold }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _releaseHold_decorators, { kind: "method", name: "releaseHold", static: false, private: false, access: { has: obj => "releaseHold" in obj, get: obj => obj.releaseHold }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sendOtp_decorators, { kind: "method", name: "sendOtp", static: false, private: false, access: { has: obj => "sendOtp" in obj, get: obj => obj.sendOtp }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _verifyOtp_decorators, { kind: "method", name: "verifyOtp", static: false, private: false, access: { has: obj => "verifyOtp" in obj, get: obj => obj.verifyOtp }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _confirmBooking_decorators, { kind: "method", name: "confirmBooking", static: false, private: false, access: { has: obj => "confirmBooking" in obj, get: obj => obj.confirmBooking }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAppointmentStatus_decorators, { kind: "method", name: "getAppointmentStatus", static: false, private: false, access: { has: obj => "getAppointmentStatus" in obj, get: obj => obj.getAppointmentStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cancelBooking_decorators, { kind: "method", name: "cancelBooking", static: false, private: false, access: { has: obj => "cancelBooking" in obj, get: obj => obj.cancelBooking }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PublicBookingController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db = __runInitializers(this, _instanceExtraInitializers);
        settingsService;
        holdsService;
        otpService;
        depositsService;
        rulesService;
        scheduledMessagesService;
        logger = new common_1.Logger(PublicBookingController.name);
        constructor(db, settingsService, holdsService, otpService, depositsService, rulesService, scheduledMessagesService) {
            this.db = db;
            this.settingsService = settingsService;
            this.holdsService = holdsService;
            this.otpService = otpService;
            this.depositsService = depositsService;
            this.rulesService = rulesService;
            this.scheduledMessagesService = scheduledMessagesService;
        }
        /**
         * Obtém informações do salão para booking
         */
        async getSalonInfo(salonSlug) {
            const salon = await this.findSalonBySlug(salonSlug);
            const settings = await this.settingsService.getSettings(salon.id);
            if (!settings.enabled) {
                throw new common_1.BadRequestException('Agendamento online não está disponível');
            }
            return {
                salonId: salon.id,
                salonName: salon.name,
                welcomeMessage: settings.welcomeMessage,
                termsUrl: settings.termsUrl,
                requireTermsAcceptance: settings.requireTermsAcceptance,
                requirePhoneVerification: settings.requirePhoneVerification,
                minAdvanceHours: settings.minAdvanceHours,
                maxAdvanceDays: settings.maxAdvanceDays,
                cancellationHours: settings.cancellationHours,
                allowRescheduling: settings.allowRescheduling,
            };
        }
        /**
         * Lista serviços disponíveis para agendamento online
         */
        async getAvailableServices(salonSlug) {
            const salon = await this.findSalonBySlug(salonSlug);
            await this.checkBookingEnabled(salon.id);
            const services = await this.db
                .select({
                id: schema.services.id,
                name: schema.services.name,
                description: schema.services.description,
                category: schema.services.category,
                durationMinutes: schema.services.durationMinutes,
                basePrice: schema.services.basePrice,
            })
                .from(schema.services)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.services.salonId, salon.id), (0, drizzle_orm_1.eq)(schema.services.active, true), (0, drizzle_orm_1.eq)(schema.services.allowOnlineBooking, true)))
                .orderBy(schema.services.name);
            return services;
        }
        /**
         * Lista profissionais disponíveis para um serviço
         */
        async getAvailableProfessionals(salonSlug, serviceId) {
            const salon = await this.findSalonBySlug(salonSlug);
            await this.checkBookingEnabled(salon.id);
            // Busca profissionais ativos que são stylists
            const professionals = await this.db
                .select({
                id: schema.users.id,
                name: schema.users.name,
                role: schema.users.role,
            })
                .from(schema.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.salonId, salon.id), (0, drizzle_orm_1.eq)(schema.users.active, true), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema.users.role, 'STYLIST'), (0, drizzle_orm_1.eq)(schema.users.role, 'OWNER'), (0, drizzle_orm_1.eq)(schema.users.role, 'MANAGER'))))
                .orderBy(schema.users.name);
            // Filtra por professional_services quando serviceId informado
            if (serviceId) {
                const sid = parseInt(serviceId, 10);
                if (!isNaN(sid)) {
                    const enabledIds = await this.db
                        .select({ professionalId: schema.professionalServices.professionalId })
                        .from(schema.professionalServices)
                        .innerJoin(schema.users, (0, drizzle_orm_1.eq)(schema.professionalServices.professionalId, schema.users.id))
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.professionalServices.serviceId, sid), (0, drizzle_orm_1.eq)(schema.professionalServices.enabled, true), (0, drizzle_orm_1.eq)(schema.users.salonId, salon.id)));
                    // Só filtra se existirem assignments (fallback legacy: sem filtro)
                    if (enabledIds.length > 0) {
                        const aptSet = new Set(enabledIds.map((r) => r.professionalId));
                        return professionals.filter((p) => aptSet.has(p.id));
                    }
                }
            }
            return professionals;
        }
        /**
         * Obtém horários disponíveis
         */
        async getAvailableSlots(salonSlug, query) {
            const salon = await this.findSalonBySlug(salonSlug);
            await this.checkBookingEnabled(salon.id);
            const { professionalId, serviceId, startDate, endDate } = query;
            const finalEndDate = endDate || startDate;
            // Busca serviço
            let service = null;
            if (serviceId) {
                const [svc] = await this.db
                    .select()
                    .from(schema.services)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.services.id, serviceId), (0, drizzle_orm_1.eq)(schema.services.salonId, salon.id), (0, drizzle_orm_1.eq)(schema.services.active, true)))
                    .limit(1);
                service = svc;
            }
            // Busca profissionais
            const professionalsConditions = [
                (0, drizzle_orm_1.eq)(schema.users.salonId, salon.id),
                (0, drizzle_orm_1.eq)(schema.users.active, true),
            ];
            if (professionalId) {
                professionalsConditions.push((0, drizzle_orm_1.eq)(schema.users.id, professionalId));
            }
            let professionals = await this.db
                .select()
                .from(schema.users)
                .where((0, drizzle_orm_1.and)(...professionalsConditions));
            // Filtra por professional_services quando serviceId informado
            if (serviceId) {
                const enabledIds = await this.db
                    .select({ professionalId: schema.professionalServices.professionalId })
                    .from(schema.professionalServices)
                    .innerJoin(schema.users, (0, drizzle_orm_1.eq)(schema.professionalServices.professionalId, schema.users.id))
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.professionalServices.serviceId, serviceId), (0, drizzle_orm_1.eq)(schema.professionalServices.enabled, true), (0, drizzle_orm_1.eq)(schema.users.salonId, salon.id)));
                if (enabledIds.length > 0) {
                    const aptSet = new Set(enabledIds.map((r) => r.professionalId));
                    professionals = professionals.filter((p) => aptSet.has(p.id));
                }
            }
            const slots = [];
            // Para cada profissional, gera slots disponíveis
            for (const professional of professionals) {
                const professionalSlots = await this.generateSlotsForProfessional(salon.id, professional, service, startDate, finalEndDate);
                slots.push(...professionalSlots);
            }
            return slots.sort((a, b) => {
                if (a.date !== b.date)
                    return a.date.localeCompare(b.date);
                return a.time.localeCompare(b.time);
            });
        }
        /**
         * Verifica elegibilidade do cliente antes de criar hold
         */
        async checkClientEligibility(salonSlug, body) {
            const salon = await this.findSalonBySlug(salonSlug);
            await this.checkBookingEnabled(salon.id);
            const eligibility = await this.rulesService.checkBookingEligibility(salon.id, body.clientPhone, body.serviceId);
            // Busca configuracoes para calcular deposito
            const settings = await this.settingsService.getSettings(salon.id);
            let depositRequired = eligibility.requiresDeposit || false;
            let depositAmount = null;
            // Se cliente tem regra de deposito OU configuracao global exige
            if (eligibility.requiresDeposit || settings.depositType !== 'NONE') {
                depositRequired = true;
                // Busca servico para calcular valor
                if (body.serviceId) {
                    const [service] = await this.db
                        .select()
                        .from(schema.services)
                        .where((0, drizzle_orm_1.eq)(schema.services.id, body.serviceId))
                        .limit(1);
                    if (service) {
                        if (eligibility.requiresDeposit) {
                            // Cliente com regra especifica: 20% do valor
                            depositAmount = parseFloat(service.basePrice) * 0.2;
                        }
                        else {
                            // Configuracao global
                            depositAmount = await this.depositsService.calculateDepositAmount(salon.id, parseFloat(service.basePrice));
                        }
                    }
                }
            }
            return {
                canBook: eligibility.canBook,
                reason: eligibility.reason,
                requiresDeposit: depositRequired,
                depositAmount,
                isClientBlocked: !eligibility.canBook && eligibility.reason?.includes('bloqueado'),
            };
        }
        /**
         * Cria uma reserva temporária (hold)
         */
        async createHold(salonSlug, dto, clientIp) {
            const salon = await this.findSalonBySlug(salonSlug);
            await this.checkBookingEnabled(salon.id);
            // Verifica elegibilidade do cliente
            const eligibility = await this.rulesService.checkBookingEligibility(salon.id, dto.clientPhone, dto.serviceId);
            if (!eligibility.canBook) {
                throw new common_1.BadRequestException(eligibility.reason);
            }
            return this.holdsService.createHold(salon.id, dto, clientIp);
        }
        /**
         * Estende o tempo de uma reserva
         */
        async extendHold(salonSlug, holdId) {
            const salon = await this.findSalonBySlug(salonSlug);
            return this.holdsService.extendHold(salon.id, holdId);
        }
        /**
         * Libera uma reserva
         */
        async releaseHold(salonSlug, holdId) {
            const salon = await this.findSalonBySlug(salonSlug);
            await this.holdsService.releaseHold(salon.id, holdId);
            return { message: 'Reserva liberada com sucesso' };
        }
        /**
         * Envia código OTP para verificação de telefone
         */
        async sendOtp(salonSlug, dto, clientIp) {
            const salon = await this.findSalonBySlug(salonSlug);
            return this.otpService.sendOtp(salon.id, dto, clientIp);
        }
        /**
         * Verifica código OTP
         */
        async verifyOtp(salonSlug, dto) {
            const salon = await this.findSalonBySlug(salonSlug);
            return this.otpService.verifyOtp(salon.id, dto);
        }
        /**
         * Confirma agendamento (converte hold em appointment)
         */
        async confirmBooking(salonSlug, dto, clientIp) {
            const salon = await this.findSalonBySlug(salonSlug);
            const settings = await this.settingsService.getSettings(salon.id);
            if (!settings.enabled) {
                throw new common_1.BadRequestException('Agendamento online não está disponível');
            }
            // Verifica verificação de telefone
            if (settings.requirePhoneVerification) {
                // Verifica se o telefone foi verificado recentemente (últimas 24h)
                const phoneVerified = await this.otpService.isPhoneVerifiedRecently(salon.id, dto.clientPhone);
                if (!phoneVerified) {
                    throw new common_1.BadRequestException('Telefone não verificado. Por favor, solicite um novo código.');
                }
            }
            // Verifica elegibilidade
            const eligibility = await this.rulesService.checkBookingEligibility(salon.id, dto.clientPhone, dto.serviceId);
            if (!eligibility.canBook) {
                throw new common_1.BadRequestException(eligibility.reason);
            }
            // Busca ou cria cliente
            let client = await this.findOrCreateClient(salon.id, dto);
            // Busca serviço
            const [service] = await this.db
                .select()
                .from(schema.services)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.services.id, dto.serviceId), (0, drizzle_orm_1.eq)(schema.services.salonId, salon.id)))
                .limit(1);
            if (!service) {
                throw new common_1.NotFoundException('Serviço não encontrado');
            }
            // Busca profissional
            const [professional] = await this.db
                .select()
                .from(schema.users)
                .where((0, drizzle_orm_1.eq)(schema.users.id, dto.professionalId))
                .limit(1);
            if (!professional) {
                throw new common_1.NotFoundException('Profissional não encontrado');
            }
            // Verifica conflitos
            const endTime = this.addMinutes(dto.time, service.durationMinutes);
            const hasConflict = await this.holdsService.checkAppointmentConflict(salon.id, dto.professionalId, dto.date, dto.time, endTime);
            if (hasConflict) {
                throw new common_1.BadRequestException('Este horário não está mais disponível');
            }
            // Gera token de acesso do cliente
            const clientAccessToken = (0, crypto_1.randomUUID)();
            const tokenExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias
            // Cria o agendamento
            const [appointment] = await this.db
                .insert(schema.appointments)
                .values({
                salonId: salon.id,
                clientId: client.id,
                clientName: dto.clientName,
                clientPhone: dto.clientPhone,
                clientEmail: dto.clientEmail,
                professionalId: dto.professionalId,
                serviceId: dto.serviceId,
                service: service.name,
                date: dto.date,
                time: dto.time,
                startTime: dto.time,
                endTime,
                duration: service.durationMinutes,
                price: service.basePrice,
                status: 'PENDING_CONFIRMATION',
                confirmationStatus: 'PENDING',
                source: 'ONLINE',
                notes: dto.notes,
                verifiedPhone: settings.requirePhoneVerification,
                clientAccessToken,
                clientAccessTokenExpiresAt: tokenExpiration,
                bookedOnlineAt: new Date(),
                clientIp,
            })
                .returning();
            this.logger.log(`Agendamento online criado: ${appointment.id}`);
            // Verifica se precisa de depósito
            let depositData = {};
            const depositAmount = await this.depositsService.calculateDepositAmount(salon.id, parseFloat(service.basePrice));
            if (depositAmount > 0 || eligibility.requiresDeposit) {
                const finalAmount = depositAmount > 0 ? depositAmount : parseFloat(service.basePrice) * 0.2;
                const deposit = await this.depositsService.createDeposit(salon.id, {
                    appointmentId: appointment.id,
                    clientId: client.id,
                    amount: finalAmount,
                });
                const pixData = await this.depositsService.generatePixPayment(salon.id, deposit.id);
                // Atualiza agendamento com depositId
                await this.db
                    .update(schema.appointments)
                    .set({ depositId: deposit.id })
                    .where((0, drizzle_orm_1.eq)(schema.appointments.id, appointment.id));
                depositData = {
                    amount: finalAmount.toString(),
                    pixCode: pixData.pixCode,
                };
            }
            // Agenda notificações automáticas (confirmação, lembrete 24h, lembrete 1h30)
            await this.scheduledMessagesService.scheduleAllAppointmentNotifications({
                ...appointment,
                professionalName: professional.name,
            });
            return {
                appointmentId: appointment.id,
                date: appointment.date,
                time: appointment.time,
                professionalName: professional.name,
                serviceName: service.name,
                clientAccessToken,
                depositRequired: !!depositData.amount,
                depositAmount: depositData.amount,
                depositPixCode: depositData.pixCode,
            };
        }
        /**
         * Consulta status de um agendamento pelo token
         */
        async getAppointmentStatus(salonSlug, appointmentId, token) {
            const salon = await this.findSalonBySlug(salonSlug);
            const [appointment] = await this.db
                .select()
                .from(schema.appointments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.appointments.id, appointmentId), (0, drizzle_orm_1.eq)(schema.appointments.salonId, salon.id)))
                .limit(1);
            if (!appointment) {
                throw new common_1.NotFoundException('Agendamento não encontrado');
            }
            // Verifica token se fornecido
            if (token && appointment.clientAccessToken !== token) {
                throw new common_1.BadRequestException('Token inválido');
            }
            // Busca depósito se houver
            let deposit = null;
            if (appointment.depositId) {
                deposit = await this.depositsService.getDeposit(salon.id, appointment.depositId);
            }
            return {
                id: appointment.id,
                date: appointment.date,
                time: appointment.time,
                service: appointment.service,
                status: appointment.status,
                confirmationStatus: appointment.confirmationStatus,
                deposit: deposit ? {
                    status: deposit.status,
                    amount: deposit.amount,
                    paidAt: deposit.paidAt,
                } : null,
            };
        }
        /**
         * Cancela um agendamento
         */
        async cancelBooking(salonSlug, dto) {
            const salon = await this.findSalonBySlug(salonSlug);
            // Settings carregadas para futura validação de regras de cancelamento
            void this.settingsService.getSettings(salon.id);
            const [appointment] = await this.db
                .select()
                .from(schema.appointments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.appointments.id, dto.appointmentId), (0, drizzle_orm_1.eq)(schema.appointments.salonId, salon.id)))
                .limit(1);
            if (!appointment) {
                throw new common_1.NotFoundException('Agendamento não encontrado');
            }
            // Verifica autorização (token ou OTP)
            if (dto.clientAccessToken) {
                if (appointment.clientAccessToken !== dto.clientAccessToken) {
                    throw new common_1.BadRequestException('Token inválido');
                }
            }
            else if (dto.otpCode && appointment.clientPhone) {
                const otpResult = await this.otpService.verifyOtp(salon.id, {
                    phone: appointment.clientPhone,
                    code: dto.otpCode,
                    type: dto_1.OtpType.CANCEL_BOOKING,
                });
                if (!otpResult.valid) {
                    throw new common_1.BadRequestException(otpResult.message);
                }
            }
            else {
                throw new common_1.BadRequestException('Autorização inválida');
            }
            // Verifica se pode cancelar
            if (['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(appointment.status)) {
                throw new common_1.BadRequestException('Este agendamento não pode ser cancelado');
            }
            // Processa cancelamento
            await this.db
                .update(schema.appointments)
                .set({
                status: 'CANCELLED',
                cancellationReason: dto.reason || 'Cancelado pelo cliente via agendamento online',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.appointments.id, dto.appointmentId));
            // Processa depósito (reembolso se elegível)
            if (appointment.depositId) {
                const isEligible = await this.depositsService.isEligibleForRefund(salon.id, appointment.id);
                if (isEligible) {
                    await this.depositsService.refundDeposit(salon.id, appointment.depositId, 'Cancelamento dentro do prazo');
                }
                else {
                    await this.depositsService.forfeitDeposit(salon.id, appointment.depositId, 'Cancelamento fora do prazo');
                }
            }
            this.logger.log(`Agendamento ${dto.appointmentId} cancelado pelo cliente`);
            return { message: 'Agendamento cancelado com sucesso' };
        }
        // ==================== MÉTODOS AUXILIARES ====================
        /**
         * Busca salão pelo slug
         */
        async findSalonBySlug(slug) {
            const [salon] = await this.db
                .select()
                .from(schema.salons)
                .where((0, drizzle_orm_1.eq)(schema.salons.slug, slug))
                .limit(1);
            if (!salon) {
                throw new common_1.NotFoundException('Salão não encontrado');
            }
            return salon;
        }
        /**
         * Verifica se booking está habilitado
         */
        async checkBookingEnabled(salonId) {
            const isEnabled = await this.settingsService.isEnabled(salonId);
            if (!isEnabled) {
                throw new common_1.BadRequestException('Agendamento online não está disponível');
            }
        }
        /**
         * Busca ou cria cliente
         */
        async findOrCreateClient(salonId, dto) {
            // Busca cliente existente
            let [client] = await this.db
                .select()
                .from(schema.clients)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clients.salonId, salonId), (0, drizzle_orm_1.eq)(schema.clients.phone, dto.clientPhone)))
                .limit(1);
            if (!client) {
                // Cria novo cliente
                [client] = await this.db
                    .insert(schema.clients)
                    .values({
                    salonId,
                    name: dto.clientName,
                    phone: dto.clientPhone,
                    email: dto.clientEmail,
                })
                    .returning();
                this.logger.log(`Novo cliente criado via booking online: ${client.id}`);
            }
            return client;
        }
        /**
         * Gera slots disponíveis para um profissional
         */
        async generateSlotsForProfessional(salonId, professional, service, startDate, endDate) {
            const slots = [];
            const duration = service?.durationMinutes || 60;
            const serviceName = service?.name || 'Serviço';
            const serviceId = service?.id || 0;
            const price = service?.basePrice || '0';
            // Gera datas no intervalo
            const start = new Date(startDate);
            const end = new Date(endDate);
            const current = new Date(start);
            while (current <= end) {
                const dateStr = current.toISOString().split('T')[0];
                // TODO: Implementar lógica real de disponibilidade baseada em:
                // 1. Horário de trabalho do profissional (work_schedule)
                // 2. Bloqueios (blocks)
                // 3. Agendamentos existentes
                // 4. Holds ativos
                // Por enquanto, gera slots de exemplo das 9h às 18h
                for (let hour = 9; hour < 18; hour++) {
                    const time = `${hour.toString().padStart(2, '0')}:00`;
                    const endTime = this.addMinutes(time, duration);
                    // Verifica se não há conflitos
                    const hasConflict = await this.holdsService.checkAppointmentConflict(salonId, professional.id, dateStr, time, endTime);
                    const hasHoldConflict = await this.holdsService.checkHoldConflict(salonId, professional.id, dateStr, time, endTime);
                    if (!hasConflict && !hasHoldConflict) {
                        slots.push({
                            date: dateStr,
                            time,
                            endTime,
                            professionalId: professional.id,
                            professionalName: professional.name,
                            serviceId,
                            serviceName,
                            duration,
                            price,
                        });
                    }
                }
                current.setDate(current.getDate() + 1);
            }
            return slots;
        }
        /**
         * Adiciona minutos a um horário
         */
        addMinutes(time, minutes) {
            const [h, m] = time.split(':').map(Number);
            const totalMinutes = h * 60 + m + minutes;
            const newH = Math.floor(totalMinutes / 60) % 24;
            const newM = totalMinutes % 60;
            return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
        }
    };
    return PublicBookingController = _classThis;
})();
exports.PublicBookingController = PublicBookingController;
//# sourceMappingURL=public-booking.controller.js.map