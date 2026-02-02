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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt = __importStar(require("bcryptjs"));
const crypto = __importStar(require("crypto"));
const database_1 = require("../../database");
let UsersService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var UsersService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            UsersService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        configService;
        whatsappService;
        salonsService;
        constructor(db, configService, whatsappService, salonsService) {
            this.db = db;
            this.configService = configService;
            this.whatsappService = whatsappService;
            this.salonsService = salonsService;
        }
        /**
         * Lista usuarios do salão
         */
        async findAll(salonId, includeInactive = false) {
            if (salonId) {
                if (includeInactive) {
                    return this.db
                        .select()
                        .from(database_1.users)
                        .where((0, drizzle_orm_1.eq)(database_1.users.salonId, salonId));
                }
                return this.db
                    .select()
                    .from(database_1.users)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.users.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.users.active, true)));
            }
            // Fallback para admin sem salão específico
            if (includeInactive) {
                return this.db.select().from(database_1.users);
            }
            return this.db
                .select()
                .from(database_1.users)
                .where((0, drizzle_orm_1.eq)(database_1.users.active, true));
        }
        /**
         * Busca usuario por ID
         */
        async findById(id) {
            const result = await this.db
                .select()
                .from(database_1.users)
                .where((0, drizzle_orm_1.eq)(database_1.users.id, id))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Busca usuario por email
         */
        async findByEmail(email) {
            const result = await this.db
                .select()
                .from(database_1.users)
                .where((0, drizzle_orm_1.eq)(database_1.users.email, email))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Busca profissionais ativos do salão
         */
        async findProfessionals(salonId) {
            if (salonId) {
                const salonUsers = await this.db
                    .select()
                    .from(database_1.users)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.users.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.users.active, true)));
                return salonUsers.filter(u => u.role === 'STYLIST');
            }
            // Fallback para admin
            const allUsers = await this.db
                .select()
                .from(database_1.users)
                .where((0, drizzle_orm_1.eq)(database_1.users.active, true));
            return allUsers.filter(u => u.role === 'STYLIST');
        }
        /**
         * Cria um novo usuario
         */
        async create(data) {
            // Se veio password, faz hash
            let passwordHash;
            if (data.password) {
                passwordHash = await bcrypt.hash(data.password, 10);
            }
            // Remove password do data e adiciona passwordHash
            const { password, ...userData } = data;
            const result = await this.db
                .insert(database_1.users)
                .values({
                ...userData,
                passwordHash: passwordHash || userData.passwordHash,
            })
                .returning();
            return result[0];
        }
        /**
         * Atualiza um usuario
         */
        async update(id, data) {
            // Se veio password, faz hash
            let updateData = { ...data };
            if (data.password) {
                updateData.passwordHash = await bcrypt.hash(data.password, 10);
                delete updateData.password;
            }
            const result = await this.db
                .update(database_1.users)
                .set({
                ...updateData,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.users.id, id))
                .returning();
            return result[0] || null;
        }
        /**
         * Atualiza o perfil do usuario logado
         */
        async updateProfile(id, data) {
            if (data.email) {
                const existingUser = await this.findByEmail(data.email);
                if (existingUser && existingUser.id !== id) {
                    throw new common_1.BadRequestException('Este email ja esta em uso');
                }
            }
            const result = await this.db
                .update(database_1.users)
                .set({
                ...data,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.users.id, id))
                .returning();
            return result[0] || null;
        }
        /**
         * Altera a senha do usuario
         */
        async changePassword(id, currentPassword, newPassword) {
            const user = await this.findById(id);
            if (!user) {
                throw new common_1.BadRequestException('Usuario nao encontrado');
            }
            if (!user.passwordHash) {
                throw new common_1.BadRequestException('Usuario sem senha configurada');
            }
            const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isPasswordValid) {
                throw new common_1.BadRequestException('Senha atual incorreta');
            }
            const newPasswordHash = await bcrypt.hash(newPassword, 10);
            await this.db
                .update(database_1.users)
                .set({
                passwordHash: newPasswordHash,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.users.id, id));
            return { success: true, message: 'Senha alterada com sucesso' };
        }
        /**
         * Desativa um usuario (soft delete)
         */
        async deactivate(id) {
            return this.update(id, { active: false });
        }
        /**
         * Atualiza o work_schedule de um profissional
         */
        async updateWorkSchedule(id, schedule) {
            return this.update(id, { workSchedule: schedule });
        }
        /**
         * Verifica se um horario esta dentro do work_schedule do profissional
         */
        isWithinWorkSchedule(user, date, time) {
            if (!user.workSchedule) {
                return { valid: true };
            }
            const dateObj = new Date(date);
            const dayOfWeek = dateObj.getDay();
            const dayMap = {
                0: 'dom',
                1: 'seg',
                2: 'ter',
                3: 'qua',
                4: 'qui',
                5: 'sex',
                6: 'sab',
            };
            const dayKey = dayMap[dayOfWeek];
            const schedule = user.workSchedule[dayKey];
            if (!schedule) {
                return {
                    valid: false,
                    message: `Profissional nao trabalha neste dia (${dayKey})`,
                };
            }
            const [startTime, endTime] = schedule.split('-');
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);
            const [appointmentHour, appointmentMin] = time.split(':').map(Number);
            const appointmentMinutes = appointmentHour * 60 + appointmentMin;
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            if (appointmentMinutes < startMinutes || appointmentMinutes >= endMinutes) {
                return {
                    valid: false,
                    message: `Horario fora do expediente do profissional (${schedule})`,
                };
            }
            return { valid: true };
        }
        /**
         * Calcula comissao de um profissional
         */
        calculateCommission(user, totalValue) {
            const rate = user.commissionRate ? parseFloat(user.commissionRate) : 0.5;
            return totalValue * rate;
        }
        /**
         * Busca usuario por token de reset de senha
         */
        async findByPasswordResetToken(token) {
            const result = await this.db
                .select()
                .from(database_1.users)
                .where((0, drizzle_orm_1.eq)(database_1.users.passwordResetToken, token))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Gera token de criação de senha e envia link via WhatsApp
         * Token expira em 48 horas
         */
        async sendPasswordCreationLink(userId) {
            const user = await this.findById(userId);
            if (!user) {
                throw new common_1.BadRequestException('Usuario nao encontrado');
            }
            if (!user.phone) {
                throw new common_1.BadRequestException('Usuario nao possui telefone cadastrado');
            }
            if (!user.salonId) {
                throw new common_1.BadRequestException('Usuario nao possui salao vinculado');
            }
            // Busca nome do salão
            const salon = await this.salonsService.findById(user.salonId);
            if (!salon) {
                throw new common_1.BadRequestException('Salao nao encontrado');
            }
            // Gera token único (32 bytes = 64 caracteres hex)
            const token = crypto.randomBytes(32).toString('hex');
            const expires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 horas
            // Salva token no usuário
            await this.db
                .update(database_1.users)
                .set({
                passwordResetToken: token,
                passwordResetExpires: expires,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.users.id, userId));
            // Monta link
            const frontendUrl = this.configService.get('FRONTEND_URL') || 'https://app.beautymanager.com.br';
            const link = `${frontendUrl}/criar-senha?token=${token}`;
            // Monta mensagem
            const message = `Ola, ${user.name}!

Voce foi adicionado a equipe do *${salon.name}*!

Crie sua senha para acessar o sistema:
${link}

Link valido por 48 horas.`;
            // Envia via WhatsApp
            try {
                await this.whatsappService.sendMessage(user.salonId, user.phone, message);
                return { success: true, message: 'Link de criacao de senha enviado com sucesso' };
            }
            catch (error) {
                console.error('Erro ao enviar WhatsApp:', error);
                // Não falha se WhatsApp der erro, apenas loga
                return { success: true, message: 'Usuario criado. Link disponivel mas falha no envio WhatsApp.' };
            }
        }
        /**
         * Limpa o token de reset de senha após uso
         */
        async clearPasswordResetToken(userId) {
            await this.db
                .update(database_1.users)
                .set({
                passwordResetToken: null,
                passwordResetExpires: null,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.users.id, userId));
        }
    };
    return UsersService = _classThis;
})();
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map