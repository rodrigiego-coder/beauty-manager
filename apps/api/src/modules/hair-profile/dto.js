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
exports.HairConcernsLabels = exports.ChemicalHistoryLabels = exports.ScalpTypeLabels = exports.HairPorosityLabels = exports.HairLengthLabels = exports.HairThicknessLabels = exports.HairTypeLabels = exports.UpdateHairProfileDto = exports.CreateHairProfileDto = exports.HairConcernsOptions = exports.ChemicalHistoryOptions = exports.ScalpType = exports.HairPorosity = exports.HairLength = exports.HairThickness = exports.HairType = void 0;
const class_validator_1 = require("class-validator");
// Regex para UUID genérico (aceita qualquer versão/formato)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
 * Enums para perfil capilar
 */
var HairType;
(function (HairType) {
    HairType["STRAIGHT"] = "STRAIGHT";
    HairType["WAVY"] = "WAVY";
    HairType["CURLY"] = "CURLY";
    HairType["COILY"] = "COILY";
})(HairType || (exports.HairType = HairType = {}));
var HairThickness;
(function (HairThickness) {
    HairThickness["FINE"] = "FINE";
    HairThickness["MEDIUM"] = "MEDIUM";
    HairThickness["THICK"] = "THICK";
})(HairThickness || (exports.HairThickness = HairThickness = {}));
var HairLength;
(function (HairLength) {
    HairLength["SHORT"] = "SHORT";
    HairLength["MEDIUM"] = "MEDIUM";
    HairLength["LONG"] = "LONG";
    HairLength["EXTRA_LONG"] = "EXTRA_LONG";
})(HairLength || (exports.HairLength = HairLength = {}));
var HairPorosity;
(function (HairPorosity) {
    HairPorosity["LOW"] = "LOW";
    HairPorosity["NORMAL"] = "NORMAL";
    HairPorosity["HIGH"] = "HIGH";
})(HairPorosity || (exports.HairPorosity = HairPorosity = {}));
var ScalpType;
(function (ScalpType) {
    ScalpType["NORMAL"] = "NORMAL";
    ScalpType["OILY"] = "OILY";
    ScalpType["DRY"] = "DRY";
    ScalpType["SENSITIVE"] = "SENSITIVE";
})(ScalpType || (exports.ScalpType = ScalpType = {}));
/**
 * Opções de histórico químico
 */
exports.ChemicalHistoryOptions = [
    'COLORACAO', // Coloração
    'DESCOLORACAO', // Descoloração
    'ALISAMENTO', // Alisamento
    'RELAXAMENTO', // Relaxamento
    'PERMANENTE', // Permanente
    'PROGRESSIVA', // Progressiva
    'BOTOX', // Botox capilar
    'KERATINA', // Tratamento de keratina
    'NENHUM', // Nenhum
];
/**
 * Opções de problemas/necessidades capilares
 */
exports.HairConcernsOptions = [
    'QUEDA', // Queda capilar
    'OLEOSIDADE', // Oleosidade excessiva
    'RESSECAMENTO', // Ressecamento
    'FRIZZ', // Frizz
    'PONTAS_DUPLAS', // Pontas duplas
    'CASPA', // Caspa
    'COCEIRA', // Coceira no couro cabeludo
    'QUEBRA', // Quebra
    'SEM_BRILHO', // Sem brilho
    'VOLUME_EXCESSIVO', // Volume excessivo
    'POCO_VOLUME', // Pouco volume
    'CRESCIMENTO_LENTO', // Crescimento lento
    'SENSIBILIDADE', // Sensibilidade
    'DANIFICADO', // Danificado por química
    'CALVICE', // Calvície
    'AFINAMENTO', // Afinamento dos fios
];
/**
 * DTO para criação/atualização de perfil capilar
 */
let CreateHairProfileDto = (() => {
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _hairType_decorators;
    let _hairType_initializers = [];
    let _hairType_extraInitializers = [];
    let _hairThickness_decorators;
    let _hairThickness_initializers = [];
    let _hairThickness_extraInitializers = [];
    let _hairLength_decorators;
    let _hairLength_initializers = [];
    let _hairLength_extraInitializers = [];
    let _hairPorosity_decorators;
    let _hairPorosity_initializers = [];
    let _hairPorosity_extraInitializers = [];
    let _scalpType_decorators;
    let _scalpType_initializers = [];
    let _scalpType_extraInitializers = [];
    let _chemicalHistory_decorators;
    let _chemicalHistory_initializers = [];
    let _chemicalHistory_extraInitializers = [];
    let _mainConcerns_decorators;
    let _mainConcerns_initializers = [];
    let _mainConcerns_extraInitializers = [];
    let _allergies_decorators;
    let _allergies_initializers = [];
    let _allergies_extraInitializers = [];
    let _currentProducts_decorators;
    let _currentProducts_initializers = [];
    let _currentProducts_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return class CreateHairProfileDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _clientId_decorators = [(0, class_validator_1.Matches)(UUID_REGEX, { message: 'clientId deve ser um UUID válido' })];
            _hairType_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(HairType)];
            _hairThickness_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(HairThickness)];
            _hairLength_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(HairLength)];
            _hairPorosity_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(HairPorosity)];
            _scalpType_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(ScalpType)];
            _chemicalHistory_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _mainConcerns_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _allergies_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _currentProducts_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _notes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _hairType_decorators, { kind: "field", name: "hairType", static: false, private: false, access: { has: obj => "hairType" in obj, get: obj => obj.hairType, set: (obj, value) => { obj.hairType = value; } }, metadata: _metadata }, _hairType_initializers, _hairType_extraInitializers);
            __esDecorate(null, null, _hairThickness_decorators, { kind: "field", name: "hairThickness", static: false, private: false, access: { has: obj => "hairThickness" in obj, get: obj => obj.hairThickness, set: (obj, value) => { obj.hairThickness = value; } }, metadata: _metadata }, _hairThickness_initializers, _hairThickness_extraInitializers);
            __esDecorate(null, null, _hairLength_decorators, { kind: "field", name: "hairLength", static: false, private: false, access: { has: obj => "hairLength" in obj, get: obj => obj.hairLength, set: (obj, value) => { obj.hairLength = value; } }, metadata: _metadata }, _hairLength_initializers, _hairLength_extraInitializers);
            __esDecorate(null, null, _hairPorosity_decorators, { kind: "field", name: "hairPorosity", static: false, private: false, access: { has: obj => "hairPorosity" in obj, get: obj => obj.hairPorosity, set: (obj, value) => { obj.hairPorosity = value; } }, metadata: _metadata }, _hairPorosity_initializers, _hairPorosity_extraInitializers);
            __esDecorate(null, null, _scalpType_decorators, { kind: "field", name: "scalpType", static: false, private: false, access: { has: obj => "scalpType" in obj, get: obj => obj.scalpType, set: (obj, value) => { obj.scalpType = value; } }, metadata: _metadata }, _scalpType_initializers, _scalpType_extraInitializers);
            __esDecorate(null, null, _chemicalHistory_decorators, { kind: "field", name: "chemicalHistory", static: false, private: false, access: { has: obj => "chemicalHistory" in obj, get: obj => obj.chemicalHistory, set: (obj, value) => { obj.chemicalHistory = value; } }, metadata: _metadata }, _chemicalHistory_initializers, _chemicalHistory_extraInitializers);
            __esDecorate(null, null, _mainConcerns_decorators, { kind: "field", name: "mainConcerns", static: false, private: false, access: { has: obj => "mainConcerns" in obj, get: obj => obj.mainConcerns, set: (obj, value) => { obj.mainConcerns = value; } }, metadata: _metadata }, _mainConcerns_initializers, _mainConcerns_extraInitializers);
            __esDecorate(null, null, _allergies_decorators, { kind: "field", name: "allergies", static: false, private: false, access: { has: obj => "allergies" in obj, get: obj => obj.allergies, set: (obj, value) => { obj.allergies = value; } }, metadata: _metadata }, _allergies_initializers, _allergies_extraInitializers);
            __esDecorate(null, null, _currentProducts_decorators, { kind: "field", name: "currentProducts", static: false, private: false, access: { has: obj => "currentProducts" in obj, get: obj => obj.currentProducts, set: (obj, value) => { obj.currentProducts = value; } }, metadata: _metadata }, _currentProducts_initializers, _currentProducts_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        clientId = __runInitializers(this, _clientId_initializers, void 0);
        hairType = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _hairType_initializers, void 0));
        hairThickness = (__runInitializers(this, _hairType_extraInitializers), __runInitializers(this, _hairThickness_initializers, void 0));
        hairLength = (__runInitializers(this, _hairThickness_extraInitializers), __runInitializers(this, _hairLength_initializers, void 0));
        hairPorosity = (__runInitializers(this, _hairLength_extraInitializers), __runInitializers(this, _hairPorosity_initializers, void 0));
        scalpType = (__runInitializers(this, _hairPorosity_extraInitializers), __runInitializers(this, _scalpType_initializers, void 0));
        chemicalHistory = (__runInitializers(this, _scalpType_extraInitializers), __runInitializers(this, _chemicalHistory_initializers, void 0));
        mainConcerns = (__runInitializers(this, _chemicalHistory_extraInitializers), __runInitializers(this, _mainConcerns_initializers, void 0));
        allergies = (__runInitializers(this, _mainConcerns_extraInitializers), __runInitializers(this, _allergies_initializers, void 0));
        currentProducts = (__runInitializers(this, _allergies_extraInitializers), __runInitializers(this, _currentProducts_initializers, void 0));
        notes = (__runInitializers(this, _currentProducts_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        constructor() {
            __runInitializers(this, _notes_extraInitializers);
        }
    };
})();
exports.CreateHairProfileDto = CreateHairProfileDto;
let UpdateHairProfileDto = (() => {
    let _hairType_decorators;
    let _hairType_initializers = [];
    let _hairType_extraInitializers = [];
    let _hairThickness_decorators;
    let _hairThickness_initializers = [];
    let _hairThickness_extraInitializers = [];
    let _hairLength_decorators;
    let _hairLength_initializers = [];
    let _hairLength_extraInitializers = [];
    let _hairPorosity_decorators;
    let _hairPorosity_initializers = [];
    let _hairPorosity_extraInitializers = [];
    let _scalpType_decorators;
    let _scalpType_initializers = [];
    let _scalpType_extraInitializers = [];
    let _chemicalHistory_decorators;
    let _chemicalHistory_initializers = [];
    let _chemicalHistory_extraInitializers = [];
    let _mainConcerns_decorators;
    let _mainConcerns_initializers = [];
    let _mainConcerns_extraInitializers = [];
    let _allergies_decorators;
    let _allergies_initializers = [];
    let _allergies_extraInitializers = [];
    let _currentProducts_decorators;
    let _currentProducts_initializers = [];
    let _currentProducts_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return class UpdateHairProfileDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _hairType_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(HairType)];
            _hairThickness_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(HairThickness)];
            _hairLength_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(HairLength)];
            _hairPorosity_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(HairPorosity)];
            _scalpType_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(ScalpType)];
            _chemicalHistory_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _mainConcerns_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _allergies_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _currentProducts_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _notes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _hairType_decorators, { kind: "field", name: "hairType", static: false, private: false, access: { has: obj => "hairType" in obj, get: obj => obj.hairType, set: (obj, value) => { obj.hairType = value; } }, metadata: _metadata }, _hairType_initializers, _hairType_extraInitializers);
            __esDecorate(null, null, _hairThickness_decorators, { kind: "field", name: "hairThickness", static: false, private: false, access: { has: obj => "hairThickness" in obj, get: obj => obj.hairThickness, set: (obj, value) => { obj.hairThickness = value; } }, metadata: _metadata }, _hairThickness_initializers, _hairThickness_extraInitializers);
            __esDecorate(null, null, _hairLength_decorators, { kind: "field", name: "hairLength", static: false, private: false, access: { has: obj => "hairLength" in obj, get: obj => obj.hairLength, set: (obj, value) => { obj.hairLength = value; } }, metadata: _metadata }, _hairLength_initializers, _hairLength_extraInitializers);
            __esDecorate(null, null, _hairPorosity_decorators, { kind: "field", name: "hairPorosity", static: false, private: false, access: { has: obj => "hairPorosity" in obj, get: obj => obj.hairPorosity, set: (obj, value) => { obj.hairPorosity = value; } }, metadata: _metadata }, _hairPorosity_initializers, _hairPorosity_extraInitializers);
            __esDecorate(null, null, _scalpType_decorators, { kind: "field", name: "scalpType", static: false, private: false, access: { has: obj => "scalpType" in obj, get: obj => obj.scalpType, set: (obj, value) => { obj.scalpType = value; } }, metadata: _metadata }, _scalpType_initializers, _scalpType_extraInitializers);
            __esDecorate(null, null, _chemicalHistory_decorators, { kind: "field", name: "chemicalHistory", static: false, private: false, access: { has: obj => "chemicalHistory" in obj, get: obj => obj.chemicalHistory, set: (obj, value) => { obj.chemicalHistory = value; } }, metadata: _metadata }, _chemicalHistory_initializers, _chemicalHistory_extraInitializers);
            __esDecorate(null, null, _mainConcerns_decorators, { kind: "field", name: "mainConcerns", static: false, private: false, access: { has: obj => "mainConcerns" in obj, get: obj => obj.mainConcerns, set: (obj, value) => { obj.mainConcerns = value; } }, metadata: _metadata }, _mainConcerns_initializers, _mainConcerns_extraInitializers);
            __esDecorate(null, null, _allergies_decorators, { kind: "field", name: "allergies", static: false, private: false, access: { has: obj => "allergies" in obj, get: obj => obj.allergies, set: (obj, value) => { obj.allergies = value; } }, metadata: _metadata }, _allergies_initializers, _allergies_extraInitializers);
            __esDecorate(null, null, _currentProducts_decorators, { kind: "field", name: "currentProducts", static: false, private: false, access: { has: obj => "currentProducts" in obj, get: obj => obj.currentProducts, set: (obj, value) => { obj.currentProducts = value; } }, metadata: _metadata }, _currentProducts_initializers, _currentProducts_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        hairType = __runInitializers(this, _hairType_initializers, void 0);
        hairThickness = (__runInitializers(this, _hairType_extraInitializers), __runInitializers(this, _hairThickness_initializers, void 0));
        hairLength = (__runInitializers(this, _hairThickness_extraInitializers), __runInitializers(this, _hairLength_initializers, void 0));
        hairPorosity = (__runInitializers(this, _hairLength_extraInitializers), __runInitializers(this, _hairPorosity_initializers, void 0));
        scalpType = (__runInitializers(this, _hairPorosity_extraInitializers), __runInitializers(this, _scalpType_initializers, void 0));
        chemicalHistory = (__runInitializers(this, _scalpType_extraInitializers), __runInitializers(this, _chemicalHistory_initializers, void 0));
        mainConcerns = (__runInitializers(this, _chemicalHistory_extraInitializers), __runInitializers(this, _mainConcerns_initializers, void 0));
        allergies = (__runInitializers(this, _mainConcerns_extraInitializers), __runInitializers(this, _allergies_initializers, void 0));
        currentProducts = (__runInitializers(this, _allergies_extraInitializers), __runInitializers(this, _currentProducts_initializers, void 0));
        notes = (__runInitializers(this, _currentProducts_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        constructor() {
            __runInitializers(this, _notes_extraInitializers);
        }
    };
})();
exports.UpdateHairProfileDto = UpdateHairProfileDto;
/**
 * Labels traduzidos para exibição
 */
exports.HairTypeLabels = {
    [HairType.STRAIGHT]: 'Liso',
    [HairType.WAVY]: 'Ondulado',
    [HairType.CURLY]: 'Cacheado',
    [HairType.COILY]: 'Crespo',
};
exports.HairThicknessLabels = {
    [HairThickness.FINE]: 'Fino',
    [HairThickness.MEDIUM]: 'Médio',
    [HairThickness.THICK]: 'Grosso',
};
exports.HairLengthLabels = {
    [HairLength.SHORT]: 'Curto',
    [HairLength.MEDIUM]: 'Médio',
    [HairLength.LONG]: 'Longo',
    [HairLength.EXTRA_LONG]: 'Extra Longo',
};
exports.HairPorosityLabels = {
    [HairPorosity.LOW]: 'Baixa',
    [HairPorosity.NORMAL]: 'Normal',
    [HairPorosity.HIGH]: 'Alta',
};
exports.ScalpTypeLabels = {
    [ScalpType.NORMAL]: 'Normal',
    [ScalpType.OILY]: 'Oleoso',
    [ScalpType.DRY]: 'Seco',
    [ScalpType.SENSITIVE]: 'Sensível',
};
exports.ChemicalHistoryLabels = {
    COLORACAO: 'Coloração',
    DESCOLORACAO: 'Descoloração',
    ALISAMENTO: 'Alisamento',
    RELAXAMENTO: 'Relaxamento',
    PERMANENTE: 'Permanente',
    PROGRESSIVA: 'Progressiva',
    BOTOX: 'Botox Capilar',
    KERATINA: 'Tratamento de Keratina',
    NENHUM: 'Nenhum',
};
exports.HairConcernsLabels = {
    QUEDA: 'Queda Capilar',
    OLEOSIDADE: 'Oleosidade Excessiva',
    RESSECAMENTO: 'Ressecamento',
    FRIZZ: 'Frizz',
    PONTAS_DUPLAS: 'Pontas Duplas',
    CASPA: 'Caspa',
    COCEIRA: 'Coceira no Couro Cabeludo',
    QUEBRA: 'Quebra',
    SEM_BRILHO: 'Sem Brilho',
    VOLUME_EXCESSIVO: 'Volume Excessivo',
    POCO_VOLUME: 'Pouco Volume',
    CRESCIMENTO_LENTO: 'Crescimento Lento',
    SENSIBILIDADE: 'Sensibilidade',
    DANIFICADO: 'Danificado por Química',
    CALVICE: 'Calvície',
    AFINAMENTO: 'Afinamento dos Fios',
};
//# sourceMappingURL=dto.js.map