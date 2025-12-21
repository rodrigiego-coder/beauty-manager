import { Injectable, Inject, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, asc } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  triageForms,
  triageQuestions,
  triageResponses,
  triageAnswers,
  appointments,
  TriageForm,
  TriageQuestion,
  TriageResponse,
} from '../../database/schema';
import { randomBytes } from 'crypto';

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

@Injectable()
export class TriageService {
  private readonly logger = new Logger(TriageService.name);

  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

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

    // Tenta encontrar form específico para o serviço
    if (serviceId) {
      const specificForm = forms.find((form: TriageForm) => {
        if (!form.serviceIds) return false;
        return (form.serviceIds as number[]).includes(serviceId);
      });
      if (specificForm) return specificForm;
    }

    // Retorna form padrão (QUIMICA ou primeiro disponível)
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

    // Agrupa por categoria
    const groupedQuestions = this.groupQuestionsByCategory(questions);

    return {
      ...form,
      questions,
      groupedQuestions,
    };
  }

  /**
   * Cria resposta de triagem para um agendamento
   */
  async createTriageResponse(
    salonId: string,
    appointmentId: string,
    formId: string,
    clientId?: string,
  ): Promise<any> {
    // Verifica se já existe resposta para este agendamento
    const [existing] = await this.db
      .select()
      .from(triageResponses)
      .where(eq(triageResponses.appointmentId, appointmentId))
      .limit(1);

    if (existing) {
      return {
        ...existing,
        publicLink: this.generatePublicLink(existing.accessToken),
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
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Gera token único para acesso público
    const accessToken = randomBytes(32).toString('hex');

    const [response] = await this.db
      .insert(triageResponses)
      .values({
        salonId,
        appointmentId,
        formId,
        clientId: clientId || null,
        formVersion: form.version,
        status: 'PENDING',
        expiresAt: appointmentDate,
        accessToken,
      })
      .returning();

    this.logger.log(`Triagem criada para agendamento ${appointmentId}, token: ${accessToken.substring(0, 8)}...`);

    return {
      ...response,
      publicLink: this.generatePublicLink(accessToken),
    };
  }

  /**
   * Busca resposta por token (acesso público)
   */
  async getResponseByToken(token: string): Promise<TriageResponse | null> {
    const [response] = await this.db
      .select()
      .from(triageResponses)
      .where(eq(triageResponses.accessToken, token))
      .limit(1);

    return response || null;
  }

  /**
   * Submete respostas do formulário
   */
  async submitTriageAnswers(
    responseId: string,
    answers: TriageAnswerInput[],
    consentAccepted: boolean,
    ipAddress?: string,
  ): Promise<any> {
    const [response] = await this.db
      .select()
      .from(triageResponses)
      .where(eq(triageResponses.id, responseId))
      .limit(1);

    if (!response) {
      throw new NotFoundException('Resposta de triagem não encontrada');
    }

    if (response.status === 'COMPLETED') {
      throw new BadRequestException('Este formulário já foi preenchido');
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

        // Atualiza nível geral
        if (question.riskLevel === 'CRITICAL') overallRiskLevel = 'CRITICAL';
        else if (question.riskLevel === 'HIGH' && overallRiskLevel !== 'CRITICAL') overallRiskLevel = 'HIGH';
        else if (question.riskLevel === 'MEDIUM' && !['CRITICAL', 'HIGH'].includes(overallRiskLevel)) overallRiskLevel = 'MEDIUM';
      }

      // Salva resposta individual
      await this.db.insert(triageAnswers).values({
        responseId,
        questionId: answer.questionId,
        answerValue: answer.value,
        triggeredRisk,
        riskLevel: triggeredRisk ? question.riskLevel : null,
        riskMessage: triggeredRisk ? question.riskMessage : null,
      });
    }

    // Atualiza resposta principal
    const [updatedResponse] = await this.db
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
        updatedAt: new Date(),
      })
      .where(eq(triageResponses.id, responseId))
      .returning();

    this.logger.log(`Triagem ${responseId} concluída. Riscos: ${hasRisks}, Nível: ${overallRiskLevel}`);

    return {
      ...updatedResponse,
      blockers,
      canProceed: blockers.length === 0,
    };
  }

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

    return {
      ...response,
      answers,
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

  /**
   * Gera link público para preenchimento
   */
  generatePublicLink(token: string): string {
    const baseUrl = process.env.PUBLIC_URL || 'http://localhost:5173';
    return `${baseUrl}/pre-avaliacao/${token}`;
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

    // Para respostas booleanas
    if (question.answerType === 'BOOLEAN') {
      return normalizedAnswer === normalizedTrigger;
    }

    // Para outros tipos, verifica se contém o valor de trigger
    return normalizedAnswer.includes(normalizedTrigger);
  }
}
