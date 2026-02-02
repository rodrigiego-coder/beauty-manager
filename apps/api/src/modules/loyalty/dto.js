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
exports.TransactionTypeLabels = exports.RewardTypeLabels = exports.ApplyReferralDto = exports.UseVoucherDto = exports.TransactionTypes = exports.AdjustPointsDto = exports.EnrollClientDto = exports.UpdateRewardDto = exports.CreateRewardDto = exports.RewardTypes = exports.UpdateTierDto = exports.CreateTierDto = exports.TierBenefitsDto = exports.UpdateProgramDto = exports.CreateProgramDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
// ==================== Program DTOs ====================
let CreateProgramDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _pointsPerRealService_decorators;
    let _pointsPerRealService_initializers = [];
    let _pointsPerRealService_extraInitializers = [];
    let _pointsPerRealProduct_decorators;
    let _pointsPerRealProduct_initializers = [];
    let _pointsPerRealProduct_extraInitializers = [];
    let _pointsExpireDays_decorators;
    let _pointsExpireDays_initializers = [];
    let _pointsExpireDays_extraInitializers = [];
    let _minimumRedeemPoints_decorators;
    let _minimumRedeemPoints_initializers = [];
    let _minimumRedeemPoints_extraInitializers = [];
    let _welcomePoints_decorators;
    let _welcomePoints_initializers = [];
    let _welcomePoints_extraInitializers = [];
    let _birthdayPoints_decorators;
    let _birthdayPoints_initializers = [];
    let _birthdayPoints_extraInitializers = [];
    let _referralPoints_decorators;
    let _referralPoints_initializers = [];
    let _referralPoints_extraInitializers = [];
    return class CreateProgramDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome do programa de fidelidade', example: 'Programa Fidelidade Beleza' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _pointsPerRealService_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Pontos ganhos por real gasto em serviços', example: 1, minimum: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _pointsPerRealProduct_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Pontos ganhos por real gasto em produtos', example: 0.5, minimum: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _pointsExpireDays_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Dias para expiração dos pontos (null = não expira)', example: 365 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _minimumRedeemPoints_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Mínimo de pontos para resgate', example: 100, minimum: 1 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            _welcomePoints_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Pontos de boas-vindas ao se cadastrar', example: 50, minimum: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _birthdayPoints_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Pontos de aniversário', example: 100, minimum: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _referralPoints_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Pontos por indicação de novo cliente', example: 200, minimum: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _pointsPerRealService_decorators, { kind: "field", name: "pointsPerRealService", static: false, private: false, access: { has: obj => "pointsPerRealService" in obj, get: obj => obj.pointsPerRealService, set: (obj, value) => { obj.pointsPerRealService = value; } }, metadata: _metadata }, _pointsPerRealService_initializers, _pointsPerRealService_extraInitializers);
            __esDecorate(null, null, _pointsPerRealProduct_decorators, { kind: "field", name: "pointsPerRealProduct", static: false, private: false, access: { has: obj => "pointsPerRealProduct" in obj, get: obj => obj.pointsPerRealProduct, set: (obj, value) => { obj.pointsPerRealProduct = value; } }, metadata: _metadata }, _pointsPerRealProduct_initializers, _pointsPerRealProduct_extraInitializers);
            __esDecorate(null, null, _pointsExpireDays_decorators, { kind: "field", name: "pointsExpireDays", static: false, private: false, access: { has: obj => "pointsExpireDays" in obj, get: obj => obj.pointsExpireDays, set: (obj, value) => { obj.pointsExpireDays = value; } }, metadata: _metadata }, _pointsExpireDays_initializers, _pointsExpireDays_extraInitializers);
            __esDecorate(null, null, _minimumRedeemPoints_decorators, { kind: "field", name: "minimumRedeemPoints", static: false, private: false, access: { has: obj => "minimumRedeemPoints" in obj, get: obj => obj.minimumRedeemPoints, set: (obj, value) => { obj.minimumRedeemPoints = value; } }, metadata: _metadata }, _minimumRedeemPoints_initializers, _minimumRedeemPoints_extraInitializers);
            __esDecorate(null, null, _welcomePoints_decorators, { kind: "field", name: "welcomePoints", static: false, private: false, access: { has: obj => "welcomePoints" in obj, get: obj => obj.welcomePoints, set: (obj, value) => { obj.welcomePoints = value; } }, metadata: _metadata }, _welcomePoints_initializers, _welcomePoints_extraInitializers);
            __esDecorate(null, null, _birthdayPoints_decorators, { kind: "field", name: "birthdayPoints", static: false, private: false, access: { has: obj => "birthdayPoints" in obj, get: obj => obj.birthdayPoints, set: (obj, value) => { obj.birthdayPoints = value; } }, metadata: _metadata }, _birthdayPoints_initializers, _birthdayPoints_extraInitializers);
            __esDecorate(null, null, _referralPoints_decorators, { kind: "field", name: "referralPoints", static: false, private: false, access: { has: obj => "referralPoints" in obj, get: obj => obj.referralPoints, set: (obj, value) => { obj.referralPoints = value; } }, metadata: _metadata }, _referralPoints_initializers, _referralPoints_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        pointsPerRealService = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _pointsPerRealService_initializers, void 0));
        pointsPerRealProduct = (__runInitializers(this, _pointsPerRealService_extraInitializers), __runInitializers(this, _pointsPerRealProduct_initializers, void 0));
        pointsExpireDays = (__runInitializers(this, _pointsPerRealProduct_extraInitializers), __runInitializers(this, _pointsExpireDays_initializers, void 0));
        minimumRedeemPoints = (__runInitializers(this, _pointsExpireDays_extraInitializers), __runInitializers(this, _minimumRedeemPoints_initializers, void 0));
        welcomePoints = (__runInitializers(this, _minimumRedeemPoints_extraInitializers), __runInitializers(this, _welcomePoints_initializers, void 0));
        birthdayPoints = (__runInitializers(this, _welcomePoints_extraInitializers), __runInitializers(this, _birthdayPoints_initializers, void 0));
        referralPoints = (__runInitializers(this, _birthdayPoints_extraInitializers), __runInitializers(this, _referralPoints_initializers, void 0));
        constructor() {
            __runInitializers(this, _referralPoints_extraInitializers);
        }
    };
})();
exports.CreateProgramDto = CreateProgramDto;
let UpdateProgramDto = (() => {
    let _classSuper = CreateProgramDto;
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    return class UpdateProgramDto extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _isActive_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Programa ativo', example: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        isActive = __runInitializers(this, _isActive_initializers, void 0);
        constructor() {
            super(...arguments);
            __runInitializers(this, _isActive_extraInitializers);
        }
    };
})();
exports.UpdateProgramDto = UpdateProgramDto;
// ==================== Tier DTOs ====================
let TierBenefitsDto = (() => {
    let _discountPercent_decorators;
    let _discountPercent_initializers = [];
    let _discountPercent_extraInitializers = [];
    let _priorityBooking_decorators;
    let _priorityBooking_initializers = [];
    let _priorityBooking_extraInitializers = [];
    let _freeServices_decorators;
    let _freeServices_initializers = [];
    let _freeServices_extraInitializers = [];
    let _extraBenefits_decorators;
    let _extraBenefits_initializers = [];
    let _extraBenefits_extraInitializers = [];
    return class TierBenefitsDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _discountPercent_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Percentual de desconto do tier', example: 10, minimum: 0, maximum: 100 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.Max)(100)];
            _priorityBooking_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Prioridade no agendamento', example: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _freeServices_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Lista de serviços gratuitos', example: ['corte', 'escova'], isArray: true, type: String }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _extraBenefits_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Benefícios extras em texto', example: 'Acesso VIP, estacionamento gratuito' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _discountPercent_decorators, { kind: "field", name: "discountPercent", static: false, private: false, access: { has: obj => "discountPercent" in obj, get: obj => obj.discountPercent, set: (obj, value) => { obj.discountPercent = value; } }, metadata: _metadata }, _discountPercent_initializers, _discountPercent_extraInitializers);
            __esDecorate(null, null, _priorityBooking_decorators, { kind: "field", name: "priorityBooking", static: false, private: false, access: { has: obj => "priorityBooking" in obj, get: obj => obj.priorityBooking, set: (obj, value) => { obj.priorityBooking = value; } }, metadata: _metadata }, _priorityBooking_initializers, _priorityBooking_extraInitializers);
            __esDecorate(null, null, _freeServices_decorators, { kind: "field", name: "freeServices", static: false, private: false, access: { has: obj => "freeServices" in obj, get: obj => obj.freeServices, set: (obj, value) => { obj.freeServices = value; } }, metadata: _metadata }, _freeServices_initializers, _freeServices_extraInitializers);
            __esDecorate(null, null, _extraBenefits_decorators, { kind: "field", name: "extraBenefits", static: false, private: false, access: { has: obj => "extraBenefits" in obj, get: obj => obj.extraBenefits, set: (obj, value) => { obj.extraBenefits = value; } }, metadata: _metadata }, _extraBenefits_initializers, _extraBenefits_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        discountPercent = __runInitializers(this, _discountPercent_initializers, void 0);
        priorityBooking = (__runInitializers(this, _discountPercent_extraInitializers), __runInitializers(this, _priorityBooking_initializers, void 0));
        freeServices = (__runInitializers(this, _priorityBooking_extraInitializers), __runInitializers(this, _freeServices_initializers, void 0));
        extraBenefits = (__runInitializers(this, _freeServices_extraInitializers), __runInitializers(this, _extraBenefits_initializers, void 0));
        constructor() {
            __runInitializers(this, _extraBenefits_extraInitializers);
        }
    };
})();
exports.TierBenefitsDto = TierBenefitsDto;
let CreateTierDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _code_decorators;
    let _code_initializers = [];
    let _code_extraInitializers = [];
    let _minPoints_decorators;
    let _minPoints_initializers = [];
    let _minPoints_extraInitializers = [];
    let _color_decorators;
    let _color_initializers = [];
    let _color_extraInitializers = [];
    let _icon_decorators;
    let _icon_initializers = [];
    let _icon_extraInitializers = [];
    let _benefits_decorators;
    let _benefits_initializers = [];
    let _benefits_extraInitializers = [];
    let _pointsMultiplier_decorators;
    let _pointsMultiplier_initializers = [];
    let _pointsMultiplier_extraInitializers = [];
    let _sortOrder_decorators;
    let _sortOrder_initializers = [];
    let _sortOrder_extraInitializers = [];
    return class CreateTierDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiProperty)({ description: 'Nome do tier', example: 'Ouro' }), (0, class_validator_1.IsString)()];
            _code_decorators = [(0, swagger_1.ApiProperty)({ description: 'Código único do tier', example: 'GOLD' }), (0, class_validator_1.IsString)()];
            _minPoints_decorators = [(0, swagger_1.ApiProperty)({ description: 'Pontos mínimos para atingir o tier', example: 1000, minimum: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _color_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Cor do tier em hexadecimal', example: '#FFD700' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _icon_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Ícone do tier', example: 'crown' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _benefits_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Benefícios do tier', type: TierBenefitsDto }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => TierBenefitsDto)];
            _pointsMultiplier_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Multiplicador de pontos', example: 1.5, minimum: 1, maximum: 10 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(10)];
            _sortOrder_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Ordem de exibição', example: 2 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _code_decorators, { kind: "field", name: "code", static: false, private: false, access: { has: obj => "code" in obj, get: obj => obj.code, set: (obj, value) => { obj.code = value; } }, metadata: _metadata }, _code_initializers, _code_extraInitializers);
            __esDecorate(null, null, _minPoints_decorators, { kind: "field", name: "minPoints", static: false, private: false, access: { has: obj => "minPoints" in obj, get: obj => obj.minPoints, set: (obj, value) => { obj.minPoints = value; } }, metadata: _metadata }, _minPoints_initializers, _minPoints_extraInitializers);
            __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
            __esDecorate(null, null, _icon_decorators, { kind: "field", name: "icon", static: false, private: false, access: { has: obj => "icon" in obj, get: obj => obj.icon, set: (obj, value) => { obj.icon = value; } }, metadata: _metadata }, _icon_initializers, _icon_extraInitializers);
            __esDecorate(null, null, _benefits_decorators, { kind: "field", name: "benefits", static: false, private: false, access: { has: obj => "benefits" in obj, get: obj => obj.benefits, set: (obj, value) => { obj.benefits = value; } }, metadata: _metadata }, _benefits_initializers, _benefits_extraInitializers);
            __esDecorate(null, null, _pointsMultiplier_decorators, { kind: "field", name: "pointsMultiplier", static: false, private: false, access: { has: obj => "pointsMultiplier" in obj, get: obj => obj.pointsMultiplier, set: (obj, value) => { obj.pointsMultiplier = value; } }, metadata: _metadata }, _pointsMultiplier_initializers, _pointsMultiplier_extraInitializers);
            __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: obj => "sortOrder" in obj, get: obj => obj.sortOrder, set: (obj, value) => { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        code = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _code_initializers, void 0));
        minPoints = (__runInitializers(this, _code_extraInitializers), __runInitializers(this, _minPoints_initializers, void 0));
        color = (__runInitializers(this, _minPoints_extraInitializers), __runInitializers(this, _color_initializers, void 0));
        icon = (__runInitializers(this, _color_extraInitializers), __runInitializers(this, _icon_initializers, void 0));
        benefits = (__runInitializers(this, _icon_extraInitializers), __runInitializers(this, _benefits_initializers, void 0));
        pointsMultiplier = (__runInitializers(this, _benefits_extraInitializers), __runInitializers(this, _pointsMultiplier_initializers, void 0));
        sortOrder = (__runInitializers(this, _pointsMultiplier_extraInitializers), __runInitializers(this, _sortOrder_initializers, void 0));
        constructor() {
            __runInitializers(this, _sortOrder_extraInitializers);
        }
    };
})();
exports.CreateTierDto = CreateTierDto;
let UpdateTierDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _minPoints_decorators;
    let _minPoints_initializers = [];
    let _minPoints_extraInitializers = [];
    let _color_decorators;
    let _color_initializers = [];
    let _color_extraInitializers = [];
    let _icon_decorators;
    let _icon_initializers = [];
    let _icon_extraInitializers = [];
    let _benefits_decorators;
    let _benefits_initializers = [];
    let _benefits_extraInitializers = [];
    let _pointsMultiplier_decorators;
    let _pointsMultiplier_initializers = [];
    let _pointsMultiplier_extraInitializers = [];
    let _sortOrder_decorators;
    let _sortOrder_initializers = [];
    let _sortOrder_extraInitializers = [];
    return class UpdateTierDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome do tier', example: 'Ouro' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _minPoints_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Pontos mínimos para atingir o tier', example: 1000, minimum: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _color_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Cor do tier em hexadecimal', example: '#FFD700' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _icon_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Ícone do tier', example: 'crown' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _benefits_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Benefícios do tier', type: TierBenefitsDto }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => TierBenefitsDto)];
            _pointsMultiplier_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Multiplicador de pontos', example: 1.5, minimum: 1, maximum: 10 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(10)];
            _sortOrder_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Ordem de exibição', example: 2 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _minPoints_decorators, { kind: "field", name: "minPoints", static: false, private: false, access: { has: obj => "minPoints" in obj, get: obj => obj.minPoints, set: (obj, value) => { obj.minPoints = value; } }, metadata: _metadata }, _minPoints_initializers, _minPoints_extraInitializers);
            __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
            __esDecorate(null, null, _icon_decorators, { kind: "field", name: "icon", static: false, private: false, access: { has: obj => "icon" in obj, get: obj => obj.icon, set: (obj, value) => { obj.icon = value; } }, metadata: _metadata }, _icon_initializers, _icon_extraInitializers);
            __esDecorate(null, null, _benefits_decorators, { kind: "field", name: "benefits", static: false, private: false, access: { has: obj => "benefits" in obj, get: obj => obj.benefits, set: (obj, value) => { obj.benefits = value; } }, metadata: _metadata }, _benefits_initializers, _benefits_extraInitializers);
            __esDecorate(null, null, _pointsMultiplier_decorators, { kind: "field", name: "pointsMultiplier", static: false, private: false, access: { has: obj => "pointsMultiplier" in obj, get: obj => obj.pointsMultiplier, set: (obj, value) => { obj.pointsMultiplier = value; } }, metadata: _metadata }, _pointsMultiplier_initializers, _pointsMultiplier_extraInitializers);
            __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: obj => "sortOrder" in obj, get: obj => obj.sortOrder, set: (obj, value) => { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        minPoints = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _minPoints_initializers, void 0));
        color = (__runInitializers(this, _minPoints_extraInitializers), __runInitializers(this, _color_initializers, void 0));
        icon = (__runInitializers(this, _color_extraInitializers), __runInitializers(this, _icon_initializers, void 0));
        benefits = (__runInitializers(this, _icon_extraInitializers), __runInitializers(this, _benefits_initializers, void 0));
        pointsMultiplier = (__runInitializers(this, _benefits_extraInitializers), __runInitializers(this, _pointsMultiplier_initializers, void 0));
        sortOrder = (__runInitializers(this, _pointsMultiplier_extraInitializers), __runInitializers(this, _sortOrder_initializers, void 0));
        constructor() {
            __runInitializers(this, _sortOrder_extraInitializers);
        }
    };
})();
exports.UpdateTierDto = UpdateTierDto;
// ==================== Reward DTOs ====================
exports.RewardTypes = ['DISCOUNT_VALUE', 'DISCOUNT_PERCENT', 'FREE_SERVICE', 'FREE_PRODUCT', 'GIFT'];
let CreateRewardDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _pointsCost_decorators;
    let _pointsCost_initializers = [];
    let _pointsCost_extraInitializers = [];
    let _value_decorators;
    let _value_initializers = [];
    let _value_extraInitializers = [];
    let _productId_decorators;
    let _productId_initializers = [];
    let _productId_extraInitializers = [];
    let _serviceId_decorators;
    let _serviceId_initializers = [];
    let _serviceId_extraInitializers = [];
    let _minTier_decorators;
    let _minTier_initializers = [];
    let _minTier_extraInitializers = [];
    let _maxRedemptionsPerClient_decorators;
    let _maxRedemptionsPerClient_initializers = [];
    let _maxRedemptionsPerClient_extraInitializers = [];
    let _totalAvailable_decorators;
    let _totalAvailable_initializers = [];
    let _totalAvailable_extraInitializers = [];
    let _validDays_decorators;
    let _validDays_initializers = [];
    let _validDays_extraInitializers = [];
    let _imageUrl_decorators;
    let _imageUrl_initializers = [];
    let _imageUrl_extraInitializers = [];
    return class CreateRewardDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiProperty)({ description: 'Nome da recompensa', example: 'Desconto de R$50' }), (0, class_validator_1.IsString)()];
            _description_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Descrição da recompensa', example: 'Desconto de R$50 em qualquer serviço' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _type_decorators = [(0, swagger_1.ApiProperty)({ description: 'Tipo da recompensa', enum: ['DISCOUNT_VALUE', 'DISCOUNT_PERCENT', 'FREE_SERVICE', 'FREE_PRODUCT', 'GIFT'], example: 'DISCOUNT_VALUE' }), (0, class_validator_1.IsString)()];
            _pointsCost_decorators = [(0, swagger_1.ApiProperty)({ description: 'Custo em pontos', example: 500, minimum: 1 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            _value_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Valor do desconto (R$ ou %)', example: 50, minimum: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _productId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do produto (para FREE_PRODUCT)', example: 123 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _serviceId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do serviço (para FREE_SERVICE)', example: 456 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _minTier_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Tier mínimo para resgatar', example: 'GOLD' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _maxRedemptionsPerClient_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Máximo de resgates por cliente', example: 3, minimum: 1 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            _totalAvailable_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Total disponível para resgate', example: 100, minimum: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _validDays_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Dias de validade após resgate', example: 30, minimum: 1 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            _imageUrl_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'URL da imagem da recompensa', example: 'https://example.com/reward.jpg' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _pointsCost_decorators, { kind: "field", name: "pointsCost", static: false, private: false, access: { has: obj => "pointsCost" in obj, get: obj => obj.pointsCost, set: (obj, value) => { obj.pointsCost = value; } }, metadata: _metadata }, _pointsCost_initializers, _pointsCost_extraInitializers);
            __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: obj => "productId" in obj, get: obj => obj.productId, set: (obj, value) => { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _serviceId_decorators, { kind: "field", name: "serviceId", static: false, private: false, access: { has: obj => "serviceId" in obj, get: obj => obj.serviceId, set: (obj, value) => { obj.serviceId = value; } }, metadata: _metadata }, _serviceId_initializers, _serviceId_extraInitializers);
            __esDecorate(null, null, _minTier_decorators, { kind: "field", name: "minTier", static: false, private: false, access: { has: obj => "minTier" in obj, get: obj => obj.minTier, set: (obj, value) => { obj.minTier = value; } }, metadata: _metadata }, _minTier_initializers, _minTier_extraInitializers);
            __esDecorate(null, null, _maxRedemptionsPerClient_decorators, { kind: "field", name: "maxRedemptionsPerClient", static: false, private: false, access: { has: obj => "maxRedemptionsPerClient" in obj, get: obj => obj.maxRedemptionsPerClient, set: (obj, value) => { obj.maxRedemptionsPerClient = value; } }, metadata: _metadata }, _maxRedemptionsPerClient_initializers, _maxRedemptionsPerClient_extraInitializers);
            __esDecorate(null, null, _totalAvailable_decorators, { kind: "field", name: "totalAvailable", static: false, private: false, access: { has: obj => "totalAvailable" in obj, get: obj => obj.totalAvailable, set: (obj, value) => { obj.totalAvailable = value; } }, metadata: _metadata }, _totalAvailable_initializers, _totalAvailable_extraInitializers);
            __esDecorate(null, null, _validDays_decorators, { kind: "field", name: "validDays", static: false, private: false, access: { has: obj => "validDays" in obj, get: obj => obj.validDays, set: (obj, value) => { obj.validDays = value; } }, metadata: _metadata }, _validDays_initializers, _validDays_extraInitializers);
            __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: obj => "imageUrl" in obj, get: obj => obj.imageUrl, set: (obj, value) => { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        type = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _type_initializers, void 0));
        pointsCost = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _pointsCost_initializers, void 0));
        value = (__runInitializers(this, _pointsCost_extraInitializers), __runInitializers(this, _value_initializers, void 0));
        productId = (__runInitializers(this, _value_extraInitializers), __runInitializers(this, _productId_initializers, void 0));
        serviceId = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _serviceId_initializers, void 0));
        minTier = (__runInitializers(this, _serviceId_extraInitializers), __runInitializers(this, _minTier_initializers, void 0));
        maxRedemptionsPerClient = (__runInitializers(this, _minTier_extraInitializers), __runInitializers(this, _maxRedemptionsPerClient_initializers, void 0));
        totalAvailable = (__runInitializers(this, _maxRedemptionsPerClient_extraInitializers), __runInitializers(this, _totalAvailable_initializers, void 0));
        validDays = (__runInitializers(this, _totalAvailable_extraInitializers), __runInitializers(this, _validDays_initializers, void 0));
        imageUrl = (__runInitializers(this, _validDays_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
        constructor() {
            __runInitializers(this, _imageUrl_extraInitializers);
        }
    };
})();
exports.CreateRewardDto = CreateRewardDto;
let UpdateRewardDto = (() => {
    let _classSuper = CreateRewardDto;
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    return class UpdateRewardDto extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _isActive_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Recompensa ativa', example: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        isActive = __runInitializers(this, _isActive_initializers, void 0);
        constructor() {
            super(...arguments);
            __runInitializers(this, _isActive_extraInitializers);
        }
    };
})();
exports.UpdateRewardDto = UpdateRewardDto;
// ==================== Account DTOs ====================
let EnrollClientDto = (() => {
    let _referralCode_decorators;
    let _referralCode_initializers = [];
    let _referralCode_extraInitializers = [];
    return class EnrollClientDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _referralCode_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Código de indicação', example: 'ABC123' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _referralCode_decorators, { kind: "field", name: "referralCode", static: false, private: false, access: { has: obj => "referralCode" in obj, get: obj => obj.referralCode, set: (obj, value) => { obj.referralCode = value; } }, metadata: _metadata }, _referralCode_initializers, _referralCode_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        referralCode = __runInitializers(this, _referralCode_initializers, void 0);
        constructor() {
            __runInitializers(this, _referralCode_extraInitializers);
        }
    };
})();
exports.EnrollClientDto = EnrollClientDto;
let AdjustPointsDto = (() => {
    let _points_decorators;
    let _points_initializers = [];
    let _points_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    return class AdjustPointsDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _points_decorators = [(0, swagger_1.ApiProperty)({ description: 'Quantidade de pontos (positivo para adicionar, negativo para remover)', example: 100 }), (0, class_validator_1.IsNumber)()];
            _description_decorators = [(0, swagger_1.ApiProperty)({ description: 'Motivo do ajuste', example: 'Compensação por problema no serviço' }), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _points_decorators, { kind: "field", name: "points", static: false, private: false, access: { has: obj => "points" in obj, get: obj => obj.points, set: (obj, value) => { obj.points = value; } }, metadata: _metadata }, _points_initializers, _points_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        points = __runInitializers(this, _points_initializers, void 0);
        description = (__runInitializers(this, _points_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        constructor() {
            __runInitializers(this, _description_extraInitializers);
        }
    };
})();
exports.AdjustPointsDto = AdjustPointsDto;
// ==================== Transaction DTOs ====================
exports.TransactionTypes = ['EARN', 'REDEEM', 'EXPIRE', 'ADJUST', 'BONUS', 'REFERRAL', 'BIRTHDAY', 'WELCOME'];
// ==================== Voucher DTOs ====================
let UseVoucherDto = (() => {
    let _commandId_decorators;
    let _commandId_initializers = [];
    let _commandId_extraInitializers = [];
    return class UseVoucherDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _commandId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID da comanda onde usar o voucher', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsUUID)()];
            __esDecorate(null, null, _commandId_decorators, { kind: "field", name: "commandId", static: false, private: false, access: { has: obj => "commandId" in obj, get: obj => obj.commandId, set: (obj, value) => { obj.commandId = value; } }, metadata: _metadata }, _commandId_initializers, _commandId_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        commandId = __runInitializers(this, _commandId_initializers, void 0);
        constructor() {
            __runInitializers(this, _commandId_extraInitializers);
        }
    };
})();
exports.UseVoucherDto = UseVoucherDto;
// ==================== Referral DTOs ====================
let ApplyReferralDto = (() => {
    let _newClientId_decorators;
    let _newClientId_initializers = [];
    let _newClientId_extraInitializers = [];
    let _referralCode_decorators;
    let _referralCode_initializers = [];
    let _referralCode_extraInitializers = [];
    return class ApplyReferralDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _newClientId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do novo cliente indicado', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsUUID)()];
            _referralCode_decorators = [(0, swagger_1.ApiProperty)({ description: 'Código de indicação do cliente que indicou', example: 'ABC123' }), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _newClientId_decorators, { kind: "field", name: "newClientId", static: false, private: false, access: { has: obj => "newClientId" in obj, get: obj => obj.newClientId, set: (obj, value) => { obj.newClientId = value; } }, metadata: _metadata }, _newClientId_initializers, _newClientId_extraInitializers);
            __esDecorate(null, null, _referralCode_decorators, { kind: "field", name: "referralCode", static: false, private: false, access: { has: obj => "referralCode" in obj, get: obj => obj.referralCode, set: (obj, value) => { obj.referralCode = value; } }, metadata: _metadata }, _referralCode_initializers, _referralCode_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        newClientId = __runInitializers(this, _newClientId_initializers, void 0);
        referralCode = (__runInitializers(this, _newClientId_extraInitializers), __runInitializers(this, _referralCode_initializers, void 0));
        constructor() {
            __runInitializers(this, _referralCode_extraInitializers);
        }
    };
})();
exports.ApplyReferralDto = ApplyReferralDto;
// ==================== Labels ====================
exports.RewardTypeLabels = {
    DISCOUNT_VALUE: 'Desconto em Valor (R$)',
    DISCOUNT_PERCENT: 'Desconto em Porcentagem (%)',
    FREE_SERVICE: 'Serviço Grátis',
    FREE_PRODUCT: 'Produto Grátis',
    GIFT: 'Brinde',
};
exports.TransactionTypeLabels = {
    EARN: 'Pontos Ganhos',
    REDEEM: 'Pontos Resgatados',
    EXPIRE: 'Pontos Expirados',
    ADJUST: 'Ajuste Manual',
    BONUS: 'Bônus',
    REFERRAL: 'Indicação',
    BIRTHDAY: 'Aniversário',
    WELCOME: 'Boas-vindas',
};
//# sourceMappingURL=dto.js.map