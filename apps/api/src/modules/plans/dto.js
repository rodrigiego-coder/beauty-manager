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
exports.UpdatePlanDto = exports.CreatePlanDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
let CreatePlanDto = (() => {
    let _code_decorators;
    let _code_initializers = [];
    let _code_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _priceMonthly_decorators;
    let _priceMonthly_initializers = [];
    let _priceMonthly_extraInitializers = [];
    let _priceYearly_decorators;
    let _priceYearly_initializers = [];
    let _priceYearly_extraInitializers = [];
    let _maxUsers_decorators;
    let _maxUsers_initializers = [];
    let _maxUsers_extraInitializers = [];
    let _maxClients_decorators;
    let _maxClients_initializers = [];
    let _maxClients_extraInitializers = [];
    let _maxSalons_decorators;
    let _maxSalons_initializers = [];
    let _maxSalons_extraInitializers = [];
    let _features_decorators;
    let _features_initializers = [];
    let _features_extraInitializers = [];
    let _hasFiscal_decorators;
    let _hasFiscal_initializers = [];
    let _hasFiscal_extraInitializers = [];
    let _hasAutomation_decorators;
    let _hasAutomation_initializers = [];
    let _hasAutomation_extraInitializers = [];
    let _hasReports_decorators;
    let _hasReports_initializers = [];
    let _hasReports_extraInitializers = [];
    let _hasAI_decorators;
    let _hasAI_initializers = [];
    let _hasAI_extraInitializers = [];
    let _trialDays_decorators;
    let _trialDays_initializers = [];
    let _trialDays_extraInitializers = [];
    let _sortOrder_decorators;
    let _sortOrder_initializers = [];
    let _sortOrder_extraInitializers = [];
    return class CreatePlanDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _code_decorators = [(0, swagger_1.ApiProperty)({ description: 'Código único do plano', example: 'PRO', maxLength: 20 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(20)];
            _name_decorators = [(0, swagger_1.ApiProperty)({ description: 'Nome do plano', example: 'Plano Profissional', maxLength: 100 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(100)];
            _description_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Descrição do plano', example: 'Plano ideal para salões de médio porte' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _priceMonthly_decorators = [(0, swagger_1.ApiProperty)({ description: 'Preço mensal em reais', example: 99.90, minimum: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _priceYearly_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Preço anual em reais (desconto)', example: 999.00, minimum: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.IsOptional)()];
            _maxUsers_decorators = [(0, swagger_1.ApiProperty)({ description: 'Máximo de usuários permitidos', example: 5, minimum: 1 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            _maxClients_decorators = [(0, swagger_1.ApiProperty)({ description: 'Máximo de clientes permitidos (0 = ilimitado)', example: 500, minimum: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _maxSalons_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Máximo de salões permitidos', example: 1, minimum: 1 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.IsOptional)()];
            _features_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Lista de features inclusas', example: ['agendamento', 'clientes', 'financeiro'], isArray: true, type: String }), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true }), (0, class_validator_1.IsOptional)()];
            _hasFiscal_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Possui módulo fiscal', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _hasAutomation_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Possui automação (WhatsApp)', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _hasReports_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Possui relatórios avançados', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _hasAI_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Possui inteligência artificial', example: false }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _trialDays_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Dias de trial', example: 14 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _sortOrder_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Ordem de exibição', example: 2 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _code_decorators, { kind: "field", name: "code", static: false, private: false, access: { has: obj => "code" in obj, get: obj => obj.code, set: (obj, value) => { obj.code = value; } }, metadata: _metadata }, _code_initializers, _code_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _priceMonthly_decorators, { kind: "field", name: "priceMonthly", static: false, private: false, access: { has: obj => "priceMonthly" in obj, get: obj => obj.priceMonthly, set: (obj, value) => { obj.priceMonthly = value; } }, metadata: _metadata }, _priceMonthly_initializers, _priceMonthly_extraInitializers);
            __esDecorate(null, null, _priceYearly_decorators, { kind: "field", name: "priceYearly", static: false, private: false, access: { has: obj => "priceYearly" in obj, get: obj => obj.priceYearly, set: (obj, value) => { obj.priceYearly = value; } }, metadata: _metadata }, _priceYearly_initializers, _priceYearly_extraInitializers);
            __esDecorate(null, null, _maxUsers_decorators, { kind: "field", name: "maxUsers", static: false, private: false, access: { has: obj => "maxUsers" in obj, get: obj => obj.maxUsers, set: (obj, value) => { obj.maxUsers = value; } }, metadata: _metadata }, _maxUsers_initializers, _maxUsers_extraInitializers);
            __esDecorate(null, null, _maxClients_decorators, { kind: "field", name: "maxClients", static: false, private: false, access: { has: obj => "maxClients" in obj, get: obj => obj.maxClients, set: (obj, value) => { obj.maxClients = value; } }, metadata: _metadata }, _maxClients_initializers, _maxClients_extraInitializers);
            __esDecorate(null, null, _maxSalons_decorators, { kind: "field", name: "maxSalons", static: false, private: false, access: { has: obj => "maxSalons" in obj, get: obj => obj.maxSalons, set: (obj, value) => { obj.maxSalons = value; } }, metadata: _metadata }, _maxSalons_initializers, _maxSalons_extraInitializers);
            __esDecorate(null, null, _features_decorators, { kind: "field", name: "features", static: false, private: false, access: { has: obj => "features" in obj, get: obj => obj.features, set: (obj, value) => { obj.features = value; } }, metadata: _metadata }, _features_initializers, _features_extraInitializers);
            __esDecorate(null, null, _hasFiscal_decorators, { kind: "field", name: "hasFiscal", static: false, private: false, access: { has: obj => "hasFiscal" in obj, get: obj => obj.hasFiscal, set: (obj, value) => { obj.hasFiscal = value; } }, metadata: _metadata }, _hasFiscal_initializers, _hasFiscal_extraInitializers);
            __esDecorate(null, null, _hasAutomation_decorators, { kind: "field", name: "hasAutomation", static: false, private: false, access: { has: obj => "hasAutomation" in obj, get: obj => obj.hasAutomation, set: (obj, value) => { obj.hasAutomation = value; } }, metadata: _metadata }, _hasAutomation_initializers, _hasAutomation_extraInitializers);
            __esDecorate(null, null, _hasReports_decorators, { kind: "field", name: "hasReports", static: false, private: false, access: { has: obj => "hasReports" in obj, get: obj => obj.hasReports, set: (obj, value) => { obj.hasReports = value; } }, metadata: _metadata }, _hasReports_initializers, _hasReports_extraInitializers);
            __esDecorate(null, null, _hasAI_decorators, { kind: "field", name: "hasAI", static: false, private: false, access: { has: obj => "hasAI" in obj, get: obj => obj.hasAI, set: (obj, value) => { obj.hasAI = value; } }, metadata: _metadata }, _hasAI_initializers, _hasAI_extraInitializers);
            __esDecorate(null, null, _trialDays_decorators, { kind: "field", name: "trialDays", static: false, private: false, access: { has: obj => "trialDays" in obj, get: obj => obj.trialDays, set: (obj, value) => { obj.trialDays = value; } }, metadata: _metadata }, _trialDays_initializers, _trialDays_extraInitializers);
            __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: obj => "sortOrder" in obj, get: obj => obj.sortOrder, set: (obj, value) => { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        code = __runInitializers(this, _code_initializers, void 0);
        name = (__runInitializers(this, _code_extraInitializers), __runInitializers(this, _name_initializers, void 0));
        description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        priceMonthly = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _priceMonthly_initializers, void 0));
        priceYearly = (__runInitializers(this, _priceMonthly_extraInitializers), __runInitializers(this, _priceYearly_initializers, void 0));
        maxUsers = (__runInitializers(this, _priceYearly_extraInitializers), __runInitializers(this, _maxUsers_initializers, void 0));
        maxClients = (__runInitializers(this, _maxUsers_extraInitializers), __runInitializers(this, _maxClients_initializers, void 0));
        maxSalons = (__runInitializers(this, _maxClients_extraInitializers), __runInitializers(this, _maxSalons_initializers, void 0));
        features = (__runInitializers(this, _maxSalons_extraInitializers), __runInitializers(this, _features_initializers, void 0));
        hasFiscal = (__runInitializers(this, _features_extraInitializers), __runInitializers(this, _hasFiscal_initializers, void 0));
        hasAutomation = (__runInitializers(this, _hasFiscal_extraInitializers), __runInitializers(this, _hasAutomation_initializers, void 0));
        hasReports = (__runInitializers(this, _hasAutomation_extraInitializers), __runInitializers(this, _hasReports_initializers, void 0));
        hasAI = (__runInitializers(this, _hasReports_extraInitializers), __runInitializers(this, _hasAI_initializers, void 0));
        trialDays = (__runInitializers(this, _hasAI_extraInitializers), __runInitializers(this, _trialDays_initializers, void 0));
        sortOrder = (__runInitializers(this, _trialDays_extraInitializers), __runInitializers(this, _sortOrder_initializers, void 0));
        constructor() {
            __runInitializers(this, _sortOrder_extraInitializers);
        }
    };
})();
exports.CreatePlanDto = CreatePlanDto;
let UpdatePlanDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _priceMonthly_decorators;
    let _priceMonthly_initializers = [];
    let _priceMonthly_extraInitializers = [];
    let _priceYearly_decorators;
    let _priceYearly_initializers = [];
    let _priceYearly_extraInitializers = [];
    let _maxUsers_decorators;
    let _maxUsers_initializers = [];
    let _maxUsers_extraInitializers = [];
    let _maxClients_decorators;
    let _maxClients_initializers = [];
    let _maxClients_extraInitializers = [];
    let _maxSalons_decorators;
    let _maxSalons_initializers = [];
    let _maxSalons_extraInitializers = [];
    let _features_decorators;
    let _features_initializers = [];
    let _features_extraInitializers = [];
    let _hasFiscal_decorators;
    let _hasFiscal_initializers = [];
    let _hasFiscal_extraInitializers = [];
    let _hasAutomation_decorators;
    let _hasAutomation_initializers = [];
    let _hasAutomation_extraInitializers = [];
    let _hasReports_decorators;
    let _hasReports_initializers = [];
    let _hasReports_extraInitializers = [];
    let _hasAI_decorators;
    let _hasAI_initializers = [];
    let _hasAI_extraInitializers = [];
    let _trialDays_decorators;
    let _trialDays_initializers = [];
    let _trialDays_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _sortOrder_decorators;
    let _sortOrder_initializers = [];
    let _sortOrder_extraInitializers = [];
    return class UpdatePlanDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome do plano', example: 'Plano Profissional', maxLength: 100 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(100), (0, class_validator_1.IsOptional)()];
            _description_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Descrição do plano', example: 'Plano ideal para salões de médio porte' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _priceMonthly_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Preço mensal em reais', example: 99.90, minimum: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.IsOptional)()];
            _priceYearly_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Preço anual em reais (desconto)', example: 999.00, minimum: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.IsOptional)()];
            _maxUsers_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Máximo de usuários permitidos', example: 5, minimum: 1 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.IsOptional)()];
            _maxClients_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Máximo de clientes permitidos (0 = ilimitado)', example: 500, minimum: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.IsOptional)()];
            _maxSalons_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Máximo de salões permitidos', example: 1, minimum: 1 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.IsOptional)()];
            _features_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Lista de features inclusas', example: ['agendamento', 'clientes', 'financeiro'], isArray: true, type: String }), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true }), (0, class_validator_1.IsOptional)()];
            _hasFiscal_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Possui módulo fiscal', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _hasAutomation_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Possui automação (WhatsApp)', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _hasReports_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Possui relatórios avançados', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _hasAI_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Possui inteligência artificial', example: false }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _trialDays_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Dias de trial', example: 14 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _isActive_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Plano ativo', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _sortOrder_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Ordem de exibição', example: 2 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _priceMonthly_decorators, { kind: "field", name: "priceMonthly", static: false, private: false, access: { has: obj => "priceMonthly" in obj, get: obj => obj.priceMonthly, set: (obj, value) => { obj.priceMonthly = value; } }, metadata: _metadata }, _priceMonthly_initializers, _priceMonthly_extraInitializers);
            __esDecorate(null, null, _priceYearly_decorators, { kind: "field", name: "priceYearly", static: false, private: false, access: { has: obj => "priceYearly" in obj, get: obj => obj.priceYearly, set: (obj, value) => { obj.priceYearly = value; } }, metadata: _metadata }, _priceYearly_initializers, _priceYearly_extraInitializers);
            __esDecorate(null, null, _maxUsers_decorators, { kind: "field", name: "maxUsers", static: false, private: false, access: { has: obj => "maxUsers" in obj, get: obj => obj.maxUsers, set: (obj, value) => { obj.maxUsers = value; } }, metadata: _metadata }, _maxUsers_initializers, _maxUsers_extraInitializers);
            __esDecorate(null, null, _maxClients_decorators, { kind: "field", name: "maxClients", static: false, private: false, access: { has: obj => "maxClients" in obj, get: obj => obj.maxClients, set: (obj, value) => { obj.maxClients = value; } }, metadata: _metadata }, _maxClients_initializers, _maxClients_extraInitializers);
            __esDecorate(null, null, _maxSalons_decorators, { kind: "field", name: "maxSalons", static: false, private: false, access: { has: obj => "maxSalons" in obj, get: obj => obj.maxSalons, set: (obj, value) => { obj.maxSalons = value; } }, metadata: _metadata }, _maxSalons_initializers, _maxSalons_extraInitializers);
            __esDecorate(null, null, _features_decorators, { kind: "field", name: "features", static: false, private: false, access: { has: obj => "features" in obj, get: obj => obj.features, set: (obj, value) => { obj.features = value; } }, metadata: _metadata }, _features_initializers, _features_extraInitializers);
            __esDecorate(null, null, _hasFiscal_decorators, { kind: "field", name: "hasFiscal", static: false, private: false, access: { has: obj => "hasFiscal" in obj, get: obj => obj.hasFiscal, set: (obj, value) => { obj.hasFiscal = value; } }, metadata: _metadata }, _hasFiscal_initializers, _hasFiscal_extraInitializers);
            __esDecorate(null, null, _hasAutomation_decorators, { kind: "field", name: "hasAutomation", static: false, private: false, access: { has: obj => "hasAutomation" in obj, get: obj => obj.hasAutomation, set: (obj, value) => { obj.hasAutomation = value; } }, metadata: _metadata }, _hasAutomation_initializers, _hasAutomation_extraInitializers);
            __esDecorate(null, null, _hasReports_decorators, { kind: "field", name: "hasReports", static: false, private: false, access: { has: obj => "hasReports" in obj, get: obj => obj.hasReports, set: (obj, value) => { obj.hasReports = value; } }, metadata: _metadata }, _hasReports_initializers, _hasReports_extraInitializers);
            __esDecorate(null, null, _hasAI_decorators, { kind: "field", name: "hasAI", static: false, private: false, access: { has: obj => "hasAI" in obj, get: obj => obj.hasAI, set: (obj, value) => { obj.hasAI = value; } }, metadata: _metadata }, _hasAI_initializers, _hasAI_extraInitializers);
            __esDecorate(null, null, _trialDays_decorators, { kind: "field", name: "trialDays", static: false, private: false, access: { has: obj => "trialDays" in obj, get: obj => obj.trialDays, set: (obj, value) => { obj.trialDays = value; } }, metadata: _metadata }, _trialDays_initializers, _trialDays_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: obj => "sortOrder" in obj, get: obj => obj.sortOrder, set: (obj, value) => { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        priceMonthly = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _priceMonthly_initializers, void 0));
        priceYearly = (__runInitializers(this, _priceMonthly_extraInitializers), __runInitializers(this, _priceYearly_initializers, void 0));
        maxUsers = (__runInitializers(this, _priceYearly_extraInitializers), __runInitializers(this, _maxUsers_initializers, void 0));
        maxClients = (__runInitializers(this, _maxUsers_extraInitializers), __runInitializers(this, _maxClients_initializers, void 0));
        maxSalons = (__runInitializers(this, _maxClients_extraInitializers), __runInitializers(this, _maxSalons_initializers, void 0));
        features = (__runInitializers(this, _maxSalons_extraInitializers), __runInitializers(this, _features_initializers, void 0));
        hasFiscal = (__runInitializers(this, _features_extraInitializers), __runInitializers(this, _hasFiscal_initializers, void 0));
        hasAutomation = (__runInitializers(this, _hasFiscal_extraInitializers), __runInitializers(this, _hasAutomation_initializers, void 0));
        hasReports = (__runInitializers(this, _hasAutomation_extraInitializers), __runInitializers(this, _hasReports_initializers, void 0));
        hasAI = (__runInitializers(this, _hasReports_extraInitializers), __runInitializers(this, _hasAI_initializers, void 0));
        trialDays = (__runInitializers(this, _hasAI_extraInitializers), __runInitializers(this, _trialDays_initializers, void 0));
        isActive = (__runInitializers(this, _trialDays_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        sortOrder = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _sortOrder_initializers, void 0));
        constructor() {
            __runInitializers(this, _sortOrder_extraInitializers);
        }
    };
})();
exports.UpdatePlanDto = UpdatePlanDto;
//# sourceMappingURL=dto.js.map