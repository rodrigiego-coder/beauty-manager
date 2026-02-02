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
exports.SchedulesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let SchedulesController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Schedules'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('schedules')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getSalonSchedule_decorators;
    let _updateSalonSchedule_decorators;
    let _getProfessionalSchedule_decorators;
    let _getMySchedule_decorators;
    let _updateProfessionalSchedule_decorators;
    let _getProfessionalBlocks_decorators;
    let _getMyBlocks_decorators;
    let _createProfessionalBlock_decorators;
    let _deleteProfessionalBlock_decorators;
    let _checkAvailability_decorators;
    var SchedulesController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getSalonSchedule_decorators = [(0, common_1.Get)('salon'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'), (0, swagger_1.ApiOperation)({ summary: 'Obter horário de funcionamento do salão' })];
            _updateSalonSchedule_decorators = [(0, common_1.Put)('salon/:dayOfWeek'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'), (0, swagger_1.ApiOperation)({ summary: 'Atualizar horário de um dia específico' })];
            _getProfessionalSchedule_decorators = [(0, common_1.Get)('professional/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST'), (0, swagger_1.ApiOperation)({ summary: 'Obter horário de trabalho do profissional' })];
            _getMySchedule_decorators = [(0, common_1.Get)('my-schedule'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST'), (0, swagger_1.ApiOperation)({ summary: 'Obter meu horário de trabalho' })];
            _updateProfessionalSchedule_decorators = [(0, common_1.Put)('professional/:id/:dayOfWeek'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST'), (0, swagger_1.ApiOperation)({ summary: 'Atualizar horário de trabalho do profissional' })];
            _getProfessionalBlocks_decorators = [(0, common_1.Get)('professional/:id/blocks'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST'), (0, swagger_1.ApiOperation)({ summary: 'Listar bloqueios do profissional' }), (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }), (0, swagger_1.ApiQuery)({ name: 'endDate', required: false })];
            _getMyBlocks_decorators = [(0, common_1.Get)('my-blocks'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST'), (0, swagger_1.ApiOperation)({ summary: 'Listar meus bloqueios' }), (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }), (0, swagger_1.ApiQuery)({ name: 'endDate', required: false })];
            _createProfessionalBlock_decorators = [(0, common_1.Post)('professional/:id/blocks'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST'), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED), (0, swagger_1.ApiOperation)({ summary: 'Criar bloqueio para o profissional' })];
            _deleteProfessionalBlock_decorators = [(0, common_1.Delete)('blocks/:blockId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST'), (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT), (0, swagger_1.ApiOperation)({ summary: 'Remover bloqueio' })];
            _checkAvailability_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('check-availability'), (0, swagger_1.ApiOperation)({ summary: 'Verificar disponibilidade para agendamento' }), (0, swagger_1.ApiQuery)({ name: 'salonId', required: true }), (0, swagger_1.ApiQuery)({ name: 'professionalId', required: true }), (0, swagger_1.ApiQuery)({ name: 'date', required: true, description: 'Formato: YYYY-MM-DD' }), (0, swagger_1.ApiQuery)({ name: 'startTime', required: true, description: 'Formato: HH:MM' }), (0, swagger_1.ApiQuery)({ name: 'durationMinutes', required: true })];
            __esDecorate(this, null, _getSalonSchedule_decorators, { kind: "method", name: "getSalonSchedule", static: false, private: false, access: { has: obj => "getSalonSchedule" in obj, get: obj => obj.getSalonSchedule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateSalonSchedule_decorators, { kind: "method", name: "updateSalonSchedule", static: false, private: false, access: { has: obj => "updateSalonSchedule" in obj, get: obj => obj.updateSalonSchedule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getProfessionalSchedule_decorators, { kind: "method", name: "getProfessionalSchedule", static: false, private: false, access: { has: obj => "getProfessionalSchedule" in obj, get: obj => obj.getProfessionalSchedule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getMySchedule_decorators, { kind: "method", name: "getMySchedule", static: false, private: false, access: { has: obj => "getMySchedule" in obj, get: obj => obj.getMySchedule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateProfessionalSchedule_decorators, { kind: "method", name: "updateProfessionalSchedule", static: false, private: false, access: { has: obj => "updateProfessionalSchedule" in obj, get: obj => obj.updateProfessionalSchedule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getProfessionalBlocks_decorators, { kind: "method", name: "getProfessionalBlocks", static: false, private: false, access: { has: obj => "getProfessionalBlocks" in obj, get: obj => obj.getProfessionalBlocks }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getMyBlocks_decorators, { kind: "method", name: "getMyBlocks", static: false, private: false, access: { has: obj => "getMyBlocks" in obj, get: obj => obj.getMyBlocks }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createProfessionalBlock_decorators, { kind: "method", name: "createProfessionalBlock", static: false, private: false, access: { has: obj => "createProfessionalBlock" in obj, get: obj => obj.createProfessionalBlock }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteProfessionalBlock_decorators, { kind: "method", name: "deleteProfessionalBlock", static: false, private: false, access: { has: obj => "deleteProfessionalBlock" in obj, get: obj => obj.deleteProfessionalBlock }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkAvailability_decorators, { kind: "method", name: "checkAvailability", static: false, private: false, access: { has: obj => "checkAvailability" in obj, get: obj => obj.checkAvailability }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SchedulesController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        schedulesService = __runInitializers(this, _instanceExtraInitializers);
        constructor(schedulesService) {
            this.schedulesService = schedulesService;
        }
        // ==================== SALON SCHEDULES ====================
        async getSalonSchedule(user) {
            return this.schedulesService.getSalonSchedule(user.salonId);
        }
        async updateSalonSchedule(user, dayOfWeek, data) {
            return this.schedulesService.updateSalonSchedule(user.salonId, parseInt(dayOfWeek, 10), data);
        }
        // ==================== PROFESSIONAL SCHEDULES ====================
        async getProfessionalSchedule(user, professionalId) {
            // STYLIST só pode ver próprio horário
            if (user.role === 'STYLIST' && user.sub !== professionalId) {
                professionalId = user.sub;
            }
            return this.schedulesService.getProfessionalSchedule(professionalId);
        }
        async getMySchedule(user) {
            const schedule = await this.schedulesService.getProfessionalSchedule(user.sub);
            // Se não tem horário, inicializar com padrão do salão
            if (schedule.length === 0) {
                await this.schedulesService.initializeProfessionalSchedule(user.sub, user.salonId);
                return this.schedulesService.getProfessionalSchedule(user.sub);
            }
            return schedule;
        }
        async updateProfessionalSchedule(user, professionalId, dayOfWeek, data) {
            // STYLIST só pode editar próprio horário
            if (user.role === 'STYLIST' && user.sub !== professionalId) {
                professionalId = user.sub;
            }
            return this.schedulesService.updateProfessionalSchedule(professionalId, parseInt(dayOfWeek, 10), data);
        }
        // ==================== PROFESSIONAL BLOCKS ====================
        async getProfessionalBlocks(user, professionalId, startDate, endDate) {
            // STYLIST só pode ver próprios bloqueios
            if (user.role === 'STYLIST' && user.sub !== professionalId) {
                professionalId = user.sub;
            }
            return this.schedulesService.getProfessionalBlocks(professionalId, startDate, endDate);
        }
        async getMyBlocks(user, startDate, endDate) {
            return this.schedulesService.getProfessionalBlocks(user.sub, startDate, endDate);
        }
        async createProfessionalBlock(user, professionalId, data) {
            // STYLIST só pode criar bloqueio para si mesmo
            if (user.role === 'STYLIST' && user.sub !== professionalId) {
                professionalId = user.sub;
            }
            return this.schedulesService.createProfessionalBlock(professionalId, user.salonId, user.sub, data);
        }
        async deleteProfessionalBlock(blockId) {
            await this.schedulesService.deleteProfessionalBlock(blockId);
        }
        // ==================== AVAILABILITY CHECK ====================
        async checkAvailability(salonId, professionalId, date, startTime, durationMinutes) {
            return this.schedulesService.checkAvailability(salonId, professionalId, date, startTime, parseInt(durationMinutes, 10));
        }
    };
    return SchedulesController = _classThis;
})();
exports.SchedulesController = SchedulesController;
//# sourceMappingURL=schedules.controller.js.map