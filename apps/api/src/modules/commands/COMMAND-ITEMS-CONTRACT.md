# Contrato API: Itens de Comanda

## Endpoint

```
POST /commands/:commandId/items
```

## Tipos de Item

| Type | Descricao | referenceId |
|------|-----------|-------------|
| `PRODUCT` | Produto do estoque | **OBRIGATORIO** |
| `SERVICE` | Servico prestado | Opcional (ignorado) |

## Payload

```typescript
interface AddItemDto {
  type: 'PRODUCT' | 'SERVICE';      // OBRIGATORIO
  description: string;               // OBRIGATORIO
  quantity?: number;                 // Opcional (default: 1)
  unitPrice: number;                 // OBRIGATORIO
  discount?: number;                 // Opcional (default: 0)
  performerId?: string;              // Opcional (UUID do profissional)
  referenceId?: string;              // OBRIGATORIO se type === 'PRODUCT'
}
```

## Regras de Validacao

### 1. Tipo (type)
- Deve ser `PRODUCT` ou `SERVICE`
- Tipos desconhecidos sao rejeitados com HTTP 400

### 2. referenceId
- **PRODUCT**: OBRIGATORIO - ID do produto (integer como string)
- **SERVICE**: Opcional - ignorado pelo backend

### 3. Validacao Multi-tenant
- Se type === 'PRODUCT':
  - Produto deve existir no banco
  - Produto deve pertencer ao mesmo salonId da comanda
  - Violacao retorna HTTP 400

## Fluxo de Estoque

```
Frontend                          Backend
   |                                 |
   |  POST /commands/:id/items       |
   |  { type: 'PRODUCT',             |
   |    referenceId: '123',          |
   |    quantity: 2, ... }           |
   | ------------------------------> |
   |                                 | 1. Valida DTO
   |                                 | 2. Valida referenceId (PRODUCT)
   |                                 | 3. Verifica produto existe
   |                                 | 4. Verifica multi-tenant
   |                                 | 5. adjustStock(type: 'OUT')
   |                                 | 6. Insere command_item
   |                                 | 7. Recalcula totais
   | <------------------------------ |
   |  201 Created                    |
```

## Codigos de Erro

| HTTP | Mensagem | Causa |
|------|----------|-------|
| 400 | "Tipo deve ser SERVICE ou PRODUCT" | type invalido |
| 400 | "referenceId e obrigatorio para itens do tipo PRODUCT" | PRODUCT sem referenceId |
| 400 | "ID de referencia deve ser um numero inteiro" | referenceId nao numerico |
| 400 | "Produto ID X nao encontrado" | Produto inexistente |
| 400 | "Produto nao pertence a este salao" | Violacao multi-tenant |
| 400 | "Estoque insuficiente" | Quantidade maior que estoque |
| 400 | "Comanda ja encerrada ou cancelada" | Status invalido |

## Exemplos

### Adicionar PRODUCT (correto)
```json
{
  "type": "PRODUCT",
  "description": "Shampoo Profissional",
  "quantity": 2,
  "unitPrice": 45.90,
  "referenceId": "123"
}
```

### Adicionar SERVICE (correto)
```json
{
  "type": "SERVICE",
  "description": "Corte Feminino",
  "quantity": 1,
  "unitPrice": 80.00,
  "performerId": "uuid-do-profissional"
}
```

### Erro: PRODUCT sem referenceId
```json
{
  "type": "PRODUCT",
  "description": "Shampoo",
  "unitPrice": 45.90
}
```
Response: `400 - referenceId e obrigatorio para itens do tipo PRODUCT`

---

**Atualizado em:** 2025-12-20
**Versao:** 1.0.0
