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
exports.ProfessionalDashboardDto = exports.ProfessionalPerformanceDto = exports.ProfessionalAppointmentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
let ProfessionalAppointmentDto = (() => {
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _clientName_decorators;
    let _clientName_initializers = [];
    let _clientName_extraInitializers = [];
    let _serviceName_decorators;
    let _serviceName_initializers = [];
    let _serviceName_extraInitializers = [];
    let _date_decorators;
    let _date_initializers = [];
    let _date_extraInitializers = [];
    let _time_decorators;
    let _time_initializers = [];
    let _time_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _price_decorators;
    let _price_initializers = [];
    let _price_extraInitializers = [];
    return class ProfessionalAppointmentDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, swagger_1.ApiProperty)()];
            _clientName_decorators = [(0, swagger_1.ApiProperty)()];
            _serviceName_decorators = [(0, swagger_1.ApiProperty)()];
            _date_decorators = [(0, swagger_1.ApiProperty)()];
            _time_decorators = [(0, swagger_1.ApiProperty)()];
            _status_decorators = [(0, swagger_1.ApiProperty)()];
            _price_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _clientName_decorators, { kind: "field", name: "clientName", static: false, private: false, access: { has: obj => "clientName" in obj, get: obj => obj.clientName, set: (obj, value) => { obj.clientName = value; } }, metadata: _metadata }, _clientName_initializers, _clientName_extraInitializers);
            __esDecorate(null, null, _serviceName_decorators, { kind: "field", name: "serviceName", static: false, private: false, access: { has: obj => "serviceName" in obj, get: obj => obj.serviceName, set: (obj, value) => { obj.serviceName = value; } }, metadata: _metadata }, _serviceName_initializers, _serviceName_extraInitializers);
            __esDecorate(null, null, _date_decorators, { kind: "field", name: "date", static: false, private: false, access: { has: obj => "date" in obj, get: obj => obj.date, set: (obj, value) => { obj.date = value; } }, metadata: _metadata }, _date_initializers, _date_extraInitializers);
            __esDecorate(null, null, _time_decorators, { kind: "field", name: "time", static: false, private: false, access: { has: obj => "time" in obj, get: obj => obj.time, set: (obj, value) => { obj.time = value; } }, metadata: _metadata }, _time_initializers, _time_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: obj => "price" in obj, get: obj => obj.price, set: (obj, value) => { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        id = __runInitializers(this, _id_initializers, void 0);
        clientName = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _clientName_initializers, void 0));
        serviceName = (__runInitializers(this, _clientName_extraInitializers), __runInitializers(this, _serviceName_initializers, void 0));
        date = (__runInitializers(this, _serviceName_extraInitializers), __runInitializers(this, _date_initializers, void 0));
        time = (__runInitializers(this, _date_extraInitializers), __runInitializers(this, _time_initializers, void 0));
        status = (__runInitializers(this, _time_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        price = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _price_initializers, void 0));
        constructor() {
            __runInitializers(this, _price_extraInitializers);
        }
    };
})();
exports.ProfessionalAppointmentDto = ProfessionalAppointmentDto;
let ProfessionalPerformanceDto = (() => {
    let _totalAppointments_decorators;
    let _totalAppointments_initializers = [];
    let _totalAppointments_extraInitializers = [];
    let _completedAppointments_decorators;
    let _completedAppointments_initializers = [];
    let _completedAppointments_extraInitializers = [];
    let _cancelledAppointments_decorators;
    let _cancelledAppointments_initializers = [];
    let _cancelledAppointments_extraInitializers = [];
    let _noShowAppointments_decorators;
    let _noShowAppointments_initializers = [];
    let _noShowAppointments_extraInitializers = [];
    let _completionRate_decorators;
    let _completionRate_initializers = [];
    let _completionRate_extraInitializers = [];
    return class ProfessionalPerformanceDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _totalAppointments_decorators = [(0, swagger_1.ApiProperty)()];
            _completedAppointments_decorators = [(0, swagger_1.ApiProperty)()];
            _cancelledAppointments_decorators = [(0, swagger_1.ApiProperty)()];
            _noShowAppointments_decorators = [(0, swagger_1.ApiProperty)()];
            _completionRate_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _totalAppointments_decorators, { kind: "field", name: "totalAppointments", static: false, private: false, access: { has: obj => "totalAppointments" in obj, get: obj => obj.totalAppointments, set: (obj, value) => { obj.totalAppointments = value; } }, metadata: _metadata }, _totalAppointments_initializers, _totalAppointments_extraInitializers);
            __esDecorate(null, null, _completedAppointments_decorators, { kind: "field", name: "completedAppointments", static: false, private: false, access: { has: obj => "completedAppointments" in obj, get: obj => obj.completedAppointments, set: (obj, value) => { obj.completedAppointments = value; } }, metadata: _metadata }, _completedAppointments_initializers, _completedAppointments_extraInitializers);
            __esDecorate(null, null, _cancelledAppointments_decorators, { kind: "field", name: "cancelledAppointments", static: false, private: false, access: { has: obj => "cancelledAppointments" in obj, get: obj => obj.cancelledAppointments, set: (obj, value) => { obj.cancelledAppointments = value; } }, metadata: _metadata }, _cancelledAppointments_initializers, _cancelledAppointments_extraInitializers);
            __esDecorate(null, null, _noShowAppointments_decorators, { kind: "field", name: "noShowAppointments", static: false, private: false, access: { has: obj => "noShowAppointments" in obj, get: obj => obj.noShowAppointments, set: (obj, value) => { obj.noShowAppointments = value; } }, metadata: _metadata }, _noShowAppointments_initializers, _noShowAppointments_extraInitializers);
            __esDecorate(null, null, _completionRate_decorators, { kind: "field", name: "completionRate", static: false, private: false, access: { has: obj => "completionRate" in obj, get: obj => obj.completionRate, set: (obj, value) => { obj.completionRate = value; } }, metadata: _metadata }, _completionRate_initializers, _completionRate_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        totalAppointments = __runInitializers(this, _totalAppointments_initializers, void 0);
        completedAppointments = (__runInitializers(this, _totalAppointments_extraInitializers), __runInitializers(this, _completedAppointments_initializers, void 0));
        cancelledAppointments = (__runInitializers(this, _completedAppointments_extraInitializers), __runInitializers(this, _cancelledAppointments_initializers, void 0));
        noShowAppointments = (__runInitializers(this, _cancelledAppointments_extraInitializers), __runInitializers(this, _noShowAppointments_initializers, void 0));
        completionRate = (__runInitializers(this, _noShowAppointments_extraInitializers), __runInitializers(this, _completionRate_initializers, void 0));
        constructor() {
            __runInitializers(this, _completionRate_extraInitializers);
        }
    };
})();
exports.ProfessionalPerformanceDto = ProfessionalPerformanceDto;
let ProfessionalDashboardDto = (() => {
    let _todayAppointments_decorators;
    let _todayAppointments_initializers = [];
    let _todayAppointments_extraInitializers = [];
    let _weekAppointments_decorators;
    let _weekAppointments_initializers = [];
    let _weekAppointments_extraInitializers = [];
    let _monthRevenue_decorators;
    let _monthRevenue_initializers = [];
    let _monthRevenue_extraInitializers = [];
    let _pendingCommission_decorators;
    let _pendingCommission_initializers = [];
    let _pendingCommission_extraInitializers = [];
    let _commissionRate_decorators;
    let _commissionRate_initializers = [];
    let _commissionRate_extraInitializers = [];
    let _upcomingAppointments_decorators;
    let _upcomingAppointments_initializers = [];
    let _upcomingAppointments_extraInitializers = [];
    let _performance_decorators;
    let _performance_initializers = [];
    let _performance_extraInitializers = [];
    let _professionalName_decorators;
    let _professionalName_initializers = [];
    let _professionalName_extraInitializers = [];
    return class ProfessionalDashboardDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _todayAppointments_decorators = [(0, swagger_1.ApiProperty)({ description: 'Agendamentos de hoje' })];
            _weekAppointments_decorators = [(0, swagger_1.ApiProperty)({ description: 'Agendamentos da semana' })];
            _monthRevenue_decorators = [(0, swagger_1.ApiProperty)({ description: 'Faturamento do mês (apenas serviços do profissional)' })];
            _pendingCommission_decorators = [(0, swagger_1.ApiProperty)({ description: 'Comissão pendente do mês' })];
            _commissionRate_decorators = [(0, swagger_1.ApiProperty)({ description: 'Taxa de comissão do profissional' })];
            _upcomingAppointments_decorators = [(0, swagger_1.ApiProperty)({ description: 'Próximos agendamentos', type: [ProfessionalAppointmentDto] })];
            _performance_decorators = [(0, swagger_1.ApiProperty)({ description: 'Desempenho do mês', type: ProfessionalPerformanceDto })];
            _professionalName_decorators = [(0, swagger_1.ApiProperty)({ description: 'Nome do profissional' })];
            __esDecorate(null, null, _todayAppointments_decorators, { kind: "field", name: "todayAppointments", static: false, private: false, access: { has: obj => "todayAppointments" in obj, get: obj => obj.todayAppointments, set: (obj, value) => { obj.todayAppointments = value; } }, metadata: _metadata }, _todayAppointments_initializers, _todayAppointments_extraInitializers);
            __esDecorate(null, null, _weekAppointments_decorators, { kind: "field", name: "weekAppointments", static: false, private: false, access: { has: obj => "weekAppointments" in obj, get: obj => obj.weekAppointments, set: (obj, value) => { obj.weekAppointments = value; } }, metadata: _metadata }, _weekAppointments_initializers, _weekAppointments_extraInitializers);
            __esDecorate(null, null, _monthRevenue_decorators, { kind: "field", name: "monthRevenue", static: false, private: false, access: { has: obj => "monthRevenue" in obj, get: obj => obj.monthRevenue, set: (obj, value) => { obj.monthRevenue = value; } }, metadata: _metadata }, _monthRevenue_initializers, _monthRevenue_extraInitializers);
            __esDecorate(null, null, _pendingCommission_decorators, { kind: "field", name: "pendingCommission", static: false, private: false, access: { has: obj => "pendingCommission" in obj, get: obj => obj.pendingCommission, set: (obj, value) => { obj.pendingCommission = value; } }, metadata: _metadata }, _pendingCommission_initializers, _pendingCommission_extraInitializers);
            __esDecorate(null, null, _commissionRate_decorators, { kind: "field", name: "commissionRate", static: false, private: false, access: { has: obj => "commissionRate" in obj, get: obj => obj.commissionRate, set: (obj, value) => { obj.commissionRate = value; } }, metadata: _metadata }, _commissionRate_initializers, _commissionRate_extraInitializers);
            __esDecorate(null, null, _upcomingAppointments_decorators, { kind: "field", name: "upcomingAppointments", static: false, private: false, access: { has: obj => "upcomingAppointments" in obj, get: obj => obj.upcomingAppointments, set: (obj, value) => { obj.upcomingAppointments = value; } }, metadata: _metadata }, _upcomingAppointments_initializers, _upcomingAppointments_extraInitializers);
            __esDecorate(null, null, _performance_decorators, { kind: "field", name: "performance", static: false, private: false, access: { has: obj => "performance" in obj, get: obj => obj.performance, set: (obj, value) => { obj.performance = value; } }, metadata: _metadata }, _performance_initializers, _performance_extraInitializers);
            __esDecorate(null, null, _professionalName_decorators, { kind: "field", name: "professionalName", static: false, private: false, access: { has: obj => "professionalName" in obj, get: obj => obj.professionalName, set: (obj, value) => { obj.professionalName = value; } }, metadata: _metadata }, _professionalName_initializers, _professionalName_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        todayAppointments = __runInitializers(this, _todayAppointments_initializers, void 0);
        weekAppointments = (__runInitializers(this, _todayAppointments_extraInitializers), __runInitializers(this, _weekAppointments_initializers, void 0));
        monthRevenue = (__runInitializers(this, _weekAppointments_extraInitializers), __runInitializers(this, _monthRevenue_initializers, void 0));
        pendingCommission = (__runInitializers(this, _monthRevenue_extraInitializers), __runInitializers(this, _pendingCommission_initializers, void 0));
        commissionRate = (__runInitializers(this, _pendingCommission_extraInitializers), __runInitializers(this, _commissionRate_initializers, void 0));
        upcomingAppointments = (__runInitializers(this, _commissionRate_extraInitializers), __runInitializers(this, _upcomingAppointments_initializers, void 0));
        performance = (__runInitializers(this, _upcomingAppointments_extraInitializers), __runInitializers(this, _performance_initializers, void 0));
        professionalName = (__runInitializers(this, _performance_extraInitializers), __runInitializers(this, _professionalName_initializers, void 0));
        constructor() {
            __runInitializers(this, _professionalName_extraInitializers);
        }
    };
})();
exports.ProfessionalDashboardDto = ProfessionalDashboardDto;
//# sourceMappingURL=professional-dashboard.dto.js.map