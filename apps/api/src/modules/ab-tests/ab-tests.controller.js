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
exports.ABTestsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let ABTestsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('ab-tests'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getTests_decorators;
    let _getStats_decorators;
    let _getTest_decorators;
    let _getAssignments_decorators;
    let _createTest_decorators;
    let _updateTest_decorators;
    let _startTest_decorators;
    let _pauseTest_decorators;
    let _completeTest_decorators;
    let _deleteTest_decorators;
    let _assignVariant_decorators;
    let _recordConversion_decorators;
    var ABTestsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getTests_decorators = [(0, common_1.Get)(), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getStats_decorators = [(0, common_1.Get)('stats'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getTest_decorators = [(0, common_1.Get)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getAssignments_decorators = [(0, common_1.Get)(':id/assignments'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _createTest_decorators = [(0, common_1.Post)(), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _updateTest_decorators = [(0, common_1.Patch)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _startTest_decorators = [(0, common_1.Post)(':id/start'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _pauseTest_decorators = [(0, common_1.Post)(':id/pause'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _completeTest_decorators = [(0, common_1.Post)(':id/complete'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _deleteTest_decorators = [(0, common_1.Delete)(':id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _assignVariant_decorators = [(0, common_1.Post)(':id/assign'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _recordConversion_decorators = [(0, common_1.Post)('convert'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            __esDecorate(this, null, _getTests_decorators, { kind: "method", name: "getTests", static: false, private: false, access: { has: obj => "getTests" in obj, get: obj => obj.getTests }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getTest_decorators, { kind: "method", name: "getTest", static: false, private: false, access: { has: obj => "getTest" in obj, get: obj => obj.getTest }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAssignments_decorators, { kind: "method", name: "getAssignments", static: false, private: false, access: { has: obj => "getAssignments" in obj, get: obj => obj.getAssignments }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createTest_decorators, { kind: "method", name: "createTest", static: false, private: false, access: { has: obj => "createTest" in obj, get: obj => obj.createTest }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateTest_decorators, { kind: "method", name: "updateTest", static: false, private: false, access: { has: obj => "updateTest" in obj, get: obj => obj.updateTest }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _startTest_decorators, { kind: "method", name: "startTest", static: false, private: false, access: { has: obj => "startTest" in obj, get: obj => obj.startTest }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _pauseTest_decorators, { kind: "method", name: "pauseTest", static: false, private: false, access: { has: obj => "pauseTest" in obj, get: obj => obj.pauseTest }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _completeTest_decorators, { kind: "method", name: "completeTest", static: false, private: false, access: { has: obj => "completeTest" in obj, get: obj => obj.completeTest }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteTest_decorators, { kind: "method", name: "deleteTest", static: false, private: false, access: { has: obj => "deleteTest" in obj, get: obj => obj.deleteTest }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _assignVariant_decorators, { kind: "method", name: "assignVariant", static: false, private: false, access: { has: obj => "assignVariant" in obj, get: obj => obj.assignVariant }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _recordConversion_decorators, { kind: "method", name: "recordConversion", static: false, private: false, access: { has: obj => "recordConversion" in obj, get: obj => obj.recordConversion }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ABTestsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        abTestsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(abTestsService) {
            this.abTestsService = abTestsService;
        }
        async getTests(req, page, limit, status, testType) {
            return this.abTestsService.getTests(req.user.salonId, {
                page: page ? parseInt(page, 10) : undefined,
                limit: limit ? parseInt(limit, 10) : undefined,
                status,
                testType,
            });
        }
        async getStats(req) {
            return this.abTestsService.getStats(req.user.salonId);
        }
        async getTest(req, id) {
            return this.abTestsService.getTestById(req.user.salonId, id);
        }
        async getAssignments(req, id, page, limit, converted) {
            return this.abTestsService.getAssignments(req.user.salonId, id, {
                page: page ? parseInt(page, 10) : undefined,
                limit: limit ? parseInt(limit, 10) : undefined,
                converted: converted !== undefined ? converted === 'true' : undefined,
            });
        }
        async createTest(req, dto) {
            return this.abTestsService.createTest(req.user.salonId, dto);
        }
        async updateTest(req, id, dto) {
            return this.abTestsService.updateTest(req.user.salonId, id, dto);
        }
        async startTest(req, id) {
            return this.abTestsService.startTest(req.user.salonId, id);
        }
        async pauseTest(req, id) {
            return this.abTestsService.pauseTest(req.user.salonId, id);
        }
        async completeTest(req, id) {
            return this.abTestsService.completeTest(req.user.salonId, id);
        }
        async deleteTest(req, id) {
            await this.abTestsService.deleteTest(req.user.salonId, id);
            return { success: true };
        }
        // ==================== VARIANT ASSIGNMENT ====================
        async assignVariant(req, id, body) {
            return this.abTestsService.assignVariant(req.user.salonId, id, body.clientId, body.clientPhone);
        }
        async recordConversion(req, dto) {
            await this.abTestsService.recordConversion(req.user.salonId, dto);
            return { success: true };
        }
    };
    return ABTestsController = _classThis;
})();
exports.ABTestsController = ABTestsController;
//# sourceMappingURL=ab-tests.controller.js.map