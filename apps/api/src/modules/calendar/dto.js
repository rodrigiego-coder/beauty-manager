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
exports.BulkResolveConflictsDto = exports.ResolveConflictDto = exports.ManualSyncDto = exports.UpdateIntegrationSettingsDto = exports.GoogleOAuthCallbackDto = exports.ConnectGoogleCalendarDto = exports.ConflictResolution = exports.ConflictStatus = exports.IntegrationStatus = exports.SyncDirection = void 0;
const class_validator_1 = require("class-validator");
// ==================== ENUMS ====================
var SyncDirection;
(function (SyncDirection) {
    SyncDirection["GOOGLE_TO_APP"] = "GOOGLE_TO_APP";
    SyncDirection["APP_TO_GOOGLE"] = "APP_TO_GOOGLE";
    SyncDirection["BIDIRECTIONAL"] = "BIDIRECTIONAL";
})(SyncDirection || (exports.SyncDirection = SyncDirection = {}));
var IntegrationStatus;
(function (IntegrationStatus) {
    IntegrationStatus["ACTIVE"] = "ACTIVE";
    IntegrationStatus["ERROR"] = "ERROR";
    IntegrationStatus["DISCONNECTED"] = "DISCONNECTED";
    IntegrationStatus["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
})(IntegrationStatus || (exports.IntegrationStatus = IntegrationStatus = {}));
var ConflictStatus;
(function (ConflictStatus) {
    ConflictStatus["PENDING"] = "PENDING";
    ConflictStatus["RESOLVED_KEEP_LOCAL"] = "RESOLVED_KEEP_LOCAL";
    ConflictStatus["RESOLVED_KEEP_GOOGLE"] = "RESOLVED_KEEP_GOOGLE";
    ConflictStatus["RESOLVED_MERGE"] = "RESOLVED_MERGE";
    ConflictStatus["IGNORED"] = "IGNORED";
})(ConflictStatus || (exports.ConflictStatus = ConflictStatus = {}));
var ConflictResolution;
(function (ConflictResolution) {
    ConflictResolution["KEEP_LOCAL"] = "KEEP_LOCAL";
    ConflictResolution["KEEP_GOOGLE"] = "KEEP_GOOGLE";
    ConflictResolution["MERGE"] = "MERGE";
    ConflictResolution["IGNORE"] = "IGNORE";
})(ConflictResolution || (exports.ConflictResolution = ConflictResolution = {}));
// ==================== DTOs ====================
let ConnectGoogleCalendarDto = (() => {
    let _professionalId_decorators;
    let _professionalId_initializers = [];
    let _professionalId_extraInitializers = [];
    let _calendarId_decorators;
    let _calendarId_initializers = [];
    let _calendarId_extraInitializers = [];
    let _syncDirection_decorators;
    let _syncDirection_initializers = [];
    let _syncDirection_extraInitializers = [];
    return class ConnectGoogleCalendarDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _professionalId_decorators = [(0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            _calendarId_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _syncDirection_decorators = [(0, class_validator_1.IsEnum)(SyncDirection), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _professionalId_decorators, { kind: "field", name: "professionalId", static: false, private: false, access: { has: obj => "professionalId" in obj, get: obj => obj.professionalId, set: (obj, value) => { obj.professionalId = value; } }, metadata: _metadata }, _professionalId_initializers, _professionalId_extraInitializers);
            __esDecorate(null, null, _calendarId_decorators, { kind: "field", name: "calendarId", static: false, private: false, access: { has: obj => "calendarId" in obj, get: obj => obj.calendarId, set: (obj, value) => { obj.calendarId = value; } }, metadata: _metadata }, _calendarId_initializers, _calendarId_extraInitializers);
            __esDecorate(null, null, _syncDirection_decorators, { kind: "field", name: "syncDirection", static: false, private: false, access: { has: obj => "syncDirection" in obj, get: obj => obj.syncDirection, set: (obj, value) => { obj.syncDirection = value; } }, metadata: _metadata }, _syncDirection_initializers, _syncDirection_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        professionalId = __runInitializers(this, _professionalId_initializers, void 0); // Se não informado, usa o usuário atual
        calendarId = (__runInitializers(this, _professionalId_extraInitializers), __runInitializers(this, _calendarId_initializers, void 0)); // Se não informado, usa 'primary'
        syncDirection = (__runInitializers(this, _calendarId_extraInitializers), __runInitializers(this, _syncDirection_initializers, void 0));
        constructor() {
            __runInitializers(this, _syncDirection_extraInitializers);
        }
    };
})();
exports.ConnectGoogleCalendarDto = ConnectGoogleCalendarDto;
let GoogleOAuthCallbackDto = (() => {
    let _code_decorators;
    let _code_initializers = [];
    let _code_extraInitializers = [];
    let _state_decorators;
    let _state_initializers = [];
    let _state_extraInitializers = [];
    return class GoogleOAuthCallbackDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _code_decorators = [(0, class_validator_1.IsString)()];
            _state_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _code_decorators, { kind: "field", name: "code", static: false, private: false, access: { has: obj => "code" in obj, get: obj => obj.code, set: (obj, value) => { obj.code = value; } }, metadata: _metadata }, _code_initializers, _code_extraInitializers);
            __esDecorate(null, null, _state_decorators, { kind: "field", name: "state", static: false, private: false, access: { has: obj => "state" in obj, get: obj => obj.state, set: (obj, value) => { obj.state = value; } }, metadata: _metadata }, _state_initializers, _state_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        code = __runInitializers(this, _code_initializers, void 0);
        state = (__runInitializers(this, _code_extraInitializers), __runInitializers(this, _state_initializers, void 0)); // Contém salonId, professionalId, etc.
        constructor() {
            __runInitializers(this, _state_extraInitializers);
        }
    };
})();
exports.GoogleOAuthCallbackDto = GoogleOAuthCallbackDto;
let UpdateIntegrationSettingsDto = (() => {
    let _calendarId_decorators;
    let _calendarId_initializers = [];
    let _calendarId_extraInitializers = [];
    let _syncDirection_decorators;
    let _syncDirection_initializers = [];
    let _syncDirection_extraInitializers = [];
    let _syncEnabled_decorators;
    let _syncEnabled_initializers = [];
    let _syncEnabled_extraInitializers = [];
    return class UpdateIntegrationSettingsDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _calendarId_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _syncDirection_decorators = [(0, class_validator_1.IsEnum)(SyncDirection), (0, class_validator_1.IsOptional)()];
            _syncEnabled_decorators = [(0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _calendarId_decorators, { kind: "field", name: "calendarId", static: false, private: false, access: { has: obj => "calendarId" in obj, get: obj => obj.calendarId, set: (obj, value) => { obj.calendarId = value; } }, metadata: _metadata }, _calendarId_initializers, _calendarId_extraInitializers);
            __esDecorate(null, null, _syncDirection_decorators, { kind: "field", name: "syncDirection", static: false, private: false, access: { has: obj => "syncDirection" in obj, get: obj => obj.syncDirection, set: (obj, value) => { obj.syncDirection = value; } }, metadata: _metadata }, _syncDirection_initializers, _syncDirection_extraInitializers);
            __esDecorate(null, null, _syncEnabled_decorators, { kind: "field", name: "syncEnabled", static: false, private: false, access: { has: obj => "syncEnabled" in obj, get: obj => obj.syncEnabled, set: (obj, value) => { obj.syncEnabled = value; } }, metadata: _metadata }, _syncEnabled_initializers, _syncEnabled_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        calendarId = __runInitializers(this, _calendarId_initializers, void 0);
        syncDirection = (__runInitializers(this, _calendarId_extraInitializers), __runInitializers(this, _syncDirection_initializers, void 0));
        syncEnabled = (__runInitializers(this, _syncDirection_extraInitializers), __runInitializers(this, _syncEnabled_initializers, void 0));
        constructor() {
            __runInitializers(this, _syncEnabled_extraInitializers);
        }
    };
})();
exports.UpdateIntegrationSettingsDto = UpdateIntegrationSettingsDto;
let ManualSyncDto = (() => {
    let _professionalId_decorators;
    let _professionalId_initializers = [];
    let _professionalId_extraInitializers = [];
    let _fullSync_decorators;
    let _fullSync_initializers = [];
    let _fullSync_extraInitializers = [];
    return class ManualSyncDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _professionalId_decorators = [(0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            _fullSync_decorators = [(0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _professionalId_decorators, { kind: "field", name: "professionalId", static: false, private: false, access: { has: obj => "professionalId" in obj, get: obj => obj.professionalId, set: (obj, value) => { obj.professionalId = value; } }, metadata: _metadata }, _professionalId_initializers, _professionalId_extraInitializers);
            __esDecorate(null, null, _fullSync_decorators, { kind: "field", name: "fullSync", static: false, private: false, access: { has: obj => "fullSync" in obj, get: obj => obj.fullSync, set: (obj, value) => { obj.fullSync = value; } }, metadata: _metadata }, _fullSync_initializers, _fullSync_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        professionalId = __runInitializers(this, _professionalId_initializers, void 0);
        fullSync = (__runInitializers(this, _professionalId_extraInitializers), __runInitializers(this, _fullSync_initializers, void 0)); // Se true, faz sync completo. Se false, incremental
        constructor() {
            __runInitializers(this, _fullSync_extraInitializers);
        }
    };
})();
exports.ManualSyncDto = ManualSyncDto;
let ResolveConflictDto = (() => {
    let _conflictId_decorators;
    let _conflictId_initializers = [];
    let _conflictId_extraInitializers = [];
    let _resolution_decorators;
    let _resolution_initializers = [];
    let _resolution_extraInitializers = [];
    return class ResolveConflictDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _conflictId_decorators = [(0, class_validator_1.IsUUID)()];
            _resolution_decorators = [(0, class_validator_1.IsEnum)(ConflictResolution)];
            __esDecorate(null, null, _conflictId_decorators, { kind: "field", name: "conflictId", static: false, private: false, access: { has: obj => "conflictId" in obj, get: obj => obj.conflictId, set: (obj, value) => { obj.conflictId = value; } }, metadata: _metadata }, _conflictId_initializers, _conflictId_extraInitializers);
            __esDecorate(null, null, _resolution_decorators, { kind: "field", name: "resolution", static: false, private: false, access: { has: obj => "resolution" in obj, get: obj => obj.resolution, set: (obj, value) => { obj.resolution = value; } }, metadata: _metadata }, _resolution_initializers, _resolution_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        conflictId = __runInitializers(this, _conflictId_initializers, void 0);
        resolution = (__runInitializers(this, _conflictId_extraInitializers), __runInitializers(this, _resolution_initializers, void 0));
        constructor() {
            __runInitializers(this, _resolution_extraInitializers);
        }
    };
})();
exports.ResolveConflictDto = ResolveConflictDto;
let BulkResolveConflictsDto = (() => {
    let _conflictIds_decorators;
    let _conflictIds_initializers = [];
    let _conflictIds_extraInitializers = [];
    let _resolution_decorators;
    let _resolution_initializers = [];
    let _resolution_extraInitializers = [];
    return class BulkResolveConflictsDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _conflictIds_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.IsUUID)('all', { each: true })];
            _resolution_decorators = [(0, class_validator_1.IsEnum)(ConflictResolution)];
            __esDecorate(null, null, _conflictIds_decorators, { kind: "field", name: "conflictIds", static: false, private: false, access: { has: obj => "conflictIds" in obj, get: obj => obj.conflictIds, set: (obj, value) => { obj.conflictIds = value; } }, metadata: _metadata }, _conflictIds_initializers, _conflictIds_extraInitializers);
            __esDecorate(null, null, _resolution_decorators, { kind: "field", name: "resolution", static: false, private: false, access: { has: obj => "resolution" in obj, get: obj => obj.resolution, set: (obj, value) => { obj.resolution = value; } }, metadata: _metadata }, _resolution_initializers, _resolution_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        conflictIds = __runInitializers(this, _conflictIds_initializers, void 0);
        resolution = (__runInitializers(this, _conflictIds_extraInitializers), __runInitializers(this, _resolution_initializers, void 0));
        constructor() {
            __runInitializers(this, _resolution_extraInitializers);
        }
    };
})();
exports.BulkResolveConflictsDto = BulkResolveConflictsDto;
//# sourceMappingURL=dto.js.map