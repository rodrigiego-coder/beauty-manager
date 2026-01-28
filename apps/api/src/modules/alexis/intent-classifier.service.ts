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
  | 'LIST_SERVICES'
  | 'PRICE_INFO'
  | 'HOURS_INFO'
  | 'APPOINTMENT_CONFIRM'
  | 'APPOINTMENT_DECLINE'
  | 'GENERAL';

@Injectable()
export class IntentClassifierService {
  /**
   * Classifica a intenção da mensagem do cliente
   */
  classify(message: string): Intent {
    const lower = message.toLowerCase().trim();

    // ========== CONFIRMAÇÃO DE AGENDAMENTO (prioridade alta) ==========
    // Mensagens curtas de confirmação (SIM, S, Confirmo, etc)
    if (this.isAppointmentConfirmation(lower)) {
      return 'APPOINTMENT_CONFIRM';
    }

    // Mensagens curtas de recusa (NÃO, N, Cancelar, etc)
    if (this.isAppointmentDecline(lower)) {
      return 'APPOINTMENT_DECLINE';
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

    // ========== PRICE_INFO tem precedência sobre PRODUCT_INFO (ALFA.3) ==========
    // Se a mensagem contém keywords de preço, é PRICE_INFO mesmo que mencione produto
    if (this.matchesAny(lower, INTENT_KEYWORDS.PRICE_INFO)) {
      return 'PRICE_INFO';
    }

    // Informações de Produtos (só se não for sobre preço)
    if (this.matchesAny(lower, INTENT_KEYWORDS.PRODUCT_INFO)) {
      return 'PRODUCT_INFO';
    }

    // Lista de serviços (mais específico que SERVICE_INFO genérico)
    if (this.isListServicesIntent(lower)) {
      return 'LIST_SERVICES';
    }

    // Informações de Serviços
    if (this.matchesAny(lower, INTENT_KEYWORDS.SERVICE_INFO)) {
      return 'SERVICE_INFO';
    }

    // Horário de funcionamento
    if (this.matchesAny(lower, INTENT_KEYWORDS.HOURS_INFO)) {
      return 'HOURS_INFO';
    }

    // ========== GREETING somente se for saudação "pura" (sem intenção real) ==========
    // Movido para DEPOIS das checagens de conteúdo para evitar falso positivo
    if (this.isPureGreeting(lower)) {
      return 'GREETING';
    }

    return 'GENERAL';
  }

  /**
   * Verifica se a mensagem contém alguma das palavras-chave
   */
  private matchesAny(message: string, keywords: string[]): boolean {
    return keywords.some((keyword) => message.includes(keyword));
  }

  /**
   * Verifica se a mensagem é uma saudação "pura" (sem intenção real após a saudação).
   * Ex.: "Oi" => true, "Bom dia!" => true
   *      "Oi, quero saber sobre o Ultra Reconstrução" => false
   */
  private isPureGreeting(message: string): boolean {
    const greetingPattern = /^(oi|olá|ola|bom\s+dia|boa\s+tarde|boa\s+noite|hey|eai|e\s+ai|opa)[!,.\s]*$/;
    return greetingPattern.test(message);
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
      LIST_SERVICES: 'Lista de Serviços',
      PRICE_INFO: 'Informação sobre Preços',
      HOURS_INFO: 'Horário de Funcionamento',
      APPOINTMENT_CONFIRM: 'Confirmação de Agendamento',
      APPOINTMENT_DECLINE: 'Recusa de Agendamento',
      GENERAL: 'Pergunta Geral',
    };

    return descriptions[intent];
  }

  /**
   * Verifica se a mensagem é um pedido de listagem de serviços
   * Ex: "quais serviços vocês fazem?", "o que vocês oferecem?"
   */
  private isListServicesIntent(message: string): boolean {
    const patterns = [
      /quais\s+servi[cç]os/,
      /servi[cç]os\s+(voc[eê]s|que)\s+(fazem|oferecem|tem|têm)/,
      /o\s+que\s+(voc[eê]s|o\s+sal[aã]o)\s+(fazem|oferecem|tem|têm)/,
      /tabela\s+de\s+servi[cç]os/,
      /lista\s+de\s+servi[cç]os/,
      /menu\s+de\s+servi[cç]os/,
      /que\s+servi[cç]os/,
      /quais\s+s[aã]o\s+os\s+servi[cç]os/,
    ];
    return patterns.some((p) => p.test(message));
  }

  /**
   * Verifica se a mensagem é uma confirmação de agendamento
   * Detecta: SIM, S, Sim, sim, Confirmo, Confirmado, Vou, Estarei aí
   */
  private isAppointmentConfirmation(message: string): boolean {
    const confirmKeywords = [
      'sim',
      's',
      'confirmo',
      'confirmado',
      'confirmada',
      'confirmar',
      'vou',
      'vou sim',
      'com certeza',
      'pode confirmar',
      'tá confirmado',
      'ta confirmado',
      'estarei aí',
      'estarei ai',
      'estarei lá',
      'estarei la',
      'ok',
      'certo',
      'beleza',
      'combinado',
    ];

    // Mensagem deve ser curta (confirmações são geralmente curtas)
    if (message.length > 50) return false;

    return confirmKeywords.some(keyword => {
      // Para palavras de 1-2 caracteres, deve ser exata
      if (keyword.length <= 2) {
        return message === keyword;
      }
      // Para outras, pode estar contida ou ser exata
      return message === keyword || message.startsWith(keyword + ' ') || message.endsWith(' ' + keyword);
    });
  }

  /**
   * Verifica se a mensagem é uma recusa de agendamento
   * Detecta: NÃO, N, Não, não, Cancelar, Cancela, Não vou
   */
  private isAppointmentDecline(message: string): boolean {
    const declineKeywords = [
      'não',
      'nao',
      'n',
      'cancelar',
      'cancela',
      'cancelado',
      'não vou',
      'nao vou',
      'não posso',
      'nao posso',
      'não dá',
      'nao da',
      'não vai dar',
      'nao vai dar',
      'desmarcar',
      'desmarca',
      'preciso cancelar',
      'quero cancelar',
    ];

    // Mensagem deve ser curta
    if (message.length > 50) return false;

    return declineKeywords.some(keyword => {
      if (keyword.length <= 2) {
        return message === keyword;
      }
      return message === keyword || message.startsWith(keyword + ' ') || message.endsWith(' ' + keyword);
    });
  }
}
