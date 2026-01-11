import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Headers,
  Ip,
} from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { TriageService } from './triage.service';
import { Public } from '../../common/decorators/public.decorator';

interface CreateTriageDto {
  appointmentId: string;
  formId: string;
  clientId?: string;
}

interface SubmitTriageDto {
  answers: Array<{
    questionId: string;
    value: string;
  }>;
  consentAccepted: boolean;
}

interface OverrideTriageDto {
  reason: string;
}

@Controller('triage')
export class TriageController {
  constructor(private readonly triageService: TriageService) {}

  // ==================== ROTAS AUTENTICADAS ====================

  /**
   * Lista todos os formulários do salão
   */
  @SkipThrottle()
  @Get('forms')
  async listForms(@Req() req: any) {
    const salonId = req.user.salonId;
    return this.triageService.listForms(salonId);
  }

  /**
   * Busca formulário com perguntas
   */
  @SkipThrottle()
  @Get('forms/:formId')
  async getForm(@Param('formId') formId: string) {
    return this.triageService.getFormWithQuestions(formId);
  }

  /**
   * Busca formulário para um serviço específico
   */
  @SkipThrottle()
  @Get('service/:serviceId')
  async getFormForService(@Req() req: any, @Param('serviceId') serviceId: string) {
    const salonId = req.user.salonId;
    const form = await this.triageService.getFormForService(salonId, parseInt(serviceId));

    if (!form) {
      return { form: null, message: 'Nenhum formulário de triagem configurado para este serviço' };
    }

    return this.triageService.getFormWithQuestions(form.id);
  }

  /**
   * Busca triagem de um agendamento
   */
  @SkipThrottle()
  @Get('appointment/:appointmentId')
  async getTriageForAppointment(@Param('appointmentId') appointmentId: string) {
    const triage = await this.triageService.getTriageForAppointment(appointmentId);

    if (!triage) {
      return { triage: null, message: 'Nenhuma triagem encontrada para este agendamento' };
    }

    return triage;
  }

  /**
   * Verifica se pode iniciar atendimento
   */
  @SkipThrottle()
  @Get('appointment/:appointmentId/can-start')
  async canStartAppointment(@Param('appointmentId') appointmentId: string) {
    return this.triageService.canStartAppointment(appointmentId);
  }

  /**
   * Cria resposta de triagem para agendamento
   */
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createTriageResponse(@Req() req: any, @Body() body: CreateTriageDto) {
    const salonId = req.user.salonId;

    if (!body.appointmentId || !body.formId) {
      throw new BadRequestException('appointmentId e formId são obrigatórios');
    }

    return this.triageService.createTriageResponse(
      salonId,
      body.appointmentId,
      body.formId,
      body.clientId,
    );
  }

  /**
   * Cria override de triagem (libera bloqueio)
   * CRÍTICO: Requer justificativa mínima de 20 caracteres
   */
  @Post('appointment/:appointmentId/override')
  @HttpCode(HttpStatus.OK)
  async createTriageOverride(
    @Param('appointmentId') appointmentId: string,
    @Body() body: OverrideTriageDto,
    @Req() req: any,
    @Ip() ip: string,
  ) {
    const user = req.user;

    if (!body.reason || body.reason.length < 20) {
      throw new BadRequestException('Justificativa obrigatória (mínimo 20 caracteres)');
    }

    await this.triageService.createTriageOverride(
      appointmentId,
      body.reason,
      user.id,
      user.name,
      user.role,
      ip,
    );

    return {
      success: true,
      message: 'Bloqueio liberado. Esta ação foi registrada.',
    };
  }

  // ==================== ROTAS PÚBLICAS (SEM AUTENTICAÇÃO) ====================

  /**
   * Busca formulário por token público
   * RATE LIMIT: 5 requests por minuto por IP
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get('public/:token')
  async getPublicForm(
    @Param('token') token: string,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.triageService.getResponseByToken(token, ip, userAgent);

    if (!result) {
      return {
        error: true,
        message: 'Formulário não encontrado ou link inválido',
      };
    }

    const { response, form } = result;

    // Se já foi completado
    if (response.status === 'COMPLETED') {
      return {
        completed: true,
        message: 'Este formulário já foi preenchido',
        completedAt: response.completedAt,
      };
    }

    return {
      response: {
        id: response.id,
        status: response.status,
        expiresAt: response.expiresAt,
      },
      form,
    };
  }

  /**
   * Submete respostas via token público
   * RATE LIMIT: 3 requests por minuto por IP
   */
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('public/:token/submit')
  @HttpCode(HttpStatus.OK)
  async submitPublicForm(
    @Param('token') token: string,
    @Body() body: SubmitTriageDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    if (!body.answers || !Array.isArray(body.answers)) {
      throw new BadRequestException('answers é obrigatório e deve ser um array');
    }

    if (body.answers.length === 0) {
      throw new BadRequestException('É necessário responder pelo menos uma pergunta');
    }

    const result = await this.triageService.submitTriageAnswers(
      token,
      body.answers,
      body.consentAccepted,
      ip,
      userAgent,
    );

    return {
      success: result.success,
      hasRisks: result.hasRisks,
      overallRiskLevel: result.overallRiskLevel,
      canProceed: result.canProceed,
      blockers: result.blockers,
      message: result.message,
    };
  }
}
