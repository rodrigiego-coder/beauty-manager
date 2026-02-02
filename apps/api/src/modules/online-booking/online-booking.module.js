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
exports.OnlineBookingModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const automation_module_1 = require("../automation/automation.module");
const notifications_module_1 = require("../notifications/notifications.module");
// Services
const online_booking_settings_service_1 = require("./online-booking-settings.service");
const otp_service_1 = require("./otp.service");
const appointment_holds_service_1 = require("./appointment-holds.service");
const deposits_service_1 = require("./deposits.service");
const client_booking_rules_service_1 = require("./client-booking-rules.service");
// Controllers
const public_booking_controller_1 = require("./public-booking.controller");
const admin_booking_controller_1 = require("./admin-booking.controller");
let OnlineBookingModule = (() => {
    let _classDecorators = [(0, common_1.Module)({
            imports: [database_module_1.DatabaseModule, automation_module_1.AutomationModule, notifications_module_1.NotificationsModule],
            controllers: [public_booking_controller_1.PublicBookingController, admin_booking_controller_1.AdminBookingController],
            providers: [
                online_booking_settings_service_1.OnlineBookingSettingsService,
                otp_service_1.OtpService,
                appointment_holds_service_1.AppointmentHoldsService,
                deposits_service_1.DepositsService,
                client_booking_rules_service_1.ClientBookingRulesService,
            ],
            exports: [
                online_booking_settings_service_1.OnlineBookingSettingsService,
                otp_service_1.OtpService,
                appointment_holds_service_1.AppointmentHoldsService,
                deposits_service_1.DepositsService,
                client_booking_rules_service_1.ClientBookingRulesService,
            ],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var OnlineBookingModule = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            OnlineBookingModule = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return OnlineBookingModule = _classThis;
})();
exports.OnlineBookingModule = OnlineBookingModule;
//# sourceMappingURL=online-booking.module.js.map