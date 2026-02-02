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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
let AuditService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuditService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuditService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        logger = new common_1.Logger(AuditService.name);
        constructor(db) {
            this.db = db;
        }
        /**
         * Registra uma ação de auditoria no banco de dados
         * IMPORTANTE: Este método NUNCA deve lançar exceções para não interromper operações
         */
        async log(params) {
            try {
                // Normaliza os nomes dos campos para compatibilidade
                const entity = params.entity || params.entityType || 'unknown';
                const oldValues = params.oldValues || params.before;
                const newValues = params.newValues || params.after;
                const [result] = await this.db
                    .insert(schema_1.auditLogs)
                    .values({
                    salonId: params.salonId,
                    userId: params.userId,
                    userName: params.userName,
                    userRole: params.userRole,
                    action: params.action,
                    entity,
                    entityId: params.entityId || 'unknown',
                    oldValues,
                    newValues,
                    metadata: params.metadata,
                    ipAddress: params.ipAddress,
                    userAgent: params.userAgent,
                })
                    .returning();
                return result;
            }
            catch (error) {
                // Audit log NUNCA deve quebrar a operação principal
                this.logger.error(`Falha ao registrar audit log: ${error}`, {
                    entity: params.entity || params.entityType,
                    action: params.action,
                    entityId: params.entityId,
                });
                return null;
            }
        }
        /**
         * Log simplificado para acesso público (triagem, etc.)
         */
        async logPublicAccess(params) {
            await this.log({
                salonId: params.salonId,
                entity: params.entityType,
                entityId: params.entityId,
                action: 'PUBLIC_ACCESS',
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                metadata: params.metadata,
            });
        }
        /**
         * Log para envio de WhatsApp
         */
        async logWhatsAppSent(params) {
            await this.log({
                salonId: params.salonId,
                entity: 'notification',
                entityId: params.notificationId,
                action: params.success ? 'WHATSAPP_SENT' : 'WHATSAPP_FAILED',
                metadata: {
                    appointmentId: params.appointmentId,
                    recipientPhone: params.recipientPhone.substring(0, 6) + '***', // Mascara telefone
                    notificationType: params.notificationType,
                    providerId: params.providerId,
                    error: params.error,
                },
            });
        }
        /**
         * Log para override de triagem com risco crítico
         */
        async logCriticalOverride(params) {
            await this.log({
                salonId: params.salonId,
                entity: 'override',
                entityId: params.triageId,
                action: 'CRITICAL_OVERRIDE',
                userId: params.userId,
                userName: params.userName,
                userRole: params.userRole,
                ipAddress: params.ipAddress,
                oldValues: { blocked: true },
                newValues: { blocked: false },
                metadata: {
                    appointmentId: params.appointmentId,
                    reason: params.reason,
                    riskLevel: params.riskLevel,
                    blockers: params.blockers,
                },
            });
        }
        /**
         * Log para consumo de estoque
         */
        async logStockConsumption(params) {
            await this.log({
                salonId: params.salonId,
                entity: 'stock',
                entityId: params.productId.toString(),
                action: 'STOCK_CONSUMED',
                oldValues: { stockInternal: params.stockBefore },
                newValues: { stockInternal: params.stockAfter },
                metadata: {
                    commandItemId: params.commandItemId,
                    quantityConsumed: params.quantityConsumed,
                    recipeVersion: params.recipeVersion,
                },
            });
        }
        // ==================== QUERIES ====================
        /**
         * Busca histórico de uma entidade específica
         */
        async getEntityHistory(entity, entityId) {
            return this.db
                .select()
                .from(schema_1.auditLogs)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.auditLogs.entity, entity), (0, drizzle_orm_1.eq)(schema_1.auditLogs.entityId, entityId)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.auditLogs.timestamp));
        }
        /**
         * Busca logs por entidade (opcionalmente filtrando por entityId)
         * Usado pelo controller para API REST
         */
        async findByEntity(entity, entityId, limit = 100) {
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.auditLogs.entity, entity)];
            if (entityId) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.auditLogs.entityId, entityId));
            }
            return this.db
                .select()
                .from(schema_1.auditLogs)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.auditLogs.timestamp))
                .limit(limit);
        }
        /**
         * Busca logs por salão
         */
        async findBySalon(salonId, limit = 100) {
            return this.db
                .select()
                .from(schema_1.auditLogs)
                .where((0, drizzle_orm_1.eq)(schema_1.auditLogs.salonId, salonId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.auditLogs.timestamp))
                .limit(limit);
        }
        /**
         * Busca logs por usuário
         */
        async findByUser(userId, limit = 100) {
            return this.db
                .select()
                .from(schema_1.auditLogs)
                .where((0, drizzle_orm_1.eq)(schema_1.auditLogs.userId, userId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.auditLogs.timestamp))
                .limit(limit);
        }
        /**
         * Busca logs por tipo de ação
         */
        async findByAction(action, salonId, limit = 100) {
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.auditLogs.action, action)];
            if (salonId) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.auditLogs.salonId, salonId));
            }
            return this.db
                .select()
                .from(schema_1.auditLogs)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.auditLogs.timestamp))
                .limit(limit);
        }
        /**
         * Busca logs por período
         */
        async findByPeriod(startDate, endDate, salonId, limit = 500) {
            const conditions = [
                (0, drizzle_orm_1.gte)(schema_1.auditLogs.timestamp, startDate),
                (0, drizzle_orm_1.lte)(schema_1.auditLogs.timestamp, endDate),
            ];
            if (salonId) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.auditLogs.salonId, salonId));
            }
            return this.db
                .select()
                .from(schema_1.auditLogs)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.auditLogs.timestamp))
                .limit(limit);
        }
        /**
         * Busca overrides críticos (para relatórios de compliance)
         */
        async findCriticalOverrides(salonId, startDate) {
            const conditions = [
                (0, drizzle_orm_1.eq)(schema_1.auditLogs.salonId, salonId),
                (0, drizzle_orm_1.eq)(schema_1.auditLogs.action, 'CRITICAL_OVERRIDE'),
            ];
            if (startDate) {
                conditions.push((0, drizzle_orm_1.gte)(schema_1.auditLogs.timestamp, startDate));
            }
            return this.db
                .select()
                .from(schema_1.auditLogs)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.auditLogs.timestamp));
        }
    };
    return AuditService = _classThis;
})();
exports.AuditService = AuditService;
//# sourceMappingURL=audit.service.js.map