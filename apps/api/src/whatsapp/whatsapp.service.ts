import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsAppService {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('WHATSAPP_API_URL') || '';
    this.apiKey = this.configService.get<string>('WHATSAPP_API_KEY') || '';
  }

  async createInstance(salaoId: string) {
    const instanceName = salaoId;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${this.apiUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error?.name === 'AbortError') {
        throw new Error('Timeout: Evolution API não respondeu em 10 segundos');
      }
      throw error;
    }
  }

  async getQRCode(salaoId: string) {
    const instanceName = salaoId;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${this.apiUrl}/instance/connect/${instanceName}?number=true`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error?.name === 'AbortError') {
        throw new Error('Timeout: Evolution API não respondeu em 10 segundos');
      }
      throw error;
    }
  }

  async getInstanceStatus(salaoId: string) {
    const instanceName = salaoId;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${this.apiUrl}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error?.name === 'AbortError') {
        throw new Error('Timeout: Evolution API não respondeu em 10 segundos');
      }
      throw error;
    }
  }

  async sendMessage(salaoId: string, phoneNumber: string, message: string) {
    const instanceName = salaoId;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${this.apiUrl}/message/sendText/${instanceName}`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: phoneNumber,
          textMessage: { text: message },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error?.name === 'AbortError') {
        throw new Error('Timeout: Evolution API não respondeu em 10 segundos');
      }
      throw error;
    }
  }

  async disconnectInstance(salaoId: string) {
    const instanceName = salaoId;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${this.apiUrl}/instance/logout/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': this.apiKey,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error?.name === 'AbortError') {
        throw new Error('Timeout: Evolution API não respondeu em 10 segundos');
      }
      throw error;
    }
  }
}