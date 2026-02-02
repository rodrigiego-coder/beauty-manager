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
exports.BlockFiltersDto = exports.AppointmentFiltersDto = exports.UpdateWorkingHourDto = exports.SetWorkingHoursDto = exports.WorkingHourDto = exports.RejectBlockDto = exports.UpdateBlockDto = exports.CreateBlockDto = exports.CheckAvailabilityDto = exports.CancelAppointmentDto = exports.RescheduleAppointmentDto = exports.UpdateAppointmentDto = exports.CreateAppointmentDto = exports.RecurringPattern = exports.BlockStatus = exports.BlockType = exports.AppointmentSource = exports.Priority = exports.LocationType = exports.AppointmentStatus = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["SCHEDULED"] = "SCHEDULED";
    AppointmentStatus["PENDING_CONFIRMATION"] = "PENDING_CONFIRMATION";
    AppointmentStatus["CONFIRMED"] = "CONFIRMED";
    AppointmentStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AppointmentStatus["COMPLETED"] = "COMPLETED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
    AppointmentStatus["NO_SHOW"] = "NO_SHOW";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
var LocationType;
(function (LocationType) {
    LocationType["SALON"] = "SALON";
    LocationType["HOME"] = "HOME";
    LocationType["ONLINE"] = "ONLINE";
})(LocationType || (exports.LocationType = LocationType = {}));
var Priority;
(function (Priority) {
    Priority["NORMAL"] = "NORMAL";
    Priority["VIP"] = "VIP";
    Priority["URGENT"] = "URGENT";
})(Priority || (exports.Priority = Priority = {}));
var AppointmentSource;
(function (AppointmentSource) {
    AppointmentSource["MANUAL"] = "MANUAL";
    AppointmentSource["ONLINE"] = "ONLINE";
    AppointmentSource["WHATSAPP"] = "WHATSAPP";
    AppointmentSource["APP"] = "APP";
})(AppointmentSource || (exports.AppointmentSource = AppointmentSource = {}));
var BlockType;
(function (BlockType) {
    BlockType["DAY_OFF"] = "DAY_OFF";
    BlockType["VACATION"] = "VACATION";
    BlockType["SICK_LEAVE"] = "SICK_LEAVE";
    BlockType["PERSONAL"] = "PERSONAL";
    BlockType["LUNCH"] = "LUNCH";
    BlockType["TRAINING"] = "TRAINING";
    BlockType["MAINTENANCE"] = "MAINTENANCE";
    BlockType["OTHER"] = "OTHER";
})(BlockType || (exports.BlockType = BlockType = {}));
var BlockStatus;
(function (BlockStatus) {
    BlockStatus["PENDING"] = "PENDING";
    BlockStatus["APPROVED"] = "APPROVED";
    BlockStatus["REJECTED"] = "REJECTED";
    BlockStatus["CANCELLED"] = "CANCELLED";
})(BlockStatus || (exports.BlockStatus = BlockStatus = {}));
var RecurringPattern;
(function (RecurringPattern) {
    RecurringPattern["DAILY"] = "DAILY";
    RecurringPattern["WEEKLY"] = "WEEKLY";
    RecurringPattern["BIWEEKLY"] = "BIWEEKLY";
    RecurringPattern["MONTHLY"] = "MONTHLY";
})(RecurringPattern || (exports.RecurringPattern = RecurringPattern = {}));
// ==================== APPOINTMENT DTOs ====================
let CreateAppointmentDto = (() => {
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _clientName_decorators;
    let _clientName_initializers = [];
    let _clientName_extraInitializers = [];
    let _clientPhone_decorators;
    let _clientPhone_initializers = [];
    let _clientPhone_extraInitializers = [];
    let _clientEmail_decorators;
    let _clientEmail_initializers = [];
    let _clientEmail_extraInitializers = [];
    let _professionalId_decorators;
    let _professionalId_initializers = [];
    let _professionalId_extraInitializers = [];
    let _serviceId_decorators;
    let _serviceId_initializers = [];
    let _serviceId_extraInitializers = [];
    let _service_decorators;
    let _service_initializers = [];
    let _service_extraInitializers = [];
    let _date_decorators;
    let _date_initializers = [];
    let _date_extraInitializers = [];
    let _time_decorators;
    let _time_initializers = [];
    let _time_extraInitializers = [];
    let _duration_decorators;
    let _duration_initializers = [];
    let _duration_extraInitializers = [];
    let _bufferBefore_decorators;
    let _bufferBefore_initializers = [];
    let _bufferBefore_extraInitializers = [];
    let _bufferAfter_decorators;
    let _bufferAfter_initializers = [];
    let _bufferAfter_extraInitializers = [];
    let _locationType_decorators;
    let _locationType_initializers = [];
    let _locationType_extraInitializers = [];
    let _address_decorators;
    let _address_initializers = [];
    let _address_extraInitializers = [];
    let _priority_decorators;
    let _priority_initializers = [];
    let _priority_extraInitializers = [];
    let _color_decorators;
    let _color_initializers = [];
    let _color_extraInitializers = [];
    let _price_decorators;
    let _price_initializers = [];
    let _price_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _internalNotes_decorators;
    let _internalNotes_initializers = [];
    let _internalNotes_extraInitializers = [];
    let _source_decorators;
    let _source_initializers = [];
    let _source_extraInitializers = [];
    return class CreateAppointmentDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _clientId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUUID)()];
            _clientName_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome do cliente (para cliente avulso)', example: 'Maria Silva' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _clientPhone_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Telefone do cliente', example: '11999998888' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _clientEmail_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Email do cliente', example: 'maria@exemplo.com' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _professionalId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' }), (0, class_validator_1.IsUUID)()];
            _serviceId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do serviço', example: 1 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _service_decorators = [(0, swagger_1.ApiProperty)({ description: 'Nome do serviço', example: 'Corte Feminino' }), (0, class_validator_1.IsString)()];
            _date_decorators = [(0, swagger_1.ApiProperty)({ description: 'Data do agendamento (YYYY-MM-DD)', example: '2026-01-20' }), (0, class_validator_1.IsString)()];
            _time_decorators = [(0, swagger_1.ApiProperty)({ description: 'Horário do agendamento (HH:mm)', example: '14:30' }), (0, class_validator_1.IsString)()];
            _duration_decorators = [(0, swagger_1.ApiProperty)({ description: 'Duração em minutos', example: 60, minimum: 5, maximum: 480 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(5), (0, class_validator_1.Max)(480)];
            _bufferBefore_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Buffer antes do atendimento (minutos)', example: 10, minimum: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _bufferAfter_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Buffer após o atendimento (minutos)', example: 10, minimum: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _locationType_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Tipo de local', enum: LocationType, example: 'SALON' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(LocationType)];
            _address_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Endereço (para atendimento externo)', example: 'Rua das Flores, 123' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _priority_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Prioridade do agendamento', enum: Priority, example: 'NORMAL' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(Priority)];
            _color_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Cor para exibição na agenda', example: '#FF5733' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _price_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Preço do serviço', example: '150.00' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _notes_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Observações visíveis ao cliente', example: 'Trazer referência de corte' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _internalNotes_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Notas internas (não visíveis ao cliente)', example: 'Cliente prefere horários pela manhã' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _source_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Origem do agendamento', enum: AppointmentSource, example: 'MANUAL' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(AppointmentSource)];
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _clientName_decorators, { kind: "field", name: "clientName", static: false, private: false, access: { has: obj => "clientName" in obj, get: obj => obj.clientName, set: (obj, value) => { obj.clientName = value; } }, metadata: _metadata }, _clientName_initializers, _clientName_extraInitializers);
            __esDecorate(null, null, _clientPhone_decorators, { kind: "field", name: "clientPhone", static: false, private: false, access: { has: obj => "clientPhone" in obj, get: obj => obj.clientPhone, set: (obj, value) => { obj.clientPhone = value; } }, metadata: _metadata }, _clientPhone_initializers, _clientPhone_extraInitializers);
            __esDecorate(null, null, _clientEmail_decorators, { kind: "field", name: "clientEmail", static: false, private: false, access: { has: obj => "clientEmail" in obj, get: obj => obj.clientEmail, set: (obj, value) => { obj.clientEmail = value; } }, metadata: _metadata }, _clientEmail_initializers, _clientEmail_extraInitializers);
            __esDecorate(null, null, _professionalId_decorators, { kind: "field", name: "professionalId", static: false, private: false, access: { has: obj => "professionalId" in obj, get: obj => obj.professionalId, set: (obj, value) => { obj.professionalId = value; } }, metadata: _metadata }, _professionalId_initializers, _professionalId_extraInitializers);
            __esDecorate(null, null, _serviceId_decorators, { kind: "field", name: "serviceId", static: false, private: false, access: { has: obj => "serviceId" in obj, get: obj => obj.serviceId, set: (obj, value) => { obj.serviceId = value; } }, metadata: _metadata }, _serviceId_initializers, _serviceId_extraInitializers);
            __esDecorate(null, null, _service_decorators, { kind: "field", name: "service", static: false, private: false, access: { has: obj => "service" in obj, get: obj => obj.service, set: (obj, value) => { obj.service = value; } }, metadata: _metadata }, _service_initializers, _service_extraInitializers);
            __esDecorate(null, null, _date_decorators, { kind: "field", name: "date", static: false, private: false, access: { has: obj => "date" in obj, get: obj => obj.date, set: (obj, value) => { obj.date = value; } }, metadata: _metadata }, _date_initializers, _date_extraInitializers);
            __esDecorate(null, null, _time_decorators, { kind: "field", name: "time", static: false, private: false, access: { has: obj => "time" in obj, get: obj => obj.time, set: (obj, value) => { obj.time = value; } }, metadata: _metadata }, _time_initializers, _time_extraInitializers);
            __esDecorate(null, null, _duration_decorators, { kind: "field", name: "duration", static: false, private: false, access: { has: obj => "duration" in obj, get: obj => obj.duration, set: (obj, value) => { obj.duration = value; } }, metadata: _metadata }, _duration_initializers, _duration_extraInitializers);
            __esDecorate(null, null, _bufferBefore_decorators, { kind: "field", name: "bufferBefore", static: false, private: false, access: { has: obj => "bufferBefore" in obj, get: obj => obj.bufferBefore, set: (obj, value) => { obj.bufferBefore = value; } }, metadata: _metadata }, _bufferBefore_initializers, _bufferBefore_extraInitializers);
            __esDecorate(null, null, _bufferAfter_decorators, { kind: "field", name: "bufferAfter", static: false, private: false, access: { has: obj => "bufferAfter" in obj, get: obj => obj.bufferAfter, set: (obj, value) => { obj.bufferAfter = value; } }, metadata: _metadata }, _bufferAfter_initializers, _bufferAfter_extraInitializers);
            __esDecorate(null, null, _locationType_decorators, { kind: "field", name: "locationType", static: false, private: false, access: { has: obj => "locationType" in obj, get: obj => obj.locationType, set: (obj, value) => { obj.locationType = value; } }, metadata: _metadata }, _locationType_initializers, _locationType_extraInitializers);
            __esDecorate(null, null, _address_decorators, { kind: "field", name: "address", static: false, private: false, access: { has: obj => "address" in obj, get: obj => obj.address, set: (obj, value) => { obj.address = value; } }, metadata: _metadata }, _address_initializers, _address_extraInitializers);
            __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: obj => "priority" in obj, get: obj => obj.priority, set: (obj, value) => { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
            __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: obj => "price" in obj, get: obj => obj.price, set: (obj, value) => { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, null, _internalNotes_decorators, { kind: "field", name: "internalNotes", static: false, private: false, access: { has: obj => "internalNotes" in obj, get: obj => obj.internalNotes, set: (obj, value) => { obj.internalNotes = value; } }, metadata: _metadata }, _internalNotes_initializers, _internalNotes_extraInitializers);
            __esDecorate(null, null, _source_decorators, { kind: "field", name: "source", static: false, private: false, access: { has: obj => "source" in obj, get: obj => obj.source, set: (obj, value) => { obj.source = value; } }, metadata: _metadata }, _source_initializers, _source_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        clientId = __runInitializers(this, _clientId_initializers, void 0);
        clientName = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _clientName_initializers, void 0));
        clientPhone = (__runInitializers(this, _clientName_extraInitializers), __runInitializers(this, _clientPhone_initializers, void 0));
        clientEmail = (__runInitializers(this, _clientPhone_extraInitializers), __runInitializers(this, _clientEmail_initializers, void 0));
        professionalId = (__runInitializers(this, _clientEmail_extraInitializers), __runInitializers(this, _professionalId_initializers, void 0));
        serviceId = (__runInitializers(this, _professionalId_extraInitializers), __runInitializers(this, _serviceId_initializers, void 0));
        service = (__runInitializers(this, _serviceId_extraInitializers), __runInitializers(this, _service_initializers, void 0));
        date = (__runInitializers(this, _service_extraInitializers), __runInitializers(this, _date_initializers, void 0));
        time = (__runInitializers(this, _date_extraInitializers), __runInitializers(this, _time_initializers, void 0));
        duration = (__runInitializers(this, _time_extraInitializers), __runInitializers(this, _duration_initializers, void 0));
        bufferBefore = (__runInitializers(this, _duration_extraInitializers), __runInitializers(this, _bufferBefore_initializers, void 0));
        bufferAfter = (__runInitializers(this, _bufferBefore_extraInitializers), __runInitializers(this, _bufferAfter_initializers, void 0));
        locationType = (__runInitializers(this, _bufferAfter_extraInitializers), __runInitializers(this, _locationType_initializers, void 0));
        address = (__runInitializers(this, _locationType_extraInitializers), __runInitializers(this, _address_initializers, void 0));
        priority = (__runInitializers(this, _address_extraInitializers), __runInitializers(this, _priority_initializers, void 0));
        color = (__runInitializers(this, _priority_extraInitializers), __runInitializers(this, _color_initializers, void 0));
        price = (__runInitializers(this, _color_extraInitializers), __runInitializers(this, _price_initializers, void 0));
        notes = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        internalNotes = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _internalNotes_initializers, void 0));
        source = (__runInitializers(this, _internalNotes_extraInitializers), __runInitializers(this, _source_initializers, void 0));
        constructor() {
            __runInitializers(this, _source_extraInitializers);
        }
    };
})();
exports.CreateAppointmentDto = CreateAppointmentDto;
let UpdateAppointmentDto = (() => {
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _clientName_decorators;
    let _clientName_initializers = [];
    let _clientName_extraInitializers = [];
    let _clientPhone_decorators;
    let _clientPhone_initializers = [];
    let _clientPhone_extraInitializers = [];
    let _clientEmail_decorators;
    let _clientEmail_initializers = [];
    let _clientEmail_extraInitializers = [];
    let _professionalId_decorators;
    let _professionalId_initializers = [];
    let _professionalId_extraInitializers = [];
    let _serviceId_decorators;
    let _serviceId_initializers = [];
    let _serviceId_extraInitializers = [];
    let _service_decorators;
    let _service_initializers = [];
    let _service_extraInitializers = [];
    let _date_decorators;
    let _date_initializers = [];
    let _date_extraInitializers = [];
    let _time_decorators;
    let _time_initializers = [];
    let _time_extraInitializers = [];
    let _duration_decorators;
    let _duration_initializers = [];
    let _duration_extraInitializers = [];
    let _bufferBefore_decorators;
    let _bufferBefore_initializers = [];
    let _bufferBefore_extraInitializers = [];
    let _bufferAfter_decorators;
    let _bufferAfter_initializers = [];
    let _bufferAfter_extraInitializers = [];
    let _locationType_decorators;
    let _locationType_initializers = [];
    let _locationType_extraInitializers = [];
    let _address_decorators;
    let _address_initializers = [];
    let _address_extraInitializers = [];
    let _priority_decorators;
    let _priority_initializers = [];
    let _priority_extraInitializers = [];
    let _color_decorators;
    let _color_initializers = [];
    let _color_extraInitializers = [];
    let _price_decorators;
    let _price_initializers = [];
    let _price_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _internalNotes_decorators;
    let _internalNotes_initializers = [];
    let _internalNotes_extraInitializers = [];
    return class UpdateAppointmentDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _clientId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUUID)()];
            _clientName_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome do cliente', example: 'Maria Silva' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _clientPhone_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Telefone do cliente', example: '11999998888' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _clientEmail_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Email do cliente', example: 'maria@exemplo.com' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _professionalId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUUID)()];
            _serviceId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do serviço', example: 1 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _service_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome do serviço', example: 'Corte Feminino' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _date_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data do agendamento (YYYY-MM-DD)', example: '2026-01-20' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _time_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário do agendamento (HH:mm)', example: '14:30' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _duration_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Duração em minutos', example: 60, minimum: 5, maximum: 480 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(5), (0, class_validator_1.Max)(480)];
            _bufferBefore_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Buffer antes do atendimento (minutos)', example: 10, minimum: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _bufferAfter_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Buffer após o atendimento (minutos)', example: 10, minimum: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _locationType_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Tipo de local', enum: LocationType, example: 'SALON' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(LocationType)];
            _address_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Endereço (para atendimento externo)', example: 'Rua das Flores, 123' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _priority_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Prioridade do agendamento', enum: Priority, example: 'NORMAL' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(Priority)];
            _color_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Cor para exibição na agenda', example: '#FF5733' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _price_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Preço do serviço', example: '150.00' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _notes_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Observações visíveis ao cliente', example: 'Trazer referência de corte' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _internalNotes_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Notas internas (não visíveis ao cliente)', example: 'Cliente prefere horários pela manhã' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _clientName_decorators, { kind: "field", name: "clientName", static: false, private: false, access: { has: obj => "clientName" in obj, get: obj => obj.clientName, set: (obj, value) => { obj.clientName = value; } }, metadata: _metadata }, _clientName_initializers, _clientName_extraInitializers);
            __esDecorate(null, null, _clientPhone_decorators, { kind: "field", name: "clientPhone", static: false, private: false, access: { has: obj => "clientPhone" in obj, get: obj => obj.clientPhone, set: (obj, value) => { obj.clientPhone = value; } }, metadata: _metadata }, _clientPhone_initializers, _clientPhone_extraInitializers);
            __esDecorate(null, null, _clientEmail_decorators, { kind: "field", name: "clientEmail", static: false, private: false, access: { has: obj => "clientEmail" in obj, get: obj => obj.clientEmail, set: (obj, value) => { obj.clientEmail = value; } }, metadata: _metadata }, _clientEmail_initializers, _clientEmail_extraInitializers);
            __esDecorate(null, null, _professionalId_decorators, { kind: "field", name: "professionalId", static: false, private: false, access: { has: obj => "professionalId" in obj, get: obj => obj.professionalId, set: (obj, value) => { obj.professionalId = value; } }, metadata: _metadata }, _professionalId_initializers, _professionalId_extraInitializers);
            __esDecorate(null, null, _serviceId_decorators, { kind: "field", name: "serviceId", static: false, private: false, access: { has: obj => "serviceId" in obj, get: obj => obj.serviceId, set: (obj, value) => { obj.serviceId = value; } }, metadata: _metadata }, _serviceId_initializers, _serviceId_extraInitializers);
            __esDecorate(null, null, _service_decorators, { kind: "field", name: "service", static: false, private: false, access: { has: obj => "service" in obj, get: obj => obj.service, set: (obj, value) => { obj.service = value; } }, metadata: _metadata }, _service_initializers, _service_extraInitializers);
            __esDecorate(null, null, _date_decorators, { kind: "field", name: "date", static: false, private: false, access: { has: obj => "date" in obj, get: obj => obj.date, set: (obj, value) => { obj.date = value; } }, metadata: _metadata }, _date_initializers, _date_extraInitializers);
            __esDecorate(null, null, _time_decorators, { kind: "field", name: "time", static: false, private: false, access: { has: obj => "time" in obj, get: obj => obj.time, set: (obj, value) => { obj.time = value; } }, metadata: _metadata }, _time_initializers, _time_extraInitializers);
            __esDecorate(null, null, _duration_decorators, { kind: "field", name: "duration", static: false, private: false, access: { has: obj => "duration" in obj, get: obj => obj.duration, set: (obj, value) => { obj.duration = value; } }, metadata: _metadata }, _duration_initializers, _duration_extraInitializers);
            __esDecorate(null, null, _bufferBefore_decorators, { kind: "field", name: "bufferBefore", static: false, private: false, access: { has: obj => "bufferBefore" in obj, get: obj => obj.bufferBefore, set: (obj, value) => { obj.bufferBefore = value; } }, metadata: _metadata }, _bufferBefore_initializers, _bufferBefore_extraInitializers);
            __esDecorate(null, null, _bufferAfter_decorators, { kind: "field", name: "bufferAfter", static: false, private: false, access: { has: obj => "bufferAfter" in obj, get: obj => obj.bufferAfter, set: (obj, value) => { obj.bufferAfter = value; } }, metadata: _metadata }, _bufferAfter_initializers, _bufferAfter_extraInitializers);
            __esDecorate(null, null, _locationType_decorators, { kind: "field", name: "locationType", static: false, private: false, access: { has: obj => "locationType" in obj, get: obj => obj.locationType, set: (obj, value) => { obj.locationType = value; } }, metadata: _metadata }, _locationType_initializers, _locationType_extraInitializers);
            __esDecorate(null, null, _address_decorators, { kind: "field", name: "address", static: false, private: false, access: { has: obj => "address" in obj, get: obj => obj.address, set: (obj, value) => { obj.address = value; } }, metadata: _metadata }, _address_initializers, _address_extraInitializers);
            __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: obj => "priority" in obj, get: obj => obj.priority, set: (obj, value) => { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
            __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: obj => "price" in obj, get: obj => obj.price, set: (obj, value) => { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, null, _internalNotes_decorators, { kind: "field", name: "internalNotes", static: false, private: false, access: { has: obj => "internalNotes" in obj, get: obj => obj.internalNotes, set: (obj, value) => { obj.internalNotes = value; } }, metadata: _metadata }, _internalNotes_initializers, _internalNotes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        clientId = __runInitializers(this, _clientId_initializers, void 0);
        clientName = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _clientName_initializers, void 0));
        clientPhone = (__runInitializers(this, _clientName_extraInitializers), __runInitializers(this, _clientPhone_initializers, void 0));
        clientEmail = (__runInitializers(this, _clientPhone_extraInitializers), __runInitializers(this, _clientEmail_initializers, void 0));
        professionalId = (__runInitializers(this, _clientEmail_extraInitializers), __runInitializers(this, _professionalId_initializers, void 0));
        serviceId = (__runInitializers(this, _professionalId_extraInitializers), __runInitializers(this, _serviceId_initializers, void 0));
        service = (__runInitializers(this, _serviceId_extraInitializers), __runInitializers(this, _service_initializers, void 0));
        date = (__runInitializers(this, _service_extraInitializers), __runInitializers(this, _date_initializers, void 0));
        time = (__runInitializers(this, _date_extraInitializers), __runInitializers(this, _time_initializers, void 0));
        duration = (__runInitializers(this, _time_extraInitializers), __runInitializers(this, _duration_initializers, void 0));
        bufferBefore = (__runInitializers(this, _duration_extraInitializers), __runInitializers(this, _bufferBefore_initializers, void 0));
        bufferAfter = (__runInitializers(this, _bufferBefore_extraInitializers), __runInitializers(this, _bufferAfter_initializers, void 0));
        locationType = (__runInitializers(this, _bufferAfter_extraInitializers), __runInitializers(this, _locationType_initializers, void 0));
        address = (__runInitializers(this, _locationType_extraInitializers), __runInitializers(this, _address_initializers, void 0));
        priority = (__runInitializers(this, _address_extraInitializers), __runInitializers(this, _priority_initializers, void 0));
        color = (__runInitializers(this, _priority_extraInitializers), __runInitializers(this, _color_initializers, void 0));
        price = (__runInitializers(this, _color_extraInitializers), __runInitializers(this, _price_initializers, void 0));
        notes = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        internalNotes = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _internalNotes_initializers, void 0));
        constructor() {
            __runInitializers(this, _internalNotes_extraInitializers);
        }
    };
})();
exports.UpdateAppointmentDto = UpdateAppointmentDto;
let RescheduleAppointmentDto = (() => {
    let _date_decorators;
    let _date_initializers = [];
    let _date_extraInitializers = [];
    let _time_decorators;
    let _time_initializers = [];
    let _time_extraInitializers = [];
    let _professionalId_decorators;
    let _professionalId_initializers = [];
    let _professionalId_extraInitializers = [];
    return class RescheduleAppointmentDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _date_decorators = [(0, swagger_1.ApiProperty)({ description: 'Nova data do agendamento (YYYY-MM-DD)', example: '2026-01-25' }), (0, class_validator_1.IsString)()];
            _time_decorators = [(0, swagger_1.ApiProperty)({ description: 'Novo horário do agendamento (HH:mm)', example: '10:00' }), (0, class_validator_1.IsString)()];
            _professionalId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Novo profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUUID)()];
            __esDecorate(null, null, _date_decorators, { kind: "field", name: "date", static: false, private: false, access: { has: obj => "date" in obj, get: obj => obj.date, set: (obj, value) => { obj.date = value; } }, metadata: _metadata }, _date_initializers, _date_extraInitializers);
            __esDecorate(null, null, _time_decorators, { kind: "field", name: "time", static: false, private: false, access: { has: obj => "time" in obj, get: obj => obj.time, set: (obj, value) => { obj.time = value; } }, metadata: _metadata }, _time_initializers, _time_extraInitializers);
            __esDecorate(null, null, _professionalId_decorators, { kind: "field", name: "professionalId", static: false, private: false, access: { has: obj => "professionalId" in obj, get: obj => obj.professionalId, set: (obj, value) => { obj.professionalId = value; } }, metadata: _metadata }, _professionalId_initializers, _professionalId_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        date = __runInitializers(this, _date_initializers, void 0);
        time = (__runInitializers(this, _date_extraInitializers), __runInitializers(this, _time_initializers, void 0));
        professionalId = (__runInitializers(this, _time_extraInitializers), __runInitializers(this, _professionalId_initializers, void 0));
        constructor() {
            __runInitializers(this, _professionalId_extraInitializers);
        }
    };
})();
exports.RescheduleAppointmentDto = RescheduleAppointmentDto;
let CancelAppointmentDto = (() => {
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    return class CancelAppointmentDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _reason_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Motivo do cancelamento', example: 'Cliente solicitou reagendamento' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        reason = __runInitializers(this, _reason_initializers, void 0);
        constructor() {
            __runInitializers(this, _reason_extraInitializers);
        }
    };
})();
exports.CancelAppointmentDto = CancelAppointmentDto;
let CheckAvailabilityDto = (() => {
    let _professionalId_decorators;
    let _professionalId_initializers = [];
    let _professionalId_extraInitializers = [];
    let _date_decorators;
    let _date_initializers = [];
    let _date_extraInitializers = [];
    let _startTime_decorators;
    let _startTime_initializers = [];
    let _startTime_extraInitializers = [];
    let _duration_decorators;
    let _duration_initializers = [];
    let _duration_extraInitializers = [];
    return class CheckAvailabilityDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _professionalId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' }), (0, class_validator_1.IsUUID)()];
            _date_decorators = [(0, swagger_1.ApiProperty)({ description: 'Data para verificar disponibilidade (YYYY-MM-DD)', example: '2026-01-20' }), (0, class_validator_1.IsString)()];
            _startTime_decorators = [(0, swagger_1.ApiProperty)({ description: 'Horário inicial (HH:mm)', example: '14:00' }), (0, class_validator_1.IsString)()];
            _duration_decorators = [(0, swagger_1.ApiProperty)({ description: 'Duração desejada em minutos', example: 60, minimum: 5 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(5)];
            __esDecorate(null, null, _professionalId_decorators, { kind: "field", name: "professionalId", static: false, private: false, access: { has: obj => "professionalId" in obj, get: obj => obj.professionalId, set: (obj, value) => { obj.professionalId = value; } }, metadata: _metadata }, _professionalId_initializers, _professionalId_extraInitializers);
            __esDecorate(null, null, _date_decorators, { kind: "field", name: "date", static: false, private: false, access: { has: obj => "date" in obj, get: obj => obj.date, set: (obj, value) => { obj.date = value; } }, metadata: _metadata }, _date_initializers, _date_extraInitializers);
            __esDecorate(null, null, _startTime_decorators, { kind: "field", name: "startTime", static: false, private: false, access: { has: obj => "startTime" in obj, get: obj => obj.startTime, set: (obj, value) => { obj.startTime = value; } }, metadata: _metadata }, _startTime_initializers, _startTime_extraInitializers);
            __esDecorate(null, null, _duration_decorators, { kind: "field", name: "duration", static: false, private: false, access: { has: obj => "duration" in obj, get: obj => obj.duration, set: (obj, value) => { obj.duration = value; } }, metadata: _metadata }, _duration_initializers, _duration_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        professionalId = __runInitializers(this, _professionalId_initializers, void 0);
        date = (__runInitializers(this, _professionalId_extraInitializers), __runInitializers(this, _date_initializers, void 0));
        startTime = (__runInitializers(this, _date_extraInitializers), __runInitializers(this, _startTime_initializers, void 0));
        duration = (__runInitializers(this, _startTime_extraInitializers), __runInitializers(this, _duration_initializers, void 0));
        constructor() {
            __runInitializers(this, _duration_extraInitializers);
        }
    };
})();
exports.CheckAvailabilityDto = CheckAvailabilityDto;
// ==================== BLOCK DTOs ====================
let CreateBlockDto = (() => {
    let _professionalId_decorators;
    let _professionalId_initializers = [];
    let _professionalId_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _title_decorators;
    let _title_initializers = [];
    let _title_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _startDate_decorators;
    let _startDate_initializers = [];
    let _startDate_extraInitializers = [];
    let _endDate_decorators;
    let _endDate_initializers = [];
    let _endDate_extraInitializers = [];
    let _startTime_decorators;
    let _startTime_initializers = [];
    let _startTime_extraInitializers = [];
    let _endTime_decorators;
    let _endTime_initializers = [];
    let _endTime_extraInitializers = [];
    let _allDay_decorators;
    let _allDay_initializers = [];
    let _allDay_extraInitializers = [];
    let _recurring_decorators;
    let _recurring_initializers = [];
    let _recurring_extraInitializers = [];
    let _recurringPattern_decorators;
    let _recurringPattern_initializers = [];
    let _recurringPattern_extraInitializers = [];
    let _recurringDays_decorators;
    let _recurringDays_initializers = [];
    let _recurringDays_extraInitializers = [];
    let _recurringEndDate_decorators;
    let _recurringEndDate_initializers = [];
    let _recurringEndDate_extraInitializers = [];
    let _requiresApproval_decorators;
    let _requiresApproval_initializers = [];
    let _requiresApproval_extraInitializers = [];
    return class CreateBlockDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _professionalId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' }), (0, class_validator_1.IsUUID)()];
            _type_decorators = [(0, swagger_1.ApiProperty)({ description: 'Tipo de bloqueio', enum: BlockType, example: 'VACATION' }), (0, class_validator_1.IsEnum)(BlockType)];
            _title_decorators = [(0, swagger_1.ApiProperty)({ description: 'Título do bloqueio', example: 'Férias de Janeiro' }), (0, class_validator_1.IsString)()];
            _description_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Descrição adicional', example: 'Viagem com a família' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _startDate_decorators = [(0, swagger_1.ApiProperty)({ description: 'Data de início (YYYY-MM-DD)', example: '2026-01-15' }), (0, class_validator_1.IsString)()];
            _endDate_decorators = [(0, swagger_1.ApiProperty)({ description: 'Data de término (YYYY-MM-DD)', example: '2026-01-30' }), (0, class_validator_1.IsString)()];
            _startTime_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário de início (HH:mm)', example: '08:00' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _endTime_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário de término (HH:mm)', example: '18:00' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _allDay_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Bloqueio de dia inteiro', example: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _recurring_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Bloqueio recorrente', example: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _recurringPattern_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Padrão de recorrência', enum: RecurringPattern, example: 'WEEKLY' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(RecurringPattern)];
            _recurringDays_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Dias da semana (0=Dom, 6=Sáb)', example: [1, 3, 5], type: [Number] }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _recurringEndDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data final da recorrência (YYYY-MM-DD)', example: '2026-12-31' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _requiresApproval_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Requer aprovação do gerente', example: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _professionalId_decorators, { kind: "field", name: "professionalId", static: false, private: false, access: { has: obj => "professionalId" in obj, get: obj => obj.professionalId, set: (obj, value) => { obj.professionalId = value; } }, metadata: _metadata }, _professionalId_initializers, _professionalId_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: obj => "title" in obj, get: obj => obj.title, set: (obj, value) => { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _startDate_decorators, { kind: "field", name: "startDate", static: false, private: false, access: { has: obj => "startDate" in obj, get: obj => obj.startDate, set: (obj, value) => { obj.startDate = value; } }, metadata: _metadata }, _startDate_initializers, _startDate_extraInitializers);
            __esDecorate(null, null, _endDate_decorators, { kind: "field", name: "endDate", static: false, private: false, access: { has: obj => "endDate" in obj, get: obj => obj.endDate, set: (obj, value) => { obj.endDate = value; } }, metadata: _metadata }, _endDate_initializers, _endDate_extraInitializers);
            __esDecorate(null, null, _startTime_decorators, { kind: "field", name: "startTime", static: false, private: false, access: { has: obj => "startTime" in obj, get: obj => obj.startTime, set: (obj, value) => { obj.startTime = value; } }, metadata: _metadata }, _startTime_initializers, _startTime_extraInitializers);
            __esDecorate(null, null, _endTime_decorators, { kind: "field", name: "endTime", static: false, private: false, access: { has: obj => "endTime" in obj, get: obj => obj.endTime, set: (obj, value) => { obj.endTime = value; } }, metadata: _metadata }, _endTime_initializers, _endTime_extraInitializers);
            __esDecorate(null, null, _allDay_decorators, { kind: "field", name: "allDay", static: false, private: false, access: { has: obj => "allDay" in obj, get: obj => obj.allDay, set: (obj, value) => { obj.allDay = value; } }, metadata: _metadata }, _allDay_initializers, _allDay_extraInitializers);
            __esDecorate(null, null, _recurring_decorators, { kind: "field", name: "recurring", static: false, private: false, access: { has: obj => "recurring" in obj, get: obj => obj.recurring, set: (obj, value) => { obj.recurring = value; } }, metadata: _metadata }, _recurring_initializers, _recurring_extraInitializers);
            __esDecorate(null, null, _recurringPattern_decorators, { kind: "field", name: "recurringPattern", static: false, private: false, access: { has: obj => "recurringPattern" in obj, get: obj => obj.recurringPattern, set: (obj, value) => { obj.recurringPattern = value; } }, metadata: _metadata }, _recurringPattern_initializers, _recurringPattern_extraInitializers);
            __esDecorate(null, null, _recurringDays_decorators, { kind: "field", name: "recurringDays", static: false, private: false, access: { has: obj => "recurringDays" in obj, get: obj => obj.recurringDays, set: (obj, value) => { obj.recurringDays = value; } }, metadata: _metadata }, _recurringDays_initializers, _recurringDays_extraInitializers);
            __esDecorate(null, null, _recurringEndDate_decorators, { kind: "field", name: "recurringEndDate", static: false, private: false, access: { has: obj => "recurringEndDate" in obj, get: obj => obj.recurringEndDate, set: (obj, value) => { obj.recurringEndDate = value; } }, metadata: _metadata }, _recurringEndDate_initializers, _recurringEndDate_extraInitializers);
            __esDecorate(null, null, _requiresApproval_decorators, { kind: "field", name: "requiresApproval", static: false, private: false, access: { has: obj => "requiresApproval" in obj, get: obj => obj.requiresApproval, set: (obj, value) => { obj.requiresApproval = value; } }, metadata: _metadata }, _requiresApproval_initializers, _requiresApproval_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        professionalId = __runInitializers(this, _professionalId_initializers, void 0);
        type = (__runInitializers(this, _professionalId_extraInitializers), __runInitializers(this, _type_initializers, void 0));
        title = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _title_initializers, void 0));
        description = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        startDate = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _startDate_initializers, void 0));
        endDate = (__runInitializers(this, _startDate_extraInitializers), __runInitializers(this, _endDate_initializers, void 0));
        startTime = (__runInitializers(this, _endDate_extraInitializers), __runInitializers(this, _startTime_initializers, void 0));
        endTime = (__runInitializers(this, _startTime_extraInitializers), __runInitializers(this, _endTime_initializers, void 0));
        allDay = (__runInitializers(this, _endTime_extraInitializers), __runInitializers(this, _allDay_initializers, void 0));
        recurring = (__runInitializers(this, _allDay_extraInitializers), __runInitializers(this, _recurring_initializers, void 0));
        recurringPattern = (__runInitializers(this, _recurring_extraInitializers), __runInitializers(this, _recurringPattern_initializers, void 0));
        recurringDays = (__runInitializers(this, _recurringPattern_extraInitializers), __runInitializers(this, _recurringDays_initializers, void 0));
        recurringEndDate = (__runInitializers(this, _recurringDays_extraInitializers), __runInitializers(this, _recurringEndDate_initializers, void 0));
        requiresApproval = (__runInitializers(this, _recurringEndDate_extraInitializers), __runInitializers(this, _requiresApproval_initializers, void 0));
        constructor() {
            __runInitializers(this, _requiresApproval_extraInitializers);
        }
    };
})();
exports.CreateBlockDto = CreateBlockDto;
let UpdateBlockDto = (() => {
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _title_decorators;
    let _title_initializers = [];
    let _title_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _startDate_decorators;
    let _startDate_initializers = [];
    let _startDate_extraInitializers = [];
    let _endDate_decorators;
    let _endDate_initializers = [];
    let _endDate_extraInitializers = [];
    let _startTime_decorators;
    let _startTime_initializers = [];
    let _startTime_extraInitializers = [];
    let _endTime_decorators;
    let _endTime_initializers = [];
    let _endTime_extraInitializers = [];
    let _allDay_decorators;
    let _allDay_initializers = [];
    let _allDay_extraInitializers = [];
    let _recurring_decorators;
    let _recurring_initializers = [];
    let _recurring_extraInitializers = [];
    let _recurringPattern_decorators;
    let _recurringPattern_initializers = [];
    let _recurringPattern_extraInitializers = [];
    let _recurringDays_decorators;
    let _recurringDays_initializers = [];
    let _recurringDays_extraInitializers = [];
    let _recurringEndDate_decorators;
    let _recurringEndDate_initializers = [];
    let _recurringEndDate_extraInitializers = [];
    return class UpdateBlockDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _type_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Tipo de bloqueio', enum: BlockType, example: 'VACATION' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(BlockType)];
            _title_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Título do bloqueio', example: 'Férias de Janeiro' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _description_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Descrição adicional', example: 'Viagem com a família' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _startDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data de início (YYYY-MM-DD)', example: '2026-01-15' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _endDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data de término (YYYY-MM-DD)', example: '2026-01-30' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _startTime_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário de início (HH:mm)', example: '08:00' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _endTime_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário de término (HH:mm)', example: '18:00' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _allDay_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Bloqueio de dia inteiro', example: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _recurring_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Bloqueio recorrente', example: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _recurringPattern_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Padrão de recorrência', enum: RecurringPattern, example: 'WEEKLY' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(RecurringPattern)];
            _recurringDays_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Dias da semana (0=Dom, 6=Sáb)', example: [1, 3, 5], type: [Number] }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _recurringEndDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data final da recorrência (YYYY-MM-DD)', example: '2026-12-31' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: obj => "title" in obj, get: obj => obj.title, set: (obj, value) => { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _startDate_decorators, { kind: "field", name: "startDate", static: false, private: false, access: { has: obj => "startDate" in obj, get: obj => obj.startDate, set: (obj, value) => { obj.startDate = value; } }, metadata: _metadata }, _startDate_initializers, _startDate_extraInitializers);
            __esDecorate(null, null, _endDate_decorators, { kind: "field", name: "endDate", static: false, private: false, access: { has: obj => "endDate" in obj, get: obj => obj.endDate, set: (obj, value) => { obj.endDate = value; } }, metadata: _metadata }, _endDate_initializers, _endDate_extraInitializers);
            __esDecorate(null, null, _startTime_decorators, { kind: "field", name: "startTime", static: false, private: false, access: { has: obj => "startTime" in obj, get: obj => obj.startTime, set: (obj, value) => { obj.startTime = value; } }, metadata: _metadata }, _startTime_initializers, _startTime_extraInitializers);
            __esDecorate(null, null, _endTime_decorators, { kind: "field", name: "endTime", static: false, private: false, access: { has: obj => "endTime" in obj, get: obj => obj.endTime, set: (obj, value) => { obj.endTime = value; } }, metadata: _metadata }, _endTime_initializers, _endTime_extraInitializers);
            __esDecorate(null, null, _allDay_decorators, { kind: "field", name: "allDay", static: false, private: false, access: { has: obj => "allDay" in obj, get: obj => obj.allDay, set: (obj, value) => { obj.allDay = value; } }, metadata: _metadata }, _allDay_initializers, _allDay_extraInitializers);
            __esDecorate(null, null, _recurring_decorators, { kind: "field", name: "recurring", static: false, private: false, access: { has: obj => "recurring" in obj, get: obj => obj.recurring, set: (obj, value) => { obj.recurring = value; } }, metadata: _metadata }, _recurring_initializers, _recurring_extraInitializers);
            __esDecorate(null, null, _recurringPattern_decorators, { kind: "field", name: "recurringPattern", static: false, private: false, access: { has: obj => "recurringPattern" in obj, get: obj => obj.recurringPattern, set: (obj, value) => { obj.recurringPattern = value; } }, metadata: _metadata }, _recurringPattern_initializers, _recurringPattern_extraInitializers);
            __esDecorate(null, null, _recurringDays_decorators, { kind: "field", name: "recurringDays", static: false, private: false, access: { has: obj => "recurringDays" in obj, get: obj => obj.recurringDays, set: (obj, value) => { obj.recurringDays = value; } }, metadata: _metadata }, _recurringDays_initializers, _recurringDays_extraInitializers);
            __esDecorate(null, null, _recurringEndDate_decorators, { kind: "field", name: "recurringEndDate", static: false, private: false, access: { has: obj => "recurringEndDate" in obj, get: obj => obj.recurringEndDate, set: (obj, value) => { obj.recurringEndDate = value; } }, metadata: _metadata }, _recurringEndDate_initializers, _recurringEndDate_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        type = __runInitializers(this, _type_initializers, void 0);
        title = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _title_initializers, void 0));
        description = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        startDate = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _startDate_initializers, void 0));
        endDate = (__runInitializers(this, _startDate_extraInitializers), __runInitializers(this, _endDate_initializers, void 0));
        startTime = (__runInitializers(this, _endDate_extraInitializers), __runInitializers(this, _startTime_initializers, void 0));
        endTime = (__runInitializers(this, _startTime_extraInitializers), __runInitializers(this, _endTime_initializers, void 0));
        allDay = (__runInitializers(this, _endTime_extraInitializers), __runInitializers(this, _allDay_initializers, void 0));
        recurring = (__runInitializers(this, _allDay_extraInitializers), __runInitializers(this, _recurring_initializers, void 0));
        recurringPattern = (__runInitializers(this, _recurring_extraInitializers), __runInitializers(this, _recurringPattern_initializers, void 0));
        recurringDays = (__runInitializers(this, _recurringPattern_extraInitializers), __runInitializers(this, _recurringDays_initializers, void 0));
        recurringEndDate = (__runInitializers(this, _recurringDays_extraInitializers), __runInitializers(this, _recurringEndDate_initializers, void 0));
        constructor() {
            __runInitializers(this, _recurringEndDate_extraInitializers);
        }
    };
})();
exports.UpdateBlockDto = UpdateBlockDto;
let RejectBlockDto = (() => {
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    return class RejectBlockDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _reason_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Motivo da rejeição', example: 'Período já reservado para outro profissional' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        reason = __runInitializers(this, _reason_initializers, void 0);
        constructor() {
            __runInitializers(this, _reason_extraInitializers);
        }
    };
})();
exports.RejectBlockDto = RejectBlockDto;
// ==================== WORKING HOURS DTOs ====================
let WorkingHourDto = (() => {
    let _dayOfWeek_decorators;
    let _dayOfWeek_initializers = [];
    let _dayOfWeek_extraInitializers = [];
    let _startTime_decorators;
    let _startTime_initializers = [];
    let _startTime_extraInitializers = [];
    let _endTime_decorators;
    let _endTime_initializers = [];
    let _endTime_extraInitializers = [];
    let _breakStartTime_decorators;
    let _breakStartTime_initializers = [];
    let _breakStartTime_extraInitializers = [];
    let _breakEndTime_decorators;
    let _breakEndTime_initializers = [];
    let _breakEndTime_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    return class WorkingHourDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _dayOfWeek_decorators = [(0, swagger_1.ApiProperty)({ description: 'Dia da semana (0=Dom, 6=Sáb)', example: 1, minimum: 0, maximum: 6 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.Max)(6)];
            _startTime_decorators = [(0, swagger_1.ApiProperty)({ description: 'Horário de início (HH:mm)', example: '09:00' }), (0, class_validator_1.IsString)()];
            _endTime_decorators = [(0, swagger_1.ApiProperty)({ description: 'Horário de término (HH:mm)', example: '18:00' }), (0, class_validator_1.IsString)()];
            _breakStartTime_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Início do intervalo (HH:mm)', example: '12:00' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _breakEndTime_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Fim do intervalo (HH:mm)', example: '13:00' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _isActive_decorators = [(0, swagger_1.ApiProperty)({ description: 'Dia de trabalho ativo', example: true }), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _dayOfWeek_decorators, { kind: "field", name: "dayOfWeek", static: false, private: false, access: { has: obj => "dayOfWeek" in obj, get: obj => obj.dayOfWeek, set: (obj, value) => { obj.dayOfWeek = value; } }, metadata: _metadata }, _dayOfWeek_initializers, _dayOfWeek_extraInitializers);
            __esDecorate(null, null, _startTime_decorators, { kind: "field", name: "startTime", static: false, private: false, access: { has: obj => "startTime" in obj, get: obj => obj.startTime, set: (obj, value) => { obj.startTime = value; } }, metadata: _metadata }, _startTime_initializers, _startTime_extraInitializers);
            __esDecorate(null, null, _endTime_decorators, { kind: "field", name: "endTime", static: false, private: false, access: { has: obj => "endTime" in obj, get: obj => obj.endTime, set: (obj, value) => { obj.endTime = value; } }, metadata: _metadata }, _endTime_initializers, _endTime_extraInitializers);
            __esDecorate(null, null, _breakStartTime_decorators, { kind: "field", name: "breakStartTime", static: false, private: false, access: { has: obj => "breakStartTime" in obj, get: obj => obj.breakStartTime, set: (obj, value) => { obj.breakStartTime = value; } }, metadata: _metadata }, _breakStartTime_initializers, _breakStartTime_extraInitializers);
            __esDecorate(null, null, _breakEndTime_decorators, { kind: "field", name: "breakEndTime", static: false, private: false, access: { has: obj => "breakEndTime" in obj, get: obj => obj.breakEndTime, set: (obj, value) => { obj.breakEndTime = value; } }, metadata: _metadata }, _breakEndTime_initializers, _breakEndTime_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        dayOfWeek = __runInitializers(this, _dayOfWeek_initializers, void 0);
        startTime = (__runInitializers(this, _dayOfWeek_extraInitializers), __runInitializers(this, _startTime_initializers, void 0));
        endTime = (__runInitializers(this, _startTime_extraInitializers), __runInitializers(this, _endTime_initializers, void 0));
        breakStartTime = (__runInitializers(this, _endTime_extraInitializers), __runInitializers(this, _breakStartTime_initializers, void 0));
        breakEndTime = (__runInitializers(this, _breakStartTime_extraInitializers), __runInitializers(this, _breakEndTime_initializers, void 0));
        isActive = (__runInitializers(this, _breakEndTime_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        constructor() {
            __runInitializers(this, _isActive_extraInitializers);
        }
    };
})();
exports.WorkingHourDto = WorkingHourDto;
let SetWorkingHoursDto = (() => {
    let _professionalId_decorators;
    let _professionalId_initializers = [];
    let _professionalId_extraInitializers = [];
    let _hours_decorators;
    let _hours_initializers = [];
    let _hours_extraInitializers = [];
    return class SetWorkingHoursDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _professionalId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' }), (0, class_validator_1.IsUUID)()];
            _hours_decorators = [(0, swagger_1.ApiProperty)({ description: 'Lista de horários de trabalho', type: [WorkingHourDto] }), (0, class_validator_1.IsArray)()];
            __esDecorate(null, null, _professionalId_decorators, { kind: "field", name: "professionalId", static: false, private: false, access: { has: obj => "professionalId" in obj, get: obj => obj.professionalId, set: (obj, value) => { obj.professionalId = value; } }, metadata: _metadata }, _professionalId_initializers, _professionalId_extraInitializers);
            __esDecorate(null, null, _hours_decorators, { kind: "field", name: "hours", static: false, private: false, access: { has: obj => "hours" in obj, get: obj => obj.hours, set: (obj, value) => { obj.hours = value; } }, metadata: _metadata }, _hours_initializers, _hours_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        professionalId = __runInitializers(this, _professionalId_initializers, void 0);
        hours = (__runInitializers(this, _professionalId_extraInitializers), __runInitializers(this, _hours_initializers, void 0));
        constructor() {
            __runInitializers(this, _hours_extraInitializers);
        }
    };
})();
exports.SetWorkingHoursDto = SetWorkingHoursDto;
let UpdateWorkingHourDto = (() => {
    let _startTime_decorators;
    let _startTime_initializers = [];
    let _startTime_extraInitializers = [];
    let _endTime_decorators;
    let _endTime_initializers = [];
    let _endTime_extraInitializers = [];
    let _breakStartTime_decorators;
    let _breakStartTime_initializers = [];
    let _breakStartTime_extraInitializers = [];
    let _breakEndTime_decorators;
    let _breakEndTime_initializers = [];
    let _breakEndTime_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    return class UpdateWorkingHourDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _startTime_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário de início (HH:mm)', example: '09:00' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _endTime_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário de término (HH:mm)', example: '18:00' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _breakStartTime_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Início do intervalo (HH:mm)', example: '12:00' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _breakEndTime_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Fim do intervalo (HH:mm)', example: '13:00' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _isActive_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Dia de trabalho ativo', example: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _startTime_decorators, { kind: "field", name: "startTime", static: false, private: false, access: { has: obj => "startTime" in obj, get: obj => obj.startTime, set: (obj, value) => { obj.startTime = value; } }, metadata: _metadata }, _startTime_initializers, _startTime_extraInitializers);
            __esDecorate(null, null, _endTime_decorators, { kind: "field", name: "endTime", static: false, private: false, access: { has: obj => "endTime" in obj, get: obj => obj.endTime, set: (obj, value) => { obj.endTime = value; } }, metadata: _metadata }, _endTime_initializers, _endTime_extraInitializers);
            __esDecorate(null, null, _breakStartTime_decorators, { kind: "field", name: "breakStartTime", static: false, private: false, access: { has: obj => "breakStartTime" in obj, get: obj => obj.breakStartTime, set: (obj, value) => { obj.breakStartTime = value; } }, metadata: _metadata }, _breakStartTime_initializers, _breakStartTime_extraInitializers);
            __esDecorate(null, null, _breakEndTime_decorators, { kind: "field", name: "breakEndTime", static: false, private: false, access: { has: obj => "breakEndTime" in obj, get: obj => obj.breakEndTime, set: (obj, value) => { obj.breakEndTime = value; } }, metadata: _metadata }, _breakEndTime_initializers, _breakEndTime_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        startTime = __runInitializers(this, _startTime_initializers, void 0);
        endTime = (__runInitializers(this, _startTime_extraInitializers), __runInitializers(this, _endTime_initializers, void 0));
        breakStartTime = (__runInitializers(this, _endTime_extraInitializers), __runInitializers(this, _breakStartTime_initializers, void 0));
        breakEndTime = (__runInitializers(this, _breakStartTime_extraInitializers), __runInitializers(this, _breakEndTime_initializers, void 0));
        isActive = (__runInitializers(this, _breakEndTime_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        constructor() {
            __runInitializers(this, _isActive_extraInitializers);
        }
    };
})();
exports.UpdateWorkingHourDto = UpdateWorkingHourDto;
// ==================== FILTER DTOs ====================
let AppointmentFiltersDto = (() => {
    let _date_decorators;
    let _date_initializers = [];
    let _date_extraInitializers = [];
    let _professionalId_decorators;
    let _professionalId_initializers = [];
    let _professionalId_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _startDate_decorators;
    let _startDate_initializers = [];
    let _startDate_extraInitializers = [];
    let _endDate_decorators;
    let _endDate_initializers = [];
    let _endDate_extraInitializers = [];
    return class AppointmentFiltersDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _date_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Filtrar por data específica (YYYY-MM-DD)', example: '2026-01-20' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _professionalId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Filtrar por profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUUID)()];
            _status_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Filtrar por status', enum: AppointmentStatus, example: 'SCHEDULED' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(AppointmentStatus)];
            _clientId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Filtrar por cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUUID)()];
            _startDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data inicial do período (YYYY-MM-DD)', example: '2026-01-01' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _endDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data final do período (YYYY-MM-DD)', example: '2026-01-31' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _date_decorators, { kind: "field", name: "date", static: false, private: false, access: { has: obj => "date" in obj, get: obj => obj.date, set: (obj, value) => { obj.date = value; } }, metadata: _metadata }, _date_initializers, _date_extraInitializers);
            __esDecorate(null, null, _professionalId_decorators, { kind: "field", name: "professionalId", static: false, private: false, access: { has: obj => "professionalId" in obj, get: obj => obj.professionalId, set: (obj, value) => { obj.professionalId = value; } }, metadata: _metadata }, _professionalId_initializers, _professionalId_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _startDate_decorators, { kind: "field", name: "startDate", static: false, private: false, access: { has: obj => "startDate" in obj, get: obj => obj.startDate, set: (obj, value) => { obj.startDate = value; } }, metadata: _metadata }, _startDate_initializers, _startDate_extraInitializers);
            __esDecorate(null, null, _endDate_decorators, { kind: "field", name: "endDate", static: false, private: false, access: { has: obj => "endDate" in obj, get: obj => obj.endDate, set: (obj, value) => { obj.endDate = value; } }, metadata: _metadata }, _endDate_initializers, _endDate_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        date = __runInitializers(this, _date_initializers, void 0);
        professionalId = (__runInitializers(this, _date_extraInitializers), __runInitializers(this, _professionalId_initializers, void 0));
        status = (__runInitializers(this, _professionalId_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        clientId = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _clientId_initializers, void 0));
        startDate = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _startDate_initializers, void 0));
        endDate = (__runInitializers(this, _startDate_extraInitializers), __runInitializers(this, _endDate_initializers, void 0));
        constructor() {
            __runInitializers(this, _endDate_extraInitializers);
        }
    };
})();
exports.AppointmentFiltersDto = AppointmentFiltersDto;
let BlockFiltersDto = (() => {
    let _professionalId_decorators;
    let _professionalId_initializers = [];
    let _professionalId_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _startDate_decorators;
    let _startDate_initializers = [];
    let _startDate_extraInitializers = [];
    let _endDate_decorators;
    let _endDate_initializers = [];
    let _endDate_extraInitializers = [];
    return class BlockFiltersDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _professionalId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Filtrar por profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUUID)()];
            _status_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Filtrar por status', enum: BlockStatus, example: 'APPROVED' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(BlockStatus)];
            _startDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data inicial do período (YYYY-MM-DD)', example: '2026-01-01' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _endDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data final do período (YYYY-MM-DD)', example: '2026-01-31' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _professionalId_decorators, { kind: "field", name: "professionalId", static: false, private: false, access: { has: obj => "professionalId" in obj, get: obj => obj.professionalId, set: (obj, value) => { obj.professionalId = value; } }, metadata: _metadata }, _professionalId_initializers, _professionalId_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _startDate_decorators, { kind: "field", name: "startDate", static: false, private: false, access: { has: obj => "startDate" in obj, get: obj => obj.startDate, set: (obj, value) => { obj.startDate = value; } }, metadata: _metadata }, _startDate_initializers, _startDate_extraInitializers);
            __esDecorate(null, null, _endDate_decorators, { kind: "field", name: "endDate", static: false, private: false, access: { has: obj => "endDate" in obj, get: obj => obj.endDate, set: (obj, value) => { obj.endDate = value; } }, metadata: _metadata }, _endDate_initializers, _endDate_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        professionalId = __runInitializers(this, _professionalId_initializers, void 0);
        status = (__runInitializers(this, _professionalId_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        startDate = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _startDate_initializers, void 0));
        endDate = (__runInitializers(this, _startDate_extraInitializers), __runInitializers(this, _endDate_initializers, void 0));
        constructor() {
            __runInitializers(this, _endDate_extraInitializers);
        }
    };
})();
exports.BlockFiltersDto = BlockFiltersDto;
//# sourceMappingURL=dto.js.map