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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AutomationService } from './automation.service';
import {
  UpdateAutomationSettingsDto,
  CreateTemplateDto,
  UpdateTemplateDto,
  SendMessageDto,
  SendTestMessageDto,
  MessageLogFiltersDto,
  MessageChannel,
} from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Controller('automation')
@UseGuards(AuthGuard, RolesGuard)
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  // ==================== SETTINGS ====================

  /**
   * GET /automation/settings
   * Retorna configurações de automação do salão
   */
  @Get('settings')
  @Roles('OWNER', 'MANAGER')
  async getSettings(@CurrentUser() user: AuthenticatedUser) {
    return this.automationService.getSettings(user.salonId);
  }

  /**
   * PATCH /automation/settings
   * Atualiza configurações de automação
   */
  @Patch('settings')
  @Roles('OWNER', 'MANAGER')
  async updateSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAutomationSettingsDto,
  ) {
    return this.automationService.updateSettings(user.salonId, dto);
  }

  // ==================== TEMPLATES ====================

  /**
   * GET /automation/templates
   * Lista todos os templates do salão
   */
  @Get('templates')
  @Roles('OWNER', 'MANAGER')
  async getTemplates(@CurrentUser() user: AuthenticatedUser) {
    return this.automationService.getTemplates(user.salonId);
  }

  /**
   * GET /automation/templates/:id
   * Busca template por ID
   */
  @Get('templates/:id')
  @Roles('OWNER', 'MANAGER')
  async getTemplateById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.automationService.getTemplateById(id, user.salonId);
  }

  /**
   * POST /automation/templates
   * Cria novo template
   */
  @Post('templates')
  @Roles('OWNER', 'MANAGER')
  async createTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.automationService.createTemplate(user.salonId, dto);
  }

  /**
   * PATCH /automation/templates/:id
   * Atualiza template
   */
  @Patch('templates/:id')
  @Roles('OWNER', 'MANAGER')
  async updateTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.automationService.updateTemplate(id, user.salonId, dto);
  }

  /**
   * DELETE /automation/templates/:id
   * Remove template
   */
  @Delete('templates/:id')
  @Roles('OWNER', 'MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.automationService.deleteTemplate(id, user.salonId);
  }

  /**
   * POST /automation/templates/defaults
   * Cria templates padrão
   */
  @Post('templates/defaults')
  @Roles('OWNER', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  async createDefaultTemplates(@CurrentUser() user: AuthenticatedUser) {
    await this.automationService.createDefaultTemplates(user.salonId);
    return { message: 'Templates padrão criados com sucesso.' };
  }

  // ==================== MESSAGES ====================

  /**
   * POST /automation/send
   * Envia mensagem manual
   */
  @Post('send')
  @Roles('OWNER', 'MANAGER')
  async sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SendMessageDto,
  ) {
    return this.automationService.sendMessage(user.salonId, dto);
  }

  /**
   * POST /automation/send-test
   * Envia mensagem de teste
   */
  @Post('send-test')
  @Roles('OWNER', 'MANAGER')
  async sendTestMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SendTestMessageDto,
  ) {
    return this.automationService.sendTestMessage(
      user.salonId,
      dto.channel as MessageChannel,
      dto.phoneNumber,
    );
  }

  // ==================== LOGS & STATS ====================

  /**
   * GET /automation/logs
   * Lista histórico de mensagens
   */
  @Get('logs')
  @Roles('OWNER', 'MANAGER')
  async getMessageLogs(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filters: MessageLogFiltersDto,
  ) {
    return this.automationService.getMessageLogs(user.salonId, filters);
  }

  /**
   * GET /automation/stats
   * Retorna estatísticas de mensagens
   */
  @Get('stats')
  @Roles('OWNER', 'MANAGER')
  async getStats(
    @CurrentUser() user: AuthenticatedUser,
    @Query('days') days?: string,
  ) {
    return this.automationService.getStats(user.salonId, days ? parseInt(days) : 30);
  }

  // ==================== WEBHOOKS ====================

  /**
   * POST /automation/webhooks/whatsapp
   * Webhook para status do WhatsApp (Meta)
   */
  @Post('webhooks/whatsapp')
  @HttpCode(HttpStatus.OK)
  async whatsappWebhook(
    @Body()
    body: {
      entry?: Array<{
        changes?: Array<{
          value?: {
            statuses?: Array<{
              id: string;
              status: string;
              timestamp: string;
            }>;
          };
        }>;
      }>;
    },
  ) {
    await this.automationService.processWhatsAppWebhook(body);
    return { success: true };
  }

  /**
   * GET /automation/webhooks/whatsapp
   * Verificação do webhook (Meta)
   */
  @Get('webhooks/whatsapp')
  whatsappWebhookVerify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'beauty_manager_verify';

    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }

    return 'Verification failed';
  }

  /**
   * POST /automation/webhooks/twilio
   * Webhook para status do Twilio
   */
  @Post('webhooks/twilio')
  @HttpCode(HttpStatus.OK)
  async twilioWebhook(
    @Body() body: { MessageSid?: string; MessageStatus?: string },
  ) {
    await this.automationService.processTwilioWebhook(body);
    return { success: true };
  }
}
