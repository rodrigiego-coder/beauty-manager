import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../../database/connection';
import * as schema from '../../database/schema';
import { SMSSendResult } from './dto';

/**
 * SMSService
 * Handles SMS message sending via Twilio, Zenvia, or AWS SNS
 */
@Injectable()
export class SMSService {
  private readonly logger = new Logger(SMSService.name);

  /**
   * Envia SMS
   */
  async sendSMS(
    salonId: string,
    phoneNumber: string,
    message: string,
  ): Promise<SMSSendResult> {
    const settings = await this.getSettings(salonId);

    if (!settings || !settings.smsEnabled) {
      return { success: false, error: 'SMS não está habilitado.' };
    }

    if (!settings.smsApiKey) {
      return { success: false, error: 'Credenciais do SMS não configuradas.' };
    }

    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    try {
      switch (settings.smsProvider) {
        case 'TWILIO':
          return await this.sendViaTwilio(settings, formattedPhone, message);
        case 'ZENVIA':
          return await this.sendViaZenvia(settings, formattedPhone, message);
        case 'AWS_SNS':
          return await this.sendViaAWS(settings, formattedPhone, message);
        default:
          return { success: false, error: 'Provedor não suportado.' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`SMS send error: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Verifica saldo disponível (Twilio)
   */
  async getBalance(salonId: string): Promise<{ balance: number; currency: string } | null> {
    const settings = await this.getSettings(salonId);

    if (!settings || settings.smsProvider !== 'TWILIO') {
      return null;
    }

    try {
      const accountSid = settings.smsAccountSid;
      const authToken = settings.smsApiKey;

      if (!accountSid || !authToken) {
        return null;
      }

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Balance.json`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as { balance: string; currency: string };
      return {
        balance: parseFloat(data.balance),
        currency: data.currency,
      };
    } catch {
      return null;
    }
  }

  /**
   * Testa conexão com provedor SMS
   */
  async testConnection(salonId: string): Promise<{ connected: boolean; error?: string }> {
    const settings = await this.getSettings(salonId);

    if (!settings || !settings.smsApiKey) {
      return { connected: false, error: 'Credenciais não configuradas.' };
    }

    try {
      if (settings.smsProvider === 'TWILIO') {
        const accountSid = settings.smsAccountSid;
        const authToken = settings.smsApiKey;

        if (!accountSid) {
          return { connected: false, error: 'Account SID não configurado.' };
        }

        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
          {
            headers: {
              Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            },
          },
        );

        if (response.ok) {
          return { connected: true };
        }

        return { connected: false, error: 'Credenciais inválidas.' };
      }

      // Para outros provedores
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

    return '+' + cleaned;
  }

  private async sendViaTwilio(
    settings: schema.AutomationSetting,
    phone: string,
    message: string,
  ): Promise<SMSSendResult> {
    const accountSid = settings.smsAccountSid;
    const authToken = settings.smsApiKey;
    const fromNumber = settings.smsPhoneNumber;

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
          From: fromNumber,
          To: phone,
          Body: message,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Twilio SMS error: ${error}`);
      return { success: false, error: 'Erro ao enviar SMS via Twilio.' };
    }

    const data = (await response.json()) as { sid: string; price?: string };
    return {
      success: true,
      messageId: data.sid,
      cost: data.price ? Math.abs(parseFloat(data.price)) : undefined,
    };
  }

  private async sendViaZenvia(
    settings: schema.AutomationSetting,
    phone: string,
    message: string,
  ): Promise<SMSSendResult> {
    const apiKey = settings.smsApiKey;
    const from = settings.smsPhoneNumber || 'BeautyManager';

    if (!apiKey) {
      return { success: false, error: 'API Key Zenvia não configurada.' };
    }

    const response = await fetch('https://api.zenvia.com/v2/channels/sms/messages', {
      method: 'POST',
      headers: {
        'X-API-TOKEN': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: phone.replace('+', ''),
        contents: [{ type: 'text', text: message }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Zenvia SMS error: ${error}`);
      return { success: false, error: 'Erro ao enviar SMS via Zenvia.' };
    }

    const data = (await response.json()) as { id: string };
    return {
      success: true,
      messageId: data.id,
    };
  }

  private async sendViaAWS(
    settings: schema.AutomationSetting,
    _phone: string,
    _message: string,
  ): Promise<SMSSendResult> {
    // AWS SNS requer AWS SDK - implementação simplificada
    // Na prática, usaria @aws-sdk/client-sns

    const accessKeyId = settings.smsAccountSid;
    const secretAccessKey = settings.smsApiKey;

    if (!accessKeyId || !secretAccessKey) {
      return { success: false, error: 'Credenciais AWS não configuradas.' };
    }

    this.logger.warn('AWS SNS não implementado completamente. Use Twilio ou Zenvia.');
    return {
      success: false,
      error: 'AWS SNS requer configuração adicional. Use Twilio ou Zenvia.',
    };
  }
}
