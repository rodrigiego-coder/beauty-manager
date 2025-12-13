import { Injectable } from '@nestjs/common';
import { INTENT_KEYWORDS } from './constants/forbidden-terms';

/**
 * =====================================================
 * INTENT CLASSIFIER SERVICE
 * Detecta a intenção do cliente na mensagem
 * =====================================================
 */

export type Intent =
  | 'GREETING'
  | 'SCHEDULE'
  | 'RESCHEDULE'
  | 'CANCEL'
  | 'PRODUCT_INFO'
  | 'SERVICE_INFO'
  | 'PRICE_INFO'
  | 'HOURS_INFO'
  | 'GENERAL';

@Injectable()
export class IntentClassifierService {
  /**
   * Classifica a intenção da mensagem do cliente
   */
  classify(message: string): Intent {
    const lower = message.toLowerCase().trim();

    // Saudações (verificar primeiro pois são mais comuns no início)
    if (this.matchesAny(lower, INTENT_KEYWORDS.GREETING, true)) {
      return 'GREETING';
    }

    // Agendamento
    if (this.matchesAny(lower, INTENT_KEYWORDS.SCHEDULE)) {
      return 'SCHEDULE';
    }

    // Reagendamento
    if (this.matchesAny(lower, INTENT_KEYWORDS.RESCHEDULE)) {
      return 'RESCHEDULE';
    }

    // Cancelamento
    if (this.matchesAny(lower, INTENT_KEYWORDS.CANCEL)) {
      return 'CANCEL';
    }

    // Informações de Produtos
    if (this.matchesAny(lower, INTENT_KEYWORDS.PRODUCT_INFO)) {
      return 'PRODUCT_INFO';
    }

    // Informações de Serviços
    if (this.matchesAny(lower, INTENT_KEYWORDS.SERVICE_INFO)) {
      return 'SERVICE_INFO';
    }

    // Informações de Preços
    if (this.matchesAny(lower, INTENT_KEYWORDS.PRICE_INFO)) {
      return 'PRICE_INFO';
    }

    // Horário de funcionamento
    if (this.matchesAny(lower, INTENT_KEYWORDS.HOURS_INFO)) {
      return 'HOURS_INFO';
    }

    return 'GENERAL';
  }

  /**
   * Verifica se a mensagem contém alguma das palavras-chave
   * @param message Mensagem em lowercase
   * @param keywords Lista de palavras-chave
   * @param startsWith Se true, verifica apenas se a mensagem começa com a palavra
   */
  private matchesAny(message: string, keywords: string[], startsWith = false): boolean {
    return keywords.some((keyword) => {
      if (startsWith) {
        return message.startsWith(keyword) || message === keyword;
      }
      return message.includes(keyword);
    });
  }

  /**
   * Retorna uma descrição amigável da intenção
   */
  getIntentDescription(intent: Intent): string {
    const descriptions: Record<Intent, string> = {
      GREETING: 'Saudação',
      SCHEDULE: 'Agendamento',
      RESCHEDULE: 'Reagendamento',
      CANCEL: 'Cancelamento',
      PRODUCT_INFO: 'Informação sobre Produtos',
      SERVICE_INFO: 'Informação sobre Serviços',
      PRICE_INFO: 'Informação sobre Preços',
      HOURS_INFO: 'Horário de Funcionamento',
      GENERAL: 'Pergunta Geral',
    };

    return descriptions[intent];
  }
}
