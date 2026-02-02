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
exports.AppointmentsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let AppointmentsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('appointments'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _getKPIs_decorators;
    let _findByDay_decorators;
    let _findByWeek_decorators;
    let _findByMonth_decorators;
    let _findByProfessional_decorators;
    let _findByClient_decorators;
    let _findById_decorators;
    let _create_decorators;
    let _update_decorators;
    let _cancel_decorators;
    let _getAvailableSlots_decorators;
    let _checkAvailability_decorators;
    let _findNextAvailable_decorators;
    let _confirm_decorators;
    let _start_decorators;
    let _complete_decorators;
    let _noShow_decorators;
    let _reschedule_decorators;
    let _convertToCommand_decorators;
    let _getBlocks_decorators;
    let _getMyBlocks_decorators;
    let _getBlockById_decorators;
    let _createBlock_decorators;
    let _updateBlock_decorators;
    let _deleteBlock_decorators;
    let _approveBlock_decorators;
    let _rejectBlock_decorators;
    let _getWorkingHours_decorators;
    let _setWorkingHours_decorators;
    let _updateWorkingHour_decorators;
    var AppointmentsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, common_1.Get)(), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getKPIs_decorators = [(0, common_1.Get)('kpis'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _findByDay_decorators = [(0, common_1.Get)('day/:date'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _findByWeek_decorators = [(0, common_1.Get)('week/:startDate'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _findByMonth_decorators = [(0, common_1.Get)('month/:year/:month'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _findByProfessional_decorators = [(0, common_1.Get)('professional/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _findByClient_decorators = [(0, common_1.Get)('client/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _findById_decorators = [(0, common_1.Get)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _create_decorators = [(0, common_1.Post)(), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _update_decorators = [(0, common_1.Patch)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _cancel_decorators = [(0, common_1.Delete)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _getAvailableSlots_decorators = [(0, common_1.Get)('availability/:professionalId/:date'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _checkAvailability_decorators = [(0, common_1.Post)('check-availability'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _findNextAvailable_decorators = [(0, common_1.Get)('next-available/:serviceId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _confirm_decorators = [(0, common_1.Post)(':id/confirm'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _start_decorators = [(0, common_1.Post)(':id/start'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _complete_decorators = [(0, common_1.Post)(':id/complete'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _noShow_decorators = [(0, common_1.Post)(':id/no-show'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _reschedule_decorators = [(0, common_1.Post)(':id/reschedule'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _convertToCommand_decorators = [(0, common_1.Post)(':id/convert-to-command'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _getBlocks_decorators = [(0, common_1.Get)('blocks'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getMyBlocks_decorators = [(0, common_1.Get)('blocks/my'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getBlockById_decorators = [(0, common_1.Get)('blocks/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _createBlock_decorators = [(0, common_1.Post)('blocks'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _updateBlock_decorators = [(0, common_1.Patch)('blocks/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _deleteBlock_decorators = [(0, common_1.Delete)('blocks/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'STYLIST')];
            _approveBlock_decorators = [(0, common_1.Post)('blocks/:id/approve'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _rejectBlock_decorators = [(0, common_1.Post)('blocks/:id/reject'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getWorkingHours_decorators = [(0, common_1.Get)('working-hours/:professionalId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _setWorkingHours_decorators = [(0, common_1.Post)('working-hours'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _updateWorkingHour_decorators = [(0, common_1.Patch)('working-hours/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getKPIs_decorators, { kind: "method", name: "getKPIs", static: false, private: false, access: { has: obj => "getKPIs" in obj, get: obj => obj.getKPIs }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByDay_decorators, { kind: "method", name: "findByDay", static: false, private: false, access: { has: obj => "findByDay" in obj, get: obj => obj.findByDay }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByWeek_decorators, { kind: "method", name: "findByWeek", static: false, private: false, access: { has: obj => "findByWeek" in obj, get: obj => obj.findByWeek }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByMonth_decorators, { kind: "method", name: "findByMonth", static: false, private: false, access: { has: obj => "findByMonth" in obj, get: obj => obj.findByMonth }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByProfessional_decorators, { kind: "method", name: "findByProfessional", static: false, private: false, access: { has: obj => "findByProfessional" in obj, get: obj => obj.findByProfessional }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByClient_decorators, { kind: "method", name: "findByClient", static: false, private: false, access: { has: obj => "findByClient" in obj, get: obj => obj.findByClient }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cancel_decorators, { kind: "method", name: "cancel", static: false, private: false, access: { has: obj => "cancel" in obj, get: obj => obj.cancel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAvailableSlots_decorators, { kind: "method", name: "getAvailableSlots", static: false, private: false, access: { has: obj => "getAvailableSlots" in obj, get: obj => obj.getAvailableSlots }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkAvailability_decorators, { kind: "method", name: "checkAvailability", static: false, private: false, access: { has: obj => "checkAvailability" in obj, get: obj => obj.checkAvailability }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findNextAvailable_decorators, { kind: "method", name: "findNextAvailable", static: false, private: false, access: { has: obj => "findNextAvailable" in obj, get: obj => obj.findNextAvailable }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _confirm_decorators, { kind: "method", name: "confirm", static: false, private: false, access: { has: obj => "confirm" in obj, get: obj => obj.confirm }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _start_decorators, { kind: "method", name: "start", static: false, private: false, access: { has: obj => "start" in obj, get: obj => obj.start }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _complete_decorators, { kind: "method", name: "complete", static: false, private: false, access: { has: obj => "complete" in obj, get: obj => obj.complete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _noShow_decorators, { kind: "method", name: "noShow", static: false, private: false, access: { has: obj => "noShow" in obj, get: obj => obj.noShow }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _reschedule_decorators, { kind: "method", name: "reschedule", static: false, private: false, access: { has: obj => "reschedule" in obj, get: obj => obj.reschedule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _convertToCommand_decorators, { kind: "method", name: "convertToCommand", static: false, private: false, access: { has: obj => "convertToCommand" in obj, get: obj => obj.convertToCommand }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getBlocks_decorators, { kind: "method", name: "getBlocks", static: false, private: false, access: { has: obj => "getBlocks" in obj, get: obj => obj.getBlocks }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getMyBlocks_decorators, { kind: "method", name: "getMyBlocks", static: false, private: false, access: { has: obj => "getMyBlocks" in obj, get: obj => obj.getMyBlocks }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getBlockById_decorators, { kind: "method", name: "getBlockById", static: false, private: false, access: { has: obj => "getBlockById" in obj, get: obj => obj.getBlockById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createBlock_decorators, { kind: "method", name: "createBlock", static: false, private: false, access: { has: obj => "createBlock" in obj, get: obj => obj.createBlock }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateBlock_decorators, { kind: "method", name: "updateBlock", static: false, private: false, access: { has: obj => "updateBlock" in obj, get: obj => obj.updateBlock }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteBlock_decorators, { kind: "method", name: "deleteBlock", static: false, private: false, access: { has: obj => "deleteBlock" in obj, get: obj => obj.deleteBlock }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _approveBlock_decorators, { kind: "method", name: "approveBlock", static: false, private: false, access: { has: obj => "approveBlock" in obj, get: obj => obj.approveBlock }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _rejectBlock_decorators, { kind: "method", name: "rejectBlock", static: false, private: false, access: { has: obj => "rejectBlock" in obj, get: obj => obj.rejectBlock }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getWorkingHours_decorators, { kind: "method", name: "getWorkingHours", static: false, private: false, access: { has: obj => "getWorkingHours" in obj, get: obj => obj.getWorkingHours }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setWorkingHours_decorators, { kind: "method", name: "setWorkingHours", static: false, private: false, access: { has: obj => "setWorkingHours" in obj, get: obj => obj.setWorkingHours }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateWorkingHour_decorators, { kind: "method", name: "updateWorkingHour", static: false, private: false, access: { has: obj => "updateWorkingHour" in obj, get: obj => obj.updateWorkingHour }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AppointmentsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        appointmentsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(appointmentsService) {
            this.appointmentsService = appointmentsService;
        }
        // ==================== APPOINTMENTS CRUD ====================
        /**
         * GET /appointments - Lista agendamentos com filtros
         */
        async findAll(user, filters) {
            // Stylists can only see their own appointments
            if (user.role === 'STYLIST') {
                filters.professionalId = user.id;
            }
            return this.appointmentsService.findAll(user.salonId, filters);
        }
        /**
         * GET /appointments/kpis - KPIs de agendamentos
         */
        async getKPIs(user, startDate, endDate) {
            return this.appointmentsService.calculateKPIs(user.salonId, startDate, endDate);
        }
        /**
         * GET /appointments/day/:date - Agenda do dia
         */
        async findByDay(user, date) {
            return this.appointmentsService.findByDay(user.salonId, date);
        }
        /**
         * GET /appointments/week/:startDate - Agenda da semana
         */
        async findByWeek(user, startDate) {
            return this.appointmentsService.findByWeek(user.salonId, startDate);
        }
        /**
         * GET /appointments/month/:year/:month - Agenda do mês
         */
        async findByMonth(user, year, month) {
            return this.appointmentsService.findByMonth(user.salonId, year, month);
        }
        /**
         * GET /appointments/professional/:id - Agendamentos de um profissional
         */
        async findByProfessional(user, professionalId, date) {
            // Stylists can only see their own
            if (user.role === 'STYLIST' && professionalId !== user.id) {
                return this.appointmentsService.findByProfessional(user.id, user.salonId, date);
            }
            return this.appointmentsService.findByProfessional(professionalId, user.salonId, date);
        }
        /**
         * GET /appointments/client/:id - Agendamentos de um cliente
         */
        async findByClient(user, clientId) {
            return this.appointmentsService.findByClient(clientId, user.salonId);
        }
        /**
         * GET /appointments/:id - Detalhes do agendamento
         */
        async findById(user, id) {
            const appointment = await this.appointmentsService.findById(id, user.salonId);
            if (!appointment) {
                throw new common_1.NotFoundException('Agendamento não encontrado');
            }
            return appointment;
        }
        /**
         * POST /appointments - Criar agendamento
         */
        async create(user, dto) {
            return this.appointmentsService.create(user.salonId, dto, user.id);
        }
        /**
         * PATCH /appointments/:id - Atualizar agendamento
         */
        async update(user, id, dto) {
            const result = await this.appointmentsService.update(id, user.salonId, dto, user.id);
            if (!result) {
                throw new common_1.NotFoundException('Agendamento não encontrado');
            }
            return result;
        }
        /**
         * DELETE /appointments/:id - Cancelar agendamento
         */
        async cancel(user, id, dto) {
            const result = await this.appointmentsService.cancel(id, user.salonId, user.id, dto.reason);
            if (!result) {
                throw new common_1.NotFoundException('Agendamento não encontrado');
            }
            return result;
        }
        // ==================== AVAILABILITY ====================
        /**
         * GET /appointments/availability/:professionalId/:date - Horários disponíveis
         */
        async getAvailableSlots(user, professionalId, date, serviceId) {
            return this.appointmentsService.getAvailableSlots(professionalId, user.salonId, date, serviceId ? parseInt(serviceId) : undefined);
        }
        /**
         * POST /appointments/check-availability - Verificar disponibilidade
         */
        async checkAvailability(user, dto) {
            return this.appointmentsService.checkAvailability(user.salonId, dto.professionalId, dto.date, dto.startTime, dto.duration);
        }
        /**
         * GET /appointments/next-available/:serviceId - Próximo horário disponível
         */
        async findNextAvailable(user, serviceId, professionalId) {
            return this.appointmentsService.findNextAvailable(serviceId, user.salonId, professionalId);
        }
        // ==================== STATUS TRANSITIONS ====================
        /**
         * POST /appointments/:id/confirm - Confirmar agendamento
         */
        async confirm(user, id, via) {
            const result = await this.appointmentsService.confirm(id, user.salonId, via);
            if (!result) {
                throw new common_1.NotFoundException('Agendamento não encontrado');
            }
            return result;
        }
        /**
         * POST /appointments/:id/start - Iniciar atendimento
         */
        async start(user, id) {
            const result = await this.appointmentsService.start(id, user.salonId);
            if (!result) {
                throw new common_1.NotFoundException('Agendamento não encontrado');
            }
            return result;
        }
        /**
         * POST /appointments/:id/complete - Finalizar atendimento
         */
        async complete(user, id) {
            const result = await this.appointmentsService.complete(id, user.salonId);
            if (!result) {
                throw new common_1.NotFoundException('Agendamento não encontrado');
            }
            return result;
        }
        /**
         * POST /appointments/:id/no-show - Marcar como não compareceu
         */
        async noShow(user, id) {
            const result = await this.appointmentsService.noShow(id, user.salonId);
            if (!result) {
                throw new common_1.NotFoundException('Agendamento não encontrado');
            }
            return result;
        }
        /**
         * POST /appointments/:id/reschedule - Reagendar
         */
        async reschedule(user, id, dto) {
            const result = await this.appointmentsService.reschedule(id, user.salonId, dto.date, dto.time, dto.professionalId, user.id);
            if (!result) {
                throw new common_1.NotFoundException('Agendamento não encontrado');
            }
            return result;
        }
        /**
         * POST /appointments/:id/convert-to-command - Converter em comanda
         */
        async convertToCommand(user, id) {
            return this.appointmentsService.convertToCommand(id, user.salonId, user.id);
        }
        // ==================== BLOCKS/FOLGAS ====================
        /**
         * GET /appointments/blocks - Lista bloqueios
         */
        async getBlocks(user, filters) {
            // Stylists can only see their own blocks
            if (user.role === 'STYLIST') {
                filters.professionalId = user.id;
            }
            return this.appointmentsService.getBlocks(user.salonId, filters);
        }
        /**
         * GET /appointments/blocks/my - Meus bloqueios (profissional)
         */
        async getMyBlocks(user, filters) {
            return this.appointmentsService.getBlocks(user.salonId, {
                ...filters,
                professionalId: user.id,
            });
        }
        /**
         * GET /appointments/blocks/:id - Detalhes do bloqueio
         */
        async getBlockById(user, id) {
            const block = await this.appointmentsService.getBlockById(id, user.salonId);
            if (!block) {
                throw new common_1.NotFoundException('Bloqueio não encontrado');
            }
            return block;
        }
        /**
         * POST /appointments/blocks - Criar bloqueio
         */
        async createBlock(user, dto) {
            // Stylists can only create blocks for themselves
            if (user.role === 'STYLIST') {
                dto.professionalId = user.id;
                dto.requiresApproval = true;
            }
            return this.appointmentsService.createBlock(user.salonId, dto, user.id);
        }
        /**
         * PATCH /appointments/blocks/:id - Atualizar bloqueio
         */
        async updateBlock(user, id, dto) {
            const result = await this.appointmentsService.updateBlock(id, user.salonId, dto);
            if (!result) {
                throw new common_1.NotFoundException('Bloqueio não encontrado');
            }
            return result;
        }
        /**
         * DELETE /appointments/blocks/:id - Remover bloqueio
         */
        async deleteBlock(user, id) {
            // Stylists can only delete their own blocks
            if (user.role === 'STYLIST') {
                const block = await this.appointmentsService.getBlockById(id, user.salonId);
                if (block && block.professionalId !== user.id) {
                    throw new common_1.NotFoundException('Bloqueio não encontrado');
                }
            }
            const result = await this.appointmentsService.deleteBlock(id, user.salonId);
            if (!result) {
                throw new common_1.NotFoundException('Bloqueio não encontrado');
            }
            return { success: true };
        }
        /**
         * POST /appointments/blocks/:id/approve - Aprovar bloqueio
         */
        async approveBlock(user, id) {
            const result = await this.appointmentsService.approveBlock(id, user.salonId, user.id);
            if (!result) {
                throw new common_1.NotFoundException('Bloqueio não encontrado');
            }
            return result;
        }
        /**
         * POST /appointments/blocks/:id/reject - Rejeitar bloqueio
         */
        async rejectBlock(user, id, dto) {
            const result = await this.appointmentsService.rejectBlock(id, user.salonId, dto.reason);
            if (!result) {
                throw new common_1.NotFoundException('Bloqueio não encontrado');
            }
            return result;
        }
        // ==================== WORKING HOURS ====================
        /**
         * GET /appointments/working-hours/:professionalId - Horários de trabalho
         */
        async getWorkingHours(user, professionalId) {
            return this.appointmentsService.getWorkingHours(professionalId, user.salonId);
        }
        /**
         * POST /appointments/working-hours - Definir horários de trabalho
         */
        async setWorkingHours(user, dto) {
            return this.appointmentsService.setWorkingHours(dto.professionalId, user.salonId, dto.hours);
        }
        /**
         * PATCH /appointments/working-hours/:id - Atualizar horário específico
         */
        async updateWorkingHour(user, id, dto) {
            const result = await this.appointmentsService.updateWorkingHour(id, user.salonId, dto);
            if (!result) {
                throw new common_1.NotFoundException('Horário não encontrado');
            }
            return result;
        }
    };
    return AppointmentsController = _classThis;
})();
exports.AppointmentsController = AppointmentsController;
//# sourceMappingURL=appointments.controller.js.map