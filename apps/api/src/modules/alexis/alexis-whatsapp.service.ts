import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../database/connection';
import { alexisSettings, alexisMessages } from '../../database/schema';
import { eq } from 'drizzle-orm';

/**
 * =====================================================
 * ALEXIS WHATSAPP SERVICE
 * Integração com WhatsApp Business API
 * =====================================================
 */

export interface WhatsAppMessage {
  from: string;
  to: string;
  type: 'text' | 'audio' | 'image' | 'document' | 'location' | 'contact';
  text?: { body: string };
  audio?: { id: string; link: string };
  image?: { id: string; link: string; caption?: string };
  document?: { id: string; link: string; filename: string };
  location?: { latitude: number; longitude: number; name?: string };
  contact?: { name: { formatted_name: string }; phones: { phone: string }[] };
  timestamp: string;
  id: string;
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: {
    id: string;
    changes: {
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: { profile: { name: string }; wa_id: string }[];
        messages?: WhatsAppMessage[];
        statuses?: {
          id: string;
          status: 'sent' | 'delivered' | 'read';
          timestamp: string;
          recipient_id: string;
        }[];
      };
      field: string;
    }[];
  }[];
}

@Injectable()
export class AlexisWhatsAppService {
  private readonly logger = new Logger(AlexisWhatsAppService.name);

  /**
   * Processar webhook do WhatsApp
   */
  async processWebhook(payload: WhatsAppWebhookPayload): Promise<{
    salonId: string;
    clientPhone: string;
    clientName?: string;
    message: string;
    messageType: string;
    whatsappMessageId: string;
  } | null> {
    try {
      const entry = payload.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;

      if (!value?.messages?.length) {
        // Pode ser um status update
        if (value?.statuses?.length) {
          await this.handleStatusUpdate(value.statuses[0]);
        }
        return null;
      }

      const message = value.messages[0];
      const contact = value.contacts?.[0];
      const phoneNumberId = value.metadata?.phone_number_id;

      // Buscar salão pelo phone_number_id
      const [settings] = await db
        .select()
        .from(alexisSettings)
        .where(eq(alexisSettings.whatsappIntegrationId, phoneNumberId));

      if (!settings) {
        this.logger.warn(`Salão não encontrado para phone_number_id: ${phoneNumberId}`);
        return null;
      }

      // Extrair conteúdo da mensagem
      let messageContent = '';
      let messageType = message.type || 'text';

      switch (message.type) {
        case 'text':
          messageContent = message.text?.body || '';
          break;
        case 'audio':
          messageContent = '[Áudio recebido]';
          break;
        case 'image':
          messageContent = message.image?.caption || '[Imagem recebida]';
          break;
        case 'document':
          messageContent = `[Documento: ${message.document?.filename || 'arquivo'}]`;
          break;
        case 'location':
          messageContent = `[Localização: ${message.location?.name || 'enviada'}]`;
          break;
        case 'contact':
          messageContent = `[Contato: ${message.contact?.name?.formatted_name || 'enviado'}]`;
          break;
        default:
          messageContent = '[Mensagem não suportada]';
      }

      return {
        salonId: settings.salonId,
        clientPhone: message.from,
        clientName: contact?.profile?.name,
        message: messageContent,
        messageType,
        whatsappMessageId: message.id,
      };
    } catch (error) {
      this.logger.error('Erro ao processar webhook WhatsApp:', error);
      return null;
    }
  }

  /**
   * Enviar mensagem pelo WhatsApp
   */
  async sendMessage(
    salonId: string,
    to: string,
    message: string,
    messageType: 'text' | 'template' = 'text',
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const [settings] = await db
        .select()
        .from(alexisSettings)
        .where(eq(alexisSettings.salonId, salonId));

      if (!settings?.whatsappIntegrationId) {
        return {
          success: false,
          error: 'WhatsApp não configurado para este salão',
        };
      }

      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      if (!accessToken) {
        this.logger.warn('WHATSAPP_ACCESS_TOKEN não configurado - modo simulado');
        return { success: true, messageId: `sim_${Date.now()}` };
      }

      const url = `https://graph.facebook.com/v18.0/${settings.whatsappIntegrationId}/messages`;

      const body = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/\D/g, ''), // Remove caracteres não numéricos
        type: messageType,
        text: messageType === 'text' ? { body: message } : undefined,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json() as {
        messages?: { id: string }[];
        error?: { message: string };
      };

      if (response.ok) {
        return {
          success: true,
          messageId: result.messages?.[0]?.id,
        };
      } else {
        return {
          success: false,
          error: result.error?.message || 'Erro ao enviar mensagem',
        };
      }
    } catch (error: any) {
      this.logger.error('Erro ao enviar mensagem WhatsApp:', error);
      return {
        success: false,
        error: error?.message || 'Erro desconhecido',
      };
    }
  }

  /**
   * Atualizar status da mensagem
   */
  private async handleStatusUpdate(status: {
    id: string;
    status: 'sent' | 'delivered' | 'read';
    timestamp: string;
    recipient_id: string;
  }) {
    const [message] = await db
      .select()
      .from(alexisMessages)
      .where(eq(alexisMessages.whatsappMessageId, status.id))
      .limit(1);

    if (!message) return;

    const updates: any = {};
    const timestamp = new Date(parseInt(status.timestamp) * 1000);

    if (status.status === 'delivered') {
      updates.deliveredAt = timestamp;
    } else if (status.status === 'read') {
      updates.readAt = timestamp;
    }

    if (Object.keys(updates).length > 0) {
      await db
        .update(alexisMessages)
        .set(updates)
        .where(eq(alexisMessages.id, message.id));
    }
  }

  /**
   * Verificar se está dentro do horário de atendimento
   */
  async isWithinOperatingHours(salonId: string): Promise<boolean> {
    const [settings] = await db
      .select()
      .from(alexisSettings)
      .where(eq(alexisSettings.salonId, salonId));

    if (!settings?.operatingHoursEnabled) {
      return true; // Se não configurado, sempre disponível
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const start = settings.operatingHoursStart || '08:00';
    const end = settings.operatingHoursEnd || '20:00';

    return currentTime >= start && currentTime <= end;
  }

  /**
   * Obter mensagem de fora do horário
   */
  async getOutOfHoursMessage(salonId: string): Promise<string> {
    const [settings] = await db
      .select()
      .from(alexisSettings)
      .where(eq(alexisSettings.salonId, salonId));

    return settings?.outOfHoursMessage || 'Estamos fora do horário de atendimento. Retornaremos em breve!';
  }

  /**
   * Validar webhook do WhatsApp (verificação inicial)
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }

    return null;
  }
}
