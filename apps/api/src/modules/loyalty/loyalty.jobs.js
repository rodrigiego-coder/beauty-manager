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
exports.LoyaltyJobs = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const is_jest_1 = require("../../common/is-jest");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema = __importStar(require("../../database/schema"));
let LoyaltyJobs = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _processExpiredPoints_decorators;
    let _processBirthdayPoints_decorators;
    let _processExpiredVouchers_decorators;
    let _generateWeeklyReport_decorators;
    var LoyaltyJobs = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _processExpiredPoints_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM, { disabled: is_jest_1.IS_JEST })];
            _processBirthdayPoints_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_8AM, { disabled: is_jest_1.IS_JEST })];
            _processExpiredVouchers_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM, { disabled: is_jest_1.IS_JEST })];
            _generateWeeklyReport_decorators = [(0, schedule_1.Cron)('0 7 * * 1', { disabled: is_jest_1.IS_JEST })];
            __esDecorate(this, null, _processExpiredPoints_decorators, { kind: "method", name: "processExpiredPoints", static: false, private: false, access: { has: obj => "processExpiredPoints" in obj, get: obj => obj.processExpiredPoints }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _processBirthdayPoints_decorators, { kind: "method", name: "processBirthdayPoints", static: false, private: false, access: { has: obj => "processBirthdayPoints" in obj, get: obj => obj.processBirthdayPoints }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _processExpiredVouchers_decorators, { kind: "method", name: "processExpiredVouchers", static: false, private: false, access: { has: obj => "processExpiredVouchers" in obj, get: obj => obj.processExpiredVouchers }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _generateWeeklyReport_decorators, { kind: "method", name: "generateWeeklyReport", static: false, private: false, access: { has: obj => "generateWeeklyReport" in obj, get: obj => obj.generateWeeklyReport }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LoyaltyJobs = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        loyaltyService = __runInitializers(this, _instanceExtraInitializers);
        logger = new common_1.Logger(LoyaltyJobs.name);
        constructor(loyaltyService) {
            this.loyaltyService = loyaltyService;
        }
        /**
         * Processa pontos expirados diariamente às 2AM
         */
        async processExpiredPoints() {
            this.logger.log('Iniciando processamento de pontos expirados...');
            try {
                // Get all salons with active loyalty programs
                const programs = await connection_1.db
                    .select()
                    .from(schema.loyaltyPrograms)
                    .where((0, drizzle_orm_1.eq)(schema.loyaltyPrograms.isActive, true));
                let totalExpired = 0;
                for (const program of programs) {
                    const expired = await this.loyaltyService.processExpiredPoints(program.salonId);
                    totalExpired += expired;
                }
                this.logger.log(`Processamento de pontos expirados concluído. Total: ${totalExpired} transações expiradas.`);
            }
            catch (error) {
                this.logger.error('Erro ao processar pontos expirados:', error);
            }
        }
        /**
         * Processa pontos de aniversário diariamente às 8AM
         */
        async processBirthdayPoints() {
            this.logger.log('Iniciando processamento de pontos de aniversário...');
            try {
                // Get all salons with active loyalty programs
                const programs = await connection_1.db
                    .select()
                    .from(schema.loyaltyPrograms)
                    .where((0, drizzle_orm_1.eq)(schema.loyaltyPrograms.isActive, true));
                let totalProcessed = 0;
                for (const program of programs) {
                    const processed = await this.loyaltyService.processBirthdayPoints(program.salonId);
                    totalProcessed += processed;
                }
                this.logger.log(`Processamento de aniversários concluído. Total: ${totalProcessed} clientes receberam pontos.`);
            }
            catch (error) {
                this.logger.error('Erro ao processar pontos de aniversário:', error);
            }
        }
        /**
         * Processa vouchers expirados diariamente às 3AM
         */
        async processExpiredVouchers() {
            this.logger.log('Iniciando processamento de vouchers expirados...');
            try {
                // Update expired vouchers using raw SQL for complex WHERE
                await connection_1.db.execute((0, drizzle_orm_1.sql) `
        UPDATE loyalty_redemptions
        SET status = 'EXPIRED'
        WHERE status = 'PENDING' AND expires_at < NOW()
      `);
                this.logger.log('Processamento de vouchers expirados concluído.');
            }
            catch (error) {
                this.logger.error('Erro ao processar vouchers expirados:', error);
            }
        }
        /**
         * Gera relatório semanal (toda segunda às 7AM)
         */
        async generateWeeklyReport() {
            this.logger.log('Gerando relatório semanal de fidelidade...');
            try {
                // Get all salons with active loyalty programs
                const programs = await connection_1.db
                    .select()
                    .from(schema.loyaltyPrograms)
                    .where((0, drizzle_orm_1.eq)(schema.loyaltyPrograms.isActive, true));
                for (const program of programs) {
                    const stats = await this.loyaltyService.getStats(program.salonId);
                    this.logger.log(`Relatório ${program.salonId}: ${stats.totalEnrolledClients} clientes, ${stats.pointsInCirculation} pontos em circulação`);
                }
                this.logger.log('Relatório semanal de fidelidade gerado.');
            }
            catch (error) {
                this.logger.error('Erro ao gerar relatório semanal:', error);
            }
        }
    };
    return LoyaltyJobs = _classThis;
})();
exports.LoyaltyJobs = LoyaltyJobs;
//# sourceMappingURL=loyalty.jobs.js.map