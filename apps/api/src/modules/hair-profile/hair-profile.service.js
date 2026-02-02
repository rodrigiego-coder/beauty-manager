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
exports.HairProfileService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema = __importStar(require("../../database/schema"));
/**
 * HairProfileService
 * Gerencia perfis capilares dos clientes
 */
let HairProfileService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var HairProfileService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            HairProfileService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        /**
         * Obtém o perfil capilar de um cliente
         */
        async getByClientId(salonId, clientId) {
            // Verifica se o cliente pertence ao salão
            const client = await connection_1.db.query.clients.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clients.id, clientId), (0, drizzle_orm_1.eq)(schema.clients.salonId, salonId)),
            });
            if (!client) {
                throw new common_1.NotFoundException('Cliente não encontrado');
            }
            const profile = await connection_1.db.query.clientHairProfiles.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientHairProfiles.clientId, clientId), (0, drizzle_orm_1.eq)(schema.clientHairProfiles.salonId, salonId)),
            });
            if (!profile) {
                return null;
            }
            return this.mapToResponse(profile);
        }
        /**
         * Cria ou atualiza o perfil capilar de um cliente
         */
        async upsert(salonId, dto, assessedById) {
            // Verifica se o cliente pertence ao salão
            const client = await connection_1.db.query.clients.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clients.id, dto.clientId), (0, drizzle_orm_1.eq)(schema.clients.salonId, salonId)),
            });
            if (!client) {
                throw new common_1.NotFoundException('Cliente não encontrado');
            }
            const existing = await connection_1.db.query.clientHairProfiles.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientHairProfiles.clientId, dto.clientId), (0, drizzle_orm_1.eq)(schema.clientHairProfiles.salonId, salonId)),
            });
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            if (existing) {
                // Atualiza perfil existente
                await connection_1.db
                    .update(schema.clientHairProfiles)
                    .set({
                    hairType: dto.hairType || existing.hairType,
                    hairThickness: dto.hairThickness || existing.hairThickness,
                    hairLength: dto.hairLength || existing.hairLength,
                    hairPorosity: dto.hairPorosity || existing.hairPorosity,
                    scalpType: dto.scalpType || existing.scalpType,
                    chemicalHistory: dto.chemicalHistory || existing.chemicalHistory,
                    mainConcerns: dto.mainConcerns || existing.mainConcerns,
                    allergies: dto.allergies !== undefined ? dto.allergies : existing.allergies,
                    currentProducts: dto.currentProducts !== undefined ? dto.currentProducts : existing.currentProducts,
                    notes: dto.notes !== undefined ? dto.notes : existing.notes,
                    lastAssessmentDate: today,
                    lastAssessedById: assessedById,
                    updatedAt: now,
                })
                    .where((0, drizzle_orm_1.eq)(schema.clientHairProfiles.id, existing.id));
                const updated = await connection_1.db.query.clientHairProfiles.findFirst({
                    where: (0, drizzle_orm_1.eq)(schema.clientHairProfiles.id, existing.id),
                });
                return this.mapToResponse(updated);
            }
            // Cria novo perfil
            const [created] = await connection_1.db
                .insert(schema.clientHairProfiles)
                .values({
                salonId,
                clientId: dto.clientId,
                hairType: dto.hairType,
                hairThickness: dto.hairThickness,
                hairLength: dto.hairLength,
                hairPorosity: dto.hairPorosity,
                scalpType: dto.scalpType,
                chemicalHistory: dto.chemicalHistory || [],
                mainConcerns: dto.mainConcerns || [],
                allergies: dto.allergies,
                currentProducts: dto.currentProducts,
                notes: dto.notes,
                lastAssessmentDate: today,
                lastAssessedById: assessedById,
            })
                .returning();
            return this.mapToResponse(created);
        }
        /**
         * Atualiza parcialmente o perfil capilar
         */
        async update(salonId, clientId, dto, assessedById) {
            const existing = await connection_1.db.query.clientHairProfiles.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientHairProfiles.clientId, clientId), (0, drizzle_orm_1.eq)(schema.clientHairProfiles.salonId, salonId)),
            });
            if (!existing) {
                throw new common_1.NotFoundException('Perfil capilar não encontrado');
            }
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            await connection_1.db
                .update(schema.clientHairProfiles)
                .set({
                ...dto,
                lastAssessmentDate: today,
                lastAssessedById: assessedById,
                updatedAt: now,
            })
                .where((0, drizzle_orm_1.eq)(schema.clientHairProfiles.id, existing.id));
            const updated = await connection_1.db.query.clientHairProfiles.findFirst({
                where: (0, drizzle_orm_1.eq)(schema.clientHairProfiles.id, existing.id),
            });
            return this.mapToResponse(updated);
        }
        /**
         * Remove o perfil capilar
         */
        async delete(salonId, clientId) {
            const existing = await connection_1.db.query.clientHairProfiles.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clientHairProfiles.clientId, clientId), (0, drizzle_orm_1.eq)(schema.clientHairProfiles.salonId, salonId)),
            });
            if (!existing) {
                throw new common_1.NotFoundException('Perfil capilar não encontrado');
            }
            await connection_1.db
                .delete(schema.clientHairProfiles)
                .where((0, drizzle_orm_1.eq)(schema.clientHairProfiles.id, existing.id));
        }
        /**
         * Lista clientes com perfil capilar
         */
        async listClientsWithProfile(salonId) {
            const clients = await connection_1.db.query.clients.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clients.salonId, salonId), (0, drizzle_orm_1.eq)(schema.clients.active, true)),
            });
            const profiles = await connection_1.db.query.clientHairProfiles.findMany({
                where: (0, drizzle_orm_1.eq)(schema.clientHairProfiles.salonId, salonId),
            });
            const profileClientIds = new Set(profiles.map(p => p.clientId));
            return clients.map(client => ({
                clientId: client.id,
                clientName: client.name || 'Sem nome',
                hasProfile: profileClientIds.has(client.id),
            }));
        }
        /**
         * Obtém estatísticas de perfis capilares
         */
        async getStats(salonId) {
            const profiles = await connection_1.db.query.clientHairProfiles.findMany({
                where: (0, drizzle_orm_1.eq)(schema.clientHairProfiles.salonId, salonId),
            });
            const totalClients = await connection_1.db.query.clients.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.clients.salonId, salonId), (0, drizzle_orm_1.eq)(schema.clients.active, true)),
            });
            // Contagem por tipo de cabelo
            const hairTypeCount = {};
            // Contagem por problemas mais comuns
            const concernsCount = {};
            profiles.forEach(profile => {
                if (profile.hairType) {
                    hairTypeCount[profile.hairType] = (hairTypeCount[profile.hairType] || 0) + 1;
                }
                if (profile.mainConcerns && Array.isArray(profile.mainConcerns)) {
                    profile.mainConcerns.forEach(concern => {
                        concernsCount[concern] = (concernsCount[concern] || 0) + 1;
                    });
                }
            });
            return {
                totalClients: totalClients.length,
                profilesCreated: profiles.length,
                coveragePercentage: totalClients.length > 0
                    ? Math.round((profiles.length / totalClients.length) * 100)
                    : 0,
                hairTypeDistribution: hairTypeCount,
                topConcerns: Object.entries(concernsCount)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([concern, count]) => ({ concern, count })),
            };
        }
        // ==================== PRIVATE METHODS ====================
        mapToResponse(profile) {
            return {
                id: profile.id,
                clientId: profile.clientId,
                hairType: profile.hairType,
                hairThickness: profile.hairThickness,
                hairLength: profile.hairLength,
                hairPorosity: profile.hairPorosity,
                scalpType: profile.scalpType,
                chemicalHistory: profile.chemicalHistory || [],
                mainConcerns: profile.mainConcerns || [],
                allergies: profile.allergies,
                currentProducts: profile.currentProducts,
                notes: profile.notes,
                lastAssessmentDate: profile.lastAssessmentDate,
                lastAssessedById: profile.lastAssessedById,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt,
            };
        }
    };
    return HairProfileService = _classThis;
})();
exports.HairProfileService = HairProfileService;
//# sourceMappingURL=hair-profile.service.js.map