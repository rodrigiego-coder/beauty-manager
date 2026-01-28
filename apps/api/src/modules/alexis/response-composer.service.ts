import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../database/connection';
import { alexisContacts, salons } from '../../database/schema';
import { eq, and } from 'drizzle-orm';

/**
 * =====================================================
 * RESPONSE COMPOSER SERVICE (DELTA)
 * Humaniza respostas da Alexis com tom acolhedor
 * Sem emojis por padrao, profissional e direto
 * =====================================================
 */

// =====================================================
// TYPES
// =====================================================

export interface ComposeInput {
  salonId: string;
  phone: string;
  clientName?: string;
  intent: string;
  baseText: string;
  /** Se true, pula saudação/apresentação (conversa em andamento) */
  skipGreeting?: boolean;
}

export interface ContactInfo {
  id: string;
  name: string | null;
  lastGreetedAt: Date | null;
  lastSeenAt: Date;
}

// =====================================================
// PURE FUNCTIONS
// =====================================================

/**
 * Retorna saudacao contextual baseada no horario
 * Usa horario do servidor (ok para MVP)
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Verifica se deve repetir saudacao/apresentacao
 * Janela padrao: 12 horas
 */
export function shouldGreet(lastGreetedAt: Date | null, windowHours = 2): boolean {
  if (!lastGreetedAt) return true;
  const now = new Date();
  const diff = now.getTime() - lastGreetedAt.getTime();
  const hours = diff / (1000 * 60 * 60);
  return hours >= windowHours;
}

/**
 * Verifica se e uma intencao que merece CTA de produto
 */
export function isProductIntent(intent: string): boolean {
  return ['PRODUCT_INFO', 'PRICE_INFO'].includes(intent);
}

/**
 * Gera CTA suave para intencoes de produto
 */
export function getProductCta(): string {
  return 'Quer que eu separe pra voce ou prefere retirar no salao?';
}

/**
 * Gera pergunta de nome educada
 */
export function getNameQuestion(): string {
  return 'Como posso te chamar, por gentileza?';
}

/**
 * Gera apresentacao curta da Alexis
 */
export function getIntroduction(salonName: string): string {
  return `Eu sou a Alexis, assistente do ${salonName}.`;
}

/**
 * Compoe a resposta final com tom humanizado
 */
export function composeResponse(params: {
  greeting: string;
  introduction: string | null;
  clientName: string | null;
  baseText: string;
  cta: string | null;
  askName: boolean;
}): string {
  const parts: string[] = [];

  // Saudacao com primeiro nome se disponivel (P0.4: sem vírgula solta)
  const firstName = params.clientName?.split(' ')[0] || null;
  if (params.greeting && firstName) {
    parts.push(`${params.greeting}, ${firstName}!`);
  } else if (params.greeting) {
    parts.push(`${params.greeting}!`);
  }
  // skipGreeting=true e temos nome — NÃO prefixar (anti-repetição P0.5)

  // Apresentacao (apenas no primeiro contato da janela)
  if (params.introduction) {
    parts.push(params.introduction);
  }

  // Corpo da resposta (texto base)
  if (params.baseText) {
    parts.push(params.baseText);
  }

  // CTA para produtos
  if (params.cta) {
    parts.push(params.cta);
  }

  // Pergunta nome se nao temos
  if (params.askName) {
    parts.push(getNameQuestion());
  }

  return parts.join(' ');
}

// =====================================================
// SERVICE CLASS
// =====================================================

@Injectable()
export class ResponseComposerService {
  private readonly logger = new Logger(ResponseComposerService.name);

  /**
   * Compoe resposta humanizada
   * - Saudacao contextual
   * - Apresentacao no primeiro contato
   * - Pergunta nome se necessario
   * - CTA suave para produtos
   */
  async compose(input: ComposeInput): Promise<string> {
    const { salonId, phone, clientName, intent, baseText, skipGreeting } = input;

    // 1) Busca ou cria contato
    const contact = await this.upsertContact(salonId, phone, clientName);

    // 2) Busca nome do salao
    const salonName = await this.getSalonName(salonId);

    // 3) Determina se deve saudar/apresentar
    //    Anti-reset: skipGreeting=true quando conversa já está em andamento
    const shouldGreetNow = skipGreeting ? false : shouldGreet(contact.lastGreetedAt);

    // 4) Determina nome a usar (payload > salvo > null)
    const nameToUse = clientName || contact.name;

    // 5) Monta componentes
    const greeting = getGreeting();
    const introduction = shouldGreetNow ? getIntroduction(salonName) : null;
    const cta = isProductIntent(intent) ? getProductCta() : null;
    const askName = !nameToUse && shouldGreetNow;

    // 6) Compoe resposta
    const finalResponse = composeResponse({
      greeting: shouldGreetNow ? greeting : '',
      introduction,
      clientName: nameToUse,
      baseText,
      cta,
      askName,
    });

    // 7) Atualiza lastGreetedAt se saudou
    if (shouldGreetNow) {
      await this.updateGreetedAt(contact.id);
    }

    // 8) Se veio nome no payload e nao tinhamos, salva
    if (clientName && !contact.name) {
      await this.updateContactName(contact.id, clientName);
    }

    this.logger.debug(`Composed response for ${phone}: shouldGreet=${shouldGreetNow}, hasName=${!!nameToUse}`);

    return finalResponse.trim();
  }

  /**
   * Upsert contato (salon_id + phone)
   */
  private async upsertContact(salonId: string, phone: string, clientName?: string): Promise<ContactInfo> {
    // Tenta buscar existente
    const [existing] = await db
      .select()
      .from(alexisContacts)
      .where(and(eq(alexisContacts.salonId, salonId), eq(alexisContacts.phone, phone)))
      .limit(1);

    if (existing) {
      // Atualiza lastSeenAt
      await db
        .update(alexisContacts)
        .set({ lastSeenAt: new Date(), updatedAt: new Date() })
        .where(eq(alexisContacts.id, existing.id));

      return {
        id: existing.id,
        name: existing.name,
        lastGreetedAt: existing.lastGreetedAt,
        lastSeenAt: new Date(),
      };
    }

    // Cria novo
    const [newContact] = await db
      .insert(alexisContacts)
      .values({
        salonId,
        phone,
        name: clientName || null,
        lastSeenAt: new Date(),
      })
      .returning();

    return {
      id: newContact.id,
      name: newContact.name,
      lastGreetedAt: null,
      lastSeenAt: new Date(),
    };
  }

  /**
   * Atualiza lastGreetedAt
   */
  private async updateGreetedAt(contactId: string): Promise<void> {
    await db
      .update(alexisContacts)
      .set({ lastGreetedAt: new Date(), updatedAt: new Date() })
      .where(eq(alexisContacts.id, contactId));
  }

  /**
   * Atualiza nome do contato
   */
  private async updateContactName(contactId: string, name: string): Promise<void> {
    await db
      .update(alexisContacts)
      .set({ name, updatedAt: new Date() })
      .where(eq(alexisContacts.id, contactId));
  }

  /**
   * Busca nome do salao
   */
  private async getSalonName(salonId: string): Promise<string> {
    const [salon] = await db
      .select({ name: salons.name })
      .from(salons)
      .where(eq(salons.id, salonId))
      .limit(1);

    return salon?.name || 'Salao';
  }
}
