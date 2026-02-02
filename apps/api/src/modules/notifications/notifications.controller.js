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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
let NotificationsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('notifications')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _findUnread_decorators;
    let _countUnread_decorators;
    let _findById_decorators;
    let _markAsRead_decorators;
    let _markAllAsRead_decorators;
    let _delete_decorators;
    let _cleanOld_decorators;
    var NotificationsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, common_1.Get)()];
            _findUnread_decorators = [(0, common_1.Get)('unread')];
            _countUnread_decorators = [(0, common_1.Get)('count')];
            _findById_decorators = [(0, common_1.Get)(':id')];
            _markAsRead_decorators = [(0, common_1.Patch)(':id/read')];
            _markAllAsRead_decorators = [(0, common_1.Post)('read-all')];
            _delete_decorators = [(0, common_1.Delete)(':id')];
            _cleanOld_decorators = [(0, common_1.Post)('clean')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findUnread_decorators, { kind: "method", name: "findUnread", static: false, private: false, access: { has: obj => "findUnread" in obj, get: obj => obj.findUnread }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _countUnread_decorators, { kind: "method", name: "countUnread", static: false, private: false, access: { has: obj => "countUnread" in obj, get: obj => obj.countUnread }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _markAsRead_decorators, { kind: "method", name: "markAsRead", static: false, private: false, access: { has: obj => "markAsRead" in obj, get: obj => obj.markAsRead }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _markAllAsRead_decorators, { kind: "method", name: "markAllAsRead", static: false, private: false, access: { has: obj => "markAllAsRead" in obj, get: obj => obj.markAllAsRead }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cleanOld_decorators, { kind: "method", name: "cleanOld", static: false, private: false, access: { has: obj => "cleanOld" in obj, get: obj => obj.cleanOld }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            NotificationsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        notificationsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(notificationsService) {
            this.notificationsService = notificationsService;
        }
        /**
         * GET /notifications
         * Lista todas as notificações
         */
        async findAll() {
            return this.notificationsService.findAll();
        }
        /**
         * GET /notifications/unread
         * Lista notificações não lidas
         */
        async findUnread() {
            return this.notificationsService.findUnread();
        }
        /**
         * GET /notifications/count
         * Conta notificações não lidas
         */
        async countUnread() {
            const count = await this.notificationsService.countUnread();
            return { unreadCount: count };
        }
        /**
         * GET /notifications/:id
         * Busca notificação por ID
         */
        async findById(id) {
            const notification = await this.notificationsService.findById(id);
            if (!notification) {
                throw new common_1.NotFoundException('Notificacao nao encontrada');
            }
            return notification;
        }
        /**
         * PATCH /notifications/:id/read
         * Marca notificação como lida
         */
        async markAsRead(id) {
            const notification = await this.notificationsService.markAsRead(id);
            if (!notification) {
                throw new common_1.NotFoundException('Notificacao nao encontrada');
            }
            return notification;
        }
        /**
         * POST /notifications/read-all
         * Marca todas como lidas
         */
        async markAllAsRead() {
            const count = await this.notificationsService.markAllAsRead();
            return { message: `${count} notificacoes marcadas como lidas` };
        }
        /**
         * DELETE /notifications/:id
         * Remove notificação
         */
        async delete(id) {
            const deleted = await this.notificationsService.delete(id);
            if (!deleted) {
                throw new common_1.NotFoundException('Notificacao nao encontrada');
            }
            return { message: 'Notificacao removida com sucesso' };
        }
        /**
         * POST /notifications/clean
         * Remove notificações antigas (mais de 30 dias)
         */
        async cleanOld() {
            const count = await this.notificationsService.cleanOld();
            return { message: `${count} notificacoes antigas removidas` };
        }
    };
    return NotificationsController = _classThis;
})();
exports.NotificationsController = NotificationsController;
//# sourceMappingURL=notifications.controller.js.map