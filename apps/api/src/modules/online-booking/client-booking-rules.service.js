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
exports.ClientBookingRulesService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../../database/schema"));
const dto_1 = require("./dto");
let ClientBookingRulesService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ClientBookingRulesService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ClientBookingRulesService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        logger = new common_1.Logger(ClientBookingRulesService.name);
        constructor(db) {
            this.db = db;
        }
        /**
         * Cria uma regra de booking para um cliente
         */
        async createRule(salonId, dto, createdById) {
            if (!dto.clientPhone && !dto.clientId) {
                throw new common_1.BadRequestException('Deve informar clientPhone ou clientId');
            }
            const [rule] = await this.db
                .insert(schema.clientBookingRules)
                .values({
                salonId,
                clientPhone: dto.clientPhone,
                clientId: dto.clientId,
                ruleType: dto.ruleType,
                reason: dto.reason,
                restrictedServiceIds: dto.restrictedServiceIds,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
                createdById,
                isActive: true,
            })
                .returning();
            this.logger.log(`Regra ${dto.ruleType} criada para cliente ${dto.clientPhone || dto.clientId}`);
            return rule;
        }
        /**
         * Atualiza uma regra de booking
         */
        async updateRule(salonId, ruleId, dto) {
            const existingRule = await this.getRule(salonId, ruleId);
            if (!existingRule) {
                throw new common_1.NotFoundException('Regra não encontrada');
            }
            const updateData = {
                updatedAt: new Date(),
            };
            if (dto.ruleType !== undefined)
                updateData.ruleType = dto.ruleType;
            if (dto.reason !== undefined)
                updateData.reason = dto.reason;
            if (dto.restrictedServiceIds !== undefined)
                updateData.restrictedServiceIds = dto.restrictedServiceIds;
            if (dto.expiresAt !== undefined)
                updateData.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
            if (dto.isActive !== undefined)
                updateData.isActive = dto.isActive;
            const [updated] = await this.db
                .update(schema.clientBookingRules)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema.clientBookingRules.id, ruleId))
                .returning();
            return updated;
        }
        /**
         * Remove uma regra
         */
        async deleteRule(salonId, ruleId) {
            await this.db
                .delete(schema.clientBookingRules)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientBookingRules.id, ruleId), (0, drizzle_orm_1.eq)(schema.clientBookingRules.salonId, salonId)));
        }
        /**
         * Desativa uma regra
         */
        async deactivateRule(salonId, ruleId) {
            await this.db
                .update(schema.clientBookingRules)
                .set({
                isActive: false,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientBookingRules.id, ruleId), (0, drizzle_orm_1.eq)(schema.clientBookingRules.salonId, salonId)));
        }
        /**
         * Obtém uma regra pelo ID
         */
        async getRule(salonId, ruleId) {
            const [rule] = await this.db
                .select()
                .from(schema.clientBookingRules)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientBookingRules.id, ruleId), (0, drizzle_orm_1.eq)(schema.clientBookingRules.salonId, salonId)))
                .limit(1);
            return rule || null;
        }
        /**
         * Lista regras de um salão
         */
        async listRules(salonId, includeInactive = false) {
            const conditions = [(0, drizzle_orm_1.eq)(schema.clientBookingRules.salonId, salonId)];
            if (!includeInactive) {
                conditions.push((0, drizzle_orm_1.eq)(schema.clientBookingRules.isActive, true));
            }
            return this.db
                .select()
                .from(schema.clientBookingRules)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy(schema.clientBookingRules.createdAt);
        }
        /**
         * Obtém regras ativas para um cliente (por telefone ou ID)
         */
        async getActiveRulesForClient(salonId, clientPhone, clientId) {
            if (!clientPhone && !clientId) {
                return [];
            }
            const phoneCondition = clientPhone
                ? (0, drizzle_orm_1.eq)(schema.clientBookingRules.clientPhone, clientPhone)
                : undefined;
            const idCondition = clientId
                ? (0, drizzle_orm_1.eq)(schema.clientBookingRules.clientId, clientId)
                : undefined;
            const clientCondition = phoneCondition && idCondition
                ? (0, drizzle_orm_1.or)(phoneCondition, idCondition)
                : phoneCondition || idCondition;
            if (!clientCondition) {
                return [];
            }
            return this.db
                .select()
                .from(schema.clientBookingRules)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientBookingRules.salonId, salonId), (0, drizzle_orm_1.eq)(schema.clientBookingRules.isActive, true), clientCondition, (0, drizzle_orm_1.or)((0, drizzle_orm_1.isNull)(schema.clientBookingRules.expiresAt), (0, drizzle_orm_1.gt)(schema.clientBookingRules.expiresAt, new Date()))));
        }
        /**
         * Verifica elegibilidade de um cliente para agendar
         */
        async checkBookingEligibility(salonId, clientPhone, serviceId) {
            // Busca cliente existente
            const [client] = await this.db
                .select()
                .from(schema.clients)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clients.salonId, salonId), (0, drizzle_orm_1.eq)(schema.clients.phone, clientPhone)))
                .limit(1);
            // Busca regras ativas
            const rules = await this.getActiveRulesForClient(salonId, clientPhone, client?.id);
            if (rules.length === 0) {
                return { canBook: true };
            }
            // Processa regras (prioridade: BLOCKED > VIP_ONLY > RESTRICTED_SERVICES > DEPOSIT_REQUIRED)
            const result = { canBook: true };
            for (const rule of rules) {
                switch (rule.ruleType) {
                    case 'BLOCKED':
                        return {
                            canBook: false,
                            reason: rule.reason || 'Cliente bloqueado para agendamento online',
                        };
                    case 'VIP_ONLY':
                        result.isVipOnly = true;
                        result.reason = rule.reason || 'Este horário é exclusivo para clientes VIP';
                        break;
                    case 'RESTRICTED_SERVICES':
                        if (rule.restrictedServiceIds && serviceId) {
                            const restricted = rule.restrictedServiceIds;
                            if (restricted.includes(serviceId)) {
                                return {
                                    canBook: false,
                                    reason: rule.reason || 'Este serviço não está disponível para agendamento online',
                                    restrictedServices: restricted,
                                };
                            }
                        }
                        result.restrictedServices = rule.restrictedServiceIds;
                        break;
                    case 'DEPOSIT_REQUIRED':
                        result.requiresDeposit = true;
                        break;
                }
            }
            return result;
        }
        /**
         * Bloqueia um cliente para agendamento online
         */
        async blockClient(salonId, identifier, reason, createdById, expiresAt) {
            return this.createRule(salonId, {
                clientPhone: identifier.phone,
                clientId: identifier.clientId,
                ruleType: dto_1.BookingRuleType.BLOCKED,
                reason,
                expiresAt,
            }, createdById);
        }
        /**
         * Desbloqueia um cliente
         */
        async unblockClient(salonId, identifier) {
            const rules = await this.getActiveRulesForClient(salonId, identifier.phone, identifier.clientId);
            const blockRules = rules.filter((r) => r.ruleType === 'BLOCKED');
            for (const rule of blockRules) {
                await this.deactivateRule(salonId, rule.id);
            }
            this.logger.log(`Cliente ${identifier.phone || identifier.clientId} desbloqueado`);
        }
        /**
         * Lista clientes bloqueados
         */
        async listBlockedClients(salonId) {
            return this.db
                .select()
                .from(schema.clientBookingRules)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientBookingRules.salonId, salonId), (0, drizzle_orm_1.eq)(schema.clientBookingRules.ruleType, 'BLOCKED'), (0, drizzle_orm_1.eq)(schema.clientBookingRules.isActive, true), (0, drizzle_orm_1.or)((0, drizzle_orm_1.isNull)(schema.clientBookingRules.expiresAt), (0, drizzle_orm_1.gt)(schema.clientBookingRules.expiresAt, new Date()))));
        }
        /**
         * Verifica no-shows e bloqueia automaticamente se exceder limite
         */
        async checkAndBlockForNoShows(salonId, clientPhone, maxNoShows = 3, blockDays = 30, createdById) {
            // Busca cliente
            const [client] = await this.db
                .select()
                .from(schema.clients)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clients.salonId, salonId), (0, drizzle_orm_1.eq)(schema.clients.phone, clientPhone)))
                .limit(1);
            if (!client) {
                return false;
            }
            // Conta no-shows nos últimos 90 dias
            const noShowCount = await this.db
                .select()
                .from(schema.appointments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.appointments.salonId, salonId), (0, drizzle_orm_1.eq)(schema.appointments.clientId, client.id), (0, drizzle_orm_1.eq)(schema.appointments.status, 'NO_SHOW'), (0, drizzle_orm_1.gt)(schema.appointments.createdAt, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))));
            if (noShowCount.length >= maxNoShows) {
                // Verifica se já está bloqueado
                const existingBlock = await this.getActiveRulesForClient(salonId, clientPhone, client.id);
                const hasBlock = existingBlock.some((r) => r.ruleType === 'BLOCKED');
                if (!hasBlock) {
                    const expiresAt = new Date(Date.now() + blockDays * 24 * 60 * 60 * 1000);
                    await this.blockClient(salonId, { phone: clientPhone, clientId: client.id }, `Bloqueado automaticamente: ${noShowCount.length} faltas nos últimos 90 dias`, createdById, expiresAt.toISOString());
                    this.logger.warn(`Cliente ${clientPhone} bloqueado automaticamente por ${noShowCount.length} no-shows`);
                    return true;
                }
            }
            return false;
        }
    };
    return ClientBookingRulesService = _classThis;
})();
exports.ClientBookingRulesService = ClientBookingRulesService;
//# sourceMappingURL=client-booking-rules.service.js.map