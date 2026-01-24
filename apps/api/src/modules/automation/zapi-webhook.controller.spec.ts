/**
 * =====================================================
 * Z-API WEBHOOK CONTROLLER - TESTES UNITÁRIOS
 * Testes para: ignorar grupos, resolução de salão
 * =====================================================
 */

describe('ZapiWebhookController - Group Filtering', () => {
  /**
   * Simula a lógica de detecção de grupos
   * Mesma lógica usada no handleIncomingMessage
   */
  function isGroupMessage(payload: { isGroup?: boolean; phone?: string; from?: string }): boolean {
    const phoneRaw = payload.phone || payload.from || '';
    return payload.isGroup === true || phoneRaw.endsWith('-group') || phoneRaw.includes('@g.us');
  }

  it('should identify isGroup=true as group message', () => {
    expect(isGroupMessage({ isGroup: true, phone: '5511999999999' })).toBe(true);
  });

  it('should identify phone ending with "-group" as group message', () => {
    expect(isGroupMessage({ phone: '5511999999999-group' })).toBe(true);
    expect(isGroupMessage({ from: '5511999999999-group' })).toBe(true);
  });

  it('should identify @g.us suffix as group message', () => {
    expect(isGroupMessage({ phone: '5511999999999@g.us' })).toBe(true);
    expect(isGroupMessage({ from: '120363123456789012@g.us' })).toBe(true);
  });

  it('should NOT identify normal phone as group', () => {
    expect(isGroupMessage({ phone: '5511999999999' })).toBe(false);
    expect(isGroupMessage({ phone: '5511999999999@c.us' })).toBe(false);
    expect(isGroupMessage({ from: '5511999999999' })).toBe(false);
  });

  it('should handle empty/missing phone', () => {
    expect(isGroupMessage({})).toBe(false);
    expect(isGroupMessage({ phone: '' })).toBe(false);
  });
});

describe('ZapiWebhookController - Salon Resolution Logic', () => {
  /**
   * Simula a lógica de resolução de salão
   * Prioridades:
   * 1) Slug da env var ZAPI_DEFAULT_SALON_SLUG
   * 2) Fallback: primeiro salão com name ILIKE '%demo%'
   */
  interface MockSalon {
    id: string;
    slug: string;
    name: string;
  }

  const mockSalons: MockSalon[] = [
    { id: '111', slug: 'salao-premium', name: 'Salão Premium' },
    { id: '222', slug: 'salao-demo', name: 'Salão Demo Teste' },
    { id: '333', slug: 'outro-salao', name: 'Outro Salão' },
  ];

  function resolveSalonId(configuredSlug: string | undefined, salons: MockSalon[]): string | null {
    // Tentativa 1: Slug configurado
    if (configuredSlug) {
      const salonBySlug = salons.find(s => s.slug === configuredSlug);
      if (salonBySlug) return salonBySlug.id;
    }

    // Tentativa 2: Fallback demo
    const demoSalon = salons.find(s => s.name.toLowerCase().includes('demo'));
    if (demoSalon) return demoSalon.id;

    return null;
  }

  it('should return salon by configured slug when available', () => {
    const result = resolveSalonId('salao-premium', mockSalons);
    expect(result).toBe('111');
  });

  it('should fallback to demo salon when slug not found', () => {
    const result = resolveSalonId('slug-inexistente', mockSalons);
    expect(result).toBe('222'); // Demo salon
  });

  it('should fallback to demo salon when no slug configured', () => {
    const result = resolveSalonId(undefined, mockSalons);
    expect(result).toBe('222'); // Demo salon
  });

  it('should return null when no salon matches', () => {
    const salonsWithoutDemo: MockSalon[] = [
      { id: '111', slug: 'salao-a', name: 'Salão A' },
      { id: '222', slug: 'salao-b', name: 'Salão B' },
    ];
    const result = resolveSalonId(undefined, salonsWithoutDemo);
    expect(result).toBeNull();
  });

  it('should find demo salon case-insensitively', () => {
    const salonsVariedCase: MockSalon[] = [
      { id: '111', slug: 'salao-demo', name: 'Salão DEMO Oficial' },
    ];
    const result = resolveSalonId(undefined, salonsVariedCase);
    expect(result).toBe('111');
  });
});

describe('ZapiWebhookController - Phone Extraction', () => {
  /**
   * Simula a lógica de extração de telefone
   */
  function extractPhone(phone: string): string {
    if (!phone) return '';
    return phone.replace(/@.*$/, '').replace(/\D/g, '');
  }

  it('should extract clean phone from @c.us format', () => {
    expect(extractPhone('5511999999999@c.us')).toBe('5511999999999');
  });

  it('should extract clean phone from plain number', () => {
    expect(extractPhone('5511999999999')).toBe('5511999999999');
  });

  it('should remove non-digit characters', () => {
    expect(extractPhone('+55 (11) 99999-9999')).toBe('5511999999999');
  });

  it('should handle empty input', () => {
    expect(extractPhone('')).toBe('');
  });
});
