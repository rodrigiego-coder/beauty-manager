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
exports.ListCommissionsQueryDto = exports.PayProfessionalCommissionsDto = exports.PayCommissionsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
let PayCommissionsDto = (() => {
    let _commissionIds_decorators;
    let _commissionIds_initializers = [];
    let _commissionIds_extraInitializers = [];
    return class PayCommissionsDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _commissionIds_decorators = [(0, swagger_1.ApiProperty)({ description: 'Lista de IDs das comissões a pagar', example: ['550e8400-e29b-41d4-a716-446655440000'], isArray: true, type: String }), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsUUID)('all', { each: true })];
            __esDecorate(null, null, _commissionIds_decorators, { kind: "field", name: "commissionIds", static: false, private: false, access: { has: obj => "commissionIds" in obj, get: obj => obj.commissionIds, set: (obj, value) => { obj.commissionIds = value; } }, metadata: _metadata }, _commissionIds_initializers, _commissionIds_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        commissionIds = __runInitializers(this, _commissionIds_initializers, void 0);
        constructor() {
            __runInitializers(this, _commissionIds_extraInitializers);
        }
    };
})();
exports.PayCommissionsDto = PayCommissionsDto;
let PayProfessionalCommissionsDto = (() => {
    let _professionalId_decorators;
    let _professionalId_initializers = [];
    let _professionalId_extraInitializers = [];
    let _startDate_decorators;
    let _startDate_initializers = [];
    let _startDate_extraInitializers = [];
    let _endDate_decorators;
    let _endDate_initializers = [];
    let _endDate_extraInitializers = [];
    return class PayProfessionalCommissionsDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _professionalId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do profissional', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsUUID)()];
            _startDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data inicial do período (ISO 8601)', example: '2024-01-01' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _endDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data final do período (ISO 8601)', example: '2024-01-31' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            __esDecorate(null, null, _professionalId_decorators, { kind: "field", name: "professionalId", static: false, private: false, access: { has: obj => "professionalId" in obj, get: obj => obj.professionalId, set: (obj, value) => { obj.professionalId = value; } }, metadata: _metadata }, _professionalId_initializers, _professionalId_extraInitializers);
            __esDecorate(null, null, _startDate_decorators, { kind: "field", name: "startDate", static: false, private: false, access: { has: obj => "startDate" in obj, get: obj => obj.startDate, set: (obj, value) => { obj.startDate = value; } }, metadata: _metadata }, _startDate_initializers, _startDate_extraInitializers);
            __esDecorate(null, null, _endDate_decorators, { kind: "field", name: "endDate", static: false, private: false, access: { has: obj => "endDate" in obj, get: obj => obj.endDate, set: (obj, value) => { obj.endDate = value; } }, metadata: _metadata }, _endDate_initializers, _endDate_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        professionalId = __runInitializers(this, _professionalId_initializers, void 0);
        startDate = (__runInitializers(this, _professionalId_extraInitializers), __runInitializers(this, _startDate_initializers, void 0));
        endDate = (__runInitializers(this, _startDate_extraInitializers), __runInitializers(this, _endDate_initializers, void 0));
        constructor() {
            __runInitializers(this, _endDate_extraInitializers);
        }
    };
})();
exports.PayProfessionalCommissionsDto = PayProfessionalCommissionsDto;
let ListCommissionsQueryDto = (() => {
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
    return class ListCommissionsQueryDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _professionalId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Filtrar por profissional', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUUID)()];
            _status_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Filtrar por status', enum: ['PENDING', 'PAID', 'CANCELLED'], example: 'PENDING' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _startDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data inicial do período (ISO 8601)', example: '2024-01-01' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _endDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data final do período (ISO 8601)', example: '2024-01-31' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
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
exports.ListCommissionsQueryDto = ListCommissionsQueryDto;
//# sourceMappingURL=dto.js.map