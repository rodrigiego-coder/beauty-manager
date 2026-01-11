import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, and, asc, sql, lte } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  triageForms,
  triageQuestions,
  triageResponses,
  triageAnswers,
  triageOverrides,
  appointments,
  appointmentNotifications,
  TriageForm,
  TriageQuestion,
  TriageResponse,
} from '../../database/schema';
import { randomBytes, createHash } from 'crypto';
import { format, addHours, min } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AuditService } from '../audit/audit.service';

interface TriageAnswerInput {
  questionId: string;
  value: string;
}

interface RiskData {
  questionId: string;
  question: string;
  answer: string;
  message: string | null;
  level: string;
}

interface RiskSummary {
  critical: RiskData[];
  high: RiskData[];
  medium: RiskData[];
  low: RiskData[];
}

// Máximo de tentativas de acesso por token
const MAX_ACCESS_ATTEMPTS = 10;

// Tempo de expiração padrão (72h) se agendamento não tiver data
const DEFAULT_EXPIRATION_HOURS = 72;

@Injectable()
export class TriageService {
  private readonly logger = new Logger(TriageService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private readonly auditService: AuditService,
  ) {}

  // ==================== UTILIDADES DE SEGURANÇA ====================

  /**
   * Gera hash SHA-256 do token
   * IMPORTANTE: Token raw NUNCA é armazenado
   */
  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Gera token criptograficamente seguro
   */
  private generateSecureToken(): { raw: string; hash: string } {
    const raw = randomBytes(32).toString('hex'); // 64 chars
    const hash = this.hashToken(raw);
    return { raw, hash };
  }

  /**
   * Mascara token para logs (nunca expor token completo)
   */
  private maskToken(token: string): string {
    if (!token || token.length < 12) return '***';
    return `${token.substring(0, 8)}...${token.substring(token.length - 4)}`;
  }

  // ==================== FORMULÁRIOS ====================

  /**
   * Busca formulário ativo para um serviço
   */
  async getFormForService(salonId: string, serviceId?: number): Promise<TriageForm | null> {
    const forms = await this.db
      .select()
      .from(triageForms)
      .where(
        and(
          eq(triageForms.salonId, salonId),
          eq(triageForms.isActive, true),
        ),
      );

    if (!forms.length) return null;

    if (serviceId) {
      const specificForm = forms.find((form: TriageForm) => {
        if (!form.serviceIds) return false;
        return (form.serviceIds as number[]).includes(serviceId);
      });
      if (specificForm) return specificForm;
    }

    return forms.find((f: TriageForm) => f.serviceCategory === 'QUIMICA') || forms[0];
  }

  /**
   * Busca formulário com suas perguntas
   */
  async getFormWithQuestions(formId: string): Promise<any> {
    const [form] = await this.db
      .select()
      .from(triageForms)
      .where(eq(triageForms.id, formId))
      .limit(1);

    if (!form) {
      throw new NotFoundException('Formulário não encontrado');
    }

    const questions = await this.db
      .select()
      .from(triageQuestions)
      .where(
        and(
          eq(triageQuestions.formId, formId),
          eq(triageQuestions.isActive, true),
        ),
      )
      .orderBy(asc(triageQuestions.sortOrder));

    const groupedQuestions = this.groupQuestionsByCategory(questions);

    return {
      ...form,
      questions,
      groupedQuestions,
    };
  }

  /**
   * Lista todos os formulários de um salão
   */
  async listForms(salonId: string): Promise<TriageForm[]> {
    return this.db
      .select()
      .from(triageForms)
      .where(eq(triageForms.salonId, salonId))
      .orderBy(asc(triageForms.name));
  }

  // ==================== CRIAÇÃO DE TRIAGEM ====================

  /**
   * Cria resposta de triagem para um agendamento
   * SEGURANÇA: Armazena apenas hash do token
   */
  async createTriageResponse(
    salonId: string,
    appointmentId: string,
    formId: string,
    clientId?: string,
  ): Promise<{ id: string; publicLink: string; expiresAt: Date; alreadyExists?: boolean }> {
    // Verifica se já existe resposta para este agendamento
    const [existing] = await this.db
      .select()
      .from(triageResponses)
      .where(eq(triageResponses.appointmentId, appointmentId))
      .limit(1);

    if (existing) {
      // Se já existe e está pendente, regenerar token
      if (existing.status === 'PENDING' && !existing.usedAt) {
        const { raw, hash } = this.generateSecureToken();

        await this.db
          .update(triageResponses)
          .set({
            tokenHash: hash,
            accessToken: null, // Remove token legado
            accessAttempts: 0,
            updatedAt: new Date(),
          })
          .where(eq(triageResponses.id, existing.id));

        return {
          id: existing.id,
          publicLink: this.generatePublicLink(raw),
          expiresAt: existing.expiresAt,
          alreadyExists: true,
        };
      }

      // Já foi usado ou completado
      return {
        id: existing.id,
        publicLink: '', // Não gerar novo link
        expiresAt: existing.expiresAt,
        alreadyExists: true,
      };
    }

    const [form] = await this.db
      .select()
      .from(triageForms)
      .where(eq(triageForms.id, formId))
      .limit(1);

    if (!form) {
      throw new NotFoundException('Formulário não encontrado');
    }

    // Busca data do agendamento para calcular expiração
    const [appointment] = await this.db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    const appointmentDate = appointment?.date
      ? new Date(`${appointment.date}T${appointment.time || appointment.startTime || '23:59'}:00`)
      : addHours(new Date(), DEFAULT_EXPIRATION_HOURS);

    // Expiração: menor entre 72h ou data do agendamento
    const expiresAt = min([
      addHours(new Date(), DEFAULT_EXPIRATION_HOURS),
      appointmentDate,
    ]);

    // Gera token seguro
    const { raw, hash } = this.generateSecureToken();

    const [response] = await this.db
      .insert(triageResponses)
      .values({
        salonId,
        appointmentId,
        formId,
        clientId: clientId || null,
        formVersion: form.version,
        status: 'PENDING',
        expiresAt,
        tokenHash: hash,        // ← Armazena HASH
        accessToken: null,       // ← Não armazena token raw
        accessAttempts: 0,
      })
      .returning();

    this.logger.log(
      `Triagem criada para agendamento ${appointmentId}, token: ${this.maskToken(raw)}`,
    );

    return {
      id: response.id,
      publicLink: this.generatePublicLink(raw),
      expiresAt,
    };
  }

  // ==================== ACESSO PÚBLICO (COM SEGURANÇA) ====================

  /**
   * Busca resposta por token (acesso público)
   * SEGURANÇA: Valida hash, expiração, uso único, rate limit
   */
  async getResponseByToken(
    rawToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ response: TriageResponse; form: any } | null> {
    const tokenHash = this.hashToken(rawToken);

    // Busca por hash (não por token raw)
    const [response] = await this.db
      .select()
      .from(triageResponses)
      .where(eq(triageResponses.tokenHash, tokenHash))
      .limit(1);

    // Fallback: busca por token legado (migração)
    if (!response) {
      const [legacyResponse] = await this.db
        .select()
        .from(triageResponses)
        .where(eq(triageResponses.accessToken, rawToken))
        .limit(1);

      if (legacyResponse) {
        // Migra para hash
        await this.db
          .update(triageResponses)
          .set({
            tokenHash,
            accessToken: null,
          })
          .where(eq(triageResponses.id, legacyResponse.id));

        return this.validateAndReturnResponse(legacyResponse, ipAddress, userAgent);
      }

      throw new NotFoundException('Triagem não encontrada');
    }

    return this.validateAndReturnResponse(response, ipAddress, userAgent);
  }

  /**
   * Valida resposta e retorna com formulário
   */
  private async validateAndReturnResponse(
    response: TriageResponse,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ response: TriageResponse; form: any }> {
    // 1. Verifica rate limit (accessAttempts pode ser null em registros antigos)
    const attempts = response.accessAttempts ?? 0;
    if (attempts >= MAX_ACCESS_ATTEMPTS) {
      this.logger.warn(`Rate limit excedido para triagem ${response.id}`);
      throw new ForbiddenException('Muitas tentativas de acesso. Solicite novo link.');
    }

    // 2. Verifica expiração
    if (response.expiresAt && new Date() > new Date(response.expiresAt)) {
      await this.db
        .update(triageResponses)
        .set({ status: 'EXPIRED' })
        .where(eq(triageResponses.id, response.id));

      await this.auditService.log({
        salonId: response.salonId,
        entityType: 'triage',
        entityId: response.id,
        action: 'TOKEN_EXPIRED',
        ipAddress,
        userAgent,
      });

      throw new BadRequestException('Link expirado. Solicite novo link ao salão.');
    }

    // 3. Verifica uso único
    if (response.usedAt) {
      throw new BadRequestException('Este formulário já foi preenchido.');
    }

    // 4. Verifica se foi invalidado
    if (response.invalidatedAt) {
      throw new BadRequestException(`Link invalidado: ${response.invalidatedReason || 'Motivo não informado'}`);
    }

    // 5. Registra acesso
    await this.db
      .update(triageResponses)
      .set({
        accessAttempts: sql`${triageResponses.accessAttempts} + 1`,
        lastAccessIp: ipAddress,
        lastAccessUserAgent: userAgent,
        updatedAt: new Date(),
      })
      .where(eq(triageResponses.id, response.id));

    // 6. Audit log
    await this.auditService.logPublicAccess({
      salonId: response.salonId,
      entityType: 'triage',
      entityId: response.id,
      ipAddress,
      userAgent,
      metadata: { accessAttempts: attempts + 1 },
    });

    // 7. Busca formulário com perguntas
    const form = await this.getFormWithQuestions(response.formId);

    return { response, form };
  }

  // ==================== SUBMISSÃO DE RESPOSTAS ====================

  /**
   * Submete respostas do formulário
   * SEGURANÇA: Marca token como usado após submissão
   */
  async submitTriageAnswers(
    rawToken: string,
    answers: TriageAnswerInput[],
    consentAccepted: boolean,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<any> {
    const tokenHash = this.hashToken(rawToken);

    // Busca por hash
    let [response] = await this.db
      .select()
      .from(triageResponses)
      .where(eq(triageResponses.tokenHash, tokenHash))
      .limit(1);

    // Fallback legado
    if (!response) {
      [response] = await this.db
        .select()
        .from(triageResponses)
        .where(eq(triageResponses.accessToken, rawToken))
        .limit(1);
    }

    if (!response) {
      throw new NotFoundException('Triagem não encontrada');
    }

    // Validações de segurança
    if (response.status === 'COMPLETED') {
      throw new BadRequestException('Este formulário já foi preenchido');
    }

    if (response.usedAt) {
      throw new BadRequestException('Este link já foi utilizado');
    }

    if (response.expiresAt && new Date(response.expiresAt) < new Date()) {
      throw new BadRequestException('Este formulário expirou');
    }

    if (!consentAccepted) {
      throw new BadRequestException('É necessário aceitar o termo de responsabilidade');
    }

    // Busca perguntas para analisar riscos
    const questions = await this.db
      .select()
      .from(triageQuestions)
      .where(eq(triageQuestions.formId, response.formId));

    const questionsMap = new Map<string, TriageQuestion>(
      questions.map((q: TriageQuestion) => [q.id, q]),
    );

    // Analisa riscos e salva respostas
    const riskSummary: RiskSummary = { critical: [], high: [], medium: [], low: [] };
    let hasRisks = false;
    let overallRiskLevel = 'LOW';
    const blockers: string[] = [];

    for (const answer of answers) {
      const question = questionsMap.get(answer.questionId);
      if (!question) continue;

      const triggeredRisk = this.checkRiskTrigger(question, answer.value);

      if (triggeredRisk) {
        hasRisks = true;
        const riskData: RiskData = {
          questionId: question.id,
          question: question.questionText,
          answer: answer.value,
          message: question.riskMessage,
          level: question.riskLevel,
        };

        const level = question.riskLevel.toLowerCase() as keyof RiskSummary;
        riskSummary[level].push(riskData);

        if (question.blocksProcedure) {
          blockers.push(question.riskMessage || question.questionText);
        }

        if (question.riskLevel === 'CRITICAL') overallRiskLevel = 'CRITICAL';
        else if (question.riskLevel === 'HIGH' && overallRiskLevel !== 'CRITICAL') overallRiskLevel = 'HIGH';
        else if (question.riskLevel === 'MEDIUM' && !['CRITICAL', 'HIGH'].includes(overallRiskLevel)) overallRiskLevel = 'MEDIUM';
      }

      await this.db.insert(triageAnswers).values({
        responseId: response.id,
        questionId: answer.questionId,
        answerValue: answer.value,
        triggeredRisk,
        riskLevel: triggeredRisk ? question.riskLevel : null,
        riskMessage: triggeredRisk ? question.riskMessage : null,
      });
    }

    // Atualiza resposta principal - MARCA COMO USADO
    await this.db
      .update(triageResponses)
      .set({
        status: 'COMPLETED',
        hasRisks,
        riskSummary,
        overallRiskLevel: hasRisks ? overallRiskLevel : null,
        consentAccepted,
        consentAcceptedAt: new Date(),
        consentIpAddress: ipAddress || null,
        completedAt: new Date(),
        completedVia: 'WEB',
        usedAt: new Date(),  // ← MARCA TOKEN COMO USADO
        tokenHash: null,     // ← INVALIDA HASH (opcional, extra segurança)
        updatedAt: new Date(),
      })
      .where(eq(triageResponses.id, response.id));

    // Audit log
    await this.auditService.log({
      salonId: response.salonId,
      entityType: 'triage',
      entityId: response.id,
      action: 'TOKEN_USED',
      ipAddress,
      userAgent,
      metadata: {
        hasRisks,
        overallRiskLevel,
        blockersCount: blockers.length,
      },
    });

    this.logger.log(
      `Triagem ${response.id} concluída. Riscos: ${hasRisks}, Nível: ${overallRiskLevel}`,
    );

    // Notificar cliente
    await this.scheduleTriageCompletedNotification(response, hasRisks, overallRiskLevel);

    if (riskSummary.critical.length > 0) {
      this.logger.warn(`ALERTA: Triagem com risco CRÍTICO - Agendamento ${response.appointmentId}`);
    }

    return {
      success: true,
      hasRisks,
      overallRiskLevel: hasRisks ? overallRiskLevel : null,
      canProceed: blockers.length === 0,
      blockers,
      message: blockers.length > 0
        ? 'Foram identificados riscos que impedem o procedimento. Entre em contato com o salão.'
        : hasRisks
          ? 'Triagem concluída. Alguns pontos de atenção foram identificados.'
          : 'Triagem concluída com sucesso!',
    };
  }

  /**
   * Agenda notificação de triagem concluída
   */
  private async scheduleTriageCompletedNotification(
    response: TriageResponse,
    hasRisks: boolean,
    overallRiskLevel: string,
  ): Promise<void> {
    try {
      const [appointment] = await this.db
        .select()
        .from(appointments)
        .where(eq(appointments.id, response.appointmentId))
        .limit(1);

      if (!appointment?.clientPhone) return;

      const dateFormatted = format(new Date(appointment.date), "EEEE, dd 'de' MMMM", {
        locale: ptBR,
      });

      // DedupeKey para idempotência
      const dedupeKey = `${response.appointmentId}:TRIAGE_COMPLETED`;

      await this.db.insert(appointmentNotifications).values({
        salonId: response.salonId,
        appointmentId: response.appointmentId,
        recipientPhone: this.formatPhone(appointment.clientPhone),
        recipientName: appointment.clientName,
        notificationType: 'TRIAGE_COMPLETED',
        templateVariables: {
          nome: appointment.clientName || 'Cliente',
          data: dateFormatted,
          horario: appointment.time || appointment.startTime,
          hasRisks: hasRisks ? 'true' : 'false',
          riskLevel: overallRiskLevel,
        },
        scheduledFor: new Date(),
        status: 'PENDING',
        dedupeKey,
      });

      this.logger.log(`Notificação TRIAGE_COMPLETED agendada para ${appointment.clientPhone}`);
    } catch (error: any) {
      // Ignora erro de duplicidade (idempotência)
      if (error.code === '23505') {
        this.logger.debug('Notificação TRIAGE_COMPLETED já existe (idempotente)');
        return;
      }
      this.logger.warn(`Erro ao notificar conclusão de triagem: ${error}`);
    }
  }

  // ==================== CONSULTAS ====================

  /**
   * Busca respostas de triagem de um agendamento
   */
  async getTriageForAppointment(appointmentId: string): Promise<any> {
    const [response] = await this.db
      .select()
      .from(triageResponses)
      .where(eq(triageResponses.appointmentId, appointmentId))
      .limit(1);

    if (!response) {
      return null;
    }

    const answers = await this.db
      .select({
        id: triageAnswers.id,
        answerValue: triageAnswers.answerValue,
        triggeredRisk: triageAnswers.triggeredRisk,
        riskLevel: triageAnswers.riskLevel,
        riskMessage: triageAnswers.riskMessage,
        questionText: triageQuestions.questionText,
        category: triageQuestions.category,
        categoryLabel: triageQuestions.categoryLabel,
      })
      .from(triageAnswers)
      .leftJoin(triageQuestions, eq(triageAnswers.questionId, triageQuestions.id))
      .where(eq(triageAnswers.responseId, response.id));

    // Busca overrides se houver
    const overrides = await this.db
      .select()
      .from(triageOverrides)
      .where(eq(triageOverrides.triageId, response.id));

    return {
      ...response,
      answers,
      overrides,
      hasOverride: overrides.length > 0,
    };
  }

  /**
   * Verifica se pode iniciar atendimento
   */
  async canStartAppointment(appointmentId: string): Promise<{
    canStart: boolean;
    reason?: string;
    triageStatus?: string;
    hasBlockers?: boolean;
    hasOverride?: boolean;
  }> {
    const triage = await this.getTriageForAppointment(appointmentId);

    // Sem triagem = pode iniciar
    if (!triage) {
      return { canStart: true };
    }

    // Triagem pendente
    if (triage.status === 'PENDING') {
      return {
        canStart: false,
        reason: 'Aguardando preenchimento da pré-avaliação pelo cliente.',
        triageStatus: 'PENDING',
      };
    }

    // Triagem com blockers (riscos críticos)
    if (triage.riskSummary?.critical?.length > 0 && !triage.hasOverride) {
      return {
        canStart: false,
        reason: 'Triagem com riscos críticos que impedem o procedimento.',
        triageStatus: 'BLOCKED',
        hasBlockers: true,
      };
    }

    // Triagem com override
    if (triage.hasOverride) {
      return {
        canStart: true,
        triageStatus: 'OVERRIDE',
        hasOverride: true,
      };
    }

    return { canStart: true, triageStatus: 'OK' };
  }

  /**
   * Cria override de triagem (libera atendimento bloqueado)
   */
  async createTriageOverride(
    appointmentId: string,
    reason: string,
    userId: string,
    userName: string,
    userRole: string,
    ipAddress?: string,
  ): Promise<void> {
    if (!reason || reason.length < 20) {
      throw new BadRequestException('Justificativa deve ter no mínimo 20 caracteres');
    }

    const triage = await this.getTriageForAppointment(appointmentId);

    if (!triage) {
      throw new NotFoundException('Triagem não encontrada para este agendamento');
    }

    if (triage.status !== 'COMPLETED') {
      throw new BadRequestException('Só é possível criar override para triagens completas');
    }

    // Cria override
    await this.db.insert(triageOverrides).values({
      triageId: triage.id,
      appointmentId,
      userId,
      userName,
      userRole,
      reason,
      ipAddress,
    });

    // Audit log crítico
    await this.auditService.logCriticalOverride({
      salonId: triage.salonId,
      triageId: triage.id,
      appointmentId,
      userId,
      userName,
      userRole,
      ipAddress,
      reason,
      riskLevel: triage.overallRiskLevel,
      blockers: triage.riskSummary?.critical?.map((r: RiskData) => r.message) || [],
    });

    this.logger.warn(
      `OVERRIDE CRÍTICO: Triagem ${triage.id} liberada por ${userName} (${userRole}). Motivo: ${reason}`,
    );
  }

  // ==================== UTILITÁRIOS ====================

  /**
   * Gera link público para preenchimento
   */
  generatePublicLink(token: string): string {
    const baseUrl = process.env.PUBLIC_URL || 'http://localhost:5173';
    return `${baseUrl}/pre-avaliacao/${token}`;
  }

  /**
   * Formata telefone para padrão internacional
   */
  private formatPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      cleaned = '55' + cleaned;
    }
    return cleaned;
  }

  /**
   * Monta resumo de riscos para mensagem WhatsApp
   */
  buildRiskSummaryForWhatsApp(response: any): string {
    if (!response?.hasRisks) {
      return '✅ Pré-avaliação concluída. Nenhum risco identificado.';
    }

    let summary = '⚠️ *ALERTAS DA PRÉ-AVALIAÇÃO:*\n\n';

    if (response.riskSummary?.critical?.length > 0) {
      summary += '🔴 *CRÍTICOS (Impedem procedimento):*\n';
      response.riskSummary.critical.forEach((r: RiskData) => {
        summary += `• ${r.message}\n`;
      });
      summary += '\n';
    }

    if (response.riskSummary?.high?.length > 0) {
      summary += '🟠 *ALTOS (Atenção especial):*\n';
      response.riskSummary.high.forEach((r: RiskData) => {
        summary += `• ${r.message}\n`;
      });
      summary += '\n';
    }

    if (response.riskSummary?.medium?.length > 0) {
      summary += '🟡 *MÉDIOS (Cuidado):*\n';
      response.riskSummary.medium.forEach((r: RiskData) => {
        summary += `• ${r.message}\n`;
      });
    }

    return summary;
  }

  /**
   * Agrupa perguntas por categoria
   */
  private groupQuestionsByCategory(questions: TriageQuestion[]): any[] {
    const groups: Record<string, { category: string; label: string; questions: TriageQuestion[] }> = {};

    for (const q of questions) {
      const cat = q.category || 'CUSTOM';
      if (!groups[cat]) {
        groups[cat] = {
          category: cat,
          label: q.categoryLabel || cat,
          questions: [],
        };
      }
      groups[cat].questions.push(q);
    }

    return Object.values(groups);
  }

  /**
   * Verifica se resposta dispara risco
   */
  private checkRiskTrigger(question: TriageQuestion, answerValue: string): boolean {
    const triggerValue = question.riskTriggerValue || 'SIM';
    const normalizedAnswer = answerValue.toUpperCase().trim();
    const normalizedTrigger = triggerValue.toUpperCase().trim();

    if (question.answerType === 'BOOLEAN') {
      return normalizedAnswer === normalizedTrigger;
    }

    return normalizedAnswer.includes(normalizedTrigger);
  }

  // ==================== MANUTENÇÃO ====================

  /**
   * Invalida triagens expiradas (job de limpeza)
   */
  async invalidateExpiredTriages(): Promise<number> {
    const result = await this.db
      .update(triageResponses)
      .set({
        status: 'EXPIRED',
        invalidatedAt: new Date(),
        invalidatedReason: 'Expiração automática',
      })
      .where(
        and(
          eq(triageResponses.status, 'PENDING'),
          lte(triageResponses.expiresAt, new Date()),
        ),
      )
      .returning();

    if (result.length > 0) {
      this.logger.log(`${result.length} triagens expiradas invalidadas`);
    }

    return result.length;
  }
}
