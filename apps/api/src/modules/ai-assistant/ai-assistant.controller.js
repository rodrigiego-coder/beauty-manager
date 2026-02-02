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
exports.AIAssistantController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
let AIAssistantController = (() => {
    let _classDecorators = [(0, common_1.Controller)('ai-assistant'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getBriefing_decorators;
    let _chat_decorators;
    let _getChatHistory_decorators;
    let _clearChatHistory_decorators;
    let _getClientInsight_decorators;
    let _getClientNotes_decorators;
    let _createClientNote_decorators;
    let _deleteClientNote_decorators;
    let _getInsights_decorators;
    let _dismissInsight_decorators;
    let _getSettings_decorators;
    let _updateSettings_decorators;
    let _getStatus_decorators;
    var AIAssistantController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getBriefing_decorators = [(0, common_1.Get)('briefing'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _chat_decorators = [(0, common_1.Post)('chat'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getChatHistory_decorators = [(0, common_1.Get)('chat/history'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _clearChatHistory_decorators = [(0, common_1.Delete)('chat/history'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getClientInsight_decorators = [(0, common_1.Get)('client/:clientId/insight'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getClientNotes_decorators = [(0, common_1.Get)('client/:clientId/notes'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _createClientNote_decorators = [(0, common_1.Post)('client/notes'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _deleteClientNote_decorators = [(0, common_1.Delete)('client/notes/:noteId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getInsights_decorators = [(0, common_1.Get)('insights'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _dismissInsight_decorators = [(0, common_1.Post)('insights/:id/dismiss'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getSettings_decorators = [(0, common_1.Get)('settings'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _updateSettings_decorators = [(0, common_1.Patch)('settings'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getStatus_decorators = [(0, common_1.Get)('status'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            __esDecorate(this, null, _getBriefing_decorators, { kind: "method", name: "getBriefing", static: false, private: false, access: { has: obj => "getBriefing" in obj, get: obj => obj.getBriefing }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _chat_decorators, { kind: "method", name: "chat", static: false, private: false, access: { has: obj => "chat" in obj, get: obj => obj.chat }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getChatHistory_decorators, { kind: "method", name: "getChatHistory", static: false, private: false, access: { has: obj => "getChatHistory" in obj, get: obj => obj.getChatHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _clearChatHistory_decorators, { kind: "method", name: "clearChatHistory", static: false, private: false, access: { has: obj => "clearChatHistory" in obj, get: obj => obj.clearChatHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getClientInsight_decorators, { kind: "method", name: "getClientInsight", static: false, private: false, access: { has: obj => "getClientInsight" in obj, get: obj => obj.getClientInsight }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getClientNotes_decorators, { kind: "method", name: "getClientNotes", static: false, private: false, access: { has: obj => "getClientNotes" in obj, get: obj => obj.getClientNotes }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createClientNote_decorators, { kind: "method", name: "createClientNote", static: false, private: false, access: { has: obj => "createClientNote" in obj, get: obj => obj.createClientNote }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteClientNote_decorators, { kind: "method", name: "deleteClientNote", static: false, private: false, access: { has: obj => "deleteClientNote" in obj, get: obj => obj.deleteClientNote }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getInsights_decorators, { kind: "method", name: "getInsights", static: false, private: false, access: { has: obj => "getInsights" in obj, get: obj => obj.getInsights }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _dismissInsight_decorators, { kind: "method", name: "dismissInsight", static: false, private: false, access: { has: obj => "dismissInsight" in obj, get: obj => obj.dismissInsight }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSettings_decorators, { kind: "method", name: "getSettings", static: false, private: false, access: { has: obj => "getSettings" in obj, get: obj => obj.getSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateSettings_decorators, { kind: "method", name: "updateSettings", static: false, private: false, access: { has: obj => "updateSettings" in obj, get: obj => obj.updateSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStatus_decorators, { kind: "method", name: "getStatus", static: false, private: false, access: { has: obj => "getStatus" in obj, get: obj => obj.getStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AIAssistantController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        aiService = __runInitializers(this, _instanceExtraInitializers);
        constructor(aiService) {
            this.aiService = aiService;
        }
        // ==================== BRIEFING ====================
        async getBriefing(req) {
            const { salonId, id: userId, role, name } = req.user;
            return this.aiService.generateBriefing(salonId, userId, role, name || 'Usuário');
        }
        // ==================== CHAT ====================
        async chat(req, dto) {
            const { salonId, id: userId, role } = req.user;
            const response = await this.aiService.chat(salonId, userId, role, dto.message);
            return { response };
        }
        async getChatHistory(req) {
            const { salonId, id: userId } = req.user;
            return this.aiService.getChatHistory(salonId, userId);
        }
        async clearChatHistory(req) {
            const { salonId, id: userId } = req.user;
            await this.aiService.clearChatHistory(salonId, userId);
            return { success: true };
        }
        // ==================== CLIENT INSIGHT ====================
        async getClientInsight(req, clientId) {
            const { salonId } = req.user;
            const insight = await this.aiService.getClientInsight(salonId, clientId);
            return { insight };
        }
        // ==================== CLIENT NOTES ====================
        async getClientNotes(req, clientId) {
            const { salonId } = req.user;
            const notes = await connection_1.db
                .select()
                .from(schema_1.clientNotesAi)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.clientNotesAi.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.clientNotesAi.clientId, clientId)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.clientNotesAi.createdAt));
            return notes;
        }
        async createClientNote(req, dto) {
            const { salonId, id: userId } = req.user;
            const [note] = await connection_1.db
                .insert(schema_1.clientNotesAi)
                .values({
                salonId,
                clientId: dto.clientId,
                noteType: dto.noteType,
                content: dto.content,
                createdById: userId,
            })
                .returning();
            return note;
        }
        async deleteClientNote(req, noteId) {
            const { salonId } = req.user;
            await connection_1.db
                .delete(schema_1.clientNotesAi)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.clientNotesAi.id, noteId), (0, drizzle_orm_1.eq)(schema_1.clientNotesAi.salonId, salonId)));
            return { success: true };
        }
        // ==================== INSIGHTS ====================
        async getInsights(req) {
            const { salonId, id: userId } = req.user;
            return this.aiService.getInsights(salonId, userId);
        }
        async dismissInsight(id) {
            await this.aiService.dismissInsight(id);
            return { success: true };
        }
        // ==================== SETTINGS ====================
        async getSettings(req) {
            return this.aiService.getSettings(req.user.salonId);
        }
        async updateSettings(req, dto) {
            return this.aiService.updateSettings(req.user.salonId, dto);
        }
        // ==================== STATUS ====================
        async getStatus() {
            // Verifica se a IA está configurada
            const isConfigured = !!process.env.GEMINI_API_KEY;
            return {
                isConfigured,
                model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
                assistantName: 'Belle',
            };
        }
    };
    return AIAssistantController = _classThis;
})();
exports.AIAssistantController = AIAssistantController;
//# sourceMappingURL=ai-assistant.controller.js.map