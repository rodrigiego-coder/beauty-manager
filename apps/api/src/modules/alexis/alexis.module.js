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
exports.AlexisModule = void 0;
const common_1 = require("@nestjs/common");
const alexis_controller_1 = require("./alexis.controller");
const alexis_service_1 = require("./alexis.service");
const gemini_service_1 = require("./gemini.service");
const content_filter_service_1 = require("./content-filter.service");
const intent_classifier_service_1 = require("./intent-classifier.service");
const scheduler_service_1 = require("./scheduler.service");
const data_collector_service_1 = require("./data-collector.service");
const alexis_catalog_service_1 = require("./alexis-catalog.service");
const response_composer_service_1 = require("./response-composer.service");
const product_info_service_1 = require("./product-info.service");
const conversation_state_store_1 = require("./conversation-state.store");
const appointments_module_1 = require("../appointments/appointments.module");
const online_booking_module_1 = require("../online-booking/online-booking.module");
const schedules_module_1 = require("../schedules/schedules.module");
/**
 * ==========================================
 * ALEXIS MODULE
 * IA Assistente para WhatsApp & Dashboard
 * Compliance: ANVISA + LGPD
 * ==========================================
 */
let AlexisModule = (() => {
    let _classDecorators = [(0, common_1.Module)({
            imports: [
                (0, common_1.forwardRef)(() => appointments_module_1.AppointmentsModule), // Para criar agendamento via FSM
                (0, common_1.forwardRef)(() => online_booking_module_1.OnlineBookingModule), // Para gerar link de agendamento assistido
                (0, common_1.forwardRef)(() => schedules_module_1.SchedulesModule), // Para validação de disponibilidade
            ],
            controllers: [alexis_controller_1.AlexisController],
            providers: [
                alexis_service_1.AlexisService,
                gemini_service_1.GeminiService,
                content_filter_service_1.ContentFilterService,
                intent_classifier_service_1.IntentClassifierService,
                scheduler_service_1.AlexisSchedulerService,
                data_collector_service_1.DataCollectorService,
                alexis_catalog_service_1.AlexisCatalogService,
                response_composer_service_1.ResponseComposerService,
                product_info_service_1.ProductInfoService,
                conversation_state_store_1.ConversationStateStore,
            ],
            exports: [alexis_service_1.AlexisService, alexis_catalog_service_1.AlexisCatalogService, product_info_service_1.ProductInfoService],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AlexisModule = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AlexisModule = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return AlexisModule = _classThis;
})();
exports.AlexisModule = AlexisModule;
//# sourceMappingURL=alexis.module.js.map