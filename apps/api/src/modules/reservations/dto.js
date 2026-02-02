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
exports.UpdateReservationStatusDto = exports.UpdateReservationDto = exports.ReservationItemDto = exports.CreateReservationDto = void 0;
const class_validator_1 = require("class-validator");
// ==================== RESERVATION DTOs ====================
let CreateReservationDto = (() => {
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _items_decorators;
    let _items_initializers = [];
    let _items_extraInitializers = [];
    let _deliveryType_decorators;
    let _deliveryType_initializers = [];
    let _deliveryType_extraInitializers = [];
    let _deliveryAddress_decorators;
    let _deliveryAddress_initializers = [];
    let _deliveryAddress_extraInitializers = [];
    let _scheduledDate_decorators;
    let _scheduledDate_initializers = [];
    let _scheduledDate_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return class CreateReservationDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _clientId_decorators = [(0, class_validator_1.IsString)()];
            _items_decorators = [(0, class_validator_1.IsArray)()];
            _deliveryType_decorators = [(0, class_validator_1.IsEnum)(['PICKUP', 'DELIVERY'])];
            _deliveryAddress_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _scheduledDate_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _notes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: obj => "items" in obj, get: obj => obj.items, set: (obj, value) => { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
            __esDecorate(null, null, _deliveryType_decorators, { kind: "field", name: "deliveryType", static: false, private: false, access: { has: obj => "deliveryType" in obj, get: obj => obj.deliveryType, set: (obj, value) => { obj.deliveryType = value; } }, metadata: _metadata }, _deliveryType_initializers, _deliveryType_extraInitializers);
            __esDecorate(null, null, _deliveryAddress_decorators, { kind: "field", name: "deliveryAddress", static: false, private: false, access: { has: obj => "deliveryAddress" in obj, get: obj => obj.deliveryAddress, set: (obj, value) => { obj.deliveryAddress = value; } }, metadata: _metadata }, _deliveryAddress_initializers, _deliveryAddress_extraInitializers);
            __esDecorate(null, null, _scheduledDate_decorators, { kind: "field", name: "scheduledDate", static: false, private: false, access: { has: obj => "scheduledDate" in obj, get: obj => obj.scheduledDate, set: (obj, value) => { obj.scheduledDate = value; } }, metadata: _metadata }, _scheduledDate_initializers, _scheduledDate_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        clientId = __runInitializers(this, _clientId_initializers, void 0);
        items = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _items_initializers, void 0));
        deliveryType = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _deliveryType_initializers, void 0));
        deliveryAddress = (__runInitializers(this, _deliveryType_extraInitializers), __runInitializers(this, _deliveryAddress_initializers, void 0));
        scheduledDate = (__runInitializers(this, _deliveryAddress_extraInitializers), __runInitializers(this, _scheduledDate_initializers, void 0));
        notes = (__runInitializers(this, _scheduledDate_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        constructor() {
            __runInitializers(this, _notes_extraInitializers);
        }
    };
})();
exports.CreateReservationDto = CreateReservationDto;
let ReservationItemDto = (() => {
    let _productId_decorators;
    let _productId_initializers = [];
    let _productId_extraInitializers = [];
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    return class ReservationItemDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productId_decorators = [(0, class_validator_1.IsNumber)()];
            _quantity_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: obj => "productId" in obj, get: obj => obj.productId, set: (obj, value) => { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        productId = __runInitializers(this, _productId_initializers, void 0);
        quantity = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
        constructor() {
            __runInitializers(this, _quantity_extraInitializers);
        }
    };
})();
exports.ReservationItemDto = ReservationItemDto;
let UpdateReservationDto = (() => {
    let _deliveryType_decorators;
    let _deliveryType_initializers = [];
    let _deliveryType_extraInitializers = [];
    let _deliveryAddress_decorators;
    let _deliveryAddress_initializers = [];
    let _deliveryAddress_extraInitializers = [];
    let _scheduledDate_decorators;
    let _scheduledDate_initializers = [];
    let _scheduledDate_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return class UpdateReservationDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _deliveryType_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(['PICKUP', 'DELIVERY'])];
            _deliveryAddress_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _scheduledDate_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _notes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _deliveryType_decorators, { kind: "field", name: "deliveryType", static: false, private: false, access: { has: obj => "deliveryType" in obj, get: obj => obj.deliveryType, set: (obj, value) => { obj.deliveryType = value; } }, metadata: _metadata }, _deliveryType_initializers, _deliveryType_extraInitializers);
            __esDecorate(null, null, _deliveryAddress_decorators, { kind: "field", name: "deliveryAddress", static: false, private: false, access: { has: obj => "deliveryAddress" in obj, get: obj => obj.deliveryAddress, set: (obj, value) => { obj.deliveryAddress = value; } }, metadata: _metadata }, _deliveryAddress_initializers, _deliveryAddress_extraInitializers);
            __esDecorate(null, null, _scheduledDate_decorators, { kind: "field", name: "scheduledDate", static: false, private: false, access: { has: obj => "scheduledDate" in obj, get: obj => obj.scheduledDate, set: (obj, value) => { obj.scheduledDate = value; } }, metadata: _metadata }, _scheduledDate_initializers, _scheduledDate_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        deliveryType = __runInitializers(this, _deliveryType_initializers, void 0);
        deliveryAddress = (__runInitializers(this, _deliveryType_extraInitializers), __runInitializers(this, _deliveryAddress_initializers, void 0));
        scheduledDate = (__runInitializers(this, _deliveryAddress_extraInitializers), __runInitializers(this, _scheduledDate_initializers, void 0));
        notes = (__runInitializers(this, _scheduledDate_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        constructor() {
            __runInitializers(this, _notes_extraInitializers);
        }
    };
})();
exports.UpdateReservationDto = UpdateReservationDto;
let UpdateReservationStatusDto = (() => {
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return class UpdateReservationStatusDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _status_decorators = [(0, class_validator_1.IsEnum)(['PENDING', 'CONFIRMED', 'READY', 'DELIVERED', 'CANCELLED'])];
            _notes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        status = __runInitializers(this, _status_initializers, void 0);
        notes = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        constructor() {
            __runInitializers(this, _notes_extraInitializers);
        }
    };
})();
exports.UpdateReservationStatusDto = UpdateReservationStatusDto;
//# sourceMappingURL=dto.js.map