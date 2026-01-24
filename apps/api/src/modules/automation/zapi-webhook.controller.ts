import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { eq, ilike } from 'drizzle-orm';
import { db } from '../../database/connection';
import * as schema from '../../database/schema';
import { ConfigService } from '@nestjs/config';
import { AlexisService } from '../alexis/alexis.service';
import { WhatsAppService } from './whatsapp.service';

/**
 * Webhook para receber mensagens do Z-API
 * Integrado com Alexis IA para processamento inteligente
 */
@Public()
@Controller('webhook/zapi')
export class ZapiWebhookController {
  private readonly logger = new Logger(ZapiWebhookController.name);

  constructor(
    private readonly alexisService: AlexisService,
    private readonly whatsappService: WhatsAppService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Recebe mensagens do Z-API
   * Documentação: https://developer.z-api.io/webhooks/on-message-received
   */
  @Post('messages')
  @HttpCode(HttpStatus.OK)
  async handleIncomingMessage(@Body() payload: any) {
    this.logger.log(`Webhook recebido: ${JSON.stringify(payload)}`);

    try {
      // ========== IGNORA MENSAGENS DE GRUPOS ==========
      // Z-API sinaliza grupos com isGroup=true ou phone terminando em "-group"
      const phoneRaw = payload.phone || payload.from || '';
      if (payload.isGroup === true || phoneRaw.endsWith('-group') || phoneRaw.includes('@g.us')) {
        this.logger.debug(`Mensagem de grupo ignorada: ${phoneRaw}`);
        return { received: true };
      }

      // Z-API envia diferentes tipos de eventos
      // Focamos em mensagens de texto recebidas
      if (!payload.text?.message) {
        this.logger.debug('Payload sem mensagem de texto, ignorando');
        return { received: true };
      }

      // Ignora mensagens enviadas por nós (fromMe = true)
      if (payload.fromMe === true) {
        this.logger.debug('Mensagem enviada por nós, ignorando');
        return { received: true };
      }

      const phone = this.extractPhone(payload.phone || payload.from);
      const message = payload.text.message.trim();
      const clientName = payload.senderName || payload.pushName || undefined;

      this.logger.log(`Mensagem de ${phone} (${clientName || 'sem nome'}): "${message}"`);

      // Busca o salão associado a este número (por enquanto, usa o salão demo)
      // TODO: Implementar mapeamento de número do WhatsApp para salão
      const salonId = await this.getSalonIdForPhone(phone);

      if (!salonId) {
        this.logger.warn(`Nenhum salão encontrado para processar mensagem de ${phone}`);
        return { received: true };
      }

      // Processa mensagem com Alexis
      const result = await this.alexisService.processWhatsAppMessage(
        salonId,
        phone,
        message,
        clientName,
        undefined, // senderId
        'client',
      );

      this.logger.log(`Alexis processou: intent=${result.intent}, shouldSend=${result.shouldSend}`);

      // Envia resposta se necessário
      if (result.shouldSend && result.response) {
        const sendResult = await this.whatsappService.sendDirectMessage(phone, result.response);

        if (sendResult.success) {
          this.logger.log(`Resposta enviada para ${phone}`);
        } else {
          this.logger.error(`Erro ao enviar resposta: ${sendResult.error}`);
        }
      }

      return { received: true, intent: result.intent };
    } catch (error) {
      this.logger.error('Erro ao processar webhook:', error);
      return { received: true, error: 'Internal error' };
    }
  }

  /**
   * Webhook alternativo para status de mensagens
   */
  @Post('status')
  @HttpCode(HttpStatus.OK)
  async handleMessageStatus(@Body() payload: any) {
    this.logger.debug(`Status webhook: ${JSON.stringify(payload)}`);

    // Atualiza status da mensagem (DELIVERED, READ, etc)
    if (payload.messageId && payload.status) {
      try {
        const statusMap: Record<string, string> = {
          'DELIVERY_ACK': 'DELIVERED',
          'READ': 'READ',
          'PLAYED': 'READ',
        };

        const newStatus = statusMap[payload.status];
        if (newStatus) {
          await db
            .update(schema.appointmentNotifications)
            .set({
              status: newStatus as any,
              deliveredAt: newStatus === 'DELIVERED' ? new Date() : undefined,
              readAt: newStatus === 'READ' ? new Date() : undefined,
              updatedAt: new Date(),
            })
            .where(eq(schema.appointmentNotifications.providerMessageId, payload.messageId));
        }
      } catch (error) {
        this.logger.error('Erro ao atualizar status:', error);
      }
    }

    return { received: true };
  }

  /**
   * Busca o salonId baseado no telefone
   * 1) Tenta usar slug da env var ZAPI_DEFAULT_SALON_SLUG
   * 2) Fallback: primeiro salão com name ILIKE '%demo%'
   */
  private async getSalonIdForPhone(_phone: string): Promise<string | null> {
    // Tentativa 1: Slug configurado em env var
    const configuredSlug = this.configService.get<string>('ZAPI_DEFAULT_SALON_SLUG');
    if (configuredSlug) {
      const [salonBySlug] = await db
        .select()
        .from(schema.salons)
        .where(eq(schema.salons.slug, configuredSlug))
        .limit(1);

      if (salonBySlug) {
        this.logger.debug(`Salão encontrado por slug (${configuredSlug}): ${salonBySlug.id}`);
        return salonBySlug.id;
      }
      this.logger.warn(`Slug configurado "${configuredSlug}" não encontrado, tentando fallback`);
    }

    // Tentativa 2 (fallback): Primeiro salão com nome contendo "demo"
    const [demoSalon] = await db
      .select()
      .from(schema.salons)
      .where(ilike(schema.salons.name, '%demo%'))
      .limit(1);

    if (demoSalon) {
      this.logger.debug(`Salão demo encontrado: ${demoSalon.id} (${demoSalon.name})`);
      return demoSalon.id;
    }

    this.logger.warn('Nenhum salão encontrado (slug nem demo)');
    return null;
  }

  /**
   * Extrai número de telefone do payload
   */
  private extractPhone(phone: string): string {
    if (!phone) return '';
    // Remove @c.us e outros sufixos do WhatsApp
    return phone.replace(/@.*$/, '').replace(/\D/g, '');
  }
}
