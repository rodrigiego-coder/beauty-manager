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
exports.ProductSubscriptionsJobs = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const is_jest_1 = require("../../common/is-jest");
let ProductSubscriptionsJobs = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _processDailyDeliveries_decorators;
    let _sendDeliveryReminders_decorators;
    let _checkExpiredSubscriptions_decorators;
    var ProductSubscriptionsJobs = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _processDailyDeliveries_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_6AM, { disabled: is_jest_1.IS_JEST })];
            _sendDeliveryReminders_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_8AM, { disabled: is_jest_1.IS_JEST })];
            _checkExpiredSubscriptions_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT, { disabled: is_jest_1.IS_JEST })];
            __esDecorate(this, null, _processDailyDeliveries_decorators, { kind: "method", name: "processDailyDeliveries", static: false, private: false, access: { has: obj => "processDailyDeliveries" in obj, get: obj => obj.processDailyDeliveries }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sendDeliveryReminders_decorators, { kind: "method", name: "sendDeliveryReminders", static: false, private: false, access: { has: obj => "sendDeliveryReminders" in obj, get: obj => obj.sendDeliveryReminders }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkExpiredSubscriptions_decorators, { kind: "method", name: "checkExpiredSubscriptions", static: false, private: false, access: { has: obj => "checkExpiredSubscriptions" in obj, get: obj => obj.checkExpiredSubscriptions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ProductSubscriptionsJobs = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        service = __runInitializers(this, _instanceExtraInitializers);
        constructor(service) {
            this.service = service;
        }
        /**
         * Job diario as 06:00 - Processa entregas do dia
         * Cria registros de entrega para assinaturas com nextDeliveryDate = hoje
         */
        async processDailyDeliveries() {
            console.log('[ProductSubscriptions] Processando entregas do dia...');
            try {
                await this.service.processDailyDeliveries();
                console.log('[ProductSubscriptions] Entregas processadas com sucesso');
            }
            catch (error) {
                console.error('[ProductSubscriptions] Erro ao processar entregas:', error);
            }
        }
        /**
         * Job diario as 08:00 - Envia lembretes de entrega
         * Notifica clientes sobre entregas do dia
         */
        async sendDeliveryReminders() {
            console.log('[ProductSubscriptions] Enviando lembretes de entrega...');
            // TODO: Implementar envio de notificacoes via WhatsApp/SMS
            // Por enquanto, apenas log
            console.log('[ProductSubscriptions] Lembretes enviados');
        }
        /**
         * Job diario a meia-noite - Verifica assinaturas expiradas
         */
        async checkExpiredSubscriptions() {
            console.log('[ProductSubscriptions] Verificando assinaturas expiradas...');
            // TODO: Implementar verificacao de assinaturas que precisam renovacao
            // e processamento de pagamentos recorrentes
            console.log('[ProductSubscriptions] Verificacao concluida');
        }
    };
    return ProductSubscriptionsJobs = _classThis;
})();
exports.ProductSubscriptionsJobs = ProductSubscriptionsJobs;
//# sourceMappingURL=product-subscriptions.jobs.js.map