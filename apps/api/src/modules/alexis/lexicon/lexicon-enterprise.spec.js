"use strict";
/**
 * =====================================================
 * P0.2.2 TESTS — Observability, Feature Flag, Service Price
 * =====================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
const lexicon_feature_flag_1 = require("./lexicon-feature-flag");
const lexicon_telemetry_1 = require("./lexicon-telemetry");
const service_price_resolver_1 = require("./service-price-resolver");
const lexicon_resolver_1 = require("./lexicon-resolver");
// =====================================================
// 1. FEATURE FLAG
// =====================================================
describe('getLexiconEnabled', () => {
    const originalEnv = process.env.ALEXIS_LEXICON_ENABLED;
    afterEach(() => {
        if (originalEnv === undefined) {
            delete process.env.ALEXIS_LEXICON_ENABLED;
        }
        else {
            process.env.ALEXIS_LEXICON_ENABLED = originalEnv;
        }
    });
    it('returns true when env is undefined (default)', () => {
        delete process.env.ALEXIS_LEXICON_ENABLED;
        expect((0, lexicon_feature_flag_1.getLexiconEnabled)()).toBe(true);
    });
    it('returns true when env is empty string', () => {
        process.env.ALEXIS_LEXICON_ENABLED = '';
        expect((0, lexicon_feature_flag_1.getLexiconEnabled)()).toBe(true);
    });
    it('returns true when env is "true"', () => {
        process.env.ALEXIS_LEXICON_ENABLED = 'true';
        expect((0, lexicon_feature_flag_1.getLexiconEnabled)()).toBe(true);
    });
    it('returns true when env is "1"', () => {
        process.env.ALEXIS_LEXICON_ENABLED = '1';
        expect((0, lexicon_feature_flag_1.getLexiconEnabled)()).toBe(true);
    });
    it('returns false when env is "false"', () => {
        process.env.ALEXIS_LEXICON_ENABLED = 'false';
        expect((0, lexicon_feature_flag_1.getLexiconEnabled)()).toBe(false);
    });
    it('returns false when env is "0"', () => {
        process.env.ALEXIS_LEXICON_ENABLED = '0';
        expect((0, lexicon_feature_flag_1.getLexiconEnabled)()).toBe(false);
    });
});
// =====================================================
// 2. LEXICON TELEMETRY
// =====================================================
describe('buildLexiconTelemetry', () => {
    it('flag OFF → decision IGNORE, reason feature_flag_off', () => {
        const event = (0, lexicon_telemetry_1.buildLexiconTelemetry)(null, false);
        expect(event.lexiconEnabled).toBe(false);
        expect(event.decision).toBe('IGNORE');
        expect(event.reason).toBe('feature_flag_off');
        expect(event.entryId).toBeNull();
    });
    it('no match → decision IGNORE, reason no_match', () => {
        const event = (0, lexicon_telemetry_1.buildLexiconTelemetry)(null, true);
        expect(event.lexiconEnabled).toBe(true);
        expect(event.decision).toBe('IGNORE');
        expect(event.reason).toBe('no_match');
    });
    it('confident match → decision ASSUME, has entryId/confidence', () => {
        const match = (0, lexicon_resolver_1.matchLexicon)('progressiva');
        expect(match).not.toBeNull();
        const event = (0, lexicon_telemetry_1.buildLexiconTelemetry)(match, true);
        expect(event.lexiconEnabled).toBe(true);
        expect(event.decision).toBe('ASSUME');
        expect(event.entryId).toBe('ALIS_PROGRESSIVA');
        expect(event.canonical).toBe('Alisamento');
        expect(event.matchedTrigger).toBe('progressiva');
        expect(event.confidence).toBeGreaterThan(0);
        expect(event.reason).toBe('confident_match');
    });
    it('ambiguous match → decision ASK_CONFIRM, reason ambiguous', () => {
        const match = (0, lexicon_resolver_1.matchLexicon)('quero botox');
        expect(match).not.toBeNull();
        const event = (0, lexicon_telemetry_1.buildLexiconTelemetry)(match, true);
        expect(event.decision).toBe('ASK_CONFIRM');
        expect(event.reason).toBe('ambiguous');
        expect(event.entryId).toBe('BOTOX_AMBIGUOUS');
    });
    it('override reason is used when provided', () => {
        const match = (0, lexicon_resolver_1.matchLexicon)('progressiva');
        const event = (0, lexicon_telemetry_1.buildLexiconTelemetry)(match, true, 'fsm_step_overrides_intent');
        expect(event.reason).toBe('fsm_step_overrides_intent');
        expect(event.decision).toBe('ASSUME');
    });
    it('does NOT include raw user text (privacy)', () => {
        const match = (0, lexicon_resolver_1.matchLexicon)('quanto custa a progressiva amanhã');
        const event = (0, lexicon_telemetry_1.buildLexiconTelemetry)(match, true);
        // Only trigger, not full text
        expect(event.matchedTrigger).toBe('progressiva');
        expect(JSON.stringify(event)).not.toContain('quanto custa');
    });
});
// =====================================================
// 3. SERVICE PRICE RESOLVER
// =====================================================
describe('resolveServicePrice', () => {
    const catalog = [
        { id: 1, name: 'Alisamento', price: 250, category: 'HAIR' },
        { id: 2, name: 'Mechas', price: 180, category: 'HAIR' },
        { id: 3, name: 'Corte Feminino', price: 80, category: 'HAIR' },
        { id: 4, name: 'Hidratação', price: '120.50', category: 'HAIR' },
        { id: 5, name: 'Escova', price: 0, category: 'HAIR' },
    ];
    it('exact match: "Alisamento" → price 250', () => {
        const result = (0, service_price_resolver_1.resolveServicePrice)('Alisamento', catalog);
        expect(result).not.toBeNull();
        expect(result.name).toBe('Alisamento');
        expect(result.price).toBe(250);
        expect(result.currency).toBe('BRL');
    });
    it('case-insensitive: "alisamento" → price 250', () => {
        const result = (0, service_price_resolver_1.resolveServicePrice)('alisamento', catalog);
        expect(result).not.toBeNull();
        expect(result.price).toBe(250);
    });
    it('includes match: "Mechas" → price 180', () => {
        const result = (0, service_price_resolver_1.resolveServicePrice)('Mechas', catalog);
        expect(result).not.toBeNull();
        expect(result.price).toBe(180);
    });
    it('string price parsed: "Hidratação" → 120.50', () => {
        const result = (0, service_price_resolver_1.resolveServicePrice)('Hidratação', catalog);
        expect(result).not.toBeNull();
        expect(result.price).toBe(120.5);
    });
    it('price 0 → null (no valid price)', () => {
        const result = (0, service_price_resolver_1.resolveServicePrice)('Escova', catalog);
        expect(result).toBeNull();
    });
    it('unknown service → null', () => {
        const result = (0, service_price_resolver_1.resolveServicePrice)('Depilação', catalog);
        expect(result).toBeNull();
    });
    it('empty catalog → null', () => {
        const result = (0, service_price_resolver_1.resolveServicePrice)('Alisamento', []);
        expect(result).toBeNull();
    });
});
// =====================================================
// 4. FORMAT SERVICE PRICE RESPONSE
// =====================================================
describe('formatServicePriceResponse', () => {
    it('with price → concrete response with CTA', () => {
        const response = (0, service_price_resolver_1.formatServicePriceResponse)('progressiva', 'Alisamento', { name: 'Alisamento', price: 250, currency: 'BRL' });
        expect(response).toContain('Alisamento');
        expect(response).toContain('R$ 250');
        expect(response).toContain('agendar');
        expect(response).not.toContain('variar');
    });
    it('without price → consultive response (no invented values)', () => {
        const response = (0, service_price_resolver_1.formatServicePriceResponse)('progressiva', 'Alisamento', null);
        expect(response).toContain('Alisamento');
        expect(response).toContain('variar');
        expect(response).not.toContain('R$');
    });
});
// =====================================================
// 5. PRICE_INFO INTEGRATION (end-to-end pure)
// =====================================================
describe('PRICE_INFO integration', () => {
    const catalog = [
        { id: 1, name: 'Alisamento', price: 250 },
        { id: 2, name: 'Mechas', price: 180 },
    ];
    it('"progressiva" → Alisamento service price, not product', () => {
        const lexMatch = (0, lexicon_resolver_1.matchLexicon)('quanto custa a progressiva');
        expect(lexMatch).not.toBeNull();
        expect(lexMatch.entry.canonical).toBe('Alisamento');
        expect(lexMatch.entry.entityType).toBe('SERVICE');
        const priceResult = (0, service_price_resolver_1.resolveServicePrice)(lexMatch.entry.canonical, catalog);
        expect(priceResult).not.toBeNull();
        expect(priceResult.price).toBe(250);
        const response = (0, service_price_resolver_1.formatServicePriceResponse)(lexMatch.matchedTrigger, lexMatch.entry.canonical, priceResult);
        expect(response).toContain('R$ 250');
        expect(response).toContain('agendar');
    });
    it('"luzes" → Mechas service price', () => {
        const lexMatch = (0, lexicon_resolver_1.matchLexicon)('quanto custa as luzes');
        expect(lexMatch).not.toBeNull();
        expect(lexMatch.entry.canonical).toBe('Mechas');
        const priceResult = (0, service_price_resolver_1.resolveServicePrice)(lexMatch.entry.canonical, catalog);
        expect(priceResult).not.toBeNull();
        expect(priceResult.price).toBe(180);
    });
    it('flag OFF: lexicon not used', () => {
        // Simulate flag off
        process.env.ALEXIS_LEXICON_ENABLED = 'false';
        const enabled = (0, lexicon_feature_flag_1.getLexiconEnabled)();
        expect(enabled).toBe(false);
        // When flag is off, telemetry shows IGNORE
        const telemetry = (0, lexicon_telemetry_1.buildLexiconTelemetry)(null, enabled);
        expect(telemetry.decision).toBe('IGNORE');
        expect(telemetry.reason).toBe('feature_flag_off');
        // Cleanup
        delete process.env.ALEXIS_LEXICON_ENABLED;
    });
    it('telemetry records decision and entryId on lexicon run', () => {
        const match = (0, lexicon_resolver_1.matchLexicon)('progressiva');
        const telemetry = (0, lexicon_telemetry_1.buildLexiconTelemetry)(match, true);
        expect(telemetry.entryId).toBe('ALIS_PROGRESSIVA');
        expect(telemetry.decision).toBe('ASSUME');
        expect(telemetry.confidence).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=lexicon-enterprise.spec.js.map