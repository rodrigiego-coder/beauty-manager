import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { Public } from '../common/decorators/public.decorator';

@Public()
@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Post('create/:salaoId')
  async createInstance(@Param('salaoId') salaoId: string) {
    console.log('🔥 WhatsApp createInstance chamado para salaoId:', salaoId);
    return this.whatsappService.createInstance(salaoId);
  }

  @Get('qrcode/:salaoId')
  async getQRCode(@Param('salaoId') salaoId: string) {
    return this.whatsappService.getQRCode(salaoId);
  }

  @Get('status/:salaoId')
  async getStatus(@Param('salaoId') salaoId: string) {
    return this.whatsappService.getInstanceStatus(salaoId);
  }

  @Post('send/:salaoId')
  async sendMessage(
    @Param('salaoId') salaoId: string,
    @Body() data: { phoneNumber: string; message: string },
  ) {
    return this.whatsappService.sendMessage(
      salaoId,
      data.phoneNumber,
      data.message,
    );
  }

  @Delete('disconnect/:salaoId')
  async disconnect(@Param('salaoId') salaoId: string) {
    return this.whatsappService.disconnectInstance(salaoId);
  }
}