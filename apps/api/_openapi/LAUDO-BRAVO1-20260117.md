# LAUDO TÉCNICO BRAVO.1 - Empty Schema Analysis

**Data:** 2026-01-17
**Fonte:** `apps/api/_openapi/docs-json-20260117-105422.json`
**Script:** `apps/api/scripts/openapi-empty-schema-report.js`

---

## 1. RESUMO EXECUTIVO

| Métrica | Valor |
|---------|-------|
| Total de schemas | 115 |
| Schemas OK (com properties) | 39 (33.9%) |
| Schemas VAZIOS | **76 (66.1%)** |
| Total de operações (endpoints) | 492 |
| Operações afetadas por schemas vazios | **86 (17.5%)** |
| Schemas vazios referenciados em paths | 76 |

---

## 2. EVIDÊNCIA: EXISTEM REFS EM PATHS?

**SIM.** O documento OpenAPI contém **124 referências** a `#/components/schemas/*` distribuídas nas operações (paths).

- **114 schemas únicos** são referenciados em paths
- **76 desses schemas são vazios** (sem `properties` documentadas)

### Exemplos de refs encontradas:
```
#/components/schemas/CancelSubscriptionDto
#/components/schemas/UpdateProfileDto
#/components/schemas/ChangePasswordDto
#/components/schemas/CreatePlanDto
#/components/schemas/CreateUserDto
```

---

## 3. TOP 15 SCHEMAS VAZIOS MAIS REFERENCIADOS

| # | Schema | Refs | Arquivo DTO |
|---|--------|------|-------------|
| 1 | `CancelSubscriptionDto` | 4 | `modules/subscriptions/dto.ts:27` |
| 2 | `UpdateProfileDto` | 2 | `modules/users/dto.ts:130` |
| 3 | `ChangePasswordDto` | 2 | `modules/users/dto.ts:146` |
| 4 | `CreatePlanDto` | 2 | `modules/plans/dto.ts:3` |
| 5 | `UpdatePlanDto` | 2 | `modules/plans/dto.ts:68` |
| 6 | `CashMovementDto` | 2 | `modules/cash-registers/dto.ts:19` |
| 7 | `PauseSubscriptionDto` | 2 | `modules/product-subscriptions/dto.ts:133` |
| 8 | `ConvertCartLinkDto` | 2 | `modules/cart-links/dto.ts:69` |
| 9 | `CreateUserDto` | 1 | `modules/users/dto.ts:24` |
| 10 | `UpdateUserDto` | 1 | `modules/users/dto.ts:66` |
| 11 | `UpdateWorkScheduleDto` | 1 | `modules/users/dto.ts:99` |
| 12 | `ProcessMessageDto` | 1 | `modules/alexis/alexis.controller.ts:28` (inline) |
| 13 | `DashboardChatDto` | 1 | `modules/alexis/alexis.controller.ts:93` (inline) |
| 14 | `UpdateSettingsDto` | 1 | `modules/alexis/alexis.controller.ts:51` (inline) |
| 15 | `CreateHoldDto` | 1 | `modules/online-booking/dto.ts:223` |

---

## 4. TOP 10 TAGS/DOMÍNIOS MAIS IMPACTADOS

**NOTA:** Os endpoints afetados não possuem tags Swagger decoradas (`@ApiTags`). Isso resulta em "0 tags impactadas" no relatório automático.

**Inferência por path (manual):**

| # | Domínio (por path) | Operações Afetadas |
|---|-------------------|-------------------|
| 1 | `/users/*` | 5 |
| 2 | `/subscriptions/*` | 3 |
| 3 | `/public/booking/*` | 5 |
| 4 | `/alexis/*` | 3 |
| 5 | `/plans/*` | 2 |
| 6 | `/profile/*` | 2 |
| 7 | `/online-booking/*` | 2+ |
| 8 | `/cash-registers/*` | 2 |
| 9 | `/cart-links/*` | 2 |
| 10 | `/product-subscriptions/*` | 2+ |

---

## 5. OPERAÇÕES AFETADAS (PRIMEIROS 20 ENDPOINTS)

| # | Method | Path | OperationId | Schemas Vazios |
|---|--------|------|-------------|----------------|
| 1 | PATCH | `/users/me` | `UsersController_updateProfile` | UpdateProfileDto |
| 2 | POST | `/users/me/change-password` | `UsersController_changePassword` | ChangePasswordDto |
| 3 | POST | `/users` | `UsersController_create` | CreateUserDto |
| 4 | PATCH | `/users/{id}` | `UsersController_update` | UpdateUserDto |
| 5 | PATCH | `/users/{id}/schedule` | `UsersController_updateSchedule` | UpdateWorkScheduleDto |
| 6 | PATCH | `/profile` | `ProfileController_updateProfile` | UpdateProfileDto |
| 7 | POST | `/profile/change-password` | `ProfileController_changePassword` | ChangePasswordDto |
| 8 | POST | `/subscriptions/cancel` | `SubscriptionsController_cancelSubscription` | CancelSubscriptionDto |
| 9 | POST | `/subscriptions/reactivate` | `SubscriptionsController_reactivateSubscription` | CancelSubscriptionDto |
| 10 | POST | `/plans` | `PlansController_create` | CreatePlanDto |
| 11 | PATCH | `/plans/{id}` | `PlansController_update` | UpdatePlanDto |
| 12 | POST | `/alexis/whatsapp/message` | `AlexisController_processMessage` | ProcessMessageDto |
| 13 | POST | `/alexis/dashboard/chat` | `AlexisController_dashboardChat` | DashboardChatDto |
| 14 | PATCH | `/alexis/settings` | `AlexisController_updateSettings` | UpdateSettingsDto |
| 15 | POST | `/public/booking/{salonSlug}/hold` | `PublicBookingController_createHold` | CreateHoldDto |
| 16 | POST | `/public/booking/{salonSlug}/otp/send` | `PublicBookingController_sendOtp` | SendOtpDto |
| 17 | POST | `/public/booking/{salonSlug}/otp/verify` | `PublicBookingController_verifyOtp` | VerifyOtpDto |
| 18 | POST | `/public/booking/{salonSlug}/confirm` | `PublicBookingController_confirmBooking` | CreateOnlineBookingDto |
| 19 | POST | `/public/booking/{salonSlug}/cancel` | `PublicBookingController_cancelBooking` | CancelOnlineBookingDto |
| 20 | PUT | `/online-booking/settings` | `AdminBookingController_updateSettings` | UpdateOnlineBookingSettingsDto |

---

## 6. DIAGNÓSTICO

### Causa raiz:
Os DTOs possuem decorators de validação (`class-validator`) mas **não possuem decorators Swagger** (`@ApiProperty`, `@ApiPropertyOptional`). O NestJS Swagger gera schemas vazios quando não encontra metadados.

### Casos especiais identificados:
1. **DTOs inline em controllers** (ex: `alexis.controller.ts`) - Classes definidas no próprio controller sem decorators.
2. **DTOs que estendem outros** (ex: `UpdateOnlineBookingSettingsDto extends CreateOnlineBookingSettingsDto`) - herança sem @ApiProperty próprio.
3. **CancelSubscriptionDto duplicado** - Existe em `subscriptions/dto.ts` E em `product-subscriptions/dto.ts` - o já documentado em ALFA pode não estar sendo usado em todas as rotas.

---

## 7. PROPOSTA LOTE #1 (BRAVO.2)

### Critérios de priorização:
1. Número de referências (mais usados primeiro)
2. Criticidade do endpoint (auth, subscription, booking público)
3. Existência de validações completas no DTO

### Lote #1 - 18 DTOs priorizados:

| # | DTO | Arquivo | Endpoints Impactados | Prioridade |
|---|-----|---------|---------------------|------------|
| 1 | `UpdateProfileDto` | `modules/users/dto.ts:130` | PATCH /users/me, PATCH /profile | ALTA |
| 2 | `ChangePasswordDto` | `modules/users/dto.ts:146` | POST /users/me/change-password, POST /profile/change-password | ALTA |
| 3 | `CreateUserDto` | `modules/users/dto.ts:24` | POST /users | ALTA |
| 4 | `UpdateUserDto` | `modules/users/dto.ts:66` | PATCH /users/{id} | ALTA |
| 5 | `UpdateWorkScheduleDto` | `modules/users/dto.ts:99` | PATCH /users/{id}/schedule | ALTA |
| 6 | `CreatePlanDto` | `modules/plans/dto.ts:3` | POST /plans | ALTA |
| 7 | `UpdatePlanDto` | `modules/plans/dto.ts:68` | PATCH /plans/{id} | ALTA |
| 8 | `CashMovementDto` | `modules/cash-registers/dto.ts:19` | POST /cash-registers/*/deposit, /withdraw | ALTA |
| 9 | `OpenCashRegisterDto` | `modules/cash-registers/dto.ts:3` | POST /cash-registers/open | MÉDIA |
| 10 | `CloseCashRegisterDto` | `modules/cash-registers/dto.ts:9` | POST /cash-registers/close | MÉDIA |
| 11 | `CreateHoldDto` | `modules/online-booking/dto.ts:223` | POST /public/booking/{slug}/hold | ALTA |
| 12 | `SendOtpDto` | `modules/online-booking/dto.ts:279` | POST /public/booking/{slug}/otp/send | ALTA |
| 13 | `VerifyOtpDto` | `modules/online-booking/dto.ts:295` | POST /public/booking/{slug}/otp/verify | ALTA |
| 14 | `CreateOnlineBookingSettingsDto` | `modules/online-booking/dto.ts:66` | POST /online-booking/settings | MÉDIA |
| 15 | `ConvertCartLinkDto` | `modules/cart-links/dto.ts:69` | POST /cart-links/{id}/convert | MÉDIA |
| 16 | `CreateCartLinkDto` | `modules/cart-links/dto.ts:5` | POST /cart-links | MÉDIA |
| 17 | `CartLinkItemDto` | `modules/cart-links/dto.ts:33` | (nested em CreateCartLinkDto) | MÉDIA |
| 18 | `ProcessMessageDto` | `modules/alexis/alexis.controller.ts:28` | POST /alexis/whatsapp/message | BAIXA* |

*DTOs inline no controller requerem refatoração para mover para arquivo dto.ts separado.

---

## 8. RECOMENDAÇÕES

1. **BRAVO.2**: Documentar Lote #1 (18 DTOs) com @ApiProperty - estimativa: ~1h
2. **BRAVO.3**: Mover DTOs inline do alexis.controller.ts para alexis/dto.ts
3. **BRAVO.4**: Adicionar @ApiTags em controllers para melhorar agrupamento no Swagger
4. **CHARLIE**: Rodar script periodicamente para monitorar progresso

---

## 9. ARQUIVOS GERADOS

- Script: `apps/api/scripts/openapi-empty-schema-report.js`
- CSV: `apps/api/_openapi/empty-schema-usage-2026-01-17T1405.csv`
- Laudo: `apps/api/_openapi/LAUDO-BRAVO1-20260117.md`

---

**Fim do Laudo BRAVO.1**
