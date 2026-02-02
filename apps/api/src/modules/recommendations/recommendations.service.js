"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema = __importStar(require("../../database/schema"));
/**
 * RecommendationsService
 * Gerencia regras e recomendações de produtos
 */
let RecommendationsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RecommendationsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RecommendationsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        // ==================== RULES MANAGEMENT ====================
        /**
         * Lista todas as regras (do salão + globais)
         */
        async listRules(salonId) {
            const rules = await connection_1.db.query.productRecommendationRules.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `(${schema.productRecommendationRules.salonId} = ${salonId} OR ${schema.productRecommendationRules.salonId} IS NULL)`, (0, drizzle_orm_1.eq)(schema.productRecommendationRules.isActive, true)),
                orderBy: [(0, drizzle_orm_1.desc)(schema.productRecommendationRules.priority)],
            });
            return rules.map(this.mapRuleToResponse);
        }
        /**
         * Obtém uma regra por ID
         */
        async getRuleById(salonId, ruleId) {
            const rule = await connection_1.db.query.productRecommendationRules.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.productRecommendationRules.id, ruleId), (0, drizzle_orm_1.sql) `(${schema.productRecommendationRules.salonId} = ${salonId} OR ${schema.productRecommendationRules.salonId} IS NULL)`),
            });
            if (!rule) {
                throw new common_1.NotFoundException('Regra não encontrada');
            }
            return this.mapRuleToResponse(rule);
        }
        /**
         * Cria uma nova regra de recomendação
         */
        async createRule(salonId, dto, createdById) {
            const [created] = await connection_1.db
                .insert(schema.productRecommendationRules)
                .values({
                salonId,
                name: dto.name,
                description: dto.description,
                conditions: dto.conditions,
                recommendedProducts: (dto.recommendedProducts || []),
                isActive: dto.isActive ?? true,
                priority: dto.priority ?? 0,
                createdById,
            })
                .returning();
            return this.mapRuleToResponse(created);
        }
        /**
         * Atualiza uma regra existente
         */
        async updateRule(salonId, ruleId, dto) {
            const existing = await connection_1.db.query.productRecommendationRules.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.productRecommendationRules.id, ruleId), (0, drizzle_orm_1.eq)(schema.productRecommendationRules.salonId, salonId)),
            });
            if (!existing) {
                throw new common_1.NotFoundException('Regra não encontrada ou não pertence a este salão');
            }
            await connection_1.db
                .update(schema.productRecommendationRules)
                .set({
                ...dto,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.productRecommendationRules.id, ruleId));
            const updated = await connection_1.db.query.productRecommendationRules.findFirst({
                where: (0, drizzle_orm_1.eq)(schema.productRecommendationRules.id, ruleId),
            });
            return this.mapRuleToResponse(updated);
        }
        /**
         * Remove uma regra
         */
        async deleteRule(salonId, ruleId) {
            const existing = await connection_1.db.query.productRecommendationRules.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.productRecommendationRules.id, ruleId), (0, drizzle_orm_1.eq)(schema.productRecommendationRules.salonId, salonId)),
            });
            if (!existing) {
                throw new common_1.NotFoundException('Regra não encontrada ou não pertence a este salão');
            }
            await connection_1.db
                .delete(schema.productRecommendationRules)
                .where((0, drizzle_orm_1.eq)(schema.productRecommendationRules.id, ruleId));
        }
        // ==================== RECOMMENDATION ENGINE ====================
        /**
         * Obtém recomendações para um cliente baseado no perfil capilar
         */
        async getRecommendationsForClient(salonId, clientId) {
            // Busca o perfil capilar do cliente
            const profile = await connection_1.db.query.clientHairProfiles.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientHairProfiles.clientId, clientId), (0, drizzle_orm_1.eq)(schema.clientHairProfiles.salonId, salonId)),
            });
            if (!profile) {
                return [];
            }
            // Busca todas as regras ativas
            const rules = await connection_1.db.query.productRecommendationRules.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `(${schema.productRecommendationRules.salonId} = ${salonId} OR ${schema.productRecommendationRules.salonId} IS NULL)`, (0, drizzle_orm_1.eq)(schema.productRecommendationRules.isActive, true)),
                orderBy: [(0, drizzle_orm_1.desc)(schema.productRecommendationRules.priority)],
            });
            // Busca produtos do salão
            const products = await connection_1.db.query.products.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.products.salonId, salonId), (0, drizzle_orm_1.eq)(schema.products.active, true)),
            });
            const productMap = new Map(products.map(p => [p.id, p]));
            const recommendations = [];
            const addedProductIds = new Set();
            // Avalia cada regra
            for (const rule of rules) {
                const conditions = rule.conditions;
                const matchedCriteria = [];
                let matches = true;
                const isAndLogic = conditions.logic !== 'OR';
                // Verifica tipo de cabelo
                if (conditions.hairTypes?.length) {
                    const match = profile.hairType && conditions.hairTypes.includes(profile.hairType);
                    if (match)
                        matchedCriteria.push(`Tipo: ${profile.hairType}`);
                    if (isAndLogic && !match)
                        matches = false;
                    if (!isAndLogic && match)
                        matches = true;
                }
                // Verifica espessura
                if (conditions.hairThickness?.length) {
                    const match = profile.hairThickness && conditions.hairThickness.includes(profile.hairThickness);
                    if (match)
                        matchedCriteria.push(`Espessura: ${profile.hairThickness}`);
                    if (isAndLogic && !match)
                        matches = false;
                    if (!isAndLogic && match)
                        matches = true;
                }
                // Verifica comprimento
                if (conditions.hairLength?.length) {
                    const match = profile.hairLength && conditions.hairLength.includes(profile.hairLength);
                    if (match)
                        matchedCriteria.push(`Comprimento: ${profile.hairLength}`);
                    if (isAndLogic && !match)
                        matches = false;
                    if (!isAndLogic && match)
                        matches = true;
                }
                // Verifica porosidade
                if (conditions.hairPorosity?.length) {
                    const match = profile.hairPorosity && conditions.hairPorosity.includes(profile.hairPorosity);
                    if (match)
                        matchedCriteria.push(`Porosidade: ${profile.hairPorosity}`);
                    if (isAndLogic && !match)
                        matches = false;
                    if (!isAndLogic && match)
                        matches = true;
                }
                // Verifica tipo de couro cabeludo
                if (conditions.scalpTypes?.length) {
                    const match = profile.scalpType && conditions.scalpTypes.includes(profile.scalpType);
                    if (match)
                        matchedCriteria.push(`Couro: ${profile.scalpType}`);
                    if (isAndLogic && !match)
                        matches = false;
                    if (!isAndLogic && match)
                        matches = true;
                }
                // Verifica histórico químico
                if (conditions.chemicalHistory?.length && Array.isArray(profile.chemicalHistory)) {
                    const chemHistory = profile.chemicalHistory;
                    const match = conditions.chemicalHistory.some(c => chemHistory.includes(c));
                    if (match)
                        matchedCriteria.push('Histórico químico');
                    if (isAndLogic && !match)
                        matches = false;
                    if (!isAndLogic && match)
                        matches = true;
                }
                // Verifica necessidades
                if (conditions.mainConcerns?.length && Array.isArray(profile.mainConcerns)) {
                    const concerns = profile.mainConcerns;
                    const matchedConcerns = conditions.mainConcerns.filter(c => concerns.includes(c));
                    if (matchedConcerns.length > 0) {
                        matchedCriteria.push(...matchedConcerns.map(c => `Necessidade: ${c}`));
                    }
                    if (isAndLogic && matchedConcerns.length === 0)
                        matches = false;
                    if (!isAndLogic && matchedConcerns.length > 0)
                        matches = true;
                }
                if (matches && matchedCriteria.length > 0) {
                    const ruleProducts = rule.recommendedProducts || [];
                    for (const recProduct of ruleProducts) {
                        if (addedProductIds.has(recProduct.productId))
                            continue;
                        const product = productMap.get(recProduct.productId);
                        if (!product || (product.stockRetail + product.stockInternal) <= 0)
                            continue;
                        recommendations.push({
                            productId: product.id,
                            productName: product.name,
                            productDescription: product.description,
                            salePrice: product.salePrice,
                            currentStock: product.stockRetail + product.stockInternal,
                            reason: recProduct.reason,
                            priority: recProduct.priority,
                            matchedCriteria,
                            ruleId: rule.id,
                            ruleName: rule.name,
                        });
                        addedProductIds.add(product.id);
                    }
                }
            }
            // Também busca produtos diretamente relacionados ao perfil
            const profileBasedProducts = products.filter(product => {
                if (addedProductIds.has(product.id))
                    return false;
                if ((product.stockRetail + product.stockInternal) <= 0)
                    return false;
                const hairTypes = product.hairTypes || [];
                const concerns = product.concerns || [];
                const matchesHairType = profile.hairType && hairTypes.includes(profile.hairType);
                const matchesConcern = Array.isArray(profile.mainConcerns) &&
                    profile.mainConcerns.some(c => concerns.includes(c));
                return matchesHairType || matchesConcern;
            });
            for (const product of profileBasedProducts) {
                const matchedCriteria = [];
                const hairTypes = product.hairTypes || [];
                const concerns = product.concerns || [];
                if (profile.hairType && hairTypes.includes(profile.hairType)) {
                    matchedCriteria.push(`Indicado para cabelo ${profile.hairType}`);
                }
                if (Array.isArray(profile.mainConcerns)) {
                    const matchedConcerns = profile.mainConcerns.filter(c => concerns.includes(c));
                    matchedCriteria.push(...matchedConcerns.map(c => `Resolve: ${c}`));
                }
                recommendations.push({
                    productId: product.id,
                    productName: product.name,
                    productDescription: product.description,
                    salePrice: product.salePrice,
                    currentStock: product.stockRetail + product.stockInternal,
                    reason: 'Produto indicado para seu perfil capilar',
                    priority: 0,
                    matchedCriteria,
                });
                addedProductIds.add(product.id);
            }
            // Ordena por prioridade
            return recommendations.sort((a, b) => b.priority - a.priority);
        }
        // ==================== LOGGING ====================
        /**
         * Registra uma recomendação mostrada ao cliente
         */
        async logRecommendation(salonId, dto) {
            await connection_1.db.insert(schema.productRecommendationsLog).values({
                salonId,
                clientId: dto.clientId,
                commandId: dto.commandId,
                appointmentId: dto.appointmentId,
                ruleId: dto.ruleId,
                productId: dto.productId,
                reason: dto.reason,
            });
        }
        /**
         * Marca uma recomendação como aceita
         */
        async acceptRecommendation(salonId, logId) {
            const log = await connection_1.db.query.productRecommendationsLog.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.productRecommendationsLog.id, logId), (0, drizzle_orm_1.eq)(schema.productRecommendationsLog.salonId, salonId)),
            });
            if (!log) {
                throw new common_1.NotFoundException('Log de recomendação não encontrado');
            }
            await connection_1.db
                .update(schema.productRecommendationsLog)
                .set({
                wasAccepted: true,
                acceptedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.productRecommendationsLog.id, logId));
        }
        /**
         * Marca uma recomendação como rejeitada
         */
        async rejectRecommendation(salonId, logId) {
            const log = await connection_1.db.query.productRecommendationsLog.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.productRecommendationsLog.id, logId), (0, drizzle_orm_1.eq)(schema.productRecommendationsLog.salonId, salonId)),
            });
            if (!log) {
                throw new common_1.NotFoundException('Log de recomendação não encontrado');
            }
            await connection_1.db
                .update(schema.productRecommendationsLog)
                .set({
                wasAccepted: false,
                rejectedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.productRecommendationsLog.id, logId));
        }
        // ==================== STATISTICS ====================
        /**
         * Obtém estatísticas das recomendações
         */
        async getStats(salonId, days = 30) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const logs = await connection_1.db.query.productRecommendationsLog.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.productRecommendationsLog.salonId, salonId), (0, drizzle_orm_1.gte)(schema.productRecommendationsLog.createdAt, startDate)),
            });
            const totalRecommendations = logs.length;
            const acceptedCount = logs.filter(l => l.wasAccepted === true).length;
            const rejectedCount = logs.filter(l => l.wasAccepted === false).length;
            const pendingCount = logs.filter(l => l.wasAccepted === null).length;
            // Estatísticas por produto
            const productStats = new Map();
            // Busca nomes dos produtos
            const productIds = [...new Set(logs.map(l => l.productId))];
            const products = productIds.length > 0
                ? await connection_1.db.query.products.findMany({
                    where: (0, drizzle_orm_1.sql) `${schema.products.id} IN (${drizzle_orm_1.sql.join(productIds.map(id => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})`,
                })
                : [];
            const productNameMap = new Map(products.map(p => [p.id, p.name]));
            logs.forEach(log => {
                const existing = productStats.get(log.productId) || {
                    name: productNameMap.get(log.productId) || 'Desconhecido',
                    recommended: 0,
                    accepted: 0,
                };
                existing.recommended++;
                if (log.wasAccepted)
                    existing.accepted++;
                productStats.set(log.productId, existing);
            });
            // Estatísticas por regra
            const ruleStats = new Map();
            const ruleIds = [...new Set(logs.filter(l => l.ruleId).map(l => l.ruleId))];
            const rules = ruleIds.length > 0
                ? await connection_1.db.query.productRecommendationRules.findMany({
                    where: (0, drizzle_orm_1.sql) `${schema.productRecommendationRules.id} IN (${drizzle_orm_1.sql.join(ruleIds.map(id => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})`,
                })
                : [];
            const ruleNameMap = new Map(rules.map(r => [r.id, r.name]));
            logs.forEach(log => {
                if (!log.ruleId)
                    return;
                const existing = ruleStats.get(log.ruleId) || {
                    name: ruleNameMap.get(log.ruleId) || 'Desconhecido',
                    triggered: 0,
                    accepted: 0,
                };
                existing.triggered++;
                if (log.wasAccepted)
                    existing.accepted++;
                ruleStats.set(log.ruleId, existing);
            });
            return {
                totalRecommendations,
                acceptedCount,
                rejectedCount,
                pendingCount,
                acceptanceRate: totalRecommendations > 0
                    ? Math.round((acceptedCount / (acceptedCount + rejectedCount || 1)) * 100)
                    : 0,
                topProducts: [...productStats.entries()]
                    .map(([productId, stats]) => ({
                    productId,
                    productName: stats.name,
                    timesRecommended: stats.recommended,
                    timesAccepted: stats.accepted,
                    acceptanceRate: stats.recommended > 0
                        ? Math.round((stats.accepted / stats.recommended) * 100)
                        : 0,
                }))
                    .sort((a, b) => b.timesRecommended - a.timesRecommended)
                    .slice(0, 10),
                topRules: [...ruleStats.entries()]
                    .map(([ruleId, stats]) => ({
                    ruleId,
                    ruleName: stats.name,
                    timesTriggered: stats.triggered,
                    acceptanceRate: stats.triggered > 0
                        ? Math.round((stats.accepted / stats.triggered) * 100)
                        : 0,
                }))
                    .sort((a, b) => b.timesTriggered - a.timesTriggered)
                    .slice(0, 10),
            };
        }
        // ==================== PRIVATE METHODS ====================
        mapRuleToResponse(rule) {
            return {
                id: rule.id,
                salonId: rule.salonId,
                name: rule.name,
                description: rule.description,
                conditions: rule.conditions,
                recommendedProducts: rule.recommendedProducts || [],
                isActive: rule.isActive,
                priority: rule.priority,
                createdById: rule.createdById,
                createdAt: rule.createdAt,
                updatedAt: rule.updatedAt,
            };
        }
    };
    return RecommendationsService = _classThis;
})();
exports.RecommendationsService = RecommendationsService;
//# sourceMappingURL=recommendations.service.js.map