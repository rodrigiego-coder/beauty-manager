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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../../database/schema"));
let AuthService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        usersService;
        salonsService;
        subscriptionsService;
        jwtService;
        db;
        constructor(usersService, salonsService, subscriptionsService, jwtService, db) {
            this.usersService = usersService;
            this.salonsService = salonsService;
            this.subscriptionsService = subscriptionsService;
            this.jwtService = jwtService;
            this.db = db;
        }
        /**
         * Realiza o login com validação real no banco de dados
         */
        async login(email, password) {
            // Busca o usuário pelo email
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                throw new common_1.UnauthorizedException('Email ou senha inválidos');
            }
            if (!user.active) {
                throw new common_1.UnauthorizedException('Usuário desativado');
            }
            if (!user.passwordHash) {
                throw new common_1.UnauthorizedException('Usuário sem senha configurada');
            }
            // Valida a senha com bcrypt
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Email ou senha inválidos');
            }
            // Gera os tokens JWT
            const tokens = await this.generateTokens(user.id, user.email, user.role, user.salonId);
            // Remove a senha do retorno
            const { passwordHash, ...userData } = user;
            return {
                user: userData,
                ...tokens,
                message: 'Login realizado com sucesso',
            };
        }
        /**
         * Renova o access token usando o refresh token
         */
        async refreshToken(refreshToken) {
            try {
                const payload = this.jwtService.verify(refreshToken, {
                    secret: process.env.REFRESH_TOKEN_SECRET || 'SEGREDO_REFRESH_FORTE_AQUI',
                });
                if (payload.type !== 'refresh') {
                    throw new common_1.UnauthorizedException('Token inválido');
                }
                // Verifica se o token está na blacklist
                const isBlacklisted = await this.isTokenBlacklisted(refreshToken);
                if (isBlacklisted) {
                    throw new common_1.UnauthorizedException('Token foi invalidado (logout realizado)');
                }
                // Verifica se o usuário ainda existe e está ativo
                const user = await this.usersService.findById(payload.sub);
                if (!user || !user.active) {
                    throw new common_1.UnauthorizedException('Usuário não encontrado ou inativo');
                }
                // Gera novos tokens
                const tokens = await this.generateTokens(user.id, user.email, user.role, user.salonId);
                return {
                    ...tokens,
                    message: 'Token renovado com sucesso',
                };
            }
            catch (error) {
                if (error instanceof common_1.UnauthorizedException) {
                    throw error;
                }
                throw new common_1.UnauthorizedException('Refresh token inválido ou expirado');
            }
        }
        /**
         * Realiza o logout invalidando o refresh token
         */
        async logout(refreshToken, userId) {
            try {
                // Verifica se o token é válido antes de invalidar
                const payload = this.jwtService.verify(refreshToken, {
                    secret: process.env.REFRESH_TOKEN_SECRET || 'SEGREDO_REFRESH_FORTE_AQUI',
                });
                // Calcula quando o token expira
                const expiresAt = new Date(payload.exp * 1000);
                // Adiciona o token na blacklist
                await this.db.insert(schema.refreshTokenBlacklist).values({
                    token: refreshToken,
                    userId: userId,
                    expiresAt: expiresAt,
                });
                return {
                    message: 'Logout realizado com sucesso',
                };
            }
            catch (error) {
                // Mesmo se o token for inválido, consideramos logout bem-sucedido
                return {
                    message: 'Logout realizado com sucesso',
                };
            }
        }
        /**
         * Cria senha usando token recebido via WhatsApp
         * Valida token, verifica expiração e define a senha
         */
        async createPassword(token, password) {
            // Busca usuário pelo token
            const user = await this.usersService.findByPasswordResetToken(token);
            if (!user) {
                throw new common_1.BadRequestException('Token invalido ou ja utilizado');
            }
            // Verifica se token expirou
            if (!user.passwordResetExpires || new Date() > user.passwordResetExpires) {
                throw new common_1.BadRequestException('Token expirado. Solicite um novo link ao administrador.');
            }
            // Verifica se usuário está ativo
            if (!user.active) {
                throw new common_1.BadRequestException('Usuario desativado');
            }
            // Define a senha
            const passwordHash = await bcrypt.hash(password, 10);
            await this.db
                .update(schema.users)
                .set({
                passwordHash,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.users.id, user.id));
            // Limpa o token após uso
            await this.usersService.clearPasswordResetToken(user.id);
            // Gera tokens para login automático
            const tokens = await this.generateTokens(user.id, user.email, user.role, user.salonId);
            // Remove a senha do retorno
            const { passwordHash: _, passwordResetToken: __, passwordResetExpires: ___, ...userData } = user;
            return {
                user: userData,
                ...tokens,
                message: 'Senha criada com sucesso',
            };
        }
        /**
         * Valida se um token de criação de senha é válido (sem criar a senha)
         */
        async validatePasswordToken(token) {
            const user = await this.usersService.findByPasswordResetToken(token);
            if (!user) {
                return { valid: false };
            }
            if (!user.passwordResetExpires || new Date() > user.passwordResetExpires) {
                return { valid: false };
            }
            if (!user.active) {
                return { valid: false };
            }
            return { valid: true, userName: user.name };
        }
        /**
         * Realiza o signup (cadastro público) de um novo salão
         * Cria: Salão + Usuário OWNER + Assinatura Trial
         */
        async signup(dto) {
            // 1. Verificar se email já existe
            const existingUser = await this.usersService.findByEmail(dto.email);
            if (existingUser) {
                throw new common_1.ConflictException('Este email já está cadastrado');
            }
            // 2. Gerar slug único para o salão
            const slug = await this.generateUniqueSlug(dto.salonName);
            // 3. Buscar plano (Professional como padrão)
            let planId = dto.planId;
            if (!planId) {
                const defaultPlan = await this.db
                    .select()
                    .from(schema.plans)
                    .where((0, drizzle_orm_1.eq)(schema.plans.code, 'PROFESSIONAL'))
                    .limit(1);
                if (defaultPlan.length === 0) {
                    throw new common_1.BadRequestException('Plano padrão não encontrado');
                }
                planId = defaultPlan[0].id;
            }
            // 4. Criar salão
            const salon = await this.salonsService.create({
                name: dto.salonName,
                slug,
                phone: dto.phone,
                email: dto.email,
            });
            // 5. Criar usuário OWNER
            const user = await this.usersService.create({
                salonId: salon.id,
                name: dto.ownerName,
                email: dto.email,
                phone: dto.phone,
                password: dto.password,
                role: 'OWNER',
            });
            // 6. Criar assinatura com trial de 14 dias
            const subscription = await this.subscriptionsService.startTrial(salon.id, {
                planId,
                trialDays: 14,
            }, user.id);
            // 7. Gerar tokens para login automático
            const tokens = await this.generateTokens(user.id, user.email, user.role, salon.id);
            // 8. Remove dados sensíveis do retorno
            const { passwordHash, passwordResetToken, passwordResetExpires, ...userData } = user;
            return {
                user: userData,
                salon: {
                    id: salon.id,
                    name: salon.name,
                    slug: salon.slug,
                },
                subscription: {
                    id: subscription.id,
                    status: subscription.status,
                    trialEndsAt: subscription.trialEndsAt,
                },
                ...tokens,
                message: 'Conta criada com sucesso! Seu trial de 14 dias começou.',
            };
        }
        /**
         * Gera um slug único baseado no nome do salão
         */
        async generateUniqueSlug(name) {
            // Remove acentos e caracteres especiais
            const baseSlug = name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            // Verifica se slug já existe
            let slug = baseSlug;
            let counter = 1;
            while (true) {
                const existing = await this.db
                    .select()
                    .from(schema.salons)
                    .where((0, drizzle_orm_1.eq)(schema.salons.slug, slug))
                    .limit(1);
                if (existing.length === 0) {
                    break;
                }
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
            return slug;
        }
        /**
         * Verifica se um token está na blacklist
         */
        async isTokenBlacklisted(token) {
            const result = await this.db
                .select()
                .from(schema.refreshTokenBlacklist)
                .where((0, drizzle_orm_1.eq)(schema.refreshTokenBlacklist.token, token))
                .limit(1);
            return result.length > 0;
        }
        /**
         * Gera access token e refresh token
         */
        async generateTokens(userId, email, role, salonId) {
            const accessPayload = {
                sub: userId,
                id: userId,
                email,
                role,
                salonId,
                type: 'access',
            };
            const refreshPayload = {
                sub: userId,
                id: userId,
                email,
                role,
                salonId,
                type: 'refresh',
            };
            const [accessToken, refreshToken] = await Promise.all([
                this.jwtService.signAsync(accessPayload, {
                    secret: process.env.ACCESS_TOKEN_SECRET || 'SEGREDO_ACESSO_FORTE_AQUI',
                    expiresIn: '30m', // Access token: 30 minutos
                }),
                this.jwtService.signAsync(refreshPayload, {
                    secret: process.env.REFRESH_TOKEN_SECRET || 'SEGREDO_REFRESH_FORTE_AQUI',
                    expiresIn: '7d', // Refresh token: 7 dias
                }),
            ]);
            return {
                accessToken,
                refreshToken,
                expiresIn: 30 * 60, // 30 minutos em segundos
            };
        }
    };
    return AuthService = _classThis;
})();
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map