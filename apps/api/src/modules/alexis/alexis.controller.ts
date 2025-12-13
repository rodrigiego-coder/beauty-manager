import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';
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
  @IsString()
  salonId!: string;

  @IsString()
  clientPhone!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  senderId?: string;

  @IsOptional()
  @IsIn(['client', 'agent'])
  senderType?: 'client' | 'agent';
}

class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsString()
  assistantName?: string;

  @IsOptional()
  @IsString()
  greetingMessage?: string;

  @IsOptional()
  @IsString()
  humanTakeoverMessage?: string;

  @IsOptional()
  @IsString()
  aiResumeMessage?: string;

  @IsOptional()
  @IsString()
  humanTakeoverCommand?: string;

  @IsOptional()
  @IsString()
  aiResumeCommand?: string;

  @IsOptional()
  @IsBoolean()
  autoSchedulingEnabled?: boolean;

  @IsOptional()
  @IsString()
  workingHoursStart?: string;

  @IsOptional()
  @IsString()
  workingHoursEnd?: string;
}

class DashboardChatDto {
  @IsString()
  message!: string;
}

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
}
