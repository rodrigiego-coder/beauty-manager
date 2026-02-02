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
exports.CommandsController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let CommandsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('commands')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _findOpen_decorators;
    let _findClients_decorators;
    let _findByCardNumber_decorators;
    let _quickAccess_decorators;
    let _findById_decorators;
    let _getItems_decorators;
    let _getPayments_decorators;
    let _getEvents_decorators;
    let _open_decorators;
    let _addItem_decorators;
    let _updateItem_decorators;
    let _removeItem_decorators;
    let _applyDiscount_decorators;
    let _closeService_decorators;
    let _addPayment_decorators;
    let _closeCashier_decorators;
    let _cancel_decorators;
    let _reopen_decorators;
    let _linkClient_decorators;
    let _unlinkClient_decorators;
    let _addNote_decorators;
    var CommandsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, common_1.Get)()];
            _findOpen_decorators = [(0, common_1.Get)('open')];
            _findClients_decorators = [(0, common_1.Get)('clients')];
            _findByCardNumber_decorators = [(0, common_1.Get)('card/:cardNumber')];
            _quickAccess_decorators = [(0, common_1.Get)('quick-access/:code')];
            _findById_decorators = [(0, common_1.Get)(':id')];
            _getItems_decorators = [(0, common_1.Get)(':id/items')];
            _getPayments_decorators = [(0, common_1.Get)(':id/payments')];
            _getEvents_decorators = [(0, common_1.Get)(':id/events')];
            _open_decorators = [(0, common_1.Post)()];
            _addItem_decorators = [(0, common_1.Post)(':id/items')];
            _updateItem_decorators = [(0, common_1.Patch)(':id/items/:itemId')];
            _removeItem_decorators = [(0, common_1.Delete)(':id/items/:itemId')];
            _applyDiscount_decorators = [(0, common_1.Post)(':id/discount'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _closeService_decorators = [(0, common_1.Post)(':id/close-service')];
            _addPayment_decorators = [(0, common_1.Post)(':id/payments'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _closeCashier_decorators = [(0, common_1.Post)(':id/close-cashier'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _cancel_decorators = [(0, common_1.Post)(':id/cancel'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _reopen_decorators = [(0, common_1.Post)(':id/reopen'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _linkClient_decorators = [(0, common_1.Post)(':id/link-client')];
            _unlinkClient_decorators = [(0, common_1.Delete)(':id/client')];
            _addNote_decorators = [(0, common_1.Post)(':id/notes')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOpen_decorators, { kind: "method", name: "findOpen", static: false, private: false, access: { has: obj => "findOpen" in obj, get: obj => obj.findOpen }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findClients_decorators, { kind: "method", name: "findClients", static: false, private: false, access: { has: obj => "findClients" in obj, get: obj => obj.findClients }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByCardNumber_decorators, { kind: "method", name: "findByCardNumber", static: false, private: false, access: { has: obj => "findByCardNumber" in obj, get: obj => obj.findByCardNumber }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _quickAccess_decorators, { kind: "method", name: "quickAccess", static: false, private: false, access: { has: obj => "quickAccess" in obj, get: obj => obj.quickAccess }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getItems_decorators, { kind: "method", name: "getItems", static: false, private: false, access: { has: obj => "getItems" in obj, get: obj => obj.getItems }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPayments_decorators, { kind: "method", name: "getPayments", static: false, private: false, access: { has: obj => "getPayments" in obj, get: obj => obj.getPayments }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getEvents_decorators, { kind: "method", name: "getEvents", static: false, private: false, access: { has: obj => "getEvents" in obj, get: obj => obj.getEvents }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _open_decorators, { kind: "method", name: "open", static: false, private: false, access: { has: obj => "open" in obj, get: obj => obj.open }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _addItem_decorators, { kind: "method", name: "addItem", static: false, private: false, access: { has: obj => "addItem" in obj, get: obj => obj.addItem }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateItem_decorators, { kind: "method", name: "updateItem", static: false, private: false, access: { has: obj => "updateItem" in obj, get: obj => obj.updateItem }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _removeItem_decorators, { kind: "method", name: "removeItem", static: false, private: false, access: { has: obj => "removeItem" in obj, get: obj => obj.removeItem }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _applyDiscount_decorators, { kind: "method", name: "applyDiscount", static: false, private: false, access: { has: obj => "applyDiscount" in obj, get: obj => obj.applyDiscount }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _closeService_decorators, { kind: "method", name: "closeService", static: false, private: false, access: { has: obj => "closeService" in obj, get: obj => obj.closeService }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _addPayment_decorators, { kind: "method", name: "addPayment", static: false, private: false, access: { has: obj => "addPayment" in obj, get: obj => obj.addPayment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _closeCashier_decorators, { kind: "method", name: "closeCashier", static: false, private: false, access: { has: obj => "closeCashier" in obj, get: obj => obj.closeCashier }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cancel_decorators, { kind: "method", name: "cancel", static: false, private: false, access: { has: obj => "cancel" in obj, get: obj => obj.cancel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _reopen_decorators, { kind: "method", name: "reopen", static: false, private: false, access: { has: obj => "reopen" in obj, get: obj => obj.reopen }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _linkClient_decorators, { kind: "method", name: "linkClient", static: false, private: false, access: { has: obj => "linkClient" in obj, get: obj => obj.linkClient }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _unlinkClient_decorators, { kind: "method", name: "unlinkClient", static: false, private: false, access: { has: obj => "unlinkClient" in obj, get: obj => obj.unlinkClient }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _addNote_decorators, { kind: "method", name: "addNote", static: false, private: false, access: { has: obj => "addNote" in obj, get: obj => obj.addNote }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CommandsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        commandsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(commandsService) {
            this.commandsService = commandsService;
        }
        /**
         * GET /commands
         * Lista comandas do salão
         */
        async findAll(user, status) {
            return this.commandsService.findAll(user.salonId, status);
        }
        /**
         * GET /commands/open
         * Lista comandas abertas
         */
        async findOpen(user) {
            return this.commandsService.findOpen(user.salonId);
        }
        /**
         * GET /commands/clients
         * Lista clientes do salão para seleção em comandas
         */
        async findClients(user) {
            return this.commandsService.getClients(user.salonId);
        }
        /**
         * GET /commands/card/:cardNumber
         * Busca comanda por número do cartão
         */
        async findByCardNumber(user, cardNumber) {
            const command = await this.commandsService.findByCardNumber(user.salonId, cardNumber);
            if (!command) {
                return { found: false, message: 'Nenhuma comanda aberta com este cartao' };
            }
            return { found: true, command };
        }
        /**
           * GET /commands/quick-access/:code
           * Acesso rápido: busca ou cria comanda automaticamente
           */
        async quickAccess(user, code) {
            console.log('DEBUG quickAccess - user:', JSON.stringify(user));
            return this.commandsService.quickAccess(user.salonId, code, {
                id: user.id,
                salonId: user.salonId,
                role: user.role,
            });
        }
        /**
         * GET /commands/:id
         * Busca comanda por ID com detalhes
         */
        async findById(id) {
            return this.commandsService.getDetails(id);
        }
        /**
         * GET /commands/:id/items
         * Lista itens da comanda
         */
        async getItems(id) {
            return this.commandsService.getItems(id);
        }
        /**
         * GET /commands/:id/payments
         * Lista pagamentos da comanda
         */
        async getPayments(id) {
            return this.commandsService.getPayments(id);
        }
        /**
         * GET /commands/:id/events
         * Lista eventos/timeline da comanda
         */
        async getEvents(id) {
            return this.commandsService.getEvents(id);
        }
        /**
         * POST /commands
         * Abre nova comanda
         */
        async open(user, data) {
            return this.commandsService.open(user.salonId, data, {
                id: user.id,
                salonId: user.salonId,
                role: user.role,
            });
        }
        /**
         * POST /commands/:id/items
         * Adiciona item à comanda
         */
        async addItem(user, id, data) {
            return this.commandsService.addItem(id, data, {
                id: user.id,
                salonId: user.salonId,
                role: user.role,
            });
        }
        /**
         * PATCH /commands/:id/items/:itemId
         * Atualiza item da comanda
         */
        async updateItem(user, id, itemId, data) {
            return this.commandsService.updateItem(id, itemId, data, {
                id: user.id,
                salonId: user.salonId,
                role: user.role,
            });
        }
        /**
         * DELETE /commands/:id/items/:itemId
         * Remove item da comanda
         */
        async removeItem(user, id, itemId, data) {
            return this.commandsService.removeItem(id, itemId, data.reason, {
                id: user.id,
                salonId: user.salonId,
                role: user.role,
            });
        }
        /**
         * POST /commands/:id/discount
         * Aplica desconto na comanda (apenas OWNER/MANAGER)
         */
        async applyDiscount(user, id, data) {
            return this.commandsService.applyDiscount(id, data, {
                id: user.id,
                salonId: user.salonId,
                role: user.role,
            });
        }
        /**
         * POST /commands/:id/close-service
         * Encerra serviços da comanda
         */
        async closeService(user, id) {
            return this.commandsService.closeService(id, {
                id: user.id,
                salonId: user.salonId,
                role: user.role,
            });
        }
        /**
         * POST /commands/:id/payments
         * Adiciona pagamento (apenas OWNER/MANAGER/RECEPTIONIST)
         */
        async addPayment(user, id, data) {
            return this.commandsService.addPayment(id, data, {
                id: user.id,
                salonId: user.salonId,
                role: user.role,
            });
        }
        /**
         * POST /commands/:id/close-cashier
         * Fecha comanda no caixa (apenas OWNER/MANAGER/RECEPTIONIST)
         */
        async closeCashier(user, id) {
            return this.commandsService.closeCashier(id, {
                id: user.id,
                salonId: user.salonId,
                role: user.role,
            });
        }
        /**
         * POST /commands/:id/cancel
         * Cancela comanda (apenas OWNER/MANAGER)
         */
        async cancel(user, id, data) {
            return this.commandsService.cancel(id, data.reason, {
                id: user.id,
                salonId: user.salonId,
                role: user.role,
            });
        }
        /**
         * POST /commands/:id/reopen
         * Reabre comanda fechada (apenas OWNER/MANAGER)
         */
        async reopen(user, id, data) {
            return this.commandsService.reopenCommand(id, data, {
                id: user.id,
                salonId: user.salonId,
                role: user.role,
            });
        }
        /**
         * POST /commands/:id/link-client
         * Vincula cliente à comanda
         */
        async linkClient(user, id, data) {
            return this.commandsService.linkClient(id, data, {
                id: user.id,
                salonId: user.salonId,
                role: user.role,
            });
        }
        /**
         * DELETE /commands/:id/client
         * Remove vínculo do cliente com a comanda
         */
        async unlinkClient(user, id) {
            return this.commandsService.unlinkClient(id, {
                id: user.id,
                salonId: user.salonId,
                role: user.role,
            });
        }
        /**
         * POST /commands/:id/notes
         * Adiciona nota à comanda
         */
        async addNote(user, id, data) {
            return this.commandsService.addNote(id, data, {
                id: user.id,
                salonId: user.salonId,
                role: user.role,
            });
        }
    };
    return CommandsController = _classThis;
})();
exports.CommandsController = CommandsController;
//# sourceMappingURL=commands.controller.js.map