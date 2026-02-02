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
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../../database/schema"));
let OtpService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var OtpService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            OtpService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        whatsAppService;
        logger = new common_1.Logger(OtpService.name);
        OTP_EXPIRATION_MINUTES = 10;
        MAX_ATTEMPTS = 3;
        RESEND_COOLDOWN_SECONDS = 60;
        constructor(db, whatsAppService) {
            this.db = db;
            this.whatsAppService = whatsAppService;
        }
        /**
         * Gera um código OTP de 6 dígitos
         */
        generateCode() {
            return Math.floor(100000 + Math.random() * 900000).toString();
        }
        /**
         * Envia um novo código OTP
         */
        async sendOtp(salonId, dto, clientIp) {
            const { phone, type, holdId, appointmentId } = dto;
            // Verifica se há OTP recente para este telefone (cooldown)
            const recentOtp = await this.db
                .select()
                .from(schema.otpCodes)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.otpCodes.salonId, salonId), (0, drizzle_orm_1.eq)(schema.otpCodes.phone, phone), (0, drizzle_orm_1.eq)(schema.otpCodes.type, type), (0, drizzle_orm_1.isNull)(schema.otpCodes.usedAt), (0, drizzle_orm_1.gt)(schema.otpCodes.createdAt, new Date(Date.now() - this.RESEND_COOLDOWN_SECONDS * 1000))))
                .limit(1);
            if (recentOtp.length > 0) {
                const secondsRemaining = Math.ceil((new Date(recentOtp[0].createdAt).getTime() +
                    this.RESEND_COOLDOWN_SECONDS * 1000 -
                    Date.now()) /
                    1000);
                throw new common_1.BadRequestException(`Aguarde ${secondsRemaining} segundos antes de solicitar novo código`);
            }
            // Invalida OTPs anteriores do mesmo tipo para este telefone
            await this.db
                .update(schema.otpCodes)
                .set({ usedAt: new Date() })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.otpCodes.salonId, salonId), (0, drizzle_orm_1.eq)(schema.otpCodes.phone, phone), (0, drizzle_orm_1.eq)(schema.otpCodes.type, type), (0, drizzle_orm_1.isNull)(schema.otpCodes.usedAt)));
            // Gera novo código
            const code = this.generateCode();
            const expiresAt = new Date(Date.now() + this.OTP_EXPIRATION_MINUTES * 60 * 1000);
            // Salva no banco
            await this.db.insert(schema.otpCodes).values({
                salonId,
                type,
                phone,
                code,
                expiresAt,
                maxAttempts: this.MAX_ATTEMPTS,
                holdId,
                appointmentId,
                clientIp,
            });
            // Envia código via WhatsApp usando Z-API
            const sendResult = await this.whatsAppService.sendOtpCode(phone, code, this.OTP_EXPIRATION_MINUTES);
            if (!sendResult.success) {
                this.logger.error(`Falha ao enviar OTP via WhatsApp: ${sendResult.error}`);
                // Log para debug em dev (remover em produção)
                this.logger.warn(`[DEV] OTP para ${phone}: ${code}`);
            }
            else {
                this.logger.log(`OTP enviado com sucesso para ${phone}`);
            }
            return {
                message: sendResult.success
                    ? 'Código enviado com sucesso via WhatsApp'
                    : 'Código gerado (verifique suas mensagens)',
                expiresIn: this.OTP_EXPIRATION_MINUTES * 60,
            };
        }
        /**
         * Verifica um código OTP
         */
        async verifyOtp(salonId, dto) {
            const { phone, code, type } = dto;
            // Busca OTP válido
            const [otp] = await this.db
                .select()
                .from(schema.otpCodes)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.otpCodes.salonId, salonId), (0, drizzle_orm_1.eq)(schema.otpCodes.phone, phone), (0, drizzle_orm_1.eq)(schema.otpCodes.type, type), (0, drizzle_orm_1.isNull)(schema.otpCodes.usedAt), (0, drizzle_orm_1.gt)(schema.otpCodes.expiresAt, new Date())))
                .orderBy(schema.otpCodes.createdAt)
                .limit(1);
            if (!otp) {
                return {
                    valid: false,
                    message: 'Código expirado ou não encontrado. Solicite um novo código.',
                };
            }
            // Verifica tentativas
            if (otp.attempts >= otp.maxAttempts) {
                // Invalida o OTP
                await this.db
                    .update(schema.otpCodes)
                    .set({ usedAt: new Date() })
                    .where((0, drizzle_orm_1.eq)(schema.otpCodes.id, otp.id));
                return {
                    valid: false,
                    message: 'Número máximo de tentativas excedido. Solicite um novo código.',
                };
            }
            // Verifica código
            if (otp.code !== code) {
                // Incrementa tentativas
                await this.db
                    .update(schema.otpCodes)
                    .set({ attempts: otp.attempts + 1 })
                    .where((0, drizzle_orm_1.eq)(schema.otpCodes.id, otp.id));
                const remaining = otp.maxAttempts - otp.attempts - 1;
                return {
                    valid: false,
                    message: `Código incorreto. ${remaining} tentativa(s) restante(s).`,
                };
            }
            // Código válido - marca como usado
            await this.db
                .update(schema.otpCodes)
                .set({ usedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema.otpCodes.id, otp.id));
            this.logger.log(`OTP verificado com sucesso para ${phone}`);
            return {
                valid: true,
                message: 'Código verificado com sucesso',
            };
        }
        /**
         * Verifica se um telefone foi verificado recentemente (últimas 24h)
         */
        async isPhoneVerifiedRecently(salonId, phone) {
            const [verified] = await this.db
                .select()
                .from(schema.otpCodes)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.otpCodes.salonId, salonId), (0, drizzle_orm_1.eq)(schema.otpCodes.phone, phone), (0, drizzle_orm_1.eq)(schema.otpCodes.type, 'PHONE_VERIFICATION'), (0, drizzle_orm_1.gt)(schema.otpCodes.usedAt, new Date(Date.now() - 24 * 60 * 60 * 1000))))
                .limit(1);
            return !!verified;
        }
        /**
         * Limpa OTPs expirados (job de limpeza)
         */
        async cleanupExpiredOtps() {
            await this.db
                .delete(schema.otpCodes)
                .where((0, drizzle_orm_1.lt)(schema.otpCodes.expiresAt, new Date(Date.now() - 24 * 60 * 60 * 1000)));
            this.logger.log(`OTPs expirados removidos`);
            return 0; // Drizzle não retorna count facilmente
        }
    };
    return OtpService = _classThis;
})();
exports.OtpService = OtpService;
//# sourceMappingURL=otp.service.js.map