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
exports.CashMovementDto = exports.CloseCashRegisterDto = exports.OpenCashRegisterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
let OpenCashRegisterDto = (() => {
    let _openingBalance_decorators;
    let _openingBalance_initializers = [];
    let _openingBalance_extraInitializers = [];
    return class OpenCashRegisterDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _openingBalance_decorators = [(0, swagger_1.ApiProperty)({ description: 'Saldo de abertura do caixa em reais', example: 200.00, minimum: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            __esDecorate(null, null, _openingBalance_decorators, { kind: "field", name: "openingBalance", static: false, private: false, access: { has: obj => "openingBalance" in obj, get: obj => obj.openingBalance, set: (obj, value) => { obj.openingBalance = value; } }, metadata: _metadata }, _openingBalance_initializers, _openingBalance_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        openingBalance = __runInitializers(this, _openingBalance_initializers, void 0);
        constructor() {
            __runInitializers(this, _openingBalance_extraInitializers);
        }
    };
})();
exports.OpenCashRegisterDto = OpenCashRegisterDto;
let CloseCashRegisterDto = (() => {
    let _closingBalance_decorators;
    let _closingBalance_initializers = [];
    let _closingBalance_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return class CloseCashRegisterDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _closingBalance_decorators = [(0, swagger_1.ApiProperty)({ description: 'Saldo de fechamento do caixa em reais', example: 1500.00, minimum: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _notes_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Notas ou observações do fechamento', example: 'Conferido por Maria' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _closingBalance_decorators, { kind: "field", name: "closingBalance", static: false, private: false, access: { has: obj => "closingBalance" in obj, get: obj => obj.closingBalance, set: (obj, value) => { obj.closingBalance = value; } }, metadata: _metadata }, _closingBalance_initializers, _closingBalance_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        closingBalance = __runInitializers(this, _closingBalance_initializers, void 0);
        notes = (__runInitializers(this, _closingBalance_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        constructor() {
            __runInitializers(this, _notes_extraInitializers);
        }
    };
})();
exports.CloseCashRegisterDto = CloseCashRegisterDto;
let CashMovementDto = (() => {
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    return class CashMovementDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _amount_decorators = [(0, swagger_1.ApiProperty)({ description: 'Valor da movimentação em reais', example: 50.00, minimum: 0.01 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0.01)];
            _reason_decorators = [(0, swagger_1.ApiProperty)({ description: 'Motivo da movimentação', example: 'Sangria para depósito bancário' }), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        amount = __runInitializers(this, _amount_initializers, void 0);
        reason = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
        constructor() {
            __runInitializers(this, _reason_extraInitializers);
        }
    };
})();
exports.CashMovementDto = CashMovementDto;
//# sourceMappingURL=dto.js.map