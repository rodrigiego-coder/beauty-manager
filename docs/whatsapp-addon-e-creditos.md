# Add-on WhatsApp e Sistema de Créditos

> **Fonte da verdade** para a arquitetura de Add-ons WhatsApp, quotas mensais e consumo por agendamento.

## Visão Geral

O sistema de Add-on WhatsApp permite que salões contratem pacotes mensais de notificações WhatsApp (confirmação, lembrete, etc.) com quotas por tier. Quando a quota incluída se esgota, o salão pode comprar créditos extras em pacotes avulsos.

### Modelo de Negócio

```
┌─────────────────────────────────────────────────────────────────┐
│                      ADD-ON WHATSAPP                            │
├─────────────────────────────────────────────────────────────────┤
│  BASIC (templates simples)         PRO (templates avançados)    │
│  ├── 120 agend/mês → R$ 29,90     ├── 120 agend/mês → R$ 49,90 │
│  ├── 160 agend/mês → R$ 39,90     ├── 160 agend/mês → R$ 69,90 │
│  ├── 200 agend/mês → R$ 49,90     ├── 200 agend/mês → R$ 89,90 │
│  └── 240 agend/mês → R$ 59,90     └── 240 agend/mês → R$ 99,90 │
├─────────────────────────────────────────────────────────────────┤
│  CRÉDITO EXTRA: +20 agendamentos por R$ 10,00                   │
│  (WHATSAPP_EXTRA_20)                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Tabelas e Finalidade

### `addon_catalog`
Catálogo de add-ons disponíveis para contratação.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `code` | VARCHAR(50) PK | Código único (ex: `WHATSAPP_BASIC_120`) |
| `family` | VARCHAR(30) | Família do add-on (`WHATSAPP`) |
| `tier` | VARCHAR(20) | Nível (`BASIC`, `PRO`) |
| `quota_type` | VARCHAR(50) | Tipo de quota (`WHATSAPP_APPOINTMENT`) |
| `quota_amount` | INTEGER | Quantidade mensal incluída |
| `price_cents` | INTEGER | Preço em centavos |
| `is_active` | BOOLEAN | Se está disponível para venda |

### `credit_packages`
Pacotes de créditos extras para compra avulsa.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `code` | VARCHAR(50) PK | Código único (`WHATSAPP_EXTRA_20`) |
| `quota_type` | VARCHAR(50) | Tipo de quota |
| `qty` | INTEGER | Quantidade por pacote |
| `price_cents` | INTEGER | Preço em centavos |
| `is_active` | BOOLEAN | Se está disponível |

### `salon_addons`
Add-ons contratados por cada salão.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID PK | Identificador |
| `salon_id` | UUID FK | Salão |
| `addon_code` | VARCHAR(50) FK | Referência ao catálogo |
| `status` | ENUM | `ACTIVE`, `SUSPENDED`, `CANCELED` |
| `current_period_start` | TIMESTAMP | Início do período atual |
| `current_period_end` | TIMESTAMP | Fim do período atual |

### `salon_quotas`
Saldo de quotas por salão por mês.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID PK | Identificador |
| `salon_id` | UUID FK | Salão |
| `period_yyyymm` | INTEGER | Período (ex: `202601`) |
| `whatsapp_included` | INTEGER | Total incluído no plano |
| `whatsapp_used` | INTEGER | Consumido do incluído |
| `whatsapp_extra_purchased` | INTEGER | Total de extras comprados |
| `whatsapp_extra_used` | INTEGER | Consumido dos extras |

**Constraint:** `UNIQUE (salon_id, period_yyyymm)`

### `quota_ledger`
Auditoria de todas as operações de quota (ledger imutável).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID PK | Identificador |
| `salon_id` | UUID FK | Salão |
| `period_yyyymm` | INTEGER | Período |
| `event_type` | ENUM | `CONSUME`, `PURCHASE`, `GRANT`, `ADJUST`, `REFUND` |
| `quota_type` | VARCHAR(50) | Tipo de quota |
| `qty` | INTEGER | Quantidade (positivo=crédito, negativo=débito) |
| `ref_type` | VARCHAR(30) | Tipo de referência (`APPOINTMENT`, `MANUAL`, `INVOICE`) |
| `ref_id` | VARCHAR(100) | ID da referência |
| `metadata` | JSONB | Dados adicionais |

## Migrações

### `0017_addon_whatsapp_quotas.sql`
Cria as tabelas base do sistema de add-ons e quotas:
- Enums: `addon_status`, `quota_event_type`
- Tabelas: `addon_catalog`, `credit_packages`, `salon_addons`, `salon_quotas`, `quota_ledger`
- Índices para performance em buscas por `salon_id` e `period_yyyymm`

### `0018_quota_consumption_idempotency.sql` *(planejada)*
Adiciona índice único parcial para idempotência de consumo:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_quota_ledger_consume_idempotency
  ON quota_ledger (salon_id, period_yyyymm, ref_type, ref_id)
  WHERE event_type = 'CONSUME' AND ref_type = 'APPOINTMENT';
```

**Propósito:** Garante que cada agendamento só consuma quota uma vez por período, mesmo com retries ou reprocessamentos.

## Endpoints

### GET `/subscriptions/addons/catalog`
Retorna catálogo de add-ons e pacotes de crédito disponíveis.

**Roles:** `OWNER`, `MANAGER`, `RECEPTIONIST`, `STYLIST`

**Response:**
```json
{
  "addons": [
    {
      "code": "WHATSAPP_BASIC_120",
      "family": "WHATSAPP",
      "tier": "BASIC",
      "quotaType": "WHATSAPP_APPOINTMENT",
      "quotaAmount": 120,
      "priceCents": 2990,
      "priceFormatted": "R$ 29,90"
    }
  ],
  "creditPackages": [
    {
      "code": "WHATSAPP_EXTRA_20",
      "quotaType": "WHATSAPP_APPOINTMENT",
      "qty": 20,
      "priceCents": 1000,
      "priceFormatted": "R$ 10,00"
    }
  ]
}
```

### GET `/subscriptions/addons/status`
Retorna add-ons ativos e quotas do mês atual.

**Roles:** `OWNER`, `MANAGER`, `RECEPTIONIST`, `STYLIST`

**Response:**
```json
{
  "periodYyyymm": 202601,
  "addons": [
    {
      "id": "uuid",
      "addonCode": "WHATSAPP_BASIC_120",
      "status": "ACTIVE",
      "family": "WHATSAPP",
      "tier": "BASIC",
      "quotaAmount": 120,
      "priceCents": 2990
    }
  ],
  "quotas": {
    "whatsapp": {
      "included": 120,
      "used": 45,
      "includedRemaining": 75,
      "extraPurchased": 40,
      "extraUsed": 0,
      "extraRemaining": 40,
      "totalRemaining": 115
    }
  }
}
```

### POST `/subscriptions/addons/activate`
Ativa um add-on para o salão.

**Roles:** `OWNER`, `MANAGER`

**Request:**
```json
{
  "addonCode": "WHATSAPP_BASIC_120"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Add-on WHATSAPP_BASIC_120 ativado com sucesso",
  "addon": { "id": "uuid", "status": "ACTIVE" },
  "quotaAdded": 120
}
```

### POST `/subscriptions/credits/grant`
Concede créditos extras (simulação - sem cobrança MP).

**Roles:** `OWNER`, `MANAGER`

**Request:**
```json
{
  "packageCode": "WHATSAPP_EXTRA_20",
  "qtyPackages": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "40 créditos adicionados com sucesso",
  "packageCode": "WHATSAPP_EXTRA_20",
  "qtyPackages": 2,
  "totalQty": 40,
  "totalCents": 2000,
  "totalFormatted": "R$ 20,00",
  "ledgerId": "uuid"
}
```

## Semântica do Consumo

### Regra de 1 Agendamento = 1 Consumo

Cada agendamento consome **1 quota** quando o **primeiro template WhatsApp** do fluxo é enviado (geralmente `APPOINTMENT_CONFIRMATION`).

**Idempotência:** O consumo é registrado com `ref_type = 'APPOINTMENT'` e `ref_id = appointmentId`. O índice único parcial garante que reprocessamentos não dupliquem o consumo.

### Ordem de Consumo

```
1. Verificar INCLUDED disponível (whatsapp_included - whatsapp_used > 0)
   → Se sim: incrementar whatsapp_used
   → Se não: verificar EXTRA

2. Verificar EXTRA disponível (whatsapp_extra_purchased - whatsapp_extra_used > 0)
   → Se sim: incrementar whatsapp_extra_used
   → Se não: QUOTA_EXCEEDED
```

### Comportamento em Quota Zero (Hard Block)

Quando `totalRemaining = 0`:

1. **Antes do envio:** O `ScheduledMessagesProcessor` verifica quota disponível
2. **Se quota = 0:**
   - Marcar notificação como `status = 'FAILED'`
   - Gravar `last_error = 'QUOTA_EXCEEDED'`
   - **NÃO enviar** a mensagem para o provedor WhatsApp
3. **Registro no ledger:** Não há registro de CONSUME (foi bloqueado antes)

### Degradação Graciosa (Erros Técnicos)

Em caso de erro técnico (DB timeout, conexão, etc.) ao verificar/decrementar quota:

- **Permitir o envio** da mensagem (fail-open)
- Logar o erro para investigação
- Tentar registrar consumo posteriormente (job de reconciliação)

**Justificativa:** Priorizar UX do cliente final sobre consistência estrita de billing.

## Observabilidade

### Logs-Chave

```typescript
// Consumo bem-sucedido
logger.info('Quota consumed', {
  salonId, appointmentId, periodYyyymm,
  source: 'INCLUDED' | 'EXTRA',
  remaining: number
});

// Bloqueio por quota
logger.warn('Quota exceeded - message blocked', {
  salonId, appointmentId, periodYyyymm,
  notificationId
});

// Erro técnico com degradação
logger.error('Quota check failed - allowing send (graceful degradation)', {
  salonId, appointmentId, error: string
});
```

### Auditoria via `quota_ledger`

```sql
-- Ver histórico de consumo de um salão no mês
SELECT * FROM quota_ledger
WHERE salon_id = 'uuid'
  AND period_yyyymm = 202601
ORDER BY created_at DESC;

-- Contar consumos vs grants
SELECT event_type, SUM(qty) as total
FROM quota_ledger
WHERE salon_id = 'uuid' AND period_yyyymm = 202601
GROUP BY event_type;
```

## Regras de UX (Painel)

### Exibição de Quotas

```
┌─────────────────────────────────────────────┐
│ WhatsApp - Janeiro/2026                     │
├─────────────────────────────────────────────┤
│ Incluído:  45 / 120 usados  (75 restantes)  │
│ Extras:     0 / 40 usados   (40 restantes)  │
│ ─────────────────────────────────────────── │
│ Total disponível: 115 agendamentos          │
└─────────────────────────────────────────────┘
```

### Alertas e Ações Sugeridas

| % Usado | Alerta | Ação Sugerida |
|---------|--------|---------------|
| < 80% | Nenhum | - |
| 80-90% | Amarelo | "Você está usando bastante! Considere fazer upgrade." |
| 90-100% | Laranja | "Quota quase no fim. Compre créditos ou faça upgrade." |
| 100% | Vermelho | "Quota esgotada! Compre créditos para continuar enviando." |

### Lógica de Sugestão

```
SE uso >= 80% DO incluído E mês ainda não acabou:
  → Sugerir upgrade para tier superior (ex: 120 → 160)

SE uso >= 100% DO incluído:
  → Oferecer compra de crédito imediata (+20 por R$10)
  → Mostrar botão destacado "Comprar Créditos"
```

## Integração com Notifications

### Fluxo de Consumo (ScheduledMessagesProcessor)

```
1. Processar notificação pendente
2. SE tipo = APPOINTMENT_CONFIRMATION (primeiro do fluxo):
   a. Verificar quota: GET status interno
   b. SE quota > 0:
      - Consumir quota (decrementar + ledger)
      - Enviar mensagem
      - Marcar SENT
   c. SE quota = 0:
      - Marcar FAILED com last_error = 'QUOTA_EXCEEDED'
      - NÃO enviar
3. SE tipo != APPOINTMENT_CONFIRMATION:
   - Enviar sem consumir quota adicional
     (já foi consumida no CONFIRMATION)
```

### Integração Futura com Alexis

Alexis (recepcionista IA) poderá:
- Consultar `/subscriptions/addons/status` para informar cliente sobre quota
- Sugerir upgrade quando detectar uso alto
- Alertar proprietário sobre quota baixa via notificação interna

## Arquivos Relacionados

- **Schema:** `apps/api/src/database/schema.ts` (tabelas addon_catalog, credit_packages, salon_addons, salon_quotas, quota_ledger)
- **Migration:** `apps/api/drizzle/0017_addon_whatsapp_quotas.sql`
- **Service:** `apps/api/src/modules/subscriptions/addons.service.ts`
- **Controller:** `apps/api/src/modules/subscriptions/addons.controller.ts`
- **DTOs:** `apps/api/src/modules/subscriptions/addons.dto.ts`
- **Seed:** `apps/api/src/seed.ts` (popula addon_catalog e credit_packages)
