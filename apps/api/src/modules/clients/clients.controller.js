"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const dto_1 = require("../online-booking/dto");
let ClientsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('clients'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _getStats_decorators;
    let _search_decorators;
    let _findById_decorators;
    let _getHistory_decorators;
    let _create_decorators;
    let _update_decorators;
    let _reactivate_decorators;
    let _delete_decorators;
    let _toggleAi_decorators;
    let _getBookingRules_decorators;
    let _updateBookingRules_decorators;
    let _getClientsWithDepositRule_decorators;
    var ClientsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, common_1.Get)(), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getStats_decorators = [(0, common_1.Get)('stats'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _search_decorators = [(0, common_1.Get)('search'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _findById_decorators = [(0, common_1.Get)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getHistory_decorators = [(0, common_1.Get)(':id/history'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _create_decorators = [(0, common_1.Post)(), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _update_decorators = [(0, common_1.Patch)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _reactivate_decorators = [(0, common_1.Patch)(':id/reactivate'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _delete_decorators = [(0, common_1.Delete)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _toggleAi_decorators = [(0, common_1.Patch)(':id/toggle-ai'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _getBookingRules_decorators = [(0, common_1.Get)(':id/booking-rules'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _updateBookingRules_decorators = [(0, common_1.Patch)(':id/booking-rules'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getClientsWithDepositRule_decorators = [(0, common_1.Get)('with-deposit-rule'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _search_decorators, { kind: "method", name: "search", static: false, private: false, access: { has: obj => "search" in obj, get: obj => obj.search }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getHistory_decorators, { kind: "method", name: "getHistory", static: false, private: false, access: { has: obj => "getHistory" in obj, get: obj => obj.getHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _reactivate_decorators, { kind: "method", name: "reactivate", static: false, private: false, access: { has: obj => "reactivate" in obj, get: obj => obj.reactivate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _toggleAi_decorators, { kind: "method", name: "toggleAi", static: false, private: false, access: { has: obj => "toggleAi" in obj, get: obj => obj.toggleAi }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getBookingRules_decorators, { kind: "method", name: "getBookingRules", static: false, private: false, access: { has: obj => "getBookingRules" in obj, get: obj => obj.getBookingRules }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateBookingRules_decorators, { kind: "method", name: "updateBookingRules", static: false, private: false, access: { has: obj => "updateBookingRules" in obj, get: obj => obj.updateBookingRules }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getClientsWithDepositRule_decorators, { kind: "method", name: "getClientsWithDepositRule", static: false, private: false, access: { has: obj => "getClientsWithDepositRule" in obj, get: obj => obj.getClientsWithDepositRule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ClientsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        clientsService = __runInitializers(this, _instanceExtraInitializers);
        bookingRulesService;
        constructor(clientsService, bookingRulesService) {
            this.clientsService = clientsService;
            this.bookingRulesService = bookingRulesService;
        }
        /**
         * GET /clients
         * Lista todos os clientes do salão
         */
        async findAll(user, search, includeInactive, requiresDeposit) {
            const clients = await this.clientsService.findAll({
                salonId: user.salonId,
                search,
                includeInactive: includeInactive === 'true',
            });
            // Busca todas as regras de booking ativas do salao
            const allRules = await this.bookingRulesService.listRules(user.salonId, false);
            // Enriquece os clientes com informacao de booking rules
            const enrichedClients = clients.map(client => {
                const clientRules = allRules.filter(r => r.clientId === client.id || r.clientPhone === client.phone);
                const hasDepositRule = clientRules.some(r => r.ruleType === 'DEPOSIT_REQUIRED');
                const hasBlockRule = clientRules.some(r => r.ruleType === 'BLOCKED');
                return {
                    ...client,
                    requiresDeposit: hasDepositRule,
                    blockedFromOnline: hasBlockRule,
                };
            });
            // Filtra por requiresDeposit se solicitado
            if (requiresDeposit === 'true') {
                return enrichedClients.filter(c => c.requiresDeposit);
            }
            return enrichedClients;
        }
        /**
         * GET /clients/stats
         * Retorna estatísticas dos clientes
         */
        async getStats(user) {
            return this.clientsService.getStats(user.salonId);
        }
        /**
         * GET /clients/search?term=xxx
         * Busca clientes por termo
         */
        async search(user, term, includeInactive) {
            if (!term || term.length < 2) {
                return [];
            }
            return this.clientsService.search(user.salonId, term, includeInactive === 'true');
        }
        /**
         * GET /clients/:id
         * Busca cliente por ID
         */
        async findById(id, user) {
            const client = await this.clientsService.findById(id);
            if (!client || client.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Cliente nao encontrado');
            }
            return client;
        }
        /**
         * GET /clients/:id/history
         * Retorna histórico de comandas do cliente
         */
        async getHistory(id, user) {
            // Verificar se cliente pertence ao salão
            const client = await this.clientsService.findById(id);
            if (!client || client.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Cliente nao encontrado');
            }
            return this.clientsService.getHistory(id);
        }
        /**
         * POST /clients
         * Cria um novo cliente
         */
        async create(user, data) {
            return this.clientsService.create({
                ...data,
                salonId: user.salonId,
            });
        }
        /**
         * PATCH /clients/:id
         * Atualiza um cliente
         */
        async update(id, user, data) {
            // Verificar se cliente pertence ao salão
            const existing = await this.clientsService.findById(id);
            if (!existing || existing.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Cliente nao encontrado');
            }
            const client = await this.clientsService.update(id, data);
            return client;
        }
        /**
         * PATCH /clients/:id/reactivate
         * Reativa um cliente desativado
         */
        async reactivate(id, user) {
            // Verificar se cliente pertence ao salão
            const existing = await this.clientsService.findById(id);
            if (!existing || existing.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Cliente nao encontrado');
            }
            return this.clientsService.reactivate(id);
        }
        /**
         * DELETE /clients/:id
         * Desativa um cliente (soft delete)
         */
        async delete(id, user) {
            // Verificar se cliente pertence ao salão
            const existing = await this.clientsService.findById(id);
            if (!existing || existing.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Cliente nao encontrado');
            }
            await this.clientsService.delete(id);
            return { message: 'Cliente desativado com sucesso' };
        }
        /**
         * PATCH /clients/:id/toggle-ai
         * Alterna o status da IA para o cliente
         */
        async toggleAi(id, user) {
            // Verificar se cliente pertence ao salão
            const client = await this.clientsService.findById(id);
            if (!client || client.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Cliente nao encontrado');
            }
            return this.clientsService.setAiActive(id, !client.aiActive);
        }
        // ==================== BOOKING RULES ====================
        /**
         * GET /clients/:id/booking-rules
         * Retorna regras de agendamento online para o cliente
         */
        async getBookingRules(id, user) {
            const client = await this.clientsService.findById(id);
            if (!client || client.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Cliente nao encontrado');
            }
            const rules = await this.bookingRulesService.getActiveRulesForClient(user.salonId, client.phone, client.id);
            // Determina os estados de forma simplificada
            const requiresDeposit = rules.some(r => r.ruleType === 'DEPOSIT_REQUIRED');
            const blockedFromOnline = rules.some(r => r.ruleType === 'BLOCKED');
            // Busca a regra de deposito para pegar a nota
            const depositRule = rules.find(r => r.ruleType === 'DEPOSIT_REQUIRED');
            const blockRule = rules.find(r => r.ruleType === 'BLOCKED');
            return {
                requiresDeposit,
                blockedFromOnline,
                depositNotes: depositRule?.reason || '',
                blockNotes: blockRule?.reason || '',
                rules,
            };
        }
        /**
         * PATCH /clients/:id/booking-rules
         * Atualiza regras de agendamento online para o cliente
         */
        async updateBookingRules(id, user, body) {
            const client = await this.clientsService.findById(id);
            if (!client || client.salonId !== user.salonId) {
                throw new common_1.NotFoundException('Cliente nao encontrado');
            }
            const currentRules = await this.bookingRulesService.getActiveRulesForClient(user.salonId, client.phone, client.id);
            // Gerencia regra de DEPOSIT_REQUIRED
            if (body.requiresDeposit !== undefined) {
                const existingDepositRule = currentRules.find(r => r.ruleType === 'DEPOSIT_REQUIRED');
                if (body.requiresDeposit && !existingDepositRule) {
                    // Cria nova regra
                    await this.bookingRulesService.createRule(user.salonId, {
                        clientId: client.id,
                        clientPhone: client.phone,
                        ruleType: dto_1.BookingRuleType.DEPOSIT_REQUIRED,
                        reason: body.depositNotes || 'Taxa obrigatoria',
                    }, user.id);
                }
                else if (!body.requiresDeposit && existingDepositRule) {
                    // Remove regra existente
                    await this.bookingRulesService.deactivateRule(user.salonId, existingDepositRule.id);
                }
                else if (body.requiresDeposit && existingDepositRule && body.depositNotes !== undefined) {
                    // Atualiza nota da regra existente
                    await this.bookingRulesService.updateRule(user.salonId, existingDepositRule.id, {
                        reason: body.depositNotes,
                    });
                }
            }
            // Gerencia regra de BLOCKED
            if (body.blockedFromOnline !== undefined) {
                const existingBlockRule = currentRules.find(r => r.ruleType === 'BLOCKED');
                if (body.blockedFromOnline && !existingBlockRule) {
                    // Cria nova regra
                    await this.bookingRulesService.createRule(user.salonId, {
                        clientId: client.id,
                        clientPhone: client.phone,
                        ruleType: dto_1.BookingRuleType.BLOCKED,
                        reason: body.blockNotes || 'Bloqueado do agendamento online',
                    }, user.id);
                }
                else if (!body.blockedFromOnline && existingBlockRule) {
                    // Remove regra existente
                    await this.bookingRulesService.deactivateRule(user.salonId, existingBlockRule.id);
                }
                else if (body.blockedFromOnline && existingBlockRule && body.blockNotes !== undefined) {
                    // Atualiza nota da regra existente
                    await this.bookingRulesService.updateRule(user.salonId, existingBlockRule.id, {
                        reason: body.blockNotes,
                    });
                }
            }
            // Retorna o estado atualizado
            return this.getBookingRules(id, user);
        }
        /**
         * GET /clients/with-deposit-rule
         * Lista clientes que tem regra de deposito obrigatorio
         */
        async getClientsWithDepositRule(user) {
            const rules = await this.bookingRulesService.listRules(user.salonId);
            const depositRules = rules.filter(r => r.ruleType === 'DEPOSIT_REQUIRED' && r.isActive);
            // Busca dados dos clientes
            const clientIds = depositRules
                .filter(r => r.clientId)
                .map(r => r.clientId);
            const clientsWithRules = await Promise.all(clientIds.map(async (clientId) => {
                if (!clientId)
                    return null;
                const client = await this.clientsService.findById(clientId);
                const rule = depositRules.find(r => r.clientId === clientId);
                return client ? {
                    ...client,
                    depositNotes: rule?.reason,
                } : null;
            }));
            return clientsWithRules.filter(Boolean);
        }
    };
    return ClientsController = _classThis;
})();
exports.ClientsController = ClientsController;
//# sourceMappingURL=clients.controller.js.map