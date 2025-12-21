import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

@Controller('triage')
export class TriageController {
  constructor(private readonly triageService: TriageService) {}

  /**
   * Lista todos os formulários do salão
   */
  @Get('forms')
  async listForms(@Req() req: any) {
    const salonId = req.user.salonId;
    return this.triageService.listForms(salonId);
  }

  /**
   * Busca formulário com perguntas
   */
  @Get('forms/:formId')
  async getForm(@Param('formId') formId: string) {
    return this.triageService.getFormWithQuestions(formId);
  }

  /**
   * Busca formulário para um serviço específico
   */
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
  @Get('appointment/:appointmentId')
  async getTriageForAppointment(@Param('appointmentId') appointmentId: string) {
    const triage = await this.triageService.getTriageForAppointment(appointmentId);

    if (!triage) {
      return { triage: null, message: 'Nenhuma triagem encontrada para este agendamento' };
    }

    return triage;
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
   * ========================================
   * ROTAS PÚBLICAS (acesso via token)
   * ========================================
   */

  /**
   * Busca formulário por token público
   */
  @Public()
  @Get('public/:token')
  async getPublicForm(@Param('token') token: string) {
    const response = await this.triageService.getResponseByToken(token);

    if (!response) {
      throw new NotFoundException('Formulário não encontrado ou link inválido');
    }

    if (response.status === 'COMPLETED') {
      return {
        completed: true,
        message: 'Este formulário já foi preenchido',
        completedAt: response.completedAt,
      };
    }

    if (response.expiresAt && new Date(response.expiresAt) < new Date()) {
      return {
        expired: true,
        message: 'Este formulário expirou',
        expiresAt: response.expiresAt,
      };
    }

    // Busca o formulário completo com perguntas
    const form = await this.triageService.getFormWithQuestions(response.formId);

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
   */
  @Public()
  @Post('public/:token/submit')
  @HttpCode(HttpStatus.OK)
  async submitPublicForm(
    @Param('token') token: string,
    @Body() body: SubmitTriageDto,
    @Req() req: any,
  ) {
    const response = await this.triageService.getResponseByToken(token);

    if (!response) {
      throw new NotFoundException('Formulário não encontrado ou link inválido');
    }

    if (!body.answers || !Array.isArray(body.answers)) {
      throw new BadRequestException('answers é obrigatório e deve ser um array');
    }

    // Captura IP do cliente
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.ip;

    const result = await this.triageService.submitTriageAnswers(
      response.id,
      body.answers,
      body.consentAccepted,
      ipAddress,
    );

    return {
      success: true,
      hasRisks: result.hasRisks,
      overallRiskLevel: result.overallRiskLevel,
      canProceed: result.canProceed,
      blockers: result.blockers,
      message: result.canProceed
        ? 'Pré-avaliação concluída com sucesso!'
        : 'Pré-avaliação concluída. Atenção: existem condições que impedem o procedimento.',
    };
  }
}
