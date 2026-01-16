# Planos e Precificação

> **Fonte da verdade** para a estrutura de planos do SaaS Beauty Manager e posicionamento de add-ons.

## Visão Geral

O Beauty Manager opera com modelo de **assinatura base + add-ons opcionais**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESTRUTURA DE MONETIZAÇÃO                     │
├─────────────────────────────────────────────────────────────────┤
│  PLANO BASE (obrigatório)                                       │
│  ├── Essencial   → Funcionalidades básicas                      │
│  ├── Profissional → + Relatórios + Fidelidade                   │
│  └── Master      → + IA + Automações avançadas                  │
├─────────────────────────────────────────────────────────────────┤
│  ADD-ONS (opcionais)                                            │
│  ├── WhatsApp BASIC/PRO → Notificações automáticas              │
│  └── (futuros: Fiscal, Marketplace, etc.)                       │
├─────────────────────────────────────────────────────────────────┤
│  CRÉDITOS AVULSOS                                               │
│  └── Pacotes de agendamentos WhatsApp (+20 por R$10)            │
└─────────────────────────────────────────────────────────────────┘
```

## Planos Base

### Comparativo

| Recurso | Essencial | Profissional | Master |
|---------|-----------|--------------|--------|
| **Agendamentos** | Ilimitados | Ilimitados | Ilimitados |
| **Clientes** | Até 200 | Até 1.000 | Ilimitados |
| **Usuários** | 2 | 5 | 10 |
| **Comandas** | Sim | Sim | Sim |
| **Estoque básico** | Sim | Sim | Sim |
| **Estoque avançado** | - | Sim | Sim |
| **Relatórios básicos** | Sim | Sim | Sim |
| **Relatórios avançados** | - | Sim | Sim |
| **Programa de Fidelidade** | - | Sim | Sim |
| **Receitas (BOM)** | - | Sim | Sim |
| **Automações** | - | Básicas | Avançadas |
| **Alexis (IA)** | - | - | Sim |
| **Suporte** | E-mail | E-mail + Chat | Prioritário |

### Posicionamento

- **Essencial:** Salões pequenos, começando a digitalizar
- **Profissional:** Salões médios, buscando profissionalização
- **Master:** Salões grandes, multi-profissionais, buscando automação total

## Add-on WhatsApp

O WhatsApp é um **add-on separado** do plano base, permitindo que salões escolham se querem ou não notificações automáticas.

### Tiers Disponíveis

#### WhatsApp BASIC
Templates simples: confirmação, lembrete, pós-atendimento.

| Agendamentos/mês | Preço |
|------------------|-------|
| 120 | R$ 29,90 |
| 160 | R$ 39,90 |
| 200 | R$ 49,90 |
| 240 | R$ 59,90 |

#### WhatsApp PRO
Templates avançados: reagendamento, aniversário, reativação, promoções.

| Agendamentos/mês | Preço |
|------------------|-------|
| 120 | R$ 49,90 |
| 160 | R$ 69,90 |
| 200 | R$ 89,90 |
| 240 | R$ 99,90 |

### Escolha do Tier

```
Média de agendamentos/mês do salão:
├── Até 100    → 120 (margem de 20%)
├── 100-140    → 160
├── 140-180    → 200
└── 180+       → 240 ou considerar tier superior
```

**Recomendação:** Orientar cliente a escolher tier com ~20% de margem sobre a média histórica.

## Créditos Extras

Quando a quota mensal se esgota, o salão pode comprar créditos avulsos:

| Pacote | Quantidade | Preço | Custo unitário |
|--------|------------|-------|----------------|
| WHATSAPP_EXTRA_20 | +20 agendamentos | R$ 10,00 | R$ 0,50/agend |

**Observação:** O custo unitário do crédito extra (R$ 0,50) é maior que o do plano (ex: R$ 29,90/120 = R$ 0,25/agend) para incentivar upgrade de tier.

## Regras de Excedente

### Fluxo de Decisão

```
┌─────────────────────────────────────────┐
│ Uso do mês atingiu X% do incluído       │
└───────────────┬─────────────────────────┘
                │
        ┌───────▼───────┐
        │   X < 80%     │───────────────────────► Nenhuma ação
        └───────────────┘
                │
        ┌───────▼───────┐
        │  80% ≤ X < 90%│───────────────────────► Alerta amarelo
        └───────────────┘                         "Considere upgrade"
                │
        ┌───────▼───────┐
        │  90% ≤ X <100%│───────────────────────► Alerta laranja
        └───────────────┘                         "Upgrade ou crédito"
                │
        ┌───────▼───────┐
        │   X = 100%    │───────────────────────► Alerta vermelho
        └───────────────┘                         "Compre créditos agora"
```

### Lógica de Sugestão

**Cenário 1: Uso alto consistente**
- Se uso ≥ 80% por 2+ meses consecutivos
- → Sugerir upgrade de tier (ex: 120 → 160)
- Argumento: "Você economiza R$ X/mês comparado a comprar créditos"

**Cenário 2: Pico pontual**
- Se uso alto em apenas 1 mês (ex: dezembro)
- → Sugerir compra de crédito pontual
- Argumento: "Compre apenas o que precisa para este mês"

**Cenário 3: Quota esgotada**
- → Oferecer compra imediata de crédito
- → Mostrar opção de upgrade com destaque
- → Permitir compra via PIX com liberação instantânea

### Mensagens de Alerta

| Situação | Mensagem |
|----------|----------|
| 80% usado | "Você já usou 80% da sua quota de WhatsApp este mês. Se continuar assim, pode precisar de mais. Considere fazer upgrade para o próximo tier." |
| 90% usado | "Atenção: apenas 10% da quota restante! Faça upgrade ou compre créditos para não interromper suas notificações." |
| 100% usado | "Sua quota de WhatsApp acabou! Compre créditos agora para continuar enviando confirmações e lembretes." |

## Combinações Típicas

### Salão Pequeno (1-2 profissionais)
```
Plano Essencial + WhatsApp BASIC 120
Total: Plano base + R$ 29,90 = ~R$ XX/mês
```

### Salão Médio (3-5 profissionais)
```
Plano Profissional + WhatsApp BASIC 160
Total: Plano base + R$ 39,90 = ~R$ XX/mês
```

### Salão Grande (5+ profissionais)
```
Plano Master + WhatsApp PRO 240
Total: Plano base + R$ 99,90 = ~R$ XX/mês
```

## Upgrade Path

### De Tier (mesmo nível)
```
WHATSAPP_BASIC_120 → WHATSAPP_BASIC_160
- Diferença pro-rata no mês
- Quota adicional disponível imediatamente
```

### De Nível (BASIC → PRO)
```
WHATSAPP_BASIC_160 → WHATSAPP_PRO_160
- Diferença de preço cobrada
- Templates PRO liberados imediatamente
- Quota mantida (mesmo volume)
```

### Downgrade
```
- Só permitido no fim do período
- Quota não utilizada NÃO é reembolsada
- Créditos extras comprados continuam válidos
```

## Métricas de Acompanhamento

### Para o Salão (Dashboard)
- Quota usada / total (barra de progresso)
- Projeção de uso até fim do mês
- Histórico de consumo (últimos 6 meses)

### Para o SaaS (Analytics)
- % de salões usando >80% da quota
- Taxa de conversão de alerta → upgrade
- Taxa de conversão de alerta → compra crédito
- Receita de créditos extras / receita total add-on

## Implementação Futura

### Mercado Pago (P1)
- Cobrança automática de add-on junto com plano
- Compra de crédito via PIX instantâneo
- Webhook de confirmação → liberar crédito

### Renovação Automática (P2)
- Add-on renova junto com período do plano
- Quota reseta no início de cada período
- Créditos extras NÃO expiram (acumulam)

## Arquivos Relacionados

- **Documentação técnica:** `docs/whatsapp-addon-e-creditos.md`
- **Schema:** `apps/api/src/database/schema.ts`
- **Seed de catálogo:** `apps/api/src/seed.ts`
