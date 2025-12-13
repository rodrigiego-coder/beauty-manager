import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AIAssistantService } from './ai-assistant.service';
import { ChatMessageDto, UpdateAISettingsDto, CreateClientNoteDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { db } from '../../database/connection';
import { clientNotesAi } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';

@Controller('ai-assistant')
@UseGuards(AuthGuard, RolesGuard)
export class AIAssistantController {
  constructor(private readonly aiService: AIAssistantService) {}

  // ==================== BRIEFING ====================

  @Get('briefing')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getBriefing(@Request() req: any) {
    const { salonId, id: userId, role, name } = req.user;
    return this.aiService.generateBriefing(salonId, userId, role, name || 'Usuário');
  }

  // ==================== CHAT ====================

  @Post('chat')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async chat(@Request() req: any, @Body() dto: ChatMessageDto) {
    const { salonId, id: userId, role } = req.user;
    const response = await this.aiService.chat(salonId, userId, role, dto.message);
    return { response };
  }

  @Get('chat/history')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getChatHistory(@Request() req: any) {
    const { salonId, id: userId } = req.user;
    return this.aiService.getChatHistory(salonId, userId);
  }

  @Delete('chat/history')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async clearChatHistory(@Request() req: any) {
    const { salonId, id: userId } = req.user;
    await this.aiService.clearChatHistory(salonId, userId);
    return { success: true };
  }

  // ==================== CLIENT INSIGHT ====================

  @Get('client/:clientId/insight')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getClientInsight(@Request() req: any, @Param('clientId') clientId: string) {
    const { salonId } = req.user;
    const insight = await this.aiService.getClientInsight(salonId, clientId);
    return { insight };
  }

  // ==================== CLIENT NOTES ====================

  @Get('client/:clientId/notes')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getClientNotes(@Request() req: any, @Param('clientId') clientId: string) {
    const { salonId } = req.user;
    const notes = await db
      .select()
      .from(clientNotesAi)
      .where(and(eq(clientNotesAi.salonId, salonId), eq(clientNotesAi.clientId, clientId)))
      .orderBy(desc(clientNotesAi.createdAt));
    return notes;
  }

  @Post('client/notes')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async createClientNote(@Request() req: any, @Body() dto: CreateClientNoteDto) {
    const { salonId, id: userId } = req.user;
    const [note] = await db
      .insert(clientNotesAi)
      .values({
        salonId,
        clientId: dto.clientId,
        noteType: dto.noteType,
        content: dto.content,
        createdById: userId,
      })
      .returning();
    return note;
  }

  @Delete('client/notes/:noteId')
  @Roles('OWNER', 'MANAGER')
  async deleteClientNote(@Request() req: any, @Param('noteId') noteId: string) {
    const { salonId } = req.user;
    await db
      .delete(clientNotesAi)
      .where(and(eq(clientNotesAi.id, noteId), eq(clientNotesAi.salonId, salonId)));
    return { success: true };
  }

  // ==================== INSIGHTS ====================

  @Get('insights')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getInsights(@Request() req: any) {
    const { salonId, id: userId } = req.user;
    return this.aiService.getInsights(salonId, userId);
  }

  @Post('insights/:id/dismiss')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async dismissInsight(@Param('id') id: string) {
    await this.aiService.dismissInsight(id);
    return { success: true };
  }

  // ==================== SETTINGS ====================

  @Get('settings')
  @Roles('OWNER', 'MANAGER')
  async getSettings(@Request() req: any) {
    return this.aiService.getSettings(req.user.salonId);
  }

  @Patch('settings')
  @Roles('OWNER', 'MANAGER')
  async updateSettings(@Request() req: any, @Body() dto: UpdateAISettingsDto) {
    return this.aiService.updateSettings(req.user.salonId, dto);
  }

  // ==================== STATUS ====================

  @Get('status')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getStatus() {
    // Verifica se a IA está configurada
    const isConfigured = !!process.env.GEMINI_API_KEY;
    return {
      isConfigured,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      assistantName: 'Belle',
    };
  }
}
