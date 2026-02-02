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
exports.SupportService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../database/schema");
let SupportService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SupportService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SupportService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        jwtService;
        constructor(db, jwtService) {
            this.db = db;
            this.jwtService = jwtService;
        }
        /**
         * Cria uma sessão de suporte delegado (SUPER_ADMIN only)
         * Gera um token único que pode ser consumido uma única vez
         */
        async createSession(adminUserId, targetSalonId, reason, ipAddress, userAgent) {
            // Valida que o salão existe
            const [salon] = await this.db
                .select()
                .from(schema_1.salons)
                .where((0, drizzle_orm_1.eq)(schema_1.salons.id, targetSalonId))
                .limit(1);
            if (!salon) {
                throw new common_1.NotFoundException('Salão não encontrado');
            }
            // Gera token único de 64 caracteres (32 bytes em hex)
            const token = (0, crypto_1.randomBytes)(32).toString('hex');
            // TTL de 15 minutos
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 15);
            // Cria a sessão
            const [session] = await this.db
                .insert(schema_1.supportSessions)
                .values({
                adminUserId,
                targetSalonId,
                token,
                reason,
                status: 'PENDING',
                expiresAt,
                ipAddress,
                userAgent,
            })
                .returning();
            // Registra no audit log
            await this.db.insert(schema_1.auditLogs).values({
                userId: adminUserId,
                salonId: targetSalonId,
                action: 'CREATE',
                entity: 'support_sessions',
                entityId: session.id,
                newValues: {
                    targetSalonId,
                    reason,
                    expiresAt: expiresAt.toISOString(),
                },
                ipAddress,
                userAgent,
            });
            return {
                sessionId: session.id,
                token,
                expiresAt,
                salonName: salon.name,
                salonId: salon.id,
            };
        }
        /**
         * Consome o token de suporte e retorna um JWT com actingAsSalonId
         */
        async consumeToken(token, adminUserId, ipAddress, userAgent) {
            // Busca a sessão pelo token
            const [session] = await this.db
                .select()
                .from(schema_1.supportSessions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.supportSessions.token, token), (0, drizzle_orm_1.eq)(schema_1.supportSessions.status, 'PENDING'), (0, drizzle_orm_1.gt)(schema_1.supportSessions.expiresAt, new Date())))
                .limit(1);
            if (!session) {
                throw new common_1.BadRequestException('Token inválido, expirado ou já utilizado');
            }
            // Verifica que é o mesmo admin que criou
            if (session.adminUserId !== adminUserId) {
                throw new common_1.ForbiddenException('Este token pertence a outro administrador');
            }
            // Busca dados do admin
            const [admin] = await this.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, adminUserId))
                .limit(1);
            if (!admin) {
                throw new common_1.NotFoundException('Usuário administrador não encontrado');
            }
            // Busca dados do salão
            const [salon] = await this.db
                .select()
                .from(schema_1.salons)
                .where((0, drizzle_orm_1.eq)(schema_1.salons.id, session.targetSalonId))
                .limit(1);
            // Marca como consumido
            await this.db
                .update(schema_1.supportSessions)
                .set({
                status: 'CONSUMED',
                consumedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.supportSessions.id, session.id));
            // Gera JWT com actingAsSalonId
            const payload = {
                sub: adminUserId,
                id: adminUserId,
                email: admin.email,
                role: 'SUPER_ADMIN',
                salonId: null,
                actingAsSalonId: session.targetSalonId,
                supportSessionId: session.id,
                type: 'access',
            };
            const accessToken = await this.jwtService.signAsync(payload, {
                secret: process.env.ACCESS_TOKEN_SECRET || 'SEGREDO_ACESSO_FORTE_AQUI',
                expiresIn: '15m', // Mesmo TTL da sessão
            });
            // Registra consumo no audit log
            await this.db.insert(schema_1.auditLogs).values({
                userId: adminUserId,
                salonId: session.targetSalonId,
                action: 'UPDATE',
                entity: 'support_sessions',
                entityId: session.id,
                oldValues: { status: 'PENDING' },
                newValues: { status: 'CONSUMED', consumedAt: new Date().toISOString() },
                ipAddress,
                userAgent,
            });
            return {
                accessToken,
                expiresIn: 15 * 60, // 15 minutos em segundos
                salonId: session.targetSalonId,
                salonName: salon?.name || 'Salão',
            };
        }
        /**
         * Lista sessões de suporte (para auditoria)
         */
        async listSessions(filters) {
            const conditions = [];
            if (filters?.adminUserId) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.supportSessions.adminUserId, filters.adminUserId));
            }
            if (filters?.status) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.supportSessions.status, filters.status));
            }
            const sessions = await this.db
                .select({
                session: schema_1.supportSessions,
                salon: schema_1.salons,
                admin: schema_1.users,
            })
                .from(schema_1.supportSessions)
                .leftJoin(schema_1.salons, (0, drizzle_orm_1.eq)(schema_1.supportSessions.targetSalonId, schema_1.salons.id))
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.supportSessions.adminUserId, schema_1.users.id))
                .where(conditions.length ? (0, drizzle_orm_1.and)(...conditions) : undefined)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.supportSessions.createdAt))
                .limit(filters?.limit || 50);
            return sessions.map((s) => ({
                id: s.session.id,
                adminUserId: s.session.adminUserId,
                adminName: s.admin?.name || 'Desconhecido',
                adminEmail: s.admin?.email || 'Desconhecido',
                targetSalonId: s.session.targetSalonId,
                salonName: s.salon?.name || 'Salão removido',
                reason: s.session.reason,
                status: s.session.status,
                expiresAt: s.session.expiresAt,
                consumedAt: s.session.consumedAt,
                ipAddress: s.session.ipAddress,
                createdAt: s.session.createdAt,
            }));
        }
        /**
         * Revoga uma sessão pendente
         */
        async revokeSession(sessionId, adminUserId, ipAddress) {
            const [session] = await this.db
                .select()
                .from(schema_1.supportSessions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.supportSessions.id, sessionId), (0, drizzle_orm_1.eq)(schema_1.supportSessions.status, 'PENDING')))
                .limit(1);
            if (!session) {
                throw new common_1.NotFoundException('Sessão não encontrada ou já não está pendente');
            }
            // Apenas o admin que criou ou outro SUPER_ADMIN pode revogar
            await this.db
                .update(schema_1.supportSessions)
                .set({ status: 'REVOKED' })
                .where((0, drizzle_orm_1.eq)(schema_1.supportSessions.id, sessionId));
            // Registra revogação no audit log
            await this.db.insert(schema_1.auditLogs).values({
                userId: adminUserId,
                salonId: session.targetSalonId,
                action: 'UPDATE',
                entity: 'support_sessions',
                entityId: sessionId,
                oldValues: { status: 'PENDING' },
                newValues: { status: 'REVOKED' },
                ipAddress,
            });
        }
        /**
         * Expira sessões antigas automaticamente (pode ser chamado por um cron job)
         */
        async expireOldSessions() {
            const result = await this.db
                .update(schema_1.supportSessions)
                .set({ status: 'EXPIRED' })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.supportSessions.status, 'PENDING'), (0, drizzle_orm_1.lt)(schema_1.supportSessions.expiresAt, new Date())))
                .returning();
            return result.length;
        }
    };
    return SupportService = _classThis;
})();
exports.SupportService = SupportService;
//# sourceMappingURL=support.service.js.map