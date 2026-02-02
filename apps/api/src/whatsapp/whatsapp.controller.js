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
exports.WhatsAppController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../common/decorators/public.decorator");
let WhatsAppController = (() => {
    let _classDecorators = [(0, public_decorator_1.Public)(), (0, common_1.Controller)('whatsapp')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createInstance_decorators;
    let _getQRCode_decorators;
    let _getStatus_decorators;
    let _sendMessage_decorators;
    let _disconnect_decorators;
    var WhatsAppController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _createInstance_decorators = [(0, common_1.Post)('create/:salaoId')];
            _getQRCode_decorators = [(0, common_1.Get)('qrcode/:salaoId')];
            _getStatus_decorators = [(0, common_1.Get)('status/:salaoId')];
            _sendMessage_decorators = [(0, common_1.Post)('send/:salaoId')];
            _disconnect_decorators = [(0, common_1.Delete)('disconnect/:salaoId')];
            __esDecorate(this, null, _createInstance_decorators, { kind: "method", name: "createInstance", static: false, private: false, access: { has: obj => "createInstance" in obj, get: obj => obj.createInstance }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getQRCode_decorators, { kind: "method", name: "getQRCode", static: false, private: false, access: { has: obj => "getQRCode" in obj, get: obj => obj.getQRCode }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStatus_decorators, { kind: "method", name: "getStatus", static: false, private: false, access: { has: obj => "getStatus" in obj, get: obj => obj.getStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sendMessage_decorators, { kind: "method", name: "sendMessage", static: false, private: false, access: { has: obj => "sendMessage" in obj, get: obj => obj.sendMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _disconnect_decorators, { kind: "method", name: "disconnect", static: false, private: false, access: { has: obj => "disconnect" in obj, get: obj => obj.disconnect }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            WhatsAppController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        whatsappService = __runInitializers(this, _instanceExtraInitializers);
        constructor(whatsappService) {
            this.whatsappService = whatsappService;
        }
        async createInstance(salaoId) {
            console.log('🔥 WhatsApp createInstance chamado para salaoId:', salaoId);
            return this.whatsappService.createInstance(salaoId);
        }
        async getQRCode(salaoId) {
            return this.whatsappService.getQRCode(salaoId);
        }
        async getStatus(salaoId) {
            return this.whatsappService.getInstanceStatus(salaoId);
        }
        async sendMessage(salaoId, data) {
            return this.whatsappService.sendMessage(salaoId, data.phoneNumber, data.message);
        }
        async disconnect(salaoId) {
            return this.whatsappService.disconnectInstance(salaoId);
        }
    };
    return WhatsAppController = _classThis;
})();
exports.WhatsAppController = WhatsAppController;
//# sourceMappingURL=whatsapp.controller.js.map