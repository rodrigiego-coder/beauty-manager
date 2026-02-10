# MÓDULOS ESTÁVEIS - AgendaSalonPro

> **ATENÇÃO:** Este arquivo lista módulos críticos que estão funcionando em produção.
> Qualquer alteração requer aprovação explícita e deve ser feita com extremo cuidado.

---

## PROTOCOLO DE ALTERAÇÃO (GUARDRAILS)

Antes de modificar qualquer módulo listado abaixo, APLICAR automaticamente:

1. **Tag restore:** `git tag restore/<modulo>-<desc>-YYYYMMDD-HHMM`
2. **Patch mínimo e isolado** - só tocar no necessário
3. **Build obrigatório** - TSC + Vite sem erros
4. **Smoke test** descrito no commit/output
5. **Rollback documentado** no commit: `Restore: git reset --hard <tag>`
6. **Push** com evidências (diff + build log)

---

## MÓDULOS PROTEGIDOS

### 1. AGENDA (Appointments)
**Status:** ✅ ESTÁVEL desde 2026-02-06

**Arquivos críticos:**
- `apps/api/src/modules/appointments/appointments.service.ts`
- `apps/web/src/pages/AppointmentsPage.tsx`

**Funcionalidades que NÃO devem ser alteradas:**
- [x] Camila Sanches (OWNER com isProfessional=true) aparece na agenda
- [x] CANCELLED e NO_SHOW não bloqueiam horários
- [x] Horário 12h-13h disponível (sem almoço fixo padrão)
- [x] Lead time configurável
- [x] Snap-scroll mobile entre profissionais
- [x] View mode: Dia/Semana/Mês

**BLINDAGEM: Sistema de Salvar Agendamento (NÃO MEXER)**
> O fluxo de salvar agendamento foi corrigido e blindado em 2026-02-10.
> Os itens abaixo são INTOCÁVEIS. Alterar qualquer um faz o botão Salvar
> parar de funcionar em navegadores mobile.
>
> - `formErrors` state + `setFormErrors` (validação visível)
> - Bloco de validação JS no `handleSubmit` (marcado PROTEGIDO no código)
> - `noValidate` no `<form>` (desabilita validação invisível do browser)
> - `id="field-*"` nos wrappers dos campos obrigatórios (usado pelo scroll)
> - Bordas vermelhas + `<p>` de erro nos campos (serviceId, professionalId, date, time)
> - `type="submit"` no botão Salvar (NÃO mudar para type="button")
> - Botão Salvar DENTRO do `<form>` (NÃO mover para fora)

---

### 2. COMANDA (Commands)
**Status:** ✅ ESTÁVEL desde 2026-02-06

**Arquivos críticos:**
- `apps/web/src/pages/CommandPage.tsx`
- `apps/web/src/pages/CommandsListPage.tsx`
- `apps/api/src/modules/commands/commands.service.ts`
- `apps/api/src/modules/commands/commands.controller.ts`

**Funcionalidades que NÃO devem ser alteradas:**
- [x] Separação: Ativas vs Aguardando Pagamento
- [x] Fluxo: OPEN → IN_SERVICE → WAITING_PAYMENT → CLOSED
- [x] Contas a Receber (pending balance)
- [x] Reabrir comanda
- [x] Pacotes de sessões (session packages)
- [x] Lembrete Alexia na comanda

---

### 3. ALEXIA (IA WhatsApp)
**Status:** ✅ ESTÁVEL desde 2026-02-06

**Arquivos críticos:**
- `apps/api/src/modules/alexis/alexis.service.ts`
- `apps/api/src/modules/alexis/alexis.controller.ts`
- `apps/api/src/modules/automation/zapi-webhook.controller.ts`
- `apps/web/src/pages/AlexisConversationsPage.tsx`
- `apps/web/src/pages/AlexisSettingsPage.tsx`

**Funcionalidades que NÃO devem ser alteradas:**
- [x] Toggle global ligar/desligar (isEnabled)
- [x] Comando #eu (humano assume) via WhatsApp
- [x] Comando #ia (IA retoma) via WhatsApp
- [x] Status HUMAN_ACTIVE bloqueia respostas automáticas
- [x] Webhook aceita fromMe=true para #eu/#ia
- [x] UI com toggle na página /alexis

---

## HISTÓRICO DE ESTABILIZAÇÃO

| Data       | Módulo  | Versão | Responsável |
|------------|---------|--------|-------------|
| 2026-02-06 | Agenda  | 1.0    | Claude      |
| 2026-02-10 | Agenda  | 1.1    | Claude      | Blindagem botão Salvar
| 2026-02-06 | Comanda | 1.0    | Claude      |
| 2026-02-06 | Alexia  | 1.0    | Claude      |

---

## COMO ADICIONAR NOVO MÓDULO ESTÁVEL

1. Testar exaustivamente em produção
2. Adicionar entrada neste arquivo com:
   - Lista de arquivos críticos
   - Lista de funcionalidades protegidas
   - Data de estabilização
3. Adicionar header `@stable` nos arquivos
4. Atualizar MEMORY.md do Claude

---

*Última atualização: 2026-02-10*
