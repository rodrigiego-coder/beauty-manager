import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /notifications
   * Lista todas as notificações
   */
  @Get()
  async findAll() {
    return this.notificationsService.findAll();
  }

  /**
   * GET /notifications/unread
   * Lista notificações não lidas
   */
  @Get('unread')
  async findUnread() {
    return this.notificationsService.findUnread();
  }

  /**
   * GET /notifications/count
   * Conta notificações não lidas
   */
  @Get('count')
  async countUnread() {
    const count = await this.notificationsService.countUnread();
    return { unreadCount: count };
  }

  /**
   * GET /notifications/:id
   * Busca notificação por ID
   */
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const notification = await this.notificationsService.findById(id);

    if (!notification) {
      throw new NotFoundException('Notificacao nao encontrada');
    }

    return notification;
  }

  /**
   * PATCH /notifications/:id/read
   * Marca notificação como lida
   */
  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    const notification = await this.notificationsService.markAsRead(id);

    if (!notification) {
      throw new NotFoundException('Notificacao nao encontrada');
    }

    return notification;
  }

  /**
   * POST /notifications/read-all
   * Marca todas como lidas
   */
  @Post('read-all')
  async markAllAsRead() {
    const count = await this.notificationsService.markAllAsRead();
    return { message: `${count} notificacoes marcadas como lidas` };
  }

  /**
   * DELETE /notifications/:id
   * Remove notificação
   */
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.notificationsService.delete(id);

    if (!deleted) {
      throw new NotFoundException('Notificacao nao encontrada');
    }

    return { message: 'Notificacao removida com sucesso' };
  }

  /**
   * POST /notifications/clean
   * Remove notificações antigas (mais de 30 dias)
   */
  @Post('clean')
  async cleanOld() {
    const count = await this.notificationsService.cleanOld();
    return { message: `${count} notificacoes antigas removidas` };
  }
}
