# Hardening Beauty Manager - Comandos de Validação

## Pré-requisitos

```bash
# Conectar na VPS
ssh root@72.61.131.18

# Variáveis de ambiente
export PGPASSWORD='SUA_SENHA_AQUI'
export DB_NAME='beauty_manager'
export DB_USER='beauty_admin'
```

---

## FASE 1: Anti-Overbooking

### 1.1 Aplicar Migração

```bash
# Na VPS, aplicar a migração
psql -U beauty_admin -d beauty_manager -f /var/www/beauty-manager/apps/api/drizzle/0014_anti_overbooking_constraint.sql
```

### 1.2 Verificar Constraint Criada

```bash
psql -U beauty_admin -d beauty_manager -c "
SELECT
    conname AS constraint_name,
    contype AS type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conname = 'appointments_no_overlap';
"
```

**Resultado esperado:**
```
    constraint_name     | type |                    definition
------------------------+------+--------------------------------------------------
 appointments_no_overlap| x    | EXCLUDE USING gist (professional_id WITH =, time_slot WITH &&) WHERE ...
```

### 1.3 Verificar Extensão btree_gist

```bash
psql -U beauty_admin -d beauty_manager -c "SELECT * FROM pg_extension WHERE extname = 'btree_gist';"
```

### 1.4 Executar Teste de Stress

```bash
psql -U beauty_admin -d beauty_manager -f /var/www/beauty-manager/apps/api/drizzle/0014_test_anti_overbooking.sql
```

**Resultado esperado:**
```
NOTICE:  ========================================
NOTICE:  TESTE DE STRESS ANTI-OVERBOOKING
NOTICE:  ========================================
NOTICE:  INSERT 1 : SUCESSO
NOTICE:  INSERT 2 : BLOQUEADO (exclusion_violation) ✓
NOTICE:  INSERT 3 : BLOQUEADO (exclusion_violation) ✓
...
NOTICE:  Sucessos: 1 (esperado: 1)
NOTICE:  Bloqueados: 9 (esperado: 9)
NOTICE:  ✅ TESTE PASSOU! Constraint funcionando corretamente.
```

### 1.5 Verificar Coluna time_slot Populada

```bash
psql -U beauty_admin -d beauty_manager -c "
SELECT id, date, time, duration, time_slot, status
FROM appointments
WHERE time_slot IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
"
```

---

## FASE 2: Nginx

### 2.1 Copiar Configuração

```bash
# Copiar arquivo de config
cp /var/www/beauty-manager/nginx/beauty-manager.conf /etc/nginx/sites-available/beauty-manager

# Criar symlink
ln -sf /etc/nginx/sites-available/beauty-manager /etc/nginx/sites-enabled/beauty-manager

# Remover default (se existir)
rm -f /etc/nginx/sites-enabled/default
```

### 2.2 Testar e Recarregar

```bash
# Testar configuração
nginx -t

# Se OK, recarregar
systemctl reload nginx
```

### 2.3 Validar Headers - index.html (NO CACHE)

```bash
curl -I http://72.61.131.18/index.html
```

**Resultado esperado:**
```
HTTP/1.1 200 OK
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0
Pragma: no-cache
Expires: 0
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
```

### 2.4 Validar Headers - Assets (CACHE LONGO)

```bash
# Primeiro, descobre o nome de um asset
ls /var/www/beauty-manager/apps/web/dist/assets/ | head -1

# Testa (substituir pelo nome real)
curl -I http://72.61.131.18/assets/index-HASH.js
```

**Resultado esperado:**
```
HTTP/1.1 200 OK
Cache-Control: public, max-age=31536000, immutable
```

### 2.5 Validar SPA Fallback

```bash
# Rota que não existe deve retornar index.html (200)
curl -I http://72.61.131.18/rota-que-nao-existe
```

**Resultado esperado:** HTTP 200 (não 404)

### 2.6 Validar API Proxy

```bash
curl -I http://72.61.131.18/api/health
```

---

## FASE 3: Service Worker Cleanup

### 3.1 Injetar no index.html (Temporário)

Adicione antes do `</head>`:

```html
<!-- SW Cleanup - Remover após 7 dias (2026-01-19) -->
<script src="/sw_cleanup.js"></script>
```

### 3.2 Copiar Arquivo

```bash
# Já está em public/, será copiado no build
# Ou copie manualmente:
cp /var/www/beauty-manager/apps/web/public/sw_cleanup.js /var/www/beauty-manager/apps/web/dist/
```

### 3.3 Validar no Browser

1. Abra http://72.61.131.18
2. F12 → Console
3. Procure por mensagens `[SW Cleanup]`

---

## FASE 4: WhatsApp Notifications

### 4.1 Verificar Últimas Notificações

```bash
psql -U beauty_admin -d beauty_manager -c "
SELECT
    id,
    notification_type,
    recipient_phone,
    status,
    attempts,
    sent_at,
    error_message
FROM appointment_notifications
ORDER BY created_at DESC
LIMIT 10;
"
```

### 4.2 Verificar Status Z-API

```bash
curl http://72.61.131.18/api/automation/zapi/status
```

**Resultado esperado:** `{"connected":true}`

### 4.3 Verificar Logs do Processador

```bash
# Últimas linhas do log da API
journalctl -u beauty-manager-api -n 50 --no-pager | grep -i "appointment_notifications\|whatsapp\|mensagem"
```

---

## CHECKLIST FINAL

```
[ ] btree_gist extension instalada
[ ] Constraint appointments_no_overlap criada
[ ] Teste de stress passou (1 sucesso, 9 bloqueados)
[ ] Nginx: index.html com no-store
[ ] Nginx: assets com max-age=31536000
[ ] Nginx: SPA fallback funcionando
[ ] Nginx: API proxy funcionando
[ ] SW Cleanup script disponível
[ ] Z-API conectado
[ ] Notificações sendo processadas
```

---

## Rollback (se necessário)

### Remover Constraint Anti-Overbooking

```sql
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_no_overlap;
DROP TRIGGER IF EXISTS trg_update_time_slot ON appointments;
ALTER TABLE appointments DROP COLUMN IF EXISTS time_slot;
DROP FUNCTION IF EXISTS update_appointment_time_slot();
DROP FUNCTION IF EXISTS check_appointment_conflict(UUID, VARCHAR, VARCHAR, INTEGER, UUID);
```

### Restaurar Nginx Anterior

```bash
# Se tiver backup
cp /etc/nginx/sites-available/beauty-manager.bak /etc/nginx/sites-available/beauty-manager
nginx -t && systemctl reload nginx
```
