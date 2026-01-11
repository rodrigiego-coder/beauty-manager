import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../../database/connection';
import * as schema from '../../database/schema';
import { WhatsAppSendResult, TemplateVariables } from './dto';

/**
 * WhatsAppService
 * Handles WhatsApp Business API message sending
 * Supports: META, TWILIO, ZENVIA, ZAPI
 */
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  // Z-API Configuration from environment
  private readonly zapiInstanceId = process.env.ZAPI_INSTANCE_ID;
  private readonly zapiToken = process.env.ZAPI_TOKEN;
  private readonly zapiBaseUrl = process.env.ZAPI_BASE_URL || 'https://api.z-api.io/instances';
  private readonly zapiClientToken = process.env.ZAPI_CLIENT_TOKEN;

  /**
   * Envia mensagem de texto via WhatsApp
   */
  async sendMessage(
    salonId: string,
    phoneNumber: string,
    message: string,
  ): Promise<WhatsAppSendResult> {
    const settings = await this.getSettings(salonId);

    if (!settings || !settings.whatsappEnabled) {
      return { success: false, error: 'WhatsApp não está habilitado.' };
    }

    if (!settings.whatsappApiKey) {
      return { success: false, error: 'Credenciais do WhatsApp não configuradas.' };
    }

    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    try {
      switch (settings.whatsappProvider) {
        case 'META':
          return await this.sendViaMeta(settings, formattedPhone, message);
        case 'TWILIO':
          return await this.sendViaTwilio(settings, formattedPhone, message);
        case 'ZENVIA':
          return await this.sendViaZenvia(settings, formattedPhone, message);
        case 'ZAPI':
          return await this.sendViaZapi(formattedPhone, message);
        default:
          // Tenta Z-API como fallback se configurado
          if (this.zapiInstanceId && this.zapiToken) {
            return await this.sendViaZapi(formattedPhone, message);
          }
          return { success: false, error: 'Provedor não suportado.' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`WhatsApp send error: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Envia mensagem diretamente via Z-API (sem precisar de configurações do salão)
   * Útil para OTP e testes
   */
  async sendDirectMessage(
    phoneNumber: string,
    message: string,
  ): Promise<WhatsAppSendResult> {
    if (!this.zapiInstanceId || !this.zapiToken) {
      this.logger.error('Z-API não configurado. Verifique ZAPI_INSTANCE_ID e ZAPI_TOKEN no .env');
      return { success: false, error: 'Z-API não configurado.' };
    }

    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    return this.sendViaZapi(formattedPhone, message);
  }

  /**
   * Envia código OTP via WhatsApp
   */
  async sendOtpCode(
    phoneNumber: string,
    code: string,
    expirationMinutes: number = 10,
  ): Promise<WhatsAppSendResult> {
    const message = `🔐 Seu código de verificação é: *${code}*\n\nVálido por ${expirationMinutes} minutos.\n\n_Beauty Manager_`;
    return this.sendDirectMessage(phoneNumber, message);
  }

  /**
   * Retorna os headers necessários para chamadas Z-API
   */
  private getZapiHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.zapiClientToken) {
      headers['Client-Token'] = this.zapiClientToken;
    }
    return headers;
  }

  /**
   * Testa conexão com Z-API
   */
  async testZapiConnection(): Promise<{ connected: boolean; error?: string }> {
    if (!this.zapiInstanceId || !this.zapiToken) {
      return { connected: false, error: 'Z-API não configurado.' };
    }

    try {
      const url = `${this.zapiBaseUrl}/${this.zapiInstanceId}/token/${this.zapiToken}/status`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getZapiHeaders(),
      });

      const responseText = await response.text();
      this.logger.debug(`Z-API status response: ${responseText}`);

      if (response.ok) {
        const data = JSON.parse(responseText) as { connected?: boolean; smartphoneConnected?: boolean };
        if (data.connected || data.smartphoneConnected) {
          return { connected: true };
        }
        return { connected: false, error: 'WhatsApp não conectado na instância Z-API.' };
      }

      // Verifica se é erro de client-token
      if (responseText.includes('client-token')) {
        return { connected: false, error: 'Client-Token não configurado. Configure ZAPI_CLIENT_TOKEN no .env' };
      }

      return { connected: false, error: `Erro ao verificar status: ${responseText}` };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro de conexão';
      return { connected: false, error: errorMessage };
    }
  }

  /**
   * Envia template pré-aprovado via WhatsApp (Meta)
   */
  async sendTemplateMessage(
    salonId: string,
    phoneNumber: string,
    templateName: string,
    variables: TemplateVariables,
  ): Promise<WhatsAppSendResult> {
    const settings = await this.getSettings(salonId);

    if (!settings || !settings.whatsappEnabled) {
      return { success: false, error: 'WhatsApp não está habilitado.' };
    }

    if (settings.whatsappProvider !== 'META') {
      // Para outros provedores, enviar como mensagem normal
      const message = this.replaceVariables(templateName, variables);
      return this.sendMessage(salonId, phoneNumber, message);
    }

    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${settings.whatsappPhoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${settings.whatsappApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: formattedPhone,
            type: 'template',
            template: {
              name: templateName,
              language: { code: 'pt_BR' },
              components: this.buildTemplateComponents(variables),
            },
          }),
        },
      );

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Meta API error: ${error}`);
        return { success: false, error: 'Erro ao enviar template.' };
      }

      const data = (await response.json()) as { messages: Array<{ id: string }> };
      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Template send error: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Verifica status de uma mensagem
   */
  async getMessageStatus(
    salonId: string,
    messageId: string,
  ): Promise<{ status: string; timestamp?: string }> {
    const settings = await this.getSettings(salonId);

    if (!settings || settings.whatsappProvider !== 'META') {
      return { status: 'UNKNOWN' };
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${settings.whatsappApiKey}`,
          },
        },
      );

      if (!response.ok) {
        return { status: 'UNKNOWN' };
      }

      const data = (await response.json()) as { status?: string; timestamp?: string };
      return {
        status: data.status || 'UNKNOWN',
        timestamp: data.timestamp,
      };
    } catch {
      return { status: 'UNKNOWN' };
    }
  }

  /**
   * Testa conexão com WhatsApp
   */
  async testConnection(salonId: string): Promise<{ connected: boolean; error?: string }> {
    const settings = await this.getSettings(salonId);

    if (!settings || !settings.whatsappApiKey) {
      return { connected: false, error: 'Credenciais não configuradas.' };
    }

    try {
      if (settings.whatsappProvider === 'META') {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${settings.whatsappPhoneNumberId}`,
          {
            headers: {
              Authorization: `Bearer ${settings.whatsappApiKey}`,
            },
          },
        );

        if (response.ok) {
          return { connected: true };
        }

        return { connected: false, error: 'Token inválido ou expirado.' };
      }

      // Para outros provedores, fazer verificação básica
      return { connected: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro de conexão';
      return { connected: false, error: errorMessage };
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async getSettings(salonId: string) {
    return db.query.automationSettings.findFirst({
      where: eq(schema.automationSettings.salonId, salonId),
    });
  }

  private formatPhoneNumber(phone: string): string {
    // Remove tudo que não for número
    let cleaned = phone.replace(/\D/g, '');

    // Adiciona código do país se não tiver
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }

    return cleaned;
  }

  private async sendViaMeta(
    settings: schema.AutomationSetting,
    phone: string,
    message: string,
  ): Promise<WhatsAppSendResult> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${settings.whatsappPhoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${settings.whatsappApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: message },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Meta send error: ${error}`);
      return { success: false, error: 'Erro ao enviar mensagem.' };
    }

    const data = (await response.json()) as { messages: Array<{ id: string }> };
    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  }

  private async sendViaTwilio(
    settings: schema.AutomationSetting,
    phone: string,
    message: string,
  ): Promise<WhatsAppSendResult> {
    const accountSid = settings.smsAccountSid;
    const authToken = settings.whatsappApiKey;
    const fromNumber = settings.whatsappPhoneNumberId;

    if (!accountSid || !authToken || !fromNumber) {
      return { success: false, error: 'Credenciais Twilio incompletas.' };
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:+${fromNumber}`,
          To: `whatsapp:+${phone}`,
          Body: message,
        }),
      },
    );

    if (!response.ok) {
      return { success: false, error: 'Erro ao enviar via Twilio.' };
    }

    const data = (await response.json()) as { sid: string };
    return {
      success: true,
      messageId: data.sid,
    };
  }

  private async sendViaZenvia(
    settings: schema.AutomationSetting,
    phone: string,
    message: string,
  ): Promise<WhatsAppSendResult> {
    const apiKey = settings.whatsappApiKey;

    if (!apiKey) {
      return { success: false, error: 'API Key Zenvia não configurada.' };
    }

    const response = await fetch('https://api.zenvia.com/v2/channels/whatsapp/messages', {
      method: 'POST',
      headers: {
        'X-API-TOKEN': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: settings.whatsappPhoneNumberId,
        to: phone,
        contents: [{ type: 'text', text: message }],
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Erro ao enviar via Zenvia.' };
    }

    const data = (await response.json()) as { id: string };
    return {
      success: true,
      messageId: data.id,
    };
  }

  /**
   * Envia mensagem via Z-API
   */
  private async sendViaZapi(
    phone: string,
    message: string,
  ): Promise<WhatsAppSendResult> {
    if (!this.zapiInstanceId || !this.zapiToken) {
      return { success: false, error: 'Z-API não configurado.' };
    }

    const url = `${this.zapiBaseUrl}/${this.zapiInstanceId}/token/${this.zapiToken}/send-text`;

    try {
      this.logger.log(`Enviando mensagem Z-API para ${phone}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getZapiHeaders(),
        body: JSON.stringify({
          phone: phone,
          message: message,
        }),
      });

      const responseText = await response.text();
      this.logger.debug(`Z-API response: ${responseText}`);

      if (!response.ok) {
        this.logger.error(`Z-API error (${response.status}): ${responseText}`);

        // Verifica se é erro de client-token
        if (responseText.includes('client-token')) {
          return { success: false, error: 'Client-Token não configurado. Configure ZAPI_CLIENT_TOKEN no .env' };
        }

        return { success: false, error: `Erro Z-API: ${response.status} - ${responseText}` };
      }

      let data: { zapiMessageId?: string; messageId?: string };
      try {
        data = JSON.parse(responseText);
      } catch {
        data = {};
      }

      this.logger.log(`Mensagem enviada com sucesso para ${phone}`);
      return {
        success: true,
        messageId: data.zapiMessageId || data.messageId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Z-API send error: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  private buildTemplateComponents(variables: TemplateVariables): Array<{
    type: string;
    parameters: Array<{ type: string; text: string }>;
  }> {
    const params: Array<{ type: string; text: string }> = [];

    if (variables.nome) params.push({ type: 'text', text: variables.nome });
    if (variables.data) params.push({ type: 'text', text: variables.data });
    if (variables.horario) params.push({ type: 'text', text: variables.horario });
    if (variables.servico) params.push({ type: 'text', text: variables.servico });
    if (variables.profissional) params.push({ type: 'text', text: variables.profissional });

    if (params.length === 0) return [];

    return [{ type: 'body', parameters: params }];
  }

  private replaceVariables(template: string, variables: TemplateVariables): string {
    let result = template;

    Object.entries(variables).forEach(([key, value]) => {
      if (value) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    });

    return result;
  }
}
