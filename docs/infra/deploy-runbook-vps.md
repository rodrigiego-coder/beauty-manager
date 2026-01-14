# Runbook de Deploy — Beauty Manager VPS

## A. Visao Geral

**Objetivo:** Minimizar janela de 502 durante deploy/restart no VPS.

### Paths Relevantes

| Item | Path |
|------|------|
| Repositorio | `/var/www/beauty-manager` |
| API dist | `/var/www/beauty-manager/apps/api/dist/main.js` |
| Web dist | `/var/www/beauty-manager/apps/web/dist` |
| Unit systemd | `/etc/systemd/system/beauty-manager-api.service` |
| Override | `/etc/systemd/system/beauty-manager-api.service.d/override.conf` |
| Nginx site | `/etc/nginx/sites-available/beauty-manager` |
| Nginx backup | `/root/nginx-backup/` |

### Arquitetura

- **Frontend:** Vite build servido pelo Nginx (static files)
- **Backend:** NestJS via systemd (`beauty-manager-api.service`)
- **Proxy:** Nginx faz strip de `/api/` → backend recebe sem prefixo

---

## B. Checklist Pre-Deploy

```bash
# 1. Git limpo
git status -sb

# 2. Servico saudavel
systemctl is-active beauty-manager-api

# 3. Nginx OK
sudo nginx -t

# 4. Healthcheck OK
curl -s -o /dev/null -w "%{http_code}" https://app.agendasalaopro.com.br/api/healthz

# 5. Recursos (opcional)
free -h && df -h /
```

**Esperado:** git limpo, active, syntax ok, 200, disco/memoria OK.

---

## C. Procedimento de Deploy

### Opcao 1: Deploy Rapido (Recomendada)

Quando o artefato (dist) ja existe ou foi buildado externamente:

```bash
cd /var/www/beauty-manager

# 1. Backup rapido do estado atual
git stash || true

# 2. Atualizar codigo
git fetch origin main
git reset --hard origin/main

# 3. Restart controlado
sudo systemctl restart beauty-manager-api

# 4. Aguardar boot (5s)
sleep 5

# 5. Validar
curl -s -o /dev/null -w "healthz=%{http_code}\n" https://app.agendasalaopro.com.br/api/healthz
```

### Opcao 2: Build no VPS (Modo Memoria)

Quando precisar rebuildar no VPS (cuidado com OOM):

```bash
cd /var/www/beauty-manager

# 1. Parar servico para liberar RAM
sudo systemctl stop beauty-manager-api

# 2. Build com heap limitado
NODE_OPTIONS="--max-old-space-size=3072" npm run build:api

# 3. Reiniciar
sudo systemctl start beauty-manager-api

# 4. Aguardar boot
sleep 5

# 5. Validar
curl -s -o /dev/null -w "healthz=%{http_code}\n" https://app.agendasalaopro.com.br/api/healthz
```

**Nota:** Durante o build (~1-3min) o servico fica offline. Preferir janela de baixo trafego.

### Opcao 3: Deploy via Artefato (CI) - Recomendada

Build executado no GitHub Actions, artefatos enviados ao VPS. Zero risco de OOM.

**Workflow:** `.github/workflows/deploy_prod_artifacts.yml`
**Script VPS:** `scripts/deploy-prod-artifacts.sh`

```bash
# Executar manualmente no GitHub:
# Actions > Deploy Production (Artifacts) > Run workflow

# O workflow:
# 1. Builda shared, api e web no GitHub
# 2. Empacota dist/ em tarballs
# 3. Envia via SCP para o VPS
# 4. Executa script de deploy com rollback automatico
# 5. Roda smoke tests (healthz + auth)
```

**Secrets necessarios no GitHub:**

| Secret | Descricao |
|--------|-----------|
| `VPS_HOST` | IP ou hostname do VPS (ex: 72.61.131.18) |
| `VPS_USER` | Usuario SSH (ex: root) |
| `VPS_SSH_KEY` | Chave privada SSH (formato PEM) |
| `VPS_PORT` | Porta SSH (opcional, default 22) |

**Vantagens:**
- Build fora do VPS (sem OOM)
- Rollback automatico se falhar
- Backups timestamped em `/var/www/beauty-manager-backups/`
- Smoke tests integrados

---

## D. Pos-Deploy: Validacao

Copiar e colar no terminal:

```bash
# Status do servico (primeiras linhas)
sudo systemctl status beauty-manager-api --no-pager | head -15

# Healthcheck (esperado: 200)
curl -s -o /dev/null -w "healthz=%{http_code}\n" https://app.agendasalaopro.com.br/api/healthz

# Proxy funcionando (esperado: 400, NAO 502)
curl -s -o /dev/null -w "auth=%{http_code}\n" -X POST https://app.agendasalaopro.com.br/api/auth/login -H "Content-Type: application/json" -d '{}'

# Logs de boot
sudo journalctl -u beauty-manager-api -n 20 --no-pager | tail -10
```

**Criterios de sucesso:**
- Status: `active (running)`
- healthz: `200`
- auth: `400` (nao 502)
- Logs: `Nest application successfully started`

---

## E. Rollback Rapido

### Cenario 1: Rollback de Nginx

```bash
# Restaurar backup
sudo cp /root/nginx-backup/beauty-manager.<TIMESTAMP> /etc/nginx/sites-available/beauty-manager

# Validar e aplicar
sudo nginx -t && sudo systemctl reload nginx
```

### Cenario 2: Rollback de Codigo

```bash
cd /var/www/beauty-manager

# Ver commits recentes
git log --oneline -5

# Voltar para commit anterior (substitua HASH)
git reset --hard <HASH_ANTERIOR>

# Restart
sudo systemctl restart beauty-manager-api

# Validar
curl -s -o /dev/null -w "healthz=%{http_code}\n" https://app.agendasalaopro.com.br/api/healthz
```

**Alternativa com revert (mantém histórico):**

```bash
git revert HEAD --no-edit
sudo systemctl restart beauty-manager-api
```

---

## F. Anti-502: Dicas Operacionais

1. **Evitar restart repetido** — cada restart = **~15s offline** (medido em 2026-01-14)
2. **Preferir reload para nginx** — `reload` nao derruba conexoes, `restart` sim
3. **Janela de manutencao** — DDL pesado ou migracao em horario de baixo trafego
4. **Sempre testar healthz** — antes e depois de qualquer mudanca
5. **Backup antes de editar nginx** — `cp ... /root/nginx-backup/`

### Medicao Real (2026-01-14 17:45 UTC)

| Fase | Tempo |
|------|-------|
| Comando restart | 0s |
| systemd stop/start | ~0.4s |
| Node.js inicializa | ~14s |
| Nest pronto (healthz=200) | **~15s total** |

> **Nota:** Durante esses ~15s, requests para `/api/*` recebem 502 do nginx.

---

## Referencia Rapida

| Acao | Comando |
|------|---------|
| Status API | `systemctl status beauty-manager-api --no-pager` |
| Restart API | `sudo systemctl restart beauty-manager-api` |
| Logs API | `journalctl -u beauty-manager-api -f` |
| Nginx test | `sudo nginx -t` |
| Nginx reload | `sudo systemctl reload nginx` |
| Healthcheck | `curl -s https://app.agendasalaopro.com.br/api/healthz` |

---

*Atualizado em: 2026-01-14 17:45 UTC (medicoes reais de restart)*
