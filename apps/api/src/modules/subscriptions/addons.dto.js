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
exports.GrantCreditsDto = exports.ActivateAddonDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
let ActivateAddonDto = (() => {
    let _addonCode_decorators;
    let _addonCode_initializers = [];
    let _addonCode_extraInitializers = [];
    return class ActivateAddonDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _addonCode_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Código do add-on a ser ativado',
                    example: 'WHATSAPP_BASIC_120',
                    enum: [
                        'WHATSAPP_BASIC_120',
                        'WHATSAPP_BASIC_160',
                        'WHATSAPP_BASIC_200',
                        'WHATSAPP_BASIC_240',
                        'WHATSAPP_PRO_120',
                        'WHATSAPP_PRO_160',
                        'WHATSAPP_PRO_200',
                        'WHATSAPP_PRO_240',
                    ],
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)({ message: 'O código do add-on é obrigatório' })];
            __esDecorate(null, null, _addonCode_decorators, { kind: "field", name: "addonCode", static: false, private: false, access: { has: obj => "addonCode" in obj, get: obj => obj.addonCode, set: (obj, value) => { obj.addonCode = value; } }, metadata: _metadata }, _addonCode_initializers, _addonCode_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        addonCode = __runInitializers(this, _addonCode_initializers, void 0);
        constructor() {
            __runInitializers(this, _addonCode_extraInitializers);
        }
    };
})();
exports.ActivateAddonDto = ActivateAddonDto;
let GrantCreditsDto = (() => {
    let _packageCode_decorators;
    let _packageCode_initializers = [];
    let _packageCode_extraInitializers = [];
    let _qtyPackages_decorators;
    let _qtyPackages_initializers = [];
    let _qtyPackages_extraInitializers = [];
    return class GrantCreditsDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _packageCode_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Código do pacote de créditos',
                    example: 'WHATSAPP_EXTRA_20',
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)({ message: 'O código do pacote é obrigatório' })];
            _qtyPackages_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Quantidade de pacotes a comprar',
                    example: 2,
                    minimum: 1,
                    maximum: 100,
                }), (0, class_validator_1.IsInt)({ message: 'A quantidade de pacotes deve ser um número inteiro' }), (0, class_validator_1.Min)(1, { message: 'A quantidade mínima é 1 pacote' }), (0, class_validator_1.Max)(100, { message: 'A quantidade máxima é 100 pacotes' })];
            __esDecorate(null, null, _packageCode_decorators, { kind: "field", name: "packageCode", static: false, private: false, access: { has: obj => "packageCode" in obj, get: obj => obj.packageCode, set: (obj, value) => { obj.packageCode = value; } }, metadata: _metadata }, _packageCode_initializers, _packageCode_extraInitializers);
            __esDecorate(null, null, _qtyPackages_decorators, { kind: "field", name: "qtyPackages", static: false, private: false, access: { has: obj => "qtyPackages" in obj, get: obj => obj.qtyPackages, set: (obj, value) => { obj.qtyPackages = value; } }, metadata: _metadata }, _qtyPackages_initializers, _qtyPackages_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        packageCode = __runInitializers(this, _packageCode_initializers, void 0);
        qtyPackages = (__runInitializers(this, _packageCode_extraInitializers), __runInitializers(this, _qtyPackages_initializers, void 0));
        constructor() {
            __runInitializers(this, _qtyPackages_extraInitializers);
        }
    };
})();
exports.GrantCreditsDto = GrantCreditsDto;
//# sourceMappingURL=addons.dto.js.map