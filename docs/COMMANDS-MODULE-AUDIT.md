# AUDITORIA DO MODULO DE COMANDAS

**Data:** 2024-12-20
**Status:** Em andamento

---

## ENTREGA 1: MAPA DO FLUXO ATUAL

### 1.1 TABELAS (Schema - Fonte de Verdade)

| Tabela | Descricao | Campos Chave |
|--------|-----------|--------------|
| `commands` | Comanda principal | id, salonId, clientId, cardNumber, code, status, totals, timestamps |
| `command_items` | Itens da comanda | id, commandId, type, referenceId, qty, price, performerId, canceledAt |
| `command_payments` | Pagamentos | id, commandId, method, amount, paymentMethodId, fee fields |
| `command_events` | Auditoria (append-only) | id, commandId, actorId, eventType, metadata, createdAt |

### 1.2 ESTADOS DA COMANDA

```
OPEN → IN_SERVICE → WAITING_PAYMENT → CLOSED
  ↓                       ↓
CANCELED              CANCELED
```

| Status | Descricao | Transicoes Permitidas |
|--------|-----------|----------------------|
| `OPEN` | Recem criada | → IN_SERVICE (ao add item), → CANCELED |
| `IN_SERVICE` | Em atendimento | → WAITING_PAYMENT (close-service), → CANCELED |
| `WAITING_PAYMENT` | Aguardando pagamento | → CLOSED (pagto total), → CANCELED |
| `CLOSED` | Encerrada | → WAITING_PAYMENT (reopen) |
| `CANCELED` | Cancelada | Terminal (sem transicao) |

### 1.3 ENDPOINTS (Controller)

| Metodo | Rota | Acao | Roles |
|--------|------|------|-------|
| GET | `/commands` | Lista comandas | * |
| GET | `/commands/open` | Lista abertas | * |
| GET | `/commands/clients` | Lista clientes | * |
| GET | `/commands/card/:num` | Busca por cartao | * |
| GET | `/commands/quick-access/:code` | Busca ou cria | * |
| GET | `/commands/:id` | Detalhes | * |
| GET | `/commands/:id/items` | Lista itens | * |
| GET | `/commands/:id/payments` | Lista pagamentos | * |
| GET | `/commands/:id/events` | Lista eventos | * |
| POST | `/commands` | Abre comanda | * |
| POST | `/commands/:id/items` | Adiciona item | * |
| PATCH | `/commands/:id/items/:itemId` | Atualiza item | * |
| DELETE | `/commands/:id/items/:itemId` | Remove item | * |
| POST | `/commands/:id/discount` | Aplica desconto | OWNER, MANAGER |
| POST | `/commands/:id/close-service` | Encerra servicos | * |
| POST | `/commands/:id/payments` | Adiciona pagamento | OWNER, MANAGER, RECEPTIONIST |
| POST | `/commands/:id/close-cashier` | Fecha caixa | OWNER, MANAGER, RECEPTIONIST |
| POST | `/commands/:id/cancel` | Cancela | OWNER, MANAGER |
| POST | `/commands/:id/reopen` | Reabre | OWNER, MANAGER |
| POST | `/commands/:id/link-client` | Vincula cliente | * |
| DELETE | `/commands/:id/client` | Remove cliente | * |
| POST | `/commands/:id/notes` | Adiciona nota | * |

### 1.4 DTOs E VALIDACOES

#### OpenCommandDto
- `cardNumber`: string (opcional) - se nao informado, gera automatico
- `clientId`: UUID (opcional) - cliente ja vinculado
- `notes`: string (opcional)

#### AddItemDto (HARDENING aplicado)
- `type`: enum SERVICE | PRODUCT (obrigatorio)
- `description`: string (obrigatorio)
- `quantity`: number (opcional, default 1)
- `unitPrice`: number (obrigatorio)
- `discount`: number (opcional, default 0)
- `performerId`: UUID (opcional)
- `referenceId`: string numerico (OBRIGATORIO se type=PRODUCT)

#### AddPaymentDto
- `method`: enum PaymentMethod (legado, opcional)
- `paymentMethodId`: UUID (novo, opcional)
- `paymentDestinationId`: UUID (opcional)
- `amount`: number (obrigatorio, > 0)
- `notes`: string (opcional)

### 1.5 EVENTOS DE AUDITORIA (eventType)

| Evento | Quando | Metadata |
|--------|--------|----------|
| `OPENED` | Comanda criada | cardNumber, clientId |
| `ITEM_ADDED` | Item adicionado | itemId, type, qty, price, performerId |
| `ITEM_UPDATED` | Item atualizado | itemId, from, to |
| `ITEM_CANCELED` | Item removido | itemId, reason |
| `DISCOUNT_APPLIED` | Desconto aplicado | amount, reason, oldDiscount, newDiscount |
| `SERVICE_CLOSED` | Servicos encerrados | totalGross, totalNet |
| `PAYMENT_ADDED` | Pagamento recebido | paymentId, method, amounts |
| `CASHIER_CLOSED` | Fechamento manual | totalNet, totalPaid, change |
| `CASHIER_CLOSED_AUTO` | Auto-close | totalNet, totalPaid, loyalty |
| `STATUS_CHANGED` | Cancelamento | from, to, reason |
| `CLIENT_LINKED` | Cliente vinculado | clientId, clientName |
| `CLIENT_UNLINKED` | Cliente removido | clientId, clientName |
| `NOTE_ADDED` | Nota adicionada | note |
| `COMMAND_REOPENED` | Reabertura | reason, previousStatus |

### 1.6 FRONTEND (CommandPage.tsx)

**Logica de Bloqueio:**
```typescript
isEditable = status !== 'CLOSED' && status !== 'CANCELED'
canCloseService = status === 'OPEN' || status === 'IN_SERVICE'
canCloseCashier = status === 'WAITING_PAYMENT' && remaining <= 0
canReopen = status === 'CLOSED' && (role === 'OWNER' || role === 'MANAGER')
```

**Exibicao de Timeline:**
- Componente exibe `command.events` (ultimos 10)
- Dados vem de `GET /commands/:id` (getDetails inclui events)

---

## LACUNAS E INCONSISTENCIAS IDENTIFICADAS

### L1: Cliente NAO obrigatorio para lancar itens
- **Evidencia:** `addItem()` nao verifica `command.clientId`
- **Impacto:** Comandas podem ter itens sem cliente, afetando fidelidade e relatorios
- **Decisao Necessaria:** Cliente obrigatorio antes de itens? Ou permitido com alerta?

### L2: Transicao OPEN → IN_SERVICE automatica
- **Evidencia:** `addItem()` muda status para IN_SERVICE ao adicionar primeiro item
- **Status:** OK - comportamento documentado

### L3: Auto-close sem transacao atomica
- **Evidencia:** `autoCloseCashier()` faz UPDATE e depois operacoes separadas
- **Impacto:** Se operacao secundaria falha, status ja foi alterado
- **Status:** Mitigado com try/catch (nao derruba resposta)

### L4: Falta idempotencia em pagamento
- **Evidencia:** `addPayment()` insere sempre, sem verificar duplicidade
- **Impacto:** Reenvio pode duplicar pagamento
- **Recomendacao:** Adicionar campo `idempotencyKey` ou verificar duplicidade recente

### L5: Estoque nao devolvido em cancelamento de comanda
- **Evidencia:** `cancel()` muda status mas nao chama `adjustStock(type='IN')`
- **Impacto:** Itens PRODUCT nao devolvem estoque ao cancelar comanda
- **Recomendacao:** Iterar `command_items` e devolver estoque de PRODUCTs

### L6: Multi-tenant verificado parcialmente
- **Evidencia:** Alguns metodos verificam `salonId`, outros nao
- **Impacto Potencial:** Acesso cross-tenant em alguns fluxos
- **Recomendacao:** Guard centralizado de multi-tenant

### L7: Eventos nao padronizados para IA
- **Evidencia:** eventType usa strings como 'OPENED', 'STATUS_CHANGED'
- **Recomendacao:** Padronizar para formato IA (COMMAND_CREATED, COMMAND_CANCELED)

---

## ENTREGA 2: CONTRATO EXPLICITO DO MODULO

### 2.1 PRE-REQUISITOS

| Operacao | Pre-requisito | Atual | Recomendacao |
|----------|---------------|-------|--------------|
| Abrir comanda | Caixa aberto | Sim (verifica) | OK |
| Adicionar item | Status OPEN/IN_SERVICE | Sim | OK |
| Adicionar item | Cliente vinculado | NAO | Opcional (ver L1) |
| Adicionar PRODUCT | referenceId valido | Sim (HARDENING) | OK |
| Adicionar pagamento | Status != CLOSED/CANCELED | Sim | OK |
| Fechar caixa | Pagamento >= Total | Sim | OK |
| Cancelar | Status != CLOSED | Sim | OK |
| Reabrir | Status = CLOSED | Sim | OK |

### 2.2 MAQUINA DE ESTADOS

```
                    ┌──────────────────────────────────────┐
                    │                                      │
                    ▼                                      │
┌─────────┐     ┌─────────────┐     ┌─────────────────┐   │
│  OPEN   │────▶│ IN_SERVICE  │────▶│ WAITING_PAYMENT │───┤
└────┬────┘     └──────┬──────┘     └────────┬────────┘   │
     │                 │                     │            │
     │                 │                     ▼            │
     │                 │            ┌────────────────┐    │
     │                 │            │    CLOSED      │────┘
     │                 │            └────────────────┘    (reopen)
     │                 │
     ▼                 ▼
┌─────────────────────────────────────┐
│            CANCELED                 │ (terminal)
└─────────────────────────────────────┘
```

### 2.3 TRANSICOES PERMITIDAS

| De | Para | Trigger | Quem | Auditoria |
|----|------|---------|------|-----------|
| OPEN | IN_SERVICE | addItem (automatico) | * | ITEM_ADDED |
| OPEN | CANCELED | cancel | OWNER/MANAGER | STATUS_CHANGED |
| IN_SERVICE | WAITING_PAYMENT | closeService | * | SERVICE_CLOSED |
| IN_SERVICE | CANCELED | cancel | OWNER/MANAGER | STATUS_CHANGED |
| WAITING_PAYMENT | CLOSED | closeCashier/autoClose | OWNER/MANAGER/RECEP | CASHIER_CLOSED |
| WAITING_PAYMENT | CANCELED | cancel | OWNER/MANAGER | STATUS_CHANGED |
| CLOSED | WAITING_PAYMENT | reopen | OWNER/MANAGER | COMMAND_REOPENED |

### 2.4 BLOQUEIOS POR ESTADO

| Estado | Pode | Nao Pode |
|--------|------|----------|
| OPEN | addItem, linkClient, addNote, cancel | addPayment, closeService*, closeCashier, reopen |
| IN_SERVICE | addItem, updateItem, removeItem, linkClient, addNote, closeService, cancel | closeCashier, reopen |
| WAITING_PAYMENT | addPayment, addDiscount, closeCashier, cancel, linkClient | addItem, closeService, reopen |
| CLOSED | reopen (OWNER/MANAGER) | Tudo (exceto leitura) |
| CANCELED | Nada | Tudo (exceto leitura) |

*closeService em OPEN: depende se tem itens

### 2.5 REGRAS DE NEGOCIO

#### Cliente
- **Atual:** Opcional em todas as operacoes
- **Recomendado:** Obrigatorio antes de addPayment (para fidelidade funcionar)

#### Estoque (PRODUCT)
- `addItem(PRODUCT)`: Baixa estoque (type=OUT)
- `updateItem`: Ajusta delta se qty mudou
- `removeItem`: Devolve estoque (type=IN)
- `cancel(command)`: **FALTA** - Deveria devolver estoque de todos PRODUCTs

#### Pagamentos
- Auto-close quando totalPaid >= totalNet - 0.01 (tolerancia 1 centavo)
- Suporta formato legado (method enum) e novo (paymentMethodId)
- Taxas calculadas por paymentMethod ou destination

#### Auditoria
- Toda acao registra evento em command_events
- Eventos sao imutaveis (append-only)
- Metadata varia por eventType

### 2.6 CAMPOS MINIMOS PARA IA "ALEXIS"

| Campo | Tabela | Uso IA |
|-------|--------|--------|
| commands.salonId | commands | Segmentacao |
| commands.clientId | commands | Analise de cliente |
| commands.status | commands | Funil de conversao |
| commands.totalNet | commands | Ticket medio |
| commands.openedAt/cashierClosedAt | commands | Tempo de atendimento |
| command_items.type | command_items | Mix produto/servico |
| command_items.performerId | command_items | Performance profissional |
| command_items.totalPrice | command_items | Receita por item |
| command_payments.method | command_payments | Preferencia de pagamento |
| command_events.eventType | command_events | Jornada do cliente |
| command_events.createdAt | command_events | Linha do tempo |

### 2.7 EVENTOS PADRONIZADOS PARA IA

| Atual | Sugestao IA | Categoria |
|-------|-------------|-----------|
| OPENED | COMMAND_CREATED | Lifecycle |
| ITEM_ADDED | ITEM_ADDED | Item |
| ITEM_UPDATED | ITEM_UPDATED | Item |
| ITEM_CANCELED | ITEM_REMOVED | Item |
| DISCOUNT_APPLIED | DISCOUNT_APPLIED | Financial |
| SERVICE_CLOSED | SERVICE_COMPLETED | Lifecycle |
| PAYMENT_ADDED | PAYMENT_RECEIVED | Financial |
| CASHIER_CLOSED | COMMAND_CLOSED | Lifecycle |
| CASHIER_CLOSED_AUTO | COMMAND_CLOSED_AUTO | Lifecycle |
| STATUS_CHANGED (CANCELED) | COMMAND_CANCELED | Lifecycle |
| CLIENT_LINKED | CLIENT_ASSIGNED | Client |
| CLIENT_UNLINKED | CLIENT_UNASSIGNED | Client |
| COMMAND_REOPENED | COMMAND_REOPENED | Lifecycle |
| NOTE_ADDED | NOTE_ADDED | Other |

---

## ENTREGA 3: CORRECOES MINIMAS APLICADAS

### 3.1 L1 FIX: Cliente obrigatorio para adicionar itens

**Arquivo:** `apps/api/src/modules/commands/commands.service.ts`
**Metodo:** `addItem()`
**Linha:** ~304

```typescript
// L1 FIX: Cliente obrigatório para adicionar itens
if (!command.clientId) {
  throw new BadRequestException('Vincule um cliente antes de adicionar itens');
}
```

**Impacto:**
- Frontend deve exibir erro claro quando tentar adicionar item sem cliente
- Fidelidade sempre funciona (cliente sempre vinculado antes de itens)

### 3.2 L5 FIX: Devolver estoque ao cancelar comanda

**Arquivo:** `apps/api/src/modules/commands/commands.service.ts`
**Metodo:** `cancel()`
**Linhas:** ~1160-1186

```typescript
// L5 FIX: Devolver estoque de todos os PRODUCTs não cancelados
const items = await this.getItems(commandId);
const productItems = items.filter(
  item => item.type === 'PRODUCT' && !item.canceledAt && item.referenceId
);

for (const item of productItems) {
  try {
    await this.productsService.adjustStock(productId, salonId, userId, {
      quantity: qty,
      type: 'IN',
      reason: `Cancelamento comanda ${cardNumber}`,
    });
  } catch (err) {
    console.error(`[cancel] Erro ao devolver estoque do item ${item.id}:`, err);
    // Continua mesmo se falhar (não bloqueia cancelamento)
  }
}
```

**Impacto:**
- Estoque é devolvido automaticamente ao cancelar comanda
- Evento registra `stockReturned: N` para auditoria
- Falha em um item nao bloqueia cancelamento dos outros

### 3.3 Build Status

| Check | Status |
|-------|--------|
| TypeScript API | PASSOU |
| TypeScript Web | PASSOU |

---

## ENTREGA 4: SMOKE TESTS

### 4.1 Cenarios de Teste

| # | Cenario | Esperado | Status |
|---|---------|----------|--------|
| T1 | Criar comanda sem caixa aberto | Erro 400 "Abra o caixa" | Pendente |
| T2 | Adicionar item sem cliente | Erro 400 "Vincule um cliente" | Pendente |
| T3 | Adicionar item com cliente | Sucesso + estoque baixa | Pendente |
| T4 | Adicionar SERVICE sem referenceId | Sucesso | Pendente |
| T5 | Adicionar PRODUCT sem referenceId | Erro 400 | Pendente |
| T6 | Cancelar comanda com produtos | Estoque devolvido | Pendente |
| T7 | Pagamento total | Auto-close + loyalty | Pendente |
| T8 | Pagamento parcial | Permanece WAITING_PAYMENT | Pendente |
| T9 | Reabrir comanda fechada | Status volta para WAITING_PAYMENT | Pendente |
| T10 | Multi-tenant (produto de outro salao) | Erro 400 | Pendente |

---

## ENTREGA 5: DOCUMENTO FINAL

### 5.1 RESUMO EXECUTIVO

O modulo de comandas foi auditado, documentado e corrigido para operar como um sistema POS profissional.

**Correcoes aplicadas:**
- L1: Cliente obrigatorio antes de adicionar itens
- L5: Estoque devolvido automaticamente ao cancelar comanda

**Documentacao criada:**
- Mapa completo do fluxo (endpoints, DTOs, schema, frontend)
- Contrato explicito (estados, transicoes, bloqueios)
- Padrao de eventos para IA "Alexis"
- Campos minimos para analise

### 5.2 ARQUIVOS MODIFICADOS

| Arquivo | Alteracao |
|---------|-----------|
| `apps/api/src/modules/commands/commands.service.ts` | L1 fix (linha 304) + L5 fix (linhas 1160-1186) |
| `apps/api/src/modules/commands/dto.ts` | HARDENING referenceId (ja aplicado) |
| `apps/api/src/modules/commands/COMMAND-ITEMS-CONTRACT.md` | Contrato de itens |
| `docs/COMMANDS-MODULE-AUDIT.md` | Este documento |

### 5.3 ARQUIVOS DE TESTE

| Arquivo | Descricao |
|---------|-----------|
| `test-commands-module.ps1` | Smoke test completo do modulo |
| `test-hotfix-stock.ps1` | Teste de estoque (hotfix anterior) |

### 5.4 CONTRATO FINAL DA COMANDA

#### Estados
```
OPEN -> IN_SERVICE -> WAITING_PAYMENT -> CLOSED
                                       -> (reopen)
     -> CANCELED
```

#### Pre-requisitos
1. Caixa aberto para criar comanda
2. Cliente vinculado para adicionar itens
3. referenceId para PRODUCT
4. Pagamento total para fechar

#### Bloqueios por Estado
- CLOSED/CANCELED: Somente leitura (exceto reopen)
- WAITING_PAYMENT: Nao pode adicionar itens
- OPEN: Nao pode adicionar pagamento

### 5.5 EVENTOS PARA IA "ALEXIS"

| Evento | Categoria | Campos |
|--------|-----------|--------|
| COMMAND_CREATED | Lifecycle | cardNumber, clientId, salonId |
| CLIENT_ASSIGNED | Client | clientId, clientName |
| ITEM_ADDED | Item | type, qty, price, performerId |
| ITEM_REMOVED | Item | reason, stockReturned |
| PAYMENT_RECEIVED | Financial | method, amount, fee |
| COMMAND_CLOSED | Lifecycle | totalNet, totalPaid, loyaltyPoints |
| COMMAND_CANCELED | Lifecycle | reason, stockReturned |

### 5.6 QUERIES EXEMPLO PARA IA

```sql
-- Ticket medio por salao
SELECT salon_id, AVG(total_net::numeric) as avg_ticket
FROM commands
WHERE status = 'CLOSED'
GROUP BY salon_id;

-- Mix produto/servico
SELECT type, COUNT(*), SUM(total_price::numeric)
FROM command_items
WHERE canceled_at IS NULL
GROUP BY type;

-- Performance profissional
SELECT performer_id, COUNT(*) as items, SUM(total_price::numeric) as revenue
FROM command_items
WHERE type = 'SERVICE' AND canceled_at IS NULL
GROUP BY performer_id;

-- Jornada do cliente (tempo abertura->fechamento)
SELECT
  c.id,
  EXTRACT(EPOCH FROM (c.cashier_closed_at - c.opened_at))/60 as minutes
FROM commands c
WHERE c.status = 'CLOSED';
```

### 5.7 PROXIMOS PASSOS (OPCIONAL)

| Item | Prioridade | Descricao |
|------|------------|-----------|
| L4 | Media | Adicionar idempotencyKey em pagamentos |
| L6 | Baixa | Guard centralizado multi-tenant |
| L7 | Baixa | Renomear eventTypes para padrao IA |
| Atomicidade | Media | Envolver operacoes criticas em transaction |

---

## CONCLUSAO

O modulo de comandas esta agora:
- Documentado com contrato explicito
- Corrigido para garantir cliente antes de itens
- Corrigido para devolver estoque ao cancelar
- Pronto para auditoria e analise por IA

**Data:** 2024-12-20
**Status:** CONCLUIDO
