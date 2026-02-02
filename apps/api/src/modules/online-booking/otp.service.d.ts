import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { SendOtpDto, VerifyOtpDto } from './dto';
import { WhatsAppService } from '../automation/whatsapp.service';
export declare class OtpService {
    private readonly db;
    private readonly whatsAppService;
    private readonly logger;
    private readonly OTP_EXPIRATION_MINUTES;
    private readonly MAX_ATTEMPTS;
    private readonly RESEND_COOLDOWN_SECONDS;
    constructor(db: NodePgDatabase<typeof schema>, whatsAppService: WhatsAppService);
    /**
     * Gera um código OTP de 6 dígitos
     */
    private generateCode;
    /**
     * Envia um novo código OTP
     */
    sendOtp(salonId: string, dto: SendOtpDto, clientIp?: string): Promise<{
        message: string;
        expiresIn: number;
    }>;
    /**
     * Verifica um código OTP
     */
    verifyOtp(salonId: string, dto: VerifyOtpDto): Promise<{
        valid: boolean;
        message: string;
    }>;
    /**
     * Verifica se um telefone foi verificado recentemente (últimas 24h)
     */
    isPhoneVerifiedRecently(salonId: string, phone: string): Promise<boolean>;
    /**
     * Limpa OTPs expirados (job de limpeza)
     */
    cleanupExpiredOtps(): Promise<number>;
}
//# sourceMappingURL=otp.service.d.ts.map