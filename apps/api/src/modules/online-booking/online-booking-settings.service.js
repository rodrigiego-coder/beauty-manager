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
exports.OnlineBookingSettingsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../../database/schema"));
let OnlineBookingSettingsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var OnlineBookingSettingsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            OnlineBookingSettingsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        logger = new common_1.Logger(OnlineBookingSettingsService.name);
        constructor(db) {
            this.db = db;
        }
        /**
         * Obtém as configurações de booking online do salão
         * Cria configurações padrão se não existirem
         */
        async getSettings(salonId) {
            const [settings] = await this.db
                .select()
                .from(schema.onlineBookingSettings)
                .where((0, drizzle_orm_1.eq)(schema.onlineBookingSettings.salonId, salonId))
                .limit(1);
            // Busca slug do salão
            const [salon] = await this.db
                .select({ slug: schema.salons.slug })
                .from(schema.salons)
                .where((0, drizzle_orm_1.eq)(schema.salons.id, salonId))
                .limit(1);
            if (!settings) {
                // Criar configurações padrão
                const defaultSettings = await this.createDefaultSettings(salonId);
                return { ...defaultSettings, slug: salon?.slug || null };
            }
            return this.mapToResponse(settings, salon?.slug || null);
        }
        /**
         * Cria configurações padrão para o salão
         */
        async createDefaultSettings(salonId) {
            const [newSettings] = await this.db
                .insert(schema.onlineBookingSettings)
                .values({
                salonId,
                enabled: false,
                operationMode: 'SECRETARY_ONLY',
                minAdvanceHours: 2,
                maxAdvanceDays: 30,
                slotIntervalMinutes: 30,
                allowSameDayBooking: true,
                holdDurationMinutes: 10,
                cancellationHours: 24,
                allowRescheduling: true,
                maxReschedules: 2,
                requirePhoneVerification: true,
                requireDeposit: false,
                depositType: 'NONE',
                depositValue: '0',
                depositMinServices: '100',
                depositAppliesTo: 'ALL',
                allowNewClients: true,
                newClientRequiresApproval: false,
                newClientDepositRequired: false,
                maxWeeklyBookingsPerClient: 3,
                sendWhatsappConfirmation: true,
                sendWhatsappReminder: true,
                reminderHoursBefore: 24,
            })
                .returning();
            this.logger.log(`Configurações padrão criadas para salão ${salonId}`);
            return this.mapToResponse(newSettings);
        }
        /**
         * Atualiza as configurações de booking online
         */
        async updateSettings(salonId, dto) {
            // Garante que existem configurações
            await this.getSettings(salonId);
            const updateData = {
                updatedAt: new Date(),
            };
            // Mapeia campos do DTO
            if (dto.enabled !== undefined)
                updateData.enabled = dto.enabled;
            if (dto.operationMode !== undefined)
                updateData.operationMode = dto.operationMode;
            if (dto.minAdvanceHours !== undefined)
                updateData.minAdvanceHours = dto.minAdvanceHours;
            if (dto.maxAdvanceDays !== undefined)
                updateData.maxAdvanceDays = dto.maxAdvanceDays;
            if (dto.slotIntervalMinutes !== undefined)
                updateData.slotIntervalMinutes = dto.slotIntervalMinutes;
            if (dto.allowSameDayBooking !== undefined)
                updateData.allowSameDayBooking = dto.allowSameDayBooking;
            if (dto.holdDurationMinutes !== undefined)
                updateData.holdDurationMinutes = dto.holdDurationMinutes;
            if (dto.cancellationHours !== undefined)
                updateData.cancellationHours = dto.cancellationHours;
            if (dto.cancellationPolicy !== undefined)
                updateData.cancellationPolicy = dto.cancellationPolicy;
            if (dto.allowRescheduling !== undefined)
                updateData.allowRescheduling = dto.allowRescheduling;
            if (dto.maxReschedules !== undefined)
                updateData.maxReschedules = dto.maxReschedules;
            if (dto.requirePhoneVerification !== undefined)
                updateData.requirePhoneVerification = dto.requirePhoneVerification;
            if (dto.requireDeposit !== undefined)
                updateData.requireDeposit = dto.requireDeposit;
            if (dto.depositType !== undefined) {
                updateData.depositType = dto.depositType;
                // Quando NONE, zera o valor e desabilita exigência de depósito
                if (dto.depositType === 'NONE') {
                    updateData.depositValue = '0';
                    updateData.requireDeposit = false;
                }
            }
            if (dto.depositValue !== undefined && dto.depositType !== 'NONE') {
                updateData.depositValue = String(dto.depositValue);
            }
            if (dto.depositMinServices !== undefined)
                updateData.depositMinServices = String(dto.depositMinServices);
            if (dto.depositAppliesTo !== undefined)
                updateData.depositAppliesTo = dto.depositAppliesTo;
            if (dto.allowNewClients !== undefined)
                updateData.allowNewClients = dto.allowNewClients;
            if (dto.newClientRequiresApproval !== undefined)
                updateData.newClientRequiresApproval = dto.newClientRequiresApproval;
            if (dto.newClientDepositRequired !== undefined)
                updateData.newClientDepositRequired = dto.newClientDepositRequired;
            if (dto.maxDailyBookings !== undefined)
                updateData.maxDailyBookings = dto.maxDailyBookings;
            if (dto.maxWeeklyBookingsPerClient !== undefined)
                updateData.maxWeeklyBookingsPerClient = dto.maxWeeklyBookingsPerClient;
            if (dto.welcomeMessage !== undefined)
                updateData.welcomeMessage = dto.welcomeMessage;
            if (dto.confirmationMessage !== undefined)
                updateData.confirmationMessage = dto.confirmationMessage;
            if (dto.cancellationMessage !== undefined)
                updateData.cancellationMessage = dto.cancellationMessage;
            if (dto.termsUrl !== undefined)
                updateData.termsUrl = dto.termsUrl;
            if (dto.requireTermsAcceptance !== undefined)
                updateData.requireTermsAcceptance = dto.requireTermsAcceptance;
            if (dto.sendWhatsappConfirmation !== undefined)
                updateData.sendWhatsappConfirmation = dto.sendWhatsappConfirmation;
            if (dto.sendWhatsappReminder !== undefined)
                updateData.sendWhatsappReminder = dto.sendWhatsappReminder;
            if (dto.reminderHoursBefore !== undefined)
                updateData.reminderHoursBefore = dto.reminderHoursBefore;
            // Atualiza o slug na tabela salons (se fornecido)
            let updatedSlug = null;
            if (dto.slug !== undefined && dto.slug !== '') {
                await this.db
                    .update(schema.salons)
                    .set({ slug: dto.slug, updatedAt: new Date() })
                    .where((0, drizzle_orm_1.eq)(schema.salons.id, salonId));
                updatedSlug = dto.slug;
                this.logger.log(`Slug atualizado para salão ${salonId}: ${dto.slug}`);
            }
            else {
                // Busca slug atual do salão
                const [salon] = await this.db
                    .select({ slug: schema.salons.slug })
                    .from(schema.salons)
                    .where((0, drizzle_orm_1.eq)(schema.salons.id, salonId))
                    .limit(1);
                updatedSlug = salon?.slug || null;
            }
            const [updated] = await this.db
                .update(schema.onlineBookingSettings)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema.onlineBookingSettings.salonId, salonId))
                .returning();
            this.logger.log(`Configurações atualizadas para salão ${salonId}`);
            return this.mapToResponse(updated, updatedSlug);
        }
        /**
         * Habilita/desabilita o booking online
         */
        async toggleEnabled(salonId, enabled) {
            return this.updateSettings(salonId, { enabled });
        }
        /**
         * Verifica se o booking online está habilitado para o salão
         */
        async isEnabled(salonId) {
            const settings = await this.getSettings(salonId);
            return settings.enabled;
        }
        /**
         * Gera link assistido para Alexis enviar ao cliente
         * O link leva direto para a página de agendamento com parâmetros pré-preenchidos
         */
        async generateAssistedLink(dto) {
            const [salon] = await this.db
                .select()
                .from(schema.salons)
                .where((0, drizzle_orm_1.eq)(schema.salons.id, dto.salonId))
                .limit(1);
            if (!salon) {
                throw new common_1.NotFoundException('Salão não encontrado');
            }
            const params = new URLSearchParams();
            if (dto.serviceId)
                params.set('service', String(dto.serviceId));
            if (dto.professionalId)
                params.set('professional', dto.professionalId);
            if (dto.clientPhone)
                params.set('phone', dto.clientPhone);
            params.set('source', 'alexis');
            const baseUrl = process.env.FRONTEND_URL || 'https://app.beautymanager.com.br';
            const slug = salon.slug || salon.id;
            return {
                url: `${baseUrl}/agendar/${slug}?${params.toString()}`,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
            };
        }
        /**
         * Mapeia entidade para response
         */
        mapToResponse(settings, slug = null) {
            return {
                id: settings.id,
                salonId: settings.salonId,
                slug,
                enabled: settings.enabled,
                operationMode: settings.operationMode ?? 'SECRETARY_ONLY',
                minAdvanceHours: settings.minAdvanceHours,
                maxAdvanceDays: settings.maxAdvanceDays,
                slotIntervalMinutes: settings.slotIntervalMinutes ?? 30,
                allowSameDayBooking: settings.allowSameDayBooking ?? true,
                holdDurationMinutes: settings.holdDurationMinutes,
                cancellationHours: settings.cancellationHours,
                cancellationPolicy: settings.cancellationPolicy,
                allowRescheduling: settings.allowRescheduling,
                maxReschedules: settings.maxReschedules,
                requirePhoneVerification: settings.requirePhoneVerification,
                requireDeposit: settings.requireDeposit,
                depositType: settings.depositType,
                depositValue: settings.depositValue,
                depositMinServices: settings.depositMinServices,
                depositAppliesTo: settings.depositAppliesTo ?? 'ALL',
                allowNewClients: settings.allowNewClients,
                newClientRequiresApproval: settings.newClientRequiresApproval,
                newClientDepositRequired: settings.newClientDepositRequired,
                maxDailyBookings: settings.maxDailyBookings,
                maxWeeklyBookingsPerClient: settings.maxWeeklyBookingsPerClient,
                welcomeMessage: settings.welcomeMessage,
                confirmationMessage: settings.confirmationMessage,
                cancellationMessage: settings.cancellationMessage,
                termsUrl: settings.termsUrl,
                requireTermsAcceptance: settings.requireTermsAcceptance ?? false,
                sendWhatsappConfirmation: settings.sendWhatsappConfirmation ?? true,
                sendWhatsappReminder: settings.sendWhatsappReminder ?? true,
                reminderHoursBefore: settings.reminderHoursBefore ?? 24,
            };
        }
    };
    return OnlineBookingSettingsService = _classThis;
})();
exports.OnlineBookingSettingsService = OnlineBookingSettingsService;
//# sourceMappingURL=online-booking-settings.service.js.map