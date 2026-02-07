import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { AlexisService } from './alexis.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

/**
 * =====================================================
 * ALEXIS CONTROLLER
 * API para IA WhatsApp & Dashboard
 * =====================================================
 */

// DTOs
class ProcessMessageDto {
  @ApiProperty({ description: 'ID do salão (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  salonId!: string;

  @ApiProperty({ description: 'Telefone do cliente', example: '11999998888' })
  @IsString()
  clientPhone!: string;

  @ApiProperty({ description: 'Mensagem recebida', example: 'Olá, gostaria de agendar um corte' })
  @IsString()
  message!: string;

  @ApiPropertyOptional({ description: 'Nome do cliente', example: 'Maria Silva' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ description: 'ID do remetente', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsOptional()
  @IsString()
  senderId?: string;

  @ApiPropertyOptional({ description: 'Tipo do remetente', enum: ['client', 'agent'], example: 'client' })
  @IsOptional()
  @IsIn(['client', 'agent'])
  senderType?: 'client' | 'agent';
}

class UpdateSettingsDto {
  @ApiPropertyOptional({ description: 'Alexis está habilitada', example: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Nome da assistente', example: 'Alexis' })
  @IsOptional()
  @IsString()
  assistantName?: string;

  @ApiPropertyOptional({ description: 'Mensagem de boas-vindas', example: 'Olá! Sou a Alexis, assistente virtual do salão.' })
  @IsOptional()
  @IsString()
  greetingMessage?: string;

  @ApiPropertyOptional({ description: 'Mensagem quando humano assume', example: 'Um atendente humano irá te atender agora.' })
  @IsOptional()
  @IsString()
  humanTakeoverMessage?: string;

  @ApiPropertyOptional({ description: 'Mensagem quando IA retoma', example: 'A Alexis voltou a te atender!' })
  @IsOptional()
  @IsString()
  aiResumeMessage?: string;

  @ApiPropertyOptional({ description: 'Comando para humano assumir', example: '#eu' })
  @IsOptional()
  @IsString()
  humanTakeoverCommand?: string;

  @ApiPropertyOptional({ description: 'Comando para IA retomar', example: '#ia' })
  @IsOptional()
  @IsString()
  aiResumeCommand?: string;

  @ApiPropertyOptional({ description: 'Agendamento automático habilitado', example: true })
  @IsOptional()
  @IsBoolean()
  autoSchedulingEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Restringir horário de funcionamento', example: false })
  @IsOptional()
  @IsBoolean()
  workingHoursEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Horário de início do expediente', example: '08:00' })
  @IsOptional()
  @IsString()
  workingHoursStart?: string;

  @ApiPropertyOptional({ description: 'Horário de fim do expediente', example: '18:00' })
  @IsOptional()
  @IsString()
  workingHoursEnd?: string;
}

class DashboardChatDto {
  @ApiProperty({ description: 'Mensagem para a Alexis', example: 'Quantos agendamentos tenho hoje?' })
  @IsString()
  message!: string;
}

@ApiTags('Alexis')
@Controller('alexis')
export class AlexisController {
  constructor(private readonly alexisService: AlexisService) {}

  // ==================== WHATSAPP ====================

  /**
   * Processa mensagem do WhatsApp (webhook ou chamada direta)
   * Pode ser do cliente ou do atendente
   */
  @Public()
  @Post('whatsapp/message')
  async processMessage(@Body() dto: ProcessMessageDto) {
    return this.alexisService.processWhatsAppMessage(
      dto.salonId,
      dto.clientPhone,
      dto.message,
      dto.clientName,
      dto.senderId,
      dto.senderType || 'client',
    );
  }

  /**
   * Lista conversas do WhatsApp
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @Get('whatsapp/conversations')
  async getConversations(@Request() req: any, @Query('status') status?: string) {
    return this.alexisService.getConversations(req.user.salonId, status);
  }

  /**
   * Busca mensagens de uma conversa
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @Get('whatsapp/conversations/:id/messages')
  async getMessages(@Param('id') id: string) {
    return this.alexisService.getMessages(id);
  }

  // ==================== DASHBOARD ====================

  /**
   * Gera briefing para o usuário logado
   */
  @UseGuards(AuthGuard)
  @Get('dashboard/briefing')
  async getBriefing(@Request() req: any) {
    return this.alexisService.generateBriefing(
      req.user.salonId,
      req.user.id,
      req.user.role,
      req.user.name,
    );
  }

  /**
   * Chat do dashboard com a Alexis
   */
  @UseGuards(AuthGuard)
  @Post('dashboard/chat')
  async dashboardChat(@Request() req: any, @Body() dto: DashboardChatDto) {
    return this.alexisService.processWhatsAppMessage(
      req.user.salonId,
      `dashboard-${req.user.id}`,
      dto.message,
      req.user.name,
      req.user.id,
      'client',
    );
  }

  // ==================== CONFIGURAÇÕES ====================

  /**
   * Obtém configurações da Alexis
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('settings')
  async getSettings(@Request() req: any) {
    return this.alexisService.getSettings(req.user.salonId);
  }

  /**
   * Atualiza configurações da Alexis
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Patch('settings')
  async updateSettings(@Request() req: any, @Body() dto: UpdateSettingsDto) {
    return this.alexisService.updateSettings(req.user.salonId, dto);
  }

  // ==================== LOGS ====================

  /**
   * Obtém logs de interação
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('logs')
  async getLogs(@Request() req: any, @Query('limit') limit?: string) {
    return this.alexisService.getInteractionLogs(req.user.salonId, limit ? parseInt(limit) : 100);
  }

  /**
   * Obtém logs de termos bloqueados
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('logs/blocked')
  async getBlockedLogs(@Request() req: any, @Query('limit') limit?: string) {
    return this.alexisService.getBlockedTermsLogs(
      req.user.salonId,
      limit ? parseInt(limit) : 100,
    );
  }

  // ==================== STATUS ====================

  /**
   * Verifica status da Alexis
   */
  @UseGuards(AuthGuard)
  @Get('status')
  async getStatus(@Request() req: any) {
    const settings = await this.alexisService.getSettings(req.user.salonId);
    const isGeminiAvailable = this.alexisService.isEnabled();

    return {
      isEnabled: settings?.isEnabled ?? true,
      isGeminiAvailable,
      assistantName: settings?.assistantName || 'Alexis',
      commands: {
        humanTakeover: settings?.humanTakeoverCommand || '#eu',
        aiResume: settings?.aiResumeCommand || '#ia',
      },
    };
  }

  // ==================== SESSIONS (Dashboard) ====================

  /**
   * Lista sessões de conversa
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @Get('sessions')
  async getSessions(@Request() req: any) {
    return this.alexisService.getSessions(req.user.salonId);
  }

  /**
   * Obtém mensagens de uma sessão
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @Get('sessions/:sessionId/messages')
  async getSessionMessages(@Request() req: any, @Param('sessionId') sessionId: string) {
    return this.alexisService.getSessionMessages(req.user.salonId, sessionId);
  }

  /**
   * Encerra uma sessão
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @Post('sessions/:sessionId/end')
  async endSession(@Request() req: any, @Param('sessionId') sessionId: string) {
    return this.alexisService.endSession(req.user.salonId, sessionId);
  }

  // ==================== COMPLIANCE ====================

  /**
   * Estatísticas de compliance ANVISA
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('compliance/stats')
  async getComplianceStats(@Request() req: any) {
    return this.alexisService.getComplianceStats(req.user.salonId);
  }

  // ==================== METRICS ====================

  /**
   * Métricas de uso da Alexis
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('metrics')
  async getMetrics(@Request() req: any) {
    return this.alexisService.getMetrics(req.user.salonId);
  }

  // ==================== TAKEOVER ====================

  /**
   * Atendente assume controle da conversa
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @Post('takeover')
  async takeover(@Request() req: any, @Body() dto: { sessionId: string }) {
    return this.alexisService.humanTakeover(req.user.salonId, dto.sessionId, req.user.id);
  }

  /**
   * Alexis retoma controle da conversa
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @Post('resume/:sessionId')
  async resume(@Request() req: any, @Param('sessionId') sessionId: string) {
    return this.alexisService.aiResume(req.user.salonId, sessionId);
  }

  /**
   * Envia mensagem como humano
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @Post('message/human')
  async sendHumanMessage(
    @Request() req: any,
    @Body() dto: { sessionId: string; message: string },
  ) {
    return this.alexisService.sendHumanMessage(
      req.user.salonId,
      dto.sessionId,
      dto.message,
      req.user.id,
    );
  }

  /**
   * Deleta histórico do chat do dashboard
   */
  @UseGuards(AuthGuard)
  @Delete('chat/history')
  async deleteChatHistory(@Request() req: any) {
    return this.alexisService.deleteDashboardChatHistory(req.user.id);
  }
}
