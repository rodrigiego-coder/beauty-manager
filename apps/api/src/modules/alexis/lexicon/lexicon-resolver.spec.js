"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lexicon_resolver_1 = require("./lexicon-resolver");
const repair_templates_1 = require("./repair-templates");
const salon_lexicon_1 = require("./salon-lexicon");
// =====================================================
// 1. LEXICON MATCH — basic lookups
// =====================================================
describe('matchLexicon', () => {
    it('"progressiva" matches ALISAMENTO', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('progressiva');
        expect(result).not.toBeNull();
        expect(result.entry.canonical).toBe('Alisamento');
        expect(result.entry.suggestedServiceKey).toBe('ALISAMENTO');
        expect(result.needsConfirmation).toBe(false);
    });
    it('"selagem capilar" matches ALISAMENTO (multi-word priority)', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('quero selagem capilar');
        expect(result).not.toBeNull();
        expect(result.entry.canonical).toBe('Alisamento');
        expect(result.matchedTrigger).toBe('selagem capilar');
    });
    it('"liso espelhado" matches ALISAMENTO', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('quero liso espelhado');
        expect(result).not.toBeNull();
        expect(result.entry.canonical).toBe('Alisamento');
    });
    it('"botox" matches BOTOX (ambiguous, needs confirmation)', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('quero botox');
        expect(result).not.toBeNull();
        expect(result.entry.canonical).toBe('Botox Capilar');
        expect(result.needsConfirmation).toBe(true);
    });
    it('"tirar o amarelo" matches MATIZAÇÃO', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('quero tirar o amarelo');
        expect(result).not.toBeNull();
        expect(result.entry.canonical).toBe('Matização');
    });
    it('"desamarelar" matches MATIZAÇÃO', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('desamarelar');
        expect(result).not.toBeNull();
        expect(result.entry.canonical).toBe('Matização');
    });
    it('"luzes" matches MECHAS', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('quero fazer luzes');
        expect(result).not.toBeNull();
        expect(result.entry.canonical).toBe('Mechas');
    });
    it('"reflexo" matches MECHAS', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('reflexo');
        expect(result).not.toBeNull();
        expect(result.entry.canonical).toBe('Mechas');
    });
    it('"retocar raiz" matches COLORAÇÃO DE RAIZ', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('preciso retocar raiz');
        expect(result).not.toBeNull();
        expect(result.entry.canonical).toBe('Coloração de Raiz');
    });
    it('"cobrir branco" matches COLORAÇÃO DE RAIZ', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('quero cobrir branco');
        expect(result).not.toBeNull();
        expect(result.entry.canonical).toBe('Coloração de Raiz');
    });
    it('"cabelo chiclete" matches RECONSTRUÇÃO (condition)', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('meu cabelo chiclete');
        expect(result).not.toBeNull();
        expect(result.entry.canonical).toBe('Reconstrução Capilar');
        expect(result.entry.entityType).toBe('CONDITION');
        expect(result.entry.riskLevel).toBe('HIGH');
    });
    it('"emborrachado" matches RECONSTRUÇÃO', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('cabelo emborrachado');
        expect(result).not.toBeNull();
        expect(result.entry.canonical).toBe('Reconstrução Capilar');
    });
    it('"banho de oleo" matches NUTRIÇÃO', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('quero banho de oleo');
        expect(result).not.toBeNull();
        expect(result.entry.canonical).toBe('Nutrição Capilar');
    });
    it('"nanoplastia" matches ALISAMENTO', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('nanoplastia');
        expect(result).not.toBeNull();
        expect(result.entry.canonical).toBe('Alisamento');
    });
    it('random text returns null', () => {
        expect((0, lexicon_resolver_1.matchLexicon)('bom dia tudo bem?')).toBeNull();
    });
    it('short text returns null', () => {
        expect((0, lexicon_resolver_1.matchLexicon)('oi')).toBeNull();
    });
});
// =====================================================
// 2. RESOLVE DIALECT TO SERVICE
// =====================================================
describe('resolveDialectToService', () => {
    it('"progressiva" => "Alisamento"', () => {
        expect((0, lexicon_resolver_1.resolveDialectToService)('progressiva')).toBe('Alisamento');
    });
    it('"luzes" => "Mechas"', () => {
        expect((0, lexicon_resolver_1.resolveDialectToService)('luzes')).toBe('Mechas');
    });
    it('"tirar o amarelo" => "Matização"', () => {
        expect((0, lexicon_resolver_1.resolveDialectToService)('tirar o amarelo')).toBe('Matização');
    });
    it('unknown => null', () => {
        expect((0, lexicon_resolver_1.resolveDialectToService)('bom dia')).toBeNull();
    });
});
// =====================================================
// 3. REPAIR TEMPLATES
// =====================================================
describe('repair templates', () => {
    it('REPAIR_SERVICE_CANONICAL produces text with canonical + trigger', () => {
        const entry = salon_lexicon_1.SALON_LEXICON.find((e) => e.id === 'ALIS_PROGRESSIVA');
        const result = (0, repair_templates_1.applyRepairTemplate)({
            entry,
            matchedTrigger: 'progressiva',
            serviceName: 'Alisamento',
        });
        expect(result.text).toContain('progressiva');
        expect(result.text).toContain('Alisamento');
        expect(result.text).toContain('teste de mecha');
        expect(result.followUpQuestion).toBeDefined();
        expect(result.followUpQuestion).toContain('cabelo');
    });
    it('REPAIR_SERVICE_CANONICAL with price', () => {
        const entry = salon_lexicon_1.SALON_LEXICON.find((e) => e.id === 'ALIS_PROGRESSIVA');
        const result = (0, repair_templates_1.applyRepairTemplate)({
            entry,
            matchedTrigger: 'progressiva',
            serviceName: 'Alisamento',
            hasPrice: true,
            price: 250,
        });
        expect(result.text).toContain('R$ 250');
    });
    it('REPAIR_CONDITION_TO_PROTOCOL for elasticidade', () => {
        const entry = salon_lexicon_1.SALON_LEXICON.find((e) => e.id === 'ELASTICIDADE');
        const result = (0, repair_templates_1.applyRepairTemplate)({
            entry,
            matchedTrigger: 'cabelo chiclete',
        });
        expect(result.text).toContain('Reconstrução Capilar');
        expect(result.text).toContain('chiclete');
        expect(result.followUpQuestion).toBeDefined();
        expect(result.followUpQuestion).toContain('química');
    });
    it('REPAIR_AMBIGUOUS_ASK_CONFIRM for botox', () => {
        const entry = salon_lexicon_1.SALON_LEXICON.find((e) => e.id === 'BOTOX_AMBIGUOUS');
        const result = (0, repair_templates_1.applyRepairTemplate)({
            entry,
            matchedTrigger: 'botox',
        });
        expect(result.text).toContain('Botox Capilar');
        expect(result.followUpQuestion).toContain('alinhar');
    });
    it('composeRepairResponse joins text + followUp', () => {
        const result = (0, repair_templates_1.composeRepairResponse)({
            text: 'Texto base.',
            followUpQuestion: 'Pergunta?',
        });
        expect(result).toBe('Texto base.\n\nPergunta?');
    });
    it('composeRepairResponse without followUp', () => {
        const result = (0, repair_templates_1.composeRepairResponse)({
            text: 'Texto base.',
        });
        expect(result).toBe('Texto base.');
    });
});
// =====================================================
// 4. LEXICON DATA INTEGRITY
// =====================================================
describe('lexicon data integrity', () => {
    it('has at least 20 entries', () => {
        expect(salon_lexicon_1.SALON_LEXICON.length).toBeGreaterThanOrEqual(20);
    });
    it('all entries have required fields', () => {
        for (const entry of salon_lexicon_1.SALON_LEXICON) {
            expect(entry.id).toBeDefined();
            expect(entry.entityType).toBeDefined();
            expect(entry.canonical).toBeDefined();
            expect(entry.triggers.length).toBeGreaterThan(0);
            expect(entry.repairTemplateKey).toBeDefined();
        }
    });
    it('no duplicate IDs', () => {
        const ids = salon_lexicon_1.SALON_LEXICON.map((e) => e.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
    it('all triggers are lowercase-ish (no uppercase)', () => {
        for (const entry of salon_lexicon_1.SALON_LEXICON) {
            for (const trigger of entry.triggers) {
                expect(trigger).toBe(trigger.toLowerCase());
            }
        }
    });
});
// =====================================================
// 5. PRICE QUESTION WITH DIALECT (integration)
// =====================================================
describe('price question with dialect', () => {
    it('"quanto custa a progressiva?" resolves to Alisamento service', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('quanto custa a progressiva');
        expect(result).not.toBeNull();
        expect(result.entry.canonical).toBe('Alisamento');
        expect(result.entry.entityType).toBe('SERVICE');
        // Should NOT be treated as a product
        expect(result.entry.suggestedServiceKey).toBe('ALISAMENTO');
    });
    it('"Quero progressiva amanhã de manhã" resolves to Alisamento', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('quero progressiva amanhã de manhã');
        expect(result).not.toBeNull();
        expect(result.entry.canonical).toBe('Alisamento');
    });
    it('"cabelo chiclete" resolves to Reconstrução + high risk', () => {
        const result = (0, lexicon_resolver_1.matchLexicon)('meu cabelo está chiclete');
        expect(result).not.toBeNull();
        expect(result.entry.riskLevel).toBe('HIGH');
        expect(result.entry.canonical).toBe('Reconstrução Capilar');
    });
});
//# sourceMappingURL=lexicon-resolver.spec.js.map