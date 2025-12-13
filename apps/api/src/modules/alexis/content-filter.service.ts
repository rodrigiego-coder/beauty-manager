import { Injectable, Logger } from '@nestjs/common';
import {
  FORBIDDEN_REGEX,
  SAFE_REPLACEMENTS,
  BLOCKED_RESPONSE,
  COMMANDS,
} from './constants/forbidden-terms';

/**
 * =====================================================
 * CONTENT FILTER SERVICE
 * 3 Camadas de Proteção ANVISA/LGPD
 * =====================================================
 */

export interface FilterResult {
  allowed: boolean;
  blockedTerms: string[];
}

export interface OutputFilterResult {
  safe: boolean;
  filtered: string;
  blockedTerms: string[];
}

export interface CommandCheck {
  isCommand: boolean;
  command: 'HUMAN_TAKEOVER' | 'AI_RESUME' | null;
}

@Injectable()
export class ContentFilterService {
  private readonly logger = new Logger(ContentFilterService.name);

  /**
   * Verifica se a mensagem é um comando de controle (#eu ou #ia)
   * IMPORTANTE: Comandos NÃO são enviados ao cliente
   */
  isCommand(message: string): CommandCheck {
    const trimmed = message.trim().toLowerCase();

    if (trimmed === COMMANDS.HUMAN_TAKEOVER.toLowerCase()) {
      return { isCommand: true, command: 'HUMAN_TAKEOVER' };
    }

    if (trimmed === COMMANDS.AI_RESUME.toLowerCase()) {
      return { isCommand: true, command: 'AI_RESUME' };
    }

    return { isCommand: false, command: null };
  }

  /**
   * CAMADA 1: Filtro de ENTRADA
   * Executado ANTES de enviar para a IA
   * Bloqueia mensagens com termos proibidos
   */
  filterInput(message: string): FilterResult {
    const blockedTerms: string[] = [];

    for (const [category, regex] of Object.entries(FORBIDDEN_REGEX)) {
      // Reset regex lastIndex para evitar problemas com flags globais
      regex.lastIndex = 0;
      const matches = message.match(regex);

      if (matches) {
        this.logger.warn(`Termo bloqueado na entrada [${category}]: ${matches.join(', ')}`);
        blockedTerms.push(...matches);
      }
    }

    return {
      allowed: blockedTerms.length === 0,
      blockedTerms: [...new Set(blockedTerms)], // Remove duplicatas
    };
  }

  /**
   * CAMADA 3: Filtro de SAÍDA
   * Executado DEPOIS de receber resposta da IA
   * Sanitiza ou bloqueia respostas com termos proibidos
   */
  filterOutput(response: string): OutputFilterResult {
    let filtered = response;
    const blockedTerms: string[] = [];

    // Primeiro, tenta substituir por termos seguros
    for (const [forbidden, safe] of Object.entries(SAFE_REPLACEMENTS)) {
      const regex = new RegExp(`\\b${forbidden}\\b`, 'gi');
      if (regex.test(filtered)) {
        blockedTerms.push(forbidden);
        filtered = filtered.replace(regex, safe);
      }
    }

    // Depois, verifica se ainda tem termos proibidos
    for (const [category, regex] of Object.entries(FORBIDDEN_REGEX)) {
      regex.lastIndex = 0;
      const matches = filtered.match(regex);

      if (matches) {
        this.logger.warn(`Termo bloqueado na saída [${category}]: ${matches.join(', ')}`);
        blockedTerms.push(...matches);
      }
    }

    // Se ainda tiver termos proibidos após substituição, bloqueia tudo
    const stillHasForbidden = Object.values(FORBIDDEN_REGEX).some((regex) => {
      regex.lastIndex = 0;
      return regex.test(filtered);
    });

    if (stillHasForbidden) {
      this.logger.warn('Resposta da IA bloqueada por conter termos proibidos');
      return {
        safe: false,
        filtered: BLOCKED_RESPONSE,
        blockedTerms: [...new Set(blockedTerms)],
      };
    }

    return {
      safe: blockedTerms.length === 0,
      filtered,
      blockedTerms: [...new Set(blockedTerms)],
    };
  }

  /**
   * Obtém a resposta padrão para mensagens bloqueadas
   */
  getBlockedResponse(): string {
    return BLOCKED_RESPONSE;
  }
}
