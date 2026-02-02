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
exports.TriageController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let TriageController = (() => {
    let _classDecorators = [(0, common_1.Controller)('triage')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _listForms_decorators;
    let _getForm_decorators;
    let _getFormForService_decorators;
    let _getTriageForAppointment_decorators;
    let _canStartAppointment_decorators;
    let _createTriageResponse_decorators;
    let _createTriageOverride_decorators;
    let _getPublicForm_decorators;
    let _submitPublicForm_decorators;
    var TriageController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _listForms_decorators = [(0, throttler_1.SkipThrottle)(), (0, common_1.Get)('forms')];
            _getForm_decorators = [(0, throttler_1.SkipThrottle)(), (0, common_1.Get)('forms/:formId')];
            _getFormForService_decorators = [(0, throttler_1.SkipThrottle)(), (0, common_1.Get)('service/:serviceId')];
            _getTriageForAppointment_decorators = [(0, throttler_1.SkipThrottle)(), (0, common_1.Get)('appointment/:appointmentId')];
            _canStartAppointment_decorators = [(0, throttler_1.SkipThrottle)(), (0, common_1.Get)('appointment/:appointmentId/can-start')];
            _createTriageResponse_decorators = [(0, common_1.Post)('create'), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED)];
            _createTriageOverride_decorators = [(0, common_1.Post)('appointment/:appointmentId/override'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
            _getPublicForm_decorators = [(0, public_decorator_1.Public)(), (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }), (0, common_1.Get)('public/:token')];
            _submitPublicForm_decorators = [(0, public_decorator_1.Public)(), (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }), (0, common_1.Post)('public/:token/submit'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
            __esDecorate(this, null, _listForms_decorators, { kind: "method", name: "listForms", static: false, private: false, access: { has: obj => "listForms" in obj, get: obj => obj.listForms }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getForm_decorators, { kind: "method", name: "getForm", static: false, private: false, access: { has: obj => "getForm" in obj, get: obj => obj.getForm }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getFormForService_decorators, { kind: "method", name: "getFormForService", static: false, private: false, access: { has: obj => "getFormForService" in obj, get: obj => obj.getFormForService }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getTriageForAppointment_decorators, { kind: "method", name: "getTriageForAppointment", static: false, private: false, access: { has: obj => "getTriageForAppointment" in obj, get: obj => obj.getTriageForAppointment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _canStartAppointment_decorators, { kind: "method", name: "canStartAppointment", static: false, private: false, access: { has: obj => "canStartAppointment" in obj, get: obj => obj.canStartAppointment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createTriageResponse_decorators, { kind: "method", name: "createTriageResponse", static: false, private: false, access: { has: obj => "createTriageResponse" in obj, get: obj => obj.createTriageResponse }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createTriageOverride_decorators, { kind: "method", name: "createTriageOverride", static: false, private: false, access: { has: obj => "createTriageOverride" in obj, get: obj => obj.createTriageOverride }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPublicForm_decorators, { kind: "method", name: "getPublicForm", static: false, private: false, access: { has: obj => "getPublicForm" in obj, get: obj => obj.getPublicForm }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _submitPublicForm_decorators, { kind: "method", name: "submitPublicForm", static: false, private: false, access: { has: obj => "submitPublicForm" in obj, get: obj => obj.submitPublicForm }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TriageController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        triageService = __runInitializers(this, _instanceExtraInitializers);
        constructor(triageService) {
            this.triageService = triageService;
        }
        // ==================== ROTAS AUTENTICADAS ====================
        /**
         * Lista todos os formulários do salão
         */
        async listForms(req) {
            const salonId = req.user.salonId;
            return this.triageService.listForms(salonId);
        }
        /**
         * Busca formulário com perguntas
         */
        async getForm(formId) {
            return this.triageService.getFormWithQuestions(formId);
        }
        /**
         * Busca formulário para um serviço específico
         */
        async getFormForService(req, serviceId) {
            const salonId = req.user.salonId;
            const form = await this.triageService.getFormForService(salonId, parseInt(serviceId));
            if (!form) {
                return { form: null, message: 'Nenhum formulário de triagem configurado para este serviço' };
            }
            return this.triageService.getFormWithQuestions(form.id);
        }
        /**
         * Busca triagem de um agendamento
         */
        async getTriageForAppointment(appointmentId) {
            const triage = await this.triageService.getTriageForAppointment(appointmentId);
            if (!triage) {
                return { triage: null, message: 'Nenhuma triagem encontrada para este agendamento' };
            }
            return triage;
        }
        /**
         * Verifica se pode iniciar atendimento
         */
        async canStartAppointment(appointmentId) {
            return this.triageService.canStartAppointment(appointmentId);
        }
        /**
         * Cria resposta de triagem para agendamento
         */
        async createTriageResponse(req, body) {
            const salonId = req.user.salonId;
            if (!body.appointmentId || !body.formId) {
                throw new common_1.BadRequestException('appointmentId e formId são obrigatórios');
            }
            return this.triageService.createTriageResponse(salonId, body.appointmentId, body.formId, body.clientId);
        }
        /**
         * Cria override de triagem (libera bloqueio)
         * CRÍTICO: Requer justificativa mínima de 20 caracteres
         */
        async createTriageOverride(appointmentId, body, req, ip) {
            const user = req.user;
            if (!body.reason || body.reason.length < 20) {
                throw new common_1.BadRequestException('Justificativa obrigatória (mínimo 20 caracteres)');
            }
            await this.triageService.createTriageOverride(appointmentId, body.reason, user.id, user.name, user.role, ip);
            return {
                success: true,
                message: 'Bloqueio liberado. Esta ação foi registrada.',
            };
        }
        // ==================== ROTAS PÚBLICAS (SEM AUTENTICAÇÃO) ====================
        /**
         * Busca formulário por token público
         * RATE LIMIT: 5 requests por minuto por IP
         */
        async getPublicForm(token, ip, userAgent) {
            const result = await this.triageService.getResponseByToken(token, ip, userAgent);
            if (!result) {
                return {
                    error: true,
                    message: 'Formulário não encontrado ou link inválido',
                };
            }
            const { response, form } = result;
            // Se já foi completado
            if (response.status === 'COMPLETED') {
                return {
                    completed: true,
                    message: 'Este formulário já foi preenchido',
                    completedAt: response.completedAt,
                };
            }
            return {
                response: {
                    id: response.id,
                    status: response.status,
                    expiresAt: response.expiresAt,
                },
                form,
            };
        }
        /**
         * Submete respostas via token público
         * RATE LIMIT: 3 requests por minuto por IP
         */
        async submitPublicForm(token, body, ip, userAgent) {
            if (!body.answers || !Array.isArray(body.answers)) {
                throw new common_1.BadRequestException('answers é obrigatório e deve ser um array');
            }
            if (body.answers.length === 0) {
                throw new common_1.BadRequestException('É necessário responder pelo menos uma pergunta');
            }
            const result = await this.triageService.submitTriageAnswers(token, body.answers, body.consentAccepted, ip, userAgent);
            return {
                success: result.success,
                hasRisks: result.hasRisks,
                overallRiskLevel: result.overallRiskLevel,
                canProceed: result.canProceed,
                blockers: result.blockers,
                message: result.message,
            };
        }
    };
    return TriageController = _classThis;
})();
exports.TriageController = TriageController;
//# sourceMappingURL=triage.controller.js.map