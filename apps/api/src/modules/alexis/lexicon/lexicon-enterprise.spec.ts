/**
 * =====================================================
 * P0.2.2 TESTS — Observability, Feature Flag, Service Price
 * =====================================================
 */

import { getLexiconEnabled } from './lexicon-feature-flag';
import { buildLexiconTelemetry } from './lexicon-telemetry';
import { resolveServicePrice, formatServicePriceResponse } from './service-price-resolver';
import type { CatalogService } from './service-price-resolver';
import { matchLexicon } from './lexicon-resolver';

// =====================================================
// 1. FEATURE FLAG
// =====================================================
describe('getLexiconEnabled', () => {
  const originalEnv = process.env.ALEXIS_LEXICON_ENABLED;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ALEXIS_LEXICON_ENABLED;
    } else {
      process.env.ALEXIS_LEXICON_ENABLED = originalEnv;
    }
  });

  it('returns true when env is undefined (default)', () => {
    delete process.env.ALEXIS_LEXICON_ENABLED;
    expect(getLexiconEnabled()).toBe(true);
  });

  it('returns true when env is empty string', () => {
    process.env.ALEXIS_LEXICON_ENABLED = '';
    expect(getLexiconEnabled()).toBe(true);
  });

  it('returns true when env is "true"', () => {
    process.env.ALEXIS_LEXICON_ENABLED = 'true';
    expect(getLexiconEnabled()).toBe(true);
  });

  it('returns true when env is "1"', () => {
    process.env.ALEXIS_LEXICON_ENABLED = '1';
    expect(getLexiconEnabled()).toBe(true);
  });

  it('returns false when env is "false"', () => {
    process.env.ALEXIS_LEXICON_ENABLED = 'false';
    expect(getLexiconEnabled()).toBe(false);
  });

  it('returns false when env is "0"', () => {
    process.env.ALEXIS_LEXICON_ENABLED = '0';
    expect(getLexiconEnabled()).toBe(false);
  });
});

// =====================================================
// 2. LEXICON TELEMETRY
// =====================================================
describe('buildLexiconTelemetry', () => {
  it('flag OFF → decision IGNORE, reason feature_flag_off', () => {
    const event = buildLexiconTelemetry(null, false);
    expect(event.lexiconEnabled).toBe(false);
    expect(event.decision).toBe('IGNORE');
    expect(event.reason).toBe('feature_flag_off');
    expect(event.entryId).toBeNull();
  });

  it('no match → decision IGNORE, reason no_match', () => {
    const event = buildLexiconTelemetry(null, true);
    expect(event.lexiconEnabled).toBe(true);
    expect(event.decision).toBe('IGNORE');
    expect(event.reason).toBe('no_match');
  });

  it('confident match → decision ASSUME, has entryId/confidence', () => {
    const match = matchLexicon('progressiva');
    expect(match).not.toBeNull();
    const event = buildLexiconTelemetry(match, true);
    expect(event.lexiconEnabled).toBe(true);
    expect(event.decision).toBe('ASSUME');
    expect(event.entryId).toBe('ALIS_PROGRESSIVA');
    expect(event.canonical).toBe('Alisamento');
    expect(event.matchedTrigger).toBe('progressiva');
    expect(event.confidence).toBeGreaterThan(0);
    expect(event.reason).toBe('confident_match');
  });

  it('ambiguous match → decision ASK_CONFIRM, reason ambiguous', () => {
    const match = matchLexicon('quero botox');
    expect(match).not.toBeNull();
    const event = buildLexiconTelemetry(match, true);
    expect(event.decision).toBe('ASK_CONFIRM');
    expect(event.reason).toBe('ambiguous');
    expect(event.entryId).toBe('BOTOX_AMBIGUOUS');
  });

  it('override reason is used when provided', () => {
    const match = matchLexicon('progressiva');
    const event = buildLexiconTelemetry(match, true, 'fsm_step_overrides_intent');
    expect(event.reason).toBe('fsm_step_overrides_intent');
    expect(event.decision).toBe('ASSUME');
  });

  it('does NOT include raw user text (privacy)', () => {
    const match = matchLexicon('quanto custa a progressiva amanhã');
    const event = buildLexiconTelemetry(match, true);
    // Only trigger, not full text
    expect(event.matchedTrigger).toBe('progressiva');
    expect(JSON.stringify(event)).not.toContain('quanto custa');
  });
});

// =====================================================
// 3. SERVICE PRICE RESOLVER
// =====================================================
describe('resolveServicePrice', () => {
  const catalog: CatalogService[] = [
    { id: 1, name: 'Alisamento', price: 250, category: 'HAIR' },
    { id: 2, name: 'Mechas', price: 180, category: 'HAIR' },
    { id: 3, name: 'Corte Feminino', price: 80, category: 'HAIR' },
    { id: 4, name: 'Hidratação', price: '120.50', category: 'HAIR' },
    { id: 5, name: 'Escova', price: 0, category: 'HAIR' },
  ];

  it('exact match: "Alisamento" → price 250', () => {
    const result = resolveServicePrice('Alisamento', catalog);
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Alisamento');
    expect(result!.price).toBe(250);
    expect(result!.currency).toBe('BRL');
  });

  it('case-insensitive: "alisamento" → price 250', () => {
    const result = resolveServicePrice('alisamento', catalog);
    expect(result).not.toBeNull();
    expect(result!.price).toBe(250);
  });

  it('includes match: "Mechas" → price 180', () => {
    const result = resolveServicePrice('Mechas', catalog);
    expect(result).not.toBeNull();
    expect(result!.price).toBe(180);
  });

  it('string price parsed: "Hidratação" → 120.50', () => {
    const result = resolveServicePrice('Hidratação', catalog);
    expect(result).not.toBeNull();
    expect(result!.price).toBe(120.5);
  });

  it('price 0 → null (no valid price)', () => {
    const result = resolveServicePrice('Escova', catalog);
    expect(result).toBeNull();
  });

  it('unknown service → null', () => {
    const result = resolveServicePrice('Depilação', catalog);
    expect(result).toBeNull();
  });

  it('empty catalog → null', () => {
    const result = resolveServicePrice('Alisamento', []);
    expect(result).toBeNull();
  });
});

// =====================================================
// 4. FORMAT SERVICE PRICE RESPONSE
// =====================================================
describe('formatServicePriceResponse', () => {
  it('with price → concrete response with CTA', () => {
    const response = formatServicePriceResponse(
      'progressiva',
      'Alisamento',
      { name: 'Alisamento', price: 250, currency: 'BRL' },
    );
    expect(response).toContain('Alisamento');
    expect(response).toContain('R$ 250');
    expect(response).toContain('agendar');
    expect(response).not.toContain('variar');
  });

  it('without price → consultive response (no invented values)', () => {
    const response = formatServicePriceResponse(
      'progressiva',
      'Alisamento',
      null,
    );
    expect(response).toContain('Alisamento');
    expect(response).toContain('variar');
    expect(response).not.toContain('R$');
  });
});

// =====================================================
// 5. PRICE_INFO INTEGRATION (end-to-end pure)
// =====================================================
describe('PRICE_INFO integration', () => {
  const catalog: CatalogService[] = [
    { id: 1, name: 'Alisamento', price: 250 },
    { id: 2, name: 'Mechas', price: 180 },
  ];

  it('"progressiva" → Alisamento service price, not product', () => {
    const lexMatch = matchLexicon('quanto custa a progressiva');
    expect(lexMatch).not.toBeNull();
    expect(lexMatch!.entry.canonical).toBe('Alisamento');
    expect(lexMatch!.entry.entityType).toBe('SERVICE');

    const priceResult = resolveServicePrice(lexMatch!.entry.canonical, catalog);
    expect(priceResult).not.toBeNull();
    expect(priceResult!.price).toBe(250);

    const response = formatServicePriceResponse(
      lexMatch!.matchedTrigger,
      lexMatch!.entry.canonical,
      priceResult,
    );
    expect(response).toContain('R$ 250');
    expect(response).toContain('agendar');
  });

  it('"luzes" → Mechas service price', () => {
    const lexMatch = matchLexicon('quanto custa as luzes');
    expect(lexMatch).not.toBeNull();
    expect(lexMatch!.entry.canonical).toBe('Mechas');

    const priceResult = resolveServicePrice(lexMatch!.entry.canonical, catalog);
    expect(priceResult).not.toBeNull();
    expect(priceResult!.price).toBe(180);
  });

  it('flag OFF: lexicon not used', () => {
    // Simulate flag off
    process.env.ALEXIS_LEXICON_ENABLED = 'false';
    const enabled = getLexiconEnabled();
    expect(enabled).toBe(false);

    // When flag is off, telemetry shows IGNORE
    const telemetry = buildLexiconTelemetry(null, enabled);
    expect(telemetry.decision).toBe('IGNORE');
    expect(telemetry.reason).toBe('feature_flag_off');

    // Cleanup
    delete process.env.ALEXIS_LEXICON_ENABLED;
  });

  it('telemetry records decision and entryId on lexicon run', () => {
    const match = matchLexicon('progressiva');
    const telemetry = buildLexiconTelemetry(match, true);
    expect(telemetry.entryId).toBe('ALIS_PROGRESSIVA');
    expect(telemetry.decision).toBe('ASSUME');
    expect(telemetry.confidence).toBeGreaterThan(0);
  });
});
