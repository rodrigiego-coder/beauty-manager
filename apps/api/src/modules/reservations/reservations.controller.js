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
exports.ReservationsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let ReservationsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('reservations'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getReservations_decorators;
    let _getStats_decorators;
    let _getReservation_decorators;
    let _createReservation_decorators;
    let _updateReservation_decorators;
    let _updateStatus_decorators;
    let _deleteReservation_decorators;
    var ReservationsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getReservations_decorators = [(0, common_1.Get)(), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _getStats_decorators = [(0, common_1.Get)('stats'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getReservation_decorators = [(0, common_1.Get)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _createReservation_decorators = [(0, common_1.Post)(), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _updateReservation_decorators = [(0, common_1.Patch)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _updateStatus_decorators = [(0, common_1.Patch)(':id/status'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _deleteReservation_decorators = [(0, common_1.Delete)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            __esDecorate(this, null, _getReservations_decorators, { kind: "method", name: "getReservations", static: false, private: false, access: { has: obj => "getReservations" in obj, get: obj => obj.getReservations }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getReservation_decorators, { kind: "method", name: "getReservation", static: false, private: false, access: { has: obj => "getReservation" in obj, get: obj => obj.getReservation }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createReservation_decorators, { kind: "method", name: "createReservation", static: false, private: false, access: { has: obj => "createReservation" in obj, get: obj => obj.createReservation }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateReservation_decorators, { kind: "method", name: "updateReservation", static: false, private: false, access: { has: obj => "updateReservation" in obj, get: obj => obj.updateReservation }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateStatus_decorators, { kind: "method", name: "updateStatus", static: false, private: false, access: { has: obj => "updateStatus" in obj, get: obj => obj.updateStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteReservation_decorators, { kind: "method", name: "deleteReservation", static: false, private: false, access: { has: obj => "deleteReservation" in obj, get: obj => obj.deleteReservation }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ReservationsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        reservationsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(reservationsService) {
            this.reservationsService = reservationsService;
        }
        async getReservations(req, page, limit, status, clientId, deliveryType, startDate, endDate) {
            return this.reservationsService.getReservations(req.user.salonId, {
                page: page ? parseInt(page, 10) : undefined,
                limit: limit ? parseInt(limit, 10) : undefined,
                status,
                clientId,
                deliveryType,
                startDate,
                endDate,
            });
        }
        async getStats(req, startDate, endDate) {
            return this.reservationsService.getStats(req.user.salonId, startDate, endDate);
        }
        async getReservation(req, id) {
            return this.reservationsService.getReservationById(req.user.salonId, id);
        }
        async createReservation(req, dto) {
            return this.reservationsService.createReservation(req.user.salonId, dto);
        }
        async updateReservation(req, id, dto) {
            return this.reservationsService.updateReservation(req.user.salonId, id, dto);
        }
        async updateStatus(req, id, dto) {
            return this.reservationsService.updateStatus(req.user.salonId, id, dto, req.user.userId);
        }
        async deleteReservation(req, id) {
            await this.reservationsService.deleteReservation(req.user.salonId, id);
            return { success: true };
        }
    };
    return ReservationsController = _classThis;
})();
exports.ReservationsController = ReservationsController;
//# sourceMappingURL=reservations.controller.js.map