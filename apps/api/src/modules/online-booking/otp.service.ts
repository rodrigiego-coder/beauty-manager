import {
  Injectable,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { eq, and, isNull, gt, lt } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { SendOtpDto, VerifyOtpDto } from './dto';
import { WhatsAppService } from '../automation/whatsapp.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_EXPIRATION_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;
  private readonly RESEND_COOLDOWN_SECONDS = 60;

  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  /**
   * Gera um código OTP de 6 dígitos
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Envia um novo código OTP
   */
  async sendOtp(
    salonId: string,
    dto: SendOtpDto,
    clientIp?: string,
  ): Promise<{ message: string; expiresIn: number }> {
    const { phone, type, holdId, appointmentId } = dto;

    // Verifica se há OTP recente para este telefone (cooldown)
    const recentOtp = await this.db
      .select()
      .from(schema.otpCodes)
      .where(
        and(
          eq(schema.otpCodes.salonId, salonId),
          eq(schema.otpCodes.phone, phone),
          eq(schema.otpCodes.type, type),
          isNull(schema.otpCodes.usedAt),
          gt(
            schema.otpCodes.createdAt,
            new Date(Date.now() - this.RESEND_COOLDOWN_SECONDS * 1000),
          ),
        ),
      )
      .limit(1);

    if (recentOtp.length > 0) {
      const secondsRemaining = Math.ceil(
        (new Date(recentOtp[0].createdAt).getTime() +
          this.RESEND_COOLDOWN_SECONDS * 1000 -
          Date.now()) /
          1000,
      );
      throw new BadRequestException(
        `Aguarde ${secondsRemaining} segundos antes de solicitar novo código`,
      );
    }

    // Invalida OTPs anteriores do mesmo tipo para este telefone
    await this.db
      .update(schema.otpCodes)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(schema.otpCodes.salonId, salonId),
          eq(schema.otpCodes.phone, phone),
          eq(schema.otpCodes.type, type),
          isNull(schema.otpCodes.usedAt),
        ),
      );

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
    const sendResult = await this.whatsAppService.sendOtpCode(
      phone,
      code,
      this.OTP_EXPIRATION_MINUTES,
    );

    if (!sendResult.success) {
      this.logger.error(`Falha ao enviar OTP via WhatsApp: ${sendResult.error}`);
      // Log para debug em dev (remover em produção)
      this.logger.warn(`[DEV] OTP para ${phone}: ${code}`);
    } else {
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
  async verifyOtp(
    salonId: string,
    dto: VerifyOtpDto,
  ): Promise<{ valid: boolean; message: string }> {
    const { phone, code, type } = dto;

    // Busca OTP válido
    const [otp] = await this.db
      .select()
      .from(schema.otpCodes)
      .where(
        and(
          eq(schema.otpCodes.salonId, salonId),
          eq(schema.otpCodes.phone, phone),
          eq(schema.otpCodes.type, type),
          isNull(schema.otpCodes.usedAt),
          gt(schema.otpCodes.expiresAt, new Date()),
        ),
      )
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
        .where(eq(schema.otpCodes.id, otp.id));

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
        .where(eq(schema.otpCodes.id, otp.id));

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
      .where(eq(schema.otpCodes.id, otp.id));

    this.logger.log(`OTP verificado com sucesso para ${phone}`);

    return {
      valid: true,
      message: 'Código verificado com sucesso',
    };
  }

  /**
   * Verifica se um telefone foi verificado recentemente (últimas 24h)
   */
  async isPhoneVerifiedRecently(
    salonId: string,
    phone: string,
  ): Promise<boolean> {
    const [verified] = await this.db
      .select()
      .from(schema.otpCodes)
      .where(
        and(
          eq(schema.otpCodes.salonId, salonId),
          eq(schema.otpCodes.phone, phone),
          eq(schema.otpCodes.type, 'PHONE_VERIFICATION'),
          gt(schema.otpCodes.usedAt, new Date(Date.now() - 24 * 60 * 60 * 1000)),
        ),
      )
      .limit(1);

    return !!verified;
  }

  /**
   * Limpa OTPs expirados (job de limpeza)
   */
  async cleanupExpiredOtps(): Promise<number> {
    await this.db
      .delete(schema.otpCodes)
      .where(lt(schema.otpCodes.expiresAt, new Date(Date.now() - 24 * 60 * 60 * 1000)));

    this.logger.log(`OTPs expirados removidos`);
    return 0; // Drizzle não retorna count facilmente
  }
}
